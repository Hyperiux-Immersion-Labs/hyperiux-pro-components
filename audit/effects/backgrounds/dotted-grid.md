# dotted-grid (backgrounds)

## Summary

`dotted-grid` is a full-viewport Canvas2D background that draws a grid of dots which morph through five geometric shapes (star, square, ring, plus, triangle) on click, with a mouse-following "head" and a fading trail. The core animation code is solid — it correctly adopted the shared `createSuspendedRaf` visibility-suspension pattern and has a clean cleanup path — but the audit found one **critical distribution defect** (the packed npm tarball ships zero component code), a **stale public registry mirror** that predates the F-042 rollout, and real behavioral/UI drift between the registry copy (what gets installed) and the docs demo copy (what users preview before installing). There is no `prefers-reduced-motion` handling and no customization props, both flagged against the documented guidelines.

## Implementation overview

- [`registry/effects/backgrounds/dotted-grid/index.jsx`](../../../registry/effects/backgrounds/dotted-grid/index.jsx) — the distributable component (`export function DottedGrid()`, named export). A single `useEffect` sets up a `<canvas>`, builds a grid of dot objects spaced 24px apart, and runs one draw loop via `createSuspendedRaf`.
- [`registry/effects/backgrounds/dotted-grid/createSuspendedRaf.js`](../../../registry/effects/backgrounds/dotted-grid/createSuspendedRaf.js) — local copy of the shared rAF-suspension utility (per the "copy, don't import" rule in `_shared/README.md`), byte-identical in structure to [`registry/effects/_shared/createSuspendedRaf.js`](../../../registry/effects/_shared/createSuspendedRaf.js).
- Shape math (`getStarStrength`, `getSquareStrength`, `getCircleRingStrength`, `getPlusStrength`, `getTriangleStrength`) is pure and stateless, driven by normalized coordinates.
- State is transitioned through four phases per click (`RANDOM_TIME` → `COLLECT_TIME` → `SHAPE_HOLD_TIME` → `GRAY_DISPERSE_TIME`), all via `lerp`/`smoothstep` easing, no external animation library.
- `registry/effects/backgrounds/dotted-grid/registry.json` declares `tier: "free"`, `category: "backgrounds"`, two files (`index.jsx`, `createSuspendedRaf.js`), and `previewUrl: "/demo/dotted-grid"`.

## Strengths

- Correctly adopted `createSuspendedRaf` — matches the F-042 Task 3 rollout status ("dither-canvas, spider-particles, dotted-grid — done" per [`registry/effects/_shared/README.md#L59`](../../../registry/effects/_shared/README.md)). See [`index.jsx#L285-L365`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L285-L365).
- All animation-tick state lives in `useRef`/plain closures, not `useState` — no per-frame React re-renders, matching `CODING_STANDARDS.md` §6 "State vs refs for animation."
- All event handlers are named functions removed symmetrically in cleanup: [`index.jsx#L369-L382`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L369-L382).
- Every magic number is a named, module-level `SCREAMING_SNAKE_CASE` constant ([`index.jsx#L8-L21`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L8-L21)), matching `CODING_STANDARDS.md` §2.
- DPR is clamped to 2 ([`index.jsx#L146`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L146)) to bound canvas backing-store cost on high-DPI screens.
- `registry.json` is schema-complete against `developer-new-component.md` (see "What was checked and found clean" below).

## Risks and issues

### 1. Critical — packed npm tarball contains no component source code
`registry/effects/backgrounds/dotted-grid/package.json` declares:
```
"main": "dotted-grid.jsx",
"files": ["dotted-grid.jsx", "registry.json"]
```
([`package.json#L5-L9`](../../../registry/effects/backgrounds/dotted-grid/package.json#L5-L9)) — but no file named `dotted-grid.jsx` exists in the folder; the real entry point is `index.jsx`. I verified this is not a theoretical problem: the already-built tarball at `registry/dist/hyperiux-dotted-grid-0.0.1.tgz` was inspected directly (`tar -tzf`) and contains only:
```
package/package.json
package/registry.json
```
`index.jsx` and `createSuspendedRaf.js` are silently absent — `npm pack` does not error when a listed `files` entry doesn't exist, it just omits it. Anyone installing this package via the npm tarball gets metadata only, zero runnable code. **Severity: Critical** (broken functionality — the npm distribution artifact for this "free" tier component is non-functional as packed).
Note: the same `main`/`files` misnaming pattern (`{slug}.jsx` instead of `index.jsx`) exists in sibling `dither-canvas` and `spider-particles` `package.json` files too, so this is likely a repo-wide template defect, not unique to `dotted-grid` — flagging it here because it directly breaks this component's tarball, and this audit's file list stays scoped to `dotted-grid`.

### 2. High — public registry mirror (`public/r/dotted-grid.json`) predates the F-042 suspension rollout
`apps/docs/public/r/dotted-grid.json` embeds a full copy of the component source (expected for a `tier: "free"` component per `developer-new-component.md` Step 6). That embedded content uses a raw, unsuspended `requestAnimationFrame` loop (`let animationId; ... animationId = requestAnimationFrame(animate);` with a matching `cancelAnimationFrame` in cleanup) and does **not** import or call `createSuspendedRaf` — see the `content` field of the single file entry in [`apps/docs/public/r/dotted-grid.json#L18`](../../../apps/docs/public/r/dotted-grid.json#L18). This directly contradicts the current registry source, [`index.jsx#L285-L374`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L285-L374), which uses `createSuspendedRaf`. It also lists only one file in its `files` array (no `createSuspendedRaf.js` entry), consistent with mirroring a version of the component that predates that file's introduction.
Practically: since `tier` is `"free"`, most CLI installs pull straight from this public JSON (per `developer-new-component.md`: "For free tier components, the full source code is embedded in the public JSON"). That means the documented F-042 rollout benefit (pausing the rAF loop when the tab is hidden or the effect is offscreen) is **not actually reaching installers of this component** — they get the pre-rollout code that runs its dot-grid loop continuously regardless of visibility. This is exactly the failure mode `developer-new-component.md` warns about under "Things That Will Break It": *"Forgetting to re-run `build:registry` after edits — the docs site and CLI both read from `public/r/`, not the source."* **Severity: High** (major performance/battery regression reaching the majority install path, silently contradicting a documented-done rollout task).

### 3. Medium — demo copy and registry copy have diverged behaviorally and visually
The live preview at `/demo/dotted-grid` renders `apps/docs/src/components/dotted-grid/index.jsx` (imported by [`apps/docs/src/app/(marketing)/demo/dotted-grid/page.js#L1`](<../../../apps/docs/src/app/(marketing)/demo/dotted-grid/page.js#L1>)), which is a **different** file from what installing via the registry actually gives users. Concrete differences:
  - The docs copy has no `GRAY_DISPERSE_TIME` phase at all ([`apps/docs/src/components/dotted-grid/index.jsx#L13-L17`](../../../apps/docs/src/components/dotted-grid/index.jsx#L13-L17) vs. the registry's four-phase cycle at [`index.jsx#L16-L20`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L16-L20)), so the demo skips the "disperse back to gray/random" animation beat the registry version plays after each shape hold.
  - The docs copy shows a desktop hint, *"Click anywhere to change the pattern."*, at `max-sm:hidden` ([`apps/docs/src/components/dotted-grid/index.jsx#L378-L380`](../../../apps/docs/src/components/dotted-grid/index.jsx#L378-L380)) — the registry copy has **no such hint at all**; its only text is the mobile-only "Works best on desktop" message, and even that fires at a different breakpoint (`max-xl:flex` in the registry, [`index.jsx#L393-L396`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L393-L396), vs `max-sm:flex` in the docs copy). Installers therefore lose the only on-screen affordance telling users the shape is clickable, and the fallback mobile message shows on a much wider range of viewport sizes (up to `xl`) than what was validated in the demo (`sm` only).
`developer-new-component.md` describes the docs `src/components/` copy and the `registry/effects/` copy as source and "clean copy" of each other — they are meant to stay in sync. **Severity: Medium** (real, bounded UX/behavior mismatch between what's previewed and what's shipped; no crash, but the demo is not representative of the installed product).

### 4. Low — decorative comment dividers violate CODING_STANDARDS.md
`CODING_STANDARDS.md` §1 states: *"Keep section headers consistent and plain. Do not draw lines or use decorative divider characters in comments."* The registry `index.jsx` uses long `─` box-drawing dividers repeatedly, e.g. [`index.jsx#L6`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L6), [`#L123`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L123), [`#L149`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L149), [`#L283`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L283), [`#L367`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L367). **Severity: Low.**

### 5. Low — no `className` prop / no color customization, contra developer-new-component.md
`developer-new-component.md` Step 1 code rules state: *"Accept a `className` prop so users can override styles"* and *"No hardcoded colors - use props with sensible defaults."* `DottedGrid()` takes no props at all ([`index.jsx#L125`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L125)); the background fill (`#000000`, [`index.jsx#L296`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L296)) and the trail hue (`hsla(210, ...)`, [`index.jsx#L278`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L278)) are hardcoded, and the wrapping `<section>` hardcodes `bg-black` with no way to merge an external `className`. **Severity: Low** (bounded — it's an intentionally opinionated full-bleed background, but it is a documented-guideline deviation, and other Vault backgrounds may expose a `className` escape hatch that this one lacks — not verified against siblings, scope-limited to this component).

## Accessibility assessment

- The `<canvas>` has no `aria-hidden="true"`, `role="img"`, or fallback text ([`index.jsx#L387-L390`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L387-L390)). It is purely decorative/ambient, so this is a minor gap rather than a functional block — screen readers generally skip empty canvases with no fallback content, but an explicit `aria-hidden="true"` would remove any ambiguity. Not scored as a rubric-level finding since no interactive content is blocked.
- The click-to-change-shape interaction has no keyboard equivalent and no focusable element — but the canvas is not in the tab order and carries no semantic control role, so this is consistent with it being a pure background decoration rather than a functional control. No finding raised on this basis alone.
- `prefers-reduced-motion` is **not** checked anywhere in `index.jsx` — the dot grid animates continuously (mouse lag, shape morphing, per-dot blink) with no fallback to a static or reduced state for users who have requested reduced motion. **Severity: Medium** per the rubric ("missing prefers-reduced-motion handling").

## Performance assessment

- rAF suspension is present and correct in the registry source via `createSuspendedRaf` ([`index.jsx#L285-L365`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L285-L365)), pausing on tab-hidden and offscreen — confirmed by reading [`createSuspendedRaf.js`](../../../registry/effects/backgrounds/dotted-grid/createSuspendedRaf.js) directly (identical logic to the canonical `_shared` version). However, as covered in Risk #2, the **publicly distributed mirror does not carry this fix**, which is the practical performance risk for most installers.
- Per-frame cost is O(dots × trail): the trail loop iterates up to `TRAIL_LENGTH = 456` points for every dot on every frame ([`index.jsx#L321-L339`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L321-L339)). With `SPACING = 24`, a 1920×1080 canvas produces roughly 80×45 ≈ 3,600 dots, so the trail inner loop can run up to ~1.6M iterations/frame in the worst case (cursor moving continuously, trail buffer full). This is bounded (not unbounded/runaway) and the trail array is capped via `.shift()` ([`index.jsx#L193-L195`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L193-L195)), so it does not constitute a memory leak, but it is a real CPU cost worth flagging for lower-end devices. No automated performance test exists in this repo to confirm actual frame timings — this is a static-analysis observation only, not a measured regression.
- No object churn per frame beyond primitives (dot objects are pre-allocated in `createDots`), which is good practice for GC pressure.

## SEO and content-surface assessment

Not applicable in any meaningful way — this is a `"use client"` canvas background with no text content indexable by search engines beyond the two hint strings, which are decorative UI copy, not page content. The demo page (`apps/docs/src/app/(marketing)/demo/dotted-grid/page.js`) does correctly call `getDemoPageMetadata("dotted-grid")` for `generateMetadata` ([`page.js#L18-L20`](<../../../apps/docs/src/app/(marketing)/demo/dotted-grid/page.js#L18-L20>)), so the page itself has metadata; that's outside this component's own responsibility.

## Responsive / mobile / touch behavior assessment

- The canvas uses `touch-none` ([`index.jsx#L389`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L389)), which disables browser touch scrolling/gestures over the canvas. Combined with `h-screen w-full` on the wrapping `<section>` ([`index.jsx#L386`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L386)), this is a full-viewport hero-style background, so trapping touch gestures there is a reasonable, likely intentional design choice for a full-bleed hero — but it does mean any consumer that drops this component into a shorter, in-flow section (not a full-screen hero) would unexpectedly block scroll gestures over that section on touch devices. Worth calling out as a **usage caveat**, not a bug in isolation, since the component's only documented use (`/demo/dotted-grid`) is exactly the full-screen case it was built for.
- Pointer events are used (`pointermove`/`pointerleave`, [`index.jsx#L371-L372`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L371-L372)), which correctly unifies mouse and touch input rather than binding separate `mouse*`/`touch*` handlers.
- `click` fires on tap too, so shape-cycling works on touch, consistent with the visible "tap & drag to explore" copy shown to touch users ([`index.jsx#L393-L396`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L393-L396)).
- The breakpoint used for the mobile hint (`max-xl:flex`) is inconsistent with `CODING_STANDARDS.md` §5's guidance to prefer `max-sm:`/`max-md:` consistently — see Risk #3 for the concrete drift against the docs copy, which uses `max-sm:`.
- `resize` is handled via a `window` `"resize"` listener that rebuilds the dot grid from scratch ([`index.jsx#L171-L180`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L171-L180), listener at [`#L370`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L370)) — correctly handles orientation change / viewport resize, though it does not debounce, which could cause rapid `createDots()` re-allocation during a drag-resize on desktop. Not scored as a finding — no automated test exists to confirm this is a measurable issue, and it's bounded by resize-event frequency, not unbounded.

## Maintainability and code-quality assessment

- Clear separation of pure shape-strength functions from the stateful component — easy to reason about and extend with a sixth shape.
- Single `useEffect` for the whole canvas lifecycle, matching `CODING_STANDARDS.md` §6 "keep the entire setup inside one `useEffect`."
- File-structure order roughly follows `CODING_STANDARDS.md` §1 (imports → constants → helpers → component), though the guide's exact section labels ("Shaders / Templates", "Types / PropTypes") don't apply here and are correctly omitted.
- The registry/docs duplication (Risk #3) and the stale public mirror (Risk #2) are the main maintainability liabilities — three near-identical ~400-line copies of the same component now exist across `registry/effects/backgrounds/dotted-grid/index.jsx`, `apps/docs/src/components/dotted-grid/index.jsx`, and the embedded string in `apps/docs/public/r/dotted-grid.json`, and they have already drifted from each other in observable ways.

## Security and dependency concerns

- `dependencies: []` in both `registry.json` and `package.json` — no third-party runtime dependencies, so no supply-chain surface beyond React itself.
- No use of `dangerouslySetInnerHTML`, `eval`, or any user-supplied string rendered into the DOM/canvas — no XSS surface. All canvas drawing uses numeric coordinates and a fixed HSL string template with numeric interpolants ([`index.jsx#L278`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L278)), not string concatenation of external input.
- No secrets, tokens, or credentials present in any of the four files read.

## Browser compatibility considerations

- Uses standard Canvas2D APIs (`getContext("2d")`, `fillRect`, `arc`, `fill`) — broadly supported.
- Uses `IntersectionObserver` (via `createSuspendedRaf.js`) and `pointermove`/`pointerleave` — both have solid modern-browser support (IE11 is not a target per the rest of the codebase's use of optional chaining and other modern syntax throughout).
- `devicePixelRatio` fallback to `1` if unavailable ([`index.jsx#L146`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L146)) is a sensible defensive default.
- No vendor-prefixed APIs or non-standard canvas features used.

## What was checked and found clean

- `registry.json` schema completeness against `developer-new-component.md`: `name` ("dotted-grid") matches the folder name exactly; `type` is `"registry:component"`; `category` is exactly `"backgrounds"`; `main` ("index.jsx") points at a file that actually exists in the folder; both imported files (`index.jsx`, `createSuspendedRaf.js`) are listed in `files` with correct `target` paths; `previewUrl` (`/demo/dotted-grid`) matches the actual demo route at `apps/docs/src/app/(marketing)/demo/dotted-grid/page.js`. All confirmed via [`registry.json`](../../../registry/effects/backgrounds/dotted-grid/registry.json).
- `exportName`/`exportKind` in `registry.json` (`"DottedGrid"` / `"named"`) match the actual export in `index.jsx` (`export function DottedGrid()`, [`index.jsx#L125`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L125)).
- Cleanup on unmount is complete: all four listeners added (`resize` on `window`; `pointermove`, `pointerleave`, `click` on the canvas) are removed, and `loop.destroy()` is called, in the `useEffect` return at [`index.jsx#L376-L382`](../../../registry/effects/backgrounds/dotted-grid/index.jsx#L376-L382). No WebGL context/geometry/material exists here (Canvas2D, not WebGL), so no disposal is applicable.
- `createSuspendedRaf.js` in this effect's folder is structurally identical to the canonical `_shared/createSuspendedRaf.js` (same `createVisibilityGate`/`createSuspendedRaf` API, same `DEFAULT_ROOT_MARGIN`), consistent with the "copy, don't import" rollout pattern documented in `_shared/README.md`.
- No unused variables, imports, or stray `console.log` found in `index.jsx`.
- All event handlers are named functions (`handlePointerMove`, `handlePointerLeave`, `handleClick`, `resize`), satisfying `CODING_STANDARDS.md` §3 "Name all inline functions."
- No `useState` used for per-frame animation values — all animation state lives in refs/plain closures, satisfying `CODING_STANDARDS.md` §6.

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per `CHANGE_GUIDELINES.md`. Any actual fix must be verified not to alter UI, responsiveness, or registry behavior before being applied, and per `CHANGE_GUIDELINES.md` a fix that would touch any of those should be confirmed with the owner first. In priority order:

1. **Fix `package.json`** (`main`/`files` should reference `index.jsx`, not the nonexistent `dotted-grid.jsx`) and re-`pack` the tarball — the current npm artifact ships no code. Check whether this same defect exists across other registry effects (`dither-canvas`, `spider-particles` share the pattern) since a single shared fix may cover all three.
2. **Re-run `npm run build:registry`** from `apps/docs/` to regenerate `public/r/dotted-grid.json` so the publicly-served free-tier source matches the current `createSuspendedRaf`-using registry source.
3. **Reconcile the docs demo copy with the registry copy** (or intentionally document why they differ) — at minimum restore the "Click anywhere to change the pattern" hint and align the mobile-hint breakpoint, so the live demo represents what installers actually receive.
4. Consider adding a `prefers-reduced-motion` check that either stops the shape-cycling/mouse-trail animation or falls back to a static grid.
5. Consider accepting a `className` prop and/or color props for the background fill and trail hue, per `developer-new-component.md` Step 1 guidance.
6. Low-priority polish: remove decorative `─` comment dividers to match `CODING_STANDARDS.md` §1.

## Final score: 5/10

## Overall severity label: Critical
