import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/sanity", () => ({ getAllSanityEffectGuides: vi.fn(), getSanityBlogEntries: vi.fn() }));

const { buildAiCatalogue, readGuide, tagsFor, toLlmsTxt, toLlmsFullTxt, toLlmsCategoryTxt } = await import("./ai-catalogue.js");
const { checkEffect } = await import("./ai-catalogue-checks.js");

const SECRET = "/* PRO-SOURCE-SHOULD-NEVER-LEAK */";
const h2 = (text) => ({ _type: "block", style: "h2", text });
const p = (text) => ({ _type: "block", style: "normal", text });
const code = (value) => ({ _type: "effectCodeBlock", code: value });

const proGuide = {
  effectSlug: "stack-spread",
  categorySlug: "scroll-effects",
  title: "Stack Spread",
  summary: "A stack-to-spread hero.",
  seoDescription: "Stack Spread for React.",
  tier: "free", // Sanity disagrees with the registry on purpose
  tags: ["Motion"],
  relatedEffectNames: ["Timeline", "Not In Catalogue"],
  faq: [{ question: "What is it?", answer: "A hero." }],
  body: [
    h2("Overview"), p("Turns a pile into a composition."),
    h2("Install Command"), code("npx hyperiux add stack-spread"),
    h2("Usage Code"), code('import StackSpread from "@/components/effects/stack-spread";'),
    h2("Component Code"), code(`"use client"; ${SECRET} export default function StackSpread() {}`),
    h2("Best Used For"), p("• Portfolio heroes."), p("• Campaign pages."),
    h2("Not For"), p("Not for dense galleries."),
    h2("Accessibility and Mobile"), p("Keep the headline as real text."),
    h2("Common Mistakes"), p("• Too many images."),
  ],
};

const catalogue = buildAiCatalogue({
  registryItems: [
    { name: "stack-spread", category: "scroll", tier: "pro", dependencies: ["gsap"] },
    { name: "timeline", category: "components", tier: "free", dependencies: [] },
  ],
  guides: [proGuide, { effectSlug: "timeline", categorySlug: "components", title: "Timeline", body: [] }],
  getRegistryEffect: (slug) => (slug === "stack-spread" ? { props: [{ name: "scrollLength", type: "number", default: 350, description: "Scroll distance in vh." }] } : null),
  templates: [{ slug: "lumera", title: "Lumera", category: "Real Estate" }],
  blogPosts: [{ slug: "post", title: "A post" }],
});

describe("ai catalogue", () => {
  it("never carries an effect's component source, in JSON or text", () => {
    expect(JSON.stringify(catalogue)).not.toContain("PRO-SOURCE");
    expect(toLlmsTxt(catalogue)).not.toContain("PRO-SOURCE");
    expect(toLlmsFullTxt(catalogue)).not.toContain("PRO-SOURCE");
  });

  it("keeps only the usage snippet from the guide's code blocks", () => {
    expect(readGuide(proGuide.body).usage).toBe('import StackSpread from "@/components/effects/stack-spread";');
  });

  it("takes Free/Pro from the registry, not Sanity", () => {
    expect(catalogue.effects.find((e) => e.slug === "stack-spread").tier).toBe("pro");
  });

  it("splits the guide into sections, with bullets as list items", () => {
    const effect = catalogue.effects.find((e) => e.slug === "stack-spread");
    expect(effect.bestFor).toEqual(["Portfolio heroes.", "Campaign pages."]);
    expect(effect.notFor).toEqual(["Not for dense galleries."]);
    expect(effect.accessibility).toEqual(["Keep the headline as real text."]);
    expect(effect.commonMistakes).toEqual(["Too many images."]);
    expect(effect.props[0]).toEqual({ name: "scrollLength", type: "number", default: 350, description: "Scroll distance in vh." });
  });

  it("links related effects that exist and drops the rest", () => {
    expect(catalogue.effects.find((e) => e.slug === "stack-spread").related.map((r) => r.slug)).toEqual(["timeline"]);
  });

  it("uses the site's category slugs in links and counts every effect", () => {
    const effect = catalogue.effects.find((e) => e.slug === "stack-spread");
    expect(effect.docsUrl).toBe("https://vault.hyperiux.com/effects/scroll-effects/stack-spread");
    expect(catalogue.totals).toMatchObject({ effects: 2, free: 1, pro: 1, templates: 1 });
  });

  it("lists every effect in llms.txt with its tier and demo link", () => {
    const text = toLlmsTxt(catalogue);
    expect(text).toContain("[Stack Spread](https://vault.hyperiux.com/effects/scroll-effects/stack-spread): Pro");
    expect(text).toContain("[live demo](https://vault.hyperiux.com/demo/timeline)");
    expect(text).toContain("[A post](https://vault.hyperiux.com/blog/post)");
  });
});

describe("ai catalogue guards", () => {
  const NOTE = "Use this as text-animation implementation guidance. Verify the shipped component API before relying on exact props.";

  it("drops the internal writing note from guide sections and FAQs", () => {
    const guide = readGuide([h2("Example Production Use Case"), p(NOTE), p("A launch page headline.")]);
    expect(guide.exampleUseCase).toEqual(["A launch page headline."]);

    const built = buildAiCatalogue({
      registryItems: [{ name: "blur-text", category: "text", tier: "free", dependencies: [] }],
      guides: [{ effectSlug: "blur-text", categorySlug: "text-animations", title: "Blur Text ", summary: "Blurs in.\\n", faq: [{ question: "Q?", answer: NOTE }], body: [] }],
    });
    const effect = built.effects[0];
    expect(JSON.stringify(effect)).not.toMatch(/Verify the shipped component API/);
    expect(effect.title).toBe("Blur Text");
    expect(effect.summary).toBe("Blurs in.");
  });

  it("derives package tags from dependencies and keeps only technique tags from Sanity", () => {
    expect(tagsFor(["three", "@react-three/fiber", "@gsap/react"], ["GSAP", "Lenis", "canvas"])).toEqual(["Three.js", "React Three Fiber", "Canvas"]);
    expect(tagsFor(["gsap", "lenis"], ["GSAP "])).toEqual(["GSAP", "Lenis"]);
  });

  it("serves one category's full records as its own text file", () => {
    const text = toLlmsCategoryTxt(catalogue, "scroll-effects");
    expect(text).toContain("### Stack Spread");
    expect(text).not.toContain("### Timeline");
    expect(text).not.toContain("PRO-SOURCE");
    expect(toLlmsCategoryTxt(catalogue, "nope")).toBeNull();
    expect(toLlmsTxt(catalogue)).toContain("https://vault.hyperiux.com/llms/scroll-effects.txt");
  });
});

describe("ai catalogue checks", () => {
  const effect = (overrides) => ({
    slug: "dot-fill",
    title: "Dot Fill",
    category: { id: "buttons" },
    dependencies: ["gsap"],
    props: [{ name: "dotColor", type: "string" }, { name: "size", type: "number" }],
    usage: 'import DotFill from "@/components/effects/dot-fill";\n<DotFill dotColor="#fff" />',
    ...overrides,
  });
  const kinds = (e) => checkEffect(e).map((issue) => issue.kind);

  it("passes a usage snippet that matches the registry", () => {
    expect(kinds(effect())).toEqual([]);
  });

  it("flags undocumented props, wrong types, missing dependencies and a wrong install path", () => {
    expect(kinds(effect({ usage: 'import DotFill from "@/components/effects/dot-fill";\n<DotFill fillColor="#fff" />' }))).toContain("undocumented-prop");
    expect(kinds(effect({ usage: 'import DotFill from "@/components/effects/dot-fill";\n<DotFill size="lg" dotColor={0xffffff} />' }))).toEqual(["prop-type", "prop-type"]);
    expect(kinds(effect({ usage: 'import { ReactLenis } from "lenis/react";\nimport DotFill from "@/components/effects/dot-fill";' }))).toContain("usage-import");
    expect(kinds(effect({ usage: 'import DotFill from "@/components/effects/pixel-fill";\n<DotFill />' }))).toContain("import-path");
  });

  it("flags a text effect with no way to set its text", () => {
    const text = { category: { id: "text" }, props: [{ name: "speed", type: "number" }] };
    expect(kinds(effect({ ...text, usage: 'import DotFill from "@/components/effects/dot-fill";\n<DotFill />' }))).toContain("no-text-prop");
    expect(kinds(effect({ ...text, usage: 'import DotFill from "@/components/effects/dot-fill";\n<DotFill>Hello</DotFill>' }))).not.toContain("no-text-prop");
    // Text built into the component on purpose (registry.json fixedText)
    expect(kinds(effect({ ...text, fixedText: true, usage: 'import DotFill from "@/components/effects/dot-fill";\n<DotFill />' }))).not.toContain("no-text-prop");
  });

  it("reads nested values, arrow functions and spreads without inventing props", () => {
    const usage = 'import DotFill from "@/components/effects/dot-fill";\n<DotFill items={[{ href: "/a", text: "A" }]} onDone={() => n > 1} {...rest} dotColor="#fff" />';
    expect(checkEffect(effect({ usage, props: [{ name: "items", type: "object[]" }, { name: "dotColor", type: "string" }] }))).toEqual([
      { kind: "undocumented-prop", message: "usage passes onDone, which isn't a documented prop" },
    ]);
  });

  it("skips *ClassName hooks and props left out of the docs on purpose", () => {
    const usage = 'import DotFill from "@/components/effects/dot-fill";\n<DotFill textClassName="x" shaderConfig={{ a: 1 }} />';
    expect(kinds(effect({ usage }))).toEqual(["undocumented-prop"]);
    expect(kinds(effect({ usage, undocumentedProps: ["shaderConfig"] }))).toEqual([]);
  });
});

