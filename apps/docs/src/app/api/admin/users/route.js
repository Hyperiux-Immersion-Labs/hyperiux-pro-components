import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getRole, isSuperAdminUser } from "@/lib/admin";
import { resolveRangeStart } from "@/lib/admin-activity";

const DEFAULT_LIMIT = 10;
// Clerk's own /users list endpoint caps `limit` per request at 500 - also
// used as the batch size when resolving a page of clerk_user_ids from
// Supabase back into full Clerk profiles.
const MAX_LIMIT = 500;

const SUBSCRIPTION_COLUMNS =
  "clerk_user_id, plan, status, billing_interval, current_period_end, razorpay_customer_id, razorpay_subscription_id, created_at";

function countByUser(rows) {
  const counts = new Map();
  for (const row of rows) {
    counts.set(row.clerk_user_id, (counts.get(row.clerk_user_id) || 0) + 1);
  }
  return counts;
}

// Lifetime copy/save totals for exactly this page's users - all-time,
// matching the same numbers already shown on the per-user Activity Detail
// page, not scoped to the table's own joined-date filter (that filter is
// about who's in the list, not how much of the site's history counts).
async function countsForIds(ids) {
  if (!ids.length) return { copiesById: new Map(), savesById: new Map() };

  const [{ data: copyRows }, { data: saveRows }] = await Promise.all([
    supabase.from("install_unlocks").select("clerk_user_id").in("clerk_user_id", ids),
    supabase.from("wishlisted_effects").select("clerk_user_id").in("clerk_user_id", ids),
  ]);

  return {
    copiesById: countByUser(copyRows || []),
    savesById: countByUser(saveRows || []),
  };
}

function shapeUser(clerkUser, sub, viewerIsSuperAdmin, copiesById, savesById) {
  const role = getRole(clerkUser);

  const base = {
    id: clerkUser.id,
    email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
    name: clerkUser.fullName || clerkUser.firstName || null,
    imageUrl: clerkUser.imageUrl || null,
    joinedAt: clerkUser.createdAt || sub?.created_at || null,
    plan: sub?.plan || "free",
    role,
    isAdmin: role !== null,
    copiesCount: copiesById.get(clerkUser.id) || 0,
    savesCount: savesById.get(clerkUser.id) || 0,
  };

  // Billing/payment detail is super-admin only - a regular admin gets user
  // identity + plan tier but no subscription status, renewal date, or
  // Razorpay IDs, enforced here rather than only hidden in the UI.
  if (!viewerIsSuperAdmin) return base;

  return {
    ...base,
    status: sub?.status || "inactive",
    billingInterval: sub?.billing_interval || null,
    planValidUntil: sub?.current_period_end || null,
    razorpayCustomerId: sub?.razorpay_customer_id || null,
    razorpaySubscriptionId: sub?.razorpay_subscription_id || null,
  };
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
    const joinedRange = searchParams.get("joined") || "all";
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

    const rangeStart = resolveRangeStart(joinedRange);

    // Text search has to run against Clerk - name/email live there, not in
    // Supabase. Clerk's own `query` param searches its FULL user base
    // (first name, last name, email, username, phone, web3 wallet) with
    // real pagination and an accurate totalCount, unlike fetching a bounded
    // window of subscriptions and filtering client-side afterward (the old
    // bug: search only ever looked at the most recently created rows, so
    // anyone outside that window was invisible - not "no results", just
    // silently never checked).
    if (search) {
      const clerkParams = { query: search, limit, offset, orderBy: "-created_at" };
      if (rangeStart) clerkParams.createdAtAfter = rangeStart.getTime();

      const { data: clerkUsers, totalCount } = await clerk.users.getUserList(clerkParams);
      const ids = clerkUsers.map((u) => u.id);

      const [{ data: subRows }, { copiesById, savesById }] = await Promise.all([
        ids.length
          ? supabase.from("subscriptions").select(SUBSCRIPTION_COLUMNS).in("clerk_user_id", ids)
          : Promise.resolve({ data: [] }),
        countsForIds(ids),
      ]);
      const subMap = Object.fromEntries((subRows || []).map((s) => [s.clerk_user_id, s]));

      let users = clerkUsers.map((u) =>
        shapeUser(u, subMap[u.id], viewerIsSuperAdmin, copiesById, savesById)
      );

      // Plan lives only in Supabase, so it can't be pushed into Clerk's
      // query - applied as a post-filter on this page when search + plan
      // are combined, which can return fewer than `limit` rows on that
      // page. Search alone and plan-filter alone (the common cases) are
      // both fully accurate; this is a narrow, documented tradeoff for the
      // rare combination of both at once.
      if (planFilter !== "all") {
        users = users.filter((u) => u.plan === planFilter);
      }

      return NextResponse.json({ users, total: totalCount });
    }

    // No search text - Supabase is the real source of truth for the full
    // user list (every signup gets a row via the Clerk user.created webhook,
    // see api/webhooks/clerk/route.js), so paginate and count directly
    // against it instead of ever bounding to a fixed recent window.
    let query = supabase
      .from("subscriptions")
      .select(SUBSCRIPTION_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (planFilter !== "all") query = query.eq("plan", planFilter);
    if (rangeStart) query = query.gte("created_at", rangeStart.toISOString());

    const { data: subscriptions, count, error } = await query;

    if (error) {
      console.error("ADMIN_USERS_SUPABASE_ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const clerkUserIds = (subscriptions || []).map((s) => s.clerk_user_id).filter(Boolean);

    const [clerkUsersResult, { copiesById, savesById }] = await Promise.all([
      clerkUserIds.length
        ? clerk.users.getUserList({ userId: clerkUserIds, limit: clerkUserIds.length })
        : Promise.resolve({ data: [] }),
      countsForIds(clerkUserIds),
    ]);

    const clerkMap = Object.fromEntries((clerkUsersResult.data || []).map((u) => [u.id, u]));

    const users = (subscriptions || []).map((sub) => {
      // A subscriptions row with no matching Clerk profile (deleted
      // account, or a lookup hiccup) still renders as a row instead of
      // crashing the whole page.
      const clerkUser = clerkMap[sub.clerk_user_id] || {
        id: sub.clerk_user_id,
        emailAddresses: [],
        fullName: null,
        firstName: null,
        imageUrl: null,
        createdAt: null,
        publicMetadata: {},
      };

      return shapeUser(clerkUser, sub, viewerIsSuperAdmin, copiesById, savesById);
    });

    return NextResponse.json({ users, total: count || 0 });
  } catch (error) {
    console.error("ADMIN_USERS_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
