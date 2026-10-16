import "server-only";
import { razorpay, withRazorpayRetry } from "@/lib/razorpay";
import { markInvoiceRefunded, markUserFree } from "@/lib/pro-access";
import { markTemplatePurchaseRefunded } from "@/lib/template-purchases";
import { shouldApplySubscriptionEvent } from "@/lib/subscription-events";

const ENDED = new Set(["cancelled", "completed", "expired"]);

/**
 * What a refund of `paymentId` means for us, applied - the one path for the Razorpay refund
 * webhook, the admin dashboard's Refund and Sync with Razorpay. Razorpay's current payment
 * decides (the copy inside a webhook event can predate the refund). Idempotent: running it
 * again for the same refund changes nothing.
 *   - partial refund: nothing changes (access stays)
 *   - a subscription charge (the payment has an invoice_id): the invoice is marked refunded,
 *     the plan ends now (unless an upgrade already replaced that subscription) and the
 *     subscription is cancelled on Razorpay so it never charges again
 *   - a template purchase: marked refunded, which stops its download
 * Returns { kind: "partial" | "subscription" | "template", ... }.
 */
export async function applyRefund(paymentId) {
  const refunded = await withRazorpayRetry(() => razorpay.payments.fetch(paymentId));
  const isFull = refunded?.refund_status === "full" || (refunded?.amount > 0 && refunded?.amount_refunded >= refunded?.amount);
  if (!isFull) return { kind: "partial", amountRefunded: refunded?.amount_refunded ?? 0, amount: refunded?.amount ?? 0 };

  if (!refunded.invoice_id) {
    await markTemplatePurchaseRefunded(paymentId);
    return { kind: "template" };
  }

  await markInvoiceRefunded(paymentId);
  const invoice = await withRazorpayRetry(() => razorpay.invoices.fetch(refunded.invoice_id));
  const subscription = invoice?.subscription_id ? await withRazorpayRetry(() => razorpay.subscriptions.fetch(invoice.subscription_id)) : null;
  const clerkUserId = subscription?.notes?.clerk_user_id || null;

  let endedPlan = false;
  if (clerkUserId && (await shouldApplySubscriptionEvent({ clerkUserId, subscription, kind: "end" }))) {
    await markUserFree({ clerkUserId, status: "refunded" });
    endedPlan = true;
  }

  // A refunded subscription never charges again - cancelled right away, whether or not
  // it's still the account's plan; outside the check above so a retry still cancels if
  // this failed after the downgrade. Not wrapped in withRazorpayRetry (never retry a
  // cancel): a failure throws, and the caller - or Razorpay's redelivery - runs it again.
  let cancelled = false;
  if (subscription && !ENDED.has(subscription.status)) {
    await razorpay.subscriptions.cancel(subscription.id, false);
    cancelled = true;
  }

  return { kind: "subscription", clerkUserId, subscriptionId: subscription?.id || null, endedPlan, cancelled };
}
