import { describe, it, expect, vi, afterEach } from "vitest";

// Who is an admin and what they may do (ADMIN_ROLES_PLAN.md): the owner (one super admin)
// has every permission; other admins have their roles' permissions plus single grants,
// minus single removals; an old role "admin" with no roles gives nothing (Legacy admin is gone).

vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({}));
vi.mock("@/lib/supabase", () => ({ supabase: {} }));
vi.mock("@/lib/admin-roles", async () => {
  const { PRESET_ROLES } = await import("@/lib/admin-permissions");
  return { getRolesById: async () => new Map(PRESET_ROLES.map((role) => [role.id, role.permissions])) };
});

const { getAdminAccess, getRole, isOwnerUser, REVOKED_ROLE, ROLES } = await import("./admin.js");
const { PERMISSION_KEYS, effectivePermissions } = await import("./admin-permissions.js");

const user = (publicMetadata = {}, email = "someone@example.com") => ({ id: "u1", publicMetadata, emailAddresses: [{ emailAddress: email }] });
const sorted = (set) => [...set].sort();

afterEach(() => {
  delete process.env.ADMIN_EMAIL;
});

describe("getRole", () => {
  it("reads the owner and admins from metadata", () => {
    expect(getRole(user({ role: ROLES.SUPER_ADMIN }))).toBe(ROLES.SUPER_ADMIN);
    // an old role "admin" with no roles is no longer an admin (Legacy admin is gone)
    expect(getRole(user({ role: ROLES.ADMIN }))).toBe(null);
    expect(getRole(user({ role: REVOKED_ROLE, admin: { roles: ["support"] } }))).toBe(ROLES.ADMIN);
    expect(getRole(user({ admin: { roles: [], grant: ["log.view"] } }))).toBe(ROLES.ADMIN);
    expect(getRole(user({}))).toBe(null);
    expect(getRole(user({ role: REVOKED_ROLE, admin: { roles: [], grant: [], revoke: ["log.view"] } }))).toBe(null);
  });

  it("makes the ADMIN_EMAIL account the owner when it has no role of its own", () => {
    process.env.ADMIN_EMAIL = "boss@example.com";
    expect(isOwnerUser(user({}, "boss@example.com"))).toBe(true);
    // any role of its own means it isn't the ADMIN_EMAIL owner
    expect(getRole(user({ role: ROLES.ADMIN }, "boss@example.com"))).toBe(null);
    expect(getRole(user({ role: REVOKED_ROLE, admin: { roles: ["support"] } }, "boss@example.com"))).toBe(ROLES.ADMIN);
    expect(getRole(user({ role: REVOKED_ROLE }, "boss@example.com"))).toBe(null);
  });

  it("only reads publicMetadata", () => {
    expect(getRole({ ...user({}), unsafeMetadata: { role: ROLES.SUPER_ADMIN, admin: { roles: ["support"] } } })).toBe(null);
  });
});

describe("getAdminAccess", () => {
  it("gives the owner every permission", async () => {
    const access = await getAdminAccess(user({ role: ROLES.SUPER_ADMIN }));
    expect(access.owner).toBe(true);
    expect(sorted(access.permissions)).toEqual(sorted(PERMISSION_KEYS));
  });

  it("gives nothing to an old role \"admin\" with no roles (Legacy admin is gone)", async () => {
    const access = await getAdminAccess(user({ role: ROLES.ADMIN }));
    expect(access.admin).toBe(false);
    expect(access.permissions.size).toBe(0);
  });

  it("gives System Admin its permissions, without Effect health", async () => {
    const access = await getAdminAccess(user({ role: REVOKED_ROLE, admin: { roles: ["system-admin"], grant: [], revoke: [] } }));
    expect(sorted(access.permissions)).toEqual(["emails.view", "log.view", "settings.manage", "users.create", "users.reset"]);
  });

  it("combines several roles, adds grants and removes revokes", async () => {
    const access = await getAdminAccess(user({ role: REVOKED_ROLE, admin: { roles: ["support", "user-management"], grant: ["finance.view"], revoke: ["users.export"] } }));
    expect(access.permissions.has("users.support")).toBe(true);
    expect(access.permissions.has("users.plan")).toBe(true);
    expect(access.permissions.has("finance.view")).toBe(true);
    expect(access.permissions.has("finance.manage")).toBe(false);
    expect(access.permissions.has("users.export")).toBe(false);
  });

  it("gives nothing to an account without access", async () => {
    const access = await getAdminAccess(user({}));
    expect(access.admin).toBe(false);
    expect(access.permissions.size).toBe(0);
  });
});

describe("effectivePermissions", () => {
  it("gives Effect health to whoever can refresh effect pages, and to nobody else", () => {
    expect(effectivePermissions({ grant: ["effects.manage"] }).has("effects.view")).toBe(true);
    expect(effectivePermissions({ grant: ["users.support"] }).has("effects.view")).toBe(false);
  });

  it("ignores unknown roles and permission keys", () => {
    const set = effectivePermissions({ roles: ["nope"], grant: ["made.up", "log.view"], rolesById: new Map([["nope", ["also.made.up"]]]) });
    expect([...set]).toEqual(["log.view"]);
  });
});
