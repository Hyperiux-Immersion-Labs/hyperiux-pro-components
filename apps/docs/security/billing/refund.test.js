import { describe, it, expect, vi, beforeEach } from "vitest";

// Refunds on the Razorpay webhook: a full refund of a subscription charge ends
// the plan and cancels the subscription so it never charges again; a partial
// refund changes nothing; a template purchase refund stops its download. Runs
// the real webhook route, pro-access and subscription-events against the
// in-memory Supabase / Clerk fakes, with Razorpay's API mocked.

let live; // Razorpay's current records
const cancel = vi.fn(async (id) => {
  live.subscriptions[id] = { ...live.subscriptions[id], status: "cancelled" };
});
vi.mock("@/lib/supabase", async () => ({ supabase: (await import("../helpers/route-harness.js")).db }));
vi.mock("@clerk/nextjs/server", async () => (await import("../helpers/route-harness.js")).clerkModule);
vi.mock("@/lib/razorpay", () => ({
  razorpay: {
    payments: { fetch: vi.fn(async (id) => live.payments[id]) },
    invoices: { fetch: vi.fn(async (id) => live.invoices[id]) },
    subscriptions: { fetch: vi.fn(async (id) => live.subscriptions[id]), cancel: (...args) => cancel(...args) },
  },
  withRazorpayRetry: (call) => call(),
}));
vi.mock("@/lib/resend", () => ({ sendEmail: vi.fn(async () => ({ id: "email_1" })) }));

const SECRET = "whsec_test_" + "r".repeat(24);
process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;

const { db, clerk, makeUser, makeRequest, signRazorpay } = await import("../helpers/route-harness.js");
const { POST: webhook } = await import("@/app/api/razorpay/webhooks/route.js");

const NOW_S = Math.floor(Date.now() / 1000);
const FUTURE = new Date(Date.now() + 90 * 86400_000).toISOString();

function post(body) {
  const raw = JSON.stringify(body);
  return webhook(makeRequest("/api/razorpay/webhooks", { method: "POST", body: raw, headers: { "x-razorpay-signature": signRazorpay(raw, SECRET) } }));
}

// What Razorpay sends: the refund, and a copy of the payment that can predate it
const refundEvent = (name, { paymentSnapshot = { id: "pay_1", amount: 159000, amount_refunded: 0, refund_status: null, invoice_id: "inv_1" }, refundAmount = 159000 } = {}) => ({
  entity: "event",
  event: name,
  payload: {
    refund: { entity: { id: "rfnd_1", payment_id: "pay_1", amount: refundAmount } },
    ...(paymentSnapshot ? { payment: { entity: paymentSnapshot } } : {}),
  },
  created_at: NOW_S,
});

const subscriptionEvent = (name, status) => ({
  entity: "event",
  event: name,
  payload: { subscription: { entity: { id: "sub_1", status, plan_id: "plan_pro_q", notes: { clerk_user_id: "user_buyer", tier: "pro" } } } },
  created_at: NOW_S,
});

const subRow = () => db.rows("subscriptions").find((r) => r.clerk_user_id === "user_buyer");
const clerkPlan = () => clerk.users.user_buyer.publicMetadata;

beforeEach(() => {
  cancel.mockClear();
  live = {
    payments: { pay_1: { id: "pay_1", amount: 159000, amount_refunded: 159000, refund_status: "full", status: "refunded", invoice_id: "inv_1" } },
    invoices: { inv_1: { id: "inv_1", subscription_id: "sub_1", payment_id: "pay_1" } },
    subscriptions: { sub_1: { id: "sub_1", status: "active", notes: { clerk_user_id: "user_buyer", tier: "pro" } } },
  };
  clerk.reset({ user_buyer: makeUser("user_buyer", { plan: "pro" }) });
  clerk.users.user_buyer.publicMetadata = { plan: "pro", tier: "pro", proAccess: true, razorpaySubscriptionId: "sub_1" };
  db.reset({
    subscriptions: [{ clerk_user_id: "user_buyer", plan: "pro", tier: "pro", status: "active", razorpay_subscription_id: "sub_1", current_period_end: FUTURE }],
    template_purchases: [{ clerk_user_id: "user_buyer", template_slug: "lumera", razorpay_payment_id: "pay_tpl", status: "paid" }],
    invoices: [{ id: "inv-row-1", clerk_user_id: "user_buyer", razorpay_payment_id: "pay_1", status: "paid", amount: 159000, currency: "INR" }],
  });
});

describe("full refund of a subscription charge", () => {
  it("ends the plan even when the event's payment copy predates the refund", async () => {
    const res = await post(refundEvent("refund.created"));
    expect(res.status).toBe(200);
    expect(subRow()).toMatchObject({ plan: "free", status: "refunded" });
    expect(clerkPlan()).toMatchObject({ plan: "free", proAccess: false });
  });

  it("marks the payment refunded in the ledger, so it leaves revenue", async () => {
    await post(refundEvent("refund.created"));
    expect(db.rows("invoices")[0].status).toBe("refunded");
  });

  it("cancels the subscription right away, so it never charges again", async () => {
    await post(refundEvent("refund.created"));
    expect(cancel).toHaveBeenCalledWith("sub_1", false);
    expect(live.subscriptions.sub_1.status).toBe("cancelled");
  });

  it("works from the refund alone when the event carries no payment", async () => {
    await post(refundEvent("refund.processed", { paymentSnapshot: null }));
    expect(subRow()).toMatchObject({ plan: "free", status: "refunded" });
  });

  it("refund.created then refund.processed: applied once, cancelled once", async () => {
    await post(refundEvent("refund.created"));
    await post(refundEvent("refund.processed"));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(subRow()).toMatchObject({ plan: "free", status: "refunded" });
  });

  it("the cancellation's own webhook keeps the row marked refunded", async () => {
    await post(refundEvent("refund.created"));
    await post(subscriptionEvent("subscription.cancelled", "cancelled"));
    expect(subRow()).toMatchObject({ plan: "free", status: "refunded" });
  });

  it("a late 'charged' for the refunded subscription doesn't bring Pro back", async () => {
    await post(refundEvent("refund.created"));
    await post({ ...subscriptionEvent("subscription.charged", "active"), payload: { ...subscriptionEvent("subscription.charged", "active").payload, payment: { entity: { id: "pay_1", amount: 159000 } } } });
    expect(subRow().plan).toBe("free");
  });

  it("still cancels on a retry when the downgrade already went through", async () => {
    db.reset({ subscriptions: [{ clerk_user_id: "user_buyer", plan: "free", status: "refunded", razorpay_subscription_id: "sub_1" }] });
    await post(refundEvent("refund.processed"));
    expect(cancel).toHaveBeenCalledWith("sub_1", false);
  });
});

describe("partial refund", () => {
  it("keeps the plan and the subscription", async () => {
    live.payments.pay_1 = { ...live.payments.pay_1, amount_refunded: 50000, refund_status: "partial", status: "captured" };
    await post(refundEvent("refund.created", { refundAmount: 50000 }));
    expect(subRow()).toMatchObject({ plan: "pro", status: "active" });
    expect(db.rows("invoices")[0].status).toBe("paid");
    expect(cancel).not.toHaveBeenCalled();
  });
});

describe("template purchase refund", () => {
  it("marks the purchase refunded and leaves the plan alone", async () => {
    live.payments.pay_tpl = { id: "pay_tpl", amount: 4900, amount_refunded: 4900, refund_status: "full", status: "refunded" };
    await post(refundEvent("refund.created", { paymentSnapshot: { id: "pay_tpl", amount: 4900, refund_status: null } }));
    expect(db.rows("template_purchases")[0].status).toBe("refunded");
    expect(subRow()).toMatchObject({ plan: "pro", status: "active" });
    expect(cancel).not.toHaveBeenCalled();
  });
});

describe("webhook log", () => {
  const log = () => db.rows("razorpay_webhook_events");

  it("records each delivery and what was done with it", async () => {
    await post(refundEvent("refund.created"));
    expect(log().at(-1)).toMatchObject({ event: "refund.created", outcome: "applied", payment_id: "pay_1", clerk_user_id: "user_buyer" });
    expect(log().at(-1).detail).toMatch(/Full refund/);
  });

  it("a partial refund is logged as skipped, with the reason", async () => {
    live.payments.pay_1 = { ...live.payments.pay_1, amount_refunded: 50000, refund_status: "partial", status: "captured" };
    await post(refundEvent("refund.created", { refundAmount: 50000 }));
    expect(log().at(-1)).toMatchObject({ outcome: "skipped", detail: "Partial refund: access kept" });
  });

  it("a forged delivery is logged as rejected, and changes nothing", async () => {
    const raw = JSON.stringify(refundEvent("refund.created"));
    await webhook(makeRequest("/api/razorpay/webhooks", { method: "POST", body: raw, headers: { "x-razorpay-signature": "forged" } }));
    expect(log().at(-1)).toMatchObject({ outcome: "rejected", detail: "Invalid signature" });
    expect(subRow()).toMatchObject({ plan: "pro", status: "active" });
  });

  it("a handler failure is logged as failed, with the error", async () => {
    Object.defineProperty(live.payments, "pay_1", {
      get() {
        throw new Error("Razorpay is down");
      },
    });
    const res = await post(refundEvent("refund.created"));
    expect(res.status).toBe(500);
    expect(log().at(-1)).toMatchObject({ outcome: "failed", detail: "Refund: Razorpay is down" });
  });
});

