# spider-particles (backgrounds)

## Summary

`spider-particles` is a Three.js-based full-viewport particle background: a grid of `THREE.Points` lit by a spotlight shader that follows the cursor, with additive-blended "web" line segments drawn from the cursor to nearby particles. The registry source (`registry/effects/backgrounds/spider-particles/index.jsx`) correctly adopts the F-042 `createSuspendedRaf` visibility-suspension pattern and has thorough WebGL resource cleanup on unmount, but two distribution artifacts have drifted out of sync with that source: the packed npm tarball in `registry/dist/` ships **no component code at all** (Critical), and the publicly generated CLI JSON at `apps/docs/public/r/spider-particles.json` still serves the **pre-rAF-suspension version** of the component (High), silently regressing the documented F-042 rollout for anyone installing through that channel. The component also lacks a `className` prop and `prefers-reduced-motion` handling, and its source diverges cosmetically and slightly behaviorally from the docs-site working copy it was supposed to be copied from unchanged.

## Implementation overview

- `registry/effects/backgrounds/spider-particles/index.jsx` — the component. Mounts a `THREE.WebGLRenderer` into a ref'd `div`, builds an orthographic-camera scene with three draw calls: a `Points` grid (`particleGeo`/`particleMat`), a single cursor dot (`cursorGeo`/`cursorMat`), and a `LineSegments` mesh for web lines (`mouseLineGeo`/`mouseLineMat`). Mouse/touch listeners are gated behind `isDesktop()` (`window.innerWidth >= 1025`). Animation is driven by `createSuspendedRaf` (`index.jsx#L297-L377`), which fades particle/line alpha in/out on cursor enter/leave and lerps a smoothed mouse position into the vertex shader uniform.
- `registry/effects/backgrounds/spider-particles/createSuspendedRaf.js` — local copy of the shared F-042 rAF-suspension utility (`createSuspendedRaf` / `createVisibilityGate`), byte-identical to the canonical `registry/effects/_shared/createSuspendedRaf.js` (confirmed via `diff`, no output).
- `registry/effects/backgrounds/spider-particles/registry.json` — schema-complete `registry:component` entry, category `backgrounds`, tier `free`, `main: "index.jsx"`, both files listed in `files[]`.
- `registry/effects/backgrounds/spider-particles/package.json` — npm-pack metadata; **out of sync** with the actual file set (see Risks).
- Demo route: `apps/docs/src/app/(marketing)/demo/spider-particles/page.js` imports from the docs-site working copy `@/components/spider-particles` (per the documented two-location workflow in `developer-new-component.md`, not the registry copy), passes the default props, and wires SEO metadata via `getDemoPageMetadata("spider-particles")`.
- Legacy/working copy: `apps/docs/src/components/spider-particles/{index.jsx,createSuspendedRaf.js}` — this is the doc-site's build/test copy referenced by the demo page, and per `developer-new-component.md` is expected to be copied unchanged into the registry.

## Strengths

- Full WebGL resource teardown on unmount: renderer, both geometries, both shader materials, and the line geometry/material are all explicitly `.dispose()`'d, and every DOM/window listener added is removed by name (`index.jsx#L381-L401`).
- Correct adoption of the F-042 `createSuspendedRaf` pattern in the registry source — `root: mount` is passed so the rAF loop pauses on tab-hide and offscreen (`index.jsx#L297-L299`, `#L377`, `#L382`).
- No hardcoded colors — `particleColor`, `webColor`, `glowColor`, `centerColor` are all props with sensible defaults, per `CODING_STANDARDS.md`'s "no hardcoded colors" rule.
- Named event handlers throughout (`onMove`, `onEnter`, `onLeave`, `onTouch`, `onTouchEnd`, `onResize`), each removable in cleanup — matches `CODING_STANDARDS.md`'s "name all inline functions" guidance.
- Sensible sentinel/threshold constants (`MOUSE_OFFSCREEN`, `MOUSE_THRESHOLD`, `LERP_SPEED`, `FADE_SPEED`) extracted to the top of the file rather than left as magic numbers.
- `mouseLineGeo.setDrawRange(0, mIdx * 2)` bounds the line draw call to only the segments actually populated that frame instead of drawing a full fixed-size buffer — avoids wasted fragment work.

## Risks and issues

1. **Critical — npm-packed tarball ships zero component code.** `registry/effects/backgrounds/spider-particles/package.json#L5-L9` declares `"main": "spider-particles.jsx"` and `"files": ["spider-particles.jsx", "registry.json"]`, but no file named `spider-particles.jsx` exists in the folder — the real entry is `index.jsx`, and `createSuspendedRaf.js` isn't listed at all. Verified by inspecting the actual packed artifact:
   ```
   $ tar -tzf registry/dist/hyperiux-spider-particles-0.0.1.tgz
   package/package.json
   package/registry.json
   ```
   The tarball contains no `index.jsx` and no `createSuspendedRaf.js`. Anyone installing this component via the npm tarball gets a package with no component in it at all. (This same `main`/`files` mismatch pattern also exists in `dither-canvas/package.json` and `dotted-grid/package.json`, so it is a repo-wide packaging bug, not unique to this effect — but it is present here and this audit is scoped to `spider-particles`.)

2. **High — the public CLI JSON mirror is stale, silently reverting the F-042 rollout.** `apps/docs/public/r/spider-particles.json#L15-L21` lists only one file (`index.jsx`) and its embedded `content` is the **pre-refactor** version: it declares `let animId;`, defines a self-scheduling `const animate = () => { animId = requestAnimationFrame(animate); ... }`, and cleans up via `cancelAnimationFrame(animId)` — there is no `createSuspendedRaf` import and no `createSuspendedRaf.js` file in this JSON's `files[]` at all. Compare against the current registry source (`registry/effects/backgrounds/spider-particles/index.jsx#L297-L377`), which uses `createSuspendedRaf({ root: mount, onFrame })`. `registry/effects/_shared/README.md#L54` records "Task 3 (backgrounds): dither-canvas, spider-particles, dotted-grid — done", but the artifact actually served to CLI/public consumers of this component does not reflect that. This matches the exact failure mode `developer-new-component.md` warns about under "Things That Will Break It": *"Forgetting to re-run `build:registry` after edits — the docs site and CLI both read from `public/r/`, not the source."* Practical impact: every user who installs `spider-particles` through the public registry JSON gets a version whose WebGL render loop and THREE render calls keep running continuously even when the tab is hidden or the element is scrolled off-screen — a real, ongoing CPU/GPU cost that the source was specifically refactored to eliminate.

3. **Medium — no `className` prop.** `developer-new-component.md`'s Step 1 code rules explicitly require: *"Accept a `className` prop so users can override styles."* `index.jsx#L71-L82` destructures only style/behavior props (`particleCount`, `gridGap`, …) with no `className`, and the root `div` at `index.jsx#L424-L427` uses a fully hardcoded `className` string with nothing to merge a caller-supplied value into. Consumers cannot add wrapper classes (e.g. `absolute inset-0` for embedding inside another layout) without editing the installed source.

4. **Medium — no `prefers-reduced-motion` handling.** Neither `index.jsx` nor `createSuspendedRaf.js` references `matchMedia` or `prefers-reduced-motion` anywhere (confirmed via `grep`). The particle field runs its cursor-follow lerp, alpha fade, and shader-driven spotlight animation at full motion regardless of the visitor's OS-level reduced-motion setting.

5. **Medium — registry source has drifted from the docs-site working copy it should mirror.** `developer-new-component.md` describes copying the working copy in `apps/docs/src/components/{name}/` into `registry/effects/{category}/{name}/` unchanged (and for free-tier components explicitly requires "component source must be identical" when mirrored into the public repo). A `diff` between `apps/docs/src/components/spider-particles/index.jsx` and `registry/effects/backgrounds/spider-particles/index.jsx` shows more than reformatting: the working copy uses `max-md:hidden` / `max-md:flex` (768px breakpoint) to toggle the header/stats overlay and the "Open on desktop" notice, while the registry (distributed) copy uses `max-[1025px]:hidden` / `max-[1025px]:flex` (1280px breakpoint) — e.g. compare `apps/docs/src/components/spider-particles/index.jsx` (`max-md:hidden`) against `registry/effects/backgrounds/spider-particles/index.jsx#L433,#L455,#L470,#L480` (`max-[1025px]:hidden`). This is a real behavioral difference: the live demo and the installed component switch to the "desktop-only" messaging at different viewport widths, so what a prospective buyer sees in the demo does not match what they install.

6. **Low — decorative comment dividers violate `CODING_STANDARDS.md`.** The standards doc states plainly: *"Keep section headers consistent and plain. Do not draw lines or use decorative divider characters in comments. Use words only."* `registry/effects/backgrounds/spider-particles/index.jsx` uses Unicode box-drawing dividers throughout, e.g. `index.jsx#L7` (`// ─── Constants ────...`), `#L15`, `#L44`, `#L69`, `#L99`, `#L113`, `#L180`, `#L210`, `#L235`, `#L261`, `#L281`, `#L295`, `#L379`, `#L415` — every section header in the file deviates from the documented plain-word style.

7. **Low — `package.json` omits `peerDependencies`.** `developer-new-component.md` Step 5 says the package.json should "list `react` and any major packages" as `peerDependencies`. `registry/effects/backgrounds/spider-particles/package.json#L1-L14` has only an empty `"dependencies": {}` and no `peerDependencies` field at all, despite the component importing both `react` and `three`. (Same gap exists in the `dither-canvas` and `dotted-grid` package.json files, so likely a repo-wide template gap rather than an isolated mistake.)

## Accessibility assessment

- The effect is a decorative, non-informational full-viewport canvas background; it does not need `alt` text or ARIA labeling for the canvas itself, and none is present — appropriate for a decorative element.
- `cursor-none max-sm:cursor-default` (`index.jsx#L426`) hides the native cursor above the `sm` breakpoint (replaced visually by the shader-drawn cursor dot) and restores it below `sm`. There is no keyboard-operable equivalent of the mouse-follow interaction, but since the interaction is purely decorative/ambient (no content or control is gated behind it) this is not a functional a11y blocker.
- No `prefers-reduced-motion` gating — see Risk #4 (Medium). This is the primary a11y-adjacent gap: users who have requested reduced motion still get the full lerp/fade/spotlight animation.
- Text content ("Spider Web", "Interactive particle field", "Move your cursor to explore", the position readout) is real DOM text, not canvas-drawn, so it is screen-reader accessible and selectable — a plus over canvas-only text.

## Performance assessment

- **Registry source**: uses `createSuspendedRaf` correctly (`index.jsx#L297-L299`, root = mount div), so the rAF loop and THREE render calls stop when the tab is hidden or the element scrolls offscreen (per `IntersectionObserver` with the shared 256px `rootMargin`, `createSuspendedRaf.js#L21`). This was not verified by running the component in a browser in this audit (no execution/profiling was performed) — the conclusion is based on static code reading of `createSuspendedRaf.js` and its call site.
- **Publicly distributed artifact** (`apps/docs/public/r/spider-particles.json`) does **not** have this suspension — see Risk #2 (High). This is the version most CLI installs will actually receive.
- Per-frame web-line rebuild is an O(`actualCount`) loop (`index.jsx#L335-L366`) writing into pre-allocated `Float32Array`s (no per-frame allocation) and using `setDrawRange` to only draw populated segments — reasonable for the default `particleCount = 180`. No stress-test or profiling was performed to characterize behavior at very high `particleCount` or with `gridGap` set to a very small value (which uncaps `actualCount` via `cols * rows` — e.g. `gridGap = 1` on a 1920×1080 viewport would allocate roughly 2M particles); this is a potential unbounded-allocation footgun for that prop but was not exercised or measured.
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` (`index.jsx#L102`) and pixel-ratio-scaled point size (`#L219`, `#L247`) correctly cap for high-DPI displays.

## SEO and content-surface assessment

- The demo page (`apps/docs/src/app/(marketing)/demo/spider-particles/page.js#L31-L33`) wires `generateMetadata` through `getDemoPageMetadata("spider-particles")`, which resolves title/description/OG image dynamically from Sanity (`apps/docs/src/lib/demo-metadata.js`), consistent with this repo's "Sanity is the source of truth for display fields" architecture. No entry for `spider-particles` was found by name in `apps/docs/src/lib/demo-metadata.js` itself, but that file is a generic Sanity-backed lookup (not a per-slug table) with a documented fallback path when no Sanity entry is found (`demo-metadata.js#L16-L26`), so this is expected behavior, not a gap.
- Visible page text ("Spider Web", "Interactive particle field") is real text content contributing to on-page copy, not canvas-only.
- No `<h1>`/heading hierarchy issue found: the demo page's `<h1>` ("Spider Web") is the only heading rendered by this component.

## Responsive / mobile / touch behavior assessment

- Interactivity is explicitly gated to `window.innerWidth >= 1025` (`isDesktop()`, `index.jsx#L121`) for all of `onMove`, `onEnter`, `onLeave`, `onTouch`, `onTouchEnd`. Below that width, the component still renders the WebGL canvas and grid but the cursor/touch never activates it (alpha stays 0), and the docs UI explicitly swaps in an "Open on desktop / This effect is designed to be experienced with a cursor" overlay for narrower viewports (`index.jsx#L470-L477`, gated on `max-[1025px]:flex`, i.e. anything under 1280px in the registry copy — see Risk #5 for the breakpoint mismatch against the docs working copy which uses 768px).
- Touch listeners (`touchmove`/`touchend`) are registered (`index.jsx#L177-L178`) but immediately no-op below the 1025px `isDesktop()` gate — meaning on essentially all real touchscreen phones/tablets in portrait or typical landscape widths, these handlers exist but never do anything. This isn't a functional bug (the UI's own "Open on desktop" messaging matches the same intent) but is a minor code-smell: touch support is wired up for a device class (very wide touchscreens, e.g. touch-enabled laptops) that the width gate makes rare in practice.
- `onResize` recomputes width/height, camera frustum, and calls `renderer.setSize` (`index.jsx#L283-L293`) — window resize (e.g. rotating a wide touch device, or resizing a desktop browser) is handled.

## Maintainability and code-quality assessment

- File organizes cleanly by section per `CODING_STANDARDS.md`'s prescribed order (constants → shaders → component → state/effects/return), aside from the divider-character deviation (Risk #6).
- Naming conventions match the documented rules: `SCREAMING_SNAKE_CASE` constants, `_prefixedColor` for derived `THREE.Color` instances, `onEventName` handlers, boolean flags phrased as questions (`mousePresent`, `mouseJustEntered`).
- The `isDesktop()` guard is correctly extracted once and reused across five call sites rather than repeating the raw width check, matching the "extract repeated guards" rule.
- The `useEffect` dependency array (`index.jsx#L402-L413`) lists every prop the effect closes over, so prop changes correctly re-run the full WebGL setup/teardown — no stale-closure risk found.
- Missing `className` prop (Risk #3) and the docs-copy/registry-copy drift (Risk #5) are the two maintainability-relevant findings beyond the comment-style nit.

## Security and dependency concerns

- No secrets, tokens, API keys, or `dangerouslySetInnerHTML`/`eval`/`innerHTML` usage found in `index.jsx` or `createSuspendedRaf.js` (verified by reading both files in full).
- Only external dependency is `three`, declared in `registry.json#L7-L9` (`dependencies: ["three"]`) — consistent with the actual `import * as THREE from "three"` in the source.
- No user-supplied strings are rendered as HTML; all dynamic values (`particleCount`, `pos.x`/`pos.y`, etc.) are rendered as text/props, not markup.

## Browser compatibility considerations

- Requires WebGL (`new THREE.WebGLRenderer(...)`, `index.jsx#L101`) with no feature-detection guard or `try/catch` around renderer creation, and no fallback UI for a browser/device without WebGL support. If context creation throws, it would throw synchronously inside the mount `useEffect` with nothing catching it. This is a plausible risk identified from reading the code; it was **not reproduced or verified in an actual no-WebGL environment** in this audit, so it is noted as an unconfirmed risk rather than a confirmed defect.
- `IntersectionObserver` (used by `createSuspendedRaf`/`createVisibilityGate`) and `requestAnimationFrame` are both broadly supported in all current evergreen browsers; no polyfill is present or needed for the target support matrix implied by the rest of the codebase.
- `devicePixelRatio` and `getBoundingClientRect` usage is standard and widely supported.

## What was checked and found clean

- Full directory listing of `registry/effects/backgrounds/spider-particles/` confirmed only 4 files exist (`createSuspendedRaf.js`, `index.jsx`, `package.json`, `registry.json`); all four were read in full.
- `registry.json` schema against `developer-new-component.md` Step 4's required-fields table: `name` matches the folder (`spider-particles`), `type` is exactly `"registry:component"`, `category` is exactly `"backgrounds"`, `main` (`index.jsx`) exists on disk, both imported files (`index.jsx`, `createSuspendedRaf.js`) appear in `files[]` with correct `target` paths, `previewUrl` (`/demo/spider-particles`) matches the demo route folder, `exportName`/`exportKind` (`SpiderParticles`/`default`) match the actual `export default function SpiderParticles(...)`, `tier` is a valid value (`"free"`), `importPath`/`target` are consistent with each other.
- `registry/index.json` root index entry for `spider-particles` (`registry/index.json#L31-L40`) is present, alphabetically placed, and its fields (`name`, `title`, `category`, `type`, `tier`, `registryPath`, `importPath`, `target`, `previewUrl`) all agree with `registry.json`.
- `createSuspendedRaf.js` in the effect folder is byte-identical to the canonical `registry/effects/_shared/createSuspendedRaf.js` (`diff` produced no output) — correctly copied per the F-042 rollout instructions in `registry/effects/_shared/README.md`.
- Cleanup on unmount (`index.jsx#L381-L401`): `loop.destroy()`, `window.removeEventListener("resize", onResize)`, all five mount-level listeners removed by name, DOM node removed conditionally (`mount.contains(...)` guard), and `renderer`/`particleGeo`/`particleMat`/`cursorGeo`/`cursorMat`/`mouseLineGeo`/`mouseLineMat` are all explicitly disposed.
- No slug-alias entry for `spider-particles` exists in `apps/docs/src/lib/effect-slugs.js` — checked and confirmed absent; per `developer-new-component.md` Step 8 this is only "if needed" (renames/alt names), so its absence is not a defect.
- No `console.log`/`TODO`/`FIXME`/`debugger` statements found in either source file.
- No hardcoded colors — all four color props (`particleColor`, `glowColor`, `webColor`, `centerColor`) are configurable with sensible `0xffffff` defaults.
- Demo page (`apps/docs/src/app/(marketing)/demo/spider-particles/page.js`) correctly imports the docs-site working copy (by design, per the documented two-location architecture), passes all ten component props explicitly matching their documented defaults, and wires `generateMetadata` for SEO.

## Suggested improvements and remediation priorities

No code was changed as part of this audit. In priority order, if fixes are undertaken later:

1. Fix `registry/effects/backgrounds/spider-particles/package.json` (`main`/`files`) to point at the real `index.jsx` and include `createSuspendedRaf.js`, then re-run `npm pack` and replace `registry/dist/hyperiux-spider-particles-0.0.1.tgz` — the current tarball ships no code.
2. Re-run `npm run build:registry` (per `developer-new-component.md` Step 6) to regenerate `apps/docs/public/r/spider-particles.json` from the current source, so CLI installs pick up the `createSuspendedRaf` visibility-suspension behavior instead of the stale pre-refactor loop.
3. Reconcile the `max-md` vs `max-[1025px]` breakpoint mismatch between the docs working copy and the registry copy so the live demo and the installed component behave identically at the same viewport widths, and re-copy the registry source from the working copy to eliminate the incidental formatting drift at the same time.
4. Add a `className` prop to the component and merge it onto the root `div` (e.g. via a simple template-literal concatenation) so installers can compose it into their own layouts.
5. Add a `prefers-reduced-motion` check (e.g. via the existing `createVisibilityGate`/`matchMedia`) to reduce or disable the cursor-follow animation for users who have requested reduced motion.
6. Reformat the section-header comments to plain words per `CODING_STANDARDS.md` (drop the box-drawing dividers).
7. Add `peerDependencies` (`react`, `three`) to `package.json`.
8. Any of these fixes should be verified against `CHANGE_GUIDELINES.md` before merging to confirm they don't alter the demo's visual output, break responsiveness, or change registry install behavior in an unintended way — none of that verification was performed here since this is an audit-only pass.

## Final score: 5/10

## Overall severity label: Critical
