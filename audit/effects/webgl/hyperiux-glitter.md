# hyperiux-glitter (webgl)

## Summary
The `hyperiux-glitter` component is a visually majestic, highly interactive WebGL particle logo simulation. It samples vertices from a custom 3D GLTF model (representing a brand symbol) and populates them with thousands of twinkling, morphing particle shapes (diamonds and crosses) that rotate and float under parallax. Additionally, when a user sweeps their cursor across the viewport, it spawns a secondary emitter creating sparkling comet trails that interact physically with the main model, pushing particles dynamically based on cursor direction and velocity before they spring back to their original 3D coordinates. Despite its outstanding interactive visuals, the component violates codebase guidelines by using deeply nested inline GLSL strings, suffers from critical file omissions in its public manifest, and lacks basic accessibility support.

## Implementation overview
- **Mesh Vertices Sampler:** Uses the Three.js `MeshSurfaceSampler` utility to uniformly sample up to 8,000 points from a merged 3D buffer geometry representing the loaded model.
- **Dynamic Physics simulation:** Updates particle positions on a frame-by-frame basis inside `useFrame`, calculation distance to mouse-cast raycaster coordinates, applying directional offsets from pointer velocities, and easing positions back via lerp.
- **Mouse Trail Emitter:** A separate particle points emitter (`MouseTrailParticles.jsx`) maintains a ring-buffer of historical cursor coordinates to generate glittering, fading cursor trails.
- **Post-Processing Glow:** Chains the Postprocessing `EffectComposer` and a high-threshold `Bloom` filter to make particles appear as emissive, glittery starlight.
- **Visibility Loop Gating:** Incorporates a custom `createVisibilityGate` from `createSuspendedRaf.js` to toggle the R3F `<Canvas>` frame-rendering state on tab switches and scroll bounds.

## Strengths
- **Sensory Branding Appeal:** Combines organic physics-based particle repulsion, twinkling custom shaders, and bright bloom to make a highly premium, satisfying interactive logo concept.
- **Smart Model Merging:** Seamlessly merges multiple nested sub-meshes inside loaded GLTF scenes into a single buffer geometry using `buildMergedSurface`, ensuring uniform density.
- **Exceptional Resource Disposal:** Safely disposes of temporary geometries and basic materials (`mergedGeometry.dispose()`, `tempMesh.material.dispose()`) during point-sampling initialization, preventing startup leaks.
- **Asset Self-Containment:** Unlike other WebGL modules, the `.glb` asset is distributed locally inside the component package files rather than being loaded from external unverified domains.

## Risks and issues

### High Severity
- **Missing File in Public Registry Manifest:** `apps/docs/public/r/hyperiux-glitter.json#L18-L40` lacks the `createSuspendedRaf.js` file from its manifest list, which is present in the source registry setup `registry/effects/webgl/hyperiux-glitter/registry.json#L38-L40`. This will cause compilation errors upon client-side downloads as the required import `import { createSuspendedRaf }` fails.

### Medium Severity
- **Direct Guideline Infraction (Inline GLSL):** `registry/effects/webgl/hyperiux-glitter/MorphingParticleModelNew.jsx#L232-L304` defines complex custom vertex and fragment shaders directly inline inside a React `useMemo` hooks block. This goes directly against the `CODING_STANDARDS.md` requirements (L663-665) which state that GLSL strings must live at the module level outside the component as SCREAMING_SNAKE_CASE constants.

### Low Severity
- **Unused React Imports Mismatch:** Mismatches and duplicate React hooks (`useEffect`, `useState`, `useRef`, etc.) differ slightly between the registry index copy and the documentation copy due to drift.

## Accessibility assessment
- **Aria-Hidden Masking:** The `<Canvas>` container is correctly wrapped with `aria-hidden="true"`, ensuring visual noise is shielded from screen readers.
- **Total Screen Reader / Keyboard Barrier:** The logo visualization is completely invisible and unreachable by keyboard. A user navigating via keyboard has no way to invoke the interactive sweep, trigger model morphs, or access any details representing the glitter element (missing alt labels or equivalent static content tags).
- **High Sensitivity Motion Risk:** Fast-moving cursor trail comets, high-speed particle dispersion, and intense twinkling are motion-heavy and can trigger vestibular responses, lacking any check against `prefers-reduced-motion` settings.

## Performance assessment
- **Active Point Sampling Cost:** Mesh sampling occurs once during initial mount on a separate thread (Microtask) via `Promise.resolve().then()`. However, sampling 8,000 points on extremely dense models can briefly block the main thread on low-end CPUs.
- **DPR Capping:** Limits device-pixel-ratio to `Math.min(window.devicePixelRatio, 2)` inside `<Canvas dpr={[1, 2]}>` which prevents rendering bottlenecks.
- **Frame-by-Frame Lerping Overhead:** Updating 8,000 floats inside `useFrame` via CPU JavaScript (`THREE.MathUtils.lerp`) is computationally heavy compared to updating them in a GPU Vertex Shader. While performing fine on modern desktop processors, this represents a significant bottleneck for mid-range mobile systems.

## SEO and content-surface assessment
- **Pure Visual Focus:** The component is designed strictly as an atmospheric back-plate or logo, containing no readable headers or textual content. Thus, its SEO footprint is neutral but doesn't contribute indexable metadata.

## Responsive / mobile / touch behavior assessment
- **Pointer/Touch Divergence:** On mobile devices, pointer trail physics are adapted to touch movements. However, because of the intensive CPU particle-loop updating and Bloom postprocessing, mobile frame rates can drop significantly.
- **Text Sizing Drift:** The absolute overlay instruction ("Sweep your cursor...") uses hardcoded viewport width classes (`text-[1.1vw]`) that shrink illegibly on smaller desktop frames, and the responsive styling class is drifted between standard media queries.

## Maintainability and code-quality assessment
- **Violations of Shader Modularization:** Placing vertex/fragment code blocks directly inside React render loops makes reading physics calculations harder.
- **Code Duplication:** The helper utility `createSuspendedRaf.js` is duplicated across multiple effect packages rather than living in a shared monorepo workspace module, which is a trade-off for registry isolation.

## Security and dependency concerns
- **GLB Upload Validation:** Standard GLB asset load. Secure sandbox since no executable scripting is enabled in static models.

## Browser compatibility considerations
- **Bloom Post-processing:** Post-processing passes require WebGL 2.0 and support for floating-point textures. Ancient mobile browsers (Safari prior to iOS 15) may render a blank screen if floating-point textures are unsupported.

## What was checked and found clean
- Correct geometry/material disposals in the merge function.
- Local relative path mapping for GLB assets.
- Loop pausing on tab blur.

## Suggested improvements and remediation priorities
1. **Critical:** Inject `createSuspendedRaf.js` into the `hyperiux-glitter` manifest files array in the master index database.
2. **High:** Extract the inline GLSL shaders inside `MorphingParticleModelNew.jsx` to SCREAMING_SNAKE_CASE module-level string constants marked with `/* glsl */`.
3. **Medium:** Move particle translation logic (`lerp`) from CPU JavaScript inside `useFrame` to a GPU-based vertex shader (using texture-based or attribute-based displacements) to achieve massive performance gains.
4. **Medium:** Wrap the particle dispersion in a `prefers-reduced-motion` check to clamp dispersal velocity or fallback to a static particle cluster.
5. **Low:** Fix responsive breakpoint text layout drift in `index.jsx` between the documentation and registry versions.

## Final score: 6.8/10

## Overall severity label: High
