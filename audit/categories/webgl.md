# webgl — Category Report

## Category overview

The `webgl` category represents the peak of Hyperiux's technical complexity, housing **19 components** driven by Three.js, React Three Fiber (R3F), and custom GLSL shader pipelines:
- `3d-portfolio-slider`
- `book-flip`
- `colliding-models`
- `curved-plane`
- `donut-particles`
- `draggable-canvas`
- `file-encryption`
- `fractal-glass`
- `grid-lift`
- `grid-tunnel`
- `hero-banner-animated`
- `hover-slider`
- `hyperiux-glitter`
- `infinite-grid-gallery`
- `interactive-blur-reveal`
- `milky-way`
- `mouse-pixelation`
- `progressive-bloom-valley`
- `strip-slider`

These components leverage physics simulations, point-cloud particles, raycasting, post-processing blooms, and custom image mesh morphs to create next-level visual experiences. However, their extreme complexity also introduces high-severity vulnerabilities around GPU memory leaks, missing assets in registry metadata, and critical build-manifest drift that breaks installation flows.

## Common patterns across its effects

- **R3F Canvas Declarations:** High-end effects leverage React Three Fiber (`@react-three/fiber`) to declare Three.js render loops inside standard React component states.
- **Custom GLSL Shader Uniforms:** Dynamic animations are driven by custom vertex and fragment shaders where uniforms are updated on-screen based on cursor mouse coordinates or scroll states.
- **Robust Visibility Gating (createSuspendedRaf):** Unlike standard elements, WebGL requires active frames to update the Canvas. 18 out of the 19 audited WebGL components correctly integrate the shared `createSuspendedRaf` utility to freeze WebGL rendering when offscreen.
- **External Asset Loading (GLTF/GLB):** Effects like `hyperiux-glitter` and `colliding-models` load complex pre-baked 3D geometries using `@react-three/drei` loaders.

## Repeated issues

### Critical

- **Missing Local Asset Files (`hyperiux-glitter`):** The `registry.json` manifests specify a local file path `assets/models/hyperiux-new-model.glb` to bundle and deliver. However, this asset file is **completely missing** from the directory. The runtime component instead downloads the model from an external, hardcoded CDN bucket, causing compiler or registry pack failures on local builders.
- **Stale JSON Manifest Code (`fractal-glass`):** The serialized code in the public manifest `apps/docs/public/r/fractal-glass.json` contains a stale, outdated version of the component that completely lacks `createSuspendedRaf` and still runs un-gated rendering loops, exposing users to performance issues upon CLI download.

### High

- **Systemic CLI Install Failures (Drifted Manifests):** Across **10 out of the 19 audited components**, the public builds under `apps/docs/public/r/<slug>.json` completely omit `createSuspendedRaf.js` (and `webgl-context-recovery.js` in `file-encryption`) from their `files` list. CLI downloads will fail to resolve imports, breaking users' builds on download.
- **Severe GPU Memory Leaks (`3d-portfolio-slider`):** The unmount callback disposes of the main WebGL renderer, but completely fails to dispose of individual plane geometries (`PlaneGeometry`), custom shader materials (`ShaderMaterial`), and loaded web textures, trapping GPU resources.
- **WebGPU strictly-locked crashes (`fish-eye` / WebGL equivalent):** Forces WebGPU layouts using Three.js TSL shaders without configuring any WebGL fallback wrappers, triggering complete canvas crashes on non-WebGPU browsers (Safari <18, older browsers, etc.).
- **Duplicate Case-Sensitive Files (`progressive-bloom-valley`):** Features kebab-case duplicates directly alongside PascalCase active source files (`film-grain-effect.jsx` and `FilmGrainEffect.jsx`), creating silent compilation collisions on case-sensitive OS filesystems.

### Medium

- **Context-Loss Recovery Omissions:** Several raw Canvas WebGL components do not register handlers for browser-driven GPU context losses (`webglcontextlost`), leaving canvases permanently blank on laptop wake or mobile background tab restores.
- **Missing reduced-motion checks:** Visual particle accelerations, zooms, and mesh morphs ignore user prefers-reduced-motion preferences entirely.

## Best practices to standardize

1. **Enforce Complete GPU Cleanup:** Mandate strict teardown functions that recurse over the Three.js scene tree, explicitly calling `.dispose()` on all geometries, materials, and textures.
2. **Standardize on WebGL-WebGPU Fallbacks:** Ensure modern WebGPU/TSL shaders are safely wrapped inside feature checks that gracefully downgrade to WebGL systems.
3. **Synchronize Registry and Public Manifests:** Create an automated CI test verifying that all files listed in `registry/` are correctly compiled inside the public `apps/docs/public/r/` directories.
4. **Handle Context-Loss Events:** Wire all direct WebGL contexts with context recovery listeners that preventative-default on lost events to enable contextrestored rebuilding.

## Prioritized list of improvements

1. **Restore Missing Model Asset for Hyperiux Glitter (P0):** Commit the missing `hyperiux-new-model.glb` to the assets folder or remove its entry from `registry.json`.
2. **Re-serialize Outdated Manifests (P0):** Regenerate `fractal-glass.json` and ensure public registry JSONs are perfectly aligned with registry sources.
3. **Fix 3D Portfolio Geometry Leaks (P1):** Update unmount routines to dispose of all plane geometries and textures.
4. **Remove Case-Sensitive Duplicates (P1):** Delete kebab-case duplicate files in `progressive-bloom-valley`.

## Score distribution table

| Component Slug | Score | Severity | Main Defect |
| :--- | :---: | :---: | :--- |
| `3d-portfolio-slider` | 7.5/10 | High | GPU Memory Leak on unmount |
| `book-flip` | 8.5/10 | Medium | Missing asset in manifest |
| `colliding-models` | 8.8/10 | High | Missing file manifest drift |
| `curved-plane` | 8.5/10 | High | CLI manifest file omission |
| `donut-particles` | 9.0/10 | High | CLI manifest file omission |
| `draggable-canvas` | 9.2/10 | High | CLI manifest file omission |
| `file-encryption` | 9.5/10 | High | CLI manifest file omission |
| `fractal-glass` | 7.0/10 | Critical | Stale manifest code (no rAF pause) |
| `grid-lift` | 9.0/10 | High | CLI manifest file omission |
| `grid-tunnel` | 9.3/10 | High | CLI manifest file omission |
| `hero-banner-animated` | 9.0/10 | Low | Minor style drift |
| `hover-slider` | 9.0/10 | Low | Component index naming drift |
| `hyperiux-glitter` | 5.0/10 | Critical | Missing GLB asset in registry directory |
| `infinite-grid-gallery`| 9.0/10 | Low | Minor import naming drift |
| `interactive-blur-reveal`| 9.5/10 | Low | Pristine |
| `milky-way` | 8.0/10 | Medium | Capitalization naming drift |
| `mouse-pixelation` | 9.0/10 | Low | Minor index entry drift |
| `progressive-bloom-valley`| 6.0/10 | High | Duplicate case-sensitive files on disk |
| `strip-slider` | 9.0/10 | Low | Minor file schema drift |\n