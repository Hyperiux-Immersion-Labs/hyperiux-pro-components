# gooey-counter (components)

## Summary

Gooey Counter is a canvas-based full-viewport animation that morphs a grid of "blocks" into pixel-art digits (0–10), using an SVG gooey filter applied to a Canvas 2D context. The core simulation logic is well-organized and the animation itself (transitions, easing, responsive digit metrics) is competently built. However, the audit found one **Critical** packaging defect (the actual npm tarball for this component ships with no component source at all), a **High** accessibility gap (the entire visual output has zero text/ARIA alternative), and several **Medium** issues around composability, stale generated artifacts, and missing motion/visibility handling that are common across this registry's "components" category.

## Implementation overview

- `registry/effects/components/gooey-counter/index.jsx` is the single-file registry source (386 lines). It renders a full-viewport `<canvas>` plus a hidden `<svg><filter>` (SVG Gaussian-blur + color-matrix "goo" filter, uniquely IDed via `useId()`) and a "Reset" button.
- A `useEffect` sets up an internal simulation object (`sim`) holding block positions, closures for `start`, `goToNumber`, `goToRandom`, `loop`, `resize`, and `frame` (the `requestAnimationFrame` render loop), then boots the animation and wires a `resize` listener.
- Digits are represented as 9×6 bitmaps (`DIGIT_MAPS`), stroke-outlined (`strokeize`), and rescaled per breakpoint (`getDigitMetrics`/`getScaledCellIndexes`) to produce the set of grid cells ("blocks") that form each digit.
- Each animation cycle: sit on a number for `NUMBER_DWELL_MS` → scatter to a random layout (`goToRandom`) → dwell `RANDOM_DWELL_MS` → morph into the next number (`goToNumber`) → repeat forever via `loop()`.
- Rendering draws capsule "goo" links between nearby blocks onto an `OffscreenCanvas`, then composites that offscreen buffer onto the visible canvas through the SVG filter (`ctx.filter = url(#gooey-<id>)`), on every animation frame.

## Strengths

- Clean separation of pure helper functions (`strokeize`, `getNumberCells`, `assignTargets`, `drawCapsule`, easing) from the stateful `useEffect` body — easy to follow.
- Responsive digit rendering: `getDigitMetrics`/`getRowsForWidth` change grid density and digit bitmap scale per breakpoint rather than just CSS-scaling a fixed canvas ([registry/effects/components/gooey-counter/index.jsx#L54-L68](../../../registry/effects/components/gooey-counter/index.jsx#L54-L68), [#L137-L141](../../../registry/effects/components/gooey-counter/index.jsx#L137-L141)).
- Correctly namespaces the SVG filter ID per mounted instance with `useId()` so multiple instances on one page won't collide on `url(#gooey)` ([index.jsx#L178](../../../registry/effects/components/gooey-counter/index.jsx#L178), [#L367](../../../registry/effects/components/gooey-counter/index.jsx#L367)) — this is a real fix over an earlier hardcoded-ID version (see "Risks" — the generated public mirror still has the old version).
- `devicePixelRatio` is clamped to 2 ([index.jsx#L244](../../../registry/effects/components/gooey-counter/index.jsx#L244)), avoiding runaway canvas backing-store sizes on very-high-DPI screens.
- Cleanup function cancels the rAF, clears the pending `setTimeout`, and removes the `resize` listener ([index.jsx#L348-L352](../../../registry/effects/components/gooey-counter/index.jsx#L348-L352)) — no leaked listeners or timers on unmount.
- `registry.json` is internally consistent and schema-complete: `name` matches the folder, `type` is `"registry:component"`, `category` is exactly `"components"`, `main` points at a file that exists, the single file in `files` has correct `target`, and `previewUrl` (`/demo/gooey-counter`) matches the actual demo route.

## Risks and issues

### 1. [Critical] Packed npm tarball ships with no component source at all
`registry/effects/components/gooey-counter/package.json` declares `"main": "gooey-counter.jsx"` and `"files": ["gooey-counter.jsx", "registry.json"]` ([registry/effects/components/gooey-counter/package.json#L5-L9](../../../registry/effects/components/gooey-counter/package.json#L5-L9)), but the actual component file in that folder is `index.jsx`, not `gooey-counter.jsx`. `npm pack`'s `files` whitelist silently drops any listed path that doesn't exist and does not fall back to including `main`. This was verified directly against the already-built tarball:

```
$ tar -tzf registry/dist/hyperiux-gooey-counter-0.0.1.tgz
package/package.json
package/registry.json
```

No `index.jsx` (or any component source) is present in the shipped tarball. Anyone installing `@hyperiux/gooey-counter` from `registry/dist/hyperiux-gooey-counter-0.0.1.tgz` gets a package whose declared `main` entry file doesn't exist — `require`/`import` of the package fails outright. This is broken functionality on the npm-distribution path described in [developer-new-component.md Step 9](../../../developer-new-component.md#step-9---pack-the-npm-tarball).
- Note: the same `main`/`files` mismatch pattern (pointing at a `{slug}.jsx` file that doesn't exist in the folder) appears in several sibling `components/*/package.json` files (e.g. `animated-faq`, `card-drift`, `hover-stack`), suggesting a repo-wide scaffold issue rather than something unique to this effect — flagging only the gooey-counter instance per this audit's scope, but the pattern likely warrants a repo-wide pass.

### 2. [High] Canvas output has no accessible text alternative
The entire visual content of the component — the digits 0–10 being displayed — is drawn to a `<canvas>` with no `aria-label`, no `role`, and no fallback children:
```jsx
<canvas ref={canvasRef} className=" h-[75%]! w-[80%]! ..." />
```
([registry/effects/components/gooey-counter/index.jsx#L375](../../../registry/effects/components/gooey-counter/index.jsx#L375)). A screen-reader user gets no indication a counter exists, let alone which number is currently shown or that it is counting. The static heading/paragraph above the canvas ("Gooey Counter" / "...counts from 0 to 10") is demo-page-only copy, not part of the reusable component contract, and does not convey live count state. There is no `aria-live` region announcing the current number either.

### 3. [Medium] No `prefers-reduced-motion` handling
Nothing in `index.jsx` checks `window.matchMedia("(prefers-reduced-motion: reduce)")`. The component runs a continuous scatter/morph animation loop indefinitely regardless of the user's OS-level motion preference ([index.jsx#L218-L229](../../../registry/effects/components/gooey-counter/index.jsx#L218-L229) drives the `loop()`/`goToRandom`/`goToNumber` cycle forever).

### 4. [Medium] Continuous rAF loop never suspends when off-screen or tab-hidden
`frame()` unconditionally re-schedules itself via `requestAnimationFrame(frame)` at the end of every call ([index.jsx#L339](../../../registry/effects/components/gooey-counter/index.jsx#L339)), including an O(n²) nested loop that computes capsule "goo" links between every pair of blocks each frame ([index.jsx#L306-L318](../../../registry/effects/components/gooey-counter/index.jsx#L306-L318)), followed by a full-viewport offscreen composite through an expensive SVG Gaussian-blur filter ([index.jsx#L325-L328](../../../registry/effects/components/gooey-counter/index.jsx#L325-L328)) — every frame, forever, even when the canvas is fully static between transitions, scrolled off-screen, or the tab is backgrounded. Per `registry/effects/_shared/README.md`, the F-042 rollout that added `createSuspendedRaf`/`createVisibilityGate` (pause on `visibilitychange`/`IntersectionObserver`) explicitly did not cover the `components` category ("Task 1 (webgl) / Task 2 (cursor) / Task 3 (backgrounds) / Task 4 (scroll) — done", no `components` task listed). Per the audit brief, this is flagged as Medium since it genuinely runs a continuous rAF loop, not merely a missing pattern with no real cost.

### 5. [Medium] No customization surface — fails the "components" authoring checklist and cannot be embedded
`GooeyCounter` takes no props at all and hardcodes `position: fixed; inset: 0` on its root element ([index.jsx#L356](../../../registry/effects/components/gooey-counter/index.jsx#L356)), plus hardcoded colors (`BG`, `INK`, `GRID_STROKE` module constants, [index.jsx#L14-L16](../../../registry/effects/components/gooey-counter/index.jsx#L14-L16)). [developer-new-component.md Step 1](../../../developer-new-component.md#step-1---build-the-component-in-srccomponents) requires: "Accept a `className` prop so users can override styles" and "No hardcoded colors - use props with sensible defaults." Neither is satisfied. Because the root is `position: fixed; inset: 0`, a consumer cannot place this "component" inline in a page layout at all — it always takes over the full viewport, which is unusual for something registered under the general-purpose `components` category (cards/modals/FAQs/etc., per the category table in the same doc) and effectively locks it to being a full-page splash/demo rather than a composable UI piece.

### 6. [Medium] Public registry mirror (`public/r/gooey-counter.json`) is stale relative to source
`apps/docs/public/r/gooey-counter.json` embeds an older revision of the component that predates the `useId()` fix: it imports only `{ useEffect, useRef }` (no `useId`), has no `gooeyFilterId`, and hardcodes the SVG filter as `id="gooey"` / `ctx.filter = "url(#gooey)"` (compare the embedded `content` string in [apps/docs/public/r/gooey-counter.json#L18](../../../apps/docs/public/r/gooey-counter.json#L18) against the current source at [registry/effects/components/gooey-counter/index.jsx#L2](../../../registry/effects/components/gooey-counter/index.jsx#L2), [#L178](../../../registry/effects/components/gooey-counter/index.jsx#L178), [#L367](../../../registry/effects/components/gooey-counter/index.jsx#L367)). This is exactly the drift `developer-new-component.md`'s "Things That Will Break It" section warns about ("Forgetting to re-run `build:registry` after edits — the docs site and CLI both read from `public/r/`, not the source"). Any install served from this stale public JSON (free-tier code is embedded directly per Step 6) will reintroduce the hardcoded-filter-ID collision bug for any page with more than one instance mounted.

### 7. [Low] Duplicate, unsynced source-of-truth for the demo
The demo route imports the component from `apps/docs/src/components/gooey-counter/index.jsx` ([apps/docs/src/app/(marketing)/demo/gooey-counter/page.js#L1](<../../../apps/docs/src/app/(marketing)/demo/gooey-counter/page.js#L1>)), a separate copy of the file rather than anything generated from the registry source. It is currently byte-identical to `registry/effects/components/gooey-counter/index.jsx` (verified by direct comparison), so there is no active drift today, but nothing enforces they stay in sync — the stale-mirror issue above (#6) shows this kind of copy can and does drift in this repo.

### 8. [Low] `package.json` missing `peerDependencies`
`registry/effects/components/gooey-counter/package.json` has no `peerDependencies` entry ([registry/effects/components/gooey-counter/package.json#L1-L15](../../../registry/effects/components/gooey-counter/package.json#L1-L15)), while [developer-new-component.md Step 5](../../../developer-new-component.md#step-5---create-packagejson-for-npm-distribution) says to "list `react` and any major packages." The component is a React component (`useEffect`/`useRef`/`useId`) with an implicit `react` dependency that isn't declared anywhere in the package manifest.

## Accessibility assessment

- No text/ARIA alternative for the canvas-rendered digits — see Risk #3 (High). This is the dominant accessibility gap.
- The SVG filter block is correctly marked `aria-hidden="true" focusable="false"` ([index.jsx#L365](../../../registry/effects/components/gooey-counter/index.jsx#L365)) — appropriate, since it holds no visible content of its own.
- The "Reset" control is a native `<button>` with visible text content and a real `onClick` handler ([index.jsx#L376-L382](../../../registry/effects/components/gooey-counter/index.jsx#L376-L382)) — keyboard-focusable and announced correctly by screen readers; no separate `aria-label` is needed since the visible text is descriptive.
- No `prefers-reduced-motion` handling — see Risk #4 (Medium).
- No focus trap or keyboard-navigable content beyond the single Reset button, which is appropriate given the component has no other interactive elements.

## Performance assessment

- Continuous, unthrottled `requestAnimationFrame` loop that never pauses off-screen or when the tab is hidden — see Risk #4 (Medium), with the concrete cost being an O(n²) pairwise-distance pass over `sim.blocks` every frame ([index.jsx#L306-L318](../../../registry/effects/components/gooey-counter/index.jsx#L306-L318)) plus a full-viewport SVG Gaussian-blur composite every frame ([index.jsx#L325-L328](../../../registry/effects/components/gooey-counter/index.jsx#L325-L328)), regardless of whether anything is actually moving (most of the animation cycle is static dwell time, per `NUMBER_DWELL_MS`/`RANDOM_DWELL_MS`).
- No automated performance test/benchmark exists in the repo for this component, so the actual frame-time cost (e.g. whether it holds 60fps on mid-tier mobile at `ROWS_MOBILE = 32` × `COLS = 22`) could not be verified and is not asserted here beyond the structural O(n²) observation.
- `OffscreenCanvas` is recreated on every `resize` event ([index.jsx#L261](../../../registry/effects/components/gooey-counter/index.jsx#L261)) rather than resized in place; this is a reasonable pattern for `OffscreenCanvas` (it has no `resize` API) and is only a concern under rapid resize-event storms, which is a minor, bounded cost.
- `devicePixelRatio` clamped to 2 ([index.jsx#L244](../../../registry/effects/components/gooey-counter/index.jsx#L244)) bounds backing-store growth on very-high-DPI devices — good practice, already covered under Strengths.

## SEO and content-surface assessment

- The demo page (`apps/docs/src/app/(marketing)/demo/gooey-counter/page.js`) does call `getEffectBySlug`-style metadata generation via `getDemoPageMetadata("gooey-counter")` ([page.js#L18-L20](<../../../apps/docs/src/app/(marketing)/demo/gooey-counter/page.js#L18-L20>)), so the page itself gets proper `<title>`/meta description wiring; this was not independently re-verified against `apps/docs/src/lib/demo-metadata.js` since that file is outside the four files this audit was scoped to read.
- The component's own DOM content includes a real `<h1>Gooey Counter</h1>` and descriptive `<p>` ([index.jsx#L358-L363](../../../registry/effects/components/gooey-counter/index.jsx#L358-L363)) which are crawlable text, independent of the canvas — so the demo page is not a content-empty shell for crawlers.
- The component itself carries no semantic/structured content representing "the current count" anywhere in the DOM (only in canvas pixels) — not an SEO concern in isolation (this is a decorative animation, not indexable data), but reiterates the accessibility gap in Risk #3.

## Responsive / mobile / touch behavior assessment

- Explicit breakpoint-aware layout: `getRowsForWidth`/`getDigitMetrics` swap row counts and digit bitmap scale at `MOBILE_MAX_WIDTH = 768` and `TABLET_MAX_WIDTH = 1024` ([index.jsx#L17-L24](../../../registry/effects/components/gooey-counter/index.jsx#L17-L24), [#L137-L141](../../../registry/effects/components/gooey-counter/index.jsx#L137-L141)) rather than only scaling via CSS — digits are redrawn at appropriate pixel density per breakpoint.
- `resize()` is invoked on `window`'s `resize` event with `{ passive: true }` ([index.jsx#L344](../../../registry/effects/components/gooey-counter/index.jsx#L344)) and recomputes canvas backing-store size, grid cell size, and origin offsets — correctly handles viewport/orientation changes.
- Tailwind responsive classes on the canvas and button (`max-sm:`, `max-md:`) follow the repo's documented breakpoint-prefix convention from `CODING_STANDARDS.md` ("Use `max-sm:` for mobile-specific overrides and `max-md:` for tablet-specific overrides") ([index.jsx#L375-L378](../../../registry/effects/components/gooey-counter/index.jsx#L375-L378)).
- No dedicated touch-input handling is needed since the component has no drag/hover interaction beyond the single Reset button, which works identically via touch or pointer without special-casing.
- `position: fixed; inset: 0` (Risk #5) means on mobile the component will always claim the full viewport height including areas that may be occluded by mobile browser chrome; not independently tested in a live mobile browser as part of this audit.

## Maintainability and code-quality assessment

- Follows `CODING_STANDARDS.md`'s file-structure convention reasonably well: constants at the top, helper functions before the component, `"use client"` directive present ([index.jsx#L1](../../../registry/effects/components/gooey-counter/index.jsx#L1)).
- Section comments inside the long `useEffect` (`// Canvas setup`, `// Simulation state`, `// Animation helpers`, `// Layout`, `// Render loop`, `// Boot and cleanup`) match the plain, word-only style `CODING_STANDARDS.md` asks for ([index.jsx#L181](../../../registry/effects/components/gooey-counter/index.jsx#L181) etc.).
- All magic numbers are hoisted to named `SCREAMING_SNAKE_CASE` constants at module level ([index.jsx#L4-L24](../../../registry/effects/components/gooey-counter/index.jsx#L4-L24)) — matches the "Magic Numbers → Named Constants" rule.
- The entire WebGL/canvas-equivalent lifecycle (setup → animate → cleanup) is kept inside a single `useEffect`, matching the "keep lifecycle together" rule in `CODING_STANDARDS.md`.
- One event listener (`resize`) is added and matched by exactly one `removeEventListener` in cleanup with the same named function reference ([index.jsx#L344](../../../registry/effects/components/gooey-counter/index.jsx#L344), [#L351](../../../registry/effects/components/gooey-counter/index.jsx#L351)) — correctly named/removable per the standards' "Name all inline functions" rule.
- `sim.phase` is assigned `"idle"` at initialization ([index.jsx#L190](../../../registry/effects/components/gooey-counter/index.jsx#L190)) but is never read or updated anywhere else in the file — dead state that `CODING_STANDARDS.md`'s "Dead code is noise" principle would flag; low-impact, not scored as a separate finding given its triviality.
- Package/registry metadata inconsistency (`package.json` main/files mismatch, Risk #1) is the main maintainability red flag beyond the component code itself.

## Security and dependency concerns

- No secrets, tokens, or credentials in source.
- No `dangerouslySetInnerHTML`, no raw HTML injection, no use of unescaped user input anywhere — the component takes no props/inputs at all, so there is no injectable surface.
- `registry.json` declares `"dependencies": []` and the component imports only from `react` — no external runtime dependency to audit for supply-chain risk.
- Nothing here indicates a legal/compliance gap.

## Browser compatibility considerations

- The component relies on `OffscreenCanvas` ([index.jsx#L184](../../../registry/effects/components/gooey-counter/index.jsx#L184)) and on the Canvas 2D context's `filter` property being able to reference an SVG `<filter>` by `url(#id)` ([index.jsx#L326](../../../registry/effects/components/gooey-counter/index.jsx#L326)). Both are broadly supported in current evergreen browsers (Chromium, Firefox, and Safari 16.4+ for `OffscreenCanvas`), but this was **not independently verified via cross-browser testing** as part of this audit — no test harness or browser matrix exists in the repo for this claim, so it is flagged as an unverified risk rather than a scored finding.
- No feature-detection fallback exists for browsers lacking `OffscreenCanvas` support (e.g. very old Safari) — the component would throw at `new OffscreenCanvas(...)` ([index.jsx#L184](../../../registry/effects/components/gooey-counter/index.jsx#L184)) with no try/catch or graceful degradation. This is a real theoretical gap but not independently confirmed to affect any browser in the project's actual support matrix, since that matrix isn't defined in the files this audit read.

## What was checked and found clean

- `registry.json` schema completeness against `developer-new-component.md`: `name` matches folder (`gooey-counter`), `type` is `"registry:component"`, `category` is exactly `"components"`, `main` (`index.jsx`) exists on disk, the sole entry in `files` has a correct `target`, `previewUrl` (`/demo/gooey-counter`) matches the real demo route, `tier` is a valid value (`"free"`), `exportName`/`exportKind` (`GooeyCounter`/`default`) match the actual export in `index.jsx`.
- No stale duplicate source files inside the registry folder itself (only `index.jsx`, `package.json`, `registry.json` — confirmed via directory listing) that could confuse `build-registry.js`'s extension-based entry-point detection, per the "Leaving a stale duplicate source file lying around" warning in `developer-new-component.md`.
- Slug/naming consistency: registry folder name, `registry.json` `name`, demo route path, and the legacy `apps/docs/src/components/gooey-counter` folder name all agree on `gooey-counter`.
- Cleanup on unmount: `cancelAnimationFrame`, `clearTimeout`, and `removeEventListener("resize", resize)` are all present and correctly paired with what was set up ([index.jsx#L348-L352](../../../registry/effects/components/gooey-counter/index.jsx#L348-L352)).
- No WebGL context is used (plain Canvas 2D + `OffscreenCanvas`), so there is no geometry/material/texture disposal requirement to check.
- No `console.log` or leftover debug statements found in the source.
- No hardcoded `px` arbitrary Tailwind values that should be `vw` per `CODING_STANDARDS.md` — the file already uses `vw`-based arbitrary values consistently (e.g. `text-[4vw]`, `py-[0.7vw]`) at [index.jsx#L358](../../../registry/effects/components/gooey-counter/index.jsx#L358), [#L378](../../../registry/effects/components/gooey-counter/index.jsx#L378).
- No HTML entities (`&nbsp;` etc.) in JSX.
- Next.js `Link`/`Image` conventions not applicable — the component renders no anchors or images.

## Suggested improvements and remediation priorities

**No code was changed as part of this audit**, per `CHANGE_GUIDELINES.md`. The following is a priority-ordered list for a future remediation pass; any fix must be verified not to break the existing UI, responsiveness, or registry install flow before landing:

1. **(Critical, Risk #1)** Fix `package.json`'s `main`/`files` to reference the real `index.jsx`, re-run `npm pack`, and replace `registry/dist/hyperiux-gooey-counter-0.0.1.tgz` with a tarball that actually contains the component source. Verify with `tar -tzf` that `index.jsx` is present before shipping.
2. **(High, Risk #2)** Add an accessible text alternative for the counter — at minimum an `aria-label`/`aria-live` region reflecting the currently displayed number, or a visually-hidden text node kept in sync with `sim.nextNumber`/the active digit.
3. **(Medium, Risk #3)** Respect `prefers-reduced-motion`: either freeze on a static digit or drop to a simple crossfade instead of the full scatter/morph cycle when the user has requested reduced motion.
4. **(Medium, Risk #4)** Adopt the `createSuspendedRaf`/`createVisibilityGate` pattern (copied locally per `registry/effects/_shared/README.md`) so the rAF loop and its O(n²) link pass pause when off-screen or the tab is hidden.
5. **(Medium, Risk #5)** Accept a `className` prop and expose color/positioning as props with sensible defaults instead of hardcoding `position: fixed; inset: 0` and the `BG`/`INK`/`GRID_STROKE` constants, so the component can be embedded rather than only used as a full-page takeover.
6. **(Medium, Risk #6)** Re-run `npm run build:registry` to regenerate `apps/docs/public/r/gooey-counter.json` from the current source so the public mirror picks up the `useId()`-based unique filter ID fix.
7. **(Low, Risks #7–#8)** Consider whether `apps/docs/src/components/gooey-counter` should be generated/synced from the registry source rather than hand-duplicated, and add `"peerDependencies": { "react": "*" }` (or the project's actual convention) to `package.json`.

## Final score: 4/10

## Overall severity label: Critical
