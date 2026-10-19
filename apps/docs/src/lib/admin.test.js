import { describe, it, expect, vi, afterEach } from "vitest";

// getRole: an explicit metadata role wins, ADMIN_EMAIL only bootstraps an account that
// has none - and a revoked role ("none") must not fall back to it.

vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({}));

const { getRole, REVOKED_ROLE, ROLES } = await import("./admin.js");

const user = (role, email = "someone@example.com") => ({
  publicMetadata: role === undefined ? {} : { role },
  emailAddresses: [{ emailAddress: email }],
});

afterEach(() => {
  delete process.env.ADMIN_EMAIL;
});

describe("getRole", () => {
  it("reads the metadata role", () => {
    expect(getRole(user(ROLES.ADMIN))).toBe(ROLES.ADMIN);
    expect(getRole(user(ROLES.SUPER_ADMIN))).toBe(ROLES.SUPER_ADMIN);
    expect(getRole(user(undefined))).toBe(null);
  });

  it("makes the ADMIN_EMAIL account a super admin when it has no role", () => {
    process.env.ADMIN_EMAIL = "boss@example.com";
    expect(getRole(user(undefined, "boss@example.com"))).toBe(ROLES.SUPER_ADMIN);
  });

  it("lets a super admin demote or revoke the ADMIN_EMAIL account", () => {
    process.env.ADMIN_EMAIL = "boss@example.com";
    expect(getRole(user(ROLES.ADMIN, "boss@example.com"))).toBe(ROLES.ADMIN);
    expect(getRole(user(REVOKED_ROLE, "boss@example.com"))).toBe(null);
  });
});
