# parallax-footer (scroll)

## Summary
The `parallax-footer` is a pro-tier, fixed-reveal footer component that creates a parallax scrolling reveal effect by pinning the footer to the bottom of the viewport while preceding content scrolls over it. The component implements a highly performant, pure CSS-based approach without GSAP, using standard layout observers. However, it contains packaging configuration errors and a common CSS layout bug that causes horizontal scrollbar flickering and layout shifts.

## Implementation overview
The component uses a pure CSS approach: wrapping the footer in a container that has `clipPath: "rect(0px, 100%, 100%, 0px)"` and setting the footer itself to `position: "fixed"; bottom: 0; left: 0`. This allows the footer to remain pinned behind the active layout. To prevent the content from clipping, a `ResizeObserver` measures the footer's height and sets it on the outer relative wrapper container, ensuring proper document scroll-depth calculation.

## Strengths
- **Incredible Efficiency:** Completely avoids any dependency on heavy JavaScript animation libraries (like GSAP). By relying on CSS `position: fixed` and `clip-path`, the rendering is delegated entirely to the browser's compositor thread, yielding perfect `60fps/120fps` scrolling performance.
- **ResizeObserver Integration:** Measures and updates container heights using a `ResizeObserver`, ensuring the page scroll length dynamically adapts when footer elements change or expand.
- **Robust Cleanup:** Correctly clears out pending animation frames, disconnects the `ResizeObserver` listener, and unbinds window resize event listeners on unmount.

## Risks and issues
- **High Severity:** Broken packaging entries in `package.json`. The configuration specifies its `main` entry point and files array as `"parallax-footer.jsx"`, but no such file exists in the directory (the source files are `index.jsx` and `ParallaxFooter.jsx`). This prevents module compiling.
  - File: `registry/effects/scroll/parallax-footer/package.json#L5`
  - File: `registry/effects/scroll/parallax-footer/package.json#L7`
- **Medium Severity (Horizontal Scrollbar Flickering):** The wrapping `div` and `<footer/>` elements are explicitly styled with the Tailwind `w-screen` utility width. Using `w-screen` instead of `w-full` is a known layout anti-pattern. Because `w-screen` computes 100% of the viewport width *including* browser scrollbars, it causes horizontal overflow, forcing annoying horizontal scrollbars to flash or flicker during scrolling.
  - File: `registry/effects/scroll/parallax-footer/ParallaxFooter.jsx#L47`
  - File: `registry/effects/scroll/parallax-footer/ParallaxFooter.jsx#L55`
- **Medium Severity:** Bypasses `prefers-reduced-motion` settings. Fixed-reveal animations can trigger disorientation; if reduced motion is requested, the component should collapse the fixed positioning and display as a static, relative flow layout.
  - File: `registry/effects/scroll/parallax-footer/ParallaxFooter.jsx#L14`
- **Low Severity:** The `package.json` does not declare any dependencies or peerDependencies (it should declare React peerDependencies to maintain system health).
  - File: `registry/effects/scroll/parallax-footer/package.json#L14`

## Accessibility assessment
- **Keyboard Navigation:** Pass. Because the footer remains part of the standard DOM stream and has no custom interactive click hijackers, keyboard users can normally tab-focus through links.
- **ARIA Semantics:** Excellent. Correctly utilizes the HTML5 semantic `<footer/>` landmark element.
- **Color Contrast:** The default template uses dark white text on a deep grey background (`bg-[#1a1a1a]`), which maintains highly legible contrast ratios.

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous background animation frame loop.
- **Off-screen Suspension:** Pass. It remains dormant and only triggers height updates when DOM sizing elements are explicitly mutated.
- **GPU Acceleration:** High. Delegating fixed transforms to the browser composition layer is extremely performant.

## SEO and content-surface assessment
- **Crawler Visibility:** Perfect. The entire footer DOM subtree remains fully static and visible to crawlers without executing complex JavaScript scripts.
- **Semantic HTML:** Excellent use of appropriate layout tags.

## Responsive / mobile / touch behavior assessment
- Behaves perfectly across all screen sizes. The layout scales nicely using responsive CSS grids.
- Since height calculation is monitored by a `ResizeObserver`, orientation shifts and text wrapping adjustments are caught and resolved automatically.

## Maintainability and code-quality assessment
- Highly clean and readable code structure. No unnecessary complexity.
- Modular exports make importing highly straightforward.

## Security and dependency concerns
- No security concerns. Features zero heavy library dependencies.

## Browser compatibility considerations
- Highly compatible across modern desktop and mobile browsers, though requires flexible box model support.

## What was checked and found clean
- Correct GSAP unmount cleanups.
- Solid, responsive layout design fallback for mobile viewports.

## Suggested improvements and remediation priorities
1. **Fix package.json Entry Points (Critical Priority):** Point `main` to `"index.jsx"` and update `files` to include the correct component files.
2. **Fix Horizontal Scrollbar Bug (High Priority):** Replace all instances of `w-screen` with `w-full` inside `ParallaxFooter.jsx` to prevent horizontal page overflow and scrollbar flickering.
3. **Add prefers-reduced-motion (Medium Priority):** If the user requests reduced motion, fall back to standard static positioning (`position: relative` instead of `fixed`) to prevent vestibular discomfort.

## Final score: 7/10

## Overall severity label: High
