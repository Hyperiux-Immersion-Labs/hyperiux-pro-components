import { describe, it, expect, vi, beforeEach } from "vitest";

// Admin management actions added for the Users and Invoicing tabs: marking an
// account internal, and leaving a payment out of revenue. Super admins only.
// Runs the real routes against the in-memory Supabase / Clerk fakes.

let superAdmin = true;
vi.mock("@/lib/supabase", async () => ({ supabase: (await import("../helpers/route-harness.js")).db }));
vi.mock("@clerk/nextjs/server", async () => (await import("../helpers/route-harness.js")).clerkModule);
// \`superAdmin\` stands for the owner (every permission); false: no admin access at all
vi.mock("@/lib/admin", async (importOriginal) => {
  const actual = await importOriginal();
  const { PERMISSION_KEYS } = await import("@/lib/admin-permissions");
  const owner = () => (superAdmin ? { userId: "user_super", owner: true, admin: true, permissions: new Set(PERMISSION_KEYS), roles: [], grant: [], revoke: [] } : null);
  return {
    ...actual,
    assertSuperAdmin: vi.fn(async () => superAdmin),
    requireOwner: vi.fn(async () => owner()),
    requireAdminAccess: vi.fn(async () => owner()),
    requirePermission: vi.fn(async () => owner()),
  };
});

const { db, clerk, makeUser, makeRequest, readJson } = await import("../helpers/route-harness.js");
const { POST: updateInternal } = await import("@/app/api/admin/users/update-internal/route.js");
const { POST: exclude } = await import("@/app/api/admin/payments/exclude/route.js");
const { isInternalUser, internalReason } = await import("@/lib/admin-data");

const post = (handler, body) => handler(makeRequest("/x", { method: "POST", body }));

beforeEach(() => {
  superAdmin = true;
  clerk.reset({
    user_test: makeUser("user_test", { email: "tester@example.test" }),
    user_admin: makeUser("user_admin", { role: "none", admin: { roles: ["support"], grant: [], revoke: [] } }),
  });
  db.reset({
    invoices: [{ id: "inv-1", clerk_user_id: "user_test", razorpay_payment_id: "pay_1", status: "paid", excluded: false }],
    template_purchases: [{ id: "tp-1", clerk_user_id: "user_test", razorpay_payment_id: "pay_2", status: "paid", excluded: false }],
  });
});

describe("mark an account internal", () => {
  it("only a super admin can", async () => {
    superAdmin = false;
    expect((await post(updateInternal, { clerkUserId: "user_test", internal: true })).status).toBe(403);
    expect(isInternalUser(clerk.users.user_test)).toBe(false);
  });

  it("marks and unmarks, and says why", async () => {
    const marked = await readJson(await post(updateInternal, { clerkUserId: "user_test", internal: true }));
    expect(marked.internal).toBe("marked");
    expect(internalReason(clerk.users.user_test)).toBe("marked");

    const unmarked = await readJson(await post(updateInternal, { clerkUserId: "user_test", internal: false }));
    expect(unmarked.internal).toBeNull();
    expect(isInternalUser(clerk.users.user_test)).toBe(false);
  });

  it("an admin stays internal whatever the flag says", async () => {
    const json = await readJson(await post(updateInternal, { clerkUserId: "user_admin", internal: false }));
    expect(json.internal).toBe("role");
  });

  it("rejects a malformed request", async () => {
    expect((await post(updateInternal, { clerkUserId: "user_test", internal: "yes" })).status).toBe(400);
  });
});

describe("exclude a payment from revenue", () => {
  it("only a super admin can", async () => {
    superAdmin = false;
    expect((await post(exclude, { kind: "subscription", id: "inv-1", excluded: true })).status).toBe(403);
    expect(db.rows("invoices")[0].excluded).toBe(false);
  });

  it("excludes and includes subscription and template payments", async () => {
    expect((await readJson(await post(exclude, { kind: "subscription", id: "inv-1", excluded: true }))).excluded).toBe(true);
    expect(db.rows("invoices")[0].excluded).toBe(true);
    await post(exclude, { kind: "template", id: "tp-1", excluded: true });
    expect(db.rows("template_purchases")[0].excluded).toBe(true);
    await post(exclude, { kind: "subscription", id: "inv-1", excluded: false });
    expect(db.rows("invoices")[0].excluded).toBe(false);
  });

  it("only touches the two payment tables, and only a row that exists", async () => {
    expect((await post(exclude, { kind: "subscriptions_table", id: "inv-1", excluded: true })).status).toBe(400);
    expect((await post(exclude, { kind: "subscription", id: "nope", excluded: true })).status).toBe(404);
  });
});
