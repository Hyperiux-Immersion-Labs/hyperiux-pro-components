import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

// Razorpay subscription statuses that count as "paying customer".
// "authenticated" = mandate approved, first charge pending (trial-like window).
export const PAID_STATUSES = ["authenticated", "active"];

const PLAN_INTERVALS = {
  [process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID]: "monthly",
  [process.env.RAZORPAY_PRO_YEARLY_PLAN_ID]: "yearly",
  [process.env.RAZORPAY_PRO_FOUNDING_YEARLY_PLAN_ID]: "yearly",
};

export function getBillingInterval(planId) {
  return PLAN_INTERVALS[planId] || null;
}

function getPeriodEnd(subscription) {
  return subscription?.current_end
    ? new Date(subscription.current_end * 1000).toISOString()
    : null;
}

async function updateClerkPlan(clerkUserId, publicMetadataPatch) {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);

  await client.users.updateUser(clerkUserId, {
    publicMetadata: { ...user.publicMetadata, ...publicMetadataPatch },
  });
}

export async function markUserProFromSubscription({ clerkUserId, subscription }) {
  if (!clerkUserId) {
    throw new Error("Missing clerkUserId in markUserProFromSubscription.");
  }

  if (!subscription?.id) {
    throw new Error("Missing Razorpay subscription in markUserProFromSubscription.");
  }

  const billingInterval = getBillingInterval(subscription.plan_id);
  const currentPeriodEnd = getPeriodEnd(subscription);
  const status = subscription.status || "active";

  const { error } = await supabase.from("subscriptions").upsert(
    {
      clerk_user_id: clerkUserId,
      razorpay_customer_id: subscription.customer_id || null,
      razorpay_subscription_id: subscription.id,
      razorpay_plan_id: subscription.plan_id,
      billing_interval: billingInterval,
      plan: "pro",
      status,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" }
  );

  if (error) {
    console.error("SUPABASE_MARK_PRO_ERROR:", error);
    throw error;
  }

  await updateClerkPlan(clerkUserId, {
    plan: "pro",
    proAccess: true,
    billingInterval,
    subscriptionStatus: status,
    razorpaySubscriptionId: subscription.id,
    razorpayPlanId: subscription.plan_id,
    currentPeriodEnd,
  });

  return { plan: "pro", status, billingInterval, currentPeriodEnd };
}

export async function markUserFree({ clerkUserId, status = "inactive" }) {
  if (!clerkUserId) {
    throw new Error("Missing clerkUserId in markUserFree.");
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan: "free",
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", clerkUserId);

  if (error) {
    console.error("SUPABASE_MARK_FREE_ERROR:", error);
    throw error;
  }

  await updateClerkPlan(clerkUserId, {
    plan: "free",
    proAccess: false,
    billingInterval: null,
    subscriptionStatus: status,
    razorpaySubscriptionId: null,
    razorpayPlanId: null,
    currentPeriodEnd: null,
  });
}

export async function countPaidUsers() {
  const { count, error } = await supabase
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("plan", "pro")
    .in("status", PAID_STATUSES)
    // Excludes admin-comped/legacy rows with no real Razorpay subscription
    // behind them - only actual paying customers count toward the 100 slots.
    .not("razorpay_subscription_id", "is", null);

  if (error) {
    console.error("COUNT_PAID_USERS_ERROR:", error);
    throw error;
  }

  return count || 0;
}
