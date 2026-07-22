# loaders — Category Report

## Category overview

The `loaders` category is a highly optimized, lightweight category in the Hyperiux Vault registry, housing **3 effects**:
- `lines-loader`
- `numeric-tunnel`
- `stack-loader`

These components serve as pre-loader visual animations that play during page loads or asset fetches. They use GSAP timelines or raw 2D Canvas loops to deliver smooth, modern loaders that are responsive and performant, but have minor package entry-point drifts and accessibility shortcomings.

## Common patterns across its effects

- **Lightweight Elements:** None of these loaders require heavy Three.js environments, keeping download sizes and startup overhead remarkably low.
- **GSAP and Canvas Driven:** `lines-loader` and `stack-loader` rely on custom GSAP timelines, while `numeric-tunnel` uses a high-performance, single-canvas 2D context loop.
- **Responsive Layouts:** All loaders are configured with responsive width/height boundaries to scale cleanly on mobile devices.

## Repeated issues

### High

- **Empty NPM packaging tarballs (Registry-wide Defect):** `package.json` configurations are broken. The `main` and `files` keys refer to non-existent filenames (such as `lines-loader.jsx` and `numeric-tunnel.jsx`) instead of `index.jsx`, rendering the distributed npm tarballs completely empty.

### Medium

- **Missing prefers-reduced-motion guards:** Fast pulsing numbers, stacking blocks, and lines run at full frame-rates without checking OS preferences.
- **Unlabeled Screen-reader Elements:** Loaders lack standard ARIA role descriptors (`role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`) and are invisible to assistive technologies.

## Best practices to standardize

1. **Unify entry points to index.jsx:** Standardize on `index.jsx` inside `package.json` to enable complete packaging.
2. **Inject screen-reader tags:** Always wrap loading animations with appropriate ARIA progress markers to ensure keyboard and assistive software accessibility.

## Prioritized list of improvements

1. **Align package.json Entry Points (P0):** Correct the copy-paste main target files to `index.jsx`.
2. **Implement prefers-reduced-motion check (P1):** Block animations or fall back to static percentage counts.
3. **Wire ARIA labels (P2):** Add `role="progressbar"` to wrapper elements.

## Score distribution table

| Component Slug | Score | Severity | Main Defect |
| :--- | :---: | :---: | :--- |
| `lines-loader` | 8.5/10 | High | Broken package.json entry point |
| `numeric-tunnel` | 8.5/10 | High | Broken package.json entry point |
| `stack-loader` | 8.5/10 | High | Broken package.json entry point |\n