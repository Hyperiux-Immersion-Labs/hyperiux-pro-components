# rope-cursor (cursor)

## Summary

SVG-driven trailing rope cursor that lags behind pointer coordinates. However, inside a requestAnimationFrame loop, it calls `gsap.to` for all rope segments on EVERY single frame! This creates hundreds of new GSAP tweens per second, causing massive garbage collection pressure and heavy CPU thrashing.

## Implementation overview

- **`index.jsx`** — SVG rope path definitions, mouse coordinates capture, and rAF drawing loops.

## Strengths

- Highly smooth bezier curve SVG drawings.
- Proper unmount detaching of event handlers and frame timers.

## Risks and issues

1. **[High] Heavy GSAP Tweens on Every Frame.** Inside a requestAnimationFrame loop, it calls `gsap.to` for all rope segments on EVERY frame! This creates hundreds of new tweens per second, causing massive garbage collection pressure and heavy CPU thrashing.

## Accessibility assessment

- SVG path is decorative; hidden from keyboard users.

## Performance assessment

- Continuous GSAP tween instantiation on every frame creates very high memory allocations and CPU overhead.

## SEO and content-surface assessment

- Decorative custom cursor.

## Responsive / mobile / touch behavior assessment

- Disables layout rendering on mobile screens cleanly.

## Maintainability and code-quality assessment

- Mixing gsap.to animations inside rAF logic results in confusing, hard-to-maintain codebase.

## Security and dependency concerns

- Pristine.

## Browser compatibility considerations

- Supported by all major SVG capable browsers.

## What was checked and found clean

- Properly cleans up mousemove listener.

## Suggested improvements and remediation priorities

1. Refactor rope segment physics to use basic velocity spring formula or Verlet integration in pure JS (which is completely free of GC allocations) instead of initiating GSAP tweens on every frame.

## Final score: 6/10
## Overall severity label: High
