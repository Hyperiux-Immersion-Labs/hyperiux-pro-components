import { describe, it, expect, vi, beforeEach } from "vitest";
import { isOneTimeCodeEmail, redactEmailLogRow } from "@/lib/email-redaction";

let isSuperAdmin = true;
const createUser = vi.fn();
const sendEmail = vi.fn();
const recordAdminAction = vi.fn(async () => true);
const clearClerkUsersCache = vi.fn();

// The route's permission check: the owner's access when allowed (isSuperAdmin), null (403) when not
vi.mock("@/lib/admin", () => ({
  requirePermission: vi.fn(async () => (isSuperAdmin ? { owner: true, admin: true, permissions: new Set(["finance.view", "finance.manage", "users.plan", "users.create"]) } : null)),
}));
vi.mock("@/lib/admin-audit", () => ({ recordAdminAction }));
vi.mock("@/lib/admin-data", () => ({ clearClerkUsersCache }));
vi.mock("@/lib/resend", () => ({ sendEmail }));
vi.mock("@clerk/nextjs/server", () => ({ clerkClient: async () => ({ users: { createUser } }) }));

const { POST } = await import("./route.js");

const post = (body) => POST(new Request("http://test/api/admin/users/create", { method: "POST", body: JSON.stringify(body) }));
const valid = { email: "New.Person@Example.com", password: "correct-horse-9", firstName: "New", sendEmail: false };

beforeEach(() => {
  isSuperAdmin = true;
  createUser.mockReset().mockResolvedValue({ id: "user_new" });
  sendEmail.mockReset().mockResolvedValue({ success: true });
  recordAdminAction.mockClear();
  clearClerkUsersCache.mockClear();
});

describe("POST /api/admin/users/create", () => {
  it("is for super admins only", async () => {
    isSuperAdmin = false;
    expect((await post(valid)).status).toBe(403);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("checks the email, first name and password length", async () => {
    expect((await post({ ...valid, email: "nope" })).status).toBe(400);
    expect((await post({ ...valid, password: "short" })).status).toBe(400);
    expect((await post({ ...valid, firstName: "  " })).status).toBe(400);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("creates the account without emailing when asked not to", async () => {
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ id: "user_new", email: "new.person@example.com", emailed: false });
    expect(createUser).toHaveBeenCalledWith({ emailAddress: ["new.person@example.com"], password: "correct-horse-9", firstName: "New" });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(clearClerkUsersCache).toHaveBeenCalled();
    // The log names the account, never the password
    expect(recordAdminAction).toHaveBeenCalledWith({ action: "user.create", targetClerkUserId: "user_new", details: { email: "new.person@example.com", emailed: false } });
  });

  it("emails the details as an account_credentials email, whose body never reaches the email log", async () => {
    const res = await post({ ...valid, sendEmail: true });
    expect((await res.json()).emailed).toBe(true);

    const message = sendEmail.mock.calls[0][0];
    expect(message.emailType).toBe("account_credentials");
    expect(message.text).toContain("correct-horse-9");
    expect(isOneTimeCodeEmail("account_credentials")).toBe(true);
    const logged = redactEmailLogRow({ email_type: message.emailType, subject: message.subject, html_content: message.html, text_content: message.text });
    expect(JSON.stringify(logged)).not.toContain("correct-horse-9");
  });

  it("keeps the account and says so when the email fails", async () => {
    sendEmail.mockResolvedValue({ success: false, error: "resend down" });
    const res = await post({ ...valid, sendEmail: true });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ emailed: false, emailError: expect.stringContaining("couldn't be sent") });
  });

  it("passes Clerk's reason through (email taken, weak password)", async () => {
    createUser.mockRejectedValue({ status: 422, errors: [{ longMessage: "That email address is taken. Please try another." }] });
    const res = await post(valid);
    expect(res.status).toBe(422);
    expect((await res.json()).error).toMatch(/taken/);
    expect(recordAdminAction).not.toHaveBeenCalled();
  });
});
