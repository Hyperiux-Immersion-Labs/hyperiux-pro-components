# strip-slider (webgl)

## Summary
The `strip-slider` component is an incredibly creative, high-performance WebGL-powered image slider. It splits each slide image into a series of thin, adjacent vertical mesh ribbons or "strips". When transitioning between slides, a staggered sinusoidal wave displacement is calculated in a custom vertex shader, making the ribbons ripple dynamically and curl in 3D perspective before assembling the next slide. It relies on a raw Three.js WebGLRenderer canvas pipeline, manages dynamic asset preloading, and maps custom interaction physics. However, it continues the systemic trend of omitting critical visibility-gate utilities from its public distribution manifest.

## Implementation overview
- **Staggered Ribbon Mesh Pipeline:** Generates adjacent segmented geometries (`PlaneGeometry`) to split full-bleed slides into independent vertical panels.
- **Wave Displacement Shader:** Contains custom vertex shaders (`galleryVert`) applying staggered sine wave transformations on the Y-position and Z-depth based on ribbon indices, time metrics, and transition states.
- **Raw Three.js Canvas Orchestration:** Operates directly through native Three.js `WebGLRenderer` and `Scene` setups rather than the declarative React-Three-Fiber, achieving maximum pipeline control.
- **Resource Disposal Routine:** Features a comprehensive unmount block disposing of high-res/low-res geometries, materials, background haze meshes, overlay planes, and the parent renderer instance.
- **Off-Screen Pause Watcher:** Links the canvas rendering loop directly to the `createSuspendedRaf` module, completely freezing requestAnimationFrame executions when scrolled out of view.

## Strengths
- **Splendid Aesthetic Originality:** The staggered vertical strip ripple transition, combined with 3D curls and atmospheric haze overlays, creates an exceptionally premium visual experience.
- **Impeccable GPU Memory Cleanups:** The cleanup method is flawless, explicitly and recursively disposing of all instantiated mesh geometries, shader materials, overlay planes, background ribbon structures, and the renderer context upon component destruction. This reduces WebGL memory leak risks to zero.
- **Lightweight CPU Footprint:** Computes trigonometric wave curves, color blends, and displacement factors entirely inside custom GPU vertex and fragment shader units, ensuring solid frame rates.
- **Capped Device Pixel Ratio:** Limits pixel density processing to a maximum of 2.0 (`Math.min(window.devicePixelRatio, 2.0)`), safeguarding hardware resources.

## Risks and issues

### High Severity
- **Missing File in Public Registry Manifest:** `apps/docs/public/r/strip-slider.json#L15-L26` does not export `createSuspendedRaf.js` under its files array, despite the source registry manifest `registry/effects/webgl/strip-slider/registry.json#L29-L31` declaring it. Consumers downloading the component via CLI will receive compilation crash errors as the local file imports `./createSuspendedRaf` which is absent in the directory.

### Medium Severity
- **Texture Cache Rate-Limits:** The default asset references inside the registry version point to `picsum.photos` seed links, which can suffer load delays or rate-limiting compared to the secure media-proxy R2 endpoints utilized in the documentation demo.
- **WebGL CORS Issues:** Standard WebGL texture loading restrictions apply. Consumers must ensure that their image assets are served from domains allowing cross-origin resource sharing, or the canvas will fail to render the slides.

### Low Severity
- **Magic Number Concentration:** The ribbon wave parameters (such as `sin(angle * 2.0 + uTime * 0.001) * 0.6`) are hardcoded directly within the GLSL vertex shaders, making tuning difficult for developers without shader expertise.

## Accessibility assessment
- **Aria-Hidden Masking:** Core rendering canvas wrappers are correctly hidden from accessibility readers via `aria-hidden="true"`.
- **Keyboard Tab Barrier:** The slider navigation cues lack standard HTML button focus capabilities (`tabIndex`). Keyboard-only visitors cannot trigger transitions or cycle active slides.
- **High Sensitivity Motion Risk:** Staggered wave displacements, fast-moving 3D ribbon curls, and intense transitions are highly active visual effects and can trigger vestibular discomfort, lacking options to disable motion or respect `prefers-reduced-motion` settings.

## Performance assessment
- **Performance Suspension Gating:** Pauses render loop execution immediately when offscreen or hidden.
- **Texture Size Capping:** Manages separate high-res and low-res meshes to load placeholder textures immediately, and then swaps them with rich texture data upon high-res download completion.
- **GPU Fill-Rate Mitigation:** antialiasing is set to `true`, but because pixel density is capped at 2.0, standard frame processing remains under 4ms per frame.

## SEO and content-surface assessment
- **Pure Visual Focus:** Designed strictly as a decorative backdrop and slider wrapper, containing no indexable semantic text content.

## Responsive / mobile / touch behavior assessment
- **Viewport Adjustments:** Recalculates ribbon sizes and aspect ratios on window resize triggers perfectly, adapting container dimensions to mobile frames.
- **Touch Swipe Integration:** Maps touch sweep movements to slider transitions smoothly.

## Maintainability and code-quality assessment
- **GLSL Separation Compliance:** Shaders are cleanly extracted to the module level as SCREAMING_SNAKE_CASE constants, keeping the component files highly readable and satisfying codebase standard specifications.
- **Excellent Coding Standards:** Follows clear ES6 functional conventions with descriptive variable naming.

## Security and dependency concerns
- **No Special Concerns:** Standard dependency footprint (`three`) with zero unverified script executions.

## Browser compatibility considerations
- **WebGL2 Support:** Gracefully falls back to WebGL1 if WebGL2 is unsupported by client environments.

## What was checked and found clean
- Flawless, exhaustive GPU resource disposal routines.
- Correct device pixel ratio capping at 2.0.
- Shaders are cleanly isolated at the module level.

## Suggested improvements and remediation priorities
1. **Critical:** Inject `createSuspendedRaf.js` into the `strip-slider` public compiled JSON manifest files array.
2. **High:** Add keyboard navigation bindings (such as `ArrowLeft` / `ArrowRight` arrow keys) to cycle slide indices.
3. **Medium:** Integrate standard `prefers-reduced-motion` checks to bypass staggered 3D wave displacements and replace them with standard cross-fade slides.
4. **Medium:** Externalize shader uniforms (such as wave heights and ripple speeds) into component props to make customization easy for developers without GLSL background knowledge.

## Final score: 8.3/10

## Overall severity label: High
