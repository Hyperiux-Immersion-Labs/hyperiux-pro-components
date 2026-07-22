# fish-eye (cursor)

## Summary

Advanced Three.js WebGPURenderer-based fish-eye lens distortion on images using modern TSL (Three.js Shading Language) node materials. Highly premium. Suspends frames via `createVisibilityGate`. However, it lacks a standard WebGLRenderer fallback, causing complete component failure/crash on browsers without WebGPU support.

## Implementation overview

- **`index.jsx`** — Core mesh renderer using `three/webgpu` and TSL nodes to distort texture UV mapping.
- **`createSuspendedRaf.js`** — Visibility gate implementation to manage Canvas rendering lifecycle.

## Strengths

- Cutting-edge implementation using modern WebGPURenderer and TSL shaders.
- Excellent memory management: disposes texture maps via `map.dispose()` and revokes object URLs on unmount.
- Zero background rendering overhead due to visibility gate.

## Risks and issues

1. **[High] No WebGL Fallback.** Three.js's brand new `WebGPURenderer` is used. On browsers that don't support WebGPU (older browsers, Safari <18, etc.), it fails to initialize and will crash the page since there is no standard WebGLRenderer fallback.
2. **[High] Public JSON Stale.** `apps/docs/public/r/fish-eye.json` is missing `createSuspendedRaf.js`.

## Accessibility assessment

- Touch interaction disabled completely on mobile pointer-coarse screen environments.

## Performance assessment

- Stunning performance on WebGPU systems, completely suspending itself when invisible.

## SEO and content-surface assessment

- Purely decorative image canvas.

## Responsive / mobile / touch behavior assessment

- Returns `null` on mobile coarse pointer checks to prevent loading heavy shaders on low-end portable devices.

## Maintainability and code-quality assessment

- Uses very modern ThreeJS syntax. Might be difficult to maintain for standard React developers unfamiliar with TSL.

## Security and dependency concerns

- Object URL generation handles CORS securely.

## Browser compatibility considerations

- Strictly limited to extremely modern WebGPU-capable browsers. Crashes on WebGL-only setups.

## What was checked and found clean

- All resources and URLs are cleanly revoked on unmount.

## Suggested improvements and remediation priorities

1. Implement a standard ThreeJS WebGLRenderer fallback inside the Canvas gl handler in case WebGPURenderer initialization throws an error.

## Final score: 6/10
## Overall severity label: High
