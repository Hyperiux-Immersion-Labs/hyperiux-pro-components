import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { assertSuperAdmin } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";
import { razorpay, withRazorpayRetry } from "@/lib/razorpay";
import { applyRefund } from "@/lib/refunds";

// "Refund" on a payment in the Manage drawer's Billing section (super admins). Real money:
// only payments we recorded (a subscription invoice or a template purchase) can be
// refunded, never more than what's still refundable, and Razorpay is asked exactly once
// (no retry - a timed-out refund may still have gone through; check the payment first).
// A full refund is applied straight away with the webhook's own steps (lib/refunds): the
// plan ends and the subscription is cancelled, or the template purchase is marked
// refunded. A partial refund changes nothing else.
//   { paymentId, amount? } - amount in paise / cents; the whole remainder when left out
export async function POST(request) {
  if (!(await assertSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { paymentId, amount } = await request.json().catch(() => ({}));
  if (typeof paymentId !== "string" || !paymentId.startsWith("pay_")) {
    return NextResponse.json({ error: "A Razorpay paymentId (pay_…) is required." }, { status: 400 });
  }
  if (amount !== undefined && (!Number.isInteger(amount) || amount <= 0)) {
    return NextResponse.json({ error: "amount must be a whole number of paise / cents." }, { status: 400 });
  }

  // Ours to refund: recorded against an account
  const [invoice, template] = await Promise.all([
    supabase.from("invoices").select("clerk_user_id, currency").eq("razorpay_payment_id", paymentId).maybeSingle(),
    supabase.from("template_purchases").select("clerk_user_id, currency").eq("razorpay_payment_id", paymentId).maybeSingle(),
  ]);
  const owner = invoice.data || template.data;
  if (!owner) return NextResponse.json({ error: "That payment isn't one of ours." }, { status: 404 });

  let payment;
  try {
    payment = await withRazorpayRetry(() => razorpay.payments.fetch(paymentId));
  } catch (fetchError) {
    return NextResponse.json({ error: fetchError?.error?.description || "Couldn't read the payment from Razorpay." }, { status: 502 });
  }
  const refundable = Math.max(0, (payment?.amount || 0) - (payment?.amount_refunded || 0));
  if (payment?.status !== "captured" && payment?.status !== "refunded") {
    return NextResponse.json({ error: `Razorpay can't refund a ${payment?.status || "missing"} payment.` }, { status: 400 });
  }
  if (refundable <= 0) return NextResponse.json({ error: "This payment is already fully refunded." }, { status: 400 });
  const refundAmount = amount ?? refundable;
  if (refundAmount > refundable) {
    return NextResponse.json({ error: `Only ${refundable} (paise / cents) is left to refund.` }, { status: 400 });
  }

  let refund;
  try {
    refund = await razorpay.payments.refund(paymentId, {
      amount: refundAmount,
      speed: "normal",
      notes: { reason: "Refunded from the Vault admin dashboard" },
    });
  } catch (refundError) {
    console.error("ADMIN_REFUND_ERROR:", paymentId, refundError);
    return NextResponse.json({ error: refundError?.error?.description || "Razorpay couldn't refund this payment." }, { status: 502 });
  }

  // The money has moved; what it means for the account is applied now (the webhook will
  // repeat it harmlessly). A failure here is reported, but the refund stands.
  let outcome = null;
  let followUpError = null;
  try {
    outcome = await applyRefund(paymentId);
  } catch (applyError) {
    console.error("ADMIN_REFUND_APPLY_ERROR:", paymentId, applyError);
    followUpError = "Refunded at Razorpay, but the account wasn't updated yet - the refund webhook or Sync with Razorpay will finish it.";
  }

  await recordAdminAction({
    action: "payment.refund",
    targetClerkUserId: owner.clerk_user_id,
    details: { paymentId, refundId: refund?.id || null, amount: refundAmount, currency: payment.currency || owner.currency, full: refundAmount === refundable, outcome: outcome?.kind || null },
  });

  return NextResponse.json({ refunded: refundAmount, currency: payment.currency || owner.currency, refundId: refund?.id || null, outcome, followUpError });
}
