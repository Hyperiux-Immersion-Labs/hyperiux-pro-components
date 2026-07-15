import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { razorpay } from "@/lib/razorpay";
import { markUserProFromSubscription } from "@/lib/pro-access";

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
    // orders: order_id|payment_id — subscriptions: payment_id|subscription_id
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

      // Activate immediately — covers local dev where webhooks can't reach us.
      // Production webhooks re-confirm on subscription.activated/charged.
      const result = await markUserProFromSubscription({
        clerkUserId: userId,
        subscription,
      });

      return NextResponse.json({ verified: true, ...result });
    }

    console.log("RAZORPAY_PAYMENT_VERIFIED:", {
      userId,
      razorpay_order_id,
      razorpay_payment_id,
    });

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("RAZORPAY_VERIFY_PAYMENT_ERROR:", error);

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
