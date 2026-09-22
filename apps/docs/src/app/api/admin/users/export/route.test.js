import { describe, it, expect, vi, beforeEach } from "vitest";

let viewerRole;
let subscriptionRows;
let subscriptionError;
let clerkUsersById;
// Separate from clerkUsersById (which the no-filter branch looks up by id) -
// the search/date-filter branch calls getUserList with query/createdAtAfter/
// createdAtBefore instead of a userId array, so it needs its own list to
// return, keyed on that call shape rather than on specific ids.
let clerkListResult;
const getUserListCalls = [];

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: "user_viewer" })),
  clerkClient: vi.fn(async () => ({
    users: {
      getUser: vi.fn(async () => ({
        id: "user_viewer",
        publicMetadata: { role: viewerRole },
        emailAddresses: [],
      })),
      getUserList: vi.fn(async (params) => {
        getUserListCalls.push(params);
        const { userId, query, createdAtAfter, createdAtBefore } = params;
        if (query || createdAtAfter || createdAtBefore) return clerkListResult;
        const data = (userId || []).map((id) => clerkUsersById[id]).filter(Boolean);
        return { data, totalCount: data.length };
      }),
    },
  })),
}));

function makeSubscriptionQuery() {
  const query = {
    eq: vi.fn(() => query),
    gte: vi.fn(() => query),
    lt: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => query),
    // subscriptionsForIds() (used by the search/date-filter branch to look
    // up plan info for a batch of Clerk-sourced ids) chains .in() instead
    // of .order()/.range() - same query shape either way, just always
    // empty here since these tests don't exercise plan-merging.
    in: vi.fn(() => Promise.resolve({ data: [] })),
    then: (resolve) => resolve({ data: subscriptionRows, error: subscriptionError }),
  };
  return query;
}

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => makeSubscriptionQuery()),
    })),
  },
}));

const { GET } = await import("./route.js");

function makeRequest(params = "") {
  return new Request(`http://localhost/api/admin/users/export${params}`);
}

describe("admin/users/export route", () => {
  beforeEach(() => {
    viewerRole = "super_admin";
    subscriptionRows = [];
    subscriptionError = null;
    clerkUsersById = {};
    clerkListResult = { data: [], totalCount: 0 };
    getUserListCalls.length = 0;
  });

  it("403s for a signed-in non-admin", async () => {
    viewerRole = null;
    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
  });

  it("returns a CSV with the super-admin column set and correct rows", async () => {
    subscriptionRows = [
      {
        clerk_user_id: "user_a",
        plan: "pro",
        status: "active",
        billing_interval: "yearly",
        current_period_end: "2027-01-01T00:00:00.000Z",
        razorpay_customer_id: "cust_123",
        razorpay_subscription_id: "sub_123",
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    clerkUsersById = {
      user_a: {
        id: "user_a",
        fullName: "Ada Lovelace",
        emailAddresses: [{ emailAddress: "ada@example.com" }],
        createdAt: "2026-01-01T00:00:00.000Z",
        publicMetadata: {},
      },
    };

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("attachment");

    const csv = await res.text();
    const lines = csv.trim().split("\r\n");

    expect(lines[0]).toBe(
      "Name,Email,Joined At,Plan,Role,Status,Billing Interval,Plan Valid Until,Razorpay Customer ID,Razorpay Subscription ID,Clerk User ID"
    );
    expect(lines[1]).toBe(
      "Ada Lovelace,ada@example.com,2026-01-01T00:00:00.000Z,pro,none,active,yearly,2027-01-01T00:00:00.000Z,cust_123,sub_123,user_a"
    );
  });

  it("returns just the header row when there are no matching users", async () => {
    subscriptionRows = [];
    const res = await GET(makeRequest());
    const csv = await res.text();
    expect(csv.trim().split("\r\n")).toHaveLength(1);
  });

  it("uses the restricted column set for a regular (non-super) admin", async () => {
    viewerRole = "admin";
    subscriptionRows = [
      {
        clerk_user_id: "user_a",
        plan: "free",
        status: "inactive",
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    clerkUsersById = {
      user_a: {
        id: "user_a",
        fullName: "Ada Lovelace",
        emailAddresses: [{ emailAddress: "ada@example.com" }],
        createdAt: "2026-01-01T00:00:00.000Z",
        publicMetadata: {},
      },
    };

    const res = await GET(makeRequest());
    const csv = await res.text();
    const lines = csv.trim().split("\r\n");

    expect(lines[0]).toBe("Name,Email,Joined At,Plan,Role");
    expect(lines[1]).toBe("Ada Lovelace,ada@example.com,2026-01-01T00:00:00.000Z,free,none");
  });

  it("500s when the Supabase query errors, without throwing", async () => {
    subscriptionError = new Error("connection reset");
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });

  it("falls back to a capitalized email local-part when the account has no name set", async () => {
    subscriptionRows = [{ clerk_user_id: "user_a", plan: "free", created_at: "2026-01-01T00:00:00.000Z" }];
    clerkUsersById = {
      user_a: {
        id: "user_a",
        fullName: null,
        firstName: null,
        emailAddresses: [{ emailAddress: "bea@example.com" }],
        createdAt: "2026-01-01T00:00:00.000Z",
        publicMetadata: {},
      },
    };

    const res = await GET(makeRequest());
    const csv = await res.text();
    const lines = csv.trim().split("\r\n");

    expect(lines[1].startsWith("Bea,bea@example.com,")).toBe(true);
  });

  // Regression test: a custom date range used to filter subscriptions'
  // own created_at (when that row was written) while the exported "Joined
  // At" column shows Clerk's real createdAt - a picked range could
  // silently include/exclude rows relative to what the export actually
  // shows for them. Fixed by routing any date-filtered export through
  // Clerk's own createdAtAfter/createdAtBefore, same as search already
  // did - this asserts that routing, not just that a 200 comes back.
  it("filters by Clerk's own createdAt (not subscriptions.created_at) when a custom joined range is given", async () => {
    // Deliberately non-empty and entirely outside the picked range, to
    // prove the exported rows come from clerkListResult (the Clerk-side
    // date-filtered branch), not from this Supabase table scan.
    subscriptionRows = [{ clerk_user_id: "user_out_of_range", plan: "free", created_at: "2020-01-01T00:00:00.000Z" }];
    clerkListResult = {
      data: [
        {
          id: "user_in_range",
          fullName: "In Range",
          emailAddresses: [{ emailAddress: "inrange@example.com" }],
          createdAt: "2026-01-03T00:00:00.000Z",
          publicMetadata: {},
        },
      ],
      totalCount: 1,
    };

    const res = await GET(makeRequest("?joinedFrom=2026-01-01&joinedTo=2026-01-05"));
    const csv = await res.text();
    const lines = csv.trim().split("\r\n");

    expect(lines).toHaveLength(2);
    expect(lines[1].startsWith("In Range,inrange@example.com,2026-01-03")).toBe(true);

    const dateFilteredCall = getUserListCalls.find((c) => c.createdAtAfter || c.createdAtBefore);
    expect(dateFilteredCall).toBeTruthy();
    expect(dateFilteredCall.createdAtAfter).toBe(new Date("2026-01-01T00:00:00.000Z").getTime());
    expect(dateFilteredCall.createdAtBefore).toBe(new Date("2026-01-06T00:00:00.000Z").getTime());
  });

  // Belt-and-suspenders test: even if Clerk's createdAtAfter/createdAtBefore
  // silently no-op and hand back every user regardless of the requested
  // range (exactly what would explain "I picked a range and still got
  // everyone"), the route must not trust that and still exclude anything
  // outside the range itself.
  it("excludes rows outside the range even if Clerk's own filtering returns everyone", async () => {
    clerkListResult = {
      data: [
        {
          id: "user_in_range",
          fullName: "In Range",
          emailAddresses: [{ emailAddress: "inrange@example.com" }],
          createdAt: "2026-01-03T00:00:00.000Z",
          publicMetadata: {},
        },
        {
          id: "user_before_range",
          fullName: "Too Early",
          emailAddresses: [{ emailAddress: "early@example.com" }],
          createdAt: "2025-12-31T00:00:00.000Z",
          publicMetadata: {},
        },
        {
          id: "user_after_range",
          fullName: "Too Late",
          emailAddresses: [{ emailAddress: "late@example.com" }],
          createdAt: "2026-01-06T00:00:00.000Z",
          publicMetadata: {},
        },
      ],
      totalCount: 3,
    };

    const res = await GET(makeRequest("?joinedFrom=2026-01-01&joinedTo=2026-01-05"));
    const csv = await res.text();
    const lines = csv.trim().split("\r\n");

    expect(lines).toHaveLength(2);
    expect(lines[1].startsWith("In Range,inrange@example.com,")).toBe(true);
  });
});
