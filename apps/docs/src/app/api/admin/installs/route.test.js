import { describe, it, expect, vi, beforeEach } from "vitest";

// The aggregation logic itself (countBy, topSlugCounts, topUserCounts) was
// verified against real seeded Supabase data during development - this test
// covers the route's auth gate, date-range wiring, and response shape,
// which a real-data check doesn't exercise on its own.

let isAdminResult;
let eventRows;
let queryError;
let eventsTodayCount;
let eventsTodayError;
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

// The route runs two separate queries against install_events (the main
// event list, and an always-"today" count independent of the selected
// range) - both share the same chainable-and-thenable shape so they resolve
// correctly no matter which methods get called or in what order.
function makeEventsQuery() {
  const query = {
    order: vi.fn(() => query),
    gte: vi.fn(() => query),
    lt: vi.fn(() => query),
    then: (resolve) => resolve({ data: eventRows, error: queryError }),
  };
  return query;
}

function makeTodayCountQuery() {
  const query = {
    in: vi.fn(() => query),
    gte: vi.fn(() => query),
    then: (resolve) => resolve({ count: eventsTodayCount, error: eventsTodayError }),
  };
  return query;
}

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn((columns, opts) =>
        opts && opts.count === "exact" && opts.head === true ? makeTodayCountQuery() : makeEventsQuery()
      ),
    })),
  },
}));

const { GET } = await import("./route.js");

function makeRequest(params = "") {
  return new Request(`http://localhost/api/admin/installs${params}`);
}

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
    eventsTodayCount = 0;
    eventsTodayError = null;
    clerkUsers = [];
  });

  it("403s for a non-admin", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
  });

  it("500s when the query errors, without throwing", async () => {
    isAdminResult = true;
    queryError = new Error("connection reset");

    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });

  it("returns zeroed stats with no events, not an error", async () => {
    isAdminResult = true;
    eventRows = [];

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.stats.totalEvents).toBe(0);
    expect(body.stats.eventsToday).toBe(0);
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

    const res = await GET(makeRequest());
    const body = await res.json();

    // totalEvents (like every other Installs & Copies number) counts real,
    // successful deliveries only - the 2 denied attempts show up solely in
    // deniedCount, never folded into "installs".
    expect(body.stats.totalEvents).toBe(2);
    expect(body.stats.allowedCount).toBe(1);
    expect(body.stats.alreadyUnlockedCount).toBe(1);
    expect(body.stats.deniedCount).toBe(2);
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

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.topUsers).toEqual([
      { clerkUserId: "user_a", name: "Ada Lovelace", email: "ada@example.com", imageUrl: "https://img/a", count: 3 },
      { clerkUserId: "user_b", name: null, email: "bea@example.com", imageUrl: null, count: 1 },
    ]);
  });

  it("drops a user from the leaderboard entirely once their Clerk account is deleted", async () => {
    isAdminResult = true;
    eventRows = [
      makeEvent({ clerk_user_id: "user_a", decision: "allowed", effect_slug: "x" }),
      // user_deleted has real historical events, but no Clerk account left
      // to open a profile for - the leaderboard has nothing to link to.
      makeEvent({ clerk_user_id: "user_deleted", decision: "allowed", effect_slug: "y" }),
    ];
    clerkUsers = [
      { id: "user_a", fullName: "Ada Lovelace", emailAddresses: [{ emailAddress: "ada@example.com" }], imageUrl: "https://img/a" },
    ];

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.topUsers).toEqual([
      { clerkUserId: "user_a", name: "Ada Lovelace", email: "ada@example.com", imageUrl: "https://img/a", count: 1 },
    ]);
  });

  it("reports enforced: true if any event in the window was enforced", async () => {
    isAdminResult = true;
    eventRows = [makeEvent({ enforced: false }), makeEvent({ enforced: true })];

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.stats.enforced).toBe(true);
  });

  it("reports the always-today count independently of the selected range", async () => {
    isAdminResult = true;
    eventRows = [];
    eventsTodayCount = 7;

    const res = await GET(makeRequest("?range=90d"));
    const body = await res.json();

    expect(body.stats.eventsToday).toBe(7);
  });
});
