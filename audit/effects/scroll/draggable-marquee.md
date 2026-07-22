# draggable-marquee (scroll)

## Summary
The `draggable-marquee` is a pro-tier, infinite looping slider marquee that combines automatic scroll-bound sliding with direct mouse/touch drag momentum physics. It is the only component in our audit that correctly implements the `createVisibilityGate` (Visibility API wrapper) to suspend its tick loop when the tab is hidden or off-screen. However, it contains a critical performance and animation hazard by shutting down the global GSAP ticker for the entire web application when it is paused.

## Implementation overview
The component runs a continuous loop that advances an infinite horizontal rail of images. It integrates GSAP's `gsap.utils.wrap` to reset positions once an image slips beyond the boundary. Drag interaction is handled using GSAP `Draggable` with custom proxy targets and deceleration math. It encapsulates lifecycle management by using a custom `createVisibilityGate` utility to stop updating positions when the page is inactive.

## Strengths
- **Superb Visibility Gate Integration:** Fully complies with our performance standards by implementing a custom Visibility API listener. It suspends update calculations and stops animation frame requests when the component goes out of view or the page tab is hidden.
  - File: `registry/effects/scroll/draggable-marquee/createVisibilityGate.js`
- **Premium Inertia Physics:** Combining drag momentum with continuous auto-play provides a seamless, state-of-the-art interactive experience.
- **Robust Cleanup:** Properly removes drag event listeners, cancels pending requestAnimationFrame steps, and clears out the GSAP custom ticker hook on unmount.

## Risks and issues
- **High Severity:** Performance and Animation Hazard. Inside `DraggableMarqueeComp.jsx`, the visibility gate's change handler attempts to pause the animation loop by calling `gsap.ticker.sleep()`. However, calling `gsap.ticker.sleep()` puts the **entire global GSAP ticker to sleep**! This will freeze all other GSAP-driven animations, sliders, fades, and interactive elements across the consumer's entire website as soon as this single marquee component goes offscreen.
  - File: `registry/effects/scroll/draggable-marquee/DraggableMarqueeComp.jsx#L251-L255`
- **High Severity:** Broken packaging configuration. The `package.json` specifies its `main` entry point and package files as `"draggable-marquee.jsx"`, but no such file exists in the directory (the source files are `index.jsx` and `DraggableMarqueeComp.jsx`). This prevents standard installation builds.
  - File: `registry/effects/scroll/draggable-marquee/package.json#L5`
  - File: `registry/effects/scroll/draggable-marquee/package.json#L7`
- **Medium Severity:** Bypasses `prefers-reduced-motion` settings. Auto-scrolling marquees are a notorious trigger for vestibular motion sickness; the component should check the system motion media query and default to a static, draggable-only track if reduced motion is requested.
  - File: `registry/effects/scroll/draggable-marquee/DraggableMarqueeComp.jsx#L136`
- **Low Severity:** Mismatched versions: `registry.json` specifies `"version": "1.0.0"` while `package.json` specifies `"version": "0.0.1"`.
- **Low Severity:** NPM package dependencies are specified under `dependencies` instead of `peerDependencies`, risking duplicate dependency bloating.
  - File: `registry/effects/scroll/draggable-marquee/package.json#L14`

## Accessibility assessment
- **Keyboard Navigation:** Completely unsupported. The slide track is not focusable (`tabindex`), and there are no keyboard shortcuts (like arrow keys) to slide left or right.
- **ARIA Semantics:** Missing standard list semantics. The marquee container should use `role="list"` and individual slides should use `role="listitem"`, alongside an active `aria-live="polite"` state that can be paused.
- **Image alt tags:** The image tags are hardcoded to empty `alt=""` attributes or generic text, failing basic screen reader description standards.

## Performance assessment
- **rAF Loop / Continuous Animation:** Yes, the component relies on a continuous rAF loop to update horizontal slide coordinates.
- **Off-screen Suspension:** Pass. Correctly suspends calculations via the visibility gate, though the execution (global GSAP ticker sleep) is hazardous.
- **Teardown:** Pass. All handlers and custom loops are cleaned up on unmount.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. The images and layout containers are rendered directly in the static DOM tree, allowing standard search engine bots to index them.
- **Semantic HTML:** Average. The wrapper uses general division tags (`<div/>`); converting this to a semantic `<section/>` or `<aside/>` would improve page structure.

## Responsive / mobile / touch behavior assessment
- The drag physics are highly responsive and behave perfectly on both desktop (mouse drags) and mobile (finger touch swipes).
- Touch cancellation is properly managed to prevent vertical page-scroll locking while dragging horizontally.

## Maintainability and code-quality assessment
- Code separation is clean, splitting the main exports from core draggable rendering math.
- Code style is highly structured and matches `CODING_STANDARDS.md`.

## Security and dependency concerns
- No security concerns. Relies on standard `gsap` package imports.

## Browser compatibility considerations
- Uses standard CSS 3D transforms (`translate3d`). Completely compatible with all modern browser rendering engines.

## What was checked and found clean
- Correct unmount cleanups.
- Proper implementation of offscreen pause via Visibility API.
- Excellent touch-drag inertia math calculations.

## Suggested improvements and remediation priorities
1. **Fix Global GSAP Ticker Sleep (Critical Priority):** Instead of calling the global `gsap.ticker.sleep()`, simply toggle an internal active state boolean inside the ticker event listener callback to skip coordinate calculations without freezing GSAP globally.
2. **Fix package.json Entry Points (Critical Priority):** Point `main` to `"index.jsx"` and update `files` array to include the correct component source files.
3. **Add prefers-reduced-motion support (High Priority):** Automatically stop the automated marquee sliding loop if the user has requested reduced motion.

## Final score: 6.5/10

## Overall severity label: High
