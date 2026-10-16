import { describe, it, expect, vi, beforeEach } from "vitest";

// The admin dashboard's billing actions (super admins): refund a payment, cancel a
// subscription now or at period end, and sync an account with Razorpay - each recorded in
// the admin audit log. Real routes against the in-memory Supabase / Clerk fakes, with
// Razorpay's API mocked as a small stateful store.

let superAdmin = true;
let live; // Razorpay's records
const refundCall = vi.fn(async (paymentId, { amount }) => {
  const payment = live.payments[paymentId];
  payment.amount_refunded = (payment.amount_refunded || 0) + amount;
  payment.refund_status = payment.amount_refunded >= payment.amount ? "full" : "partial";
  return { id: `rfnd_${paymentId}`, amount };
});
const cancelCall = vi.fn(async (id, atCycleEnd) => {
  live.subscriptions[id] = { ...live.subscriptions[id], status: atCycleEnd ? "active" : "cancelled", cancelAtCycleEnd: atCycleEnd };
  return live.subscriptions[id];
});

vi.mock("@/lib/supabase", async () => {
  const harness = await import("../helpers/route-harness.js");
  return { supabase: harness.db, fetchAllRows: async (build) => (await build()).data || [] };
});
vi.mock("@clerk/nextjs/server", async () => (await import("../helpers/route-harness.js")).clerkModule);
vi.mock("@/lib/admin", async (importOriginal) => ({ ...(await importOriginal()), assertSuperAdmin: vi.fn(async () => superAdmin) }));
vi.mock("@/lib/razorpay", () => ({
  razorpay: {
    payments: { fetch: vi.fn(async (id) => live.payments[id]), refund: (...args) => refundCall(...args) },
    invoices: { fetch: vi.fn(async (id) => live.invoices[id]) },
    subscriptions: { fetch: vi.fn(async (id) => live.subscriptions[id]), cancel: (...args) => cancelCall(...args) },
  },
  withRazorpayRetry: (call) => call(),
}));
vi.mock("@/lib/resend", () => ({ sendEmail: vi.fn(async () => ({ id: "email_1" })) }));

process.env.RAZORPAY_PLAN_PRO_QUARTERLY_INR = "plan_pro_q_inr";

const { db, clerk, makeUser, makeRequest, readJson } = await import("../helpers/route-harness.js");
const { POST: refund } = await import("@/app/api/admin/payments/refund/route.js");
const { POST: cancel } = await import("@/app/api/admin/users/cancel-subscription/route.js");
const { POST: sync } = await import("@/app/api/admin/users/sync-subscription/route.js");

const NOW_S = Math.floor(Date.now() / 1000);
const FUTURE = new Date((NOW_S + 90 * 86400) * 1000).toISOString();
const post = (handler, body) => handler(makeRequest("/x", { method: "POST", body }));
const row = () => db.rows("subscriptions").find((r) => r.clerk_user_id === "user_buyer");
const audit = () => db.rows("admin_audit_log");

beforeEach(() => {
  superAdmin = true;
  refundCall.mockClear();
  cancelCall.mockClear();
  live = {
    payments: { pay_1: { id: "pay_1", amount: 159000, amount_refunded: 0, refund_status: null, status: "captured", invoice_id: "inv_1", currency: "INR" } },
    invoices: { inv_1: { id: "inv_1", subscription_id: "sub_1" } },
    subscriptions: {
      sub_1: { id: "sub_1", status: "active", plan_id: "plan_pro_q_inr", current_end: NOW_S + 90 * 86400, notes: { clerk_user_id: "user_buyer", tier: "pro" } },
    },
  };
  clerk.reset({ user_admin: makeUser("user_admin", { role: "super_admin" }), user_buyer: makeUser("user_buyer", { plan: "pro" }) });
  clerk.signIn("user_admin");
  db.reset({
    subscriptions: [{ clerk_user_id: "user_buyer", plan: "pro", tier: "pro", status: "active", razorpay_subscription_id: "sub_1", current_period_end: FUTURE }],
    invoices: [{ id: "row-1", clerk_user_id: "user_buyer", razorpay_payment_id: "pay_1", amount: 159000, currency: "INR", status: "paid", excluded: false, is_test: false, created_at: FUTURE }],
    template_purchases: [],
    admin_audit_log: [],
  });
});

describe("refund from the dashboard", () => {
  it("only a super admin can, and nothing reaches Razorpay otherwise", async () => {
    superAdmin = false;
    expect((await post(refund, { paymentId: "pay_1" })).status).toBe(403);
    expect(refundCall).not.toHaveBeenCalled();
  });

  it("refuses a payment that isn't recorded against an account", async () => {
    live.payments.pay_x = { id: "pay_x", amount: 100, status: "captured" };
    expect((await post(refund, { paymentId: "pay_x" })).status).toBe(404);
    expect(refundCall).not.toHaveBeenCalled();
  });

  it("a full refund: asked of Razorpay once, then the plan ends and the subscription is cancelled", async () => {
    const res = await post(refund, { paymentId: "pay_1" });
    expect(res.status).toBe(200);
    expect(refundCall).toHaveBeenCalledTimes(1);
    expect(refundCall.mock.calls[0][1]).toMatchObject({ amount: 159000, speed: "normal" });
    expect(row()).toMatchObject({ plan: "free", status: "refunded" });
    expect(db.rows("invoices")[0].status).toBe("refunded");
    expect(cancelCall).toHaveBeenCalledWith("sub_1", false);
    expect(audit()[0]).toMatchObject({ action: "payment.refund", actor_clerk_user_id: "user_admin", target_clerk_user_id: "user_buyer" });
    expect(audit()[0].details).toMatchObject({ paymentId: "pay_1", amount: 159000, full: true });
  });

  it("a partial refund keeps the plan and the subscription", async () => {
    const json = await readJson(await post(refund, { paymentId: "pay_1", amount: 50000 }));
    expect(json.refunded).toBe(50000);
    expect(row()).toMatchObject({ plan: "pro", status: "active" });
    expect(cancelCall).not.toHaveBeenCalled();
  });

  it("never refunds more than is left, or a payment already fully refunded", async () => {
    expect((await post(refund, { paymentId: "pay_1", amount: 200000 })).status).toBe(400);
    live.payments.pay_1.amount_refunded = 159000;
    expect((await post(refund, { paymentId: "pay_1" })).status).toBe(400);
    expect(refundCall).not.toHaveBeenCalled();
  });

  it("rejects malformed amounts", async () => {
    expect((await post(refund, { paymentId: "pay_1", amount: 12.5 })).status).toBe(400);
    expect((await post(refund, { paymentId: "pay_1", amount: -1 })).status).toBe(400);
  });
});

describe("cancel from the dashboard", () => {
  it("now: cancelled at Razorpay right away and the account moves to Free", async () => {
    expect((await post(cancel, { clerkUserId: "user_buyer", when: "now" })).status).toBe(200);
    expect(cancelCall).toHaveBeenCalledWith("sub_1", false);
    expect(row()).toMatchObject({ plan: "free", status: "cancelled" });
    expect(audit()[0].action).toBe("subscription.cancel_now");
  });

  it("at period end: Pro stays, and the account shows the scheduled cancellation", async () => {
    expect((await post(cancel, { clerkUserId: "user_buyer", when: "period_end" })).status).toBe(200);
    expect(cancelCall).toHaveBeenCalledWith("sub_1", true);
    expect(row()).toMatchObject({ plan: "pro", status: "active" });
    expect(clerk.users.user_buyer.publicMetadata.cancelScheduledFor).toBe("sub_1");
    expect(audit()[0].action).toBe("subscription.cancel_at_period_end");
  });

  it("refuses an ended subscription, or one that belongs to another account", async () => {
    live.subscriptions.sub_1.status = "cancelled";
    expect((await post(cancel, { clerkUserId: "user_buyer", when: "now" })).status).toBe(400);
    live.subscriptions.sub_1 = { ...live.subscriptions.sub_1, status: "active", notes: { clerk_user_id: "someone_else" } };
    expect((await post(cancel, { clerkUserId: "user_buyer", when: "now" })).status).toBe(409);
    expect(cancelCall).not.toHaveBeenCalled();
  });
});

describe("sync with Razorpay", () => {
  it("applies a refund made in the Razorpay dashboard (the case that slipped through)", async () => {
    live.payments.pay_1 = { ...live.payments.pay_1, amount_refunded: 159000, refund_status: "full", status: "refunded" };
    const json = await readJson(await post(sync, { clerkUserId: "user_buyer" }));
    expect(json.changes.length).toBeGreaterThan(0);
    expect(row()).toMatchObject({ plan: "free", status: "refunded" });
    expect(db.rows("invoices")[0].status).toBe("refunded");
    expect(cancelCall).toHaveBeenCalledWith("sub_1", false);
    expect(audit()[0].action).toBe("subscription.sync");
  });

  it("Razorpay ended the subscription but the account still has Pro: moved to Free", async () => {
    live.subscriptions.sub_1.status = "cancelled";
    await post(sync, { clerkUserId: "user_buyer" });
    expect(row()).toMatchObject({ plan: "free", status: "cancelled" });
  });

  it("Razorpay says active but the account is on Free: Pro restored", async () => {
    db.reset({ ...db.store?.tables, subscriptions: [{ clerk_user_id: "user_buyer", plan: "free", status: "inactive", razorpay_subscription_id: "sub_1" }], invoices: [], template_purchases: [], admin_audit_log: [] });
    await post(sync, { clerkUserId: "user_buyer" });
    expect(row()).toMatchObject({ plan: "pro", status: "active" });
  });

  it("a refunded subscription still live at Razorpay is cancelled", async () => {
    db.reset({ subscriptions: [{ clerk_user_id: "user_buyer", plan: "free", status: "refunded", razorpay_subscription_id: "sub_1" }], invoices: [], template_purchases: [], admin_audit_log: [] });
    await post(sync, { clerkUserId: "user_buyer" });
    expect(cancelCall).toHaveBeenCalledWith("sub_1", false);
    expect(row()).toMatchObject({ plan: "free", status: "refunded" });
  });

  it("already in step: no changes, nothing logged", async () => {
    const json = await readJson(await post(sync, { clerkUserId: "user_buyer" }));
    expect(json.changes).toEqual([]);
    expect(audit()).toEqual([]);
    expect(cancelCall).not.toHaveBeenCalled();
  });
});
