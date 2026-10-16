import { describe, it, expect, vi, beforeEach } from "vitest";

// The Invoicing tab's Subscriptions section: MRR from each live subscription's latest
// charge over its months, live subscribers by tier (granted plans apart), recent ends,
// renewals in the next 30 days, and what needs attention.

let tables;
let users;
vi.mock("@/lib/admin", () => ({ assertSuperAdmin: vi.fn(async () => true) }));
vi.mock("@/lib/admin-data", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    currentPlanOf: actual.currentPlanOf,
    parseAudience: () => "all",
    getAudience: async () => ({ audience: "all", internalIds: [], users }),
    filterToAudience: (query) => query,
    fetchAllRows: async (build) => (await build()).data,
  };
});
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table) => {
      const filters = [];
      const query = {
        select: () => query,
        eq: (col, val) => (filters.push((row) => row[col] === val), query),
        neq: (col, val) => (filters.push((row) => row[col] !== val), query),
        then: (resolve) => resolve({ data: tables[table].filter((row) => filters.every((f) => f(row))), error: null }),
      };
      return query;
    },
  },
}));

const { GET } = await import("./route.js");
const DAY = 86_400_000;
const inDays = (n) => new Date(Date.now() + n * DAY).toISOString();
const sub = (id, overrides) => ({ clerk_user_id: id, plan: "pro", tier: "pro", status: "active", billing_interval: "quarterly", current_period_end: inDays(60), razorpay_subscription_id: `sub_${id}`, updated_at: inDays(-40), ...overrides });
const charge = (id, amount, overrides) => ({ razorpay_subscription_id: `sub_${id}`, amount, currency: "INR", status: "paid", is_test: false, excluded: false, created_at: inDays(-10), ...overrides });

beforeEach(() => {
  users = [{ id: "u_cancelling", publicMetadata: { cancelScheduledFor: "sub_u_cancelling" }, emailAddresses: [] }];
  tables = {
    subscriptions: [
      sub("u_quarterly"), // ₹1,590 / 3 months
      sub("u_yearly", { tier: "pro_plus", billing_interval: "yearly", current_period_end: inDays(10) }), // renews soon
      sub("u_granted", { razorpay_subscription_id: null }),
      sub("u_halted", { status: "halted" }),
      sub("u_cancelling"),
      sub("u_refunded", { plan: "free", status: "refunded", updated_at: inDays(-2) }),
      sub("u_old", { plan: "free", status: "cancelled", updated_at: inDays(-90) }),
    ],
    invoices: [
      charge("u_quarterly", 159000, { created_at: inDays(-100) }),
      charge("u_quarterly", 159000),
      charge("u_yearly", 899900),
      charge("u_cancelling", 159000),
      charge("u_refunded", 159000, { status: "refunded" }),
      charge("u_quarterly", 999999, { excluded: true, created_at: inDays(-1) }),
    ],
  };
});

describe("subscription health", () => {
  it("counts MRR, subscribers, recent ends, renewals and what needs attention", async () => {
    const json = await (await GET(new Request("http://localhost/api/admin/subscriptions/health"))).json();
    // quarterly 159000/3 + yearly 899900/12 + cancelling 159000/3 (still live until its end)
    expect(json.mrr).toEqual([{ currency: "INR", amount: Math.round(159000 / 3 + 899900 / 12 + 159000 / 3) }]);
    // the halted one gives no access: not a live subscriber, but listed under attention
    expect(json.active).toEqual({ pro: 2, pro_plus: 1, granted: 1 });
    expect(json.ended30d).toBe(1);
    expect(json.renewals.map((r) => r.userId)).toEqual(["u_yearly"]);
    expect(json.attention.map((r) => [r.userId, r.reason.split(":")[0]])).toEqual(
      expect.arrayContaining([
        ["u_halted", "Payments failed"],
        ["u_cancelling", "Cancelled at period end"],
      ])
    );
  });
});
