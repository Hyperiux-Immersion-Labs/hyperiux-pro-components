import "server-only";
import { supabase } from "@/lib/supabase";

// The Razorpay webhook log (sql/razorpay_webhook_events.sql): what arrived and what we did
// with it. Logging never fails or slows a delivery's answer beyond the one insert.
export const WEBHOOK_OUTCOMES = {
  applied: "Applied",
  skipped: "Skipped",
  ignored: "Ignored",
  failed: "Failed",
  rejected: "Rejected",
};

export async function recordWebhookEvent({ eventId = null, event = null, outcome, detail = null, clerkUserId = null, subscriptionId = null, paymentId = null, amount = null, currency = null }) {
  try {
    const { error } = await supabase.from("razorpay_webhook_events").insert({
      event_id: eventId,
      event,
      outcome,
      detail: detail ? String(detail).slice(0, 500) : null,
      clerk_user_id: clerkUserId,
      subscription_id: subscriptionId,
      payment_id: paymentId,
      amount: Number.isInteger(amount) ? amount : null,
      currency,
    });
    if (error) console.error("WEBHOOK_LOG_ERROR:", event, error);
  } catch (error) {
    console.error("WEBHOOK_LOG_ERROR:", event, error);
  }
}
