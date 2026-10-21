import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { requirePermission } from "@/lib/admin";
import { currentPlanOf } from "@/lib/admin-data";
import { razorpay, withRazorpayRetry } from "@/lib/razorpay";
import { ACTIVE_PRO_STATUSES } from "@/lib/subscription";
import { isCancelScheduled } from "@/lib/subscription-events";
import { paymentsOf } from "@/lib/subscription-sync";

// The Manage drawer's Billing section (super admins): the account's plan as we hold it,
// the subscription as Razorpay holds it right now, every payment with its refund state at
// Razorpay, and where the two disagree (fixed by "Sync with Razorpay"). Read-only.
const ENDED = new Set(["cancelled", "completed", "expired", "halted", "paused"]);
const RAZORPAY = "https://dashboard.razorpay.com/app";
const DAY_MS = 86_400_000;
const date = (ms) => (ms ? new Date(ms).toISOString() : null);

export async function GET(request) {
  if (!(await requirePermission("finance.view"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clerkUserId = new URL(request.url).searchParams.get("clerkUserId");
  if (!clerkUserId) return NextResponse.json({ error: "clerkUserId is required." }, { status: 400 });

  try {
    const [{ data: row, error }, payments, user] = await Promise.all([
      supabase.from("subscriptions").select("plan, tier, status, billing_interval, current_period_end, razorpay_subscription_id, razorpay_customer_id").eq("clerk_user_id", clerkUserId).maybeSingle(),
      paymentsOf(clerkUserId),
      clerkClient()
        .then((clerk) => clerk.users.getUser(clerkUserId))
        .catch(() => null),
    ]);
    if (error) throw error;

    // Razorpay's side; a Razorpay failure still shows ours
    let live = null;
    let razorpayError = null;
    if (row?.razorpay_subscription_id) {
      try {
        live = await withRazorpayRetry(() => razorpay.subscriptions.fetch(row.razorpay_subscription_id));
      } catch (fetchError) {
        razorpayError = fetchError?.error?.description || fetchError?.message || "Razorpay didn't answer.";
      }
    }
    const refundStates = await Promise.all(
      payments.slice(0, 12).map((payment) =>
        withRazorpayRetry(() => razorpay.payments.fetch(payment.razorpay_payment_id))
          .then((p) => [payment.razorpay_payment_id, { refunded: p.amount_refunded || 0, refundStatus: p.refund_status || null }])
          .catch(() => [payment.razorpay_payment_id, null])
      )
    );
    const atRazorpay = Object.fromEntries(refundStates);

    // Where we and Razorpay disagree
    const drift = [];
    const hasPro = currentPlanOf(row) !== "free";
    if (live) {
      if (ENDED.has(live.status) && hasPro) drift.push(`Razorpay says the subscription is ${live.status}, but the account still has Pro.`);
      if (ACTIVE_PRO_STATUSES.includes(live.status) && !hasPro && row?.status !== "refunded") {
        drift.push(`Razorpay says the subscription is ${live.status}, but the account is on Free.`);
      }
      if (ACTIVE_PRO_STATUSES.includes(live.status) && row?.status === "refunded") {
        drift.push("The subscription was refunded, but it's still live on Razorpay and will charge again.");
      }
      const liveEnd = live.current_end ? live.current_end * 1000 : null;
      const rowEnd = row?.current_period_end ? new Date(row.current_period_end).getTime() : null;
      if (hasPro && liveEnd && rowEnd && Math.abs(liveEnd - rowEnd) > DAY_MS) drift.push("The plan's end date differs from Razorpay's current period.");
    }
    for (const payment of payments) {
      if (atRazorpay[payment.razorpay_payment_id]?.refundStatus === "full" && payment.status !== "refunded") {
        drift.push(`Payment ${payment.razorpay_payment_id} was refunded at Razorpay but is still counted as paid.`);
      }
    }

    return NextResponse.json({
      account: row
        ? {
            plan: currentPlanOf(row),
            status: row.status,
            billingInterval: row.billing_interval,
            currentPeriodEnd: row.current_period_end,
            subscriptionId: row.razorpay_subscription_id,
            customerId: row.razorpay_customer_id,
            // Pro given from the dashboard: no Razorpay subscription behind it
            granted: row.plan === "pro" && !row.razorpay_subscription_id,
          }
        : null,
      razorpay: live
        ? {
            id: live.id,
            status: live.status,
            planId: live.plan_id,
            paidCount: live.paid_count ?? null,
            currentEnd: date(live.current_end && live.current_end * 1000),
            chargeAt: ENDED.has(live.status) ? null : date(live.charge_at && live.charge_at * 1000),
            endedAt: date(live.ended_at && live.ended_at * 1000),
            url: `${RAZORPAY}/subscriptions/${live.id}`,
          }
        : null,
      razorpayError,
      cancelScheduled: isCancelScheduled(user, row?.razorpay_subscription_id),
      payments: payments.map((payment) => {
        const state = atRazorpay[payment.razorpay_payment_id];
        const refunded = state?.refunded || 0;
        return {
          id: payment.id,
          kind: payment.kind,
          paymentId: payment.razorpay_payment_id,
          label: payment.kind === "subscription" ? payment.plan_label || "Vault Pro" : payment.template_slug,
          amount: payment.minorAmount,
          currency: payment.currency,
          status: payment.status,
          excluded: Boolean(payment.excluded),
          createdAt: payment.created_at,
          refunded,
          // Still refundable at Razorpay, in paise / cents (null when Razorpay didn't answer)
          refundable: state && typeof payment.minorAmount === "number" ? Math.max(0, payment.minorAmount - refunded) : null,
          url: `${RAZORPAY}/payments/${payment.razorpay_payment_id}`,
        };
      }),
      drift,
    });
  } catch (error) {
    console.error("ADMIN_BILLING_ERROR:", clerkUserId, error);
    return NextResponse.json({ error: "Couldn't load billing." }, { status: 500 });
  }
}
