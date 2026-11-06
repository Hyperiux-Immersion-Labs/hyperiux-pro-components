import { describe, it, expect, vi, beforeEach } from "vitest";

const get = vi.fn();
const update = vi.fn();
const create = vi.fn();
const listSegments = vi.fn();
const addSegment = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn(function Resend() {
    this.contacts = { get, update, create, segments: { list: listSegments, add: addSegment } };
  }),
}));

process.env.EMAIL_UNSUBSCRIBE_SECRET = "test-secret";
process.env.NEXT_PUBLIC_APP_URL = "https://vault.example.com";

const { unsubscribeUrl, verifyUnsubscribeToken } = await import("@/lib/email-unsubscribe");
const { GET, POST } = await import("./route.js");

const link = unsubscribeUrl("Me@Studio.com");
const token = new URL(link).searchParams.get("t");

describe("campaign unsubscribe links", () => {
  beforeEach(() => {
    for (const fn of [get, update, create, listSegments, addSegment]) fn.mockReset();
    get.mockResolvedValue({ data: { unsubscribed: false }, error: null });
    update.mockResolvedValue({ error: null });
    listSegments.mockResolvedValue({ data: { data: [{ id: "d2ba4cd4-0112-430f-94e1-38b170d1b9b3" }] }, error: null });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("signs links per address, case-insensitively, and rejects tampered ones", () => {
    expect(link.startsWith("https://vault.example.com/api/email/unsubscribe?e=me%40studio.com&t=")).toBe(true);
    expect(verifyUnsubscribeToken("me@studio.com", token)).toBe(true);
    expect(verifyUnsubscribeToken("someone@else.com", token)).toBe(false);
    expect(verifyUnsubscribeToken("me@studio.com", `${token.slice(0, -1)}x`)).toBe(false);
    expect(verifyUnsubscribeToken("me@studio.com", undefined)).toBe(false);
  });

  it("opening the link only shows a confirm button (mail scanners open links)", async () => {
    const res = await GET(new Request(link));
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('<form method="post">');
    expect(update).not.toHaveBeenCalled();
  });

  it("the confirm button and one-click unsubscribe turn product updates off", async () => {
    const form = new FormData();
    form.set("e", "me@studio.com");
    form.set("t", token);
    expect((await POST(new Request("https://vault.example.com/api/email/unsubscribe", { method: "POST", body: form }))).status).toBe(200);
    expect(update).toHaveBeenLastCalledWith({ email: "me@studio.com", unsubscribed: true });

    // Gmail's one-click: the link's own query string, body "List-Unsubscribe=One-Click"
    expect((await POST(new Request(link, { method: "POST", body: "List-Unsubscribe=One-Click" }))).status).toBe(200);
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("refuses a bad token without touching the contact", async () => {
    const bad = link.replace(/t=[^&]+/, "t=nope");
    expect((await GET(new Request(bad))).status).toBe(400);
    expect((await POST(new Request(bad, { method: "POST" }))).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });
});
