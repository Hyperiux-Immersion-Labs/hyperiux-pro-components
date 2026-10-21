import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PERMISSIONS, PERMISSION_KEYS, PRESET_ROLES, describeAccess, effectivePermissions } from "./admin-permissions.js";

// "Your access" (the admin view's shield chip) lists what an admin can do. Each line has to
// be true: these check the list for every built-in role, and that every permission it can
// name is enforced by an admin API route, not only hidden on screen.

const rolesById = new Map(PRESET_ROLES.map((role) => [role.id, role.permissions]));
const accessFor = (id) => {
  const role = PRESET_ROLES.find((preset) => preset.id === id);
  return describeAccess({ roleNames: [role.name], permissions: [...effectivePermissions({ roles: [id], rolesById })] });
};

describe("describeAccess", () => {
  it("lists what Support can do", () => {
    expect(accessFor("support")).toEqual({
      title: "Support admin",
      roles: ["Support"],
      abilities: [
        "See Activity and Users",
        "Add or remove template credits, give a template free, allow extra installs for today and write team notes",
        "Send password reset emails",
        "Suspend and restore customer accounts",
      ],
    });
  });

  it("lists what User Management can do", () => {
    expect(accessFor("user-management")).toEqual({
      title: "User Management admin",
      roles: ["User Management"],
      abilities: [
        "See Activity and Users",
        "Download the users list as a CSV",
        "Invite people from the waitlist",
        "Create accounts and send their sign-in details",
        "Give or remove Pro and Pro+",
        "Send password reset emails",
        "Suspend and restore customer accounts",
        "Mark an account internal or count it as a customer",
        "See the Email log: every email Vault sent and whether it went out",
      ],
    });
  });

  it("lists what System Admin can do", () => {
    expect(accessFor("system-admin")).toEqual({
      title: "System Admin",
      roles: ["System Admin"],
      abilities: [
        "See Activity and Users",
        "Create accounts and send their sign-in details",
        "Send password reset emails",
        "See the Email log: every email Vault sent and whether it went out",
        "See every change made in the admin dashboard",
        "Change install limits and the internal emails and domains",
      ],
    });
  });

  it("gives the Email log only to User Management and System Admin of the built-in roles", () => {
    const withLog = PRESET_ROLES.filter((role) => effectivePermissions({ roles: [role.id], rolesById }).has("emails.view")).map((role) => role.id);
    expect(withLog).toEqual(["user-management", "system-admin"]);
  });

  it("has exactly three built-in roles", () => {
    expect(PRESET_ROLES.map((role) => role.id)).toEqual(["support", "user-management", "system-admin"]);
  });

  it("lists everything for a super admin, plus roles and access", () => {
    const access = describeAccess({ owner: true });
    expect(access.title).toBe("Super Admin");
    expect(access.abilities).toHaveLength(PERMISSION_KEYS.length + 2);
    expect(access.abilities.at(-1)).toBe("Create roles and decide who has admin access");
  });

  it("says only the basic views for an admin with no permissions, and never mentions finances", () => {
    const access = describeAccess({ roleNames: ["Support", "Custom"], permissions: [] });
    expect(access.title).toBe("Admin");
    expect(access.abilities).toEqual(["See Activity and Users"]);
    expect(JSON.stringify(access)).not.toMatch(/hidden|super admin changes/i);
  });

  it("has a sentence for every permission", () => {
    for (const key of PERMISSION_KEYS) expect(PERMISSIONS[key].does, key).toMatch(/^[A-Z]/);
  });
});

// Every route file under src/app/api/admin (not tests)
function routeFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return routeFiles(path);
    return name === "route.js" ? [path] : [];
  });
}

describe("every permission in the list is enforced by the server", () => {
  const sources = routeFiles(join(process.cwd(), "src/app/api/admin")).map((file) => readFileSync(file, "utf8"));
  it.each(PERMISSION_KEYS)("%s is checked by an admin API route", (key) => {
    const checked = sources.some((source) => source.includes(`requirePermission("${key}")`) || source.includes(`can(access, "${key}")`));
    expect(checked).toBe(true);
  });
});
