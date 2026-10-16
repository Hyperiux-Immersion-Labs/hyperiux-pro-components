import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { assertSuperAdmin } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";

// "Exclude from revenue" / "Include" on an Invoicing ledger row: the payment stays in
// the ledger but leaves every revenue figure and count (api/admin/invoices*,
// api/admin/template-purchases) - for a mistaken or duplicate charge, or a test made
// with live keys by someone who isn't marked internal. Changes nothing at Razorpay.
const TABLES = { subscription: "invoices", template: "template_purchases" };

export async function POST(request) {
  if (!(await assertSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { kind, id, excluded } = await request.json();
    const table = TABLES[kind];

    if (!table || typeof id !== "string" || !id || typeof excluded !== "boolean") {
      return NextResponse.json({ error: "kind (subscription|template), id and excluded (true|false) are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(table)
      .update({ excluded })
      .eq("id", id)
      .select("id, excluded, clerk_user_id, razorpay_payment_id, amount, currency")
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    await recordAdminAction({
      action: excluded ? "payment.exclude" : "payment.include",
      targetClerkUserId: data.clerk_user_id,
      details: { kind, paymentId: data.razorpay_payment_id, amount: data.amount, currency: data.currency },
    });

    return NextResponse.json({ success: true, id: data.id, excluded: data.excluded });
  } catch (error) {
    console.error("ADMIN_PAYMENT_EXCLUDE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
