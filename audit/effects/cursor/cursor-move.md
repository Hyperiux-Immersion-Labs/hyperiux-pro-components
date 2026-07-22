# cursor-move (cursor)

## Summary

Custom cursor tracking effect animating variable font weight morphing and linear skew transforms. Includes customizable crosshair coordinates and dot elements. However, updating React state on every single mousemove event creates high-frequency component re-renders of the entire tree, resulting in high CPU usage and garbage collection.

## Implementation overview

- **`index.jsx`** — Main wrapper rendering variable text nodes, crosshairs, and cursor tracking coordinates.
- **`useMousePosition` (hook)** — Tracks client mouse coordinates and triggers ResizeObserver bounds caching.

## Strengths

- Excellent ResizeObserver integration to keep cached bounds accurate during viewport changes.
- Clean font axes variation animation.

## Risks and issues

1. **[Medium] React State Overhead.** Updates React state `setPos` inside the `mousemove` event listener on every move. This triggers rapid, high-frequency React component re-renders of the entire tree, leading to high CPU usage.
2. **[Low] NextJS Font Dependency.** Imports `Inter` from `next/font/google`, restricting usage to NextJS frameworks without manually removing the imports.

## Accessibility assessment

- Crosshair coordinates are set as `aria-live="off"` to avoid screen reader spam, which is correct.

## Performance assessment

- State updates on every mouse move create major garbage collection pressure in React.

## SEO and content-surface assessment

- Text nodes are preserved as raw crawlable HTML.

## Responsive / mobile / touch behavior assessment

- Disables coordinate display on coarse touch screen devices dynamically.

## Maintainability and code-quality assessment

- Clean and easy to understand logic.

## Security and dependency concerns

- Pristine dependency tree.

## Browser compatibility considerations

- Requires browser support for CSS Variable Fonts axes. Supported in all evergreen browsers.

## What was checked and found clean

- Excellent cleanup of listeners and observer instances on unmount.

## Suggested improvements and remediation priorities

1. Replace high-frequency React state updates with direct DOM style ref modifications in mousemove handlers.

## Final score: 8/10
## Overall severity label: Medium
