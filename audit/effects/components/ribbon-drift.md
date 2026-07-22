# ribbon-drift (components)

## Summary

Ribbon Drift is a scroll-driven ribbon gallery where images drift horizontally at alternating speeds. It is beautifully written but has minor code drift regarding mobile wrapper height classes.

## Implementation overview

- **`index.jsx`** — Entry point setting up scroll containers.
- **`RibbonDriftComp.jsx`** — Coordinates horizontal translation offsets.

## Strengths

- Visually spectacular horizontal drifting experience.
- Gated scroll controls.

## Risks and issues

1. **[Low] Mobile class drift.** The wrapper uses `h-fit` in the registry, but `max-snm:h-full` in production, which can cause layout collapses on older screen heights.

## Accessibility assessment

- Focus navigation works well. Safe for most users.

## Performance assessment

- Offscreen elements are optimized, reducing layout calculation times.

## SEO and content-surface assessment

- Standard images index correctly.

## Responsive / mobile / touch behavior assessment

- Layout shift can occur on heights resizing.

## Maintainability and code-quality assessment

- Clean code, consistent naming schemes.

## Security and dependency concerns

- Safe.

## Browser compatibility considerations

- Baseline compatible.

## What was checked and found clean

- Validated schema compliance.

## Suggested improvements and remediation priorities

1. **(Low)** Sync mobile container height classes.

## Final score: 9/10
## Overall severity label: Low
