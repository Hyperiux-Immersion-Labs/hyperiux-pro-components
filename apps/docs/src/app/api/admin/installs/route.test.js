import { describe, it, expect, vi, beforeEach } from "vitest";

// The aggregation logic itself (countBy, topSlugCounts, topDeniedIdentities,
// wouldHaveDeniedRate) was verified against real seeded Supabase data during
// development - this test covers the route's auth gate and response wiring,
// which a real-data check doesn't exercise on its own.

let isAdminResult;
let eventRows;
let queryError;
let clerkUsers;

vi.mock("@/lib/admin", () => ({
  assertAdmin: vi.fn(() => Promise.resolve(isAdminResult)),
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(async () => ({
    users: { getUserList: vi.fn(async () => ({ data: clerkUsers })) },
  })),
}));

vi.mock("@/lib/registry", () => ({
  getEffectMetadata: vi.fn((slug) => ({ title: `Title for ${slug}` })),
}));

vi.mock("@/lib/sanity", () => ({
  getAllSanityEffectEntries: vi.fn(() => Promise.resolve([])),
  buildEffectsFromSanity: vi.fn(() => []),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: eventRows, error: queryError })),
        })),
      })),
    })),
  },
}));

const { GET } = await import("./route.js");

function makeEvent(overrides = {}) {
  return {
    occurred_at: new Date().toISOString(),
    identity_key: "user:test",
    clerk_user_id: "test",
    device_id: null,
    ip_hash: null,
    effect_slug: "dotted-grid",
    effect_tier: "free",
    source: "web",
    plan: "free",
    decision: "allowed",
    reason: "allowed",
    enforced: false,
    would_have_denied: false,
    ...overrides,
  };
}

describe("admin/installs route", () => {
  beforeEach(() => {
    isAdminResult = false;
    eventRows = [];
    queryError = null;
    clerkUsers = [];
  });

  it("403s for a non-admin", async () => {
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("500s when the query errors, without throwing", async () => {
    isAdminResult = true;
    queryError = new Error("connection reset");

    const res = await GET();
    expect(res.status).toBe(500);
  });

  it("returns zeroed stats with no events, not an error", async () => {
    isAdminResult = true;
    eventRows = [];

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.stats.totalEvents).toBe(0);
    expect(body.stats.wouldHaveDeniedRate).toBe(0);
  });

  it("computes correct stats for a mix of allowed/already-unlocked/denied events", async () => {
    isAdminResult = true;
    eventRows = [
      makeEvent({ decision: "allowed" }),
      makeEvent({ decision: "already-unlocked" }),
      makeEvent({
        identity_key: "device:ci-runner",
        device_id: "ci-runner",
        source: "cli",
        plan: "anonymous",
        decision: "denied",
        would_have_denied: true,
        effect_slug: "a",
      }),
      makeEvent({
        identity_key: "device:ci-runner",
        device_id: "ci-runner",
        source: "cli",
        plan: "anonymous",
        decision: "denied",
        would_have_denied: true,
        effect_slug: "b",
      }),
    ];

    const res = await GET();
    const body = await res.json();

    expect(body.stats.totalEvents).toBe(4);
    expect(body.stats.allowedCount).toBe(1);
    expect(body.stats.alreadyUnlockedCount).toBe(1);
    expect(body.stats.deniedCount).toBe(2);
    expect(body.stats.wouldHaveDeniedCount).toBe(2);
    expect(body.stats.wouldHaveDeniedRate).toBe(0.5);
  });

  it("ranks users by successful copies, resolving name (or falling back to email), and excludes anonymous/denied rows", async () => {
    isAdminResult = true;
    eventRows = [
      makeEvent({ clerk_user_id: "user_a", decision: "allowed", effect_slug: "x" }),
      makeEvent({ clerk_user_id: "user_a", decision: "already-unlocked", effect_slug: "x" }),
      makeEvent({ clerk_user_id: "user_a", decision: "allowed", effect_slug: "y" }),
      makeEvent({ clerk_user_id: "user_b", decision: "allowed", effect_slug: "x" }),
      // Anonymous - no clerk_user_id, must never appear in topUsers.
      makeEvent({ clerk_user_id: null, identity_key: "device:anon", decision: "allowed", effect_slug: "x" }),
      // Denied attempt - not a real delivery, must not count toward the rank.
      makeEvent({ clerk_user_id: "user_b", decision: "denied", would_have_denied: true, effect_slug: "z" }),
    ];
    clerkUsers = [
      { id: "user_a", fullName: "Ada Lovelace", emailAddresses: [{ emailAddress: "ada@example.com" }], imageUrl: "https://img/a" },
      // user_b has no name set on their Clerk profile - email is the fallback.
      { id: "user_b", fullName: null, firstName: null, emailAddresses: [{ emailAddress: "bea@example.com" }], imageUrl: null },
    ];

    const res = await GET();
    const body = await res.json();

    expect(body.topUsers).toEqual([
      { clerkUserId: "user_a", name: "Ada Lovelace", email: "ada@example.com", imageUrl: "https://img/a", count: 3 },
      { clerkUserId: "user_b", name: null, email: "bea@example.com", imageUrl: null, count: 1 },
    ]);
  });

  it("reports enforced: true if any event in the window was enforced", async () => {
    isAdminResult = true;
    eventRows = [makeEvent({ enforced: false }), makeEvent({ enforced: true })];

    const res = await GET();
    const body = await res.json();

    expect(body.stats.enforced).toBe(true);
  });
});
