# butterfly-trail-cursor (cursor)

## Summary

A premium 3D React-Three-Fiber (R3F) butterfly swarm trail cursor animation. It provides high visual appeal with custom 3D models orbiting the cursor position. Built using Three.js and `@react-three/fiber`, it utilizes a robust `createVisibilityGate` utility to dynamically pause and play the render loop based on tab/scroll visibility. However, it lacks accessibility standard `prefers-reduced-motion` options, has minor mobile performance paint costs, and suffers from a stale public JSON registry file that lacks its `createSuspendedRaf.js` dependency.

## Implementation overview

- **`index.jsx`** — Serves as the component entry point. Hosts the R3F Canvas and dynamically toggles the `frameloop` attribute between `'always'` and `'never'` based on state driven by `createVisibilityGate`.
- **`createSuspendedRaf.js`** — Shared visibility helper module providing `createVisibilityGate` utilizing standard IntersectionObserver and visibilitychange APIs.
- **`registry.json`** — Correctly registers `"tier": "pro"` with metadata referencing `index.jsx` and `createSuspendedRaf.js` as files.

## Strengths

- Extremely premium 3D design and visual aesthetic.
- Excellent lifecycle optimization: dynamically pauses the ThreeJS render loop when offscreen/invisible via `createVisibilityGate`.
- Good garbage collection: disposes of geometries, shaders, and materials gracefully.

## Risks and issues

1. **[Medium] Lack of `prefers-reduced-motion` integration.** The 3D animation loop runs unconditionally, which can trigger vestibular issues for motion-sensitive users.
2. **[Medium] Heavy WebGL paint costs.** Can chug/lag on older mobile/tablet devices if standard touch pointers are used, though they are usually hidden.
3. **[High] Public JSON Stale.** `apps/docs/public/r/butterfly-trail-cursor.json` does not include `createSuspendedRaf.js` under `files`, which will cause dependency/build issues for downstream shadcn users.

## Accessibility assessment

- Does not respect standard system-level 'prefers-reduced-motion' settings.
- Canvas is hidden from screen readers via `aria-hidden="true"` fallback structure.

## Performance assessment

- WebGL compositing overhead is high on low-end devices, but visibility gate prevents background CPU usage perfectly.

## SEO and content-surface assessment

- Does not hinder SEO crawlability of page text since it overlays canvas.

## Responsive / mobile / touch behavior assessment

- Includes media queries to disable interaction on pointer-coarse (mobile) devices gracefully.

## Maintainability and code-quality assessment

- Clean prop schema and structure following CODING_STANDARDS.md.

## Security and dependency concerns

- No raw HTML injection or unsafe external script references.

## Browser compatibility considerations

- Requires WebGL2 support. Supported by all modern evergreen browsers but falls back to blank canvas on highly restrictive corporate/legacy setups.

## What was checked and found clean

- Registry file structure matches developer guides.
- Properly configured as a pro component.

## Suggested improvements and remediation priorities

1. Add system-level `prefers-reduced-motion` check to bypass rendering of butterfly meshes.
2. Sync `apps/docs/public/r/butterfly-trail-cursor.json` to include the `createSuspendedRaf.js` file reference.

## Final score: 7/10
## Overall severity label: High
