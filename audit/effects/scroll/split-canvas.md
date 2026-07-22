# split-canvas (scroll)

## Summary
The `split-canvas` is a free-tier, scroll-synced Canvas component that reveals background image textures through sliced pixel-grid shutters on scroll. Combining custom Three.js shader materials with GSAP ScrollTriggers, the component is highly impressive but contains critical distribution errors, a dangerous global ScrollTrigger teardown bug that breaks other page elements, and file naming drift.

## Implementation overview
The component uses Three.js (`THREE`) to construct a WebGL rendering scene. It uses a custom fragment shader to split the active image into pixel columns and translate them vertically in opposite directions based on scroll progress. A GSAP timeline tweens the shader's `uReveal` uniform. It integrates `createSuspendedRaf.js` to manage background animation suspension. The entry point is split between `index.jsx` and `PixelScrollCanvas.jsx` in the registry.

## Strengths
- **Superior Off-screen Suspension:** Perfectly integrates the `createSuspendedRaf` gate, meaning WebGL renders only when active and pauses entirely when the component is scrolled off-screen.
- **Robust Asset Disposing:** WebGL geometries, shaders, materials, and textures are correctly disposed on unmount, preventing GPU memory leaks.

## Risks and issues
- **Critical Severity:** Broken package manifest. The `package.json` specifies `"main": "split-canvas.jsx"` and `"files": ["split-canvas.jsx", "registry.json"]`, but no file named `split-canvas.jsx` exists, resulting in a failed installation.
  - File: `registry/effects/scroll/split-canvas/package.json#L5`
  - File: `registry/effects/scroll/split-canvas/package.json#L7`
- **High Severity:** Global ScrollTrigger Destruction Bug. Inside `PixelScrollCanvas.jsx`, the unmount hook calls `ScrollTrigger.getAll().forEach((t) => t.kill());`. This will completely destroy **all other ScrollTriggers on the entire website** when this component is unmounted! If a website has other scroll animations or headers, unmounting the canvas will break them completely.
  - File: `registry/effects/scroll/split-canvas/PixelScrollCanvas.jsx#L216`
- **Medium Severity:** Structural file naming and import drift. In the registry, the sub-component is named `PixelScrollCanvas.jsx` (imported as `PixelScrollCanvas` in `index.jsx`). However, in the docs codebase at `apps/docs/src/components/split-canvas/`, the sub-component is named `SplitCanvasComp.jsx`, creating configuration and maintenance inconsistency.
- **Medium Severity:** Absence of motion safety. The rapid shutter-slice movement of screen-sized images can cause motion strain. The component lacks standard `prefers-reduced-motion` fallbacks.

## Accessibility assessment
- **Keyboard Navigation:** Unsupported. Keyboard users cannot scrub the slide transition, as there are no keyboard event handlers.
- **ARIA Semantics:** Missing ARIA region landmarks or semantic descriptions on the container.
- **Content Surface:** Clean. Captions and description headings are placed in semantic standard text nodes.

## Performance assessment
- **rAF Loop / Continuous Animation:** Excellent. Throttled/paused via the visibility intersection observer.
- **Off-screen Suspension:** Pass. Correctly managed by the `createSuspendedRaf` module.
- **Cleanup:** Poor. It kills global ScrollTriggers instead of containing its teardown strictly to its local context.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. While images are rendered on WebGL canvas textures, their descriptions and headings are rendered directly in standard HTML, allowing search engines to index them.
- **Semantic Tags:** Moderate. Uses standard `<h2/>` headings.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1025px):** Highly immersive sliced image shader reveal.
- **Mobile/Tablet (< 1025px):** The canvas element is responsive and scales nicely, relying on native window scroll to drive the WebGL displacement reveal.

## Maintainability and code-quality assessment
- Shaders are cleanly organized inside template strings.
- However, the global teardown bug (`ScrollTrigger.getAll()`) represents a major threat to multi-component web pages.

## Security and dependency concerns
- High dependency on external peer packages `three` and `gsap`.

## Browser compatibility considerations
- Requires WebGL rendering support, which is standard in all modern evergreen browsers.

## What was checked and found clean
- `registry.json` correctly registers `index.jsx` and `PixelScrollCanvas.jsx`.
- Canvas context disposes cleanly without GPU leaks.

## Suggested improvements and remediation priorities
1. **Fix package.json Manifest (Critical Priority):** Correct `"main"` to point to `"index.jsx"` and update `"files"` array to reference `"index.jsx"`, `"PixelScrollCanvas.jsx"`, and `"createSuspendedRaf.js"`.
2. **Remove Global ScrollTrigger Kill (Critical Priority):** Change the unmount cleanup from `ScrollTrigger.getAll().forEach(t => t.kill())` to only target the local timeline or local trigger instances (using GSAP Context).
3. **Unify Filenames (Medium Priority):** Rename `PixelScrollCanvas.jsx` to `SplitCanvasComp.jsx` (or vice-versa) to resolve naming drift.
4. **Implement Motion Preferences (High Priority):** Bypasses the shutter displacement on `prefers-reduced-motion`, instantly swapping slides.

## Final score: 5/10

## Overall severity label: High
