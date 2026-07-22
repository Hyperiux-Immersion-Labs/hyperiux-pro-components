# scroll-shuffled-cards (scroll)

## Summary
The `scroll-shuffled-cards` is a pro-tier pinned scroll component that slides and scatters a shuffled stack of styled editorial cards across the viewport on scroll. The component features unique organic movement, but is undermined by a critical packaging bug that leaves out essential source files, a severe layout jitter bug on window resize, and lack of motion control fallback.

## Implementation overview
The component uses GSAP and `ScrollTrigger` inside a `useEffect` hook to scrub a horizontal track. Inside the track, card elements are shuffled with random coordinates. Start/end coordinates (`startX`, `endX`, etc.) and rotations are computed using a helper `getRandomInRange()` and cached via `useMemo` of the randomized cards array. Logically, it splits code across `index.jsx` (which defines custom cards data and triggers the wrapper) and `ScrollShuffledCardsComp.jsx` (which implements the layout and GSAP triggers).

## Strengths
- **Clean Unmount Teardown:** Correctly initializes GSAP triggers inside a `gsap.context()` scope and reverts them on unmount (`ctx.revert()`).
- **Excellent Visual Depth:** Randomizing coordinates along different axes produces a realistic scattered shuffling motion that feels organic and state-of-the-art.

## Risks and issues
- **Critical Severity:** Completely broken NPM package manifest. The `package.json` specifies `"main": "card.jsx"` and `"files": ["card.jsx", "registry.json"]`. While `card.jsx` exists, both `index.jsx` and `ScrollShuffledCardsComp.jsx` (which house 90% of the component logic!) are entirely excluded. Shipping this package results in a completely broken dependency.
  - File: `registry/effects/scroll/scroll-shuffled-cards/package.json#L5`
  - File: `registry/effects/scroll/scroll-shuffled-cards/package.json#L7`
- **High Severity:** Random Layout Jitter. The `useMemo` block generating random card offsets depends on props `startXRange`, `startYRange`, etc. In `index.jsx`, these props are passed as inline array literals: `startXRange={[-4, 4]}`. In React, inline arrays create new references on every render, triggering the `useMemo` to recompute new random positions whenever the parent component re-renders (e.g., due to window resizing or parent state updates). This causes cards to visually "jump" or snap to entirely new coordinates on resize, breaking the layout.
  - File: `registry/effects/scroll/scroll-shuffled-cards/index.jsx#L18-L23`
  - File: `registry/effects/scroll/scroll-shuffled-cards/ScrollShuffledCardsComp.jsx#L36-L55`
- **Medium Severity:** Absence of motion safety. The rapid scattering and rotation of card stacks on scroll can trigger vestibulo-ocular strain. A fallback bypassing coordinate translation is missing.

## Accessibility assessment
- **Keyboard Navigation:** Completely unsupported. Keyboard users have no method to navigate through the horizontal track or focus cards.
- **ARIA Semantics:** Missing ARIA group labels (e.g., `role="region"` or `aria-label="Editorial Card Shuffle"`) on the container.
- **Semantic Structure:** Good structure on individual card layouts, rendering titles, subtitles, and paragraphs.

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous background requestAnimationFrame loop when idle.
- **Off-screen Suspension:** Pass. Updates are strictly bound to vertical scroll progress via GSAP ScrollTrigger.
- **Coordinate Overhead:** Moderate. Because of the inline array reference bug, recomputations happen on every window resize instead of remaining cached.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. Headlines and card copy are rendered directly in standard HTML text blocks, making them fully crawlable and searchable.
- **Semantic Tags:** Good. Individual text headings map to standard `<h2/>` elements.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1025px):** Highly engaging, multi-layered card shuffling layout.
- **Mobile/Tablet (< 1025px):** Adjusts cards gap and padding parameters. Cards scale down nicely, but horizontal touch dragging is fully reliant on native page scroll.

## Maintainability and code-quality assessment
- Clean structure and file decomposition. However, the inline reference bug inside the entry point (`index.jsx`) indicates a lack of testing regarding state updates and resize events.

## Security and dependency concerns
- No security concerns. Simple peer dependency on `gsap`.

## Browser compatibility considerations
- Uses standard CSS transform properties which are fully supported across all evergreen browsers. Uses `will-change-transform` to hint GPU layers.

## What was checked and found clean
- `registry.json` lists all co-located files correctly.
- GSAP Context revert cleanly destroys scroll triggers on component unmount.

## Suggested improvements and remediation priorities
1. **Fix package.json File Targets (Critical Priority):** Correct `"main"` to point to `"index.jsx"` and update `"files"` array to include `index.jsx`, `ScrollShuffledCardsComp.jsx`, and `card.jsx`.
2. **Resolve inline reference / useMemo recalculation bug (High Priority):** Extract the range array constants (e.g. `const START_X_RANGE = [-4, 4]`) outside the React component scope or use `useRef` to stabilize array references and prevent card jump jitter on resize.
3. **Reduced Motion Toggle (Medium Priority):** Add a media query check for reduced motion and lock card coordinates, showing a static clean row with simple opacity transitions instead.

## Final score: 5/10

## Overall severity label: High
