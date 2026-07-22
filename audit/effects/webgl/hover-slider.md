# hover-slider (webgl)

## Summary
The `hover-slider` component is an exceptional WebGL-powered list-slider component. When a user hovers over a table row representing a portfolio item, a vertically stacked column of WebGL-rendered image planes is revealed. As the user moves their mouse between rows, the image stack scroll position slides smoothly with elastic spring inertia, and a dynamic cylindrical bending distortion is applied to the images based on scroll speed. It employs advanced custom GLSL vertex and fragment shaders for the curvature effect, uses a dynamic texture loader cache with proper disposal routines, and integrates off-screen suspension using IntersectionObserver. However, the component suffers from critical public manifest omissions, minor layout and code drift, and accessibility limitations.

## Implementation overview
- **Canvas Overlay:** Overlays a full-bleed WebGL canvas on top of a semantic HTML list-row structure, placing meshes precisely over rows or offsets.
- **Dynamic Cylindrical Distortion Shader:** Contains a custom vertex shader utilizing a `circularArc` function that bends image plane vertex coordinates on a 3D Z-axis based on vertical travel velocity.
- **GSAP Tweens:** Smoothly controls and animates plane visibility alpha, distortion curvature limits, and zoom states upon hovered transitions.
- **Texture Cache Manager:** Standardizes texture loading and caching. It clones textures to ensure standard SRGB color space mapping and clean rendering, keeping them inside a cached object map.
- **Responsive Adaptive Behavior:** Dynamically recalculates rendering bounds on window resize events, switching between full interactive hover mode on desktop and touch-to-click mode on mobile devices.

## Strengths
- **Incredible Fluidity and Sensation:** The spring-based row transition combined with elastic cylindrical curvature reacts beautifully to quick hover interactions.
- **Rigorous WebGL Lifecycle Management:** Explicitly disposes of geometries, mesh materials, individual cached texture objects, and the parent WebGL renderer instances when the component unmounts, completely mitigating risk of GPU memory leaks.
- **High-Performance Rendering:** Bounds rendering loops via `createSuspendedRaf`, capping device-pixel-ratio to 2.0 and pausing rAF calls when completely offscreen or minimized.
- **Fallback Capability:** Gracefully shifts to fixed fullscreen canvases and touch-to-trigger events for mobile viewports, retaining full visual premium feeling on smaller displays.

## Risks and issues

### High Severity
- **Missing File in Public Registry Manifest:** The generated public registry manifest file `apps/docs/public/r/hover-slider.json#L16-L27` does not include `createSuspendedRaf.js` under its files list, despite the source registry manifest `registry/effects/webgl/hover-slider/registry.json#L30-L32` specifying it. This will prevent consumers from downloading the visibility-gate utility, causing installation and execution failure during imports: `import { createSuspendedRaf } from "./createSuspendedRaf"`.

### Medium Severity
- **Data Source Drift:** The mock portfolio items array in `registry/effects/webgl/hover-slider/index.jsx#L15-L167` hardcodes generic unoptimized `picsum.photos` seed URLs. In contrast, the documentation page uses secure local API-mediated cloud proxy endpoints (`/api/media-proxy?url=...`). If Picsum experiences standard rate-limiting or outages during initial user testing of the imported module, image loading will fail.
- **Arbitrary Tailwind Class Hardcoding:** Under `registry/effects/webgl/hover-slider/HoverSliderComp.jsx#L647-L656` multiple breakpoints are drifted between the documentation component and the registry source (e.g., mismatch of `max-xl:hidden` vs `max-md:hidden`, or `max-sm:hidden` vs `max-md:hidden`).

### Low Severity
- **Redundant Layout Calculations:** Recalculates canvas size and camera bounds multiple times inside the initial mount lifecycle instead of chaining layout states in a single clean pass.

## Accessibility assessment
- **Aria-Hidden Masking:** Uses `aria-hidden="true"` appropriately on the WebGL rendering canvas.
- **Keyboard Tab-Focus Blocked:** The rows inside the list-row layout are rendered with click handlers but lack standard keyboard accessibility. They are not keyboard tabbable (missing `tabIndex={0}` or similar) and cannot be expanded, hovered, or clicked via keyboard (missing `onKeyDown` handlers).
- **No Reduced-Motion Safeguards:** The high-speed elastic vertical displacement and shader-based mesh bending do not respect `prefers-reduced-motion: reduce` and cannot be customized or disabled by visitors suffering from vestibular disorders.

## Performance assessment
- **rAF Loop:** Highly optimized and paused offscreen via visibility-gating (`createSuspendedRaf`).
- **Object Allocation / Garbage Collection:** Clones textures on-demand but properly saves them inside `texCache` refs, avoiding repetitive network requests and heap growth during row switching.
- **Canvas Sizing:** Leverages `renderer.setSize(W, H, false)` which prevents canvas styling stretch-aliasing.

## SEO and content-surface assessment
- **Crawler Friendly Table Layout:** Portfolio details (IDs, titles, focuses, and years) are fully rendered in the DOM as semantic text nodes, ensuring that search engines can easily scrape, index, and crawl component content.

## Responsive / mobile / touch behavior assessment
- **Perfect Touch Optimization:** Correctly detects touch events, converting cursor hover cues into touch-friendly clicks.
- **Viewport Resilience:** Safely handles fixed canvas coordinates for small heights on mobile to prevent clipping.

## Maintainability and code-quality assessment
- **GLSL Extraction Compliance:** Vertex and fragment GLSL shaders are extracted at the module level with standard `/* glsl */` markers, satisfying code guidelines.
- **Magic Number Elimination:** Magic numbers inside the spring loop are documented, though some values (like `0.18 - distToTarget * 0.06` speed modifier) are inline.

## Security and dependency concerns
- **No Special Concerns:** Standard dependency footprint (`three`, `gsap`) with no third-party script integrations.

## Browser compatibility considerations
- **Discard Statement:** Vertex fragment shaders use the `discard` keyword on UV boundaries. This is well supported across WebGL 1.0 and 2.0 but must be tested on ancient webview layers.

## What was checked and found clean
- High-quality WebGL cleanup routine destroying all meshes, materials, cached textures, and the WebGL renderer.
- Responsive breakpoints recalculating perfectly.
- Clean device-pixel-ratio cap at 2.0.

## Suggested improvements and remediation priorities
1. **Critical:** Update the public manifest generator script or index to include `createSuspendedRaf.js` under `hover-slider` assets to prevent installation compilation errors.
2. **High:** Synchronize styling and breakpoint class definitions between the documentation component and the registry version.
3. **Medium:** Add support for standard keyboard navigation (`tabIndex` and `onKeyDown`) to make table rows fully interactive for assistive screen-reader users.
4. **Medium:** Introduce a check for `prefers-reduced-motion` to bypass cylindrical vertex curvature calculations and GSAP sliding transitions when requested.

## Final score: 7.2/10

## Overall severity label: High
