import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

// Test-only order for validating the Razorpay data flow (Standard Checkout).
// Not wired to Pro access/Supabase yet - that lands with the full
// Subscriptions API integration once this checkout is verified end-to-end.
const TEST_AMOUNT_INR = 1;

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const amountInRupees =
      Number.isFinite(body?.amount) && body.amount > 0
        ? body.amount
        : TEST_AMOUNT_INR;

    const order = await razorpay.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency: "INR",
      receipt: `test_${Date.now()}`,
      notes: { clerk_user_id: userId },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("RAZORPAY_CREATE_ORDER_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
