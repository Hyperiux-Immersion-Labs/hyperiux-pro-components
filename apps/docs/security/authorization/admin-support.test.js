import { describe, it, expect, vi, beforeEach } from "vitest";

// The Manage drawer's Support actions (super admins): template credits, giving a
// template, extra installs for today, notes - each in the admin audit log. Real routes
// against the in-memory Supabase / Clerk fakes.

let superAdmin = true;
let redeemResult = { status: "redeemed", balance: 0 };
vi.mock("@/lib/supabase", async () => {
  const harness = await import("../helpers/route-harness.js");
  return { supabase: harness.db, fetchAllRows: async (build) => (await build()).data || [] };
});
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
vi.mock("@/lib/template-credits", async (importOriginal) => ({
  ...(await importOriginal()),
  redeemTemplateCredit: vi.fn(async () => redeemResult),
}));

const { db, clerk, makeUser, makeRequest, readJson } = await import("../helpers/route-harness.js");
const { POST: credits } = await import("@/app/api/admin/users/credits/route.js");
const { POST: giveTemplate } = await import("@/app/api/admin/users/give-template/route.js");
const { POST: installBonus } = await import("@/app/api/admin/users/install-bonus/route.js");
const { POST: notes } = await import("@/app/api/admin/users/notes/route.js");
const { installBonusToday, todayUTC } = await import("@/lib/install-limit");

const post = (handler, body) => handler(makeRequest("/x", { method: "POST", body }));
const balance = () => db.rows("template_credits").filter((r) => r.clerk_user_id === "user_c").reduce((sum, r) => sum + r.delta, 0);
const audit = () => db.rows("admin_audit_log");

beforeEach(() => {
  superAdmin = true;
  redeemResult = { status: "redeemed", balance: 0 };
  clerk.reset({ user_admin: makeUser("user_admin", { role: "super_admin" }), user_c: makeUser("user_c") });
  clerk.signIn("user_admin");
  db.reset({ template_credits: [{ clerk_user_id: "user_c", delta: 2, reason: "grant" }], admin_audit_log: [] });
});

describe("template credits", () => {
  it("only a super admin can change them", async () => {
    superAdmin = false;
    expect((await post(credits, { clerkUserId: "user_c", delta: 1, reason: "goodwill" })).status).toBe(403);
    expect(balance()).toBe(2);
  });

  it("adds and removes, with the reason in the log", async () => {
    expect((await readJson(await post(credits, { clerkUserId: "user_c", delta: 3, reason: "goodwill" }))).credits).toBe(5);
    expect((await readJson(await post(credits, { clerkUserId: "user_c", delta: -1, reason: "mistake" }))).credits).toBe(4);
    expect(balance()).toBe(4);
    expect(audit().map((row) => [row.action, row.details.delta, row.details.reason])).toEqual([
      ["credits.adjust", 3, "goodwill"],
      ["credits.adjust", -1, "mistake"],
    ]);
  });

  it("never takes the balance below zero, and needs a reason", async () => {
    expect((await post(credits, { clerkUserId: "user_c", delta: -3, reason: "x" })).status).toBe(400);
    expect((await post(credits, { clerkUserId: "user_c", delta: 1, reason: "  " })).status).toBe(400);
    expect((await post(credits, { clerkUserId: "user_c", delta: 50, reason: "x" })).status).toBe(400);
    expect(balance()).toBe(2);
  });
});

describe("give a template", () => {
  it("adds a credit and redeems it for them", async () => {
    expect((await post(giveTemplate, { clerkUserId: "user_c", templateSlug: "lumera", reason: "launch partner" })).status).toBe(200);
    expect(audit()[0]).toMatchObject({ action: "template.give", target_clerk_user_id: "user_c" });
  });

  it("already owned: the added credit is taken back", async () => {
    redeemResult = { status: "already-owned", balance: 3 };
    expect((await post(giveTemplate, { clerkUserId: "user_c", templateSlug: "lumera", reason: "x" })).status).toBe(400);
    expect(balance()).toBe(2);
    expect(audit()).toEqual([]);
  });

  it("only templates in the catalogue", async () => {
    expect((await post(giveTemplate, { clerkUserId: "user_c", templateSlug: "nope", reason: "x" })).status).toBe(400);
  });
});

describe("extra installs today", () => {
  it("raises today's limit only, and can be taken away", async () => {
    await post(installBonus, { clerkUserId: "user_c", extra: 3 });
    expect(clerk.users.user_c.privateMetadata.installBonus).toEqual({ date: todayUTC(), extra: 3 });
    expect(installBonusToday(clerk.users.user_c)).toBe(3);
    expect(installBonusToday({ privateMetadata: { installBonus: { date: "2000-01-01", extra: 3 } } })).toBe(0);
    await post(installBonus, { clerkUserId: "user_c", extra: 0 });
    expect(installBonusToday(clerk.users.user_c)).toBe(0);
    expect(audit().map((row) => row.action)).toEqual(["installs.bonus", "installs.bonus"]);
  });

  it("rejects out-of-range values", async () => {
    expect((await post(installBonus, { clerkUserId: "user_c", extra: 99 })).status).toBe(400);
  });
});

describe("notes", () => {
  it("saved in the audit log with the author", async () => {
    expect((await post(notes, { clerkUserId: "user_c", body: "Asked about agency licensing" })).status).toBe(200);
    expect(audit()[0]).toMatchObject({ action: "note.add", actor_clerk_user_id: "user_admin", target_clerk_user_id: "user_c" });
    expect(audit()[0].details.body).toBe("Asked about agency licensing");
  });

  it("reports a failure instead of losing the note", async () => {
    clerk.signOut();
    expect((await post(notes, { clerkUserId: "user_c", body: "hello" })).status).toBe(500);
  });
});
