import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getRole, isSuperAdminUser } from "@/lib/admin";

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
    const search = searchParams.get("search") || "";
    const planFilter = searchParams.get("plan") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Fetch subscriptions from Supabase
    let query = supabase
      .from("subscriptions")
      .select("clerk_user_id, plan, status, billing_interval, current_period_end, razorpay_customer_id, razorpay_subscription_id, created_at, updated_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (planFilter && planFilter !== "all") {
      query = query.eq("plan", planFilter);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error("ADMIN_USERS_SUPABASE_ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch matching Clerk users in batch (reuses the `clerk` client from
    // the viewer-role check above).
    const clerkUserIds = (subscriptions || []).map((s) => s.clerk_user_id).filter(Boolean);

    let clerkUsers = [];
    if (clerkUserIds.length > 0) {
      const results = await clerk.users.getUserList({
        userId: clerkUserIds,
        limit: clerkUserIds.length,
      });
      clerkUsers = results.data || [];
    }

    const clerkMap = Object.fromEntries(clerkUsers.map((u) => [u.id, u]));

    let users = (subscriptions || []).map((sub) => {
      const clerkUser = clerkMap[sub.clerk_user_id];

      // Supabase is the source of truth once a subscriptions row exists (see
      // getUserPlan()'s comment on why an expired/free row is never overridden
      // by Clerk metadata for *pro access* purposes) - but admin role is a
      // separate axis entirely: publicMetadata.role is the only place that
      // lives, so it has to be read from Clerk directly rather than expecting
      // a matching Supabase row to exist for it.
      const role = getRole(clerkUser);

      const base = {
        id: sub.clerk_user_id,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
        name: clerkUser?.fullName || clerkUser?.firstName || null,
        imageUrl: clerkUser?.imageUrl || null,
        joinedAt: clerkUser?.createdAt || sub.created_at,
        plan: sub.plan || "free",
        role,
        isAdmin: role !== null,
      };

      // Billing/payment detail is super-admin only - a regular admin gets
      // user identity + plan tier but no subscription status, renewal date,
      // or Razorpay IDs, enforced here rather than only hidden in the UI.
      if (!viewerIsSuperAdmin) return base;

      return {
        ...base,
        status: sub.status || "inactive",
        billingInterval: sub.billing_interval || null,
        planValidUntil: sub.current_period_end || null,
        razorpayCustomerId: sub.razorpay_customer_id || null,
        razorpaySubscriptionId: sub.razorpay_subscription_id || null,
      };
    });

    // Client-side search filter (email or name)
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.email?.toLowerCase().includes(q) ||
          u.name?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ users, total: users.length });
  } catch (error) {
    console.error("ADMIN_USERS_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
