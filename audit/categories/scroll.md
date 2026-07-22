# scroll — Category Report

## Category overview

The `scroll` category is the largest and one of the most visually stunning categories in the Hyperiux Pro library, containing **22 components**:
- `circular-slider`
- `circular-split-roll`
- `draggable-marquee`
- `grid-scale`
- `helix-slider`
- `horizontal-feature-reveal`
- `infinite-perspective-slider`
- `parallax-footer`
- `parallax-gallery`
- `parallax-image-animation`
- `parallax-slider`
- `rotation-slider`
- `scroll-distortion`
- `scroll-shuffled-cards`
- `scroll-stack`
- `split-canvas`
- `square-translate`
- `stacking-cards`
- `sticky-content-wrapper`
- `svg-path`
- `svg-pixel-reveal`
- `text-convergence`

These components are designed to leverage scroll positions, custom inertia scrolling, and vector clipping paths to reveal and morph typography, grids, sliders, and canvas graphics. While they provide premium, immersive visual transitions, they suffer from critical licensing conflicts, aggressive global side-effects, high-frequency garbage collection (GC) thrashing, and a category-wide copy-paste packaging error.

## Common patterns across its effects

- **Scroll-Driven Animation Engine (GSAP + Lenis):** The vast majority of the components rely on GSAP ScrollTrigger to coordinate keyframes based on scroll viewport position. Smooth inertia scrolling is heavily coupled using ReactLenis.
- **Dynamic CSS Clipping and Perspective:** Highly immersive effects like `circular-split-roll` and `helix-slider` utilize three-dimensional transform-styles and dynamic clip-paths (`clipPath: 'polygon(...)'`) driven via GSAP values.
- **Passive Animation Suspend (ScrollTrigger Native):** Since scroll events primarily drive the timelines, animations naturally freeze when the user stops scrolling. Only continuous marquee or canvas-rendering loops (e.g. `draggable-marquee`, `split-canvas`, `svg-path`) require active visibility gating.
- **Next.js Asset Componentization:** Almost all components wrap custom demo elements with `next/image` or standard HTML5 videos inside their local folders, conforming to standard Next.js styling guidelines.

## Repeated issues

### Critical

- **Category-Wide Packaging Failure (NPM Zero-Code Defect):** In **20 out of 22 components**, the `package.json` file contains copy-pasted configuration files where `"main"` points to a file named after the component's slug (e.g., `scroll-stack.jsx`) instead of `index.jsx`, and `"files"` limits bundling to that nonexistent target. This causes `npm pack` to produce empty tarballs with zero source code.
- **Paid Commercial Plugins in Free-Tier Components:** `horizontal-feature-reveal`, `infinite-perspective-slider`, and `text-convergence` are labeled as `"tier": "free"` inside `registry.json` but import and register the commercial, closed-source **GSAP SplitText** plugin. This causes instant build failures for users on the free tier.
- **Global ScrollTrigger Teardown side-effects:** Inside `split-canvas` (`PixelScrollCanvas.jsx`), the unmount handler invokes `ScrollTrigger.getAll().forEach(t => t.kill())`. This completely destroys **all other independent animations and navigation scrolltriggers** running on the same site.

### High

- **Global GSAP Ticker Suspend (`draggable-marquee`):** In `draggable-marquee`, the visibility gate attempts to suspend the loop when off-screen by executing `gsap.ticker.sleep()`. This puts the **entire global GSAP engine** to sleep, instantly freezing all other unrelated GSAP animations across the entire website.
- **Lenis Context Crashes (`parallax-gallery`):** To restrict user scrolling during snapping transitions, `parallax-gallery` invokes `lenis.stop()` without checking if Lenis is active on the page. On standard layouts without global scrollers, entering the viewport crashes the tab with `TypeError: Cannot read properties of undefined (reading 'stop')`.
- **Forced Global Lenis Injection (`circular-split-roll` & `helix-slider`):** Both components force-inject `<ReactLenis root>` inside their internal component tree, breaking or overriding any global scroller wrappers pre-configured by the developer.

### Medium

- **Missing `prefers-reduced-motion` Guards:** 22/22 components lack checks for OS-level user motion preferences. Text converges, canvases split, and images scale at maximum speed regardless of a11y preferences.
- **A11y SplitText Screen-Reader Violations:** Characters split into distinct tags (e.g., in `horizontal-feature-reveal`) break screen-reader readability, causing screen readers to spell out words letter-by-letter rather than reading whole phrases.

### Low

- **High-Frequency Garbage Collection Thrashing (`square-translate`):** Instantiates multiple `gsap.to()` tween allocations inside active `onUpdate` scroll triggers, causing frame drops on weaker chips due to GC pausing.
- **Stale and Misspelled Files (`svg-pixel-reveal`):** Features a misspelled, completely unused `PixelatedScgFilter.jsx` file co-located inside the registry folder, with duplicate code pasted directly into `index.jsx`.

## Best practices to standardize

1. **Unify Entry points to index.jsx:** Change all `package.json` configurations to point `"main"` to `index.jsx` and ensure `"files"` bundles all co-located JS/JSX/CSS.
2. **Context-Safe GSAP Cleanup:** Use GSAP context reverts (`ctx.revert()`) inside all cleanup callbacks instead of global destructions like `ScrollTrigger.getAll().forEach(...)`.
3. **Guard Optional Peer Dependencies:** Never import commercial GSAP plug-ins (such as `SplitText` or `InertiaPlugin`) directly inside free-tier source code. Use custom CSS/JS fallbacks or throw clear, handled warning logs.
4. **Use IntersectionObserver for Custom Gating:** Implement `IntersectionObserver` to freeze custom animation frames, avoiding invasive global engine stops like `gsap.ticker.sleep()`.

## Prioritized list of improvements

1. **Fix package.json Entry Points (P0):** Instantly refactor all 21 broken scroll `package.json` configurations to prevent empty NPM distributions.
2. **Fix Split-Canvas Global Kill Bug (P0):** Replace global ScrollTrigger kill calls with localized GSAP context teardowns.
3. **Remediate GSAP Commercial Licenses (P1):** Refactor `text-convergence` and other free-tier components to remove premium `SplitText` dependencies.
4. **Wrap Lenis Operations with Optional Chainings (P1):** Ensure `lenis?.stop()` has safe checks in place to prevent layout crashes.
5. **Add prefers-reduced-motion checks (P2):** Implement a global standard hooks checking motion reduction flags to toggle static layouts.

## Score distribution table

| Component Slug | Score | Severity | Main Defect |
| :--- | :---: | :---: | :--- |
| `circular-slider` | 6.0/10 | High | Broken package.json |
| `circular-split-roll` | 6.5/10 | High | Broken package.json, Forced Lenis |
| `draggable-marquee` | 6.5/10 | High | Global Ticker Sleep |
| `grid-scale` | 5.5/10 | High | Invalid ScrollTrigger Start Syntax |
| `helix-slider` | 6.0/10 | High | High-frequency innerWidth query |
| `horizontal-feature-reveal` | 3.0/10 | Critical | Missing source files, premium SplitText |
| `infinite-perspective-slider`| 4.0/10 | Critical | Premium SplitText |
| `parallax-footer` | 7.0/10 | High | Broken package.json |
| `parallax-gallery` | 5.0/10 | High | Fatal crash on missing Lenis context |
| `parallax-image-animation` | 9.0/10 | Low | Minor package alignment |
| `parallax-slider` | 7.5/10 | High | Broken package.json |
| `rotation-slider` | 6.5/10 | High | Next.js Image dependency |
| `scroll-distortion` | 7.5/10 | High | Broken package.json |
| `scroll-shuffled-cards` | 5.0/10 | High | Layout jumps on resize |
| `scroll-stack` | 6.5/10 | High | No resize handlers |
| `split-canvas` | 5.0/10 | High | Global ScrollTrigger destruction on unmount |
| `square-translate` | 5.5/10 | High | High-frequency tween allocations |
| `stacking-cards` | 7.0/10 | High | Broken package.json |
| `sticky-content-wrapper` | 7.0/10 | High | Next.js Image coupling |
| `svg-path` | 6.5/10 | High | Off-screen rAF draining |
| `svg-pixel-reveal` | 4.0/10 | High | Duplicate code and dead files |
| `text-convergence` | 5.0/10 | High | Paid SplitText dependency |\n