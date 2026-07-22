# parallax-slider (scroll)

## Summary
The `parallax-slider` is a pro-tier, pinned horizontal gallery that creates horizontal card sliding with individual image parallax translations and a clip-path entry reveal effect using GSAP's `ScrollTrigger`. The component is well-structured and implements excellent cleanup handlers on unmount. However, the NPM package configuration is broken, pointing to non-existent entry files.

## Implementation overview
The component maps vertical scroll to horizontal track translations by pinning the main wrapper and moving a horizontal flex track (`trackRef`) along the X-axis based on scroll depth. To support dynamic content, a `ResizeObserver` monitors changes in the track's scroll width and updates the outer wrapper's height to ensure smooth scrolling. Each individual image also runs a secondary, nested ScrollTrigger that translates the image internally inside its clipping wrapper to create an inner parallax shift.

## Strengths
- **Teardown Quality:** Correctly registers and encapsulates all GSAP timeline steps inside a `gsap.context()` block, returning `() => ctx.revert()` to ensure pristine DOM states on unmount.
- **Dynamic Outer Height Calculation:** Features excellent integration of a `ResizeObserver` on the horizontal track to dynamically compute the necessary outer document scrolling height, ensuring perfect scroll length calculations regardless of image widths.
- **Inner Image Parallax:** Implementing a secondary, container-aligned ScrollTrigger inside a clipped box creates a highly immersive layered depth effect.

## Risks and issues
- **High Severity:** Broken packaging entries in `package.json`. The configuration specifies its `main` entry point and files array as `"parallax-slider.jsx"`, but no such file exists in the directory (the only source file is `index.jsx`). This prevents module compiling.
  - File: `registry/effects/scroll/parallax-slider/package.json#L5`
  - File: `registry/effects/scroll/parallax-slider/package.json#L7`
- **Medium Severity:** Bypasses `prefers-reduced-motion` settings. Rapid horizontal track panning and nested image translates can induce vestibular discomfort; the component must bypass 3D rotational math when reduced motion is enabled.
  - File: `registry/effects/scroll/parallax-slider/index.jsx#L44`
- **Low Severity:** NPM package dependencies are listed in `dependencies` instead of `peerDependencies` inside `package.json`, which can trigger duplicate module installations.
  - File: `registry/effects/scroll/parallax-slider/package.json#L15`

## Accessibility assessment
- **Keyboard Navigation:** Completely unsupported. Keyboard-only or screen-reader users cannot trigger or scroll the horizontal slider, and there is no focusable alternative indicator.
- **ARIA Semantics:** Missing all ARIA landmark roles and labels (e.g., `role="region"`, `aria-label="Horizontal Card Slider"`).
- **Alternative text:** Image tags inside the card elements have generic alternative text templates (`alt={`Slide ${i + 1}`}`), which fails basic visual indexing rules.

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous loop when scroll is stationary. Transforms are computed strictly on ScrollTrigger updates.
- **Off-screen Suspension:** Pass. GSAP ScrollTrigger automatically suspends tick computations when the section leaves the viewport.
- **Teardown:** Pass. Correctly clears out pending animation frames, disconnects the `ResizeObserver` listener, and unbinds window resize event listeners on unmount.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. The cards and image tags are mapped directly in the JSX, allowing SEO search crawlers to scan and index slide titles easily.
- **Semantic structure:** Average. Lacks proper semantic structural elements like `<section/>` or `<aside/>`.

## Responsive / mobile / touch behavior assessment
- **Desktop:** Ultra-premium, responsive horizontal slide layout.
- **Mobile (< 640px):** Adapts container and card heights (`max-sm:w-[80vw]`, `max-sm:h-[50vh]`) nicely using Tailwind utility classes. The horizontal panning remains highly functional.

## Maintainability and code-quality assessment
- Code organization is clean and complies with the directory sitemap.
- Variable and helper naming matches `CODING_STANDARDS.md`.
- Comments inside `useEffect` describe logical stages.

## Security and dependency concerns
- No security concerns. Features zero heavy library dependencies.

## Browser compatibility considerations
- Highly compatible across modern desktop and mobile browsers, though requires flexible box model support.

## What was checked and found clean
- Correct GSAP unmount cleanups (`ctx.revert()`).
- Solid, responsive layout design fallback for mobile viewports.

## Suggested improvements and remediation priorities
1. **Fix package.json Entry Points (Critical Priority):** Correct `main` to point to `"index.jsx"` and update `files` to include the correct component files.
2. **Add prefers-reduced-motion (Medium Priority):** If the user requests reduced motion, fall back to standard static positioning to prevent vestibular discomfort.

## Final score: 7.5/10

## Overall severity label: High
