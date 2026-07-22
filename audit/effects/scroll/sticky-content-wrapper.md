# sticky-content-wrapper (scroll)

## Summary
The `sticky-content-wrapper` is a free-tier, split-screen sticky scroll component with text columns on one side and overlapping images on the other that reveal with scale-down and clip-path inset transitions on scroll. Visually highly engaging, the component is hindered by critical package manifest bugs, tight Next.js coupling in the registry, and lack of motion fallbacks.

## Implementation overview
The component uses GSAP and `ScrollTrigger` to coordinate a vertical split scroll. On scroll, left-side content blocks slide and fade vertically (`autoAlpha`/`yPercent`), while right-side image blocks transition using a nested clip-path (`inset`) clip reveal. It integrates with Lenis smooth-scroller to pause/resume scroll during snapping. Code is split between `index.jsx` and `StickyContentComp.jsx` in the registry.

## Strengths
- **Clean GSAP Context Cleanup:** Correctly utilizes GSAP Context and reverts trigger instances cleanly on unmount (`ctx.revert()`).
- **Smooth Snapping Integration:** Includes a highly robust snapping timeline that halts Lenis scrolling on trigger snap start and restarts on complete to avoid jarring page jumps.
  - File: `registry/effects/scroll/sticky-content-wrapper/StickyContentComp.jsx#L165-L171`
- **Dynamic Clip Reveals:** Using CSS standard `clip-path: inset(...)` provides an extremely crisp, high-fidelity slide transition.

## Risks and issues
- **Critical Severity:** Broken package manifest. The `package.json` specifies `"main": "sticky-content-wrapper.jsx"` and `"files": ["sticky-content-wrapper.jsx", "registry.json"]`, but no file named `sticky-content-wrapper.jsx` exists, resulting in a failed installation.
  - File: `registry/effects/scroll/sticky-content-wrapper/package.json#L5`
  - File: `registry/effects/scroll/sticky-content-wrapper/package.json#L7`
- **Medium Severity (Next.js Coupling):** The component imports the Next.js `Image` component directly in the registry file (`StickyContentComp.jsx#L4`). This prevents developers using other frameworks (Vite, Remix, Astro) from dropping the component in cleanly without rewriting the markup.
- **Medium Severity:** Absence of motion preferences. Continuous scale zooms and rapid clip-path reveals can trigger vestibular distress. Standard `prefers-reduced-motion` compliance is missing.

## Accessibility assessment
- **Keyboard Navigation:** Unsupported. Keyboard users cannot trigger transitions or snap steps.
- **ARIA Semantics:** Missing ARIA landmarks or region descriptors on the container.
- **Content Structure:** Poor list semantic markup. Text blocks use plain `<a>` tags with inline styles instead of semantic headers or accessible elements.

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. No background requestAnimationFrame loop.
- **Off-screen Suspension:** Pass. Updates are bound strictly to active scrolling.
- **Teardown:** Pass. Correctly clears and reverts trigger parameters on unmount.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. Headers and paragraphs are written in normal HTML nodes, ensuring search engine indexability.
- **Semantic Tags:** Moderate. Uses clean standard layout headings.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1200px):** Smooth split-screen vertical scroll layout.
- **Mobile/Tablet (< 1200px):** Automatically collapses columns into a single vertical column flow, preserving image displays. However, native scrolling does not trigger snapping on smaller screens.

## Maintainability and code-quality assessment
- Code structure is clean, utilizing custom functional helper subcomponents.
- Unmount cleanups are correct and prevent memory leakage.

## Security and dependency concerns
- No security concerns. Direct peer dependency on standard `gsap` and `lenis` packages.

## Browser compatibility considerations
- Uses standard CSS clip-path inset properties, which are fully supported across all modern browsers.

## What was checked and found clean
- `registry.json` correctly registers `index.jsx` and `StickyContentComp.jsx`.
- GSAP Context revert cleanly destroys scroll triggers on component unmount.

## Suggested improvements and remediation priorities
1. **Fix package.json Metadata (Critical Priority):** Correct `"main"` to point to `"index.jsx"` and update `"files"` array to reference `"index.jsx"` and `"StickyContentComp.jsx"`.
2. **Loosen Next.js Coupling (Medium Priority):** Modify the registry file to use standard HTML `<img>` elements or offer a configuration prop to make the image component swap-able.
3. **Incorporate Motion Safety (High Priority):** Add a media-query check for `prefers-reduced-motion` and collapse scale and clip-path zoom transitions if requested.

## Final score: 7/10

## Overall severity label: High
