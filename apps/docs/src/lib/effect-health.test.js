import { describe, it, expect } from "vitest";
import { computeEffectHealth } from "./effect-health.js";

// The admin Effects tab's checks, on a tiny made-up library.
const usage = (slug, props = "") => `import X from "@/components/effects/${slug}";\n<X ${props} />`;

function catalogueEffect(slug, overrides = {}) {
  return { slug, title: slug, category: { id: "buttons" }, dependencies: ["gsap"], props: [{ name: "speed", type: "number" }], usage: usage(slug), ...overrides };
}

const registryItems = [
  { name: "healthy", category: "buttons", tier: "free" },
  { name: "no-guide", category: "buttons", tier: "pro" },
  { name: "dotted-trail", category: "backgrounds", tier: "free" },
  { name: "noted", category: "buttons", tier: "free" },
];
const guide = (effectSlug, overrides = {}) => ({ _id: `doc-${effectSlug}`, effectSlug, categorySlug: "buttons", title: effectSlug, summary: "A summary.", seoDescription: "SEO.", body: [], relatedEffectNames: [], ...overrides });
const guides = [
  guide("healthy", { relatedEffectNames: ["noted"] }),
  guide("dotted-trail", { categorySlug: "cursor-effects" }),
  guide("noted", { title: "noted ", body: [{ _type: "block", text: "Use this as guidance. Verify the shipped component API before relying on exact props." }], relatedEffectNames: ["Nothing Like This"] }),
  guide("gone"),
];
const catalogue = {
  effects: [
    catalogueEffect("healthy"),
    catalogueEffect("no-guide"),
    catalogueEffect("dotted-trail"),
    catalogueEffect("noted", { usage: usage("noted-old", 'fillColor="#fff"') }),
  ],
};

const health = computeEffectHealth({ registryItems, guides, catalogue });
const kindsOf = (slug) => health.effects.find((e) => e.slug === slug)?.issues.map((i) => i.kind) || [];

describe("effect health", () => {
  it("a healthy effect isn't listed", () => {
    expect(kindsOf("healthy")).toEqual([]);
  });

  it("flags a missing guide and a guide with no effect", () => {
    expect(kindsOf("no-guide")).toEqual(["no-guide"]);
    expect(kindsOf("gone")).toEqual(["orphan-guide"]);
  });

  it("flags a category the registry and Sanity disagree on (the Dotted Trail case)", () => {
    expect(kindsOf("dotted-trail")).toContain("category-mismatch");
  });

  it("checks the raw guide copy and the usage example", () => {
    expect(kindsOf("noted")).toEqual(expect.arrayContaining(["internal-note", "whitespace", "related-missing", "import-path", "undocumented-prop"]));
    expect(health.effects.find((e) => e.slug === "noted").sanityId).toBe("doc-noted");
  });

  it("lists the worst first and counts each kind", () => {
    expect(health.effects[0].issues[0].severity).toBe("high");
    expect(health.counts["no-guide"]).toBe(1);
    expect(health.total).toBe(4);
  });
});
