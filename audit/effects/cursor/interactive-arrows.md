# interactive-arrows (cursor)

## Summary

Canvas 2D collection of six interactive cursor-reactive grid patterns. Employs `createSuspendedRaf` for visibility management. However, the vector arrows grid performs a heavy O(N^2) double-loop calculation inside its frame update callback to calculate proximity displacement forces, which causes severe CPU thrashing.

## Implementation overview

- **`index.jsx`** — Main variation controller state switcher.
- **`arrows.jsx`** — Canvas-driven push-displace grid mesh.

## Strengths

- Wonderful variety of 2D canvas interactivity and visual modes.
- Clean coordinate translation mapping.

## Risks and issues

1. **[High] O(N^2) Performance chug.** In `Arrow.update`, when an arrow is hovered, it loops over ALL other arrows in `arrowsRef.current` and pushes them away. This double loop runs on every frame for potentially thousands of arrows, which severely chokes low-end CPU cores.

## Accessibility assessment

- Coordinates calculations are hidden from screen readers.

## Performance assessment

- Heavy O(N^2) complexity can drop framerates significantly on 120Hz high-resolution monitors.

## SEO and content-surface assessment

- Transparent decorative background.

## Responsive / mobile / touch behavior assessment

- Re-calculates grid spacing and canvas bounds on resize. However, canvas width/height gets set to window size and ignores custom parent wrappers.

## Maintainability and code-quality assessment

- Modular arrow logic is clean.

## Security and dependency concerns

- Clean dependency tree.

## Browser compatibility considerations

- Requires standard HTML5 Canvas 2D support.

## What was checked and found clean

- Properly detaches Resize and Mousemove handlers.

## Suggested improvements and remediation priorities

1. Optimize `Arrow.update` to perform spatial partitioning checks (e.g. quadtree or simple grid bounding box lookup) to reduce force computation complexity from O(N^2) to O(N).

## Final score: 6/10
## Overall severity label: High
