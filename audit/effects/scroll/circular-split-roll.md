# circular-split-roll (scroll)

## Summary
The `circular-split-roll` is a free-tier, scroll-driven dual-axis parallax component that spins cards along a cylindrical-like circular path while simultaneously splitting and rotating overlapping container elements. While the component implements proper GSAP teardown on unmount, it is severely flawed by packaging metadata bugs, a mismatched version specification between registry schema and npm config, and a dangerous forced global smooth scroller injection.

## Implementation overview
The component utilizes GSAP's `ScrollTrigger` to rotate, scale, and translate cards around a central hub, creating a dynamic overlapping split wheel. It also features a layout-level resize handler to update positioning. Structurally, it isolates configuration details within `index.jsx` (which wraps the layout inside a forced `ReactLenis` smooth-scroll wrapper) and the animation/rendering engine inside `CircularSplitRollComp.jsx`.

## Strengths
- **Clean Cleanup on Unmount:** Leverages `gsap.context()` inside a `useLayoutEffect` hook and returns `() => ctx.revert()`. In addition, custom window resize event listeners are cleanly cleaned up on destruction.
- **Dynamic Mobile Columns Fallback:** Gracefully shifts to a standard grid layout on narrow viewports (`window.innerWidth < 1024`) via responsive CSS classes, protecting mobile GPUs from intensive 3D layout math.
- **GSAP MatchMedia Integration:** Demonstrates solid responsive intent by defining custom media conditions (`(min-width: 1025px)`) in the GSAP setup.

## Risks and issues
- **High Severity:** The `package.json` lists its `main` and `files` fields as pointing to a non-existent file: `"circular-split-roll.jsx"`. Users who pull this component as an independent package will face compilation errors as their bundle tools fail to find the entry point.
  - File: `registry/effects/scroll/circular-split-roll/package.json#L5`
  - File: `registry/effects/scroll/circular-split-roll/package.json#L7`
- **High Severity:** Mismatched versions across registry metadata files. The `registry.json` declares `"version": "1.0.1"`, whereas the `package.json` specifies `"version": "0.0.1"`. This causes serious publishing and update drift issues.
  - File: `registry.json#L3` vs `registry/effects/scroll/circular-split-roll/package.json#L3`
- **High Severity:** The `index.jsx` imports and wraps the entire DOM in a `<ReactLenis root options={{ infinite: isDesktop }}>` component. Injecting a root-level smooth scroll container within an individual page component is highly destructive. If a consumer already has a global Lenis or standard smooth scroller configured in their main Next.js layout, this will trigger collision errors, break standard scrolling, and disrupt normal page navigation.
  - File: `registry/effects/scroll/circular-split-roll/index.jsx#L98-L121`
- **Medium Severity:** Bypasses `prefers-reduced-motion` settings. The overlapping rotating cylinder is motion-heavy; users with vestibular sensitivities will experience discomfort, but the component has no media-query condition to halt or ease the cylindrical spin.
  - File: `registry/effects/scroll/circular-split-roll/CircularSplitRollComp.jsx#L105-L121`
- **Low Severity:** NPM package dependencies are defined under `dependencies` instead of `peerDependencies`, raising risk of dual installations for shared packages like `gsap` and `lenis`.
  - File: `registry/effects/scroll/circular-split-roll/package.json#L14-L17`

## Accessibility assessment
- **Keyboard Navigation:** Completely missing. Tab-navigation cannot traverse the orbital slides, and arrow keys cannot rotate or navigate the cards.
- **ARIA Semantics:** Missing standard carousel landmarks or announcement indicators (e.g., `role="rolegroup"`, `aria-label="Split-roll slide image carousel"`).
- **Text Contrast:** Uses text layers on top of complex circular paths without backdrop contrast safety margins.

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous update ticker loop. The cylindrical spin is bound strictly to the `ScrollTrigger` progress, stopping completely when scrolling is idle.
- **Off-screen Suspension:** Pass. GSAP ScrollTrigger automatically suspends computations when the trigger element exits the viewport.
- **Teardown:** Pass. All GSAP scroll triggers and window event handlers are destroyed on unmount.

## SEO and content-surface assessment
- **Crawler Visibility:** Good. Text descriptions and titles are rendered within standard DOM containers and are fully crawlable by web bots.
- **Heading Hierarchy:** Moderate. Uses flat text tags. Could benefit from clear section titles.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1024px):** Highly immersive circular roll with split-reveal triggers.
- **Mobile/Tablet (< 1024px):** Disables 3D cylinder calculations, replacing them with a vertical list grid layout (`lg:hidden` vs `lg:block`). This is smooth and preserves readability, but completely loses the parallax effect.

## Maintainability and code-quality assessment
- Code structure is modular, splitting visual presentation data from core layout math.
- The use of CSS custom properties is well-organized.

## Security and dependency concerns
- No security concerns. The package relies on `gsap` and `lenis`.

## Browser compatibility considerations
- Requires complete flexbox and grid styling support, alongside basic 3D CSS transforms. Known to run cleanly on modern engines.

## What was checked and found clean
- Correct cleanup using `ctx.revert()`.
- Static content crawling is clean.
- Grid fallback layout on mobile handles overflowing images gracefully.

## Suggested improvements and remediation priorities
1. **Fix package.json Metadata (Critical Priority):** Correct `main` pointing to `"index.jsx"` and update `files` array to distribute correct source files.
2. **Remove Root ReactLenis Wrapper (High Priority):** Do not force a global smooth-scroller in an individual component. Lenis configuration should be handled strictly at the user's layout level, and this component should passively hook into the active scroll stream.
3. **Synchronize Versions (Medium Priority):** Align the version strings between `registry.json` and `package.json` to prevent catalog registry drift.

## Final score: 6.5/10

## Overall severity label: High
