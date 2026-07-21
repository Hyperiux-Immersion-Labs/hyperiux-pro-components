import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(() => Promise.resolve({ userId: "user_1" })),
}));

const createMock = vi.fn();
vi.mock("@/lib/razorpay", () => ({
  razorpay: { subscriptions: { create: (...args) => createMock(...args) } },
}));

const claimMock = vi.fn();
const releaseMock = vi.fn();
vi.mock("@/lib/founding-slots", () => ({
  claimFoundingSlot: (...args) => claimMock(...args),
  releaseFoundingSlot: (...args) => releaseMock(...args),
}));

process.env.RAZORPAY_PRO_YEARLY_PLAN_ID = "plan_yearly_usd";
process.env.RAZORPAY_PRO_FOUNDING_YEARLY_PLAN_ID = "plan_founding_usd";
process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID = "plan_monthly_usd";
process.env.RAZORPAY_KEY_ID = "rzp_test_key";

const { auth } = await import("@clerk/nextjs/server");
const { POST } = await import("./route.js");

function makeRequest(body) {
  return new Request("http://localhost/api/razorpay/create-subscription", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const RESERVED = { id: "res-1", status: "reserved" };
const CONFIRMED = { id: "res-1", status: "confirmed", razorpay_subscription_id: "sub_old" };

describe("POST /api/razorpay/create-subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ userId: "user_1" });
  });

  it("401s when signed out", async () => {
    auth.mockResolvedValue({ userId: null });
    const res = await POST(makeRequest({ plan: "yearly", idempotencyKey: "k1" }));
    expect(res.status).toBe(401);
  });

  it("400s a yearly request with no idempotencyKey", async () => {
    const res = await POST(makeRequest({ plan: "yearly" }));
    expect(res.status).toBe(400);
    expect(claimMock).not.toHaveBeenCalled();
  });

  it("monthly requests never touch the founding-slot claim system", async () => {
    createMock.mockResolvedValue({ id: "sub_1" });
    const res = await POST(makeRequest({ plan: "monthly" }));
    expect(res.status).toBe(200);
    expect(claimMock).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.founding).toBe(false);
  });

  it("a successful claim uses the founding plan_id and marks founding: true", async () => {
    claimMock.mockResolvedValue(RESERVED);
    createMock.mockResolvedValue({ id: "sub_new" });

    const res = await POST(makeRequest({ plan: "yearly", idempotencyKey: "k1" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        plan_id: "plan_founding_usd",
        notes: expect.objectContaining({ founding_reservation_id: "res-1" }),
      })
    );
    expect(body.founding).toBe(true);
  });

  it("a full pool (null claim) falls back to regular yearly pricing, still 200", async () => {
    claimMock.mockResolvedValue(null);
    createMock.mockResolvedValue({ id: "sub_new" });

    const res = await POST(makeRequest({ plan: "yearly", idempotencyKey: "k1" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ plan_id: "plan_yearly_usd" })
    );
    expect(body.founding).toBe(false);
  });

  it("an idempotent replay of an already-confirmed reservation returns the original subscription without calling Razorpay again", async () => {
    claimMock.mockResolvedValue(CONFIRMED);

    const res = await POST(makeRequest({ plan: "yearly", idempotencyKey: "k1" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createMock).not.toHaveBeenCalled();
    expect(body.subscriptionId).toBe("sub_old");
    expect(body.founding).toBe(true);
  });

  it("releases the slot and returns 502 with a specific reason when Razorpay create fails", async () => {
    claimMock.mockResolvedValue(RESERVED);
    createMock.mockRejectedValue(new Error("razorpay down"));
    releaseMock.mockResolvedValue({ id: "res-1", status: "released" });

    const res = await POST(makeRequest({ plan: "yearly", idempotencyKey: "k1" }));
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.reason).toBe("razorpay_error");
    expect(releaseMock).toHaveBeenCalledWith({
      reservationId: "res-1",
      reason: "razorpay_create_failed",
    });
  });
});
