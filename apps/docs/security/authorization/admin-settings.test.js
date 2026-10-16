import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// The admin Settings tab (super admins): install-limit enforcement and the extra internal
// emails / domains, saved in app_settings instead of code or environment variables.
// Real routes and libs against the in-memory Supabase / Clerk fakes.

let superAdmin = true;
vi.mock("@/lib/supabase", async () => {
  const harness = await import("../helpers/route-harness.js");
  return { supabase: harness.db, fetchAllRows: async (build) => (await build()).data || [] };
});
vi.mock("@clerk/nextjs/server", async () => (await import("../helpers/route-harness.js")).clerkModule);
vi.mock("@/lib/admin", async (importOriginal) => ({ ...(await importOriginal()), assertSuperAdmin: vi.fn(async () => superAdmin) }));

const { db, clerk, makeUser, makeRequest, readJson } = await import("../helpers/route-harness.js");
const { GET, POST } = await import("@/app/api/admin/settings/route.js");
const { clearAppSettingsCache, isInstallLimitEnforced, getInternalLists } = await import("@/lib/app-settings");
const { internalReason } = await import("@/lib/admin-data");

const save = (key, value) => POST(makeRequest("/api/admin/settings", { method: "POST", body: { key, value } }));
const ENV = process.env.INSTALL_LIMIT_ENFORCE;

beforeEach(() => {
  superAdmin = true;
  clearAppSettingsCache();
  delete process.env.INSTALL_LIMIT_ENFORCE;
  clerk.reset({ user_admin: makeUser("user_admin", { role: "super_admin" }) });
  clerk.signIn("user_admin");
  db.reset({ app_settings: [], admin_audit_log: [] });
});
afterEach(() => {
  if (ENV === undefined) delete process.env.INSTALL_LIMIT_ENFORCE;
  else process.env.INSTALL_LIMIT_ENFORCE = ENV;
});

describe("install-limit enforcement", () => {
  it("with nothing saved, the environment variable decides", async () => {
    expect(await isInstallLimitEnforced()).toBe(false);
    process.env.INSTALL_LIMIT_ENFORCE = "true";
    expect(await isInstallLimitEnforced()).toBe(true);
    expect((await readJson(await GET())).installLimit).toMatchObject({ enforced: true, source: "environment" });
  });

  it("a saved setting wins over the environment, and is logged", async () => {
    process.env.INSTALL_LIMIT_ENFORCE = "true";
    expect((await save("install_limit_enforced", false)).status).toBe(200);
    expect(await isInstallLimitEnforced()).toBe(false);
    expect(db.rows("admin_audit_log")[0]).toMatchObject({ action: "settings.update", actor_clerk_user_id: "user_admin" });
    await save("install_limit_enforced", true);
    expect(await isInstallLimitEnforced()).toBe(true);
  });

  it("a failed read keeps the last values instead of falling back to the environment", async () => {
    process.env.INSTALL_LIMIT_ENFORCE = "false";
    await save("install_limit_enforced", true);
    expect(await isInstallLimitEnforced()).toBe(true);
    // the cache expires and the next read fails
    vi.useFakeTimers({ now: Date.now() + 60_000 });
    try {
      db.failNext();
      expect(await isInstallLimitEnforced()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("only a super admin can change it, and only to true / false", async () => {
    expect((await save("install_limit_enforced", "yes")).status).toBe(400);
    superAdmin = false;
    expect((await save("install_limit_enforced", true)).status).toBe(403);
    expect(db.rows("app_settings")).toEqual([]);
  });
});

describe("internal emails and domains", () => {
  const user = (email) => ({ id: "u", publicMetadata: {}, emailAddresses: [{ emailAddress: email }] });

  it("saved lists make accounts internal", async () => {
    expect(internalReason(user("qa@agency.test"), await getInternalLists())).toBeNull();
    await save("internal_emails", ["QA@agency.test "]);
    await save("internal_domains", ["studio.test"]);
    const lists = await getInternalLists();
    expect(lists).toEqual({ emails: ["qa@agency.test"], domains: ["studio.test"] });
    expect(internalReason(user("qa@agency.test"), lists)).toBe("email");
    expect(internalReason(user("anyone@studio.test"), lists)).toBe("domain");
    expect(internalReason(user("customer@gmail.com"), lists)).toBeNull();
  });

  it("rejects things that aren't emails or domains", async () => {
    expect((await save("internal_emails", ["not-an-email"])).status).toBe(400);
    expect((await save("internal_domains", ["bad domain"])).status).toBe(400);
    expect((await save("something_else", true)).status).toBe(400);
  });
});
