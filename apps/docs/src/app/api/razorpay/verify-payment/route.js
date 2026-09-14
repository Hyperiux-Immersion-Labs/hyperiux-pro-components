import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { razorpay } from "@/lib/razorpay";
import { markUserProFromSubscription, recordInvoice } from "@/lib/pro-access";
import { recordTemplatePurchase } from "@/lib/template-purchases";

function isValidSignature(payload, signature) {
  const expected = Buffer.from(
    crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest("hex")
  );
  const received = Buffer.from(signature);

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (
      !razorpay_payment_id ||
      !razorpay_signature ||
      (!razorpay_order_id && !razorpay_subscription_id)
    ) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    // Signature base differs by flow (per Razorpay docs):
    // orders: order_id|payment_id - subscriptions: payment_id|subscription_id
    const payload = razorpay_subscription_id
      ? `${razorpay_payment_id}|${razorpay_subscription_id}`
      : `${razorpay_order_id}|${razorpay_payment_id}`;

    if (!isValidSignature(payload, razorpay_signature)) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    if (razorpay_subscription_id) {
      const subscription = await razorpay.subscriptions.fetch(
        razorpay_subscription_id
      );

      if (subscription?.notes?.clerk_user_id !== userId) {
        return NextResponse.json(
          { error: "Subscription does not belong to this user" },
          { status: 403 }
        );
      }

      // Activate immediately - covers local dev where webhooks can't reach us.
      // Production webhooks re-confirm on subscription.activated/charged.
      const result = await markUserProFromSubscription({
        clerkUserId: userId,
        subscription,
      });

      // Records the invoice here too, not just from the subscription.charged
      // webhook - that webhook is the only place this happened before, so a
      // real paying customer whose webhook delivery is delayed, never
      // configured for this environment, or (as in local dev) simply
      // unreachable would activate Pro correctly but never see an invoice
      // in their Invoicing tab. recordInvoice() upserts on razorpay_payment_id
      // with ignoreDuplicates, so if the webhook also lands later for the
      // same payment it's a safe no-op, not a duplicate row. Wrapped so a
      // Razorpay fetch hiccup here can't block the plan activation the user
      // is waiting on.
      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        await recordInvoice({ clerkUserId: userId, subscription, payment });
      } catch (invoiceError) {
        console.error("VERIFY_PAYMENT_RECORD_INVOICE_ERROR:", invoiceError);
      }

      return NextResponse.json({ verified: true, ...result });
    }

    // Order (one-time payment) branch - re-fetch the order rather than
    // trusting anything the client sent, same reasoning as create-order not
    // trusting a client-supplied amount. order.notes carries whatever
    // create-order stamped on it server-side (clerk_user_id always;
    // template_slug only for a template purchase).
    const order = await razorpay.orders.fetch(razorpay_order_id);

    if (order?.notes?.clerk_user_id !== userId) {
      return NextResponse.json(
        { error: "Order does not belong to this user" },
        { status: 403 }
      );
    }

    if (order?.notes?.template_slug) {
      await recordTemplatePurchase({
        clerkUserId: userId,
        templateSlug: order.notes.template_slug,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        amount: typeof order.amount === "number" ? order.amount / 100 : null,
        currency: order.currency || "USD",
      });
    }

    console.log("RAZORPAY_PAYMENT_VERIFIED:", {
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      templateSlug: order?.notes?.template_slug || null,
    });

    return NextResponse.json({
      verified: true,
      templateSlug: order?.notes?.template_slug || null,
    });
  } catch (error) {
    console.error("RAZORPAY_VERIFY_PAYMENT_ERROR:", error);

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
