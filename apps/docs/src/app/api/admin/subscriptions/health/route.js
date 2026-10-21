import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requirePermission } from "@/lib/admin";
import { currentPlanOf, fetchAllRows, filterToAudience, getAudience, parseAudience } from "@/lib/admin-data";
import { displayName } from "@/lib/display-name";
import { isCancelScheduled } from "@/lib/subscription-events";

// The Invoicing tab's Subscriptions section (super admins), for one audience:
//   mrr        - monthly recurring revenue per currency: every live paid subscription's
//                latest charge, over the months it covers (never added across currencies)
//   active     - live subscribers by tier; plans given from the dashboard counted apart
//   ended30d   - subscriptions that ended (cancelled, refunded, expired, completed) in the
//                last 30 days
//   renewals   - live subscriptions renewing in the next 30 days, with the expected charge
//   attention  - payments failing (halted / pending), and subscriptions cancelled at
//                period end, which lapse on their end date
const MONTHS = { monthly: 1, quarterly: 3, yearly: 12 };
const ENDED = new Set(["cancelled", "refunded", "expired", "completed"]);
const DAY_MS = 86_400_000;

export async function GET(request) {
  if (!(await requirePermission("finance.view"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const audience = await getAudience(parseAudience(new URL(request.url).searchParams));
    const [rows, invoices] = await Promise.all([
      fetchAllRows(() =>
        filterToAudience(
          supabase
            .from("subscriptions")
            .select("clerk_user_id, plan, tier, status, billing_interval, current_period_end, razorpay_subscription_id, updated_at"),
          audience
        ),
        { orderBy: "clerk_user_id" }
      ),
      // Each subscription's charges: the latest one is what it costs
      fetchAllRows(() =>
        filterToAudience(
          supabase
            .from("invoices")
            .select("razorpay_subscription_id, amount, currency, status, created_at")
            .eq("is_test", false)
            .eq("excluded", false)
            .neq("status", "refunded"),
          audience
        )
      ),
    ]);

    const latestCharge = new Map();
    for (const invoice of invoices) {
      const current = latestCharge.get(invoice.razorpay_subscription_id);
      if (!current || new Date(invoice.created_at) > new Date(current.created_at)) latestCharge.set(invoice.razorpay_subscription_id, invoice);
    }
    const usersById = new Map(audience.users.map((user) => [user.id, user]));
    const person = (id) => {
      const user = usersById.get(id);
      return { userId: id, userName: user ? displayName(user) : null, userEmail: user?.emailAddresses?.[0]?.emailAddress || null };
    };

    const now = Date.now();
    const mrr = {};
    const active = { pro: 0, pro_plus: 0, granted: 0 };
    const renewals = [];
    const attention = [];
    let ended30d = 0;

    for (const row of rows) {
      const plan = currentPlanOf(row);
      const end = row.current_period_end ? new Date(row.current_period_end).getTime() : null;
      const charge = row.razorpay_subscription_id ? latestCharge.get(row.razorpay_subscription_id) : null;

      // Failing payments first: a halted or pending subscription gives no access (so it
      // isn't Pro below), but it's the one to chase
      if (row.razorpay_subscription_id && ["halted", "pending"].includes(row.status)) {
        attention.push({
          ...person(row.clerk_user_id),
          tier: row.tier || "pro",
          billingInterval: row.billing_interval,
          periodEnd: row.current_period_end,
          amount: charge?.amount ?? null,
          currency: charge?.currency ?? null,
          reason: row.status === "halted" ? "Payments failed: halted at Razorpay" : "Payment pending at Razorpay",
        });
        continue;
      }

      if (plan === "free") {
        if (ENDED.has(row.status) && row.updated_at && now - new Date(row.updated_at).getTime() <= 30 * DAY_MS) ended30d += 1;
        continue;
      }
      if (!row.razorpay_subscription_id) {
        active.granted += 1;
        continue;
      }
      active[plan] = (active[plan] || 0) + 1;

      if (charge && MONTHS[row.billing_interval]) {
        mrr[charge.currency] = (mrr[charge.currency] || 0) + charge.amount / MONTHS[row.billing_interval];
      }

      const cancelling = isCancelScheduled(usersById.get(row.clerk_user_id), row.razorpay_subscription_id);
      const item = {
        ...person(row.clerk_user_id),
        tier: plan,
        billingInterval: row.billing_interval,
        periodEnd: row.current_period_end,
        amount: charge?.amount ?? null,
        currency: charge?.currency ?? null,
      };
      if (cancelling) {
        attention.push({ ...item, reason: "Cancelled at period end: lapses on its end date" });
      } else if (end && end >= now && end - now <= 30 * DAY_MS) {
        renewals.push(item);
      }
    }

    renewals.sort((a, b) => new Date(a.periodEnd) - new Date(b.periodEnd));
    attention.sort((a, b) => new Date(a.periodEnd || 0) - new Date(b.periodEnd || 0));

    return NextResponse.json({
      // paise / cents a month, per currency
      mrr: Object.entries(mrr).map(([currency, amount]) => ({ currency, amount: Math.round(amount) })),
      active,
      ended30d,
      renewals,
      attention,
    });
  } catch (error) {
    console.error("ADMIN_SUBSCRIPTION_HEALTH_ERROR:", error);
    return NextResponse.json({ error: "Couldn't load subscriptions." }, { status: 500 });
  }
}
