# radial-slice-transition (transitions)

## Summary
The `radial-slice-transition` component is a visually dramatic full-screen page transition effect designed for route changes in Next.js. It achieves a rotational, circular sweep (pie-slice wipe) by applying dynamically updated CSS `conic-gradient` masks to a fullscreen fixed color overlay using GSAP. It is designated as a premium Pro-tier component. While it delivers an ultra-modern, slick creative aesthetic, the reliance on high-frequency CSS mask string manipulation introduces major performance and paint rendering bottlenecks on modern mobile engines, alongside severe installation-manifest target path collisions.

## Implementation overview
The core code is located in `registry/effects/transitions/radial-slice-transition/index.jsx`.
- **Dynamic Mask Slicing**: The component uses custom CSS masks via inline styles: `-webkit-mask-image` and `maskImage`.
- **Rotational Calculations**: The `applySlice` helper function (line 21) receives `endDeg` and `startDeg` arguments. It maps these inputs to a `conic-gradient` string, accounting for different wrap-around angles ("laps"). When the rotation represents less than a full turn, it sets a conic mask showing only a pie-slice shape:
  ```js
  const mask = `conic-gradient(from ${s + 90}deg, black 0deg, black ${spread}deg, transparent ${spread}deg)`
  ```
- **GSAP Timelines**: The route `leave` and `enter` hooks animate virtual properties inside `shapeRef.current = { start: 0, end: 0 }` (line 17).
  - During `leave`, the `end` angle is tweened to `540deg` over `tExit` seconds, while the `start` angle is delayed and tweened to `180deg` (line 84-98).
  - During `enter`, the `end` angle is swept to `1080deg` while the `start` angle follows to `360deg` (line 123-144).
  - The GSAP `onUpdate` callbacks invoke `applySlice` on every frame, continuously updating the DOM node's style attribute with dynamically compiled mask strings.

## Strengths
- **Cinematic Creative Polish**: Provides a highly polished, premium circular wipe that stands out from standard sliding, grid, or fading transitions.
- **Proper Tween Cleanup**: Returns cleanup functions in `leave` and `enter` that call `timeline.kill()` (lines 100 and 146), preventing runaway tweens when route changes are aborted or fast-clicked.
- **Responsive Layout Isolation**: Operates on a simple viewport-wide `fixed inset-0` element (line 149), meaning the effect scales perfectly across all screen sizes without needing viewport-resize listeners or width calculations.

## Risks and issues

### Critical Severity
*No critical issues found.*

### High Severity
- **Severe Public Manifest Target Path Collision**:
  In `apps/docs/public/r/radial-slice-transition.json#L20`, the `target` parameter for the installation is declared as `components/hyperiux/index.jsx` instead of a nested subdirectory like `components/hyperiux/radial-slice-transition/index.jsx`. This is a major defect. If a user installs this component alongside any other premium transition that shares this identical target path, they will overwrite each other at the root file level, destroying the codebase.

### Medium Severity
- **Extreme CPU/GPU Paint & Style Recalculation Bottlenecks**:
  During the transitions, the `applySlice` function is called continuously (60 to 120 times per second). On every invocation, it compiles and mutates the element's `-webkit-mask-image` and `maskImage` inline CSS styles with custom-built `conic-gradient` strings (lines 31, 32, 43, 44, 51, 52, 58, 59). In CSS, changing a mask property on every frame forces the browser's style solver and layout engine to recalculate styles, re-evaluate the rasterized conic mask, and perform composite invalidation sweeps across the entire viewport. This introduces major rendering jank and stutter, particularly on Safari and mobile browser engines.

### Low Severity
- **Missing Accessibility Attributes on Visual Overlay**:
  The transition overlay `div` on `registry/effects/transitions/radial-slice-transition/index.jsx#L149` lacks `aria-hidden="true"`, allowing screen readers to potentially scan these visual elements.
- **No `prefers-reduced-motion` Support**:
  Full-screen sweeping circular wipes can trigger motion-related issues. The component lacks a mechanism to disable masks when reduced motion is preferred.

## Accessibility assessment
- **Screen Reader Compatibility**: Poor. Visual overlays are not isolated from assistive trees.
- **Keyboard Navigation**: Neutral. Focus is not managed during page change.
- **Motion Handling**: Deficient. Viewport-wide rotational wipes run unconditionally, which violates WCAG guidelines for motion reduction.

## Performance assessment
- **rAF Loops**: None. Managed by the GSAP central ticker.
- **Off-screen Pausing**: Not applicable (active route transition overlay).
- **Cleanup**: Excellent. Timelines are killed immediately on unmount.
- **Object Allocation / GC**: Moderate. Although object allocation inside the script is low, the browser's internal engine will allocate and free substantial raster memory to continuously repaint full-screen conic gradient layers, causing CPU heating.

## SEO and content-surface assessment
- **Semantic HTML**: Standard wrappers.
- **Indexability**: High. SEO indexing remains unaffected as children are compiled as-is.

## Responsive / mobile / touch behavior assessment
- **Layout Robustness**: Excellent. Operating on a `fixed inset-0` element isolates layout sizing from screen-width changes.
- **Touch Responsiveness**: Good. Since the overlay container is marked with `pointer-events-none` (line 151), it does not block touch gestures or click events on the underlying page content.

## Maintainability and code-quality assessment
- **Naming Conventions**: Matches standards. Props (`bgColor`, `duration`) are correctly named, and module refs use clear camelCase names.
- **Code Drift**: Checked and verified that `apps/docs/src/components/radial-slice-transition/index.jsx` matches `registry/effects/transitions/radial-slice-transition/index.jsx` perfectly.
- **Packaging Integrity**: Checked and confirmed that `registry/effects/transitions/radial-slice-transition/package.json` correctly declares its `main` entry point as `index.jsx` (line 5), representing a clean packaging layout compared to sibling components.

## Security and dependency concerns
- **External Dependencies**: Relies on standard `gsap` and `next-transition-router`. No security concerns identified.

## Browser compatibility considerations
- **Conic Mask Support**: Conic gradient masks have 95%+ support but are known to suffer from rendering artifacts and poor paint performance in mobile Safari versions below iOS 16.

## What was checked and found clean
- **Registry Source**: Checked and found identical to the docs components.
- **Registry Schema**: `registry.json` correctly declares fields and matches manifest guidelines.

## Suggested improvements and remediation priorities
1. **Immediate Priority**: Fix `apps/docs/public/r/radial-slice-transition.json#L20` to change the target path from `components/hyperiux/index.jsx` to `components/hyperiux/radial-slice-transition/index.jsx` to prevent installation file overrides.
2. **High Priority**: Implement media query `@media (prefers-reduced-motion: reduce)` checks to skip the rotational sweep and instantly fade the page content instead.
3. **High Priority**: Optimize mask paint cycles. To avoid heavy browser re-evaluation of `conic-gradient` masks on every single frame, consider transitioning a pre-rendered high-resolution SVG circle with custom arc stroke offsets (`stroke-dasharray`), which can be hardware-accelerated directly on modern GPUs.
4. **Low Priority**: Add `aria-hidden="true"` and `role="presentation"` to the overlay `div` (line 149).

## Final score: 7/10

## Overall severity label: [High]
