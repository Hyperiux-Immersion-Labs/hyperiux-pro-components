import "server-only";
import { supabase } from "@/lib/supabase";
import { razorpay, withRazorpayRetry } from "@/lib/razorpay";
import { markUserFree, markUserProFromSubscription } from "@/lib/pro-access";
import { applyRefund } from "@/lib/refunds";
import { ACTIVE_PRO_STATUSES } from "@/lib/subscription";
import { currentPlanOf } from "@/lib/admin-data";

const ENDED = new Set(["cancelled", "completed", "expired", "halted", "paused"]);
const DAY_MS = 86_400_000;

// One account's payments, newest first, as { table, id, paymentId, status, ... }
export async function paymentsOf(clerkUserId) {
  const [invoices, templates] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, razorpay_payment_id, amount, currency, status, excluded, plan_label, billing_interval, invoice_url, created_at")
      .eq("clerk_user_id", clerkUserId)
      .eq("is_test", false),
    supabase
      .from("template_purchases")
      .select("id, razorpay_payment_id, template_slug, amount, currency, status, excluded, source, invoice_url, created_at")
      .eq("clerk_user_id", clerkUserId)
      .eq("is_test", false),
  ]);
  if (invoices.error) throw invoices.error;
  if (templates.error) throw templates.error;
  return [
    // invoices.amount is in paise / cents; template_purchases.amount in whole units
    ...(invoices.data || []).map((row) => ({ ...row, kind: "subscription", minorAmount: row.amount })),
    ...(templates.data || [])
      .filter((row) => row.source !== "credit" && row.razorpay_payment_id)
      .map((row) => ({ ...row, kind: "template", minorAmount: typeof row.amount === "number" ? Math.round(row.amount * 100) : null })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * "Sync with Razorpay" in the admin Manage drawer: bring one account in line with what
 * Razorpay says, and say what changed (a list of plain sentences, empty when it already
 * matched). Uses the same steps as the webhooks, so it's safe to run any time.
 *   1. Refunds made at Razorpay that we missed: applied (lib/refunds) - the plan ends and
 *      the subscription is cancelled, or the template purchase is marked refunded
 *   2. The plan: Pro with Razorpay's period end while the subscription is live, Free once
 *      Razorpay has ended, halted or paused it; a refunded subscription still live there
 *      is cancelled
 */
export async function syncSubscription(clerkUserId) {
  const changes = [];

  // 1. Refunds
  for (const payment of await paymentsOf(clerkUserId)) {
    if (!payment.razorpay_payment_id || payment.status === "refunded") continue;
    const live = await withRazorpayRetry(() => razorpay.payments.fetch(payment.razorpay_payment_id));
    const fullyRefunded = live?.refund_status === "full" || (live?.amount > 0 && live?.amount_refunded >= live?.amount);
    if (!fullyRefunded) continue;
    const outcome = await applyRefund(payment.razorpay_payment_id);
    changes.push(
      outcome.kind === "template"
        ? `Template purchase ${payment.razorpay_payment_id} was refunded at Razorpay: marked refunded.`
        : `Payment ${payment.razorpay_payment_id} was refunded at Razorpay: marked refunded${outcome.endedPlan ? ", moved to Free" : ""}${outcome.cancelled ? ", subscription cancelled" : ""}.`
    );
  }

  // 2. The plan
  const { data: row, error } = await supabase
    .from("subscriptions")
    .select("plan, tier, status, current_period_end, razorpay_subscription_id")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();
  if (error) throw error;
  if (!row?.razorpay_subscription_id) {
    return { changes, note: "No Razorpay subscription on this account (a plan granted by the team, or never subscribed)." };
  }

  const live = await withRazorpayRetry(() => razorpay.subscriptions.fetch(row.razorpay_subscription_id));
  if (live?.notes?.clerk_user_id && live.notes.clerk_user_id !== clerkUserId) {
    return { changes, note: "The subscription on this account belongs to another account at Razorpay - left as it is." };
  }

  const hasPro = currentPlanOf(row) !== "free";
  if (ACTIVE_PRO_STATUSES.includes(live.status)) {
    if (row.status === "refunded") {
      // Never cancel with a retry wrapper: a failure throws and Sync can simply be run again
      await razorpay.subscriptions.cancel(live.id, false);
      changes.push("The refunded subscription was still live on Razorpay: cancelled.");
    } else {
      const liveEnd = live.current_end ? live.current_end * 1000 : null;
      const rowEnd = row.current_period_end ? new Date(row.current_period_end).getTime() : null;
      const endDrift = liveEnd && (!rowEnd || Math.abs(liveEnd - rowEnd) > DAY_MS);
      if (!hasPro || row.status !== live.status || endDrift) {
        await markUserProFromSubscription({ clerkUserId, subscription: live });
        changes.push(
          `Plan matched to Razorpay: ${live.status}${liveEnd ? `, until ${new Date(liveEnd).toISOString().slice(0, 10)}` : ""}.`
        );
      }
    }
  } else if (ENDED.has(live.status) && hasPro) {
    await markUserFree({ clerkUserId, status: live.status });
    changes.push(`Razorpay says the subscription is ${live.status}: moved to Free.`);
  }

  return { changes };
}
