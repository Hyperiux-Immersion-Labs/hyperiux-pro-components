# spotlight-text (text)

## Summary

Spotlight Text tracks mouse movements to sweep a high-intensity bright text spotlight mask across standard dim text layers. It is highly interactive but features multiple High-severity issues: it runs a raw, un-suspended `requestAnimationFrame` loop to draw cursor positions, and has major code drift between registry and production copies regarding default props, text sizes, and responsive breakpoints.

## Implementation overview

- **`index.jsx`** — Dual-layered text blocks clipped via radial-gradients mapped inside custom mouse coordinate tracking.

## Strengths

- Visually remarkable radial hover highlighting.
- Clean fallback for non-coarse pointer devices.

## Risks and issues

1. **[High] Raw `requestAnimationFrame` loop.** The spotlight tracks mouse movement via continuous RAF ticks in [index.jsx#L70](../../../registry/effects/text/spotlight-text/index.jsx) without wrapping them in suspension gates, consuming processing power in background tabs.
2. **[Medium] Major code drift.** Mismatched text sizes (`max-sm:text-[7vw]!` in production vs standard classes in registry) and differing responsive breakpoints (`max-[1025px]` in registry vs `max-md` in production) exist, leading to layout breaks if copied.

## Accessibility assessment

- Screen readers will encounter double-text issues if overlays are not hidden with aria-hidden tags.
- Gated properly on touch interfaces.

## Performance assessment

- High CPU and layout calculation cost due to continuous clip-path recalculations.

## SEO and content-surface assessment

- Good indexing, text can be read easily by search bots.

## Responsive / mobile / touch behavior assessment

- Breakpoint drift makes standard responsive implementations unstable.

## Maintainability and code-quality assessment

- Moderate. Spacing is decent, but structural drift must be corrected.

## Security and dependency concerns

- Safe.

## Browser compatibility considerations

- Heavily dependent on CSS radial gradient clip-paths.

## What was checked and found clean

- Validated baseline schemas.

## Suggested improvements and remediation priorities

1. **(High)** Wrap spotlight updates inside suspended RAF ticks.
2. **(Medium)** Align code styles and layout classes between folders.

## Final score: 6/10
## Overall severity label: High
