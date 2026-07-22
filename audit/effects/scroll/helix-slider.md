# helix-slider (scroll)

## Summary
The `helix-slider` is a pro-tier, pinned scroll gallery that arranges visual card elements through a 3D helix-like cylindrical path. It calculates dynamic transforms using trigonometry on every frame update. However, the component suffers from severe layout thrashing by reading DOM dimensions inside a fast scroll loop, forces an invasive global smooth scroller package on the user, and has broken NPM entry points in its `package.json`.

## Implementation overview
The component multiplies card collections to construct an elongated visual spiral, then uses GSAP's `ScrollTrigger` to track overall travel coordinates. On scroll, a custom `render` function applies complex coordinate math: computing 3D translation coordinates (`x`, `y`, `z`) and y-axis rotations on every card based on sine and cosine waves. Structurally, `index.jsx` wraps the slider in a forced, infinite smooth-scroll `ReactLenis` container, while the math engine is contained in `HelixSliderComp.jsx`.

## Strengths
- **Teardown Quality:** Utilizes `gsap.context()` inside a `useLayoutEffect` block and returns `() => ctx.revert()`, cleanly tearing down the pinned ScrollTrigger and card transforms on unmount.
- **Advanced Trigonometric Math:** The dynamic computation of 3D sine/cosine spirals creates a truly outstanding, high-fidelity premium visual experience.
- **Efficient Card Ref Handling:** Efficiently gathers multiple child card element references using a single cached callback ref setter (`setCardRef`).

## Risks and issues
- **High Severity:** Forced Root Smooth Scroll. In `index.jsx`, the component forces a `<ReactLenis root options={{ infinite: true, syncTouch: true }}>` scroller onto the page. Injecting a global root smooth scroller package within an individual card-slider component is highly destructive and will cause collision crashes if the user already has a custom layout-level scroller configured.
  - File: `registry/effects/scroll/helix-slider/index.jsx#L7-L23`
- **High Severity:** Broken package entry point. The `package.json` file sets its `main` entry point and files array to `"helix-slider.jsx"`, which does not exist in the folder (the directory contains `index.jsx` and `HelixSliderComp.jsx`). This prevents module compiling.
  - File: `registry/effects/scroll/helix-slider/package.json#L5`
  - File: `registry/effects/scroll/helix-slider/package.json#L7`
- **Medium Severity:** Performance Degradation / Layout Thrashing. Inside the ScrollTrigger update callback, the fast `render` loop queries `window.innerWidth` on every scroll update. Calling layout-reading APIs on every scroll event frame triggers frequent browser layout/style recalculation thrashing, leading to frame drops and scroll stutter on lower-end devices.
  - File: `registry/effects/scroll/helix-slider/HelixSliderComp.jsx#L57`
- **Medium Severity:** Bypasses `prefers-reduced-motion` settings. Rapid 3D helical rotation can induce vestibular discomfort; the component must bypass 3D rotational math when reduced motion is enabled.
  - File: `registry/effects/scroll/helix-slider/HelixSliderComp.jsx#L48`
- **Low Severity:** NPM package dependencies are defined under `dependencies` instead of `peerDependencies`, leading to duplicate dependency bloating.
  - File: `registry/effects/scroll/helix-slider/package.json#L14`

## Accessibility assessment
- **Keyboard Navigation:** Completely unsupported. The cards are not focusable via Tab, and arrow keys cannot rotate or navigate the cylindrical slides.
- **ARIA Semantics:** Missing landmark attributes (`role="region"`, `aria-label="3D helical card slider"`) and screen-reader alternate content tags.
- **Alternative text:** Image tags inside the card elements have generic alternative text templates (`alt={item.title || "Card..."}`), which fails basic visual indexing rules.

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous loop when scroll is stationary. Transforms are computed strictly on ScrollTrigger updates.
- **Off-screen Suspension:** Pass. GSAP ScrollTrigger automatically suspends tick computations when the section leaves the viewport.
- **Layout Thrashing Danger:** Fail. Accessing `window.innerWidth` inside the fast-updating `render` scroll loop causes browser layout recalculations.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. The cards and image tags are mapped directly in the JSX, allowing SEO search crawlers to scan and index slide titles easily.
- **Semantic structure:** Poor. Lacks proper semantic structural elements like `<section/>` or `<aside/>`.

## Responsive / mobile / touch behavior assessment
- **Desktop:** Ultra-premium, responsive 3D cylinder layout.
- **Mobile (< 640px):** Adapts coordinate amplitudes (`snakeAmplitude * 0.85`, `depthAmplitude * 0.55`) to scale down the spiral on smaller viewports. However, performance on mobile can suffer significantly due to layout-thrashing `window.innerWidth` checks on every scroll tick.

## Maintainability and code-quality assessment
- Trigonometric equations are elegant and nicely parameterized via props (`snakeAmplitude`, `snakeTightness`, etc.).
- Easily configurable styles using standard tailwind variable hooks.

## Security and dependency concerns
- No security concerns. The package depends on `gsap` and `lenis`.

## Browser compatibility considerations
- Highly reliant on 3D transform properties (`perspective`, `transform-style: preserve-3d`). Known to render correctly on modern Blink and WebKit browsers, though Safari may occasionally clip cards if z-index stacking is misaligned.

## What was checked and found clean
- Correct GSAP unmount cleanups (`ctx.revert()`).
- Trigonometric slider math calculations are clean.
- Component-level properties are cleanly structured.

## Suggested improvements and remediation priorities
1. **Remove Forced Root ReactLenis (Critical Priority):** Let the user configure Lenis globally at the application layout level. The slider component should passively read active scroll events rather than forcing a root scroller.
2. **Fix package.json Entry Points (Critical Priority):** Set `main` to `"index.jsx"` and update `files` to include the correct component files.
3. **Eliminate Layout Thrashing (High Priority):** Cache `window.innerWidth` or the `isMobile` state inside a window resize listener, rather than reading `window.innerWidth` inside the fast scroll-bound rendering loop.

## Final score: 6/10

## Overall severity label: High
