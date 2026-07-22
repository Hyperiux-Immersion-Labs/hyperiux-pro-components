# carousels — Category Report

## Category overview

The `carousels` category in the Hyperiux Vault registry showcases 5 high-fidelity, visually-stunning image and content sliders: `registry/effects/carousels/{clippath-slider,infinite-carousel,ring-carousel,webgl-slider,zoom-slider}`.
These effects represent the premium, "wow-factor" tier of the library, employing heavy mathematics, GSAP timelines, WebGL shaders (`webgl-slider`), and custom clip-path sweeps (`clippath-slider`) to construct advanced horizontal and 3D scrolling lists. 
While these effects deliver highly impressive visual results, they frequently struggle with core library-wide integration patterns: empty npm distribution tarballs, significant drift between the installable registry files and the legacy copies actually rendered in live docs previews, severe keyboard/screen-reader accessibility gaps, and uncancelled animation or pointer-follow loops.

## Common patterns across its effects

- **Advanced Animation Timelines (GSAP):** Four of the five effects (`clippath-slider`, `infinite-carousel`, `ring-carousel`, `zoom-slider`) rely heavily on GreenSock (GSAP) to manage compound transitions, spring-like eases, and drag/inertia flings.
- **Custom Pointer Physics and Lerp Buffers:** Multiple effects implement custom mouse-following widgets (like the custom circular cursor in `clippath-slider` or pointer-direction-sensitive tilts in `ring-carousel` and `zoom-slider`) driven by lerped math loops.
- **Symmetric and Heavy Animation Bookkeeping:** When properly structured, the GSAP effects correctly kill previous tweens and revert `SplitText` instances before rebuilding them, avoiding memory bloat during active transitions.
- **Unmanaged, Permanent Animation Loops:** While none of these components utilize the shared `createSuspendedRaf` pattern (as `carousels` was not in the F-042 suspension rollout scope), they often establish continuous, native `requestAnimationFrame` loops for custom cursors or WebGL render loops.

## Repeated issues

### Critical

- **Zero-Code npm Tarballs (Systemic Template Defect):** Similar to the backgrounds and buttons categories, every carousel's `package.json` contains a mismatched `"files"` list or `"main"` property pointing to a nonexistent `{slug}.jsx` file instead of `index.jsx` (e.g., `ring-carousel.jsx` instead of `index.jsx` in `ring-carousel`). This results in the packaged npm tarballs in `registry/dist/` shipping completely empty of executable component code.
- **Uncancelled `requestAnimationFrame` Memory Leaks (`clippath-slider`, `ring-carousel`):** In `clippath-slider`, the custom cursor tracking loop is never cancelled on unmount (no frame ID is captured or passed to `cancelAnimationFrame`), creating an infinite, orphaning background loop. `ring-carousel` features a similar uncancelled rAF tracking loop.

### High

- **Severe Accessibility Failures (No Keyboard or AT Navigation):** Multiple premium sliders are completely inoperable for keyboard-only and screen-reader users. In `clippath-slider` and `zoom-slider`, the slide-changing controls are full-screen `<div onClick>` layers or raw pointer-move tilt boundaries with absolutely no keyboard equivalents, focus rings, focus targets, or ARIA semantics.
- **Icon-Only Controls Missing Accessible Names (`infinite-carousel`):** While the base component allows text labels, the live demo configuration overrides them with bare Lucide-react `<svg>` icons with zero `aria-label` attributes, rendering the prev/next controls completely nameless to assistive tech.
- **Deep Code-Parity Drift:** What a developer sees in the docs site preview is imported from `apps/docs/src/components/...` rather than the `registry/` folder. Diffing reveals that the registry version is missing performance tweaks, critical responsive styling overrides, and layout fixes (like `scale-150` bugs and breakpoint discrepancies) that exist only in the docs copy.

### Medium

- **Incomplete WebGL Resource Disposal (`webgl-slider`):** While `webgl-slider` cleans up its event listeners, it fails to fully dispose of Three.js geometries, shaders, and WebGL render targets on unmount, which can lead to memory leak accumulation in single-page application router cycles.
- **Missing `prefers-reduced-motion` Guards:** High-movement slides, rotating 3D rings, and zooming clip-path Sweeps run unconditionally for all users, completely bypassing OS-level accessibility options.

### Low

- **Unused State Variables & Magic Numbers:** Dead states like `nextSlideIndex` in `clippath-slider` are updated but never read, forcing unnecessary React re-renders. Magic numbers like transition durations (`8000`ms, `0.12` lerp factors) are inlined inside the files rather than extracted to module-level variables.
- **Violations of Section Comments and Comment Styles:** The files consistently use disallowed Unicode box-drawing comment dividers to visually organize their code.

## Best practices to standardize

1. **Mandate Standard Focusable Controls:** Never rely on viewport-wide raw click handlers for critical actions. Provide hidden or visible native `<button>` elements with clear focus borders.
2. **Standardize Canvas/WebGL Disposal Hooks:** Ensure every Three.js or WebGL component implements a robust, deep disposal sequence that loops through the scene hierarchy to call `.dispose()` on all geometries, textures, materials, and WebGL contexts.
3. **Always Store rAF Identifiers in Refs:** Ensure every `requestAnimationFrame` invocation assigns its ID to a React `useRef` (e.g., `rafId.current = requestAnimationFrame(animate)`) and symmetrically calls `cancelAnimationFrame(rafId.current)` in cleanup.
4. **Synchronize Registry as Source of Truth:** Force all docs demos to compile directly from the registry folder, eliminating the secondary local copies and preventing silent visual/functional code divergence.

## Prioritized list of improvements

1. **Fix `package.json` configurations:** Update `"main"` and `"files"` fields to target `index.jsx` and `*Comp.jsx` across all carousel subdirectories to fix empty npm tarballs.
2. **Re-route Live Preview Demos:** Point the docs-site routes directly to the `registry/effects/...` versions, unifying code paths and resolving the breakpoint and layout drifts.
3. **Implement rAF Cancellation Cleanups:** Refactor `clippath-slider` and `ring-carousel` to store all active animation frame IDs in refs and cleanly cancel them upon component unmount.
4. **Expose Keyboard Navigation & Focus Targets:** Inject accessible native `<button>` markup for slide switching, ensuring all actions are reachable via `Tab` and executable via `Enter`/`Space`.
5. **Add WebGL Deep-Teardown Sequences:** Update `webgl-slider`'s unmount cleanup to thoroughly dispose of all Three.js renderers, scene objects, materials, and textures.

## Score distribution table

| Effect | Score | Severity | One-Line Summary |
|---|---|---|---|
| `clippath-slider` | 6.0/10 | High | Radial sweep transition on canvas, empty npm tarball, uncancelled rAF loop leak, and severe keyboard navigation block. |
| `infinite-carousel` | 5.0/10 | Critical | GSAP horizontal looping drag carousel with empty npm tarball, nameless icon-only controls, and registry-docs code drift. |
| `ring-carousel` | 5.5/10 | High | 3D rotating ring layout, empty npm tarball, uncancelled scroll listener/rAF leaks, and major responsive styling drift. |
| `webgl-slider` | 6.5/10 | High | Custom WebGL-shader slider, empty npm tarball, incomplete Three.js material disposal on unmount, and lack of keyboard fallback. |
| `zoom-slider` | 6.0/10 | High | GSAP active-card zoom slider, empty npm tarball, missing touch swipe controls, and unhandled motion reduction flags. |
