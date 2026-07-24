# dither-canvas (backgrounds)

## Summary

`dither-canvas` is a WebGL2 fullscreen shader effect that renders a video source through an ASCII/dither character grid with a real-time 2D fluid simulation driven by mouse movement. The registry source (`registry/effects/backgrounds/dither-canvas/`) is functionally solid — `registry.json` is a fully schema-compliant entry, the F-042 rAF-suspension pattern is correctly wired in, and unmount cleanup tears down every GL resource and listener it creates. The problems are all in the surrounding build/distribution pipeline and a few missing polish items, not in the shader/animation logic itself: the packaged npm tarball for this component ships with no source code at all (confirmed by inspecting the actual `.tgz`), the generated public registry mirror is stale relative to the current source, the live demo page renders a docs-site copy that has quietly diverged from the registry copy, and there is no `prefers-reduced-motion` handling anywhere in the component.

## Implementation overview

- [`index.jsx`](../../../registry/effects/backgrounds/dither-canvas/index.jsx) is the entire component: a `"use client"` React component that owns a `<canvas>` ref, sets up a WebGL2 context, compiles a single fragment shader that samples a video texture, a small Jacobi-relaxation fluid sim (80×60 cells, [index.jsx#L253-L404](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L253-L404)), a Bayer-dithering pass, and a monospace glyph atlas baked once via 2D canvas ([index.jsx#L577-L606](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L577-L606)).
- [`createSuspendedRaf.js`](../../../registry/effects/backgrounds/dither-canvas/createSuspendedRaf.js) is the shared F-042 rAF-suspension helper, copied locally per the documented rollout pattern (see its own header comment, [createSuspendedRaf.js#L12-L19](../../../registry/effects/backgrounds/dither-canvas/createSuspendedRaf.js#L12-L19)).
- The mouse produces a short-lived "trail" of impulse points ([index.jsx#L633-L678](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L633-L678)) that inject velocity into the fluid grid each frame and are also passed straight to the shader as a small uniform array for a secondary displacement effect.
- Remote video sources are fetched with `credentials: "omit"` and converted to a blob URL rather than being pointed at directly ([index.jsx#L417-L447](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L417-L447)), avoiding a same-origin/CORS-cookie leak.

## Strengths

- Registry metadata is complete and correct — see "What was checked and found clean" below; this is the aspect most likely to regress silently and it is in good shape here.
- rAF suspension via `createSuspendedRaf` is correctly wired with `root: canvas` ([index.jsx#L711-L713](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L711-L713)) and `loop.destroy()` is called in the cleanup function, satisfying the F-042 rollout requirement for this effect.
- Unmount cleanup is thorough: removes both listeners, stops the rAF loop, pauses/unloads the `<video>` element, revokes the blob URL, and deletes the WebGL texture/buffer/program objects individually ([index.jsx#L817-L834](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L817-L834)).
- Shader compile/link failures are caught and logged rather than crashing the app, with a fallback cleanup path ([index.jsx#L539-L549](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L539-L549)).
- Responsive character-grid density (`getResponsiveCharColumns`, [index.jsx#L39-L49](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L39-L49)) and a `disableMobileCursor` default that turns off the cursor-driven fluid effect on small screens ([index.jsx#L634](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L634)) show real mobile-performance awareness, backed by an explicit "open on desktop" message.

## Risks and issues

### 1. Critical — packed npm tarball contains no component source code

[`package.json`](../../../registry/effects/backgrounds/dither-canvas/package.json) declares:
```
"main": "dither-canvas.jsx",
"files": ["dither-canvas.jsx", "registry.json"]
```
No file named `dither-canvas.jsx` exists in this folder — the real entry point is `index.jsx` (per `developer-new-component.md`'s "Main file: always `index.jsx`" rule). Since `npm pack`'s `files` field is an allow-list, and it names a file that doesn't exist while omitting the two files that do (`index.jsx`, `createSuspendedRaf.js`), I inspected the already-built artifact directly:
```
$ tar -tzf registry/dist/hyperiux-dither-canvas-0.0.1.tgz
package/package.json
package/registry.json
```
The tarball ships zero lines of component code. This is not a hypothetical — it's the actual current build output at [`registry/dist/hyperiux-dither-canvas-0.0.1.tgz`](../../../registry/dist/hyperiux-dither-canvas-0.0.1.tgz). The same `{slug}.jsx`-instead-of-`index.jsx` pattern also affects `package.json#L5-L9`. **What I could not confirm:** whether this tarball / the root-level `npm run build:registry` → `registry/dist/*.tgz` pipeline is actually consumed anywhere downstream. `PUBLISHING.md` describes the live `npx hyperiux` CLI as fetching from `vault.hyperiux.com/r` (the `public/r/*.json` mirror), and I found no script or workflow file that references `registry/dist` as a publish source. So this defect is real and confirmed, but its production blast radius is unconfirmed — flagging it as broken functionality per the rubric regardless.

### 2. Medium — public registry mirror (`public/r/dither-canvas.json`) is stale, but does not affect the actual pro-tier install (verified)

[`apps/docs/public/r/dither-canvas.json`](../../../apps/docs/public/r/dither-canvas.json) lists only one file:
```
"files": [{ "path": "index.jsx", "type": "registry:component", "target": "components/hyperiux/index.jsx" }]
```
with no entry for `createSuspendedRaf.js`, even though `index.jsx` imports it (`import { createSuspendedRaf } from "./createSuspendedRaf";`, [index.jsx#L4](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L4)) and the current registry `registry.json` correctly lists both files. `apps/docs/scripts/build-registry.js` auto-discovers every `.jsx`/`.js` file in the effect directory ([build-registry.js#L245-L249](../../../apps/docs/scripts/build-registry.js#L245-L249)), so this mismatch means the mirror predates `createSuspendedRaf.js` being added to this folder and `npm run build:registry` has not been re-run since — the exact failure mode `developer-new-component.md` calls out under "Things That Will Break It" ("forgetting to re-run `build:registry`... the docs site and CLI both read from `public/r/`, not the source").

I traced whether this actually reaches installers, and it does not for this component specifically: because `tier` is `"pro"`, the public mirror never embeds source content in the first place ([build-registry.js#L338-L342](../../../apps/docs/scripts/build-registry.js#L338-L342)), and the authenticated install route (`/api/cli/effects/[effectSlug]`) resolves file content by reading `effect.files` off the *private* `registry.json` (not the public mirror) and pulling content live from disk at request time ([`apps/docs/src/lib/registry.js#L133-L160`](../../../apps/docs/src/lib/registry.js#L133-L160), [`registry.js#L204-L219`](../../../apps/docs/src/lib/registry.js#L204-L219)). The private `registry.json` for `dither-canvas` is correct and complete (see "found clean" below), so a real CLI install of this pro effect gets both files with current content. This is a real staleness bug worth fixing (it feeds the public detail page's file listing and index metadata), but — unlike the equivalent finding for `dotted-grid` and other **free**-tier siblings, where the public mirror's embedded content is what installers actually receive — it is not currently shipping broken/outdated code to `dither-canvas` installers. Severity is Medium rather than High for that reason.

### 3. Medium — demo page renders a docs-site copy that has diverged from the registry copy

The demo route imports from `@/components/dither-canvas` ([`page.js#L2`](<../../../apps/docs/src/app/(marketing)/demo/dither-canvas/page.js#L2>)), i.e. [`apps/docs/src/components/dither-canvas/index.jsx`](../../../apps/docs/src/components/dither-canvas/index.jsx), *not* the registry source that CLI installs pull from. `diff` between the two shows the `createSuspendedRaf.js` copies are byte-identical, but `index.jsx` has drifted in two places:
- Cursor-hint pill breakpoint: registry uses `max-[1025px]:hidden`, docs-site copy uses `max-md:hidden`.
- Mobile fallback message: registry uses `bottom-4 ... max-md:text-sm max-[1025px]:text-lg ... max-[1025px]:block`; docs-site copy uses `bottom-20 ... max-sm:text-sm max-md:text-lg ... max-md:block max-sm:w-[60vw]!`.

So the breakpoint at which visitors see the "open on desktop" message and where the cursor-hint pill hides differs between what the public demo page shows and what a CLI install actually produces. Functionally the effect itself (shader, fluid sim, rAF suspension) is identical between the two copies.

### 4. Medium — no `prefers-reduced-motion` handling

Grepped the full component and the shared rAF helper for `prefers-reduced-motion`: no matches. The fluid simulation and dither redraw run continuously via `createSuspendedRaf` regardless of the user's OS-level reduced-motion preference — suspension only reacts to tab visibility and viewport intersection, never to `matchMedia("(prefers-reduced-motion: reduce)")`.

### 5. Low — decorative comment dividers violate `CODING_STANDARDS.md`

`CODING_STANDARDS.md` §1 states: "Do not draw lines or use decorative divider characters in comments. Use words only." This file uses `/* ── constants  */`-style dividers throughout: [index.jsx#L6](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L6), [#L51](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L51), [#L202](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L202), [#L252](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L252), [#L449](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L449).

### 6. Low — silent blank canvas on WebGL2-unsupported browsers

`canvas.getContext("webgl2", ...)` failing (`gl` is `null`) returns `undefined` from the effect with no fallback UI and no console message ([index.jsx#L498-L503](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L498-L503)). Combined with the canvas's own `bg-black` class ([index.jsx#L850](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L850)), a browser without WebGL2 (e.g. Safari < 15, some older Android WebViews) renders a plain black rectangle with no indication anything is wrong.

### 7. Low — hardcoded colors contra `developer-new-component.md`

The dev guide's Step 1 code rules state "No hardcoded colors - use props with sensible defaults." This component hardcodes the glyph tint in the shader (`vec3 normalColor = vec3(0.467, 0.478, 0.478);`, [index.jsx#L189](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L189)) and the overlay text/background colors in JSX (`bg-black`, `text-white/80`, `text-white/50`, [index.jsx#L850-L860](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L850-L860)) with no corresponding props.

### 8. Low — minor performance nits

- `window.matchMedia("(max-width: 639px)")` is re-evaluated on every single `mousemove` event via `isMobile()` ([index.jsx#L631](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L631), called at [#L634](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L634)) instead of once per resize.
- The `resize` listener ([index.jsx#L695](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L695)) is unthrottled/undebounced, so a window drag fires a `gl.viewport` + uniform update on every native resize tick.
- `canvas.width`/`canvas.height` are set to raw CSS pixels (`window.innerWidth`/`innerHeight`, [index.jsx#L686-L687](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L686-L687)) with no `devicePixelRatio` scaling — a deliberate-looking tradeoff for performance (fewer fragment invocations) given the blocky glyph aesthetic, but worth confirming it's intentional rather than an oversight, since it does mean the character grid renders at less-than-native resolution on HiDPI screens.

## Accessibility assessment

- The `<canvas>` carries no `role`/`aria-hidden` attribute; since it's purely decorative and non-interactive (no focus, no keyboard handling, no semantic content), the practical impact is low, but explicit `aria-hidden="true"` would make the decorative intent unambiguous to assistive tech.
- The cursor-hint and mobile-fallback `<p>` elements are `pointer-events-none` and `select-none` — informational only, not interactive, so no keyboard-trap or focus-management concerns.
- No keyboard alternative to the mouse-driven fluid distortion exists, but since the distortion is a pure visual embellishment with no unique content or functionality gated behind it, this does not rise to a core-functionality blocker under the rubric.
- **Gap:** no `prefers-reduced-motion` handling (see Risk #4) — this is the primary a11y-adjacent finding for this component.

## Performance assessment

- The fluid sim does fixed O(FC×FR) work (4,800 cells, several passes) every frame regardless of mouse activity, but this cost is bounded and now correctly gated by `createSuspendedRaf` so it doesn't run while the tab is hidden or the canvas is offscreen ([index.jsx#L711-L813](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L711-L813)) — I could not run an automated frame-timing benchmark in this audit, so the actual steady-state cost per frame is not independently measured here, only the presence/correctness of the suspension gate.
- `video.crossOrigin`/blob-URL fetch avoids repeated network refetching of the video element itself once loaded; no `preload` attribute is set on the `<video>` element, so it uses the browser default (`auto` in most browsers), meaning the full video begins downloading immediately on mount — a real bandwidth cost for a component whose default `videoSrc` points at a remote CDN, worth being aware of for a background component embedded on marketing pages.
- No unbounded loops or missing-cleanup patterns found — see "found clean" below.

## SEO and content-surface assessment

- Purely a decorative/visual `<canvas>` background component; renders no indexable text content of its own beyond the two overlay `<p>` hint strings, which are cosmetic UI copy, not content meant for search indexing. No SEO-relevant concerns identified — this component category is not expected to carry SEO responsibility, and it doesn't take any on (no unexpected `<h1>`, no hidden text tricks, etc.).

## Responsive / mobile / touch behavior assessment

- `getResponsiveCharColumns` scales the glyph density down at `≤639px` (45% of base) and `≤1025px` (55% of base) ([index.jsx#L39-L49](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L39-L49)), a sensible mobile-performance concession.
- `disableMobileCursor` (default `true`) disables the cursor-driven fluid trail entirely on `≤639px` viewports ([index.jsx#L634](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L634)), and a visible fallback message tells mobile users to view on desktop ([index.jsx#L857-L861](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L857-L861)) — reasonable given the effect is fundamentally mouse-driven.
- No touch-event listeners (`touchmove`, etc.) exist at all; combined with `disableMobileCursor` defaulting to `true`, this is a coherent design choice rather than an oversight, but it does mean the effect is inert to touch input even if a consumer explicitly sets `disableMobileCursor={false}` on a touch device — mouse events don't fire from touch interaction in most mobile browsers.
- The resize listener recomputes `uCharColumns` on every resize but does not re-run `getResponsiveCharColumns`'s breakpoint logic against orientation changes specially — it's driven purely by `window.innerWidth`, which does update correctly on rotation, so this is not a functional gap, just noted for completeness.

## Maintainability and code-quality assessment

- The file is long (~865 lines) but internally organized in the order `CODING_STANDARDS.md` prescribes (constants → shaders → helpers → component), aside from the comment-divider style nit (Risk #5).
- Three near-duplicate copies of this component's logic now exist: the registry source, the docs-site working copy, and (per Risk #1/#2) stale/incomplete generated artifacts — this is the main maintainability liability, matching a pattern also seen in sibling `backgrounds` effects (`dotted-grid`, `spider-particles`) per their own audits.
- The `onFrame` callback body inside `createSuspendedRaf({ ... })` ([index.jsx#L712-L812](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L712-L812)) is not indented one level deeper than the surrounding `onFrame: () => {` line — a formatting inconsistency relative to the rest of the file's indentation.
- Inline shader source is a large template literal ([index.jsx#L60-L200](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L60-L200)); it's commented at a high level but individual passes (Bayer threshold, edge/bright character selection, dark-inversion) rely on the reader tracing GLSL logic directly rather than named helper comments — acceptable for a shader of this size, not flagged as a defect.

## Security and dependency concerns

- `dependencies: []` in both `registry.json` and `package.json` — no third-party npm packages, so no supply-chain surface beyond React itself.
- Remote video fetch uses `credentials: "omit"` explicitly ([index.jsx#L432-L435](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L432-L435)), which is the correct choice to avoid leaking cookies to a third-party CDN.
- No `dangerouslySetInnerHTML`, no `eval`, no reflected/unescaped user input anywhere in the component — `videoSrc` is a developer-supplied prop (default points at a hardcoded R2 bucket URL), not end-user-facing free text, so no XSS surface was found.
- No secrets, tokens, or credentials present in source.

## Browser compatibility considerations

- Requires WebGL2 (`canvas.getContext("webgl2", ...)`) — no WebGL1 fallback, and failing silently with a blank black canvas when unsupported (Risk #6).
- Uses ES2020+ syntax (optional chaining, `?.`) and standard DOM APIs (`IntersectionObserver` inside `createSuspendedRaf`, `matchMedia`, `fetch`) — all broadly supported in evergreen browsers but each is a hard dependency with no polyfill or feature-detection guard beyond the WebGL2 check itself.
- `RG32F` floating-point texture format ([index.jsx#L779](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L779)) requires the `EXT_color_buffer_float`-adjacent WebGL2 float-texture support, which is standard in WebGL2 but worth flagging as a specific GPU/driver capability being assumed without a runtime check.

## What was checked and found clean

- `registry.json` ([registry.json](../../../registry/effects/backgrounds/dither-canvas/registry.json)) is fully schema-compliant against `developer-new-component.md`'s Step 4 field table: `name` matches the folder exactly, `type` is `"registry:component"`, `category` is exactly `"backgrounds"`, `tier` is a valid value (`"pro"`), `main` (`index.jsx`) exists, `exportName`/`exportKind` (`DitherCanvas`/`default`) match the actual `export default function DitherCanvas(...)` ([index.jsx#L450](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L450)), `previewUrl` (`/demo/dither-canvas`) matches the real demo route, and the `files` array lists both `index.jsx` and `createSuspendedRaf.js` with correct `target` paths under `src/components/effects/dither-canvas/`. (The build script itself enforces the `previewUrl` check at build time and would throw if it were wrong, [build-registry.js#L227-L233](../../../apps/docs/scripts/build-registry.js#L227-L233).)
- `createSuspendedRaf.js` in this effect's folder is byte-identical to the copy in `apps/docs/src/components/dither-canvas/createSuspendedRaf.js` — no drift there.
- rAF suspension (F-042) is correctly integrated: `createSuspendedRaf({ root: canvas, onFrame })` ([index.jsx#L711-L813](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L711-L813)), `loop.start()` called after setup, `loop.destroy()` called in the unmount cleanup.
- Cleanup on unmount removes both `window` listeners, stops the rAF loop, pauses and unloads the `<video>` element, revokes the object URL, and deletes the video/fluid/atlas textures, the vertex buffer, and the shader program individually ([index.jsx#L817-L834](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L817-L834)) — no leaked GL resources or dangling listeners found.
- No unbounded loops: the fluid sim, trail array (`trail.length > TM` capped at [index.jsx#L674-L676](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L674-L676)), and trail-age pruning ([index.jsx#L719-L726](../../../registry/effects/backgrounds/dither-canvas/index.jsx#L719-L726)) are all bounded.
- Slug/naming consistency: registry folder name, `registry.json#name`, demo route (`/demo/dither-canvas`), and `apps/docs/src/components/dither-canvas` legacy folder name all agree — no slug drift, only the file-content drift documented in Risk #3.
- No automated test exists for this component (no `*.test.js`/`*.spec.js` found alongside it), so none of the performance claims above (fluid-sim frame cost, resize-listener frequency) are backed by a runnable benchmark in this repo — noted rather than guessed at.

## Suggested improvements and remediation priorities

No code was changed as part of this audit. In priority order, and cross-checking against `CHANGE_GUIDELINES.md` (any fix must not break UI, responsiveness, or registry behavior):

1. Fix `registry/effects/backgrounds/dither-canvas/package.json` (`main`/`files` should reference `index.jsx` and `createSuspendedRaf.js`, not the nonexistent `dither-canvas.jsx`), then re-run `npm pack`/`build:registry` to regenerate a working tarball. Note in the sibling `dotted-grid` audit that this exact `{slug}.jsx`-vs-`index.jsx` pattern also affects `spider-particles` — a single shared fix (or fixing the auto-generation logic in `scripts/build-registry.js`'s `ensurePackageForEffect`) may cover all three at once, worth doing as one change rather than three.
2. Re-run `npm run build:registry` from `apps/docs/` to regenerate `public/r/dither-canvas.json` so its `files` array matches current source. Confirmed low urgency for *this* pro-tier effect specifically (doesn't affect real paid installs), but keeps the public detail page's file listing accurate and avoids the same staleness becoming a real content bug if this effect's tier ever changes to free.
3. Reconcile `apps/docs/src/components/dither-canvas/index.jsx` (docs-site copy, what the demo page renders) with the registry copy's breakpoint classes, or intentionally document why they differ, so the public preview accurately represents what installs.
4. Add `prefers-reduced-motion` handling — likely reduce or pause the fluid-trail injection / dither redraw rate when the user has requested reduced motion, mirroring the existing `createSuspendedRaf` gate mechanism.
5. Add a visible fallback (or at minimum a `console.warn`) for the WebGL2-unsupported path instead of a silent black canvas.
6. Low-priority polish: replace decorative comment dividers per `CODING_STANDARDS.md`, fix the `onFrame` callback indentation, throttle/debounce the resize listener, and cache the `isMobile()` result on resize rather than recomputing per `mousemove`.

## Final score: 6.5/10

## Overall severity label: Critical
