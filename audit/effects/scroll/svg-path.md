# svg-path (scroll)

## Summary
The `svg-path` is a pro-tier, highly creative component that animates custom cards along an arbitrary SVG path. It supports scroll velocity, drag gestures, hover slowdown, and rolling z-index calculations. While exceptional in terms of packaging compliance and visual flair, the component suffers from a high-severity performance bug: it runs a continuous requestAnimationFrame loop that does not suspend when the component is off-screen, leading to massive battery and CPU drain.

## Implementation overview
The component uses Framer Motion (`motion/react`) instead of GSAP. It uses Framer Motion's `useAnimationFrame` to continuously animate the cards' `baseOffset` along the CSS `offsetPath` of the custom SVG path on every browser paint frame. It integrates a scroll listener (`useScroll` and `useVelocity`) to calculate scroll speed and direction dynamically, adjusting translation speed based on velocity. Code is split between `index.jsx` and `SVGPathComp.jsx`.

## Strengths
- **Perfect Package Manifest Configuration:** This is the only component in the entire batch that features 100% correct, pristine packaging metadata. Its `package.json` points to the correct `"main": "index.jsx"`, and declares `"files": ["index.jsx", "SVGPathComp.jsx", "registry.json"]`, making it fully functional out of the box when installed via npm.
  - File: `registry/effects/scroll/svg-path/package.json#L5-L9`
- **Dynamic Physics Integration:** Integrating scroll velocity and drag-to-spin friction coefficients creates an extremely responsive and tactile kinetic layout.
- **Robust Z-Index Math:** Dynamically maps cards z-index values on scroll, avoiding overlap clipping bugs.

## Risks and issues
- **High Performance Severity:** Continuous Off-screen Rendering (Battery/CPU Drain). The component uses Framer Motion's `useAnimationFrame` to drive its animation offsets. However, `useAnimationFrame` does not pause when the element goes off-screen. It runs continuously, updating state and forces layout calculations *unconditionally*, even when the component is scrolled far off-screen. This is a severe battery drain on mobile devices and causes performance degradation across the website. It must be throttled or suspended using an Intersection Observer.
  - File: `registry/effects/scroll/svg-path/SVGPathComp.jsx#L259-L316`
- **Medium Severity:** Absence of motion safety. Rapidly spinning cards orbiting across the screen on scroll can cause motion strain. Standard `prefers-reduced-motion` compliance is missing.

## Accessibility assessment
- **Keyboard Navigation:** Unsupported. Keyboard users cannot scrub or drag the path cards, and cards lack focus indicators.
- **ARIA Semantics:** Good. The duplicated repeated card instances (rendered to fill the marquee track) are correctly labeled with `aria-hidden={repeatIndex > 0}`, preventing screen readers from reading duplicate texts.
  - File: `registry/effects/scroll/svg-path/SVGPathComp.jsx#L79`

## Performance assessment
- **rAF Loop / Continuous Animation:** Poor. Runs an un-throttled requestAnimationFrame animation loop continuously.
- **Off-screen Suspension:** Fail. Runs continuously even when fully off-screen.
- **Cleanup:** Pass. Framer Motion hooks cleanly detach animation callbacks on unmount.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. Cards and headlines are rendered directly inside standard HTML markup, allowing search engine crawlers to index texts perfectly.
- **Semantic Tags:** Moderate. Uses standard SVG and styled `div` components.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1025px):** Highly interactive kinetic orbiting marquee.
- **Mobile/Tablet (< 1025px):** Features an interactive responsive resizing handler (`window.addEventListener("resize")`) that scales the container perfectly to prevent layout breakdown on mobile screens, which is extremely robust. Touch dragging gestures are supported using Pointer Events.

## Maintainability and code-quality assessment
- Highly clean and maintainable. Math formulas and state values are descriptive and follow standards.
- Package file registry references are fully pristine.

## Security and dependency concerns
- Direct dependency on standard `motion` peer package.

## Browser compatibility considerations
- Uses standard CSS `offsetPath` and `offsetDistance` properties. While widely supported in modern evergreen browsers, older versions of Safari can require WebKit prefixes or exhibit rendering quirks with curved offsets.

## What was checked and found clean
- `registry.json` lists files accurately.
- `package.json` manifest is pristine.
- Responsive scaling handler is clean.

## Suggested improvements and remediation priorities
1. **Implement Off-Screen Suspension (High Priority):** Integrate a React state wrapped with an `IntersectionObserver` to halt `useAnimationFrame` updates whenever the component container is out of the active viewport.
2. **Reduced Motion Toggle (High Priority):** Add a media-query check for `prefers-reduced-motion` and collapse rotation orbits, reverting to a static clean row.
3. **Enhance Keyboard Controls (Medium Priority):** Map Tab and arrow keys to slide card offsets forward or backward along the path.

## Final score: 6.5/10

## Overall severity label: High
