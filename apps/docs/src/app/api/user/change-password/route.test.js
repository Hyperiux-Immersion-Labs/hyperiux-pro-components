import { describe, it, expect, vi, beforeEach } from "vitest";

// Settings → Password: wrong current passwords are capped per 15 minutes, social sign-ups
// (no password yet) are sent to the emailed-code flow, and a change signs out every
// other session.

let user;
let passwordOk;
const verifyPassword = vi.fn(async () => {
  if (!passwordOk) throw new Error("incorrect");
});
const updateUser = vi.fn(async () => ({}));
const updateUserMetadata = vi.fn(async () => ({}));
const revokeSession = vi.fn(async () => ({}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: "u_1", sessionId: "sess_this" }),
  clerkClient: async () => ({
    users: { getUser: async () => user, verifyPassword, updateUser, updateUserMetadata },
    sessions: {
      getSessionList: async () => ({ data: [{ id: "sess_this" }, { id: "sess_other" }] }),
      revokeSession,
    },
  }),
}));

const { POST } = await import("./route.js");
const post = (body = { currentPassword: "old-password", newPassword: "new-password-1" }) =>
  POST(new Request("http://test/api/user/change-password", { method: "POST", body: JSON.stringify(body) }));

beforeEach(() => {
  vi.clearAllMocks();
  user = { passwordEnabled: true, privateMetadata: {} };
  passwordOk = true;
});

describe("POST /api/user/change-password", () => {
  it("changes the password and signs out the other sessions only", async () => {
    const res = await post();
    expect(res.status).toBe(200);
    expect(updateUser).toHaveBeenCalledWith("u_1", { password: "new-password-1" });
    expect(revokeSession).toHaveBeenCalledTimes(1);
    expect(revokeSession).toHaveBeenCalledWith("sess_other");
  });

  it("records a wrong current password", async () => {
    passwordOk = false;
    const res = await post();
    expect(res.status).toBe(400);
    expect(updateUserMetadata).toHaveBeenCalledWith("u_1", { privateMetadata: { passwordChangeFailures: [expect.any(Number)] } });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("stops checking after five misses in the window", async () => {
    user.privateMetadata.passwordChangeFailures = Array.from({ length: 5 }, () => Date.now() - 1000);
    const res = await post();
    expect(res.status).toBe(429);
    expect(verifyPassword).not.toHaveBeenCalled();
  });

  it("forgets misses older than the window", async () => {
    user.privateMetadata.passwordChangeFailures = Array.from({ length: 5 }, () => Date.now() - 16 * 60 * 1000);
    const res = await post();
    expect(res.status).toBe(200);
  });

  it("sends an account with no password to the emailed-code flow", async () => {
    user.passwordEnabled = false;
    const res = await post();
    expect(res.status).toBe(400);
    expect(verifyPassword).not.toHaveBeenCalled();
  });
});
