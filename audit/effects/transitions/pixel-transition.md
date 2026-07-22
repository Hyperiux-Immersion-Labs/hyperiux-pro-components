# pixel-transition (transitions)

## Summary
The `pixel-transition` component is a visually premium, canvas-based page transition effect. It maps a 2D canvas grid of pixels across the viewport, using GSAP to animate a diagonal wave of blocks that fill the screen during route exit and clear from the screen during entry. It is designated as a premium Pro-tier component. While the visual wave delivers a high-end feel, it suffers from heavy canvas rendering overhead, severe public manifest installation path collisions, and broken npm packaging parameters.

## Implementation overview
The core logic resides in `registry/effects/transitions/pixel-transition/index.jsx`.
- **Canvas-based Rendering Grid**: A single `<canvas>` element spans the entire viewport. On resize or mount, the canvas is resized to match the device pixel ratio (`DPR = Math.min(window.devicePixelRatio || 1, 2)`) to ensure sharp rendering on Retina displays (lines 85-97).
- **Double Mapped Rendering Loop**: The custom `drawGrid` function (line 17) clears the canvas and calculates fill sizes for each pixel block. It uses nested `cols` (default 30) and `rows` (default 40) loops to draw up to 1,200 rectangular shapes (`ctx.fillRect`) per update.
- **GSAP Tweens**: Rather than running a custom `requestAnimationFrame` render loop, the component animates a virtual state ref `stateRef.current.progress` from 0 to 1 using GSAP (line 108). In the `onUpdate` callback of the GSAP tween, it invokes `drawGrid`, forcing the canvas to repaint with the current frame progress.
- **Content Shift**: Optionally, if `enableContentShift` is true, the background page content is shifted horizontally and blurred using GSAP timelines.

## Strengths
- **Retina Display Sharpness**: Setting up the canvas using DPR scaling (line 88) successfully prevents blurriness on modern high-resolution displays.
- **Smooth Custom Easing Function**: The custom `easeInOut` function (line 13) provides smooth acceleration and deceleration curves for the individual block expansions, avoiding the linear stiffness typical of basic canvas transitions.
- **Proper Tween Cleanup**: Returns cleanup calls that kill the active GSAP timeline and tweens immediately on component unmount (lines 156 and 179), avoiding memory leaks on page navigation.

## Risks and issues

### Critical Severity
*No critical issues found.*

### High Severity
- **Severe Public Manifest Target Path Collision**:
  In `apps/docs/public/r/pixel-transition.json#L20`, the `target` parameter for the installation is declared as `components/hyperiux/index.jsx` instead of a nested subdirectory like `components/hyperiux/pixel-transition/index.jsx`. This is a major defect. If a user installs this component alongside any other premium transition that shares this identical target path, they will overwrite each other at the root file level, destroying the codebase.
- **Broken NPM Package Main Entry Point**:
  In `registry/effects/transitions/pixel-transition/package.json#L5`, the `main` entry is declared as `pixel-transition.jsx`, and in `registry/effects/transitions/pixel-transition/package.json#L7`, `pixel-transition.jsx` is listed under the files to package. However, the file in the registry folder is actually named `index.jsx`. This mismatch means that packaging this component via `npm pack` or publishing it to an registry will result in a completely broken package lacking any actual source code.

### Medium Severity
- **Heavy Canvas Repaint and Calculation Overhead**:
  During a transition, the `drawGrid` function is triggered on every single frame update. It loops 1,200 times on desktop and 500 times on mobile to perform math calculations (`Math.max`, `Math.min`, custom `easeInOut`, and divisions) and calls `ctx.fillRect` for each filled block. At 60fps or 120fps, this equates to 72,000 to 144,000 canvas operations per second, representing a major CPU/GPU rendering bottleneck that can drop frames on lower-end laptops or mobile devices.
- **Silent Overriding of Custom Props**:
  If a developer passes custom `cols` and `rows` props to the component (e.g., `<PixelTransition cols={15} rows={20} />`), these parameters are **silently ignored and overridden** on mobile viewports on lines 25-29:
  ```js
  const isMobile = window.innerWidth < 640
  if (isMobile) {
    cols = 10
    rows = 50
  }
  ```
  This is a design flaw that limits custom styling and creates unexpected behavior for developers trying to customize cell density.

### Low Severity
- **Missing Accessibility Attributes on Canvas Node**:
  The overlay `<canvas>` element at `registry/effects/transitions/pixel-transition/index.jsx#L182` lacks `aria-hidden="true"`, allowing screen readers to potentially interact with it.
- **Missing `prefers-reduced-motion` Support**:
  Full-screen pixel expansions can trigger vestibular reactions. The component does not listen to system motion settings.

## Accessibility assessment
- **Screen Reader Compatibility**: Poor. The canvas is not isolated from the assistive tree.
- **Keyboard Navigation**: Neutral. Focus is not managed during page change.
- **Motion Handling**: Deficient. Viewport-wide block transitions run unconditionally, which violates WCAG guidelines for motion reduction.

## Performance assessment
- **rAF Loops**: None. Handled via the central GSAP ticker on update callbacks.
- **Off-screen Pausing**: Not applicable (active route transition overlay).
- **Cleanup**: Excellent. Ongoing tweens are correctly killed.
- **Object Allocation / GC**: Moderate. No massive objects are allocated inside the render loops, keeping GC pressure low. However, the intensive canvas repainting is heavy on memory bandwidth.

## SEO and content-surface assessment
- **Semantic HTML**: Standard wrappers.
- **Indexability**: High. SEO indexing remains unaffected as children are compiled as-is.

## Responsive / mobile / touch behavior assessment
- **Layout Robustness**: Good. The canvas is resized dynamically to fill the viewport on window resize (line 85).
- **Touch Responsiveness**: Good. Since the canvas is marked with `pointer-events-none` (line 184), touch gestures are correctly dispatched to the page elements underneath.

## Maintainability and code-quality assessment
- **Naming Conventions**: Matches standards. Module constants are correctly declared in `SCREAMING_SNAKE_CASE`.
- **Code Drift**: Checked and verified that `apps/docs/src/components/pixel-transition/index.jsx` matches `registry/effects/transitions/pixel-transition/index.jsx` perfectly.
- **Cleanliness**: Moderate. Hardcoded overrides of developer-defined props on mobile represent poor layout isolation design.

## Security and dependency concerns
- **External Dependencies**: Relies on standard `gsap` and `next-transition-router`. No security concerns identified.

## Browser compatibility considerations
- **Canvas 2D Rendering**: Canvas 2D and DPR scaling are supported on 99%+ of browsers, making this highly compatible compared to WebGL/Three.js.

## What was checked and found clean
- **Registry Source**: Checked and found identical to the docs components.
- **Registry Schema**: `registry.json` correctly declares fields and matches manifest guidelines.

## Suggested improvements and remediation priorities
1. **Immediate Priority**: Fix `apps/docs/public/r/pixel-transition.json#L20` to change the target path from `components/hyperiux/index.jsx` to `components/hyperiux/pixel-transition/index.jsx` to prevent installation file overrides.
2. **Immediate Priority**: Fix `registry/effects/transitions/pixel-transition/package.json` lines 5 and 7 to change `"pixel-transition.jsx"` to `"index.jsx"` to enable proper npm packaging.
3. **High Priority**: Optimize `drawGrid` loop. Instead of drawing up to 1,200 rectangles individually, consider batching adjacent filled rectangles or caching the static full-fill color states to prevent expensive full-loop repaints when progress is at 1.
4. **Medium Priority**: Fix prop overriding. Do not hardcode mobile cell sizes; instead, support relative multipliers or scale props proportionally so custom settings are respected on mobile.
5. **Low Priority**: Add `aria-hidden="true"` and `role="presentation"` to the `<canvas>` element (line 182).

## Final score: 6/10

## Overall severity label: [High]
