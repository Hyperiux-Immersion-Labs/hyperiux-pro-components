# glitchy-text (text)

## Summary

Glitchy Text is a creative typography effect that uses GSAP SplitText to separate text into character layers (white and yellow), stagger-animating them on delayed intervals to simulate a chromatic aberration aberration on-demand. The implementation is highly structured and contains zero drift between the registry and production copies. The primary gap is a Medium-severity lack of prefers-reduced-motion checking.

## Implementation overview

- **`index.jsx`** — Splices text into characters using GSAP SplitText, building overlapping absolute layouts and triggering timeline execution on click/hover.
- **`package.json`** — Declares dependency on `"gsap": "*"`.

## Strengths

- Extremely clean layout locking to prevent layout shifts during character splitting.
- Visually stunning chromatic aberration effect with highly synchronized stagger delays.

## Risks and issues

1. **[Medium] No reduced motion handling.** The intense flickering and rapid shifting characters in [index.jsx#L50](../../../registry/effects/text/glitchy-text/index.jsx) play continuously without checking if the user prefers reduced motion, which violates accessibility standards for vestibular motion disorders.

## Accessibility assessment

- Fails to respect system-level animation preferences.
- Reads correctly via screen readers as the underlying text content is mirrored in hidden aria labels, though aria attributes could be streamlined further.

## Performance assessment

- Uses GSAP context for clean garbage collection of memory.
- Multiple absolute layered layouts can cause minor render overhead if applied to paragraphs, but is fine for titles.

## SEO and content-surface assessment

- Normal crawlable structure, search engines can read the content correctly.

## Responsive / mobile / touch behavior assessment

- Excellent touch device safety: works on button tap rather than requiring hovering.
- Spacing scales nicely with viewport widths.

## Maintainability and code-quality assessment

- No drift detected. Code adheres fully to standard style guides.

## Security and dependency concerns

- Relies on standard commercial GSAP library. Safe and sandboxed.

## Browser compatibility considerations

- Baseline compatible with all modern browsers.

## What was checked and found clean

- Memory leak cleanup via `ctx.revert()` inside `useEffect` is properly implemented.
- `registry.json` is verified and matches the local directory perfectly.

## Suggested improvements and remediation priorities

1. **(Medium)** Wrap the timeline execution inside a `matchMedia` query or check system `prefers-reduced-motion` to skip the glitch animation and directly show final text.

## Final score: 8/10
## Overall severity label: Medium
