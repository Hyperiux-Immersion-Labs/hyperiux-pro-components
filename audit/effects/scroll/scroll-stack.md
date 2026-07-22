# scroll-stack (scroll)

## Summary
The `scroll-stack` is a pro-tier, scroll-driven layout where successive editorial cards stick to the viewport, scaling down and fading away as the next row enters. Visually engaging and solid under static states, the component contains a critical package-manifest defect, lacks resize adaptability for mobile-to-desktop transitions, and bypasses motion preferences.

## Implementation overview
The component uses GSAP and `ScrollTrigger` to coordinate sticky cards overlap transitions. Inside a `useEffect` hook, the cards list maps overlapping rows. On desktop viewports, cards are sticky-positioned, and their scale and autoAlpha properties are scrubbed as the next section enters the screen. Code is split between `index.jsx` (which specifies hardcoded data and triggers the component) and `ScrollStackComp.jsx` (which contains the actual GSAP triggers).

## Strengths
- **Clean GSAP context-teardown:** Correctly utilizes GSAP Context and reverts all ScrollTriggers upon unmount (`ctx.revert()`).
- **Mobile Fallback:** Includes a mobile check on mount (`innerWidth <= 639`) that returns early, disabling GSAP animations and presenting a standard, clean stacked list.

## Risks and issues
- **Critical Severity:** Completely broken NPM package distribution. The `package.json` specifies `"main": "scroll-stack.jsx"` and `"files": ["scroll-stack.jsx", "registry.json"]`, but no file named `scroll-stack.jsx` exists, resulting in a failed installation.
  - File: `registry/effects/scroll/scroll-stack/package.json#L5`
  - File: `registry/effects/scroll/scroll-stack/package.json#L7`
- **High Severity:** Inflexible Mobile-to-Desktop Transition. The viewport size check (`globalThis.innerWidth <= 639`) is run exactly once on mounting inside the `useEffect`. If a user rotates their tablet device or resizes their desktop browser below `640px`, the component will fail to adapt because there is no window resize listener to destroy or instantiate triggers dynamically.
  - File: `registry/effects/scroll/scroll-stack/ScrollStackComp.jsx#L20-L29`
- **Medium Severity:** Absence of motion safety. Successive stacking, scaling, and overlapping animations can trigger vestibular distress. Compliance with `prefers-reduced-motion` is missing.

## Accessibility assessment
- **Keyboard Navigation:** Unsupported. Keyboard users cannot scrub cards or scroll sections cleanly.
- **ARIA Semantics:** Missing descriptive landmarks or labels (`role="region"` or `aria-label="Sticky Scroll Stack"`).
- **Text Contrast:** Contrast is highly dependent on user-configured background and text color pairs (e.g. `#87B6BC` on `#456D72`), but no default semantic warnings are provided.

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous requestAnimationFrame rendering loop when idle.
- **Off-screen Suspension:** Pass. GSAP ScrollTrigger pauses calculation updates when the elements are scrolled out of view.
- **DOM Footprint:** Light. Minimal HTML wrappers are used.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. Headers and paragraphs are written in normal HTML nodes inside a `.map` loop, ensuring search engine indexability.
- **Semantic Tags:** Moderate. Uses clean standard layout headings, though wrapping rows could benefit from `<section>` elements.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 640px):** Smooth, overlapping cards stack sequence.
- **Mobile (< 640px):** Safely falls back to a flat, standard vertically stacked cards layout. However, it lacks a listener to handle dynamic window resizing.

## Maintainability and code-quality assessment
- Code structure is clean, utilizing custom functional subcomponents.
- Unmount cleanups are correct and prevent memory leakage.

## Security and dependency concerns
- No security concerns. Direct peer dependency on standard `gsap` library.

## Browser compatibility considerations
- Relies on CSS standard sticky position (`sticky top-[15vh]`), which is widely supported but requires proper parent container height parameters.

## What was checked and found clean
- `registry.json` correctly registers `index.jsx` and `ScrollStackComp.jsx` under files.
- GSAP Context is properly used to contain timeline animations.

## Suggested improvements and remediation priorities
1. **Fix package.json Metadata (Critical Priority):** Correct `"main"` to point to `"index.jsx"` and update `"files"` array to reference `"index.jsx"` and `"ScrollStackComp.jsx"`.
2. **Add Window Resize Listener (High Priority):** Implement a window resize listener inside the `useEffect` to properly mount/unmount the ScrollTrigger instance when crossing the `640px` breakpoint.
3. **Incorporate Reduced Motion Check (High Priority):** Add a media-query check for `prefers-reduced-motion` and collapse scale/fade triggers if requested.

## Final score: 6.5/10

## Overall severity label: High
