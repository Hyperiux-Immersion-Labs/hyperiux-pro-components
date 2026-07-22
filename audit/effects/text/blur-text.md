# blur-text (text)

## Summary

Blur Text is an elegant, scroll-triggered text-reveal animation component that animates individual characters, words, or lines from a blurred, faded state into focus. Built with Framer Motion, it offers highly performant rendering. However, it suffers from a Medium-severity gap: a complete lack of `prefers-reduced-motion` checking, meaning users who request reduced motion will still see the intensive blur and opacity transition sweep across their screen. Additionally, there is a minor file structure drift between the registry copy (which imports from `"framer-motion"`) and the production site copy (which imports from `"motion/react"` and has a customizable `once` prop).

## Implementation overview

- **`index.jsx`** — The entry point for the component. It uses `useInView` and Framer Motion's `motion` elements to coordinate character/word animation sweeps.
- **`package.json`** — Defines dependencies on `framer-motion` (though `@hyperiux/blur-text` version is `0.0.1`).
- **`registry.json`** — Standard component registration metadata mapping files and `importPath` to `src/components/effects/blur-text`.

## Strengths

- Highly modular character-splitting logic allows animating by characters or words seamlessly.
- Great use of `useInView` with configurable margins (`-100px`) to prevent animation from firing prematurely before entering the viewport.
- Clean prop interface with support for custom class names, delays, and animation presets ("fade", "slide", "zoom").

## Risks and issues

1. **[Medium] Lack of `prefers-reduced-motion` integration.** In [index.jsx#L20](../../../registry/effects/text/blur-text/index.jsx), the animations run unconditionally. On devices where users have enabled the reduced-motion setting, large-scale blurring and sweeping transitions can cause disorientation.
2. **[Low] Import path drift.** The registry code imports from `framer-motion` while the docs application copy imports from `motion/react`, which is the newer, lightweight package. This causes inconsistency.
3. **[Low] Prop behavior drift.** In the registry version, `once: true` is hardcoded inside the `useInView` hook, while the production version supports a customizable `once` prop.

## Accessibility assessment

- Unsafe for motion-sensitive users as there is no `@media (prefers-reduced-motion: reduce)` handler or Framer Motion `useReducedMotion` hook checking.
- Text content is properly split into inline blocks but preserves correct screen reader announcements since the split text doesn't modify the main content structure.

## Performance assessment

- Utilizes hardware-accelerated CSS filters (`blur`) which can occasionally cause high paint costs on older mobile GPUs.
- Clean lifecycle management: standard Framer Motion animations cleanup automatically on unmount.

## SEO and content-surface assessment

- SEO-friendly: The raw text remains fully crawlable in the DOM since no JS-based string destruction is applied before hydration.

## Responsive / mobile / touch behavior assessment

- Responsive layouts are handled cleanly using normal flex/grid wrappers. No layout breaks detected.
- Large blur animations can lag on low-end mobile devices due to the heavy GPU processing required for filter effects.

## Maintainability and code-quality assessment

- The code is well-structured and uses clear prop-types. Spacing is consistent and follow standard React styling rules.

## Security and dependency concerns

- Clean dependencies, referencing only `framer-motion` or `motion/react`. No untrusted third-party scripts.

## Browser compatibility considerations

- Uses CSS `filter: blur(...)` and `clip-path`, which are supported by all modern evergreen browsers (Chrome 76+, Safari 13+, Firefox 68+).

## What was checked and found clean

- Validated metadata consistency in `registry.json`.
- The `previewUrl` `/demo/blur-text` resolves correctly in the documentation application.
- Public file `apps/docs/public/r/blur-text.json` exists and matches the registry output format.

## Suggested improvements and remediation priorities

1. **(Medium)** Add Framer Motion's `useReducedMotion` hook to conditionally disable or simplify the blur/fade transition.
2. **(Low)** Sync the registry's imports with the documentation's imports to standardise on `"motion/react"`.
3. **(Low)** Sync the customizable `once` prop from the documentation version back into the registry.

## Final score: 8/10
## Overall severity label: Medium
