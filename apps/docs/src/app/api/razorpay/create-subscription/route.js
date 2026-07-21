import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { claimFoundingSlot, releaseFoundingSlot } from "@/lib/founding-slots";

const PLANS = {
  USD: {
    monthly: process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID,
    yearly: process.env.RAZORPAY_PRO_YEARLY_PLAN_ID,
    yearly_founding: process.env.RAZORPAY_PRO_FOUNDING_YEARLY_PLAN_ID,
  },
  INR: {
    monthly: process.env.RAZORPAY_PRO_MONTHLY_INR_PLAN_ID,
    yearly: process.env.RAZORPAY_PRO_YEARLY_INR_PLAN_ID,
    yearly_founding: process.env.RAZORPAY_PRO_FOUNDING_YEARLY_INR_PLAN_ID,
  },
};

// Number of billing cycles Razorpay runs the mandate for (max ~100).
const TOTAL_COUNTS = {
  monthly: 100, // ~8 years
  yearly: 20,
  yearly_founding: 20,
};

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedPlan = body?.plan;
    const currency = body?.currency === "INR" ? "INR" : "USD";
    const idempotencyKey =
      typeof body?.idempotencyKey === "string" && body.idempotencyKey.trim()
        ? body.idempotencyKey.trim().slice(0, 128)
        : null;

    if (!["monthly", "yearly"].includes(requestedPlan)) {
      return NextResponse.json(
        { error: "Invalid plan. Use monthly or yearly." },
        { status: 400 }
      );
    }

    if (requestedPlan === "yearly" && !idempotencyKey) {
      return NextResponse.json({ error: "Missing idempotencyKey." }, { status: 400 });
    }

    let planKey = requestedPlan;
    let reservation = null;

    // Frontend always requests "yearly" at the advertised price ($179/₹17990).
    // The first 100 people to claim a slot (via claim_founding_slot, an
    // atomic Postgres function - see founding-slots.js) get silently
    // switched to the founding plan_id server-side. Monthly signups never
    // touch the reservation system - the cap tracks founding-plan holders
    // specifically, not "the Nth paying customer overall".
    if (requestedPlan === "yearly") {
      reservation = await claimFoundingSlot({ clerkUserId: userId, idempotencyKey, currency });

      if (reservation?.status === "confirmed") {
        // Idempotent replay after a completed founding checkout - don't
        // create a second Razorpay subscription, hand back the original.
        return NextResponse.json({
          subscriptionId: reservation.razorpay_subscription_id,
          planId: PLANS[currency].yearly_founding,
          keyId: process.env.RAZORPAY_KEY_ID,
          founding: true,
        });
      }

      if (reservation?.status === "reserved") {
        planKey = "yearly_founding";
      }
      // reservation === null (pool full) or "released" (expired/compensated
      // replay of this same key) -> fall through to regular yearly.
    }

    const planId = PLANS[currency][planKey];

    let subscription;

    try {
      subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        total_count: TOTAL_COUNTS[planKey],
        customer_notify: 1,
        notes: {
          clerk_user_id: userId,
          plan_key: planKey,
          currency,
          ...(planKey === "yearly_founding" ? { founding_reservation_id: reservation.id } : {}),
        },
      });
    } catch (razorpayError) {
      if (planKey === "yearly_founding") {
        await releaseFoundingSlot({
          reservationId: reservation.id,
          reason: "razorpay_create_failed",
        }).catch((releaseError) =>
          console.error("FOUNDING_SLOT_RELEASE_ERROR:", releaseError)
        );
      }

      console.error("RAZORPAY_CREATE_SUBSCRIPTION_ERROR:", razorpayError);

      return NextResponse.json(
        {
          error: "Could not start checkout with the payment provider. Please try again.",
          reason: "razorpay_error",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      planId,
      keyId: process.env.RAZORPAY_KEY_ID,
      founding: planKey === "yearly_founding",
    });
  } catch (error) {
    console.error("RAZORPAY_CREATE_SUBSCRIPTION_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
