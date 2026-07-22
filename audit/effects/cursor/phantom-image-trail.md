# phantom-image-trail (cursor)

## Summary

Stately cursor image trail spawning and fading stacked graphics as you move. However, it suffers from a major architectural performance bottleneck: `useMouse` calls `setState` in its internal `createSuspendedRaf` loop on every frame. This triggers continuous parent component re-renders, causing React to diff and re-create all image DOM elements 60-120 times/sec.

## Implementation overview

- **`index.jsx`** — Main element containing GSAP timeline animations for fading image nodes.
- **`useMouse.js`** — Tracks coordinates and triggers the continuous re-render loop via state updates.

## Strengths

- Beautiful staggered GSAP timeline fade-out animations.
- Excellent support for mobile touch-to-spawn taps.

## Risks and issues

1. **[High] React State Overhead and Thrashing.** `useMouse` calls `setState` in its internal `createSuspendedRaf` loop on every single frame. This triggers high-frequency parent component re-renders, causing React to diff and re-create all 21 image DOM elements 60-120 times/sec!

## Accessibility assessment

- Fails to support system reduced motion preferences.

## Performance assessment

- Severe CPU overhead and garbage collection spikes from continuous React diffing on every frame.

## SEO and content-surface assessment

- Image alternative texts are fully crawlable.

## Responsive / mobile / touch behavior assessment

- Excellent touch fallbacks and layout boundaries.

## Maintainability and code-quality assessment

- Heavy state-re-rendering makes customization of tracking coordinates prone to layout lag.

## Security and dependency concerns

- Clean dependencies.

## Browser compatibility considerations

- All modern evergreen browsers.

## What was checked and found clean

- Kills GSAP timelines and clears timeouts on unmount correctly.

## Suggested improvements and remediation priorities

1. Refactor `useMouse` to avoid calling `setState` inside its frame loop. Read from mouse references directly inside GSAP animations or edit DOM styles directly via refs.

## Final score: 5/10
## Overall severity label: High
