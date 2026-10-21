import { describe, it, expect, vi, beforeEach } from "vitest";

// Deleting accounts from the Users tab: super admins only, never themselves or another
// super admin, and each account goes through lib/account-deletion.

let owner = true;
const users = {};
const deleteAccount = vi.fn(async () => ({ ok: true }));
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: "user_me" })),
  clerkClient: vi.fn(async () => ({ users: { getUser: vi.fn(async (id) => { if (!users[id]) throw new Error("404"); return users[id]; }) } })),
}));
vi.mock("@/lib/admin", () => ({
  requireOwner: vi.fn(async () => (owner ? { owner: true } : null)),
  isOwnerUser: (user) => user.publicMetadata?.role === "super_admin",
}));
vi.mock("@/lib/admin-audit", () => ({ recordAdminAction: vi.fn(async () => true) }));
vi.mock("@/lib/admin-data", () => ({ clearClerkUsersCache: vi.fn() }));
vi.mock("@/lib/account-deletion", () => ({ deleteAccount: (...args) => deleteAccount(...args) }));

const { POST } = await import("./route.js");
const post = (body) => POST(new Request("http://localhost/api/admin/users/delete", { method: "POST", body: JSON.stringify(body) }));
const user = (id, role) => ({ id, firstName: id, emailAddresses: [{ emailAddress: `${id}@example.test` }], publicMetadata: role ? { role } : {} });

beforeEach(() => {
  owner = true;
  deleteAccount.mockClear();
  Object.assign(users, { user_a: user("user_a"), user_b: user("user_b"), user_boss: user("user_boss", "super_admin") });
});

describe("POST /api/admin/users/delete", () => {
  it("is for super admins only", async () => {
    owner = false;
    expect((await post({ clerkUserIds: ["user_a"] })).status).toBe(403);
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it("deletes several accounts", async () => {
    const res = await post({ clerkUserIds: ["user_a", "user_b"] });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: ["user_a", "user_b"], failed: [] });
    expect(deleteAccount).toHaveBeenCalledTimes(2);
  });

  it("never deletes your own account", async () => {
    expect((await post({ clerkUserIds: ["user_a", "user_me"] })).status).toBe(400);
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it("skips super admins and says why", async () => {
    const json = await (await post({ clerkUserIds: ["user_a", "user_boss"] })).json();
    expect(json.deleted).toEqual(["user_a"]);
    expect(json.failed).toEqual([{ id: "user_boss", error: "Super admins can't be deleted here." }]);
  });

  it("rejects a malformed request", async () => {
    expect((await post({ clerkUserIds: [] })).status).toBe(400);
    expect((await post({ clerkUserIds: ["not-an-id"] })).status).toBe(400);
  });
});
