import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hitesh@weareenigma.com";

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) return false;

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  return (
    user?.publicMetadata?.role === "admin" ||
    user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL
  );
}

export async function GET(request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const planFilter = searchParams.get("plan") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Fetch subscriptions from Supabase
    let query = supabase
      .from("subscriptions")
      .select("clerk_user_id, plan, status, billing_interval, current_period_end, stripe_customer_id, stripe_subscription_id, created_at, updated_at")
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

    // Fetch matching Clerk users in batch
    const clerkUserIds = (subscriptions || []).map((s) => s.clerk_user_id).filter(Boolean);
    const clerk = await clerkClient();

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
      return {
        id: sub.clerk_user_id,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
        name: clerkUser?.fullName || clerkUser?.firstName || null,
        imageUrl: clerkUser?.imageUrl || null,
        joinedAt: clerkUser?.createdAt || sub.created_at,
        plan: sub.plan || "free",
        status: sub.status || "inactive",
        billingInterval: sub.billing_interval || null,
        planValidUntil: sub.current_period_end || null,
        stripeCustomerId: sub.stripe_customer_id || null,
        stripeSubscriptionId: sub.stripe_subscription_id || null,
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
