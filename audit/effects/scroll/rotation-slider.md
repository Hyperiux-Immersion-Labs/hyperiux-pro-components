# rotation-slider (scroll)

## Summary
The `rotation-slider` is a free-tier, scroll-pinned horizontal slider featuring 3D card rotation, vertical drift, and caption text reveals on scroll. While visually premium, the component suffers from a critical packaging bug in its NPM manifest, has code-drift between the registry and documentation copies, and lacks accessibility features or consideration for user motion preferences.

## Implementation overview
The component uses GSAP and `ScrollTrigger` to coordinate a horizontal scrolling track scrubbed by the viewport vertical scroll. Inside a `useIsomorphicLayoutEffect`, it maps the cards index, calculating offsets, vertical y-positions, and Y/X rotation angles. It integrates a `ResizeObserver` and window resize event listener to dynamically recalculate the total scroll height based on the track's scroll width. Code is split between `index.jsx` (acting as a zero-prop demo wrapper) and `RotationSliderComp.jsx` (containing the core layout and animation engines).

## Strengths
- **Clean Cleanup on Unmount:** Correctly wraps the GSAP instantiation inside a `gsap.context()` scope and calls `context.revert()` upon unmount. The `ResizeObserver` is also cleanly disconnected and resize event listeners removed.
- **Adaptive Screen-size Scaling:** Includes separate step, rotation, and offset parameters for mobile, tablet, and desktop viewports, ensuring that the 3D grid does not clip or crowd on narrower displays.
- **Smooth Scrub Transition:** The use of `scrub: 1` on the track provides a fluid, high-end scroll response that matches smooth-scroller libraries.

## Risks and issues
- **Critical Severity:** The NPM distribution package configuration in `package.json` is completely broken. Both the `"main"` and `"files"` fields reference a non-existent file named `"rotation-card.jsx"`, making the package completely empty and un-installable via npm/yarn.
  - File: `registry/effects/scroll/rotation-slider/package.json#L5`
  - File: `registry/effects/scroll/rotation-slider/package.json#L7`
- **High Severity:** Inconsistent dependency rendering. In the registry copy, `RotationSliderComp.jsx` imports and utilizes the Next.js `<Image />` component, making the component strictly tied to Next.js. However, the documentation copy at `apps/docs/components` falls back to a raw `<img>` element with ESLint disabled. This code-drift causes functional inconsistency.
  - File: `registry/effects/scroll/rotation-slider/RotationSliderComp.jsx#L6`
  - File: `apps/docs/src/components/rotation-slider/RotationSliderComp.jsx#L227`
- **Medium Severity:** Total lack of `prefers-reduced-motion` compliance. Rapidly spinning 3D cards and vertical shifts can trigger vestibular distress. The component should bypass 3D rotation steps if reduced motion is requested.
- **Low Severity:** Hardcoded breakpoints (`640` and `1025`) act as magic numbers in code instead of pulling from a shared layout config.
  - File: `registry/effects/scroll/rotation-slider/RotationSliderComp.jsx#L9-L10`

## Accessibility assessment
- **Keyboard Navigation:** Completely unsupported. Keyboard users have no way to scrub or step through the horizontal carousel, as the track does not respond to Tab/arrow keys.
- **ARIA Semantics:** Missing standard ARIA region labels (`role="region"` or `aria-label="3D Rotating Slider"`).
- **Alt Tags:** Card components include descriptive alt tags, which is positive.

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous background requestAnimationFrame loop when idle.
- **Off-screen Suspension:** Pass. GSAP `ScrollTrigger` automatically pauses processing and rendering updates when the container element is scrolled out of viewport bounds.
- **Cleanup:** Pass. Reverts all GSAP tweens and detaches the `ResizeObserver` correctly.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. Headlines and card texts are rendered directly in the HTML layout using standard React maps, making them fully indexable for search engines.
- **Semantic HTML:** Moderate. It renders a clean grid but lacks a semantic `<article>` or list layout structure.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1025px):** Highly engaging, high-fidelity 3D horizontal scrolling grid.
- **Tablet & Mobile (< 1025px):** Reduces scaling factor, 3D rotation depths, and vertical offsets. The interactive horizontal track is preserved, but touch swiping is reliant on native window scroll as drag gestures are not supported.

## Maintainability and code-quality assessment
- Code organization is clean and matches the registry standard.
- The use of isomorphic layout hook (`useIsomorphicLayoutEffect`) prevents hydration mismatches.

## Security and dependency concerns
- High Next.js coupling. Direct imports of `next/image` in the registry files limit portability for projects built on Vite, Remix, or Astro.

## Browser compatibility considerations
- Uses standard CSS 3D transforms (`transformStyle: "preserve-3d"`, `perspective: "1200px"`). On older Safari versions or certain mobile devices, lack of `-webkit-transform-style` can lead to flat rendering.

## What was checked and found clean
- `registry.json` schema is complete and points to valid file paths.
- Unmount cleanups are clean, addressing both event listeners and observer objects.
- Public JSON matches files in registry.

## Suggested improvements and remediation priorities
1. **Fix package.json Manifest (Critical Priority):** Correct the `"main"` and `"files"` keys to point to `index.jsx` and `RotationSliderComp.jsx`.
2. **Resolve Registry/Docs Image Drift (High Priority):** Unify the images implementation to either use pure standard `<img>` or clearly document the Next.js dependency.
3. **Incorporate Motion Preferences (High Priority):** Add CSS/JS media-queries checking for `prefers-reduced-motion` and collapse 3D/drift animations accordingly.

## Final score: 6.5/10

## Overall severity label: High
