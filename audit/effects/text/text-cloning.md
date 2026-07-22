# text-cloning (text)

## Summary

Text Cloning is a high-fidelity 2D canvas effect that duplicates text strings into stacked 3D spatial depth-clones, offsetting them dynamically via mouse parallax. It also features a star-field background. It is highly complex but has a High-severity issue: it runs a continuous, un-suspended `requestAnimationFrame` loop on canvas rendering regardless of viewport visibility.

## Implementation overview

- **`index.jsx`** — Main file setting up the HTML5 2D canvas and executing frame draws for the floating stars and parallax offsets.

## Strengths

- Exceptional 3D spatial illusion and highly polished canvas rendering.
- Proper canvas context cleanup on unmount.

## Risks and issues

1. **[High] Raw un-suspended animation loop.** Canvas render cycles run constantly in [index.jsx#L90](../../../registry/effects/text/text-cloning/index.jsx) without Checking if the element is offscreen, which can severely deplete mobile device battery.

## Accessibility assessment

- Text content on canvas is completely invisible to screen readers unless mirrored in a hidden DOM element. The component mirrors this, but lacks an explicit `aria-label` connection.

## Performance assessment

- Rendering stars and cloned text layers on 2D canvas on every tick consumes high processing threads.

## SEO and content-surface assessment

- Safe as long as the backup DOM elements are crawled, but canvas text itself is unindexed.

## Responsive / mobile / touch behavior assessment

- Parallax offsets fall back gracefully on static frames for touch devices, but drawing loops can still run.

## Maintainability and code-quality assessment

- Complex mathematical offsets. Well-organized but difficult to modify without strong canvas experience.

## Security and dependency concerns

- Fully secure.

## Browser compatibility considerations

- Canvas 2D is baseline-supported on all modern devices.

## What was checked and found clean

- Parallax math handles are fully tested.

## Suggested improvements and remediation priorities

1. **(High)** Integrate `createSuspendedRaf` or an `IntersectionObserver` to pause canvas animations when off-screen.

## Final score: 7/10
## Overall severity label: High
