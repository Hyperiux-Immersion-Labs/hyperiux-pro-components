import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserPlan } from "@/lib/subscription";
import { isAdminUser } from "@/lib/admin";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, plan] = await Promise.all([currentUser(), getUserPlan(userId)]);

  // Admins have no personal billing to review - their Pro-equivalent access
  // (if any) isn't a paid subscription, so there's nothing to list here.
  if (isAdminUser(user)) {
    return NextResponse.json({
      isAdmin: true,
      plan,
      subscription: null,
      invoices: [],
    });
  }

  const [{ data: subscriptionRow, error: subscriptionError }, { data: invoiceRows, error: invoicesError }] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select(
          "plan,status,billing_interval,current_period_end,razorpay_subscription_id,razorpay_short_url"
        )
        .eq("clerk_user_id", userId)
        .maybeSingle(),

      supabase
        .from("invoices")
        .select(
          "id,amount,currency,status,billing_interval,plan_label,invoice_url,is_test,razorpay_payment_id,created_at"
        )
        .eq("clerk_user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

  if (subscriptionError || invoicesError) {
    console.error("DASHBOARD_INVOICES_ERROR:", subscriptionError || invoicesError);

    return NextResponse.json(
      { error: "Failed to load invoices" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    isAdmin: false,
    plan,
    subscription: subscriptionRow || null,
    invoices: invoiceRows || [],
  });
}
