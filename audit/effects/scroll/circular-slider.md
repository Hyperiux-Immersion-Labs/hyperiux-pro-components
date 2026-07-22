# circular-slider (scroll)

## Summary
The `circular-slider` (titled "Rotating Carousel" in registry metadata) is a pro-tier, scroll-driven circular carousel component designed to rotate a ring of editorial cards through the viewport. While visually premium, the component suffers from severe bugs in its NPM package metadata, lacks any fallback or support for `prefers-reduced-motion`, and drops its main orbiting motion entirely on mobile viewports in favor of a static vertically stacked cards list.

## Implementation overview
The component uses GSAP and `ScrollTrigger` to calculate coordinates along a circular segment (an arc of `0.58 * Math.PI` radians) and rotates individual cards accordingly. On window resize, the circular path coordinates are re-computed. The component splits logic between `index.jsx` (which defines hardcoded carousel data and exports the default wrapped component) and `CircularSliderComp.jsx` (which contains the actual GSAP and markup logic). On viewport sizes smaller than `1280px` (`xl`), the layout hides the wheel container entirely and swaps to a flat, vertical list layout.

## Strengths
- **Clean Cleanup on Unmount:** Correctly uses `gsap.context()` inside `useEffect` and triggers `ctx.revert()` in the unmount callback, which cleanly cancels GSAP animations and reverts DOM changes.
- **Responsive Sizing Fallback:** Seamlessly shifts to a simple stacked list of cards on mobile/tablet screens to avoid awkward circular clipping issues on narrow screens.
- **Robust Math Calculations:** The card coordinate mapping on the wheel is calculated dynamically based on container widths, preventing overlapping card placement on resize.

## Risks and issues
- **High Severity:** The NPM distribution package configuration in `package.json` is completely broken. Its `main` and `files` fields refer to a non-existent file named `"rotating-carousel.jsx"`, which will cause dependency resolution failures when installed via package managers.
  - File: `registry/effects/scroll/circular-slider/package.json#L5`
  - File: `registry/effects/scroll/circular-slider/package.json#L7`
- **High Severity:** There is a naming mismatch between the folder/slug (`circular-slider`) and the NPM package name (`@hyperiux/rotating-carousel`), creating configuration inconsistency during distribution.
  - File: `registry/effects/scroll/circular-slider/package.json#L2`
- **Medium Severity:** Complete absence of `prefers-reduced-motion` compliance. Large rotating visual layouts on scroll can cause motion sickness for sensitive users; the component must disable the rotation scrollTrigger if reduced motion is requested.
  - File: `registry/effects/scroll/circular-slider/CircularSliderComp.jsx#L42-L52`
- **Medium Severity:** Inconsistent feature parity. On mobile screens, the component completely drops its defining "circular slider" motion and transforms into a plain, un-animated vertical list, compromising the branding and premium expectations.
  - File: `registry/effects/scroll/circular-slider/CircularSliderComp.jsx#L111-L134`
- **Low Severity:** The `package.json` specifies `"gsap"` and `"lucide-react"` under `dependencies` instead of `peerDependencies`, which can lead to duplicate package installations and bundling conflicts.
  - File: `registry/effects/scroll/circular-slider/package.json#L14-L17`

## Accessibility assessment
- **Keyboard Navigation:** Completely unsupported. Keyboard-only or screen-reader users cannot trigger or rotate the circular slider, and there is no focusable alternative indicator.
- **ARIA Semantics:** Missing all ARIA landmark roles and labels (e.g., `role="region"`, `aria-label="Rotating Card Slider"`).
- **Text Contrast:** Contrast may be poor depending on user-supplied colors (e.g., `#2A2433` on `#655A7C`), but no default semantic warnings are provided.

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous background requestAnimationFrame animation loop. It is strictly scroll-triggered via GSAP `ScrollTrigger` and updates coordinates passively on scroll.
- **Off-screen Suspension:** Pass. GSAP `ScrollTrigger` naturally suspends rendering calculations when the trigger section is fully out of view.
- **Cleanup:** Pass. Unmount cleanly calls `ctx.revert()` which handles listener teardown.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. The cards and texts are rendered directly in the HTML markup using standard list rendering (`data.map`), allowing SEO crawlers to index headings and paragraph text without execute issues.
- **Semantic Tags:** Moderate. Uses standard `<h2/>` and `<p/>` elements, though a clean card list container could benefit from `<ul/>` or `<article/>` markup.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1280px):** Premium circular sliding interface.
- **Mobile/Tablet (< 1280px):** Drops the circular carousel completely, hiding the wheel (`max-xl:hidden`) and rendering a flat vertical column. This is a functional safety fallback, but misses any transition or interactive slider gesture.

## Maintainability and code-quality assessment
- Code organization is clean and complies with the directory sitemap.
- Variable and helper naming matches `CODING_STANDARDS.md`.
- Comments inside `useEffect` describe logical stages.

## Security and dependency concerns
- No security concerns detected. Relies on standard peer libraries (`gsap` and `lucide-react`).

## Browser compatibility considerations
- Uses CSS custom grid coordinates and standard transform-3d rules. In Safari, 3D elements can sometimes clip without `-webkit-transform-style: preserve-3d` declarations.

## What was checked and found clean
- `registry.json` schema matches required keys.
- Unmount cleanups are correct and complete.
- Static rendering content is clean and crawls perfectly.

## Suggested improvements and remediation priorities
1. **Fix package.json Metadata (Critical Priority):** Change package name to `@hyperiux/circular-slider`, set `main` to `"index.jsx"`, and update the `files` array to distribute `index.jsx` and `CircularSliderComp.jsx`.
2. **Implement prefers-reduced-motion (High Priority):** Add a media query check for reduced motion and bypass the ScrollTrigger rotation animation if true.
3. **Enhance Mobile Experience (Medium Priority):** Instead of a static list, implement a mobile-friendly touch swiper or drag carousel to retain the premium feel.

## Final score: 6/10

## Overall severity label: High
