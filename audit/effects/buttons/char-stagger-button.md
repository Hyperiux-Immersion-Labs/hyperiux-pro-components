# char-stagger-button (buttons)

## Summary

`char-stagger-button` is a `next/link`-wrapped button that splits its label into per-character `<span>`s and staggers a CSS `translateY` reveal on hover/touch, optionally with an underline and a duplicated-icon arrow. The React source itself is clean, dependency-light (only `lucide-react`), and purely CSS/transition-driven (no `requestAnimationFrame` loop, so the rAF-suspension pattern in `registry/effects/_shared/README.md` does not apply). However, the audit surfaced one **verified, repo-confirmed Critical defect**: the packed npm tarball for this component ships with no component source at all. It also has a **High** touch-interaction defect (the mobile "preview before navigate" gesture never actually prevents navigation, so the signature hover animation is effectively unreachable on touch devices) and a **High** documentation-drift issue where the live demo page renders a stale duplicate component (`apps/docs/src/components/char-stagger-button`) with a different prop name (`text`) than the registry source (`btnText`), so the demo does not actually exercise the code that ships via the CLI/registry.

## Implementation overview

- Single-file component: `registry/effects/buttons/char-stagger-button/index.jsx` — no sub-files, confirmed via directory listing (only `index.jsx`, `package.json`, `registry.json` exist).
- Text is rendered server/client-identically as plain text inside `textRef` (good for SEO/no-JS), then a `useEffect` (index.jsx#L55-L75) rewrites it into one `<span>` per character with a per-index `transitionDelay` (`staggerStep`), using `[...sourceText]` (correctly Unicode/surrogate-pair-safe, unlike `.split("")`).
- Hover/active state (`isActive`) drives all visual changes (char stagger, underline scale, color, arrow translate) via direct inline-style mutation in effects, not via CSS classes (index.jsx#L77-L85).
- Touch support is approximated via an `isTouchRef` flag toggled in `onTouchStart` and an `onMouseDown` guard (index.jsx#L98-L105).
- No WebGL, no canvas, no external data fetching.

## Strengths

- Zero heavy dependencies (`lucide-react` only) — no animation library needed for a hover effect this simple.
- Text content is present in the initial server-rendered markup (`{sourceText}` inside `textRef`, index.jsx#L129-L131) before the character-splitting effect runs, so crawlers/no-JS clients see real text, not an empty shell.
- `[...sourceText]` (index.jsx#L62) correctly iterates by Unicode code point rather than UTF-16 code unit, avoiding the classic emoji/surrogate-pair splitting bug that `.split("")` has.
- Uses `next/link` and no raw `<a>`/`<img>`, consistent with `CODING_STANDARDS.md` §5 "Next.js navigation and images".
- Named, `useCallback`-wrapped event handlers (`onMouseEnter`, `onMouseLeave`, `onTouchStart`, `onMouseDown`) rather than anonymous inline closures, consistent with `CODING_STANDARDS.md` §3 "Name all inline functions".
- Text is inserted via `span.textContent = char` (index.jsx#L64), never `innerHTML`, so `btnText`/`children` cannot inject markup — no XSS vector.
- Registry metadata (`registry.json`) is internally consistent: `name` matches the folder, `type` is `"registry:component"`, `category` is `"buttons"`, `main` points at the actual existing `index.jsx`, `previewUrl` (`/demo/char-stagger-button`) matches the real demo route and passes the build script's own `previewUrl` validator (`apps/docs/scripts/build-registry.js#L227-L236`).

## Risks and issues

### 1. Critical — the packaged npm tarball contains no component source at all

`registry/effects/buttons/char-stagger-button/package.json#L5-L9` declares:
```json
"main": "char-stagger-button.jsx",
"files": ["char-stagger-button.jsx", "registry.json"]
```
but the only source file that actually exists in the folder is `index.jsx` (confirmed via directory listing — `index.jsx`, `package.json`, `registry.json`, nothing named `char-stagger-button.jsx`). `npm pack` silently drops `files` entries that don't exist rather than erroring, and this was verified directly by inspecting the already-built artifact:
```
$ tar -tzf registry/dist/hyperiux-char-stagger-button-0.0.1.tgz
package/package.json
package/registry.json
```
`index.jsx` is missing from the published tarball entirely. Anyone installing `@hyperiux/char-stagger-button` via the npm distribution path (`developer-new-component.md` Step 9, part of the required "Distribution" checklist) gets a package with metadata only and zero usable code — importing the package's declared `main` would fail outright.

This is **not unique to this component** — spot-checked `arrow-fill-button` (same folder layout, same `package.json`-`main`-references-nonexistent-file pattern) and its tarball (`hyperiux-arrow-fill-button-0.0.1.tgz`) is identically empty of source (`package/package.json`, `package/registry.json` only). This is a repo-wide `build:registry`/`npm pack` pipeline defect, but it directly and verifiably breaks this component's shipped npm artifact today, so it is reported here as scoped, verified evidence for this effect. No fix is applied, per this audit's Change Guidelines scope.

### 2. High — the mobile "tap to preview" interaction never actually intercepts the first tap, so the hover animation is effectively unreachable on touch devices

index.jsx#L98-L105:
```js
const onTouchStart = useCallback(() => {
  isTouchRef.current = true;
  setIsActive((prev) => !prev);
}, []);

const onMouseDown = useCallback((e) => {
  if (isTouchRef.current) e.preventDefault();
}, []);
```
No handler calls `event.preventDefault()` inside `onTouchStart`, and no `onClick` interception exists (`onClick={onClick}` at index.jsx#L119 passes the consumer's handler straight through to `<Link>`). `preventDefault()` on a synthetic `mousedown` does not cancel the subsequent `click`/navigation on mobile browsers. This means that with a real `href`, the very first tap both toggles `isActive` *and* immediately navigates away — the staggered-character hover animation this component exists to showcase never has time to render on touch devices before the page unloads.

A complete, correctly-working version of exactly this pattern already exists elsewhere in this repo, in the sibling component `apps/docs/src/components/char-stagger-primary-button/index.js#L60-L68`:
```js
const handleClick = (event) => {
  if (supportsTouchHover && !isTouchHovered) {
    event.preventDefault();
    setIsTouchHovered(true);
    return;
  }
  onClick?.(event);
};
```
i.e., the first click event is deliberately intercepted and default-prevented, requiring a second tap to actually navigate. `char-stagger-button`'s registry source has only the state-toggle half of this pattern, not the `preventDefault`-on-click half, making it a regressed/incomplete implementation relative to a sibling in the same category that already solves this correctly. (This is based on code reading of standard touch-event/synthetic-click semantics; not independently verified against a physical touch device in this audit.)

Secondary consequence: because there is also no "tap outside to reset" handler (unlike `char-stagger-primary-button/index.js#L45-L58`, which adds a document-level `pointerdown` listener to close the touch-active state), if `href` does not actually navigate (e.g. `href="#"`, as used in the demo), `isActive` gets stuck "on" after a single tap with no way to dismiss it short of tapping the button again.

### 3. High — demo page renders a stale duplicate component with a different prop API than the registry source, not the registry source itself

`apps/docs/src/app/(marketing)/demo/char-stagger-button/page.js#L1` imports:
```js
import CharStaggerButton from "@/components/char-stagger-button";
```
i.e. the legacy copy at `apps/docs/src/components/char-stagger-button/index.js`, **not** `registry/effects/buttons/char-stagger-button/index.jsx` (the registry source of truth, per `developer-new-component.md`'s own table: "registry/effects/{category}/{name}/ — Private registry - source of truth for distribution"). The two files are near-identical but diverge on the text prop name: the legacy copy accepts `text` (apps/docs/src/components/char-stagger-button/index.js#L13), while the registry source accepts `btnText` (index.jsx#L13). The demo page passes `text="Hover me"` (page.js#L24), which works only because it hits the legacy copy it actually imports. Were the demo pointed at the registry component instead, `text` would not be recognized (it would spread onto the underlying `<a>` as an invalid DOM attribute via `{...props}`), `btnText` would remain the default `""`, and `sourceText` (index.jsx#L108: `typeof children === "string" ? children : btnText`) would resolve to an empty string — the button would render with **no visible text at all**.

Practical impact: the docs preview is drift-prone by construction (edits to the registry `index.jsx` will not show up on the live demo, and vice versa), and this is a latent trap for the next edit to either file — currently dormant only because both files still happen to be functionally aligned save for the prop name.

### 4. Medium — no `prefers-reduced-motion` handling

Neither index.jsx nor the demo page contains any `matchMedia("(prefers-reduced-motion: reduce)")` check or CSS `@media (prefers-reduced-motion: reduce)` rule. All animation (0.5–0.6s transforms, staggered per character) plays unconditionally for users who have requested reduced motion at the OS level.

### 5. Medium — no visual state change on keyboard focus

`isActive` is only ever set from `onMouseEnter`/`onMouseLeave`/`onTouchStart` (index.jsx#L88-L101); there is no `onFocus`/`onBlur` handler. The `<Link>` itself remains keyboard-operable (native anchor semantics, `Enter` activates it, and no outline is suppressed), so this is not a functionality-blocking failure, but keyboard users get none of the stagger/underline/color/arrow affordance that communicates "this is interactive" to pointer users — an inconsistent, degraded experience for keyboard-only navigation. Contrast with the sibling `char-stagger-primary-button/index.js#L94` and `#L108`, which explicitly pair every `group-hover:` utility with a matching `group-focus-visible:` utility to keep the two experiences in sync — a pattern this component's registry source does not apply.

### 6. Low — missing `useEffect` cleanup for the `transitionend` listener

index.jsx#L40-L53 attaches a `transitionend` listener on `line` via `addEventListener` inside a `useEffect` with no `return` cleanup function. The listener does remove itself once fired, but per `CODING_STANDARDS.md` §"Cleanup - always remove what you added", every `addEventListener` should have a matching cleanup path; if `isActive` toggles again (fast hover in/out) before the previous `transitionend` fires, a second listener can be attached to the same node before the first fires. Impact is bounded — the listener is scoped to a DOM node that is garbage-collected on unmount, not `window`/`document` — so this is a style/robustness nit rather than a real memory leak, but it is a literal deviation from the documented "every listener needs a cleanup" rule.

### 7. Low — `package.json` missing `peerDependencies`

`developer-new-component.md` Step 5 says the package.json should list `react` and any major packages as `peerDependencies`; `registry/effects/buttons/char-stagger-button/package.json` has none. Verified this is a repo-wide pattern (`arrow-fill-button`, `dot-fill-button` package.json files have the identical gap), not specific to this component, so scored Low rather than higher.

### 8. Low — `registry.json` missing `subfolder` flag causes an un-namespaced `target` in the generated public mirror

`apps/docs/public/r/char-stagger-button.json` (build output) resolves the installed file `target` to `components/hyperiux/index.jsx` — with no per-component subfolder — because `apps/docs/scripts/build-registry.js#L244-L245` only prefixes the target with the slug when `registryJson.subfolder === true`, and this component's `registry.json` never sets that field. Compare `registry/effects/buttons/arrow-fill-button/registry.json` (`"subfolder": true`), whose public mirror correctly resolves to `components/hyperiux/arrow-fill-button/index.jsx`. Since this is a `"pro"` tier component, the public mirror does not embed file `content` (only metadata), so this drift likely has no live install-path impact today (pro installs are presumably served from the private `registry.json`'s correct `target`, not the public mirror) — but the generated metadata is technically wrong/collision-prone if ever relied upon, and is inconsistent with how a comparable button in the same category is configured. The same gap is present on the sibling `char-stagger-primary-button`, so this is a pattern across at least this pair, not unique to `char-stagger-button` alone.

### 9. Low — arbitrary `px` value not converted to `vw`

index.jsx#L139: `height: "1.5px"` for the underline. `CODING_STANDARDS.md` §5 "Convert arbitrary px values to vw" is worded around Tailwind arbitrary classes (`text-[32px]` etc.); this is an inline style rather than a Tailwind class, so it's a gray area against the letter of the rule, but it is the same category of arbitrary hardcoded px value the rule targets.

## Accessibility assessment

- Decorative underline (`lineRef`) correctly carries `aria-hidden="true"` (index.jsx#L136) — good.
- The duplicated arrow icons (`iconVariant="stacked"`, index.jsx#L162-L163) and the single-icon variant (index.jsx#L152) are not explicitly `aria-hidden`. `lucide-react` SVGs don't carry an inherent accessible name by default, so this is unlikely to cause screen readers to announce anything extra in practice, but it's not verified against a specific screen reader and would be more defensively correct with an explicit `aria-hidden="true"` on purely decorative icon wrappers.
- No `aria-label` prop is exposed for icon-only usage, but consumers can still pass `aria-label` through the spread `...props` onto `<Link>` (index.jsx#L118), so this is not a hard blocker — just undocumented.
- Missing `prefers-reduced-motion` handling (Finding 4, Medium).
- Missing focus-parity with hover state (Finding 5, Medium) — keyboard operation itself is not blocked (native `<a>` semantics via `next/link`, default focus outline not suppressed), but visual feedback is absent for keyboard-only users.
- Color contrast: `hoverColor` and text color are fully consumer-controlled props with no built-in contrast validation — inherent to a themeable primitive, not a defect, but noting no contrast safety net exists.
- No finding here reaches the "blocks keyboard/screen-reader users from core functionality" bar required for a High a11y rating under the rubric — core link functionality (focus, activation, accessible name) all work; the gaps are missing affordances, not blockers.

## Performance assessment

- No continuous `requestAnimationFrame` loop exists — all animation is CSS `transition`/`transform`, so the rAF-suspension pattern (`createSuspendedRaf`/`createVisibilityGate`) from `registry/effects/_shared/README.md` is **not applicable** to this component (correctly out of scope per the audit brief's "only flag missing rAF-suspension... if the effect genuinely runs a continuous rAF loop").
- The character-splitting `useEffect` (index.jsx#L55-L75) does a full `innerHTML = ""` + re-append on every `btnText`/`staggerStep` change — fine for a button whose text is not expected to change frequently at runtime; not a concern at typical button-label scale.
- `willChange: "transform"` is set on both the per-character spans and the icon wrapper (index.jsx#L70, index.jsx#L159) — appropriate given they are transform-animated on hover; not left on indefinitely for an unbounded number of elements beyond the button's own character count.
- No automated performance test/benchmark exists in this repo for this component; all performance statements above are based on static code reading, not measured runtime profiling.

## SEO and content-surface assessment

- Text content (`{sourceText}`) is present in server-rendered markup before the client-side character-splitting effect mutates the DOM, so search engines and no-JS clients see the real button text, not an empty container.
- Uses a genuine `next/link` (renders a real `<a href>`), which is crawlable, unlike a `<button onClick={navigate}>` pattern.
- The demo page (page.js#L51-L53) wires up `generateMetadata` via `getDemoPageMetadata("char-stagger-button")`, so the demo route itself has page-level SEO metadata — this is shared infrastructure outside this component's own scope and was not evaluated further.

## Responsive / mobile / touch behavior assessment

- Layout uses `max-xl:` responsive text sizing on the registry source's default class (`max-xl:text-[3vw]`, index.jsx#L129) and the demo further layers `max-md:`/`max-sm:` overrides via `textClassName` — consistent with `CODING_STANDARDS.md`'s documented `max-sm:`/`max-md:` breakpoint convention.
- Touch handling has the functional defect covered in Finding 2 (High): the "preview on first tap" gesture doesn't actually block navigation, and there's no outside-tap reset, both of which a sibling component (`char-stagger-primary-button`) already solves correctly.
- No `dvh`/`svh` or other viewport-unit hazards found; the one inline `1.5px` value (Finding 9) is cosmetic, not a responsive-breakage risk.

## Maintainability and code-quality assessment

- File follows the documented structure from `CODING_STANDARDS.md` §1 closely: constants at top, then component with clearly labeled `// Refs`, `// State`, `// Effects`, `// Event handlers`, `// Derived`, `// Render` sections.
- Constants are appropriately named (`DEFAULT_HREF`, `DEFAULT_STAGGER_STEP`, `DEFAULT_HOVER_COLOR`, `CHAR_TRANSLATE_Y`) in `SCREAMING_SNAKE_CASE` at module scope, matching the naming convention table.
- No dead code, no stray `console.log`, no unused imports observed.
- The component is functionally duplicated three times in this repo with drifting prop names/behavior: `registry/effects/buttons/char-stagger-button/index.jsx` (uses `btnText`), `apps/docs/src/components/char-stagger-button/index.js` (uses `text`, near-identical to the registry copy otherwise), and the more sophisticated `apps/docs/src/components/char-stagger-primary-button/index.js` (uses `text`, plus a correctly-implemented touch/focus pattern). This triplication is itself a maintainability risk: the correct touch-interaction fix already exists in the codebase (Finding 2) but was never ported back into the registry source of truth.

## Security and dependency concerns

- No secrets, tokens, or credentials present in source.
- No use of `dangerouslySetInnerHTML`; text is inserted via `textContent` on manually created `<span>` elements (index.jsx#L64), not `innerHTML` with interpolated content, so there is no XSS vector from the `btnText`/`children` prop despite the earlier `textElement.innerHTML = ""` call, which only clears (never injects) markup.
- Single runtime dependency, `lucide-react`, a widely used icon library; no other third-party runtime code pulled in.
- `href` prop is passed straight to `next/link` with no sanitization, but this is standard/expected for a link-wrapping UI primitive — sanitizing arbitrary consumer-supplied hrefs is the consuming application's responsibility, not this component's.

## Browser compatibility considerations

- Uses only well-supported, long-standing CSS/JS features: `transform`, `transition`, `transition-delay`, `text-shadow`, `cubic-bezier()` easing, `Array.from`, spread on strings (`[...str]`), plain `element.style.*` mutation. No experimental APIs, no vendor-prefix dependencies, no WebGL/Canvas.
- `element.style.*` mutation and `addEventListener("transitionend", …)` are supported in all evergreen browsers and have been for a very long time; no compatibility risk identified.

## What was checked and found clean

- `registry.json` core schema fields (`name`, `version`, `type`, `title`, `description`, `category`, `tier`, `dependencies`, `registryDependencies`, `previewUrl`, `main`, `exportName`, `exportKind`, `importPath`, `target`, `files`) — all present, all correctly typed, `main`/`files[0].target` point at the actual existing `index.jsx`, `previewUrl` matches the real demo route and passes the build script's own validator (`apps/docs/scripts/build-registry.js#L227-L236`).
- `name` in `registry.json` matches the folder name exactly (`char-stagger-button`), per `developer-new-component.md`'s "Things That Will Break It" checklist.
- `type` is exactly `"registry:component"` (not `"effect"` or any other value).
- `category` is exactly `"buttons"`.
- No stray/duplicate source files inside `registry/effects/buttons/char-stagger-button/` that could confuse the build script's extension-based entry-point detection (only one `.jsx` file exists: `index.jsx`).
- No `requestAnimationFrame`/`setInterval`/`setTimeout` polling loops anywhere in the component — confirmed no continuous timer to leak or need suspension.
- No `dangerouslySetInnerHTML`, no `eval`, no dynamic `Function()` construction.
- Unicode-safe character iteration (`[...sourceText]`) rather than `.split("")`.
- Correct `useEffect` dependency arrays for the DOM-mutating effects (`[btnText, staggerStep]` for the span rebuild, `[isActive]` for the transform flip), per `CODING_STANDARDS.md` §6 "Dependency arrays".

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per the Change Guidelines (`CHANGE_GUIDELINES.md`) governing this repo — the following is prioritized guidance only, for a human/owner to act on separately, with explicit awareness that any fix must not alter UI, responsiveness, or registry behavior without sign-off:

1. **(Critical)** Fix `package.json`'s `main`/`files` to reference `index.jsx` instead of the non-existent `char-stagger-button.jsx`, then re-run `npm pack` and replace `registry/dist/hyperiux-char-stagger-button-0.0.1.tgz`. Given this is a repo-wide pattern, consider fixing the `build-registry.js`/tarball pipeline (or adding a lint/CI check) rather than patching each `package.json` by hand, to prevent recurrence across the rest of the library.
2. **(High)** Port the working "first-tap previews, doesn't navigate; second tap navigates; outside-tap resets" pattern from `apps/docs/src/components/char-stagger-primary-button/index.js#L29-L68` into the registry `index.jsx`'s touch handling, so the animation is actually visible to touch users before navigation occurs.
3. **(High)** Point the demo page at the actual registry source (or keep the docs-site copy in permanent lockstep with it, including prop names) so `text="Hover me"` vs `btnText` drift can't recur, consistent with `developer-new-component.md`'s stated intent that `registry/effects/` is "source of truth for distribution."
4. **(Medium)** Add `prefers-reduced-motion` handling (skip/shorten the stagger transition) — either via a `matchMedia` check gating `staggerStep`/`transition` or a CSS media query.
5. **(Medium)** Mirror the `group-focus-visible:` treatment used in `char-stagger-primary-button` so keyboard focus produces the same visual affordance as mouse hover.
6. **(Low)** Add a cleanup return to the `transitionend`-listener `useEffect` (index.jsx#L40-L53).
7. **(Low)** Add `peerDependencies` (`react`) to `package.json`, consistent with `developer-new-component.md` Step 5 — likely a repo-wide batch fix rather than a one-off.
8. **(Low)** Decide whether `"subfolder": true` should be set in `registry.json` for consistency with `arrow-fill-button`/other properly-namespaced components, or confirm the un-namespaced public-mirror `target` is intentionally inert for pro-tier components.

## Final score: 5/10

## Overall severity label: Critical
