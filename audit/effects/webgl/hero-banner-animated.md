# hero-banner-animated (webgl)

## Summary
The `hero-banner-animated` component is an immersive, premium WebGL-powered 3D hero scene built using React Three Fiber, Drei, and post-processing. It constructs a meticulously crafted virtual studio space containing a ladder, room geometry, reflective tiled floor, and a vintage retro TV set. This TV set acts as an interactive viewport that, upon clicking, zooms the camera in to play a showreel video with a custom-built, multi-stage pixelation transition shader. On mobile devices, the canvas and heavy post-processing effects are disabled entirely in favor of a clean, optimized message encouraging desktop visitation, preventing mobile hardware thermal throttling and lag. While visually stunning and incorporating advanced visibility-gating for rendering performance, the component suffers from severe registry packaging mismatches, multiple instances of code drift, external resource hardcoding, and lack of comprehensive accessibility attributes.

## Implementation overview
- **3D Room Scene:** Uses custom GLTF loader hooks to pull room asset nodes (`finall.glb`) and map custom physical and custom-shader materials onto them.
- **TV Transition Shader:** Utilizes a custom GLSL `shaderMaterial` named `TVTransitionMaterial` that implements real-time bilinear pixelation crossfading from a static TV test pattern texture to a dynamic HTML5 `<video>` stream texture based on a normalized `uProgress` uniform driven by GSAP quickTo.
- **Lighting & Post-Processing:** Incorporates a mouse-tracked, inertia-lerped point light that creates dynamic shadows along with post-processing effects (film grain and edge blur) using React Three Postprocessing (`EffectComposer`, `EdgeBlurEffect`, `CustomGrainNoise`).
- **Visibility-Gating:** Employs an IntersectionObserver-based gate via `createSuspendedRaf.js` to change the React Three Fiber `<Canvas>` `frameloop` prop from `"always"` to `"never"` when offscreen or when the document tab is inactive.
- **Adaptive Fallback:** Conditionally rendering desktop-only WebGL environments via device-size media-query checks.

## Strengths
- **Aesthetic Excellence:** Extremely high-quality visual results combining soft physical shadows, high-fidelity mesh reflections, retro-style film grain, and realistic TV screen distortion.
- **Robust Rendering Optimizations:** Restricting device-pixel-ratio (DPR) to a maximum of 2.0 to protect high-density screens from GPU exhaustion, and utilizing an IntersectionObserver to dynamically toggle R3F rendering states.
- **Sophisticated Animation Orchestration:** Seamlessly coordinates GSAP tween interpolation for camera positioning, point-light intensity scaling, environment intensity fade-outs, and custom shader transition progress.
- **Graceful Asset Disposal:** Disposes cloned texture assets (`TVtexture`, `videoTexture`, `normalMap`, `roughnessMap`) correctly inside React unmount hooks, preventing WebGL texture leaks.

## Risks and issues

### High Severity
- **Missing File in Public Registry Manifest:** `apps/docs/public/r/hero-banner-animated.json#L22-L48` is missing the `createSuspendedRaf.js` utility under the `files` manifest, even though it is declared in the registry source configuration `registry/effects/webgl/hero-banner-animated/registry.json#L48-L50`. Consequently, automated CLI-driven consumers will fail to install this dependency file, resulting in fatal React compilation errors: `Module not found: Can't resolve './createSuspendedRaf'`.
- **Absolute External Dependency Hardcoding:** `registry/effects/webgl/hero-banner-animated/RoomModel.jsx#L108`, `L114`, `L124`, `L260`, and `L277` hardcode absolute R2 cloud bucket assets URLs. If these endpoints experience outage or the files are moved, the entire WebGL scene will fail to load, crashing the page.

### Medium Severity
- **Significant Component Drift:** There is a major difference between `registry/effects/webgl/hero-banner-animated/index.jsx` and `apps/docs/src/components/hero-banner-animated/index.jsx`. The registry component contains an outdated layout utilizing older breakpoints, raw non-optimized next/link imports, and misses crucial styling fixes (like `overflow-hidden` on the container section) that are active on the documentation site's copy.
- **Global Side Effects via DOM Manipulation:** `registry/effects/webgl/hero-banner-animated/RoomModel.jsx#L340-L341` modifies the global document cursor (`document.body.style.cursor`) during pointers enter and leave events. If the component unmounts while hovered, the body cursor style is left persistently modified.

### Low Severity
- **Double Next/Link Imports:** `registry/effects/webgl/hero-banner-animated/index.jsx#L15` imports `Link` from `next/link` while the documentation components copy duplicates/mismatches this import.
- **Unused Play Icons:** The SVG icons such as Play (`lucide-react`) are imported but sometimes conditionally rendered with no active interactivity.

## Accessibility assessment
- **Assistive Technology Isolation:** The canvas uses `aria-hidden="true"`, which is clean because WebGL visuals should be transparent to screen readers.
- **Reduced Motion Support:** The component does not conditionally bypass or scale down GSAP camera movements or screen zoom transitions when `window.matchMedia('(prefers-reduced-motion: reduce)')` is active, representing a motion sickness risk for sensitive users.
- **Keyboard Navigation Barrier:** Interactive elements, such as the Retro TV set mesh, are clickable via pointer events but are entirely unreachable and non-interactive via standard keyboard navigation (no tab-focus, no enter key support).

## Performance assessment
- **rAF / Loop Management:** Toggles `<Canvas frameloop={frameloop}>` safely to save CPU/GPU overhead when offscreen.
- **Object Allocation / GC:** Instantiates standard physical vectors inside `useMemo` blocks or `useRef` states to avoid frame-by-frame GC garbage generation.
- **WebGL Disposal:** Correctly calls `.dispose()` on all custom-cloned texture instances upon unmount.
- **Off-Screen Post-Processing Pausing:** Works correctly by leveraging the `createVisibilityGate` listener attached to the R3F container.

## SEO and content-surface assessment
- **Fallback Content:** The text overlay elements ("HXR UI") are rendered as semantic HTML `motion.div` overlaying the canvas, making them fully crawlable by search engine bots.
- **H1 Heading Mismatch:** In the docs component copy, `motion.p` was replaced by `motion.h1` to establish a semantic heading structure, but this change is drifted and missing from the registry source component.

## Responsive / mobile / touch behavior assessment
- **Mobile Fallback Optimization:** On touch devices (`isMobile` threshold), WebGL elements are replaced by a lightweight, responsive text overlay.
- **Tablet Sizing:** Camera Z-depth configurations adjust appropriately between `desktop`, `tablet`, and `mobile` categories via `CAMERA_CONFIG`.

## Maintainability and code-quality assessment
- **GLSL Extraction:** Shader materials are defined outside the component function at the module-scope level, keeping the component index readable and compliant with standards.
- **Magic Numbers:** Utilizes `CAMERA_CONFIG` and `ENV_INTENSITY_CONFIG` constants to eliminate inline magic numbers.

## Security and dependency concerns
- **Third-Party Script Injection Risk:** Relies on fetching 3D assets from an unauthenticated cloud bucket endpoint. While secure HTTP is utilized, any poisoning of these files could deliver arbitrary shaders or assets to user clients.

## Browser compatibility considerations
- **Web-GL 2.0 Dependency:** The retro reflection materials require robust stencil buffers and WebGL 2.0. Ancient safari releases may struggle with the post-processing edge blur and depth textures.

## What was checked and found clean
- Proper DPR capping up to 2.0.
- Safe texture disposes in `RoomModel.jsx`.
- Clean cleanup of resize media listeners in the main component lifecycle hook.

## Suggested improvements and remediation priorities
1. **Critical:** Update the master build registry manifest to include `createSuspendedRaf.js` under `hero-banner-animated` files to prevent package installation crashes.
2. **High:** Sync the component drift between the documentation source and the registry index file.
3. **High:** Replace absolute external asset URLs with local public path fallbacks or configuration-based props so users can provide their own model files easily.
4. **Medium:** Wrap cursor style modifications inside a hook that restores the original state on unmount, or use Tailwind CSS `cursor-pointer` classes on wrapper elements.
5. **Medium:** Add support for keyboard tab accessibility on the TV screen by turning it into a semantic button or utilizing focus refs.

## Final score: 6.5/10

## Overall severity label: High
