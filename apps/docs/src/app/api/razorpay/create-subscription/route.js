import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { countPaidUsers } from "@/lib/pro-access";

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

// Frontend always requests "yearly" at the advertised price ($179/₹17990).
// The first 100 paid users (shared pool across both currencies) get
// silently switched to the founding plan_id server-side - no separate
// tier is ever shown or requested by the client.
const FOUNDING_LIMIT = 100;

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedPlan = body?.plan;
    const currency = body?.currency === "INR" ? "INR" : "USD";

    if (!["monthly", "yearly"].includes(requestedPlan)) {
      return NextResponse.json(
        { error: "Invalid plan. Use monthly or yearly." },
        { status: 400 }
      );
    }

    let planKey = requestedPlan;

    if (requestedPlan === "yearly") {
      const paidUsers = await countPaidUsers();

      if (paidUsers < FOUNDING_LIMIT) {
        planKey = "yearly_founding";
      }
    }

    const planId = PLANS[currency][planKey];

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: TOTAL_COUNTS[planKey],
      customer_notify: 1,
      notes: { clerk_user_id: userId, plan_key: planKey, currency },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      planId,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("RAZORPAY_CREATE_SUBSCRIPTION_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
