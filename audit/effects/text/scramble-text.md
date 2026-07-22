# scramble-text (text)

## Summary

Scramble Text provides a cyberpunk hacker-style scrambling text transition. It is highly creative but has multiple High-severity issues: it initiates a raw `requestAnimationFrame` call inside a Promise block that is never cancelled during component unmounts, and lacks handles for prefers-reduced-motion.

## Implementation overview

- **`index.jsx`** — Main code that initiates the font loading checks and utilizes ScrambleTextPlugin inside GSAP to shuffle letters.

## Strengths

- Highly authentic cyberpunk glitch look.
- Uses font checks before splitting to avoid layout shifting.

## Risks and issues

1. **[High] Raw `requestAnimationFrame` leak.** In [index.jsx#L38](../../../registry/effects/text/scramble-text/index.jsx), a raw requestAnimationFrame is triggered inside a Promise to delay the loading phase. This animation frame is never recorded or cancelled if the component unmounts quickly, leading to potential memory leaks.
2. **[Medium] Missing prefers-reduced-motion.** Rapid shuffling of characters is highly flickering and visually intensive, presenting a barrier for motion-sensitive viewers.
3. **[Low] Uncancelled timeline callbacks.** Some inner state triggers do not check component unmount state before firing callbacks.

## Accessibility assessment

- High flicker rating. Unsafe for users with visual seizure histories or vestibular disorders unless motion is turned off.

## Performance assessment

- Rapid text innerContent updates are heavy on DOM calculations.

## SEO and content-surface assessment

- Normal SEO crawlability.

## Responsive / mobile / touch behavior assessment

- Works nicely across mobile, though flickering can reduce battery life if left active.

## Maintainability and code-quality assessment

- Moderate readability. Code can be optimized by replacing the raw RAF delay with standard GSAP delayed calls.

## Security and dependency concerns

- No custom scripts injection.

## Browser compatibility considerations

- Baseline compatible.

## What was checked and found clean

- Tested basic timeline unregister routines.

## Suggested improvements and remediation priorities

1. **(High)** Cancel the pending `requestAnimationFrame` if the component unmounts during the font load setup phase.
2. **(Medium)** Replace character scrambling with a standard text fade-in if the user prefers reduced motion.

## Final score: 6/10
## Overall severity label: High
