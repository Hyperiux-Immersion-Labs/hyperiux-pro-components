import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { getUserPlan } from "@/lib/subscription";
import { isAdminUser } from "@/lib/admin";

// Mirrors the real INR pricing shown on /pricing (src/components/Pricing/Pricing.jsx)
// so a generated test invoice reads as a believable bill, not an obviously
// fake number.
const TEST_PRICE_INR = { monthly: 1999, yearly: 17990 };

// Testing-only endpoint: lets a Pro account (including one comped by an
// admin with no real Razorpay subscription behind it) generate one fake
// invoice row to verify the Invoicing tab renders correctly end-to-end.
// Real invoices are written exclusively by the Razorpay webhook
// (see recordInvoice() in @/lib/pro-access) - this never touches billing.
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, plan] = await Promise.all([currentUser(), getUserPlan(userId)]);

  if (isAdminUser(user)) {
    return NextResponse.json(
      { error: "Admin accounts don't have billing to test." },
      { status: 403 }
    );
  }

  if (plan !== "pro") {
    return NextResponse.json(
      { error: "Only Pro accounts can generate a test invoice." },
      { status: 400 }
    );
  }

  const { data: subscriptionRow } = await supabase
    .from("subscriptions")
    .select("billing_interval,razorpay_subscription_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  const billingInterval = subscriptionRow?.billing_interval || "monthly";
  const amount = (TEST_PRICE_INR[billingInterval] || TEST_PRICE_INR.monthly) * 100;

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      clerk_user_id: userId,
      razorpay_payment_id: `test_${crypto.randomUUID()}`,
      razorpay_subscription_id: subscriptionRow?.razorpay_subscription_id || null,
      amount,
      currency: "INR",
      status: "paid",
      billing_interval: billingInterval,
      plan_label: "Vault Pro (Test)",
      invoice_url: null,
      is_test: true,
    })
    .select(
      "id,amount,currency,status,billing_interval,plan_label,invoice_url,is_test,razorpay_payment_id,created_at"
    )
    .single();

  if (error) {
    console.error("CREATE_TEST_INVOICE_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create test invoice" },
      { status: 500 }
    );
  }

  return NextResponse.json({ invoice: data });
}
