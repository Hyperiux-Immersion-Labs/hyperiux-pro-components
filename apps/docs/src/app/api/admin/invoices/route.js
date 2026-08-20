import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { assertSuperAdmin } from "@/lib/admin";

// Payment detail is more sensitive than the plan/role info already visible
// in User Management, so this is gated to super admins only - same gate as
// /api/admin/revenue/overview, which this page sits alongside.
//
// Every real row's status is "paid" (recordInvoice() in lib/pro-access.js
// only ever writes one on a successful Razorpay charge - there's no
// "failed"/"pending" state tracked), so is_test is the only distinction
// worth filtering on, not status.

export async function GET(request) {
  if (!(await assertSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const testFilter = searchParams.get("test") || "all"; // all | real | test
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("invoices")
      .select(
        "id,clerk_user_id,razorpay_payment_id,amount,currency,status,billing_interval,plan_label,invoice_url,is_test,created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (testFilter === "real") query = query.eq("is_test", false);
    if (testFilter === "test") query = query.eq("is_test", true);

    const [{ data: pageRows, error: pageError, count }, { data: realRows, error: statsError }] =
      await Promise.all([
        query.range(offset, offset + limit - 1),
        // Stats always reflect every real invoice, independent of the
        // current page/filter, so the top-line numbers don't shift as
        // someone pages through or toggles test/real.
        supabase.from("invoices").select("amount").eq("is_test", false),
      ]);

    if (pageError || statsError) {
      console.error("ADMIN_INVOICES_ERROR:", pageError || statsError);
      return NextResponse.json({ error: (pageError || statsError).message }, { status: 500 });
    }

    const rows = pageRows || [];
    const clerkUserIds = [...new Set(rows.map((r) => r.clerk_user_id).filter(Boolean))];
    let clerkMap = {};
    if (clerkUserIds.length > 0) {
      const clerk = await clerkClient();
      const results = await clerk.users.getUserList({
        userId: clerkUserIds,
        limit: clerkUserIds.length,
      });
      clerkMap = Object.fromEntries((results.data || []).map((u) => [u.id, u]));
    }

    const invoices = rows.map((row) => {
      const clerkUser = row.clerk_user_id ? clerkMap[row.clerk_user_id] : null;

      return {
        id: row.id,
        userId: row.clerk_user_id,
        userName: clerkUser?.fullName || clerkUser?.firstName || null,
        userEmail: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
        userImageUrl: clerkUser?.imageUrl || null,
        paymentId: row.razorpay_payment_id,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        billingInterval: row.billing_interval,
        planLabel: row.plan_label,
        invoiceUrl: row.invoice_url,
        isTest: row.is_test,
        createdAt: row.created_at,
      };
    });

    return NextResponse.json({
      invoices,
      total: count || 0,
      stats: {
        totalInvoices: (realRows || []).length,
        totalRevenue: (realRows || []).reduce((sum, r) => sum + (r.amount || 0), 0),
      },
    });
  } catch (error) {
    console.error("ADMIN_INVOICES_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
