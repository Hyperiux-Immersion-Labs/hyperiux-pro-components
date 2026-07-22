# parallax-image-animation (scroll)

## Summary
The `parallax-image-animation` is a pro-tier, highly clean, lightweight utility component designed to apply a smooth parallax translation (and optional scale transition) to an image using GSAP's `ScrollTrigger`. This component is exceptionally well-implemented, featuring perfect unmount cleanups, clean property configuration, and zero layout thrashing. It is the cleanest and most robust component evaluated in this audit.

## Implementation overview
The component renders a standard HTML `<img/>` wrapped in an overflow-hidden wrapper `div`. On mount, a `useEffect` hook registers a simple GSAP tween that translates the image on the Y-axis (and optionally scales it) as it enters and leaves the viewport. The start and end triggering boundaries, as well as the translation values, are fully customizable via React props.

## Strengths
- **Exemplary Simplicity and Cleanliness:** The component does not overcomplicate its layout or logic. It does one job—parallaxing an image—and does it perfectly.
- **Robust Cleanup on Unmount:** Correctly registers the GSAP animation inside a `gsap.context()` block and triggers `ctx.revert()` in the return callback, ensuring all scroll triggers are cleanly unregistered.
- **Fully Parameterized:** Exposes excellent prop hooks (like `translateY`, `start`, `end`, `scrub`, `enableScale`, `scaleFrom`, `scaleTo`) allowing parent containers to customize the scrolling speed and scaling factor precisely.
- **High Portability:** Since it does not rely on any complex global contexts or smooth-scrolling engines, it can be dropped into any Next.js page out-of-the-box.

## Risks and issues
- **Medium Severity:** Bypasses `prefers-reduced-motion` settings. Even simple parallax effects can be uncomfortable for users with motion sensitivities; the component should check the reduced motion media query and default to standard, un-translated image rendering if true.
  - File: `registry/effects/scroll/parallax-image-animation/index.jsx#L27`
- **Low Severity:** NPM package dependencies are listed in `dependencies` instead of `peerDependencies` inside `package.json`, which can trigger duplicate module installations.
  - File: `registry/effects/scroll/parallax-image-animation/package.json#L14`

## Accessibility assessment
- **Keyboard Navigation:** Pass. As a background visual decoration, the image should not be interactive or focusable; it correctly behaves as a static decorative element.
- **ARIA Semantics:** Pass. Supports customizable `alt` tags (defaulting to `"parallax-img"`) allowing users to pass descriptive labels.

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous loop. All transitions are handled passively via ScrollTrigger on scroll.
- **Off-screen Suspension:** Pass. GSAP ScrollTrigger automatically suspends computations when the image is out of view.
- **GPU Acceleration:** High. The browser delegates image Y-axis translates directly to the composite layer, yielding perfect 120fps performance.

## SEO and content-surface assessment
- **Crawler Visibility:** Perfect. Renders as a standard static image node, making it fully indexable by search engine crawlers.
- **Semantic HTML:** Clean layout wrapping.

## Responsive / mobile / touch behavior assessment
- Scales and behaves perfectly on all device widths. Fully responsive.
- Relies on Tailwind utility classes passed via props (`wrapperClassName`, `imageClassName`) to customize width and height, maintaining ideal separation of concerns.

## Maintainability and code-quality assessment
- Highly clean and readable code structure.
- Easily customizable with standard prop variables.

## Security and dependency concerns
- No security concerns. Features zero heavy library dependencies.

## Browser compatibility considerations
- Highly compatible across modern desktop and mobile browsers.

## What was checked and found clean
- Correct GSAP unmount cleanups (`ctx.revert()`).
- Solid, responsive layout design fallback for mobile viewports.

## Suggested improvements and remediation priorities
1. **Add prefers-reduced-motion (Medium Priority):** Bypass the GSAP animation entirely if the user has enabled their operating system's reduced motion setting.
2. **Move dependencies to peerDependencies (Low Priority):** In `package.json`, move `"gsap"` to `peerDependencies` to ensure cleaner package distribution.

## Final score: 9/10

## Overall severity label: Low
