# block-transition (transitions)

## Summary
The `block-transition` component is a lightweight, responsive route transition effect for Next.js applications, utilizing the `next-transition-router` library alongside `gsap` (GreenSock Animation Platform). It achieves a visually premium horizontal split-block wipe by slicing the viewport into row-based blocks, which slide on-screen from the left and right margins to cover the old page, and then slide off-screen to reveal the new page. An optional content-shift feature adds an extra layer of depth by subtly scaling, blurring, and fading the background page content during the transition. While the visual experience is premium, the component suffers from severe packaging configuration errors and lacks accessibility compliance.

## Implementation overview
The core animation logic is implemented in `registry/effects/transitions/block-transition/index.jsx`, wrapping page content in a client-side `<TransitionRouter>` component from `next-transition-router`.
- **Row Grid Layout**: The component accepts a `rows` prop (defaulting to 5) and maps over an array of size `rows` to render absolute-positioned rows spanning the full viewport width. Each row contains two absolute spans (`leftBlock` and `rightBlock`) each styled with `width: 51%` (ensuring a slight overlap to prevent hairline rendering gaps at the screen center).
- **GSAP Timelines**: Route change events trigger the `leave` and `enter` callbacks. In the `leave` timeline, the left and right spans slide in to meet at the center using `xPercent: 0`. In the `enter` timeline, they slide off-screen to `xPercent: -101` (left block) and `xPercent: 101` (right block) respectively.
- **Stagger & Easing**: Row animations are staggered using a configurable delay coefficient (`STAGGER_DELAY = 0.12`), moving in a sequential top-to-bottom or bottom-to-top cascade using the smooth `power3.inOut` easing function.
- **Content Shift**: If `enableContentShift` is true, the `wrapperRef` containing the page's children is scaled down to `0.98` and blurred by `4px` during the leave sequence, and then zoomed back from `1.02` to `1` with a fade-in during the enter sequence.

## Strengths
- **Hairline Gap Prevention**: The code smartly sets the block widths to `w-[51%]` (line 162 and 171) and uses `height: calc(${100 / rows}% + 2px)` (line 158) to overlap rows and columns by 1-2 pixels. This completely prevents background leakage and flickering pixels caused by subpixel rounding errors in browsers.
- **Clean Lifecycle Cleanup**: The returned functions inside `leave` and `enter` correctly call `timeline.kill()` (line 123 and 145), ensuring that all GSAP transitions are terminated immediately on component unmount, preventing animation ghosting or memory leaks on early page navigation aborts.
- **Excellent Color Customization**: The `color` prop is dynamically mapped to the inline style `backgroundColor` of the transition spans, allowing users to easily match their brand design system.

## Risks and issues

### Critical Severity
*No critical issues found.*

### High Severity
- **Broken NPM Package Main Entry Point**:
  In `registry/effects/transitions/block-transition/package.json#L5`, the `main` entry is declared as `block-transition.jsx`, and in `registry/effects/transitions/block-transition/package.json#L7`, `block-transition.jsx` is listed under the files to package. However, the file in the registry folder is actually named `index.jsx`. This mismatch means that packaging this component via `npm pack` or publishing it to an registry will result in a completely broken package lacking any actual source code, breaking standard NPM imports completely.

### Medium Severity
- **Uncontrolled React Ref Mutations & Stale State Risks**:
  In `registry/effects/transitions/block-transition/index.jsx#L82`, `useLayoutEffect` has an empty dependency array `[]`. However, this effect scans the child elements of the DOM nodes inside `getRows()` to set up their initial off-screen transforms via GSAP. If the parent application dynamically updates the `rows` prop, the number of mapped elements changes, but `useLayoutEffect` will not re-run. This leaves the newly generated blocks completely un-initialized (they will display with default styles, breaking the initial visual state).

### Low Severity
- **Missing Accessibility Attributes on Visual Noise**:
  The transition overlay wrapper at `registry/effects/transitions/block-transition/index.jsx#L148` has `className="pointer-events-none fixed inset-0 z-999 overflow-hidden"`. However, it lacks `aria-hidden="true"`. Screen readers and assistive technologies could still parse these empty, shifting DOM nodes, causing confusion for sight-impaired users.
- **Missing `prefers-reduced-motion` Support**:
  Large-scale movement covering the entire viewport can cause motion sickness. The component does not check system motion preferences to disable or substitute the sliding transitions.

## Accessibility assessment
- **Screen Reader Compatibility**: Poor. Shifting visual-overlay nodes are not isolated from the assistive tree. Adding `aria-hidden="true"` and `role="presentation"` to the overlay containers is required.
- **Keyboard Navigation**: Neutral. The component does not trap focus, which is acceptable since it acts as a layout transition overlay, but focus during page transition should ideally be managed.
- **Motion Handling**: Deficient. There is no media query check for `@media (prefers-reduced-motion: reduce)`. High-motion split sweeps run unconditionally, which violates WCAG 2.1 AAA Guideline 2.3.3.

## Performance assessment
- **rAF Loops**: The component does not run its own manual `requestAnimationFrame` render loop, relying entirely on GSAP’s central ticker.
- **Off-screen Pausing**: Not applicable, as this is a page-level transition that covers and reveals the viewport in focus.
- **Cleanup**: Excellent. The `leave` and `enter` callbacks return cleanup functions that execute `timeline.kill()`, stopping all ongoing GSAP tweens.
- **Garbage Collection**: The row refs are collected in a mutable array ref `rowRefs.current` and filtered via `getRows() = rowRefs.current.filter(Boolean)` (line 32). This is safe against stale node leak memory retention since it doesn't hold hard references to unmounted elements once updated.

## SEO and content-surface assessment
- **Semantic HTML**: Standard wrappers. The children are nested inside a standard `div` wrapper.
- **Indexability**: High. Since the component is a page layout transition that simply wraps `{children}`, standard search engine indexing is unaffected.

## Responsive / mobile / touch behavior assessment
- **Layout Robustness**: High. By defining row heights and offsets using relative percentage values (`${(index * 100) / rows}%`), the layout scales gracefully on all viewport widths, from mobile up to wide desktop.
- **Touch Responsiveness**: Good. Since the overlay elements are marked with `pointer-events-none` (line 148), they do not block touch gestures or click events on the underlying page content.

## Maintainability and code-quality assessment
- **Naming Conventions**: Matches `CODING_STANDARDS.md` requirements. Module constants like `ROWS`, `COLOR`, and `STAGGER_DELAY` are properly written in `SCREAMING_SNAKE_CASE`.
- **Code Duplication**: None. The stagger animation sequence is abstracted into a helper function `buildRowsAnimation` (line 36), which is shared by both `leave` and `enter` lifecycles.
- **Type Safety**: Prop types are not declared, which can lead to runtime crashes if invalid types (like a non-integer or string) are passed to the `rows` prop.

## Security and dependency concerns
- **External Dependencies**: Relies on `gsap` and `next-transition-router`. Both are standard in modern React portfolios and represent no unique security threats.
- **Unsanitized Execution**: No inputs are evaluated as HTML or scripts.

## Browser compatibility considerations
- **Vendor Prefixes**: The component uses modern transform values (`xPercent` via GSAP), which have broad compatibility in modern browsers.
- **CSS Blur**: The content shift relies on `filter: blur(...)` (line 109 and 131), which has 98%+ support but can experience sluggish render performance on older mobile Safari engines.

## What was checked and found clean
- **Registry Synchronization**: Checked the source files in `registry/effects/transitions/block-transition/index.jsx` against `apps/docs/src/components/block-transition/index.jsx` and found they match perfectly with 0 bytes of drift.
- **CLI Mirror Accuracy**: Checked the generated file `apps/docs/public/r/block-transition.json` against the source. It correctly embeds the latest `index.jsx` code inside the JSON manifest with a proper target path of `components/hyperiux/block-transition/index.jsx`.
- **Metadata Consistency**: Checked `registry.json` fields, version tags, and dependencies, which correctly list `gsap` and `next-transition-router` without stale properties.

## Suggested improvements and remediation priorities
1. **Immediate Priority**: Fix `registry/effects/transitions/block-transition/package.json` lines 5 and 7 to change `"block-transition.jsx"` to `"index.jsx"` to prevent broken package generation.
2. **High Priority**: Add a `prefers-reduced-motion` check to skip the animation or immediately snap the blocks if system motion reduction is requested.
3. **Medium Priority**: Add `aria-hidden="true"` and `role="presentation"` to the overlay wrapper div at `registry/effects/transitions/block-transition/index.jsx#L148`.
4. **Medium Priority**: Add `rows` and `color` props to the dependency array of `useLayoutEffect` at line 82 to support dynamic configuration changes without visual glitches.

## Final score: 7.2/10

## Overall severity label: [High]
