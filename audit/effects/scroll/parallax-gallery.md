# parallax-gallery (scroll)

## Summary
The `parallax-gallery` is a pro-tier, pinned frame gallery with snapping slides and mirrored thumbnail rails. It uses GSAP's `ScrollTrigger` to coordinate mirrored scrolling thumbnail strips flanking a main central gallery image. However, the component contains a major stability bug: it calls `lenis.stop()` without optional chaining, which will trigger a fatal `TypeError` and crash the entire webpage if Lenis is not active on the page.

## Implementation overview
The component maps vertical scrolling progress to a horizontal sliding track, moving flanking left and right thumbnail rails in mirrored directions (`ThumbStrip` components). It coordinates these transitions via a custom `applyPosition` update callback triggered inside GSAP's `ScrollTrigger.create` on-scroll method. It splits imports between `index.jsx` (which lists default slide urls) and `ParallaxGallery.jsx` (which runs the main positioning engine).

## Strengths
- **Teardown Quality:** Safely wraps all GSAP timelines inside a `gsap.context()` block, returning `() => ctx.revert()` on unmount to restore the DOM and prevent memory leaks.
- **Dynamic Mobile Columns Fallback:** Gracefully shifts to a standard grid layout on narrow viewports (`window.innerWidth < 1024`) via responsive CSS classes, protecting mobile GPUs from intensive 3D layout math.
- **Dashed SVG Border:** Features a highly professional, progressively animated SVG border outline that draws itself dynamically on mount.

## Risks and issues
- **Critical Severity (Fatal crash on missing Lenis):** Inside the `ScrollTrigger.create` configurations snap callback, the component triggers `lenis.stop()` to freeze scrolling during snapping transitions. However, this is done without any safety checks or optional chaining (`lenis?.stop()`). If a consumer imports this component onto a page that does not have the `ReactLenis` context active (e.g. standard Next.js layouts), scrolling into this component will throw a fatal `TypeError: Cannot read properties of undefined (reading 'stop')` and crash the entire webpage.
  - File: `registry/effects/scroll/parallax-gallery/ParallaxGallery.jsx#L132`
- **High Severity:** Broken packaging entries in `package.json`. The configuration specifies its `main` entry point and files array as `"parallax-gallery.jsx"`, but no such file exists in the directory (the source files are `index.jsx` and `ParallaxGallery.jsx`). This prevents standard npm compilation.
  - File: `registry/effects/scroll/parallax-gallery/package.json#L5`
  - File: `registry/effects/scroll/parallax-gallery/package.json#L7`
- **Medium Severity:** Bypasses `prefers-reduced-motion` settings. Rapid horizontal slide panning and vertical thumbnail scrolling can trigger motion sensitivities; a media query should bypass these animations if reduced motion is requested.
  - File: `registry/effects/scroll/parallax-gallery/ParallaxGallery.jsx#L106`
- **Low Severity:** NPM package dependencies are listed in `dependencies` instead of `peerDependencies`, leading to duplicate dependency bloating.
  - File: `registry/effects/scroll/parallax-gallery/package.json#L14`

## Accessibility assessment
- **Keyboard Navigation:** Completely unsupported. The scroll gallery cannot be traversed using Tab, and there are no keyboard scroll triggers.
- **ARIA Semantics:** Missing all region landmark indicators or screen-reader announcements to explain the horizontal track movement.
- **Image alt tags:** The image tags are hardcoded to empty `alt={slide.id}` attributes or generic text like `"slide-0"`, failing screen reader description standards.
  - File: `registry/effects/scroll/parallax-gallery/ParallaxGallery.jsx#L281`

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous loop when scroll is stationary. Transforms are computed strictly on ScrollTrigger updates.
- **Off-screen Suspension:** Pass. GSAP ScrollTrigger automatically suspends tick computations when the section leaves the viewport.
- **Memory Leak Protection:** Pass. Reverts and cleans up all SplitText and ScrollTrigger registrations on unmount.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. The images and layout containers are rendered directly in the static DOM tree, allowing standard search engine bots to index them.
- **Semantic HTML:** Average. The wrapper uses general division tags (`<div/>`); converting this to a semantic `<section/>` or `<aside/>` would improve page structure.

## Responsive / mobile / touch behavior assessment
- **Desktop:** Panoramic horizontal gallery track with beautiful split staggered entry reveals.
- **Mobile/Tablet (< 640px):** Adapts container and card heights (`MOBILE_FRAME_W = 280`, `MOBILE_THUMB_W = 100`) nicely using media-query conditionals. However, performance on mobile can suffer significantly due to layout-thrashing `window.innerWidth` checks on every scroll tick.

## Maintainability and code-quality assessment
- Code structure is clean, with visual content configured in a modular list.
- Good utilization of modular component files.

## Security and dependency concerns
- No security concerns. The package depends on `gsap` and `lenis`.

## Browser compatibility considerations
- Highly compatible across modern desktop and mobile browsers, though requires flexible box model support.

## What was checked and found clean
- Correct GSAP unmount cleanups (`ctx.revert()`).
- Solid, responsive layout design fallback for mobile viewports.

## Suggested improvements and remediation priorities
1. **Fix Lenis Crash (Critical Priority):** Add optional chaining to `lenis?.stop()` in `ParallaxGallery.jsx` to prevent fatal crashes if the component is used without a smooth scroller wrapper.
2. **Fix package.json Entry Points (Critical Priority):** Correct `main` to point to `"index.jsx"` and update `files` to include the correct component files.
3. **Fix Image Alt Descriptions (Medium Priority):** Replace generic ID tags like `"slide-0"` with rich descriptive alt text properties.

## Final score: 5/10

## Overall severity label: Critical
