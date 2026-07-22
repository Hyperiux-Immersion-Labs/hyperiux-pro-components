# square-translate (scroll)

## Summary
The `square-translate` is a pro-tier scroll-driven list component featuring a central rotating square marker that tracks page scroll and horizontally nudges adjacent list rows. While visually creative, the component contains critical packaging bugs and a major high-frequency performance bottleneck that causes garbage collection overhead on continuous scrolling.

## Implementation overview
The component uses GSAP and `ScrollTrigger` to create a scroll-pinned section. It maps list items and pins a rotating central SVG square element. Inside the ScrollTrigger's high-frequency `onUpdate` event callback, it calculates proximity offsets and fires `gsap.to()` tweens dynamically on the central square and list row elements to translate them. Logically, it splits code across `index.jsx` (which defines row items and triggers the component) and `SquareTranslateComp.jsx` (which implements the layouts and triggers).

## Strengths
- **Clean GSAP Context Revert:** Correctly utilizes GSAP Context and reverts trigger instances cleanly on unmount (`ctx.revert()`).
- **Responsive Layout Safety:** On smaller screens, the component scales down rotation thresholds and translations to prevent cards clipping against screen edges.

## Risks and issues
- **Critical Severity:** Broken NPM package manifest. The `package.json` specifies `"main": "square-translate.jsx"` and `"files": ["square-translate.jsx", "registry.json"]`, but no file named `square-translate.jsx` exists, resulting in a failed installation.
  - File: `registry/effects/scroll/square-translate/package.json#L5`
  - File: `registry/effects/scroll/square-translate/package.json#L7`
- **High Severity:** High-Frequency Tween Instantiation (Performance Bottleneck). The ScrollTrigger `onUpdate` event callback fires multiple times on every single scroll frame. Inside it, the component calls `gsap.to(square, ...)` and iterates over all items calling `gsap.to(item, ...)` on every update. Instantiating 15-20 brand new GSAP tweens *per scroll frame* triggers severe garbage collection thrashing and CPU overhead. This should be rewritten using a pre-constructed GSAP Timeline or direct high-performance custom inline style transformations using `gsap.quickTo` or rAF.
  - File: `registry/effects/scroll/square-translate/SquareTranslateComp.jsx#L67-L91`
- **Medium Severity:** Absence of motion preferences. Continuous sliding list rows and central shape rotations are active unconditionally, violating `prefers-reduced-motion` compliance.

## Accessibility assessment
- **Keyboard Navigation:** Completely unsupported. Keyboard users have no method to scroll or navigate individual list items or trigger translations.
- **ARIA Semantics:** Excellent. The list rows correctly utilize semantic HTML list containers (`<ul/>` and `<li/>`) and include unique descriptors.

## Performance assessment
- **rAF Loop / Continuous Animation:** Moderate. While it doesn't run background loops when idle, active scrolling is highly expensive due to high-frequency tween instantiations inside the scroll handler.
- **Off-screen Suspension:** Pass. Updates are bound strictly to active scrolling.
- **Cleanup:** Pass. ClearProps correctly clears `willChange` inline styles on unmount.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. List items and text content are fully present inside standard HTML markup using standard React maps, allowing search engine crawlers to index them perfectly.
- **Semantic Tags:** High. Utilizes semantic list structures (`<ul/>`, `<li/>`, `<h3/>`).

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1025px):** Fluid list translation layout.
- **Mobile/Tablet (< 1025px):** Standard list is rendered. Translates are scaled down to match the narrow mobile viewport, relying on native vertical page scrolling.

## Maintainability and code-quality assessment
- Code organization is clean and logical.
- However, the `onUpdate` performance bottleneck indicates a critical flaw in real-world scroll trigger implementation.

## Security and dependency concerns
- No security concerns. Direct peer dependency on standard `gsap` library.

## Browser compatibility considerations
- Uses standard CSS transform properties which are fully supported.

## What was checked and found clean
- `registry.json` correctly registers `index.jsx` and `SquareTranslateComp.jsx`.
- Unmount cleanups are correct and complete.

## Suggested improvements and remediation priorities
1. **Fix package.json Metadata (Critical Priority):** Correct `"main"` to point to `"index.jsx"` and update `"files"` array to reference `"index.jsx"` and `"SquareTranslateComp.jsx"`.
2. **Refactor Scroll updates for Performance (High Priority):** Remove the high-frequency `gsap.to()` calls from the `onUpdate` scroll handler. Use a single scrubbed `gsap.timeline` or optimize updates using `gsap.quickTo()` calls.
3. **Incorporate Reduced Motion Check (High Priority):** Add a media-query check for `prefers-reduced-motion` and collapse scale/fade triggers if requested.

## Final score: 5.5/10

## Overall severity label: High
