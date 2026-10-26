import { displayName } from "@/lib/display-name";
import { NextResponse } from "next/server";
import { can, getRole, requirePermission } from "@/lib/admin";
import { resolveDateBounds } from "@/lib/admin-activity";
import { PLAN_LABELS, getAdminUserList, parseAudience } from "@/lib/admin-data";

// Hard ceiling on one export, however large the user base gets
const MAX_ROWS = 20000;

const PLAN_OPTIONS = new Set(["pro_plus", "pro", "free", "paid"]);
const ROLE_OPTIONS = new Set(["admin", "super_admin", "user"]);

// A cell starting with = + - @ (or a tab / carriage return) is run as a formula when the
// file is opened in Excel or Sheets, and names are whatever people typed at sign-up
// ("=HYPERLINK(...)"). Those get a leading apostrophe, so they stay plain text.
const FORMULA_START = /^[=+\-@\t\r]/;

function csvCell(value) {
  let str = value === null || value === undefined ? "" : String(value);
  if (FORMULA_START.test(str)) str = `'${str}`;
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toRow({ clerkUser, sub, currentPlan }, seesMoney) {
  const role = getRole(clerkUser);
  const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
  const name = displayName(clerkUser) || "";
  const joinedAt = clerkUser.createdAt || sub?.created_at || "";

  // The plan they have now (an expired grant is Free)
  const base = [name, email, joinedAt ? new Date(joinedAt).toISOString() : "", PLAN_LABELS[currentPlan], role || "none"];

  if (!seesMoney) return base;

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

export async function GET(request) {
  // Needs users.export; the billing columns need finance.view
  const access = await requirePermission("users.export");
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const seesMoney = can(access, "finance.view");

  try {
    const { searchParams } = new URL(request.url);
    const rawPlan = searchParams.get("plan") || "all";
    const rawRole = searchParams.get("role") || "all";
    const { startISO, endISO } = resolveDateBounds({
      range: searchParams.get("joined") || "all",
      from: searchParams.get("joinedFrom"),
      to: searchParams.get("joinedTo"),
      timeZone: searchParams.get("tz"),
    });

    // The same list (and filters) as the Users table
    const list = await getAdminUserList({
      audience: parseAudience(searchParams),
      search: searchParams.get("search") || "",
      plan: PLAN_OPTIONS.has(rawPlan) ? rawPlan : "all",
      // "role:<id>": admins with one admin role (lib/admin-data getAdminUserList)
        role: ROLE_OPTIONS.has(rawRole) || /^role:[a-z0-9-]{1,60}$/.test(rawRole) ? rawRole : "all",
      startISO,
      endISO,
    });
    const rows = list.slice(0, MAX_ROWS).map((entry) => toRow(entry, seesMoney));

    const header = seesMoney
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
