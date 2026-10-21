import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { requirePermission } from "@/lib/admin";
import { displayName } from "@/lib/display-name";
import { resolveDateBounds } from "@/lib/admin-activity";
import { WEBHOOK_OUTCOMES } from "@/lib/webhook-log";

// The Razorpay webhook log, newest first: the Log tab's Razorpay events (?outcome= to
// filter) and an account's Billing section (?userId=). Payments and amounts, so super
// admins only.
// The Log tab's per-page choices go up to 200
const MAX_LIMIT = 200;

export async function GET(request) {
  if (!(await requirePermission("finance.view"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const outcome = searchParams.get("outcome");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), MAX_LIMIT);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);
    // The window: ?range= (today / 7d / 30d / 90d / all) or a custom ?from=&to= (YYYY-MM-DD)
    const { startISO, endISO } = resolveDateBounds({
      range: searchParams.get("range") || "all",
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });

    let query = supabase
      .from("razorpay_webhook_events")
      .select("id, received_at, event_id, event, outcome, detail, clerk_user_id, subscription_id, payment_id, amount, currency", { count: "exact" })
      .order("received_at", { ascending: false });
    if (userId) query = query.eq("clerk_user_id", userId);
    if (outcome && WEBHOOK_OUTCOMES[outcome]) query = query.eq("outcome", outcome);
    if (startISO) query = query.gte("received_at", startISO);
    if (endISO) query = query.lt("received_at", endISO);
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    const ids = [...new Set((data || []).map((row) => row.clerk_user_id).filter(Boolean))];
    let users = {};
    if (ids.length) {
      const { data: list } = await (await clerkClient()).users.getUserList({ userId: ids, limit: ids.length });
      users = Object.fromEntries((list || []).map((user) => [user.id, user]));
    }

    return NextResponse.json({
      total: count || 0,
      events: (data || []).map((row) => {
        const user = row.clerk_user_id ? users[row.clerk_user_id] : null;
        return {
          id: row.id,
          at: row.received_at,
          eventId: row.event_id,
          event: row.event,
          outcome: row.outcome,
          detail: row.detail,
          userId: row.clerk_user_id,
          userName: user ? displayName(user) : null,
          userEmail: user?.emailAddresses?.[0]?.emailAddress || null,
          subscriptionId: row.subscription_id,
          paymentId: row.payment_id,
          amount: row.amount,
          currency: row.currency,
        };
      }),
    });
  } catch (error) {
    console.error("ADMIN_WEBHOOK_EVENTS_ERROR:", error);
    return NextResponse.json({ error: "Couldn't load Razorpay events." }, { status: 500 });
  }
}
