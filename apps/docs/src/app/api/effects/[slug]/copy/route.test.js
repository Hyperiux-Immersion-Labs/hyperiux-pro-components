import { describe, it, expect, vi, beforeEach } from "vitest";

// Route-level test for the effect page's "Get code" dropdown endpoint: sign-in,
// Pro access, which options consume a daily copy slot, and that a missing
// source never burns a slot. The access/limit decisions themselves are
// covered by effect-access.test.js and install-limit.test.js.

let authResult;
let effectMeta;
let effectSource;
let sanitySource;
let accessResult;
let limitResult;

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(() => Promise.resolve(authResult)),
}));

vi.mock("@/lib/registry", () => ({
  getEffectMetadata: vi.fn(() => effectMeta),
  getEffectSource: vi.fn(() => effectSource),
}));

vi.mock("@/lib/sanity", () => ({
  getSanityEffectSource: vi.fn(() => Promise.resolve(sanitySource)),
}));

vi.mock("@/lib/effect-access", () => ({
  getEffectAccessDecision: vi.fn(() => Promise.resolve(accessResult)),
}));

vi.mock("@/lib/install-limit", () => ({
  getInstallLimitDecision: vi.fn(() => Promise.resolve(limitResult)),
  getUnlockedEffectSlugsToday: vi.fn(() => Promise.resolve(["stack-loader"])),
}));

const { POST } = await import("./route.js");
const { getInstallLimitDecision } = await import("@/lib/install-limit");
const { getEffectAccessDecision } = await import("@/lib/effect-access");

function post(option, slug = "stack-loader") {
  const request = new Request(`http://localhost/api/effects/${slug}/copy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ option }),
  });
  return POST(request, { params: Promise.resolve({ slug }) });
}

beforeEach(() => {
  vi.clearAllMocks();
  authResult = { userId: "user_1" };
  effectMeta = { name: "stack-loader", title: "Stack Loader", tier: "free" };
  effectSource = {
    name: "stack-loader",
    title: "Stack Loader",
    tier: "free",
    main: "index.tsx",
    exportName: "StackLoader",
    exportKind: "default",
    dependencies: ["gsap"],
    files: [{ path: "index.tsx", content: "export default function StackLoader() {}" }],
  };
  sanitySource = { tier: "free", jsxCode: "// jsx source", tsxCode: "// tsx source" };
  accessResult = { allowed: true, reason: "free" };
  limitResult = { allowed: true, reason: "allowed", plan: "free", limit: 3, count: 1, remaining: 2 };
});

describe("POST /api/effects/[slug]/copy", () => {
  it("requires sign-in", async () => {
    authResult = { userId: null };
    const response = await post("tsx");
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ allowed: false, signedIn: false });
  });

  it("rejects unknown options (cli/mcp are built client-side)", async () => {
    for (const option of ["cli", "mcp", "bogus", undefined]) {
      expect((await post(option)).status).toBe(400);
    }
  });

  it("404s for an unknown effect", async () => {
    effectMeta = null;
    expect((await post("tsx", "nope")).status).toBe(404);
  });

  it("returns the Sanity TSX source and consumes a copy slot", async () => {
    const response = await post("tsx");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      allowed: true,
      content: "// tsx source",
      filename: "index.tsx",
      limit: 3,
      remaining: 2,
      effectSlugs: ["stack-loader"],
    });
    expect(getInstallLimitDecision).toHaveBeenCalledWith(
      expect.objectContaining({ effectSlug: "stack-loader", source: "web", clerkUserId: "user_1" })
    );
  });

  it("returns the Sanity JSX source for option jsx", async () => {
    const body = await (await post("jsx")).json();
    expect(body.content).toBe("// jsx source");
    expect(body.filename).toBe("index.jsx");
  });

  it("returns 429 with usage when the daily limit is reached", async () => {
    limitResult = { allowed: false, reason: "limit-reached", plan: "free", limit: 3, count: 3, remaining: 0 };
    const response = await post("tsx");
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.allowed).toBe(false);
    expect(body.content).toBeUndefined();
    expect(body.remaining).toBe(0);
  });

  it("blocks Pro effects for users without Pro, before touching the limit", async () => {
    sanitySource = { ...sanitySource, tier: "pro" };
    accessResult = { allowed: false, reason: "no-subscription" };
    const response = await post("tsx");

    expect(response.status).toBe(403);
    expect((await response.json()).content).toBeUndefined();
    expect(getEffectAccessDecision).toHaveBeenCalledWith({ effectTier: "pro", clerkUserId: "user_1" });
    expect(getInstallLimitDecision).not.toHaveBeenCalled();
  });

  it("does not consume a slot when the Sanity source is missing", async () => {
    sanitySource = { tier: "free", jsxCode: null, tsxCode: null };
    const response = await post("tsx");

    expect(response.status).toBe(404);
    expect(getInstallLimitDecision).not.toHaveBeenCalled();
  });

  it("returns the AI prompt without consuming a copy slot", async () => {
    const response = await post("prompt");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.allowed).toBe(true);
    expect(body.content).toContain("export default function StackLoader() {}");
    expect(body.content).toContain("npm install gsap");
    expect(getInstallLimitDecision).not.toHaveBeenCalled();
  });

  it("still requires Pro access for the AI prompt of a Pro effect", async () => {
    effectMeta = { ...effectMeta, tier: "pro" };
    accessResult = { allowed: false, reason: "no-subscription" };
    const response = await post("prompt");

    expect(response.status).toBe(403);
    expect((await response.json()).content).toBeUndefined();
  });
});
