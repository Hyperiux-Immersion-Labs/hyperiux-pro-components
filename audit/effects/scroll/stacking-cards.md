# stacking-cards (scroll)

## Summary
The `stacking-cards` is a pro-tier full-screen sequence that stacks, tilts, and fades styled cards on scroll. Well-written and robust under unmount scenarios, the component contains a critical packaging bug in its NPM manifest and lacks motion control overrides.

## Implementation overview
The component uses GSAP and `ScrollTrigger` to scrub a vertical card stack sequence. On scroll, cards slide in from the bottom (`yPercent: 100` to `0`), while previous card elements scale down, rotate, tilt slightly inside a 3D perspective field, and fade out. It integrates with Lenis (`useLenis`) to trigger ScrollTrigger updates. Code is split between `index.jsx` (which contains layout mock content) and `StackingCardComp.jsx` (containing the core layout engines).

## Strengths
- **Clean GSAP context-teardown:** Correctly utilizes GSAP Context and reverts all ScrollTriggers upon unmount (`ctx.revert()`), preventing detached listeners.
- **Lenis Integration:** Smooth scrolling updates are correctly integrated via the `useLenis` callback hook.
- **Excellent Perspective depth:** Adding `rotateX: 20` and `perspective: "1200px"` creates an immersive cinematic deck transition.

## Risks and issues
- **Critical Severity:** Broken NPM package manifest. The `package.json` specifies `"main": "stacking-cards.jsx"` and `"files": ["stacking-cards.jsx", "registry.json"]`, but no file named `stacking-cards.jsx` exists, resulting in a failed installation.
  - File: `registry/effects/scroll/stacking-cards/package.json#L5`
  - File: `registry/effects/scroll/stacking-cards/package.json#L7`
- **Medium Severity:** Absence of motion safety. The rapid overlapping, 3D tilting, and rotation of fullscreen layers on scroll can cause motion sickness. Standard `prefers-reduced-motion` compliance is missing.

## Accessibility assessment
- **Keyboard Navigation:** Unsupported. Keyboard-only or screen-reader users have no way to step through card transitions using focus or keyboard triggers.
- **ARIA Semantics:** Missing landmark roles (`role="region"` or `aria-label="Stacked Card Sequence"`).
- **Contrast:** Highly readable due to robust background-to-text contrast matches (e.g. black text on `#F7FFDC` and `#D1F3F5`).

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous requestAnimationFrame loop when idle.
- **Off-screen Suspension:** Pass. Updates are strictly bound to vertical scroll progress via GSAP ScrollTrigger.
- **Cleanup:** Pass. Reverts all GSAP timelines and handles listener teardown cleanly.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. Headlines and card copy are written inside standard HTML nodes in a `.map` loop, making them fully crawlable and searchable.
- **Semantic Tags:** Moderate. Uses standard `<h2/>` and `<h3/>` headings.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1280px):** highly engaging, immersive 3D stacked deck layout.
- **Mobile/Tablet (< 1280px):** Automatically adapts card spacing, rendering and responsive styling, supporting native swipe-scroll gestures.

## Maintainability and code-quality assessment
- Exceptionally clean file organization. Variables and styles follow clean, understandable layout schemes.
- The use of GSAP Context matches the optimal styling pattern.

## Security and dependency concerns
- No security concerns. Direct peer dependency on standard `gsap` and `lenis` packages.

## Browser compatibility considerations
- Relies on CSS standard 3D transform properties which are widely supported across evergreen modern browsers.

## What was checked and found clean
- `registry.json` correctly registers `index.jsx` and `StackingCardComp.jsx` under files.
- GSAP Context revert cleanly destroys scroll triggers on component unmount.

## Suggested improvements and remediation priorities
1. **Fix package.json File Targets (Critical Priority):** Correct `"main"` to point to `"index.jsx"` and update `"files"` array to reference `"index.jsx"` and `"StackingCardComp.jsx"`.
2. **Incorporate Motion Safety (High Priority):** Add a media-query check for `prefers-reduced-motion` and collapse scale, 3D rotation, and depth transitions if requested.

## Final score: 7/10

## Overall severity label: High
