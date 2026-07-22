# perspective-text-reveal (text)

## Summary

Perspective Text Reveal uses 3D space rotation to flip text lines into view on scroll. It offers a premium cinematic look, has zero drift, and is highly robust. However, it lacks a prefers-reduced-motion check.

## Implementation overview

- **`index.jsx`** — Standard entry point splitting characters and rotating them on the X-axis in 3D perspective space via GSAP.

## Strengths

- Unique 3D flip aesthetic that elevates hero banners.
- Clean use of CSS perspective containers.

## Risks and issues

1. **[Medium] Vestibular-unsafe motion.** Heavy 3D rotations can trigger vertigo if system-level animation reduction requests are ignored.

## Accessibility assessment

- Motion gating is missing. Otherwise, text structures are fully standard.

## Performance assessment

- Uses standard CSS 3D transforms which are composited off-thread on most mobile browsers.

## SEO and content-surface assessment

- Fully indexable.

## Responsive / mobile / touch behavior assessment

- Works nicely on touch gestures and matches responsive layout structures.

## Maintainability and code-quality assessment

- Well-written, zero drift, neat formatting.

## Security and dependency concerns

- Fully secure.

## Browser compatibility considerations

- Depends on CSS `perspective` and `transform-style: preserve-3d`, which are baseline compatible in all modern browsers.

## What was checked and found clean

- Tested timeline unregistering and metadata validations.

## Suggested improvements and remediation priorities

1. **(Medium)** Toggle 3D rotations off if reduced-motion preferences are found active.

## Final score: 8/10
## Overall severity label: Medium
