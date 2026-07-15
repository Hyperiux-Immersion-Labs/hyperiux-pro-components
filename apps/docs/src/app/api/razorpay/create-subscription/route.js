import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { countPaidUsers } from "@/lib/pro-access";

const PLANS = {
  monthly: process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID,
  yearly: process.env.RAZORPAY_PRO_YEARLY_PLAN_ID,
  yearly_founding: process.env.RAZORPAY_PRO_FOUNDING_YEARLY_PLAN_ID,
};

// Number of billing cycles Razorpay runs the mandate for (max ~100).
const TOTAL_COUNTS = {
  monthly: 100, // ~8 years
  yearly: 20,
  yearly_founding: 20,
};

// Frontend always requests "yearly" at the advertised $179 price. The first
// 100 paid users get silently switched to the $149 plan_id server-side - no
// separate tier is ever shown or requested by the client.
const FOUNDING_LIMIT = 100;

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedPlan = body?.plan;

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

    const planId = PLANS[planKey];

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: TOTAL_COUNTS[planKey],
      customer_notify: 1,
      notes: { clerk_user_id: userId, plan_key: planKey },
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
