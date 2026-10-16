import { describe, it, expect, vi, beforeEach } from "vitest";

// The Invoicing cards: refunded payments and ones an admin excluded aren't revenue
// or sales, and each currency's card reports what was refunded.

let tables;
vi.mock("@/lib/admin", () => ({ assertSuperAdmin: vi.fn(async () => true) }));
vi.mock("@/lib/admin-data", () => ({
  parseAudience: () => "all",
  getAudience: async () => ({ audience: "all", internalIds: [] }),
  filterToAudience: (query) => query,
  fetchAllRows: async (build) => (await build()).data,
}));
// A query that honours eq / in (the filters these numbers depend on) and ignores the rest
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table) => {
      const filters = [];
      const query = {
        select: () => query,
        eq: (col, val) => (filters.push((row) => row[col] === val), query),
        in: (col, vals) => (filters.push((row) => vals.includes(row[col])), query),
        or: () => query,
        gte: () => query,
        lt: () => query,
        then: (resolve) => resolve({ data: tables[table].filter((row) => filters.every((f) => f(row))), error: null }),
      };
      return query;
    },
  },
}));

const { GET } = await import("./route.js");
const at = new Date().toISOString();
const invoice = (overrides) => ({ amount: 100000, currency: "INR", created_at: at, status: "paid", excluded: false, is_test: false, ...overrides });
const sale = (overrides) => ({ amount: 49, currency: "USD", created_at: at, status: "paid", excluded: false, is_test: false, source: null, ...overrides });

beforeEach(() => {
  tables = {
    invoices: [invoice(), invoice({ amount: 159000, status: "refunded" }), invoice({ amount: 50000, excluded: true }), invoice({ amount: 999900, is_test: true })],
    template_purchases: [sale(), sale({ amount: 59, status: "refunded" }), sale({ amount: 79, excluded: true })],
  };
});

describe("invoicing cards", () => {
  it("count paid, real, included payments only, and report refunds per currency", async () => {
    const { kpis } = await (await GET(new Request("http://localhost/api/admin/invoices/stats"))).json();
    expect(kpis.inr.subscriptions).toBe(1000);
    expect(kpis.inr.refunded).toBe(1590);
    expect(kpis.usd.templates).toBe(49);
    expect(kpis.usd.refunded).toBe(59);
    expect(kpis.subscriptions.value).toBe(1);
    expect(kpis.templateSales.value).toBe(1);
  });
});
