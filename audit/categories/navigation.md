# navigation — Category Report

## Category overview

The `navigation` category houses **4 effects** that drive interactive headers, navbar toggles, and immersive menus:
- `directional-menu`
- `elevate-navbar`
- `expanding-navbar`
- `immersive-full-screen-nav`

These components use Framer Motion, GSAP, and keyboard-trap managers to deliver premium navigation experiences. While visually highly responsive, they contain severe registry-drift bugs and packaging errors that threaten workspace compilation.

## Common patterns across its effects

- **Keyboard Focus Management:** Immersive controls (e.g. `immersive-full-screen-nav`) correctly implement keyboard tab traps to keep focus locked inside active headers, conforming to `CODING_STANDARDS.md`.
- **Hybrid GSAP + Framer Motion Animation:** Seamless transitions are animated using standard layout components, providing smooth expansion and retraction on hover.

## Repeated issues

### Critical

- **Mismatched Slug & Stale package.json (`immersive-full-screen-nav`):** The `package.json` declares the package name as `@hyperiux/immersive-full-screen-navigation` instead of `@hyperiux/immersive-full-screen-nav` (slug mismatch). Additionally, the main file lists `char-stagger-button.jsx` (which is a completely different component!) as the entry point, rendering this package fundamentally broken.

### High

- **Empty NPM packaging tarballs (Registry-wide Defect):** `package.json` configurations are broken across `directional-menu`, `elevate-navbar`, and `expanding-navbar`, pointing `"main"` to nonexistent files.

### Medium

- **Inconsistent Capitalization and Component Drift:** Casing differences between `registry/` and `apps/docs/` exist. Some desktop and mobile sub-components are structured with capitalizations that don't match the lowercase directory routes.

## Best practices to standardize

1. **Verify package.json Names and Entry Points:** Ensure package names match the registry folder slug and list `index.jsx` as the entry target.
2. **Align uppercase directories:** Ensure file names and references are fully aligned to prevent cross-platform case-sensitivity compilation errors.

## Prioritized list of improvements

1. **Re-align Immersive Nav package.json (P0):** Fix name mismatch and remove the stale `char-stagger-button.jsx` entry point immediately.
2. **Fix remaining navigation package.json targets (P0):** Align all main entry points to `index.jsx`.
3. **Unify Case-Sensitivity (P1):** Realign and clean lowercase/uppercase folder naming differences.

## Score distribution table

| Component Slug | Score | Severity | Main Defect |
| :--- | :---: | :---: | :--- |
| `directional-menu` | 8.0/10 | High | Broken package.json entry point |
| `elevate-navbar` | 8.0/10 | High | Broken package.json entry point |
| `expanding-navbar` | 8.0/10 | High | Broken package.json entry point |
| `immersive-full-screen-nav` | 6.0/10 | Critical | Stale package.json name and incorrect entry point file |\n