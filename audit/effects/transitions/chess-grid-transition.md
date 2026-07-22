# chess-grid-transition (transitions)

## Summary
The `chess-grid-transition` component is a visually dramatic full-screen route transition effect that mimics a staggered checkerboard or sweep-grid wipe across the viewport. Using the `next-transition-router` library alongside `gsap`, it splits the viewport into columns and rows of individual blocks that slide horizontally on-screen during a page transition. While it delivers high visual impact, the component is hindered by high-severity packaging errors, significant codebase drift between the registry source and the docs site, and dead code that triggers GSAP console warnings.

## Implementation overview
The core code is located in `registry/effects/transitions/chess-grid-transition/index.jsx`.
- **Responsive Grid Definition**: The grid is divided into 8 columns (`cols = 8`). The number of rows is dynamically calculated based on window size using a resize listener (desktop = 4 rows, mobile = 9 rows, tablet = 10 rows), rendering `totalCells = cols * rows` (typically 32 blocks on desktop, 72 on mobile).
- **Block Layout & Overlap**: Spans are rendered absolutely inside a fullscreen fixed container. Each block size is calculated in percentage relative to the cols/rows, adding an `overlap = 2` pixels buffer to prevent hairline rendering gaps caused by subpixel rounding errors.
- **GSAP Timelines**: The route's `leave` and `enter` hooks spawn GSAP timelines. During `leave`, blocks slide horizontally into view from the right with a stagger delay based on the row and column coordinates. During `enter`, they slide off-screen to the left to reveal the new page.

## Strengths
- **Subpixel Rounding Mitigation**: The formula for block sizes and positions on lines 147-150:
  ```js
  width: `calc((100vw / ${cols}) * ${isMobile ? 1.6 : 1} + ${overlap}px)`
  ```
  wisely incorporates an `overlap` coefficient. This overlaps neighboring cells by 1-2 pixels, successfully preventing distracting hairline slits and background bleed.
- **Dynamic Device-Specific Rows**: Changing row dimensions based on devices ensures that grid sweeps feel fast and tight on mobile screens (where long vertical blocks would feel awkward) and cinematic on wider desktops.

## Risks and issues

### Critical Severity
*No critical issues found.*

### High Severity
- **Broken NPM Package Main Entry Point**:
  In `registry/effects/transitions/chess-grid-transition/package.json#L5`, the `main` entry is declared as `chess-grid-transition.jsx`, and in `registry/effects/transitions/chess-grid-transition/package.json#L7`, `chess-grid-transition.jsx` is listed under the files to package. However, the file in the registry folder is actually named `index.jsx`. This mismatch means that packaging this component via `npm pack` or publishing it to an registry will result in a completely broken package lacking any actual source code.

### Medium Severity
- **Dead React Ref / Animation of Null Target**:
  The component defines a ref `bgRef` on `registry/effects/transitions/chess-grid-transition/index.jsx#L15`. This ref is included in GSAP timeline animations on line 107 and line 121:
  ```js
  tl.fromTo([wrapperRef.current, bgRef.current], { opacity: 1 }, { opacity: 0, duration: 0.8 }, 0)
  ```
  However, there is **no element in the JSX** that uses `ref={bgRef}`! This means `bgRef.current` is permanently `null`. Executing this code forces GSAP to target `null` in its animations, which prints a warning to the browser console (`GSAP target not found: null`), representing sloppy, dead code.
- **Registry vs. Docs Codebase Drift**:
  There is significant drift between the component distributed via the registry and the component present on the docs site at `apps/docs/src/components/chess-grid-transition/ChessGridTransition.jsx`.
  1. The docs site component does not support the `bgColor` prop found in the registry (line 11).
  2. The docs site component hardcodes `className="bg-[#ff5f00] absolute shrink-0"` (line 139) on the grid cells, completely bypassing custom color rendering, whereas the registry version sets inline styles `backgroundColor: bgColor` correctly.
  3. The docs site component initializes state immediately inside `useEffect` (line 89 of `ChessGridTransition.jsx`) instead of using the safer `requestAnimationFrame(() => setMounted(true))` pattern found in the registry (line 94 of `index.jsx`).
- **Potential Null Pointer Crash during Render/Effect Lifecycle**:
  In `registry/effects/transitions/chess-grid-transition/index.jsx#L87`, the `useEffect` attempts to retrieve cell children via `const cells = gridRef.current.children` without first checking if `gridRef.current` is null. While `gridRef` is static, if the component unmounts early or re-renders conditionally, this direct property access can throw a runtime exception.

### Low Severity
- **Missing Accessibility Attributes on Visual Noise**:
  The grid container at `registry/effects/transitions/chess-grid-transition/index.jsx#L131` lacks `aria-hidden="true"`, meaning assistive technologies might scan the massive grid of empty spans.
- **Missing `prefers-reduced-motion` Support**:
  The chess sweeps run unconditionally regardless of system motion reduction settings.

## Accessibility assessment
- **Screen Reader Compatibility**: Low. Shifting visual nodes are not isolated via ARIA. Adding `aria-hidden="true"` and `role="presentation"` to the grid container is highly recommended.
- **Keyboard Navigation**: Neutral. The component does not trap focus, which is acceptable for route wipe overlays.
- **Motion Handling**: Poor. Viewport-wide block sweeps can trigger vestibular issues. The component does not listen to system motion preferences to disable the animation.

## Performance assessment
- **rAF Loops**: The component does not run its own continuous animation frame loops, letting GSAP manage its ticker.
- **Off-screen Pausing**: Not applicable (this is an active route change overlay).
- **Cleanup**: Good. It kills the timeline on unmount on line 114 and line 128. However, there is a risk of a memory leak if `rows` changes frequently, as the `useEffect` at line 86 resets GSAP state but does not explicitly kill old set tweens on cells.
- **Object Allocation / GC**: Moderate. On window resize, a massive number of cell elements are created and destroyed in the DOM (`cols * rows`), which causes style recalculations and garbage collection of old DOM nodes.

## SEO and content-surface assessment
- **Semantic HTML**: Standard wrapping.
- **Indexability**: High. SEO is unimpeded as children content is rendered as-is.

## Responsive / mobile / touch behavior assessment
- **Layout Robustness**: Good on modern screens, but on mobile devices, if the aspect ratio is extremely narrow/tall, the horizontal columns might overlap incorrectly if `cols` and `rows` values are not proportional.
- **Mobile Overlap Workaround**: The mobile cell width multiplier `width: calc((100vw / ${cols}) * ${isMobile ? 1.6 : 1} + ${overlap}px)` (line 147) is a hack to scale mobile width but can cause cells to clip off the screen edge depending on orientation.

## Maintainability and code-quality assessment
- **Naming Conventions**: Follows `CODING_STANDARDS.md`. Variable and state names (`mounted`, `isMobile`, `isTablet`) are descriptive booleans formatted as questions.
- **Cleanliness**: Poor due to the permanent `null` target animation on `bgRef` and the large codebase drift on the docs site.

## Security and dependency concerns
- **External Dependencies**: Standard `gsap` and `next-transition-router`. No vulnerabilities identified.

## Browser compatibility considerations
- **Conic or Flex Calculations**: Flex-wrap and standard percentage layout are widely supported on modern rendering engines.

## What was checked and found clean
- **CLI Mirror Accuracy**: Checked the generated file `apps/docs/public/r/chess-grid-transition.json` against the registry. It correctly embeds the latest `index.jsx` code inside the JSON manifest.
- **Registry Schema**: `registry.json` fields match schema specs correctly.

## Suggested improvements and remediation priorities
1. **Immediate Priority**: Fix `registry/effects/transitions/chess-grid-transition/package.json` lines 5 and 7 to change `"chess-grid-transition.jsx"` to `"index.jsx"` to enable package distribution.
2. **High Priority**: Sync the docs site file `/apps/docs/src/components/chess-grid-transition/ChessGridTransition.jsx` with the registry's `index.jsx` to eliminate code drift and enable proper prop-based background colors.
3. **Medium Priority**: Remove the dead `bgRef` from lines 15, 107, and 121 in `registry/effects/transitions/chess-grid-transition/index.jsx` to prevent GSAP console errors.
4. **Medium Priority**: Add `aria-hidden="true"` and `role="presentation"` to the grid overlay container to isolate visual noise from screen readers.
5. **Low Priority**: Implement `@media (prefers-reduced-motion)` handling to instantly transition without sliding blocks when requested.

## Final score: 6.5/10

## Overall severity label: [High]
