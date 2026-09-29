import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getRole, isSuperAdminUser } from "@/lib/admin";
import { resolveDateBounds } from "@/lib/admin-activity";

const CHUNK = 500;
// Hard ceiling so an export can never turn into an unbounded loop against
// Clerk/Supabase, however large the user base eventually gets.
const MAX_ROWS = 20000;

const SUBSCRIPTION_COLUMNS =
  "clerk_user_id, plan, status, billing_interval, current_period_end, razorpay_customer_id, razorpay_subscription_id, created_at";

const ROLE_OPTIONS = new Set(["admin", "super_admin", "user"]);

function csvCell(value) {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

// Same fallback as displayName() in dashboard/admin/page.js - a blank Name
// cell for every account with no first/last name on file (common for
// invited accounts that completed sign-up through Clerk's hosted widget
// without ever being asked for one) is exactly the "a lot of users who
// don't have a name" gap the table itself already doesn't have.
function resolveExportName(clerkUser, email) {
  if (clerkUser.fullName) return clerkUser.fullName;
  if (clerkUser.firstName) return clerkUser.firstName;
  if (email) {
    const local = email.split("@")[0];
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return "Unnamed user";
}

function toRow(clerkUser, sub, viewerIsSuperAdmin) {
  const role = getRole(clerkUser);
  const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
  const name = resolveExportName(clerkUser, email);
  const joinedAt = clerkUser.createdAt || sub?.created_at || "";

  const base = [name, email, joinedAt ? new Date(joinedAt).toISOString() : "", sub?.plan || "free", role || "none"];

  if (!viewerIsSuperAdmin) return base;

  return [
    ...base,
    sub?.status || "inactive",
    sub?.billing_interval || "",
    sub?.current_period_end ? new Date(sub.current_period_end).toISOString() : "",
    sub?.razorpay_customer_id || "",
    sub?.razorpay_subscription_id || "",
    clerkUser.id,
  ];
}

async function subscriptionsForIds(ids) {
  if (!ids.length) return {};
  const { data } = await supabase.from("subscriptions").select(SUBSCRIPTION_COLUMNS).in("clerk_user_id", ids);
  return Object.fromEntries((data || []).map((s) => [s.clerk_user_id, s]));
}

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clerk = await clerkClient();
  const viewer = await clerk.users.getUser(userId);
  if (getRole(viewer) === null) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const viewerIsSuperAdmin = isSuperAdminUser(viewer);

  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();
    const planFilter = searchParams.get("plan") || "all";
    const rawRole = searchParams.get("role") || "all";
    const roleFilter = ROLE_OPTIONS.has(rawRole) ? rawRole : "all";
    const joinedRange = searchParams.get("joined") || "all";
    const joinedFrom = searchParams.get("joinedFrom");
    const joinedTo = searchParams.get("joinedTo");
    const { startISO, endISO } = resolveDateBounds({
      range: joinedRange,
      from: joinedFrom,
      to: joinedTo,
    });

    const rows = [];
    // A date range has to be resolved against Clerk's own createdAt, not
    // subscriptions.created_at (when that row happened to be written -
    // usually right at signup via the Clerk user.created webhook, but not
    // always: backfilled/migrated/delayed-webhook rows can drift from the
    // real signup date). The exported "Joined At" column already shows
    // clerkUser.createdAt preferentially - filtering by a different
    // timestamp than what's displayed meant a picked range could silently
    // include/exclude the wrong rows. Routed through the same
    // Clerk-accurate branch search already used below, whether or not
    // there's also search text.
    const hasDateFilter = Boolean(startISO || endISO);
    const startMs = startISO ? new Date(startISO).getTime() : null;
    // endISO is exclusive (resolveDateBounds already rolled it one day past
    // the picked "to" date) - matches the exclusive-upper-bound semantics
    // createdAtBefore itself uses below.
    const endMs = endISO ? new Date(endISO).getTime() : null;

    // Belt-and-suspenders: don't just trust that Clerk's own
    // createdAtAfter/createdAtBefore actually bounded what came back -
    // re-check every row's real createdAt here too, so a picked range is
    // guaranteed correct even if that filtering silently no-ops for any
    // reason. Also what makes MAX_ROWS/CHUNK pagination safe when combined
    // with a date filter: only rows that truly match ever count against it.
    function withinDateRange(clerkUser) {
      if (!hasDateFilter) return true;
      const createdAtMs = clerkUser.createdAt ? new Date(clerkUser.createdAt).getTime() : null;
      if (createdAtMs === null || Number.isNaN(createdAtMs)) return false;
      if (startMs !== null && createdAtMs < startMs) return false;
      if (endMs !== null && createdAtMs >= endMs) return false;
      return true;
    }

    if (search || hasDateFilter) {
      let offset = 0;
      // Terminates when Clerk returns fewer than CHUNK rows (last page) or
      // the MAX_ROWS safety ceiling is hit - never an unconditional loop.
      for (;;) {
        const clerkParams = { limit: CHUNK, offset, orderBy: "-created_at" };
        if (search) clerkParams.query = search;
        if (startISO) clerkParams.createdAtAfter = startMs;
        if (endISO) clerkParams.createdAtBefore = endMs;

        const { data: clerkUsers } = await clerk.users.getUserList(clerkParams);
        if (!clerkUsers.length) break;

        const subMap = await subscriptionsForIds(clerkUsers.map((u) => u.id));

        for (const clerkUser of clerkUsers) {
          if (!withinDateRange(clerkUser)) continue;
          const sub = subMap[clerkUser.id];
          if (planFilter !== "all" && (sub?.plan || "free") !== planFilter) continue;
          if (roleFilter !== "all" && (getRole(clerkUser) || "user") !== roleFilter) continue;
          rows.push(toRow(clerkUser, sub, viewerIsSuperAdmin));
          if (rows.length >= MAX_ROWS) break;
        }

        if (rows.length >= MAX_ROWS || clerkUsers.length < CHUNK) break;
        offset += CHUNK;
      }
    } else {
      let offset = 0;
      for (;;) {
        let query = supabase
          .from("subscriptions")
          .select(SUBSCRIPTION_COLUMNS)
          .order("created_at", { ascending: false })
          .range(offset, offset + CHUNK - 1);

        // No startISO/endISO handling here - hasDateFilter routes into the
        // Clerk-accurate branch above whenever a date range is active, so
        // this branch only ever runs unfiltered-by-date.
        if (planFilter !== "all") query = query.eq("plan", planFilter);

        const { data: subscriptions, error } = await query;
        if (error) {
          console.error("ADMIN_USERS_EXPORT_SUPABASE_ERROR:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        if (!subscriptions.length) break;

        const clerkUserIds = subscriptions.map((s) => s.clerk_user_id).filter(Boolean);
        const { data: clerkUsers } = clerkUserIds.length
          ? await clerk.users.getUserList({ userId: clerkUserIds, limit: clerkUserIds.length })
          : { data: [] };
        const clerkMap = Object.fromEntries((clerkUsers || []).map((u) => [u.id, u]));

        for (const sub of subscriptions) {
          const clerkUser = clerkMap[sub.clerk_user_id] || {
            id: sub.clerk_user_id,
            emailAddresses: [],
            fullName: null,
            firstName: null,
            createdAt: null,
            publicMetadata: {},
          };
          if (roleFilter !== "all" && (getRole(clerkUser) || "user") !== roleFilter) continue;
          rows.push(toRow(clerkUser, sub, viewerIsSuperAdmin));
        }

        if (rows.length >= MAX_ROWS || subscriptions.length < CHUNK) break;
        offset += CHUNK;
      }
    }

    const header = viewerIsSuperAdmin
      ? [
          "Name",
          "Email",
          "Joined At",
          "Plan",
          "Role",
          "Status",
          "Billing Interval",
          "Plan Valid Until",
          "Razorpay Customer ID",
          "Razorpay Subscription ID",
          "Clerk User ID",
        ]
      : ["Name", "Email", "Joined At", "Plan", "Role"];

    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const filename = `hyperiux-users-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("ADMIN_USERS_EXPORT_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
