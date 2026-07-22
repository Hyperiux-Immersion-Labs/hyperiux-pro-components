# coffee-bean-cursor (cursor)

## Summary

High-fidelity R3F (React Three Fiber) mouse-reactive Verlet fluid simulation of 300 coffee beans. Built using `THREE.InstancedMesh` for optimal performance. Employs `createVisibilityGate` to suspend canvas frame loop rendering when out of sight. However, it lacks standard prefers-reduced-motion handling and has stale registry JSON files in the public directory.

## Implementation overview

- **`index.jsx`** — Main component containing R3F Canvas and InstancedMesh layout. Runs the Verlet integration logic in `useFrame` loop.
- **`createSuspendedRaf.js`** — Visibility gate helper ensuring zero-cost rendering when inactive.

## Strengths

- Incredibly advanced, fluid, physics-based Verlet integration running on `THREE.InstancedMesh` for GC-free rendering.
- Excellent lifecycle management with `createVisibilityGate`.
- Highly premium aesthetic.

## Risks and issues

1. **[Medium] Lack of prefers-reduced-motion integration.** Motion-sensitive users can get disoriented by the 300 fast-moving particles.
2. **[High] Public JSON Stale.** `apps/docs/public/r/coffee-bean-cursor.json` is missing `createSuspendedRaf.js` in its `files` array.

## Accessibility assessment

- Missing media query checks for system reduced motion preferences.
- Aria-hidden canvas.

## Performance assessment

- Verlet integration is pre-allocated and runs inside single InstancedMesh render call, avoiding DOM node allocation overhead completely.

## SEO and content-surface assessment

- SEO-friendly, does not block crawlable text.

## Responsive / mobile / touch behavior assessment

- Gracefully handled across screens.

## Maintainability and code-quality assessment

- Highly polished physics simulation is well-commented and clean.

## Security and dependency concerns

- Pristine dependency tree.

## Browser compatibility considerations

- Requires WebGL support. Works in all major browsers supporting canvas/WebGL.

## What was checked and found clean

- Proper file layout and imports.

## Suggested improvements and remediation priorities

1. Add support for system-level reduced-motion options.
2. Fix public JSON files to list `createSuspendedRaf.js`.

## Final score: 7/10
## Overall severity label: High
