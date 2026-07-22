# full-screen-crosshair (cursor)

## Summary

Full screen overlay crosshair that smoothly trails client cursor position. However, it suffers from severe named/default export mismatch drift between the documentation application copy and the registry component. Additionally, it has high-frequency React re-render overhead inside the `useMouse` animation frame loop.

## Implementation overview

- **`index.jsx`** — CSS variable driven crosshair lines and center content markup.
- **`useMouse.js`** — Houses client mouse tracking and the continuous `createSuspendedRaf` loop.
- **`createSuspendedRaf.js`** — Shared helper managing frame suspension.

## Strengths

- Highly customizable line sizing, gap thickness, and blend mode capabilities.
- Correctly restores the native body cursor styles on unmount.

## Risks and issues

1. **[High] Export and Naming Drift.** The component at `apps/docs/src/components/full-screen-crosshair/index.jsx` is named `FullScreenCrosshair` and is exported as a default export. However, in `registry/effects/cursor/full-screen-crosshair/index.jsx`, the component is named `CrosshairCursor` and is exported as a named export. This creates severe inconsistency between development and registry installation!
2. **[Medium] React State Overhead.** `useMouse` calls `setState` in its internal `createSuspendedRaf` loop on every frame, which forces React to re-render the entire crosshair structure 60-120 times/sec, wasting CPU/GC.

## Accessibility assessment

- No reduced motion checks.

## Performance assessment

- High CPU usage due to React state-driven coordinate re-rendering rather than direct DOM ref modification.

## SEO and content-surface assessment

- SEO crawlable center content.

## Responsive / mobile / touch behavior assessment

- Handles mobile fallbacks gracefully.

## Maintainability and code-quality assessment

- Component naming mismatch across folders makes long-term maintainability difficult.

## Security and dependency concerns

- No vulnerability risks.

## Browser compatibility considerations

- Requires CSS `mix-blend-mode` support in browsers.

## What was checked and found clean

- Event listeners are properly detached on unmount.

## Suggested improvements and remediation priorities

1. Rename `CrosshairCursor` inside `registry/effects/cursor/full-screen-crosshair/index.jsx` to `FullScreenCrosshair` and change the export statement to `export default FullScreenCrosshair` to resolve registry mismatch drift.
2. Refactor `useMouse` to directly modify styles of a DOM reference, bypassing React component state re-rendering completely.

## Final score: 5/10
## Overall severity label: High
