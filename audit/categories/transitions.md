# transitions — Category Report

## Category overview

The `transitions` category comprises **6 high-quality transition layout templates** driven by GreenSock (GSAP) and Next.js Transition Routers:
- `block-transition`
- `chess-grid-transition`
- `page-flip-transition`
- `pixel-transition`
- `radial-slice-transition`
- `svg-brush-transition`

These components intercept Next.js routing transitions to play elegant fullscreen grid-splits, SVG-brush sweeps, block-slides, and pixelated reveals. The transition effects are exceptionally well-engineered, showcasing the highest quality scores in the entire registry, but contain minor file schema drifts and registry mismatches.

## Common patterns across its effects

- **GSAP Timelines & Next Router Hooks:** All transitions utilize custom timelines wrapped inside `@react-three/fiber` or `next-transition-router` hooks (`TransitionRouter` or custom events) to delay next-page loads while visual transitions execute.
- **Pristine Cleanup:** All timelines are properly killed (`tl.kill()`) on component unmount, preventing any memory leaks or page locks.
- **Flawless Responsive Boundaries:** Visual grids (like `chess-grid-transition` or `pixel-transition`) dynamically recalculate row/column counts on resize to scale smoothly from screen widths of 320px to 4K.

## Repeated issues

### High

- **Empty NPM packaging tarballs (Registry-wide Defect):** 5 out of the 6 transitions (`radial-slice-transition` is the only exception) declare a non-existent main file (e.g. `block-transition.jsx` or `chess-grid-transition.jsx`) inside their `package.json`, packaging empty files to NPM.

### Medium

- **File Schema & Entry Drift (`chess-grid-transition`):** The documentation app page imports the layout directly from a Capitalized JSX file (`ChessGridTransition.jsx`) instead of using the registry-provided `index.jsx` entry point, leaving the main `index.jsx` entry point entirely dead and untested.

## Best practices to standardize

1. **Standardize index.jsx Entry Points:** Ensure package.json files map the `"main"` entry to `index.jsx`.
2. **Align Demo imports with Registry Entry Targets:** Update documentation site pages to import transition layouts from `index.jsx` rather than direct subdirectory files, testing the actual registry code path.

## Prioritized list of improvements

1. **Fix package.json Entry Points (P0):** Instantly redirect package entries to `index.jsx` to enable packaging.
2. **Fix Demo imports (P1):** Align imports inside `apps/docs/` to target `index.jsx` entry points.

## Score distribution table

| Component Slug | Score | Severity | Main Defect |
| :--- | :---: | :---: | :--- |
| `block-transition` | 10.0/10 | High | Broken package.json entry point |
| `chess-grid-transition` | 8.0/10 | High | Missing index import in docs site |
| `page-flip-transition` | 10.0/10 | High | Broken package.json entry point |
| `pixel-transition` | 10.0/10 | High | Broken package.json entry point |
| `radial-slice-transition`| 10.0/10 | Low | Pristine (correct package.json) |
| `svg-brush-transition` | 9.0/10 | High | Broken package.json entry point |\n