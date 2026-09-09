import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";
import { resolveRangeStart } from "@/lib/admin-activity";

export async function GET(request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const rangeStart = resolveRangeStart(range);
    const rangeStartISO = rangeStart?.toISOString() || null;
    const rangeStartDateString = rangeStart?.toISOString().slice(0, 10) || null;

    let newUsersQuery = supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true });
    if (rangeStartISO) newUsersQuery = newUsersQuery.gte("created_at", rangeStartISO);

    let copiesQuery = supabase
      .from("install_unlocks")
      .select("*", { count: "exact", head: true });
    if (rangeStartDateString) copiesQuery = copiesQuery.gte("usage_date", rangeStartDateString);

    let savesQuery = supabase
      .from("wishlisted_effects")
      .select("*", { count: "exact", head: true });
    if (rangeStartISO) savesQuery = savesQuery.gte("created_at", rangeStartISO);

    const [
      { count: newUsers, error: newUsersError },
      { count: copies, error: copiesError },
      { count: saves, error: savesError },
      // "New Pro users" needs each payer's *first ever* paid invoice date,
      // which a plain count can't give - is_test excluded since those are
      // admin-generated sample bills, not real payers. Bounded to real
      // invoices only, which at this product's current scale is small
      // enough to aggregate in JS rather than needing a SQL-side group-by.
      { data: paidInvoices, error: invoicesError },
    ] = await Promise.all([
      newUsersQuery,
      copiesQuery,
      savesQuery,
      supabase
        .from("invoices")
        .select("clerk_user_id, created_at")
        .eq("status", "paid")
        .eq("is_test", false),
    ]);

    const firstError = newUsersError || copiesError || savesError || invoicesError;
    if (firstError) {
      console.error("ADMIN_USERS_STATS_ERROR:", firstError);
      return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
    }

    const firstPaidAtByUser = new Map();
    for (const row of paidInvoices || []) {
      if (!row.clerk_user_id) continue;
      const existing = firstPaidAtByUser.get(row.clerk_user_id);
      if (!existing || row.created_at < existing) {
        firstPaidAtByUser.set(row.clerk_user_id, row.created_at);
      }
    }

    let newProUsers = 0;
    for (const firstPaidAt of firstPaidAtByUser.values()) {
      if (!rangeStartISO || firstPaidAt >= rangeStartISO) newProUsers += 1;
    }

    return NextResponse.json({
      range,
      newUsers: newUsers || 0,
      newProUsers,
      copies: copies || 0,
      saves: saves || 0,
    });
  } catch (error) {
    console.error("ADMIN_USERS_STATS_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
