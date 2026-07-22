# clippath-slider (carousels)

## Summary

`clippath-slider` is a fullscreen, autoplaying image slider that transitions between slides via a two-arc radial clip-path sweep drawn on `<canvas>`, layered over a dual-background crossfade, GSAP `SplitText` line reveals, and a custom circular cursor that flips a left/right arrow depending on pointer position. The registry package (`registry.json`, `index.jsx`, `ClippathSliderComp.jsx`) is schema-correct and installable, but the implementation has one real memory leak (an uncancelled `requestAnimationFrame` loop), a High-severity accessibility gap (slide navigation is only reachable by pointer, with no keyboard or screen-reader path), no `prefers-reduced-motion` handling, and a source-of-truth drift between the registry copy and the docs demo copy that changes what ships to CLI users versus what they see on the preview page. `npm pack` (Step 9 of the component workflow) is also broken for this package because `package.json` references a file that doesn't exist.

## Implementation overview

- `index.jsx` — hardcodes 7 demo slides (Picsum placeholder images) and renders `ClippathSliderComp` with a `clueText` hint prop. Default export `ClipPathSlider`, matching `registry.json`'s `exportName`/`exportKind`.
- `ClippathSliderComp.jsx` (`"use client"`) — the actual slider:
  - Two absolutely-positioned background layers (`bgRefA`/`bgRefB`) crossfade via GSAP `scale`/`opacity` tweens, alternating which layer is "active" (`activeLayerRef`).
  - A foreground `<canvas>` draws a two-wedge radial "clock-hand" sweep (`runSweepAnimation`) that reveals the incoming slide's image through the transitioning outgoing layer; a second static `<canvas>` draws two fixed guide lines (`drawStaticLines`) recomputed on resize.
  - `SplitText` splits the slide title/description into masked lines that animate in on every slide change, reverted and rebuilt on each transition (`fadeOutText`, the `TEXT IN` effect).
  - `changeSlide` sequences: kill old tweens → swap the non-active layer's image → fade text out → run the canvas sweep → swap z-index/opacity of the two background layers → update `currentSlide` state.
  - Autoplay advances every 8s via `setTimeout` (not `setInterval`), re-armed by the `[isTransitioning, nextSlideNav, slides.length]` effect.
  - A `window`-level `mousemove` listener plus a `requestAnimationFrame` render loop lerp a custom cursor toward the pointer and flip its two line segments into a "<" or ">" glyph depending on which half of the screen the pointer is over.
  - Full-viewport click layer (`onClick`) advances/retreats the slide based on which half of the screen was clicked.
- `registry.json` — `type: "registry:component"`, `category: "carousels"`, `tier: "pro"`, `main: "index.jsx"`, `files` array lists both `.jsx` files with correct targets under `src/components/effects/clippath-slider/`.
- `apps/docs/public/r/clippath-slider.json` — generated mirror correctly reflects `tier: "pro"` by omitting source code (metadata only), consistent with the pro-tier gating described in `developer-new-component.md`.

## Strengths

- Careful animation bookkeeping inside `changeSlide`: `gsap.killTweensOf` is called before every new tween on the same targets (`ClippathSliderComp.jsx#L275`, `#L289`, `#L294`), and `SplitText` instances are `.revert()`-ed before a new one is created (`ClippathSliderComp.jsx#L112-115`, `#L142-145`), avoiding tween/DOM buildup across repeated transitions.
- The window `resize` listener that redraws both canvases is properly added and removed (`ClippathSliderComp.jsx#L92-103`).
- The autoplay `setTimeout` is cleared both on unmount and before every manual transition (`ClippathSliderComp.jsx#L244`, `#L316`), preventing a stray autoplay firing mid-transition.
- An `aria-live="polite"` region announces the current slide name/index on every change (`ClippathSliderComp.jsx#L484-486`), which is a good building block for accessibility (though not sufficient alone — see below).
- `registry.json` is schema-complete and internally consistent: `name` matches the folder, `main` points at an existing file, every file the code imports (`ClippathSliderComp.jsx`) is listed with a correct `target`, and `previewUrl: "/demo/clippath-slider"` matches the actual route resolved by `apps/docs/src/app/(marketing)/demo/clippath-slider/page.js`.

## Risks and issues

### High

1. **Uncancelled `requestAnimationFrame` loop — leaks on every mount/unmount cycle.** The cursor-follow effect starts a self-recursive loop with `render()` calling `requestAnimationFrame(render)` (`registry/effects/carousels/clippath-slider/ClippathSliderComp.jsx#L456-469`), but the loop's frame ID is never captured, and the effect's cleanup only removes the two `mousemove`/`mouseleave` listeners (`ClippathSliderComp.jsx#L470-473`) — it never calls `cancelAnimationFrame`. A `rafRef` ref exists and is even referenced defensively elsewhere (`ClippathSliderComp.jsx#L245`: `if (rafRef.current) cancelAnimationFrame(rafRef.current)`), but `rafRef.current` is never assigned anywhere in the file (confirmed via full-file search), so that guard is a no-op. Once mounted, this loop runs forever — on route navigation away from the demo page, on unmount, and on every remount (e.g. React StrictMode's double-invoke in dev, or a client-side route back-and-forth) a new orphaned loop stacks on top of the previous ones, each calling `gsap.set` every frame indefinitely. This is a genuine, unbounded memory/CPU leak. Severity: High (per rubric: "memory leak, no cleanup on unmount").
2. **Slide navigation has no keyboard or screen-reader path.** The only way to advance/retreat slides is clicking a full-viewport, non-interactive `<div onClick=...>` (`ClippathSliderComp.jsx#L525-533`). It is not a `<button>`, has no `tabIndex`, no `onKeyDown`, and no `role`. A keyboard-only or screen-reader user has no way to trigger `nextSlideNav`/`prevSlideNav` at all — the `aria-live` region (`#L484-486`) will announce autoplay-driven changes, but there is no operable control for a non-pointer user to control the carousel themselves. Severity: High (per rubric: "accessibility failure blocking keyboard/screen-reader users from core functionality").

### Medium

3. **No `prefers-reduced-motion` handling anywhere.** Confirmed via `grep` across the effect folder and the docs component copy — no match for `prefers-reduced-motion` or `matchMedia`. The canvas sweep, cross-fade tweens, `SplitText` line reveals, and the 8-second autoplay all run unconditionally regardless of the user's OS-level reduced-motion preference.
4. **Continuous rAF loop never suspends when hidden/offscreen.** The cursor-follow loop (`ClippathSliderComp.jsx#L456-469`) is a genuine continuous `requestAnimationFrame` loop with no `createSuspendedRaf`/`createVisibilityGate` pattern applied (none of those files exist anywhere under `registry/effects/carousels/`, confirmed via `find`). Per `registry/effects/_shared/README.md`, the `carousels` category was not part of the F-042 rollout scope, so this is flagged at Medium rather than High per the audit brief's explicit carve-out — but combined with finding #1 (the loop is never even cancelled), the practical impact is worse than a typical "doesn't pause when hidden" gap.
5. **Registry-distributed source has drifted from the docs demo copy shown to users before they install.** `apps/docs/src/components/clip-path-slider/ClippathSliderComp.jsx` (what the live `/demo/clippath-slider` preview renders, via `apps/docs/src/app/(marketing)/demo/clippath-slider/page.js#L1`) is not identical to `registry/effects/carousels/clippath-slider/ClippathSliderComp.jsx` (what `npx`-style installs actually deliver), even though `developer-new-component.md`'s Step 3 workflow requires the registry copy to be a straight copy of the docs copy. Concrete diffs:
   - Responsive breakpoints: the registry copy uses `max-md:`/`max-xl:` prefixes throughout (`registry/.../ClippathSliderComp.jsx#L540, #L544, #L556, #L559, #L581`), while the docs copy uses `max-sm:`/`max-md:` (`apps/docs/.../ClippathSliderComp.jsx#L540, #L544, #L559, #L562, #L584`) — the docs copy's convention matches `CODING_STANDARDS.md`'s documented rule ("Use `max-sm:` for mobile-specific overrides and `max-md:` for tablet-specific overrides"), the registry copy's does not.
   - The description `<p>` in the docs copy carries an inline `style={{ textShadow: "0 1px 12px rgba(0, 0, 0, 0.55)" }}` for legibility over busy photo backgrounds (`apps/docs/.../ClippathSliderComp.jsx#L547-549`); the registry copy's equivalent element has no such style (`registry/.../ClippathSliderComp.jsx#L546-548`), so CLI-installed instances render less-legible description text than the demo.
   - The custom cursor is hidden at `max-xl:` in the registry copy (`registry/.../ClippathSliderComp.jsx#L556, #L559`, hidden on tablets and below) vs. `max-md:` in the docs copy (`apps/docs/.../ClippathSliderComp.jsx#L559, #L562`, only hidden on small mobile) — a real behavioral difference in which viewport widths get the custom-cursor experience.
   - The `clueText` hint pill has different spacing/leading/radius rules between the two copies (`registry/.../ClippathSliderComp.jsx#L581` vs `apps/docs/.../ClippathSliderComp.jsx#L584-586`).
   Net effect: what a developer evaluates on the demo page is not exactly what `npx shadcn`-style install of this registry entry produces.
6. **`package.json` is broken for `npm pack` and doesn't follow the documented schema.** `registry/effects/carousels/clippath-slider/package.json#L5-9` sets `"main": "clippath-slider.jsx"` and `"files": ["clippath-slider.jsx", "registry.json"]`, but no file named `clippath-slider.jsx` exists anywhere in the folder (confirmed via `find` — only `index.jsx` and `ClippathSliderComp.jsx` exist). Per `developer-new-component.md`'s Step 9 (`cd registry/effects/{category}/{slug} && npm pack`), this would produce a tarball missing the real component source. Separately, `developer-new-component.md`'s Step 5 says the package.json should list `react` and packages like `gsap` under `peerDependencies`; this file instead lists `"dependencies": { "gsap": "*" }` (`package.json#L14-16`) and omits `react` entirely. Scoped to Medium because the primary CLI install path (`registry.json` → `apps/docs/public/r/clippath-slider.json`) is correct and unaffected — only the secondary npm-tarball distribution path is broken.

### Low

7. **Unused `nextSlideIndex` state.** `const [nextSlideIndex, setNextSlideIndex] = useState(0)` (`ClippathSliderComp.jsx#L11`) is written on every transition (`ClippathSliderComp.jsx#L253`) but its value is never read anywhere in the file — a dead state variable that forces one extra re-render per slide change for no purpose. Violates `CODING_STANDARDS.md`'s "No unused variables" checklist item.
8. **Magic numbers not extracted to named constants**, contrary to `CODING_STANDARDS.md`'s "Magic Numbers → Named Constants" section: the autoplay delay `8000` (`ClippathSliderComp.jsx#L314`), the cursor lerp factor `0.12` (`#L457-458`), the guide-line `gap = 28` (`#L54`), the clock-hand hours `1.5`/`4.5` (`#L52-53`, `#L172-173`), and the scale factors `1.25`/`1.5` used for background/image zoom are all inlined at their use sites rather than declared as module-level constants.
9. **No `cursor: none` applied anywhere.** The component renders a custom circular cursor (`ClippathSliderComp.jsx#L554-578`) but never sets `cursor: none` on the interactive surface, so the native OS pointer remains visible on top of/alongside the custom cursor on any pointer device wide enough to show it (confirmed via full-file grep for `cursor`, no CSS `cursor` property found).
10. **File structure doesn't follow `CODING_STANDARDS.md`'s documented section ordering** (imports → constants → component). There is no constants section at all — the file goes directly from imports and `gsap.registerPlugin(SplitText)` into the component body.

## Accessibility assessment

- The only interactive control for the entire slider (next/prev) is a full-viewport `<div onClick>` with no keyboard, focus, or ARIA affordance — a hard blocker for keyboard-only and screen-reader users (High finding #2 above).
- The `aria-live="polite"` region (`ClippathSliderComp.jsx#L484-486`) is a genuinely good pattern for announcing slide changes to assistive tech, but it only helps users who can already trigger a change (i.e., mouse/touch users) or who are watching the autoplay cycle passively.
- No `prefers-reduced-motion` short-circuit exists, so users who have requested reduced motion still get the full canvas sweep, cross-fade, and line-reveal animation stack on every 8-second autoplay tick (Medium finding #3).
- Images used as CSS `background-image` (not `<img>`) have no textual alternative beyond the adjacent title/description text, which is acceptable since the visible text already conveys the slide's content.

## Performance assessment

- The uncancelled cursor-follow `requestAnimationFrame` loop (High finding #1) is the standout performance issue: it runs indefinitely, including after unmount, and stacks additional concurrent loops on remount.
- The canvas sweep animation (`runSweepAnimation`) recomputes trig and redraws the full canvas on every `onUpdate` tick of a GSAP tween — bounded to the 1.2s transition duration, so this is not a leak, just a moderately expensive per-transition cost; could not be measured without a profiling run (not attempted in this audit).
- `SplitText` is rebuilt on every slide change (`ClippathSliderComp.jsx#L116-121`) inside a `requestAnimationFrame` callback rather than synchronously, and is properly `.revert()`-ed beforehand, so this does not accumulate DOM nodes across transitions.
- No `createSuspendedRaf`/visibility-gate pattern is present for the continuous cursor loop (Medium finding #4), so the loop keeps running (at least until it leaks per finding #1) even when the tab is backgrounded or the slider scrolls out of view.

## SEO and content-surface assessment

- The component is a client component (`"use client"`, `ClippathSliderComp.jsx#L1`); the first slide's title and description render as real text in the DOM (`ClippathSliderComp.jsx#L540-548`) and are not locked behind canvas/WebGL, so search engines should be able to index at least the initially-rendered slide's copy under server-side rendering/hydration.
- Only the currently active slide's text is present in the DOM at any time — the other six slides' names/descriptions are never rendered to the DOM (they only ever appear as canvas-drawn images), so none of that copy is crawlable or accessible to a screen reader unless the user actually navigates to that slide.
- Background images are loaded from `picsum.photos` (`registry/effects/carousels/clippath-slider/index.jsx#L9,15,21,27,33,39,45`) — fine for a demo, but a real deployment would need to replace these with real, appropriately `alt`-described assets; there's no `alt` text mechanism for these images at all since they're CSS background images / canvas draws, not `<img>` tags.

## Responsive / mobile / touch behavior assessment

- The custom cursor is hidden below the `xl` breakpoint (`max-xl:hidden`, `ClippathSliderComp.jsx#L556, #L559`), which is sensible since touch devices have no persistent pointer to track.
- The full-viewport click layer (`ClippathSliderComp.jsx#L525-533`) responds to `onClick`, which fires for both mouse clicks and touch taps, so left/right navigation works on touch without extra code.
- Text sizing uses `vw`-based arbitrary values with `max-md:`/`max-xl:` (registry copy) overrides (`ClippathSliderComp.jsx#L540, #L546`), scaling with viewport width; this generally holds up across breakpoints but was not verified in an actual mobile browser as part of this audit (no browser/device testing was performed).
- `w-screen`/`h-screen` sizing on the root `<section>` (`ClippathSliderComp.jsx#L483`) can introduce horizontal scroll on platforms where a vertical scrollbar takes up layout width, since `100vw` includes the scrollbar gutter; not confirmed in a live browser as part of this audit.

## Maintainability and code-quality assessment

- The `changeSlide` async sequence (`ClippathSliderComp.jsx#L240-300`) is readable and well-commented at each stage, but the file overall mixes many concerns (crossfade, canvas sweep, text reveal, autoplay, custom cursor) inside a single ~590-line component with no section-comment scaffolding as prescribed by `CODING_STANDARDS.md` §1.
- Minor dead/unused code: `nextSlideIndex` state (Low finding #7) and the effectively-unused `rafRef` guard (High finding #1) both suggest the file has had unfinished edits (a working rAF-cancellation path was clearly intended but never wired up).
- Magic numbers throughout (Low finding #8) reduce at-a-glance tunability, contrary to `CODING_STANDARDS.md` §2.

## Security and dependency concerns

- No secrets, tokens, or credentials found in any file (`grep` across all `.jsx`/`.json` files in the effect folder for `api[_-]?key|secret|token|password` returned no matches).
- No `dangerouslySetInnerHTML`, no unescaped interpolation of untrusted input — all rendered strings (`slides[...].name`, `.description`, `clueText`) come from props supplied by the consuming app, not from user input at runtime; no XSS exposure.
- The only runtime dependency is `gsap` (`registry.json#L8-10`), including `gsap/dist/SplitText`. `apps/docs/package.json` pins `gsap: ^3.15.0` (`apps/docs/package.json#L34`), a version line where `SplitText` ships free as part of the core package (post-2025 GSAP license change), so no separate paid-plugin dependency risk was found — could not independently verify GSAP's current licensing terms beyond the installed version number as part of this audit.

## Browser compatibility considerations

- Relies on standard, broadly-supported browser APIs: Canvas 2D (`getContext("2d")`, `ctx.clip("evenodd")`) and `requestAnimationFrame`. `IntersectionObserver`/`visibilitychange` are not used at all here (no visibility-gating exists, per Medium finding #4) — the animation stack is otherwise standard enough to run on all evergreen browsers.
- `ctx.clip("evenodd")` (even-odd fill-rule clipping, `ClippathSliderComp.jsx#L195`) is well-supported in modern browsers; no vendor-prefixed or experimental Canvas API usage was found.
- No feature-detection/fallback exists for browsers with Canvas 2D disabled or unavailable — `runSweepAnimation` would silently fail to draw (falls back to a plain gray fill rect at `ClippathSliderComp.jsx#L206-209` only while the image hasn't loaded, not as a Canvas-unavailable fallback). This was not tested against any specific browser as part of this audit.

## What was checked and found clean

- `registry.json` schema completeness against `developer-new-component.md`: `name` matches the folder (`clippath-slider`), `type` is `"registry:component"`, `category` is exactly `"carousels"`, `main` (`index.jsx`) exists, both imported files (`index.jsx`, `ClippathSliderComp.jsx`) are listed in `files` with correct `target` paths, `tier` is a valid value (`"pro"`), and `previewUrl` (`/demo/clippath-slider`) matches the actual demo route.
- `apps/docs/public/r/clippath-slider.json` correctly mirrors the pro-tier metadata and omits source code, consistent with the tier-gating behavior documented in `developer-new-component.md` Step 6 — no drift found between `registry.json` and this generated mirror on any field that should be present for a pro-tier component.
- `index.jsx`'s import of `ClippathSliderComp` uses a relative import (`./ClippathSliderComp`), matching the coding rule to avoid `@/` aliases between a component's own files.
- `changeSlide`'s tween/SplitText bookkeeping (kill-before-retween, revert-before-resplit) is correct and was traced end-to-end; no stacking-tween or duplicate-SplitText-instance leak was found across repeated transitions.
- The window `resize` listener (`ClippathSliderComp.jsx#L92-103`) and the autoplay `setTimeout` (`#L311-317`) both have correct, complete cleanup in their respective `useEffect` return functions.
- No secrets/credentials, no XSS-able unescaped input, no `dangerouslySetInnerHTML`.

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per instructions. Suggested order of remediation (verify against `CHANGE_GUIDELINES.md` before implementing — none of these should alter the visual output beyond what's described as intentional):

1. Fix the uncancelled cursor rAF loop — capture the frame ID in `rafRef` and call `cancelAnimationFrame(rafRef.current)` in the effect's cleanup (High finding #1). This is a correctness bug, not a design choice, and should be safe to fix without visual impact.
2. Make slide navigation keyboard/screen-reader operable — e.g. real `<button>` hit-targets (can remain visually invisible/full-bleed) with `aria-label`s for "previous slide"/"next slide", reachable via Tab and operable via Enter/Space, and consider arrow-key support (High finding #2).
3. Add a `prefers-reduced-motion` check that shortens/disables the sweep and cross-fade durations and optionally disables autoplay (Medium finding #3).
4. Reconcile the registry copy and the docs demo copy so they're byte-identical again, per the documented "copy, don't diverge" workflow (Medium finding #5) — decide which breakpoint convention (`max-sm`/`max-md` per `CODING_STANDARDS.md`, or `max-md`/`max-xl`) is canonical and apply it consistently to both.
5. Fix `package.json`'s `main`/`files` to point at the real files, and move `gsap`/`react` into `peerDependencies` per the documented schema (Medium finding #6).
6. Lower-priority cleanup: remove the unused `nextSlideIndex` state, extract magic numbers to named constants, and add `cursor: none` where the custom cursor is active (Low findings #7–#9).

## Final score: 6/10

## Overall severity label: High
