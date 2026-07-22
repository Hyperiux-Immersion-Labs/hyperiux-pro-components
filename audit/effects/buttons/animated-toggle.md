# animated-toggle (buttons)

## Summary

`animated-toggle` is a pure-CSS, dependency-free set of three icon toggle buttons (`ChevronBird`, `Cross`, `Plus`) composed together in a single demo component (`AnimatedToggle`). The registry metadata, file layout, and docs-site/registry source parity are all clean and correctly wired. However the audit surfaced two functionality-breaking defects: the npm distribution tarball for this component ships with zero component source code (only `package.json` + `registry.json`), and the hover interaction the demo page explicitly advertises never fires for two of the three icons because of a CSS inline-style/class conflict. There is also a real accessibility gap (no accessible name or `aria-pressed` state on any of the three buttons) and two documented-convention violations (no `className` prop, hardcoded colors).

## Implementation overview

- [`index.jsx`](../../../registry/effects/buttons/animated-toggle/index.jsx) — client component, default export `AnimatedToggle`. Holds three independent `useState` booleans (`chevronActive`, `crossActive`, `plusActive`) and renders three `<button>` elements, each toggling its own boolean on click and passing `isActive` down to one of the three icon sub-components. All styling is Tailwind utility classes plus `transition-all duration-300`.
- [`ChevronBird.jsx`](../../../registry/effects/buttons/animated-toggle/ChevronBird.jsx) — two SVG `<path>` "wings" that rotate via inline `style.transform`, driven by `isActive`. `aria-hidden="true"` on the `<svg>`.
- [`Cross.jsx`](../../../registry/effects/buttons/animated-toggle/Cross.jsx) — a plus-shaped icon built from two absolutely-positioned `<span>` bars inside a `<div>` that rotates via inline `style.transform` between 180deg/315deg depending on `isActive`, animating a "+" into an "X".
- [`Plus.jsx`](../../../registry/effects/buttons/animated-toggle/Plus.jsx) — same bar-pair pattern as `Cross.jsx`, rotating the second bar between 90deg/180deg to animate "+" into "−"/open state.
- No `useEffect`, no `requestAnimationFrame`, no external event listeners anywhere in the four source files — animation is 100% CSS `transition` + inline `transform` swaps driven by React state.

## Strengths

- Zero runtime dependencies (`registry/effects/buttons/animated-toggle/package.json#L14` — `"dependencies": {}`), pure CSS/SVG.
- Registry source (`registry/effects/buttons/animated-toggle/`) and the docs-site working copy (`apps/docs/src/components/animated-toggle/`) are byte-identical across all four files — verified with `diff`, no drift.
- `registry.json` is internally consistent and schema-complete (see Risks section — no issues found there).
- Simple, readable state model — one boolean per toggle, no shared/global state, easy to reason about.
- Self-contained default prop values (`isActive = false`, `size = 24`, etc.) on every sub-component.

## Risks and issues

### 1. Critical — npm-distributed package contains no component code
[`registry/effects/buttons/animated-toggle/package.json#L5-9`](../../../registry/effects/buttons/animated-toggle/package.json#L5-9) sets `"main": "animated-toggle.jsx"` and `"files": ["animated-toggle.jsx", "registry.json"]`. No file named `animated-toggle.jsx` exists in the folder — the real entry point is `index.jsx` (confirmed via `ls`/`find` on the directory). Running `npm pack --dry-run` in the component folder produces a tarball containing only `package.json` and `registry.json` — `index.jsx`, `ChevronBird.jsx`, `Cross.jsx`, and `Plus.jsx` are all excluded. This is not hypothetical: the tarball already published to the repo at `registry/dist/hyperiux-animated-toggle-0.0.1.tgz` was inspected directly (`tar -tzf`) and contains exactly `package/package.json` and `package/registry.json` — no component source at all. Anyone installing `@hyperiux/animated-toggle` via this tarball gets a package with no usable component. This is a repo-wide pattern (the same `npm pack --dry-run` check against `dot-fill-button` reproduces identically), so it is not unique to this effect, but it is a real, already-shipped defect for this component specifically.

### 2. Critical — Hover effect promised by the demo copy is dead for Cross and Plus
[`registry/effects/buttons/animated-toggle/Cross.jsx#L9-12`](../../../registry/effects/buttons/animated-toggle/Cross.jsx#L9-12) and [`registry/effects/buttons/animated-toggle/Plus.jsx#L9-12`](../../../registry/effects/buttons/animated-toggle/Plus.jsx#L9-12) put both a Tailwind hover class (`hover:rotate-180 group-hover:rotate-180`) and an inline `style={{ transform: isActive ? '...' : '...' }}` on the *same* `<div>`. Per the CSS cascade, an inline `style` declaration always wins over any non-`!important` rule from an external/embedded stylesheet, regardless of selector specificity — including `:hover`/`group-hover` pseudo-classes. Confirmed no Tailwind `important` mode is configured for this app (no `tailwind.config.*` file with an `important` flag found, and no `!important` present anywhere in `Cross.jsx`/`Plus.jsx`). The practical effect: hovering the Cross or Plus button never rotates the icon — only clicking (which changes `isActive` and thus the inline style) has any visual effect. This directly contradicts the demo page's own copy at [`apps/docs/src/app/(marketing)/demo/animated-toggle/page.js#L20-21`](<../../../apps/docs/src/app/(marketing)/demo/animated-toggle/page.js#L20-21>): *"Hover over and click to see the effect for hovered and active state of the toggles below."* `ChevronBird.jsx` is unaffected — its `group-hover` classes (passed in via `className` from `index.jsx#L18`) live on the outer wrapper `<div>` in [`ChevronBird.jsx#L10`](../../../registry/effects/buttons/animated-toggle/ChevronBird.jsx#L10), a separate element from the `<path>` nodes that carry the inline `isActive` transform, so no conflict occurs there.
**Confidence note:** this is derived from static code inspection plus deterministic CSS cascade rules (inline style beats non-`!important` external rules universally, per the CSS Cascading and Inheritance spec), not from a live-rendered screenshot — an attempt to verify in the browser tool timed out during this audit, so treat the CSS-mechanics reasoning as the evidence, not a visual confirmation.

### 3. High — No accessible name or toggle state on any of the three buttons
[`registry/effects/buttons/animated-toggle/index.jsx#L13-34`](../../../registry/effects/buttons/animated-toggle/index.jsx#L13-34): all three `<button>` elements have no `aria-label`, no visible text content, and no `aria-pressed`. Their only children are either an `aria-hidden="true"` SVG ([`ChevronBird.jsx#L16`](../../../registry/effects/buttons/animated-toggle/ChevronBird.jsx#L16)) or bar `<span>`s with no text (`Cross.jsx`, `Plus.jsx`). Per WCAG 4.1.2 (Name, Role, Value), an interactive control must expose a programmatically determinable accessible name — here none of the three buttons has one, so a screen reader announces only "button" with no indication of purpose. None of them set `aria-pressed={...Active}` either, so even AT that can inspect toggle-button state has nothing to read. This blocks screen-reader users from understanding or operating the component's core (and only) functionality.

### 4. Medium — Root component does not accept a `className` prop
[`developer-new-component.md`](../../../developer-new-component.md) Step 1 code rules explicitly state: *"Accept a `className` prop so users can override styles."* [`registry/effects/buttons/animated-toggle/index.jsx#L7`](../../../registry/effects/buttons/animated-toggle/index.jsx#L7) — `const AnimatedToggle = () => { ... }` — takes no props at all. Consumers cannot override the outer wrapper's `flex gap-8 justify-center` layout or otherwise restyle the component without editing the installed source directly.

### 5. Medium — Hardcoded, non-configurable colors
`developer-new-component.md` Step 1 also states: *"No hardcoded colors - use props with sensible defaults."* [`registry/effects/buttons/animated-toggle/index.jsx#L15`](../../../registry/effects/buttons/animated-toggle/index.jsx#L15), [`#L25`](../../../registry/effects/buttons/animated-toggle/index.jsx#L25), [`#L31`](../../../registry/effects/buttons/animated-toggle/index.jsx#L31) hardcode the active-state background as the literal `bg-[#ff5f00]` and the inactive state as `bg-zinc-400`, with no prop or CSS variable to override either — every consumer gets the same brand-orange baked in.

### 6. Medium — No `prefers-reduced-motion` handling
None of the four source files reference `prefers-reduced-motion` or `useReducedMotion` (confirmed via `grep`). All transform/rotation transitions (`duration-300`/`duration-[0.32s]`) run unconditionally for all users, including those with a documented vestibular-motion preference set at the OS level.

### 7. Low — Inconsistent, non-configurable icon sizing
[`registry/effects/buttons/animated-toggle/index.jsx#L19`](../../../registry/effects/buttons/animated-toggle/index.jsx#L19) passes `size={32}` to `ChevronBird` while `Cross` ([`#L27`](../../../registry/effects/buttons/animated-toggle/index.jsx#L27)) and `Plus` ([`#L33`](../../../registry/effects/buttons/animated-toggle/index.jsx#L33)) get `size={24}` — no comment explains the asymmetry, and `AnimatedToggle` exposes no size prop for consumers to adjust uniformly.

## Accessibility assessment

- **Keyboard:** native `<button>` elements are used, so Tab/Enter/Space activation works out of the box — no issue here.
- **Screen reader / accessible name:** Fails. See Risk #3 (High) — none of the three buttons has a discoverable name.
- **State exposure:** Fails. No `aria-pressed` on any toggle, so the on/off state is only visible, never programmatically exposed.
- **Focus visibility:** relies on browser default focus ring (no custom `:focus-visible` styling and no `outline-none` override found) — acceptable, not flagged as an issue.
- **Reduced motion:** Absent — see Risk #6 (Medium).

## Performance assessment

- No `requestAnimationFrame` loop, no `useEffect`, no listeners — nothing to suspend when off-screen or tab-hidden. Per the audit brief, `buttons` was out of scope for the F-042 rAF-suspension rollout (`registry/effects/_shared/README.md`), and this component has no continuous rAF loop to suspend in the first place, so the rAF-suspension check does not apply here — confirmed clean, not a finding.
- All animation is CSS `transition`, which is GPU/compositor-friendly and cheap; three independent `useState` booleans mean each click only re-renders the one affected button's subtree (React state is per-button, not lifted), so no unnecessary re-render fan-out.

## SEO and content-surface assessment

Not applicable in any meaningful way — this is a purely interactive, client-rendered (`"use client"`) icon-toggle widget with no text content, headings, or metadata surface of its own. The demo page around it (`page.js`) supplies its own `<h1>`/`<p>` and `generateMetadata()`; the component itself contributes nothing indexable and nothing that could regress SEO.

## Responsive / mobile / touch behavior assessment

- [`registry/effects/buttons/animated-toggle/index.jsx#L15,25,31`](../../../registry/effects/buttons/animated-toggle/index.jsx#L15) uses `size-24 max-sm:size-18` so buttons shrink on small screens (96px → 72px) — reasonable, meets the 44px+ touch-target minimum comfortably.
- `active:scale-90` gives touch users the same "pressed" affordance a `:hover` would give mouse users on desktop, which partially compensates for the fact hover states don't exist meaningfully on touch devices — good defensive pattern, though it does not offset Risk #2 (hover being dead on desktop for two icons).
- No explicit `touch-action` or tap-highlight handling, but nothing here needs it — standard `<button>` tap behavior is sufficient.

## Maintainability and code-quality assessment

- File structure roughly follows `CODING_STANDARDS.md`'s expected top-to-bottom order (client directive → imports → component), but the components are very short so most of the standard's sections (constants, section comments) don't apply.
- `Cross.jsx` and `Plus.jsx` have inconsistent/compressed indentation (e.g. [`Cross.jsx#L8-20`](../../../registry/effects/buttons/animated-toggle/Cross.jsx#L8-20) uses 1-space indent) versus `ChevronBird.jsx`'s 4-space indent and `index.jsx`'s 2-space indent — a minor stylistic inconsistency within the same effect (Low, folded into general polish, not separately numbered above since `CODING_STANDARDS.md` doesn't prescribe a specific indent width).
- Naming is clear (`chevronActive`, `crossActive`, `plusActive` — boolean-as-question style matches `CODING_STANDARDS.md` §2 convention).
- No dead variables, no leftover `console.log`, no commented-out code.

## Security and dependency concerns

- No dependencies (`registry/effects/buttons/animated-toggle/package.json#L14`), no `dangerouslySetInnerHTML`, no user-supplied strings rendered anywhere, no secrets/tokens in source. Nothing found.

## Browser compatibility considerations

- Uses only standard CSS `transform`/`transition`, SVG, and `transformBox: 'view-box'` ([`ChevronBird.jsx#L29,41`](../../../registry/effects/buttons/animated-toggle/ChevronBird.jsx#L29)). `transform-box: view-box` has broad modern-browser support (Chrome 64+, Firefox 55+, Safari 11+) — no concern for the project's likely target matrix, but it will silently no-op the custom rotation origin on any legacy browser that doesn't support it (graceful degradation to the SVG's default transform origin, not a hard break).

## What was checked and found clean

- `registry.json` schema completeness against `developer-new-component.md`: `name` matches folder (`animated-toggle`) ✓, `type` is `"registry:component"` ✓, `category` is exactly `"buttons"` ✓, `main` (`index.jsx`) exists ✓, `tier` is a valid value (`"pro"`) ✓, `previewUrl` (`/demo/animated-toggle`) matches the actual demo route folder ✓, every file under the registry folder (`index.jsx`, `ChevronBird.jsx`, `Cross.jsx`, `Plus.jsx`) is listed in the `files` array with a correct `target` ✓, `exportName`/`exportKind` (`AnimatedToggle`/`default`) match the actual export in `index.jsx#L38` ✓.
- Registry source vs. docs-site working copy (`apps/docs/src/components/animated-toggle/`): byte-identical across all four files (`diff` returned no output) — no slug/naming drift.
- Generated public mirror `apps/docs/public/r/animated-toggle.json`: matches the pro-tier pattern used across all sibling `buttons` effects (no embedded `code` field for pro tier, `target` rewritten to `components/hyperiux/*.jsx`) — verified this is the standard, repo-wide build-script output shape by comparing against `dot-fill-button`'s public mirror, not a defect specific to this component.
- Cleanup on unmount: not applicable — no `useEffect`, no listeners, no rAF to clean up. Nothing to leak.
- rAF-suspension pattern: not applicable — no continuous `requestAnimationFrame` loop exists in this component (confirmed via `grep`), and `buttons` was explicitly out of scope for the F-042 rollout per `registry/effects/_shared/README.md`.

## Suggested improvements and remediation priorities

No code was changed as part of this audit. If addressed, in priority order:
1. Fix `package.json` `main`/`files` to reference `index.jsx` (and include the sub-component files) so `npm pack` produces a working tarball — likely a fix needed across all `buttons` effects, not just this one, given the identical pattern reproduced in `dot-fill-button`.
2. Remove the dead `hover:rotate-180`/`group-hover:rotate-180` classes from `Cross.jsx`/`Plus.jsx` (they can never fire) and reimplement the intended hover rotation using a CSS custom property or a class-driven transform instead of a competing inline style, so hover actually works as the demo copy promises. Any fix must preserve the existing click/active-state animation and not regress the `active:scale-90` touch affordance (per `CHANGE_GUIDELINES.md` — not verifying UI/responsiveness beyond that here).
3. Add `aria-label` (e.g. "Toggle chevron", "Toggle cross", "Toggle plus" or similar descriptive names) and `aria-pressed={xActive}` to each of the three buttons in `index.jsx`.
4. Accept and forward a `className` prop on `AnimatedToggle`, and consider exposing the active/inactive colors as props with the current values as defaults, per `developer-new-component.md`'s documented code rules.
5. Add `prefers-reduced-motion` handling (e.g. reduce/remove the rotate/translate transitions when the media query is set).

## Final score: 4/10

## Overall severity label: Critical
