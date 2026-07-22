# interactive-list-preview (components)

## Summary

Interactive List Preview is a hover-driven table list that reveals images on hover with an inversion blending effect. It is a stunning visual component but has High-severity issues: major file renaming and reference drift where the registry uses `ListHover.jsx` but the production site uses `InteractiveListPreviewComp.jsx`, alongside mismatched HTML headings and breakpoints.

## Implementation overview

- **`index.jsx`** — Grid entry.
- **`ListHover.jsx`** — Hover image and coordinate reveal script.

## Strengths

- Exceptional high-fidelity inversion visual effect.
- Graced responsive fallbacks for mobile layouts.

## Risks and issues

1. **[High] Architecture renaming drift.** The helper file is named `ListHover.jsx` in the registry, but `InteractiveListPreviewComp.jsx` in the docs app. The parent file imports the wrong component depending on the location, presenting an integration roadblock.
2. **[Medium] Heading and class drifts.** Uses `<h2>` in registry vs `<h1>` in production, with differing media query classes.

## Accessibility assessment

- Inversion blending can cause low contrast on custom images. Gating contrast or motion is recommended.

## Performance assessment

- Highly performant. No heavy continuous loops, relies on on-demand GSAP hover states.

## SEO and content-surface assessment

- Standard tables index correctly.

## Responsive / mobile / touch behavior assessment

- Mismatched breakpoints cause styling anomalies on tablet viewport ranges.

## Maintainability and code-quality assessment

- Complex to integrate due to structural naming drifts.

## Security and dependency concerns

- Safe.

## Browser compatibility considerations

- Uses `mix-blend-mode: difference`, which is baseline compatible on evergreen platforms.

## What was checked and found clean

- Memory unregister scripts are present.

## Suggested improvements and remediation priorities

1. **(High)** Rename helper files to standard files across both folders.
2. **(Medium)** Standardize headings and layout classes.

## Final score: 6/10
## Overall severity label: High
