# buttons — Category Report

## Category overview

The `buttons` category in the Hyperiux Vault registry comprises 7 high-quality, interactive button and toggle components: `registry/effects/buttons/{animated-toggle,arrow-fill-button,char-stagger-button,char-stagger-primary-button,dot-fill-button,link-button,scramble-link-button}`. 
These components are primarily client-side UI interactive elements designed to provide rich, micro-animated feedback on hover and tap. They do not employ heavy Canvas or WebGL renderers and therefore lack continuous `requestAnimationFrame` loops (and are outside the F-042 suspension rollout scope). However, the audit revealed systematic packaging defects, documentation-drift issues, and mobile/touch interaction bugs that significantly impact their production viability and developer experience.

## Common patterns across its effects

- **Dependency-Free or Exceptionally Lightweight Animation:** None of the components in this category import GSAP, Framer Motion, or any other external animation library. All transitions are driven via standard CSS transitions or inline React style mutations based on state hooks, keeping bundle size minimal.
- **Next.js-Native Navigation:** Button components that function as navigation links correctly wrap their elements with `next/link` (e.g., `link-button`, `char-stagger-button`, `scramble-link-button`), conforming to `CODING_STANDARDS.md` §5.
- **Symmetric Cleanup and Ref-driven Events:** Resize listeners and touch event handlers are regularly implemented as named functions and cleaned up symmetrically inside `useEffect` or `useLayoutEffect` hooks, avoiding event leaks.
- **No Hardcoded Colors in Advanced Styles:** Most of the buttons correctly use `currentColor` or dynamic tailwind colors to support seamless dark/light mode themes, keeping with `CODING_STANDARDS.md` core principles.
- **Unicode-Safe String Manipulation:** Components that split text labels into characters (e.g., `char-stagger-button`, `scramble-link-button`) use Unicode-safe array spreads (`[...text]`) rather than `.split("")`, ensuring multi-byte characters and emoji do not crash or render incorrectly.

## Repeated issues

### Critical

- **Zero-Code npm Tarballs (Repo-wide Packaging Defect):** Every single button's `package.json` contains a mismatched `"files"` list or `"main"` property pointing to a nonexistent `{slug}.jsx` file instead of `index.jsx` (e.g., `link-button.jsx` instead of `index.jsx` in `link-button`). As a result, the packaged npm tarballs in `registry/dist/` are entirely empty of executable component code—shipping only the `package.json` and `registry.json`.
- **Conflict of Inline Styles and Tailwind Classes (`animated-toggle`):** Inline style mutations override Tailwind class selectors due to CSS specificity. In `animated-toggle`, applying `style={{ transform: ... }}` directly conflicts with and completely disables the hover transitions (`hover:rotate-180`), breaking the advertised hover behavior.

### High

- **Stale and Drifting Live Demos:** The live preview pages under `apps/docs/src/app/(marketing)/demo/<slug>/page.js` render a duplicate copy of the component from `apps/docs/src/components/<slug>/index.jsx` rather than importing from the `registry/` source. This has caused severe behavioral and visual drift:
  - `link-button` still carries a visual scale bug (`scale-150`) in the demo that was supposedly fixed in registry v1.0.1.
  - `char-stagger-button` demo uses a different prop API (`text`) than the registry source (`btnText`), which means swapping the source directly would break the demo.
- **Broken Mobile/Touch Interaction Gestures:** Hover effects on mobile are frequently approximated via touch handlers, but the logic is flawed. For example, in `char-stagger-button`, the "touch-to-preview" gesture never actually prevents the default `Link` navigation behavior, making the hover stagger effect completely unreachable/unviewable on actual touch devices as they navigate away instantly.

### Medium

- **Missing `prefers-reduced-motion` Guards:** None of the 7 button effects respect the user's OS-level motion reduction preferences. Staggers, scrambles, fills, and rotations run at full speed for all users.
- **Accessibility Gaps (Missing Labels and States):** 
  - `animated-toggle` ships buttons with no accessible names (empty icon-only tags) and lacks `aria-pressed` state attributes.
  - `link-button` uses screen-reader-only text that announces raw, unformatted `href` strings (e.g., "About #").

### Low

- **Decorative Header Comment Dividers:** Five out of the seven button components violate `CODING_STANDARDS.md` §1 by using Unicode box-drawing character strings (`───────`) to demarcate sections in their files.
- **Unthrottled Event Listeners:** Resize handlers attached to `window` are bound without any debounce or throttle mechanisms.

## Best practices to standardize

1. **Unify Entry Points to `index.jsx`:** Standardize all component entry points on `index.jsx` to prevent the packaging template from dropping source files during `npm pack`.
2. **Abstract Hover/Tap via Standard CSS Custom Properties:** To prevent inline-style overrides of `:hover` classes (as in `animated-toggle`), use CSS variables (e.g., `style={{ '--rotation-angle': active ? '180deg' : '0deg' }}`) and map them to Tailwind or standard CSS classes.
3. **Always Declare `aria-label` and `aria-pressed` for Icon-only Controls:** Ensure any interactive element that lacks visible text content is supplied with a descriptive, localized accessible name and tracks toggle state programmatically.
4. **Implement Global Motion Reduction Utility:** Create a simple CSS or JS utility that shuts off transitions and staggers globally when `(prefers-reduced-motion: reduce)` matches.

## Prioritized list of improvements

1. **Correct all `package.json` configurations:** Update `"main"` and `"files"` to point directly at `index.jsx` and any helper files across all button directories to restore working npm tarballs.
2. **Reconcile Demo Imports with Registry Source:** Refactor the docs demo pages to import directly from `registry/effects/...` instead of legacy duplicate folders inside `apps/docs/src/components/`, ensuring live previews reflect real shipped code.
3. **Fix the CSS Inline Style conflicts in `animated-toggle`:** Rebuild the rotation hover styles using a class-based transition or a CSS custom property rather than conflicting inline transforms.
4. **Resolve Touch Gesture Navigation Hijacks:** In touch handlers, ensure `event.preventDefault()` is correctly called to allow mobile users to preview stagger/fill animations before navigating.
5. **Add standard A11y attributes:** Inject proper `aria-label` text and `aria-pressed`/`aria-expanded` attributes on all decorative toggles and icon-only click targets.

## Score distribution table

| Effect | Score | Severity | One-Line Summary |
|---|---|---|---|
| `animated-toggle` | 4.0/10 | Critical | Pure-CSS toggles with zero-code npm tarball, dead hover effects due to style conflict, and missing accessible names/states. |
| `arrow-fill-button` | 5.5/10 | High | SVG arrow slide-over effect with empty npm tarball, unthrottled resize listeners, and missing prefers-reduced-motion. |
| `char-stagger-button` | 5.0/10 | Critical | Staggered character translate on hover, empty npm tarball, unreachable touch preview, and severe API drift in docs demo. |
| `char-stagger-primary-button` | 6.0/10 | High | Premium char-stagger button layout, empty npm tarball, missing motion-reduction guard, and legacy docs copy drift. |
| `dot-fill-button` | 5.0/10 | Critical | Radial expansion hover effect, empty npm tarball, touch navigation conflicts, and missing prefers-reduced-motion. |
| `link-button` | 6.0/10 | High | Text link with rotating icon, empty npm tarball, unthrottled resize, screen-reader raw href announcements, and live-demo scale bug. |
| `scramble-link-button` | 5.5/10 | High | Text scramble transition, empty npm tarball, unthrottled interval, and lack of motion reduction flags. |
