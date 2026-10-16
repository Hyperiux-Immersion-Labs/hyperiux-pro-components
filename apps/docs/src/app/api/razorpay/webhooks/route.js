import { NextResponse } from "next/server";
import crypto from "crypto";
import { markUserProFromSubscription, markUserFree, sendInvoiceEmail, recordInvoice } from "@/lib/pro-access";
import { applyRefund } from "@/lib/refunds";
import { releaseFoundingSlot } from "@/lib/founding-slots";
import { grantCreditsForCharge } from "@/lib/template-credits";
import { cancelReplacedSubscription, shouldApplySubscriptionEvent } from "@/lib/subscription-events";
import { recordTemplatePurchase } from "@/lib/template-purchases";
import { razorpay } from "@/lib/razorpay";
import { recordWebhookEvent } from "@/lib/webhook-log";

// Razorpay's server calls this - authenticated via X-Razorpay-Signature
// (HMAC of the raw body with the webhook secret), never via Clerk.
// Keep this route out of proxy.js's protected matcher.

const PRO_EVENTS = new Set([
  "subscription.activated",
  "subscription.charged",
  "subscription.resumed",
]);

// event -> status we record when access ends or is suspended
const FREE_EVENTS = {
  "subscription.halted": "halted",
  "subscription.cancelled": "cancelled",
  "subscription.completed": "completed",
  "subscription.expired": "expired",
  "subscription.paused": "paused",
};

export async function POST(req) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_ERROR: Missing RAZORPAY_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  // Razorpay's id for this event - the same on every redelivery of it
  const eventId = req.headers.get("x-razorpay-event-id") || null;

  const expected = Buffer.from(
    crypto.createHmac("sha256", secret).update(body).digest("hex")
  );
  const received = Buffer.from(signature);

  const isValid =
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);

  if (!isValid) {
    // Not written to the webhook log: anyone can post here, and the log is for Razorpay's deliveries
    console.warn("RAZORPAY_WEBHOOK_REJECTED: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    await recordWebhookEvent({ eventId, outcome: "rejected", detail: "Invalid payload" });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // What happened to this delivery, for the webhook log (lib/webhook-log) - each branch
  // below sets it; logged once, whichever way the handler answers
  const subscriptionEntity = event?.payload?.subscription?.entity;
  const paymentEntity = event?.payload?.payment?.entity;
  const note = {
    outcome: "ignored",
    detail: null,
    clerkUserId: subscriptionEntity?.notes?.clerk_user_id || null,
    subscriptionId: subscriptionEntity?.id || null,
    paymentId: paymentEntity?.id || event?.payload?.refund?.entity?.payment_id || null,
    amount: paymentEntity?.amount ?? event?.payload?.refund?.entity?.amount ?? null,
    currency: paymentEntity?.currency || null,
  };
  try {
    return await handleEvent(event, note);
  } finally {
    await recordWebhookEvent({ eventId, event: event?.event || null, ...note });
  }
}

// One verified Razorpay event; `note` records what was done with it
async function handleEvent(event, note) {
  const subscription = event?.payload?.subscription?.entity;
  const payment = event?.payload?.payment?.entity;
  const clerkUserId = subscription?.notes?.clerk_user_id;

  // Safety net for template purchases: verify-payment records them, but only
  // if the buyer's browser is still there after Razorpay's checkout. If the
  // tab closes or the network drops in between, the money is taken but no
  // purchase is recorded. Razorpay's server reports the captured payment
  // here regardless; the order's notes (stamped by create-order) say whose
  // and which template. Same as the reference repo.
  if (event.event === "payment.captured" && payment?.order_id && !subscription) {
    try {
      const order = await razorpay.orders.fetch(payment.order_id);

      if (order?.notes?.clerk_user_id && order?.notes?.template_slug) {
        note.clerkUserId = order.notes.clerk_user_id;
        await recordTemplatePurchase({
          clerkUserId: order.notes.clerk_user_id,
          templateSlug: order.notes.template_slug,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          amount: typeof payment.amount === "number" ? payment.amount / 100 : null,
          currency: payment.currency || order.currency || "USD",
          invoiceUrl: order.notes.invoice_url || null,
        });
        Object.assign(note, { outcome: "applied", detail: `Template purchase recorded: ${order.notes.template_slug}` });
      } else {
        note.detail = "A payment that isn't a template order";
      }
    } catch (error) {
      console.error("RAZORPAY_WEBHOOK_TEMPLATE_PURCHASE_ERROR:", error);
      Object.assign(note, { outcome: "failed", detail: `Template purchase: ${error?.message || error}` });
      return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  }

  // Refunds ("refund.created" / "refund.processed" - Razorpay has no
  // "payment.refunded" event): lib/refunds applyRefund, shared with the admin
  // dashboard's Refund and Sync. Full refunds end the plan and cancel the
  // subscription, or mark a template purchase refunded; partial ones keep access.
  // Idempotent, so the two events for one refund are safe.
  if (event.event === "refund.created" || event.event === "refund.processed") {
    const paymentId = payment?.id || event?.payload?.refund?.entity?.payment_id;
    if (!paymentId) return NextResponse.json({ received: true });

    try {
      const outcome = await applyRefund(paymentId);
      console.info("RAZORPAY_REFUND:", event.event, paymentId, outcome.kind);
      if (outcome.clerkUserId) note.clerkUserId = outcome.clerkUserId;
      if (outcome.subscriptionId) note.subscriptionId = outcome.subscriptionId;
      Object.assign(
        note,
        outcome.kind === "partial"
          ? { outcome: "skipped", detail: "Partial refund: access kept" }
          : outcome.kind === "template"
            ? { outcome: "applied", detail: "Template purchase marked refunded" }
            : {
                outcome: "applied",
                detail: `Full refund: invoice marked refunded${outcome.endedPlan ? ", moved to Free" : ""}${outcome.cancelled ? ", subscription cancelled" : ""}`,
              }
      );
    } catch (error) {
      console.error("RAZORPAY_WEBHOOK_REFUND_ERROR:", error);
      Object.assign(note, { outcome: "failed", detail: `Refund: ${error?.message || error}` });
      return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  }

  if (!subscription || !clerkUserId) {
    // Not a subscription event we track (e.g. payment.captured) - ack and move on.
    note.detail = subscription ? "A subscription without an account in its notes" : "Not an event we act on";
    return NextResponse.json({ received: true });
  }

  // A prorated Pro -> Pro+ upgrade starts in the future (lib/upgrade.js): it's
  // paid up front, but Razorpay only marks it "authenticated" until the first
  // full charge, so that event grants Pro+ for upgrades
  const isUpgradeStart =
    event.event === "subscription.authenticated" && Boolean(subscription.notes?.replaces_subscription_id);

  try {
    const kind = PRO_EVENTS.has(event.event) || isUpgradeStart ? "start" : event.event in FREE_EVENTS ? "end" : null;

    // After a Pro -> Pro+ upgrade the old subscription still sends events
    // (its own cancellation above all); they must not touch the user's plan
    if (kind && !(await shouldApplySubscriptionEvent({ clerkUserId, subscription, kind }))) {
      Object.assign(note, { outcome: "skipped", detail: "Not this account's current subscription (replaced by an upgrade), a late event after it ended, or already refunded" });
      return NextResponse.json({ received: true, ignored: "replaced-subscription" });
    }

    if (PRO_EVENTS.has(event.event) || isUpgradeStart) {
      await markUserProFromSubscription({ clerkUserId, subscription });
      Object.assign(note, { outcome: "applied", detail: `Pro (${subscription.notes?.tier || "pro"}), ${subscription.status}` });

      // Upgrade: make sure the subscription it replaced is cancelled (also
      // done by verify-payment; a no-op once cancelled)
      await cancelReplacedSubscription(subscription);

      // Only "charged" corresponds 1:1 with an actual payment - "activated"
      // and "charged" can both fire for the first cycle, so gating the email
      // (and the invoice record) on "charged" alone avoids double-counting
      // one charge.
      // An upgrade's "authenticated" event carries its upfront payment, which
      // pays for its first period - credited as its first charge
      if ((event.event === "subscription.charged" || isUpgradeStart) && payment) {
        await recordInvoice({ clerkUserId, subscription, payment });
        // Throws on a Supabase error so Razorpay retries the delivery -
        // safe, since a payment ID only ever adds credits once.
        await grantCreditsForCharge({
          clerkUserId,
          subscription: isUpgradeStart ? { ...subscription, paid_count: subscription.paid_count || 1 } : subscription,
          payment,
          isUpgradePayment: isUpgradeStart,
        });
        await sendInvoiceEmail({ clerkUserId, subscription, payment });
        note.detail += ", invoice recorded";

        // Referral/affiliate sale tracking is no longer done from here -
        // ReferralRocket has its own native Razorpay webhook integration
        // (configured directly in the Razorpay dashboard), so no code on our
        // side reports the charge.
      }
    } else if (event.event in FREE_EVENTS) {
      await markUserFree({ clerkUserId, status: FREE_EVENTS[event.event] });
      Object.assign(note, { outcome: "applied", detail: `Moved to Free (${FREE_EVENTS[event.event]})` });

      // Only frees the slot if the reservation never got confirmed (a
      // founding member who cancels after activating keeps their slot -
      // release_founding_slot no-ops on an already-confirmed reservation).
      const foundingReservationId = subscription?.notes?.founding_reservation_id;

      if (foundingReservationId) {
        try {
          await releaseFoundingSlot({ reservationId: foundingReservationId, reason: event.event });
        } catch (releaseError) {
          console.error("RELEASE_FOUNDING_SLOT_ERROR:", foundingReservationId, releaseError);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("RAZORPAY_WEBHOOK_HANDLER_ERROR:", event.event, error);
    Object.assign(note, { outcome: "failed", detail: error?.message || String(error) });

    // Non-200 makes Razorpay retry the delivery later.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
