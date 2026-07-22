# svg-pixel-reveal (scroll)

## Summary
The `svg-pixel-reveal` is a pro-tier, scroll-driven image component that transitions from highly pixelated to crisp using a custom SVG convolve filter and GSAP ScrollTrigger. While visually premium, the component is severely compromised by major structural drift, extensive file redundancy, incorrect packaging metadata, and Next.js tight coupling.

## Implementation overview
The component uses GSAP and `ScrollTrigger` to scrub a numeric state value from 18 down to 1. On update, this value is set as the `size` property of a custom SVG pixelation filter containing `<feConvolveMatrix/>`, `<feFlood/>`, `<feComposite/>`, `<feTile/>`, and `<feMorphology/>` nodes. In the registry, the entry point is split between `index.jsx` and `PixelatedScgFilter.jsx` (with a 'c').

## Strengths
- **Clean GSAP Teardown:** Correctly kills both the tween and the ScrollTrigger instance on component unmount, preventing detached listeners.
- **Sophisticated SVG Shader-like Filter:** Using nested standard SVG convolve and dilate matrix nodes creates a pixelation effect that renders directly on the GPU without expensive Canvas pixel operations.

## Risks and issues
- **Critical Severity:** Broken NPM package manifest. The `package.json` specifies `"main": "svg-pixel-reveal.jsx"` and `"files": ["svg-pixel-reveal.jsx", "registry.json"]`, but no file named `svg-pixel-reveal.jsx` exists, resulting in a failed installation.
  - File: `registry/effects/scroll/svg-pixel-reveal/package.json#L5`
  - File: `registry/effects/scroll/svg-pixel-reveal/package.json#L7`
- **High Severity:** Extreme File Redundancy. The registry component includes a file named `PixelatedScgFilter.jsx`. However, inside the registry's `index.jsx`, the component defines `PixelateSvgFilter` locally in the same file! It **never imports or references** `PixelatedScgFilter.jsx` at all! This file represents 100% redundant, dead code packaged and distributed to users' folders for no reason.
  - File: `registry/effects/scroll/svg-pixel-reveal/index.jsx#L9-L50`
- **High Severity:** Extensive Code-Drift & Naming Typos. There is major structural drift between the registry component and the documentation component in `apps/docs/src/components/svg-pixel-reveal/`:
  - **Misspelled File name:** In the registry, the dead file is named `PixelatedScgFilter.jsx` (with a 'c'), while in the docs codebase, it is correctly spelled `PixelatedSvgFilter.jsx` (with a 'v').
  - **Incomplete Imports:** In the docs component, `index.jsx` **does** import the external filter file (`import PixelateSvgFilter from "./PixelatedSvgFilter";`), whereas the registry index file has a duplicate copy.
  - **Inconsistent Exports:** The registry exports a named function (`export function SvgPixelReveal`), whereas the docs codebase exports a default function with different casing (`export default function SVGPixelReveal` - all caps SVG).
  - **Next.js Coupling:** The docs component uses Next.js `<Image />` component, whereas the registry component uses standard raw `<img>` tags.
  - File: `registry/effects/scroll/svg-pixel-reveal/registry.json#L26`
  - File: `apps/docs/src/components/svg-pixel-reveal/index.jsx#L7-L11`

## Accessibility assessment
- **Keyboard Navigation:** Unsupported. No focusable anchors or scroll progression keys.
- **ARIA Semantics:** Missing ARIA group labels.
- **Alt Tags:** Correctly maps image alt descriptions, which is positive.

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. No continuous background requestAnimationFrame loop.
- **Off-screen Suspension:** Pass. Updates are bound strictly to active scrolling.
- **Render Overhead:** High. Re-rendering a React component on every ScrollTrigger tick to update state (`setPixelSize`) is expensive. It would be significantly faster to update the SVG filter's attributes directly on the DOM node using GSAP inside `onUpdate` instead of forcing React state re-renders.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. The image is rendered inside standard HTML nodes, ensuring indexability.
- **Semantic Tags:** Moderate. Uses standard wrappers.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1025px):** Highly engaging, high-end pixelation scrub.
- **Mobile/Tablet (< 1025px):** Preserves the pixel reveal effect nicely on mobile screen resolutions, relying on native vertical page scrolling.

## Maintainability and code-quality assessment
- Extremely poor due to extensive redundancy and folder name/export drift. The dead co-located file with a misspelled filename represents a significant maintainability concern.

## Security and dependency concerns
- No security concerns. Direct peer dependency on standard `gsap`.

## Browser compatibility considerations
- Uses complex SVG filters which are widely supported but can exhibit performance stuttering on low-end mobile devices under rapid scrolling.

## What was checked and found clean
- `registry.json` specifies correct dependencies.
- React/GSAP hooks teardown cleanly.

## Suggested improvements and remediation priorities
1. **Fix package.json Metadata (Critical Priority):** Correct `"main"` to point to `"index.jsx"` and update `"files"` array to reference `"index.jsx"` and `"PixelatedSvgFilter.jsx"`.
2. **Resolve File Redundancy and Drift (Critical Priority):** Delete the duplicate filter declaration from `index.jsx` in the registry. Rename `PixelatedScgFilter.jsx` to `PixelatedSvgFilter.jsx`, import it correctly, and unify the exports to match the docs (`SVGPixelReveal` with default export).
3. **Optimize Rendering Performance (High Priority):** Modify `onUpdate` to select and set properties directly on the DOM element (`filterRef.current.setAttribute("size", value)`) instead of triggering React state updates (`setPixelSize`) multiple times per scroll frame.

## Final score: 4/10

## Overall severity label: High
