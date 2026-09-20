import { NextResponse } from "next/server";
import crypto from "crypto";
import { markUserProFromSubscription, markUserFree, sendInvoiceEmail, recordInvoice } from "@/lib/pro-access";
import { releaseFoundingSlot } from "@/lib/founding-slots";
import { razorpay } from "@/lib/razorpay";
import { recordTemplatePurchase, markTemplatePurchaseRefunded } from "@/lib/template-purchases";

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

  const expected = Buffer.from(
    crypto.createHmac("sha256", secret).update(body).digest("hex")
  );
  const received = Buffer.from(signature);

  const isValid =
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const subscription = event?.payload?.subscription?.entity;
  const payment = event?.payload?.payment?.entity;
  const clerkUserId = subscription?.notes?.clerk_user_id;

  // Safety net for one-time order payments (template purchases): unlike
  // subscriptions above, which get recorded from this webhook regardless of
  // whether the browser is still around, a template purchase's ONLY
  // recording path used to be the client's own fetch to verify-payment
  // after checkout.js's handler fires - if the tab closes, the network
  // drops, or an extension interferes between Razorpay confirming the
  // charge and that fetch landing, the payment is captured (real money
  // moved) but template_purchases never gets a row and the buyer is stuck
  // seeing "Buy" forever with no recovery path. This mirrors exactly what
  // verify-payment/route.js's own order branch already does (fetch the
  // order for its notes, record the purchase), just triggered by Razorpay's
  // server instead of the buyer's browser.
  if (event.event === "payment.captured" && payment?.order_id && !subscription) {
    try {
      const order = await razorpay.orders.fetch(payment.order_id);

      if (order?.notes?.clerk_user_id && order?.notes?.template_slug) {
        await recordTemplatePurchase({
          clerkUserId: order.notes.clerk_user_id,
          templateSlug: order.notes.template_slug,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          amount: typeof payment.amount === "number" ? payment.amount / 100 : null,
          currency: payment.currency || order.currency || "USD",
        });
      }
    } catch (error) {
      console.error("RAZORPAY_WEBHOOK_TEMPLATE_PURCHASE_ERROR:", error);

      return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  }

  // "payment.refunded" (not "refund.created") specifically: it only fires
  // once the payment's refund_status reaches "full", so a partial refund -
  // which shouldn't cost the buyer their access - never reaches here.
  // Covers both purchase shapes, distinguished the same way every other
  // branch in this file already does (subscription entity present or not):
  //   - a subscription charge refunded -> immediate cutoff, no
  //     current_period_end grace (unlike a graceful cancellation/expiry/etc,
  //     which DO get that grace - see GRACE_STATUSES in template-access.js -
  //     a refund means the money went back, so there's nothing paid-for
  //     left to honor through).
  //   - a one-time template order refunded -> markTemplatePurchaseRefunded,
  //     same as before.
  // Nothing else in the codebase reacts to a refund at all otherwise, so
  // without this branch a fully-refunded buyer keeps access forever.
  if (event.event === "payment.refunded" && payment?.id) {
    try {
      if (subscription && clerkUserId) {
        await markUserFree({ clerkUserId, status: "refunded" });
      } else {
        await markTemplatePurchaseRefunded(payment.id);
      }
    } catch (error) {
      console.error("RAZORPAY_WEBHOOK_REFUND_ERROR:", error);

      return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  }

  if (!subscription || !clerkUserId) {
    // Not a subscription event we track - ack and move on.
    return NextResponse.json({ received: true });
  }

  try {
    if (PRO_EVENTS.has(event.event)) {
      await markUserProFromSubscription({ clerkUserId, subscription });

      // Only "charged" corresponds 1:1 with an actual payment - "activated"
      // and "charged" can both fire for the first cycle, so gating the email
      // (and the invoice record) on "charged" alone avoids double-counting
      // one charge.
      if (event.event === "subscription.charged" && payment) {
        await recordInvoice({ clerkUserId, subscription, payment });
        await sendInvoiceEmail({ clerkUserId, subscription, payment });

        // Referral/affiliate sale tracking is no longer done from here -
        // ReferralRocket has its own native Razorpay webhook integration
        // (configured directly in the Razorpay dashboard), so no code on our
        // side reports the charge.
      }
    } else if (event.event in FREE_EVENTS) {
      await markUserFree({ clerkUserId, status: FREE_EVENTS[event.event] });

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

    // Non-200 makes Razorpay retry the delivery later.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
