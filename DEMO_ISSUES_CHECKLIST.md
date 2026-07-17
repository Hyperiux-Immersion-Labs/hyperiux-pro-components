# Demo Issues Checklist — HYPERIUX-PRO-COMPONENTS

**Scope:** `apps/docs/src/app/(marketing)/demo` (115 effects, 140 files, 6,162 LOC)
**Date:** 2026-07-17
**Format:** one issue → one fix. Detailed reasoning lives in `DEMO_CODE_AUDIT.md`.

Severity: 🔴 Critical · 🟠 Major · 🟡 Minor · ⚪ Nitpick

---

## 🔴 CRITICAL

### C1. GSAP cleanup is commented out — memory leak on `master`
**Where:** `blur-text/DemoContent.jsx:107`
**Fix:** Wrap the effect in `gsap.context(() => {...}, containerRef)` and return `() => ctx.revert()`. Do **not** just uncomment the old line — `ScrollTrigger.getAll()` kills every trigger on the page including `DemoHeader`'s, which is likely why it was disabled. `pixel-bloom/PixelBloomWrapper.jsx:15,34` already does this correctly; copy that pattern.

### C2. Zero `prefers-reduced-motion` support across all 115 demos
**Where:** entire folder — 0 occurrences
**Fix:** Wrap every timeline in `gsap.matchMedia()` with a `(prefers-reduced-motion: no-preference)` condition; return `() => mm.revert()`. Users with vestibular disorders set this at the OS level. For an animation library this is an obligation, not a nice-to-have.

### C3. `logoColor="text-white"` — confirmed broken prop in a shipped demo
**Where:** `scroll-distortion/page.js:27`
**Fix:** `DemoHeader` consumes it as `style={{ color: logoColor }}`, so this emits invalid CSS (`color: text-white`) and the logo silently falls back to inherited color. Best fix: delete the `logoColor`/`textColor` props entirely and use `className="text-white"` — the logo SVG paths already use `fill="currentColor"`.

### C4. No types of any kind for a component library
**Where:** repo-wide — 0 `.ts`/`.tsx`, 0 PropTypes, 3 JSDoc annotations in 6,162 lines
**Fix:** Ship a hand-written `index.d.ts` per component and enable `checkJs` in `jsconfig.json`. Keeps JS authoring; consumers get IntelliSense. This is what would have caught C3 at author time.

---

## 🟠 MAJOR

### M1. Six button demos are ~95% identical copies
**Where:** `char-stagger-button`, `char-stagger-primary-button`, `arrow-fill-button`, `dot-fill-button`, `link-button`, `scramble-link-button`
**Fix:** Extract `ButtonDemoStage({ title, bg, children })` holding the shared scaffold, background `<Image>` and scrim. Each demo drops to ~6 lines showing only its own API. Fixes the duplicated `alt`, URL and heading bugs in one place.

### M2. Replaying an animation remounts the entire smooth-scroll root
**Where:** `overflow-text-reveal/OverflowTextRevealWrapper.jsx:15`
**Fix:** `key={replayKey}` on `<ReactLenis root>` destroys Lenis, all 6 sections and all 6 images to restart one animation. Expose a `replay()` handle on `OverflowTextReveal` and call it via ref. The missing API is the real bug — the demo is working around it.

### M3. No Prettier — unformatted code shipped as an exemplar
**Where:** `from"react"` ×11 across 4 files; `step:"01"` style object literals
**Fix:** Add Prettier + `eslint-config-prettier`, run `--write` once, gate in CI. Highest ratio of issues-closed to effort in this document.

### M4. Animation depends on `<section>` ordinal position
**Where:** `blur-text/DemoContent.jsx:80-82` — `[sectionEls[1], sectionEls[2], sectionEls[3]]`
**Fix:** Use `data-*` hooks (`querySelectorAll("[data-theme-shift]")`) so markup and animation couple by intent. Add a null guard on `containerRef.current`. Today, reordering a section silently animates the wrong nodes.

### M5. Alt text is meaningless on 22 decorative images
**Where:** `alt="asset-image"` ×11, `alt="bg image"` ×6, `alt="Nature"` ×5
**Fix:** Use `alt=""` — it is *meaningful*, telling screen readers to skip decorative content. `alt="bg image"` forces an announcement of "bg image, image" for a background behind a `bg-black/70` scrim.

### M6. `border-beam` documents 6 props and demonstrates none
**Where:** `border-beam/page.js:7-14` (table) vs `:77` (`<BorderBeam />`, no props)
**Fix:** Delete the hand-maintained `propsData` array; render actual variants (`size="sm"`, `size="md"`, `colorVariant="colorful"`) side by side with captions. A demo that shows the API cannot drift from it.

### M7. Hydration flash — `useIsMobile` assumes desktop on first paint
**Where:** `liquid-glass-cursor/LiquidGlassWrapper.jsx:16-30`
**Fix:** `useState(false)` + effect means the cursor mounts then unmounts on phones. Replace with a shared `useIsCoarsePointer` in `hooks/` using `useSyncExternalStore` + `matchMedia`. Removes the double-render, the flash, and the unthrottled `resize` listener at once.

### M8. Breakpoint drift + no resize handling
**Where:** `pixel-bloom/PixelBloomWrapper.jsx:14` — gates on `1025px` while JSX uses `max-md:` (768px)
**Fix:** Two definitions of "mobile" in one file, and the check runs once with no listener — resize narrow→wide and the animation never initializes. `radius` (line 19) is likewise stale. Use `gsap.matchMedia()`, which re-runs on breakpoint change.

### M9. Scrubbing paint-triggering properties on scroll
**Where:** `blur-text/DemoContent.jsx:83-104` — scrubs `backgroundColor` + `color`
**Fix:** These are non-compositable; every scroll frame repaints full-viewport sections. Scrub `opacity` on a stacked overlay layer or drive a CSS custom property so the compositor handles it.

### M10. Redundant ScrollTriggers doing one trigger's job
**Where:** `blur-text/DemoContent.jsx:83-104` — one per section *plus* one per `[data-subtext]`, all identical config
**Fix:** One `gsap.timeline({ scrollTrigger: {...} })` with multiple tweens at position `0`. Faster and dramatically clearer.

### M11. `h-screen` clips expanding accordion content
**Where:** `animated-faq/page.js:22`
**Fix:** Use `min-h-dvh`. Open enough FAQ items and content is cut off today. `h-screen` is also wrong on mobile browsers with dynamic toolbars — worth sweeping all 64 uses.

### M12. All 6 `page2` routes missing `generateMetadata`
**Where:** `block-transition/page2`, `chess-grid-transition/page2`, `pixel-transition/page2`, `svg-brush-transition/page2`, `radial-slice-transition/page2`, `page-flip-transition/page2`
**Fix:** Add `generateMetadata` to each, matching the sibling `page.js`. Also rename the route — `/demo/block-transition/page2` is a meaningless public URL; use `/destination`.

### M13. Five transition demo pairs are duplicated files
**Where:** `block-transition/page.js` ≡ `chess-grid-transition/page.js` (differ only by `<h1>` + `href`); same for their `page2` files
**Fix:** One config-driven `TransitionDemo` / `TransitionDestination` pair. Removes ~10 near-duplicate files and closes M12 systematically.

### M14. Two Tailwind typos that silently do nothing
**Where:** `scramble-text/ScrambleTextWrapper.jsx:33` (`max-md:leadng-[1.2]`); `overflow-text-reveal/OverflowTextRevealWrapper.jsx:40` (`max-smd:text-sm`)
**Fix:** Correct to `leading` / `max-sm`. Add `eslint-plugin-tailwindcss` — both are caught mechanically. The intended line-height has never applied in production.

### M15. Inverted heading semantics
**Where:** `link-button/page.js:14-17` — `<h1>` is the tiny eyebrow, the real title is a `<p>`; `border-beam/page.js:28` — `<h1>` is a `0.8vw` label
**Fix:** `<h1>` = page title, always. `link-button` is also inconsistent with its five sibling button demos, which do it correctly.

### M16. 264 viewport-locked font sizes ignore user font settings
**Where:** `text-[Nvw]` ×264 across 59 files
**Fix:** Use `clamp()` with a `rem` term — `text-[clamp(2rem,4vw,4.5rem)]` — so a low-vision user's browser setting still participates. Pure `vw` overrides user preference entirely.

### M17. `cursor-none` on buttons with no focus styling
**Where:** `liquid-glass-cursor/LiquidGlassWrapper.jsx:61,64`
**Fix:** Add `:focus-visible` rings. The custom cursor replaces the pointer for mouse users and leaves keyboard users with no visible focus at all.

---

## 🟡 MINOR

### N1. 74 files with unused `import React`
**Fix:** Not needed with the modern JSX transform (React 19 / Next 16). Remove via `eslint --fix` with `no-unused-vars`.

### N2. 79 files declare lowercase `const page = () => {}`
**Fix:** Rename to `Page`. Works today only because Next imports the default export and never renders `<page />` — you're relying on the mistake being invisible. Some files already use `Page`; be consistent.

### N3. 73 hardcoded R2 CDN URLs
**Fix:** Extract `const CDN = "https://pub-….r2.dev/vault-listing-images/assets-images"` to a shared module. Today a bucket rotation means editing 73 strings.

### N4. Four commented-out code blocks left in place
**Where:** `scroll-distortion/page.js:2`; `border-beam/page.js:23-24`; `pixel-bloom/PixelBloomWrapper.jsx:55`; `blur-text/DemoContent.jsx:129-133`
**Fix:** Delete. `CODING_STANDARDS.md` already requires this. Note the `blur-text` block is the only consumer of the `accents` const (line 13) — that dies with it.

### N5. Parallel arrays index-aligned by hand
**Where:** `overflow-text-reveal/OverflowTextRevealWrapper.jsx:89-98`
**Fix:** `["04","Dirn","∞"]` and `["Variants","Available","Possibilities"]` must stay aligned by `i`. Use one array of objects; reordering currently mispairs labels silently.

### N6. Index keys `key={i}`
**Where:** `overflow-text-reveal:90,136`; `slide-text-reveal/SlideTextWrapper.jsx:103`
**Fix:** Key on stable content (`key={label}`), as `scramble-text:87` already does correctly.

### N7. Static work recomputed every render
**Where:** `animated-faq/page.js:15-17` — filters + maps a module-level constant in the component body
**Fix:** Hoist `defaultOpenItems` to a module constant. It can never change.

### N8. Data declared below its use
**Where:** `animated-faq/page.js:60` — `faqItems` used at line 15
**Fix:** Move above the component. Works via closure timing, but readers hit the reference before the definition.

### N9. `w-screen` causes horizontal overflow
**Fix:** `100vw` includes the scrollbar gutter, producing a horizontal scrollbar. Use `w-full`.

### N10. Duplicated prose that has already drifted
**Where:** `text-hover/page.js:21` ("hover on the particular label") vs `:30` ("click on the particular label")
**Fix:** Same sentence maintained twice, already inconsistent. Write once; vary only the verb.

### N11. Magic numbers with no names
**Where:** `h-[750vh]`, `-mt-20`, `h-155`/`h-130`/`h-90`/`h-75`, `radius = innerWidth * 0.15`, `1025px`
**Fix:** Name them at module level. `CODING_STANDARDS.md` §2 requires exactly this.

### N12. Spacer divs used for layout
**Where:** `pixel-bloom/PixelBloomWrapper.jsx:56,84` — `<div className="h-[20vh] w-full"></div>`
**Fix:** Use padding on the parent. `CODING_STANDARDS.md` §6 prefers layout semantics over spacer elements.

### N13. Eight copy-pasted image boxes
**Where:** `pixel-bloom/PixelBloomWrapper.jsx:59-82`
**Fix:** `.map()` over a config array of `{ type, src, side }`. Also gate offscreen instances — 8 `PixelBloom` (2 video) mount at once on a `750vh` page.

### N14. Inconsistent prop naming across the button family
**Where:** `btnText` (`ArrowFillButton`, `DotFillBtn`) vs `text` (`CharStaggerButton`, `LinkButton`, `ScrambleLinkButton`)
**Fix:** Standardize on `text`. The demos sit side by side, so the inconsistency is on display.

### N15. Three inconsistent demo file layouts
**Where:** `page.js` alone / `page.js` + `DemoContent.jsx` / `page.js` + `<Name>Wrapper.jsx`
**Fix:** Pick one: `page.js` (server + metadata) + `DemoContent.jsx` (client). Apply across all 115.

### N16. Shared hook defined inside a demo file
**Where:** `liquid-glass-cursor/LiquidGlassWrapper.jsx:16-27`
**Fix:** Move `useIsMobile` to `hooks/`. As written, the demo teaches readers to define hooks in their pages.

### N17. `blur-text/DemoContent.jsx` is 495 lines in one component
**Fix:** Split into section sub-components. It's 8× the folder average (~44 LOC) and the only demo of this size.

---

## ⚪ NITPICKS

### P1. `logoColor` passed 11 different ways
`"#ffffff"` (29), `'#ffffff'` (20), `"white"` (2), `"#FFFFFF"` (2), `{"#ffffff"}` (1), `'white'` (1), `'#FFFFFF'` (1), `"text-white"` (1, broken). **Fix:** resolved entirely by C3 — delete the prop.

### P2. Dead alias in `DemoHeader`
`const resolvedTextColor = textColor;` — a rename that does nothing. **Fix:** delete.

### P3. Placeholder text shipped
`overflow-text-reveal:89` renders `"Dirn"` — not a word. **Fix:** replace with real copy.

### P4. Empty and padded class strings
`className=""`, `className="  scale-150"`. **Fix:** remove or trim (Prettier + Tailwind lint handles this).

### P5. Redundant boolean prop
`scramble-link-button/page.js:26` — `showLine={true}` where `char-stagger-button` correctly passes bare `showLine`. **Fix:** use the shorthand.

### P6. `DotFillBtn` is the only abbreviated component name
**Fix:** rename to `DotFillButton` to match its five siblings.

### P7. Inconsistent quote style
Mixed `'` and `"` throughout. **Fix:** Prettier (M3).

### P8. Broken JSX string indentation
`liquid-glass-cursor/LiquidGlassWrapper.jsx:72-73` — text unindented mid-element. **Fix:** Prettier (M3).

---

## Fix Order (by impact ÷ effort)

| # | Action | Closes |
|---|---|---|
| 1 | Add Prettier + ESLint rules + `eslint-plugin-tailwindcss`, gate in CI | M3, M14, N1, P4, P7, P8 |
| 2 | Fix GSAP cleanup via `gsap.context` | **C1** |
| 3 | Add `gsap.matchMedia()` reduced-motion | **C2**, M8 |
| 4 | Delete `logoColor`/`textColor`, use `className` | **C3**, P1, P2 |
| 5 | `alt=""` + heading order + focus rings | M5, M15, M17 |
| 6 | Extract `ButtonDemoStage` | M1, N14 |
| 7 | Extract `TransitionDemo` pair + metadata | M12, M13 |
| 8 | Refactor `blur-text` effect | M4, M9, M10, N4, N17 |
| 9 | `replay()` handle on `OverflowTextReveal` | M2, N5, N6 |
| 10 | Ship `.d.ts` + `checkJs` | **C4** |
| 11 | Sweep: `page`→`Page`, CDN const, `h-screen`→`min-h-dvh`, `w-screen`→`w-full`, `vw`→`clamp()` | N2, N3, N9, M11, M16 |

**Estimated rewrite: ~25%** — roughly 10% deletion, 10% mechanical, 5% genuine refactor. The architecture is sound; the enforcement loop is missing.
