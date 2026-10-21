import { describe, it, expect, vi, beforeEach } from "vitest";

// Plan & access in the Manage drawer: a manual grant or move to Free, refused while a
// Razorpay subscription is still billing the account (it would keep charging, and its
// next charge would put Pro back).

let subscriptionRow;
let razorpayStatus;
const upsert = vi.fn(async () => ({ error: null }));

// The route's permission check: the owner's access when allowed (true), null (403) when not
vi.mock("@/lib/admin", () => ({
  requirePermission: vi.fn(async () => (true ? { owner: true, admin: true, permissions: new Set(["finance.view", "finance.manage", "users.plan", "users.create"]) } : null)),
}));
vi.mock("@/lib/admin-audit", () => ({ recordAdminAction: vi.fn(async () => {}) }));
vi.mock("@/lib/resend", () => ({ sendEmail: vi.fn(async () => ({ success: true })) }));
vi.mock("@/lib/emails/pro-unlocked-email", () => ({ renderProUnlockedEmail: () => null, proUnlockedSubject: "", proUnlockedText: () => "" }));
const grantCreditsForAdminGrant = vi.fn(async () => 3);
vi.mock("@/lib/template-credits", () => ({ expireCredits: vi.fn(async () => 0), grantCreditsForAdminGrant }));
vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({ users: { updateUserMetadata: vi.fn(async () => {}), getUser: vi.fn(async () => ({ emailAddresses: [] })) } }),
}));
vi.mock("@/lib/razorpay", () => ({
  withRazorpayRetry: (fn) => fn(),
  razorpay: {
    subscriptions: {
      fetch: vi.fn(async () => {
        if (razorpayStatus instanceof Error) throw razorpayStatus;
        return { status: razorpayStatus };
      }),
    },
  },
}));
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => {
      const query = {
        select: () => query,
        eq: () => query,
        maybeSingle: async () => ({ data: subscriptionRow, error: null }),
        upsert,
      };
      return query;
    },
  },
}));

const { POST } = await import("./route.js");

const post = (body) => POST(new Request("http://test/api/admin/users/update-plan", { method: "POST", body: JSON.stringify(body) }));
const toFree = { clerkUserId: "u_1", plan: "free" };
const grantPro = { clerkUserId: "u_1", plan: "pro", tier: "pro", billingInterval: "yearly" };

beforeEach(() => {
  upsert.mockClear();
  subscriptionRow = null;
  razorpayStatus = "active";
});

describe("POST /api/admin/users/update-plan", () => {
  it("refuses while the Razorpay subscription is billing them", async () => {
    subscriptionRow = { razorpay_subscription_id: "sub_1" };
    for (const status of ["active", "authenticated", "pending", "halted"]) {
      razorpayStatus = status;
      for (const body of [toFree, grantPro]) {
        const res = await post(body);
        expect(res.status).toBe(409);
      }
    }
    expect(upsert).not.toHaveBeenCalled();
  });

  it("changes nothing when Razorpay can't be read", async () => {
    subscriptionRow = { razorpay_subscription_id: "sub_1" };
    razorpayStatus = new Error("timeout");
    const res = await post(toFree);
    expect(res.status).toBe(502);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("uses the saved status when Razorpay doesn't have the subscription (e.g. a live id read with test keys)", async () => {
    const notFound = Object.assign(new Error("not found"), {
      statusCode: 400,
      error: { code: "BAD_REQUEST_ERROR", description: "The id provided does not exist" },
    });

    subscriptionRow = { razorpay_subscription_id: "sub_1", status: "cancelled" };
    razorpayStatus = notFound;
    expect((await post(grantPro)).status).toBe(200);
    expect(upsert).toHaveBeenCalledOnce();

    upsert.mockClear();
    subscriptionRow = { razorpay_subscription_id: "sub_1", status: "active" };
    expect((await post(grantPro)).status).toBe(409);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("goes ahead once the subscription has ended", async () => {
    subscriptionRow = { razorpay_subscription_id: "sub_1" };
    razorpayStatus = "cancelled";
    const res = await post(toFree);
    expect(res.status).toBe(200);
    expect(upsert).toHaveBeenCalledOnce();
  });

  it("grants to an account with no Razorpay subscription, with the plan's credits", async () => {
    const res = await post(grantPro);
    expect(res.status).toBe(200);
    expect(upsert).toHaveBeenCalledOnce();
    expect(grantCreditsForAdminGrant).toHaveBeenCalledWith({ clerkUserId: "u_1", tier: "pro", interval: "yearly" });
    expect(await res.json()).toMatchObject({ creditsAdded: 3, creditsError: null });
  });

  it("keeps the grant and says so when the credits can't be added", async () => {
    grantCreditsForAdminGrant.mockRejectedValueOnce(new Error("db down"));
    const res = await post(grantPro);
    expect(res.status).toBe(200);
    expect((await res.json()).creditsError).toMatch(/couldn't be added/);
  });
});
