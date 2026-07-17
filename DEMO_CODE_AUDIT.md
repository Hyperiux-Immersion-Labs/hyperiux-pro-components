# Demo Code Audit — HYPERIUX-PRO-COMPONENTS

**Scope:** `apps/docs/src/app/(marketing)/demo` — all 115 effect demos
**Date:** 2026-07-17
**Reviewer stance:** Strict open-source maintainer review. This is the code that represents the library.

> **Note on the given path:** the review request said `(marketting)`. The real folder is `(marketing)` (one `t`). Reviewed the real one.

---

## Scope Measured

| Metric | Value |
|---|---|
| Demo directories | 115 |
| Files | 140 (128 `.js`, 12 `.jsx`) |
| Total LOC | 6,162 |
| Average file | ~44 LOC |
| Largest file | `blur-text/DemoContent.jsx` (495) |
| `.ts` / `.tsx` files | **0** |
| Files with `useEffect` | 4 |
| Files with `"use client"` | 8 |

The average demo is ~44 lines of static JSX. That is the right instinct — most of these pages are thin and the complexity lives in the library. Credit where due: the *shape* of this folder is correct. Almost everything below is about execution, not structure-in-principle.

---

## The Headline Numbers

These are counted, not estimated:

| Finding | Count |
|---|---|
| Unused `import React` | **74 files** |
| Lowercase `page` component name | **79 files** (63 × `export default page`) |
| Hardcoded R2 CDN URLs | **73** |
| `text-[Nvw]` font sizes | **264** across 59 files |
| `prefers-reduced-motion` handling | **0** |
| `aria-*` attributes | **1** (in the whole folder) |
| Distinct `logoColor` prop formats | **11** (one is broken) |
| `page2` routes missing `generateMetadata` | **6 of 6** |
| Silently-dead Tailwind class typos | **2** |
| GSAP effects with correct cleanup | **1 of 2** |

---

## 1. Architecture — 4/10

**The six button demos are the same file.** `char-stagger-button`, `char-stagger-primary-button`, `arrow-fill-button`, `dot-fill-button`, `link-button`, `scramble-link-button` are ~95% identical: same wrapper, same `space-y-20 relative z-10 text-center -mt-20`, same eyebrow, same fixed background `<Image>` + `bg-black/70` scrim. Only the component under test and one string differ. That is six copies of a layout with one variable.

**Fix — extract a `ButtonDemoStage`:**

```jsx
// apps/docs/src/components/WebsiteComps/ButtonDemoStage.jsx
const BG = "https://pub-8abee...r2.dev/vault-listing-images/assets-images";

export default function ButtonDemoStage({ title, bg, children }) {
  return (
    <>
      <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
      <div className="relative flex h-screen w-full items-center justify-center">
        <div className="relative z-10 -mt-20 space-y-20 text-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60 max-sm:text-sm max-md:text-base">
              Hyperiux Button Demo
            </p>
            <h1 className="text-5xl font-medium max-sm:text-4xl">{title}</h1>
          </div>
          {children}
        </div>
        <div className="fixed inset-0">
          <Image src={`${BG}/${bg}`} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
      </div>
    </>
  );
}
```

Each demo collapses to what it is actually demonstrating:

```jsx
export default function Page() {
  return (
    <ButtonDemoStage title="Dot Fill Button" bg="h-07.jpg">
      <DotFillBtn href="#" btnText="Try demo" bgColor="#ff6b00" ... />
    </ButtonDemoStage>
  );
}
```

**Why better:** the demo now shows *only the API being demoed*. Today a reader has to diff two 53-line files to find the one line that matters. It also kills six copies of the `alt="bg image"` mistake and six copies of the hardcoded URL — fix once, fixed everywhere.

**Other architectural problems:**

- **`page2` is not a name.** `block-transition/page2`, `chess-grid-transition/page2`, `pixel-transition/page2`, `svg-brush-transition/page2`, `radial-slice-transition/page2`, `page-flip-transition/page2`. The route `/demo/block-transition/page2` tells a user nothing and is a public URL. Name it for what it is: `/demo/block-transition/destination`.
- **Transition demo pairs are duplicated too.** `block-transition/page.js` and `chess-grid-transition/page.js` are identical but for the `<h1>` and the `href`. Same for their `page2` files. Same extraction applies.
- **Three inconsistent demo shapes** with no rule: `page.js` alone; `page.js` + `DemoContent.jsx`; `page.js` + `<Name>Wrapper.jsx`. Pick one convention — `page.js` (server, metadata) + `DemoContent.jsx` (client) — and apply it everywhere.
- **`useIsMobile` is defined inside a demo** ([LiquidGlassWrapper.jsx:16-27](apps/docs/src/app/(marketing)/demo/liquid-glass-cursor/LiquidGlassWrapper.jsx#L16-L27)). A shared hook lives in `hooks/`, not in an example file. As written it teaches readers to copy a hook into a page.

---

## 2. Code Quality — 3/10

**The formatter has never been run.** There is no Prettier config in `apps/docs`. The result is in the source:

```js
import React, { useEffect, useRef } from"react";   // blur-text/DemoContent.jsx:3
import ParallaxAnim from"@/components/parallax-image-animation";
import { ReactLenis } from"lenis/react";
```

`from"react"` — no space — appears **11 times across 4 files**. Object literals in the same file are written `step:"01"`, `label:"Mount the component"`. This is unformatted code shipped as an exemplar.

**Fix:** add Prettier + `eslint-config-prettier`, run `--write` once, add a CI check. This single step removes an entire class of finding.

**Two Tailwind typos that silently do nothing:**

- [`scramble-text/ScrambleTextWrapper.jsx:33`](apps/docs/src/app/(marketing)/demo/scramble-text/ScrambleTextWrapper.jsx#L33) — `max-md:leading-[1.2]` → `leading`
- [`overflow-text-reveal/OverflowTextRevealWrapper.jsx:40`](apps/docs/src/app/(marketing)/demo/overflow-text-reveal/OverflowTextRevealWrapper.jsx#L40) — `max-sm:text-sm` → `max-sm`

Both compile fine and produce nothing. Nobody noticed because nothing enforces it. Add `eslint-plugin-tailwindcss` (or Tailwind v4's `detectUnknownClasses`) — it catches both mechanically.

**74 unused `import React`.** Not needed since the new JSX transform; Next 16 + React 19 certainly doesn't. Dead weight in 74 files. `eslint --fix` with `no-unused-vars` removes them.

**Dead code left in place:**

- [`scroll-distortion/page.js:2`](apps/docs/src/app/(marketing)/demo/scroll-distortion/page.js#L2) — commented-out import sitting directly above the real one.
- [`border-beam/page.js:23-24`](apps/docs/src/app/(marketing)/demo/border-beam/page.js#L23-L24) — commented-out JSX blobs.
- [`pixel-bloom/PixelBloomWrapper.jsx:55`](apps/docs/src/app/(marketing)/demo/pixel-bloom/PixelBloomWrapper.jsx#L55) — commented-out `<PixelBloom>`.
- [`blur-text/DemoContent.jsx:129-133`](apps/docs/src/app/(marketing)/demo/blur-text/DemoContent.jsx#L129-L133) — commented-out JSX, and it is the **only consumer of the `accents` constant** declared at line 13. So `accents` is dead too.
- `className=""` and `className="  scale-150"` — empty/padded class strings.

Your own `CODING_STANDARDS.md` says *"Dead code is noise — unused variables, attributes, and handlers must be removed before merging."* The standard is right. It is not being enforced.

**Naming:** 79 files declare `const page = () => {}`. React components are PascalCase. It works only because Next imports the default export and never renders it as `<page />` — you are relying on the fact that the mistake is invisible. It is also inconsistent: some files correctly use `Page`. Pick `Page`.

**Magic numbers with no names:** `h-[750vh]`, `h-155`, `h-130`, `h-90`, `h-75`, `-mt-20`, `radius = window.innerWidth * 0.15`. `CODING_STANDARDS.md` has a whole section demanding named constants. The demos ignore it.

---

## 3. React / Next.js — 4/10

**Hydration/flash risk in `useIsMobile`** ([LiquidGlassWrapper.jsx:16-30](apps/docs/src/app/(marketing)/demo/liquid-glass-cursor/LiquidGlassWrapper.jsx#L16-L30)):

```js
const [isMobile, setIsMobile] = React.useState(false)  // server + first client render: false
React.useEffect(() => { check(); window.addEventListener('resize', check) }, [])
```

First paint always assumes desktop. On a phone, `<LiquidGlassCursor>` mounts, then unmounts on the next tick, and the mobile `<p>` pops in after hydration. The `resize` listener is also unthrottled — `setState` on every resize event.

**Fix:** `useSyncExternalStore` is exactly the primitive for this:

```js
const query = "(pointer: coarse)";
const subscribe = (cb) => {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
};
export const useIsCoarsePointer = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
```

**Why better:** React reads the value during render instead of after; no double-render; no manual listener; the `resize` throttling question disappears because `matchMedia` only fires on actual breakpoint crossings, not every pixel.

**Breakpoint drift.** [`PixelBloomWrapper.jsx:14`](apps/docs/src/app/(marketing)/demo/pixel-bloom/PixelBloomWrapper.jsx#L14) gates on `(max-width: 1025px)` while the JSX in the same file uses `max-md:` (768px). Two different definitions of "mobile" in one component. And this check runs **once, with no listener** — resize a desktop window narrow and back, and the animation never re-initializes. `radius` is likewise captured once at effect time and never recomputed on resize.

**`h-screen` on growing content.** [`animated-faq/page.js:22`](apps/docs/src/app/(marketing)/demo/animated-faq/page.js#L22) — `<section className="bg-black h-screen ...">` wrapping an accordion. Open enough FAQs and the content is clipped. Use `min-h-screen`. This pattern (`h-screen`, 64 uses) is worth a sweep — `h-screen` is also the wrong unit on mobile browsers with dynamic toolbars; `min-h-dvh` is the modern answer.

**`w-screen` causes horizontal overflow** when a vertical scrollbar is present (`100vw` includes the scrollbar gutter). Use `w-full`.

**Work repeated on every render.** [`animated-faq/page.js:15-17`](apps/docs/src/app/(marketing)/demo/animated-faq/page.js#L15-L17) filters + maps a module-level static array inside the component body. Hoist it to a module constant — it can never change.

**Data declared after use.** `faqItems` is used at line 15 and declared at line 60, below the component. It works, but a reader hits the reference before the definition.

---

## 4. TypeScript — 1/10

There is no TypeScript in this repository. Not "partial" — zero. `jsconfig.json`, no `tsconfig.json`, no `.ts`/`.tsx` outside `.next` build artifacts.

More damning for a *component library*: there are no types **of any kind**.

- PropTypes: **0**
- JSDoc `@param`/`@type`: **3** across 6,162 lines

I want to be fair: plain JS is a legitimate choice, and I'm not scoring you down for declining TS as such. The score is low because of the **consequence for a library**: your consumers get no autocomplete, no signature help, and no compile-time feedback on your public API. And section 9 below shows this is not hypothetical — the `logoColor` prop is being passed eleven different ways including one that is outright broken, and nothing in the toolchain can tell.

**Minimum viable fix without migrating:** ship a hand-written `index.d.ts` per component and enable `checkJs` in `jsconfig.json`. You keep JS authoring and consumers get IntelliSense. The `logoColor` bug becomes a red squiggle:

```ts
export interface DemoHeaderProps {
  /** CSS color for the logo. Hex or named color — NOT a Tailwind class. */
  logoColor?: string;
  textColor?: string;
  text?: string;
  href?: string;
  showText?: boolean;
}
```

---

## 5. Performance — 5/10

The thin static pages are genuinely fine, and `transform-gpu backface-hidden` on the `pixel-bloom` boxes is a correct instinct. Real problems:

**Remounting the entire smooth-scroll root to replay an animation** — [`OverflowTextRevealWrapper.jsx:15`](apps/docs/src/app/(marketing)/demo/overflow-text-reveal/OverflowTextRevealWrapper.jsx#L15):

```jsx
const [replayKey, setReplayKey] = useState(0);
return <ReactLenis root key={replayKey}>   // ← bumping this nukes everything
```

Clicking "Replay animation" changes the `key` on the Lenis root, which destroys and recreates the smooth-scroll instance, all six `<section>`s, all six `<Image>`s, and every `OverflowTextReveal`. To restart one animation. This is a sledgehammer, and worse — **it teaches the reader that this is how you replay an effect.**

**Fix:** key only the subtree that animates, or better, expose an imperative handle:

```jsx
const revealRef = useRef(null);
<button onClick={() => revealRef.current?.replay()}>Replay</button>
<OverflowTextReveal ref={revealRef} direction="bottom" scrub={false}>
```

**Why better:** it restarts one timeline instead of tearing down the page, keeps scroll position, avoids re-decoding six images — and it showcases a real API instead of a React trick that works around not having one. If `OverflowTextReveal` has no replay handle, **that is the actual finding**: the library is missing an obvious API and the demo is papering over it.

**Scrubbing paint properties** — [`blur-text/DemoContent.jsx:83-104`](apps/docs/src/app/(marketing)/demo/blur-text/DemoContent.jsx#L83-L104) scrubs `backgroundColor` and `color` on scroll. These are paint-triggering, non-compositable properties; every scroll frame repaints full-viewport sections. Animate `opacity` on a stacked overlay layer, or drive a CSS custom property, and let the compositor do it.

**Redundant ScrollTriggers.** The same block creates one ScrollTrigger per section *plus* one per `[data-subtext]` element — all with an identical `trigger`, `start`, `end`, and `scrub`. That is N triggers doing one trigger's job. One timeline with multiple tweens is both faster and clearer:

```js
const tl = gsap.timeline({ scrollTrigger: { trigger: darkSection, start: "top 80%", end: "top 20%", scrub: true } });
tl.to(sections, { backgroundColor: "#000", color: "#fff" }, 0)
  .to(subtexts, { color: "#a3a3a3" }, 0);
```

**Eight `PixelBloom` instances** mount simultaneously in `pixel-bloom`, two of them video, with no lazy/visibility gating on a `750vh` page.

**73 hardcoded CDN URLs.** Beyond the maintenance cost, when the bucket rotates you are editing 73 strings. Extract `const CDN = "https://pub-….r2.dev/vault-listing-images/assets-images"`.

---

## 6. Animation Quality — 3/10

**The memory leak is checked in, commented out** — [`blur-text/DemoContent.jsx:107`](apps/docs/src/app/(marketing)/demo/blur-text/DemoContent.jsx#L107):

```js
//  return () => ScrollTrigger.getAll().forEach((t) => t.kill());
}, []);
```

Someone wrote the cleanup, then commented it out. Every navigation away from this demo leaks its ScrollTriggers, which then fire against detached DOM nodes.

And note the commented line was **also wrong**: `ScrollTrigger.getAll()` returns *every* trigger on the page, including ones belonging to `DemoHeader`/Lenis. Uncommenting it would have traded a leak for a different bug — killing other components' triggers. That is likely *why* it got commented out: it broke something, and the leak was the quieter failure. This is the single most important fix in the folder.

**Correct fix (the pattern is already in your codebase):**

```js
useEffect(() => {
  const ctx = gsap.context(() => {
    // ...triggers...
  }, containerRef);
  return () => ctx.revert();
}, []);
```

`gsap.context` scopes to `containerRef` and `revert()` kills only what this component created. **`pixel-bloom/PixelBloomWrapper.jsx:15,34` already does exactly this correctly.** You have the right pattern in-house; it just isn't applied consistently. One of two GSAP effects cleans up properly.

**Index-based DOM querying** — [`blur-text/DemoContent.jsx:80-82`](apps/docs/src/app/(marketing)/demo/blur-text/DemoContent.jsx#L80-L82):

```js
const sectionEls = containerRef.current.querySelectorAll("section");
[sectionEls[1], sectionEls[2], sectionEls[3]].forEach(...)
```

Reorder or add a `<section>` and the animation silently targets the wrong nodes. No null guard on `containerRef.current` either. Use `data-*` hooks — `containerRef.current.querySelectorAll("[data-theme-shift]")` — so markup and animation stay coupled by intent, not by ordinal.

**No reduced-motion support anywhere: 0 occurrences across 115 animation demos.** For an animation library this is the most consequential gap in the audit. `gsap.matchMedia()` exists for exactly this:

```js
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  // full timeline; auto-reverted when the query stops matching
});
return () => mm.revert();
```

Users with vestibular disorders get an OS-level setting specifically to prevent this. Right now the library ignores it in every single demo — and demos are what people copy.

---

## 7. Accessibility — 2/10

The worst category, and for an animation library the least defensible.

**Zero reduced-motion. One `aria-*` attribute in 115 demos** (`aria-hidden` on a decorative orb).

**Alt text is noise:** `alt="asset-image"` ×11, `alt="bg image"` ×6, `alt="Nature"` ×5. Five unrelated images in `overflow-text-reveal` all claim to be "Nature". These are decorative backgrounds behind a `bg-black/70` scrim — a screen reader should skip them entirely. The correct value is `alt=""`, which is *meaningful*: it says "decorative, skip me". `alt="bg image"` forces a screen reader to announce "bg image, image" for content that carries none.

**264 `text-[Nvw]` sizes across 59 files.** Viewport-derived font size ignores the user's browser font-size setting completely — a low-vision user who set 24px default gets whatever the viewport dictates. Use `clamp()` with a `rem` term so user preference still participates: `text-[clamp(2rem,4vw,4.5rem)]`.

**Heading hierarchy is used for styling, not structure:**

- [`link-button/page.js:14-17`](apps/docs/src/app/(marketing)/demo/link-button/page.js#L14-L17) — the `<h1>` is the tiny eyebrow "Hyperiux Button Demo" and the real title "Link Button" is a `<p>`. **Inverted**, and inconsistent with the five sibling button demos which do it correctly.
- [`border-beam/page.js:28`](apps/docs/src/app/(marketing)/demo/border-beam/page.js#L28) — `<h1>` is a `0.8vw` label; the actual headline is an `<h2>`.

**`cursor-none` on real buttons** ([LiquidGlassWrapper.jsx:61,64](apps/docs/src/app/(marketing)/demo/liquid-glass-cursor/LiquidGlassWrapper.jsx#L61-L64)) with no `:focus-visible` styling. The custom cursor replaces the pointer for mouse users and gives keyboard users nothing.

Credit where due: `DemoHeader` has `aria-label="Go to homepage"` and marks the wordmark `aria-hidden`. Someone knew how to do this. It just never reached the demos.

---

## 8. Demo Quality — 4/10

**`border-beam` documents six props and demonstrates none.** [`border-beam/page.js:7-14`](apps/docs/src/app/(marketing)/demo/border-beam/page.js#L7-L14) renders a hand-maintained props table:

```js
const propsData = [
  { label: 'size', value: '"md"' },
  { label: 'switch rotate', value: 'size = "sm" | "md" | "line"' },
  ...
]
```

…and then line 77 renders `<BorderBeam />` — **no props at all**. The page tells you six knobs exist and lets you see zero of them. The labels are confused too: `'switch rotate'` isn't a prop name, and its "value" is a description of `size`. A hand-written table also guarantees drift from the real signature.

**Fix:** delete the table; demonstrate the props. Render several `<BorderBeam size="sm" />`, `size="md"`, `colorVariant="colorful"` side by side with the prop shown as a caption. The demo becomes the documentation and cannot drift, because it *is* the code.

`overflow-text-reveal` is the strongest demo here — one section per `direction`, labelled with the prop value, ending in a four-up comparison. That is the right model. It just needs its placeholder content cleaned: [line 89](apps/docs/src/app/(marketing)/demo/overflow-text-reveal/OverflowTextRevealWrapper.jsx#L89) ships `["04", "Dirn", "∞"]` — "Dirn" is not a word.

**Parallel arrays indexed by `i`** — [lines 89-98](apps/docs/src/app/(marketing)/demo/overflow-text-reveal/OverflowTextRevealWrapper.jsx#L89-L98):

```jsx
{["04", "Dirn", "∞"].map((stat, i) => (
  <OverflowTextReveal key={i} ...>
    <span>{stat}</span>
    <span>{["Variants", "Available", "Possibilities"][i]}</span>   // ← second array, indexed by i
```

Two arrays that must stay index-aligned by hand. Reorder one, and stats silently pair with the wrong labels. Use one array of objects and `key={label}` instead of `key={i}`.

**Duplicated prose that has already drifted.** `text-hover/page.js` renders the copy twice, desktop and mobile:

> line 21: *"you can **hover** on the particular label…"*
> line 30: *"you can **click** on the particular label…"*

Same sentence, maintained twice, already inconsistent. Write it once and vary only the verb.

---

## 9. API Usage / Design — 3/10

**The `logoColor` prop is passed eleven different ways across the folder:**

| Value | Count |
|---|---|
| `logoColor="#ffffff"` | 29 |
| `logoColor='#ffffff'` | 20 |
| `logoColor="white"` | 2 |
| `logoColor="#FFFFFF"` | 2 |
| `logoColor={"#ffffff"}` | 1 |
| `logoColor='white'` | 1 |
| `logoColor='#FFFFFF'` | 1 |
| **`logoColor="text-white"`** | **1 — broken** |
| `#ff5f00` / `#1a1a1a` / `#000000` | 1 each |

**Confirmed bug.** `DemoHeader` consumes it as `style={{ color: logoColor }}`, and its default is `logoColor = "#1a1a1a"` — a color value. So [`scroll-distortion/page.js:27`](apps/docs/src/app/(marketing)/demo/scroll-distortion/page.js#L27):

```jsx
<DemoHeader logoColor="text-white" textColor='#ffffff'/>
```

…emits `style="color: text-white"`, which is invalid CSS. The browser discards it and the logo silently falls back to inherited color. It has been wrong long enough to be committed, and **nothing caught it** — no types, no runtime validation, no visual test.

This is the real lesson of the TypeScript section. The author of that line clearly expected a Tailwind class, because half this codebase styles color with Tailwind classes and the other half with hex props. The prop name doesn't disambiguate, and the API accepts anything.

**Fix — make the contract explicit and unrepresentable-when-wrong:**

```jsx
// Option A: keep it a color, validate in dev
if (process.env.NODE_ENV !== "production" && /^(text-|bg-)/.test(logoColor)) {
  console.warn(`DemoHeader: logoColor expects a CSS color, got Tailwind class "${logoColor}".`);
}

// Option B (better): stop passing colors at all — the SVGs already use fill="currentColor"
<DemoHeader className="text-white" />
```

**Option B is the right answer.** Every path in that logo is already `fill="currentColor"`. The `logoColor` prop exists only to set `color` on the wrapper — which `className="text-white"` does natively, composes with variants and dark mode, and makes `logoColor="text-white"` *correct* instead of broken. Deleting the prop fixes the bug and removes eleven-way inconsistency at the source. Same argument for `textColor`.

**Dead alias:** `DemoHeader` line 81 — `const resolvedTextColor = textColor;` — a rename that does nothing.

**Naming inconsistency across the button family:** `btnText` (`ArrowFillButton`, `DotFillBtn`) vs `text` (`CharStaggerButton`, `LinkButton`, `ScrambleLinkButton`). Same concept, two names, and the demos put them side by side so the inconsistency is on display. Pick `text`. Also `DotFillBtn` — the only abbreviated component name in the set.

**`scramble-link-button` passes `showLine={true}`** where its sibling `char-stagger-button` correctly passes bare `showLine`. Minor, but it's the demo teaching redundancy.

---

## 10. Senior Engineer Test — 3/10

If this arrived as an interview submission I would call it **junior-to-mid**, and I want to be precise about why, because the instincts are not junior.

**What reads as senior:** demos are thin and delegate to the library; `gsap.context` + `ctx.revert()` is used correctly in `pixel-bloom`; `transform-gpu backface-hidden` is deliberate; `DemoHeader`'s fetch effect has a proper `isActive` cancellation guard; the `overflow-text-reveal` one-section-per-prop structure is exactly how you demo an enum prop.

**What reads as junior:** the cleanup that was written and then commented out; `[sectionEls[1], sectionEls[2], sectionEls[3]]`; remounting a smooth-scroll root via `key` to replay an animation; six copy-pasted button pages; a props table that documents props the demo never passes; `from"react"` shipped 11 times.

The gap between those two lists is the finding. This isn't someone who doesn't know better — `pixel-bloom` proves they do, and `CODING_STANDARDS.md` proves the team has articulated the rules. It's **an absence of enforcement**. No Prettier, no `no-unused-vars` gate, no Tailwind class linting, no types. Every issue in this audit is one a machine could have caught before review. A senior engineer's real signature is not writing perfect code — it's building the loop that makes the codebase converge without them. That loop doesn't exist here, and 115 demos have drifted in it.

---

## Code Smells

| Smell | Where |
|---|---|
| **Duplicated code** | 6 button demos; 5 transition pairs; 73 CDN URLs; desktop/mobile prose |
| **Dead code** | 4 commented-out blocks; `accents` const; 74 unused React imports; `resolvedTextColor`; `className=""` |
| **Magic numbers** | `h-[750vh]`, `-mt-20`, `h-155`, `radius = innerWidth * 0.15`, `1025px` |
| **Hidden dependencies** | `blur-text` depends on `<section>` *ordinal position* |
| **Poor naming** | `page` (79×), `page2` routes, `DotFillBtn`, `btnText` vs `text`, "Dirn" |
| **Unclear abstractions** | `useIsMobile` inline in a demo; three demo file layouts |
| **Mutable/stale values** | `radius` and the `1025px` check captured once, never updated on resize |
| **Side effects** | Uncleaned ScrollTriggers leaking on unmount |
| **Parallel arrays** | `["04","Dirn","∞"]` + `["Variants","Available","Possibilities"]` by index |
| **Long functions** | `blur-text/DemoContent.jsx` — 495 lines, one component |
| **Deeply nested JSX** | `blur-text`, `overflow-text-reveal` (6+ levels) |

---

## Production Readiness

**Would this ship at Vercel / Linear / Stripe / Framer / Shopify / Apple?**

No — but the blocker is narrower than the issue count suggests. Three things are disqualifying at any of those bars:

1. **Accessibility.** Zero reduced-motion in an animation library, one `aria-*` in 115 demos, and viewport-locked font sizing would fail review at every company listed. Apple ships Reduce Motion as an OS setting; a library that ignores it isn't shippable next to that brand.
2. **The commented-out cleanup.** A known leak, deliberately disabled, merged to `master`. At Stripe or Linear this alone blocks the PR.
3. **No enforcement.** No Prettier, no types, no class linting. Every one of these firms gates merges on exactly this.

What is *not* a blocker: the fundamental structure. Thin demo pages that delegate to the library is the correct architecture and it is already in place. This is a repo that needs a toolchain and a cleanup pass — not a redesign.

## Open Source Quality

**Would developers trust it?** The demos look impressive in a browser, which is what sells a UI library. Reading the source is where trust breaks: a commented-out memory leak and unformatted imports signal *this is not maintained carefully*, and that's the signal that decides adoption for a paid component library.

**Would they copy-paste it?** Yes — that's the danger. They'd copy `key={replayKey}` on a Lenis root, `alt="bg image"`, `text-[7vw]`, `useEffect` with no cleanup, and `logoColor="text-white"`. Demo code is the most-copied code in any library. **Every bad pattern here is one you're actively teaching**, multiplied by every consumer.

**Would they learn good practices?** They'd learn `gsap.context` from `pixel-bloom` and enum-prop demoing from `overflow-text-reveal`. They'd learn the wrong lesson from everything above.

---

## Final Score

| Category | Score |
|---|---|
| Architecture | **4**/10 |
| Code Quality | **3**/10 |
| React / Next.js | **4**/10 |
| TypeScript | **1**/10 |
| Performance | **5**/10 |
| Animation | **3**/10 |
| Accessibility | **2**/10 |
| Demo Quality | **4**/10 |
| API Design | **3**/10 |
| Senior Level | **3**/10 |
| **Overall** | **32**/100 |

## Final Verdict

### ⚠️ Needs Work

Not "Poor" — the architecture is sound, the demos are appropriately thin, and there is demonstrable competence in the codebase (`pixel-bloom`, `DemoHeader`'s cancellation guard, `CODING_STANDARDS.md`). But an animation library with zero reduced-motion support, a deliberately-disabled memory leak on `master`, and a provably broken prop in a shipped demo cannot be called Good.

## Rewrite Score

### ~25%

Deliberately low, and that is the good news. The other 75% is *correct in shape and wrong in detail* — fixable by tooling, not rewriting:

- **~10%** is deleted, not rewritten (74 unused imports, 4 commented blocks, dead consts).
- **~10%** is mechanical (Prettier; `page`→`Page`; `alt=""`; CDN constant).
- **~5%** is genuine rewriting: `blur-text/DemoContent.jsx`'s effect, the `overflow-text-reveal` replay, the 6 button demos → `ButtonDemoStage`, `useIsMobile` → `useSyncExternalStore`.

A focused week gets this to 70+. The reduced-motion work is the long pole, because it touches the library, not just the demos.

---

## Top 10 Improvements (highest impact first)

1. **Uncomment and fix the GSAP cleanup** — `blur-text/DemoContent.jsx:107`. Use `gsap.context(..., containerRef)` + `ctx.revert()`, not `ScrollTrigger.getAll()`. A known, disabled leak on `master` is the single worst signal in the repo.
2. **Add `prefers-reduced-motion` support** — 0/115 today. Wrap timelines in `gsap.matchMedia()`. For an animation library this is both an a11y obligation and a credibility issue.
3. **Add Prettier + tighten ESLint, gate in CI** — kills `from"react"` (×11), 74 unused imports, and the whole formatting category permanently. Add `eslint-plugin-tailwindcss` to catch `max-smd:`/`leadng-`. Highest ratio of issues-closed to effort in this list.
4. **Fix the `logoColor` API** — delete the prop, use `className` + the existing `fill="currentColor"`. Fixes the confirmed `scroll-distortion` bug and collapses 11-way inconsistency at the source.
5. **Fix accessibility fundamentals** — `alt=""` on all 22 decorative images; fix the inverted `<h1>`/`<p>` in `link-button`; add `:focus-visible` wherever `cursor-none` is used.
6. **Extract `ButtonDemoStage`** — 6 demos → 1 layout + 6 six-line files, each showing only its API.
7. **Replace the `key={replayKey}` replay** — expose a replay handle on `OverflowTextReveal`. Stop teaching page-teardown as an animation technique; the missing API is the real bug.
8. **Make `border-beam` demo its props** — delete the hand-written table, render the variants. The demo should *be* the documentation.
9. **Ship types** — `.d.ts` per component + `checkJs`. Keeps JS authoring; gives consumers IntelliSense and makes `logoColor="text-white"` a compile error.
10. **Sweep the small stuff** — `page`→`Page` (79); CDN constant (73 URLs); `h-screen`→`min-h-dvh` on growing content; `w-screen`→`w-full`; `text-[Nvw]`→`clamp()`; `data-*` hooks instead of `sectionEls[1]`.

---

## Components Whose Logic Can Be Improved (same visual effect, better implementation)

Every item preserves the current visual result.

### 1. `blur-text/DemoContent.jsx` — highest priority
- **Now:** N ScrollTriggers with identical config; index-based `<section>` lookup; scrubs `backgroundColor`/`color`; cleanup commented out; 495 lines.
- **Better:** one `gsap.timeline` + one ScrollTrigger; `data-theme-shift` hooks; scrub `opacity` on an overlay or a CSS variable; `gsap.context` + `revert()`; split into sub-components.
- **Why:** removes the leak, removes per-frame full-section repaints, and stops breaking when a section is reordered.

### 2. `overflow-text-reveal/OverflowTextRevealWrapper.jsx`
- **Now:** `key` bump on `<ReactLenis root>` remounts the page to replay one animation; parallel index-aligned arrays; `key={i}`.
- **Better:** imperative `replay()` handle; single array of objects; `key={label}`.
- **Why:** replays without destroying the scroll system or re-decoding six images; kills the silent-mispairing class of bug.

### 3. `liquid-glass-cursor/LiquidGlassWrapper.jsx`
- **Now:** `useState(false)` + effect + unthrottled `resize` → flash of desktop UI on mobile; hook defined inside a demo.
- **Better:** shared `useIsCoarsePointer` in `hooks/` built on `useSyncExternalStore` + `matchMedia`.
- **Why:** no double-render, no flash, no manual listener — and the demo stops teaching "define your hooks in your page".

### 4. `pixel-bloom/PixelBloomWrapper.jsx`
- **Now:** 8 copy-pasted `.curved-scroll-box` divs; `1025px` gate vs `max-md:` classes; `radius` and the gate captured once, no resize handling; spacer divs; `750vh`.
- **Better:** `.map()` over a config array; one breakpoint source of truth via `gsap.matchMedia()`; padding instead of spacer divs; named constants.
- **Why:** `matchMedia` re-runs on breakpoint change, fixing the resize bug for free. Keep the existing `gsap.context` — it's already right.

### 5. The 6 button demos
- **Now:** ~95% duplicated scaffold.
- **Better:** one `ButtonDemoStage` + per-demo children.
- **Why:** fixes `alt`, URL, and heading-order bugs in one place instead of six.

### 6. The 5 transition pairs (`block` / `chess-grid` / `pixel` / `svg-brush` / `radial-slice`)
- **Now:** identical page/page2 files, differing by heading + href; all 6 `page2` files lack `generateMetadata`; `page2` is a public route name.
- **Better:** one `TransitionDemo`/`TransitionDestination` pair, config-driven; add metadata; rename to `/destination`.
- **Why:** removes ~10 near-duplicate files and closes the SEO gap systematically.

### 7. `animated-faq/page.js`
- **Now:** `h-screen` clips expanding content; `defaultOpenItems` recomputed each render; data declared below use.
- **Better:** `min-h-dvh`; hoist to a module constant; move `faqItems` above the component.
- **Why:** fixes a real overflow bug and stops re-deriving a constant.

### 8. `border-beam/page.js`
- **Now:** documents 6 props via a hand-maintained array, renders `<BorderBeam />` with none.
- **Better:** render the variants; caption each with its prop.
- **Why:** a demo that shows the API can't drift from it.

### 9. `scroll-distortion/page.js`
- **Now:** `logoColor="text-white"` — confirmed broken; commented-out import.
- **Better:** `className="text-white"` after the `DemoHeader` API fix; delete line 2.
- **Why:** the logo currently renders the wrong color.

### 10. `scramble-text/ScrambleTextWrapper.jsx`
- **Now:** `max-md:leading-[1.2]` typo; `h-155`/`h-130`/`h-90`/`h-75` magic sizes; unused React import.
- **Better:** fix the typo; name the sizes or use aspect ratios; drop the import.
- **Why:** the intended line-height has never once applied in production.
