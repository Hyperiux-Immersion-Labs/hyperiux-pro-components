import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { getTemplateBySlug } from "@/lib/mock-templates";

// Legacy fallback when neither templateSlug nor any other real product is
// specified - the original "validate the Razorpay data flow" test payment
// this route started as, kept so that use case still works.
const TEST_AMOUNT_INR = 1;

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { templateSlug } = body;

    let amount;
    let currency;
    let receipt;
    const notes = { clerk_user_id: userId };

    if (templateSlug) {
      const template = getTemplateBySlug(templateSlug);
      const price = template?.pricing?.standaloneOneTime;

      if (!template || !Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { error: "Unknown or unpriced template" },
          { status: 400 }
        );
      }

      // Price is looked up server-side from mock-templates.js, never
      // trusted from the request body - unlike the legacy test-payment
      // branch below (fine for a $1 test charge, not fine for real money).
      //
      // USD only: templates have no real rupee price anywhere (unlike Pro's
      // RAZORPAY_PRO_*_INR_PLAN_ID, which map to actual ₹999/₹8999 prices).
      // Charging the USD number as rupees (₹29 instead of a real ₹-priced
      // equivalent) would undercharge by roughly 88x - block it server-side
      // rather than trust a client-supplied currency, until real INR
      // pricing exists per template.
      amount = price;
      currency = "USD";
      receipt = `template_${templateSlug}_${Date.now()}`;
      notes.template_slug = templateSlug;
    } else {
      amount =
        Number.isFinite(body?.amount) && body.amount > 0
          ? body.amount
          : TEST_AMOUNT_INR;
      currency = "INR";
      receipt = `test_${Date.now()}`;
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes,
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
