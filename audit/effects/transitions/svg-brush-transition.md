# svg-brush-transition (transitions)

## Summary
The `svg-brush-transition` component is a creative, high-end route transition effect designed for route changes in Next.js. It achieves a hand-painted "brush-stroke" aesthetic by rendering a full-screen, responsive SVG path that sweeps across the viewport. It relies on the `DrawSVGPlugin` from GreenSock to animate the stroke length during route switches. It is designated as a premium Pro-tier component. However, the component suffers from a critical, blocking dependency on a proprietary premium GSAP plugin, representing severe licensing and compilation risks for end users, alongside installation-manifest target path errors.

## Implementation overview
The core code is located in `registry/effects/transitions/svg-brush-transition/index.jsx`.
- **GSAP Plugin Registration**: The component registers and imports the premium plugin at the top of the file:
  ```js
  import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
  gsap.registerPlugin(DrawSVGPlugin)
  ```
- **Dual-Path SVG Layout**: Two distinct SVG path structures are embedded in the JSX: a desktop version styled with a portrait viewBox (`0 0 1316 664`, line 107) and a mobile portrait-optimized version (`0 0 390 844`, line 132) that maps a compressed wave rhythm to match standard smartphone ratios.
- **GSAP Timelines**:
  - `leave`: Evaluates the active path based on window width (`getActivePath()`, line 25), animates a central black backdrop overlay, and sweeps the stroke width of the active path up to a massive `300` pixels using `drawSVG: '100%'` (line 61-62). This fills the screen with the stroke color to mask the page switch.
  - `enter`: Triggers `drawSVG: '100% 100%'` (line 76) to wipe the brush stroke off-screen from tail-to-tip, and fades the black overlay out to reveal the new page.

## Strengths
- **Cinematic Creative Polish**: Delivers a highly responsive, ultra-premium organic stroke wipe that is visually jaw-dropping.
- **Proper Mobile Optimization**: Hardcoding two completely separate, optimized SVG path geometries for mobile and desktop screens (lines 115 and 140) ensures the stroke fits the screen edge-to-edge on both aspect ratios without looking stretched or distorted.
- **Clean Lifecycle Cleanup**: Returns cleanup functions that call `timeline.kill()` immediately on unmount (lines 69 and 96).

## Risks and issues

### Critical Severity
- **Critical Proprietary Premium Dependency and Compilation Risk**:
  The component imports `DrawSVGPlugin` directly from `gsap/DrawSVGPlugin` on line 6. However, `DrawSVGPlugin` is **not part of the free public `gsap` package** on npm. It is a premium, closed-source plugin that requires a paid **Club GreenSock subscription** to obtain and use in production. Any standard developer installing this component from the public registry using standard npm/pnpm setups will suffer immediate compile-time errors:
  ```
  Module not found: Can't resolve 'gsap/DrawSVGPlugin'
  ```
  This is a critical, blocking defect. It makes the component completely unusable out-of-the-box for standard users, forces them to purchase a paid subscription to make the package compile, and introduces substantial legal licensing risks if the repository redistributes premium closed-source code in bundles without permission.

### High Severity
- **Severe Public Manifest Target Path Collision**:
  In `apps/docs/public/r/svg-brush-transition.json#L20`, the `target` parameter for the installation is declared as `components/hyperiux/index.jsx` instead of a nested subdirectory like `components/hyperiux/svg-brush-transition/index.jsx`. This is a major defect. If a user installs this component alongside any other premium transition that shares this identical target path, they will overwrite each other at the root file level, destroying the codebase.

### Medium Severity
*No medium issues found.*

### Low Severity
- **Missing Accessibility Attributes on Visual Overlay**:
  The transition overlay container `div` at `registry/effects/transitions/svg-brush-transition/index.jsx#L99` and its nested SVG elements lack `aria-hidden="true"`, which allows assistive technologies to read these visual structures.
- **Missing `prefers-reduced-motion` Support**:
  Large-scale viewport-wide brush strokes can trigger vestibular discomfort. The component lacks support for skipping transitions when reduced motion is requested.

## Accessibility assessment
- **Screen Reader Compatibility**: Poor. Moving SVG paths are not hidden via ARIA nodes.
- **Keyboard Navigation**: Neutral. Focus is not managed during route changes.
- **Motion Handling**: Deficient. Large full-screen sweeps run unconditionally, violating WCAG 2.1 AAA Guideline 2.3.3.

## Performance assessment
- **rAF Loops**: None. Managed by the GSAP ticker.
- **Off-screen Pausing**: Not applicable (active route transition overlay).
- **Cleanup**: Excellent. Timelines are killed immediately on unmount.
- **Object Allocation / GC**: Good. No large runtime memory or garbage collection pressure is created, as the SVG paths are pre-compiled and static in the DOM.

## SEO and content-surface assessment
- **Semantic HTML**: Standard wrappers.
- **Indexability**: High. SEO indexing remains unaffected as children are compiled as-is.

## Responsive / mobile / touch behavior assessment
- **Layout Robustness**: High. Defining distinct desktop and mobile SVGs and selecting between them at runtime on resize based on `window.innerWidth` (line 27) ensures optimal layout fidelity.
- **Touch Responsiveness**: Good. Overlay wrappers use `pointer-events-none` (line 101) to prevent touch and hover blocking.

## Maintainability and code-quality assessment
- **Naming Conventions**: Matches standards. Props and variables are correctly named in `camelCase`.
- **Code Drift**: Checked and verified that `apps/docs/src/components/svg-brush-transition/index.jsx` matches `registry/effects/transitions/svg-brush-transition/index.jsx` perfectly.
- **Packaging Integrity**: Checked and confirmed that `registry/effects/transitions/svg-brush-transition/package.json` correctly declares its `main` entry point as `index.jsx` (line 5), representing a clean packaging layout.

## Security and dependency concerns
- **External Dependencies**: Highly problematic due to the premium GSAP dependency. Free-tier and standard open-source installers cannot resolve this dependency.

## Browser compatibility considerations
- **DrawSVG Support**: DrawSVG has high cross-browser SVG compatibility, and the path rendering is extremely robust compared to CSS masking or raw canvas painting.

## What was checked and found clean
- **Registry Source**: Registry source code has been checked against the docs site, and they are fully identical.
- **Registry Schema**: `registry.json` correctly declares fields and matches required manifest properties.

## Suggested improvements and remediation priorities
1. **Critical Priority**: Resolve the premium proprietary dependency. Consider rewriting the brush transition to use standard SVG stroke offsets (`stroke-dasharray` and `stroke-dashoffset`) via standard free CSS/GSAP tweens, completely eliminating the need for the paid `DrawSVGPlugin`. This will make the component fully compatible and compile out-of-the-box for all developers.
2. **Immediate Priority**: Fix `apps/docs/public/r/svg-brush-transition.json#L20` to change the target path from `components/hyperiux/index.jsx` to `components/hyperiux/svg-brush-transition/index.jsx` to prevent installation file overrides.
3. **High Priority**: Implement media query `@media (prefers-reduced-motion: reduce)` checks to skip the sweep and instantly fade page content instead.
4. **Low Priority**: Add `aria-hidden="true"` and `role="presentation"` to the overlay wrapper `div` (line 99) and SVG tags.

## Final score: 5/10

## Overall severity label: [Critical]
