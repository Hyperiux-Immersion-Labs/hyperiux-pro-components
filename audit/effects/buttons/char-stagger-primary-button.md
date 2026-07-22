# char-stagger-primary-button (buttons)

## Summary

`char-stagger-primary-button` is a CSS-transition-only (no `requestAnimationFrame`) pill button that splits its label into per-character `<span>` elements and slides them up on hover/focus via `translateY` + `text-shadow` duplication, with a secondary arrow icon that swaps via the same technique and a synthetic two-tap flow for touch devices. The registry source (`registry/effects/buttons/char-stagger-primary-button/index.jsx`) is a near-clone of the docs-site source (`apps/docs/src/components/char-stagger-primary-button/index.js`) but has drifted from it in ways that break a real feature (`hoverColor`), and the packed npm distribution tarball for this component ships with **no component source at all** — verified by extracting `registry/dist/hyperiux-char-stagger-primary-button-0.0.1.tgz`, which contains only `package.json` and `registry.json`. The component itself is small, dependency-light, and keyboard-friendly (animates on `:focus-visible` as well as hover), and has no continuous animation loop, so rAF-suspension does not apply. The registry-JSON/CLI install path (the primary distribution channel) checks out cleanly; the issues are concentrated in the npm-pack channel, a dead prop, and metadata drift, not the core CSS interaction.

## Implementation overview

- Single-file component, default export, `"use client"` — [registry/effects/buttons/char-stagger-primary-button/index.jsx](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx).
- Renders a Next.js `Link` styled as a pill button; label is split into characters with `[...sourceText].map(...)` and each character gets a `transitionDelay` proportional to its index (`staggerStep`), producing the stagger effect purely via CSS `transition` on `group-hover`/`group-focus-visible` — [index.jsx#L90-L103](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L90-L103).
- `textShadow: "0px 1.3em currentColor"` (line 97) is the classic "duplicate the text via shadow, translate the real text up" trick so the shadow copy scrolls into view as the real character scrolls out.
- Touch handling: a `matchMedia("(hover: none), (pointer: coarse)")` listener (lines 29-43) detects coarse/no-hover pointers; on such devices the first tap only triggers the hover-preview state (`isTouchHovered`) and calls `event.preventDefault()`, requiring a **second** tap to actually navigate (lines 60-68). A `pointerdown` listener outside the link resets this state (lines 45-58).
- Optional arrow icon (`showArrow`, default `false`) renders the icon twice, translated between `-100%` and `5%`, to fake a "sliding icon" swap — [index.jsx#L110-L117](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L110-L117).
- No `requestAnimationFrame` loop anywhere — all motion is CSS `transition`/`transform`, so the F-042 rAF-suspension pattern (`registry/effects/_shared/README.md`) does not apply to this effect.

## Strengths

- Keyboard parity: the stagger and icon-swap animations trigger on `group-focus-visible:` in addition to `group-hover:` (e.g. [index.jsx#L93](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L93), [index.jsx#L107](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L107), [index.jsx#L112](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L112)) — many hover-only effects in this category skip this.
- Correctly uses `next/link` rather than a raw `<a>`, per `CODING_STANDARDS.md` §5.
- Minimal dependency surface: only `lucide-react` (already declared in `registry.json` — [registry.json#L8-L10](../../../registry/effects/buttons/char-stagger-primary-button/registry.json#L8-L10)).
- Touch-device double-tap handling is a deliberate, if imperfect, attempt to preserve the hover-preview UX on devices that have no true hover state, with proper cleanup of both listeners it adds (see Cleanup section below).
- No animation loop to leak — nothing to suspend, no rAF to cancel.

## Risks and issues

1. **npm distribution tarball for this component ships with no component source at all — High.**
   `registry/effects/buttons/char-stagger-primary-button/package.json#L5-9` sets `"main": "char-stagger-primary-button.jsx"` and `"files": ["char-stagger-primary-button.jsx", "registry.json"]`, but the only source file in the folder is `index.jsx` — no file named `char-stagger-primary-button.jsx` exists (confirmed via directory listing). Because `npm pack`'s `files` allowlist references a non-existent filename, it silently contributes nothing to the package. I extracted the already-built tarball at `registry/dist/hyperiux-char-stagger-primary-button-0.0.1.tgz` (`tar -tzf`) and confirmed it contains only `package/package.json` and `package/registry.json` — **`index.jsx` is not in the package**. Anyone installing via the npm/tgz channel (`developer-new-component.md` Step 9) gets a package that does not export `CharStaggerPrimaryButton` at all. This is scoped to the npm-pack channel specifically — the registry.json-driven CLI install path is unaffected, since `registry.json`'s own `main`/`files` correctly point at `index.jsx` (verified clean, see below).

2. **`hoverColor` prop is accepted but has zero effect in the distributed component (dead/broken prop) — Medium.**
   `hoverColor` is destructured at [index.jsx#L16](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L16) but never referenced anywhere else in the file (confirmed via grep — no second occurrence). Compare with the docs-site sibling copy `apps/docs/src/components/char-stagger-primary-button/index.js`, where the same prop is genuinely wired up: injected as a CSS variable (`style={{"--char-hover-color": hoverColor}}`, [index.js#L82](../../../apps/docs/src/components/char-stagger-primary-button/index.js#L82)) and consumed via `hover:text-(--char-hover-color)` / `focus-visible:text-(--char-hover-color)` in the `className` ([index.js#L81](../../../apps/docs/src/components/char-stagger-primary-button/index.js#L81)). The registry copy — the one actually distributed to users — dropped this wiring when it was copied over per `developer-new-component.md` Step 3, so anyone installing this component and passing `hoverColor="#00ff00"` sees no color change at all. Bounded impact (one cosmetic prop, rest of the button works), so rated Medium rather than High.

3. **Public registry mirror `files[0].target` path is stale relative to `registry.json`, and is part of a systemic pattern across the `buttons` category — Medium.**
   `registry.json` declares `files[0].target: "src/components/effects/char-stagger-primary-button/index.jsx"` ([registry.json#L18-24](../../../registry/effects/buttons/char-stagger-primary-button/registry.json#L18-24)), but the generated public mirror `apps/docs/public/r/char-stagger-primary-button.json` still has `files[0].target: "components/hyperiux/index.jsx"` ([char-stagger-primary-button.json#L15-21](../../../apps/docs/public/r/char-stagger-primary-button.json#L15-21)) — a generic path with no slug segment, and it also omits `importPath`, top-level `target`, `main`, and `previewUrl` entirely. Per `developer-new-component.md`'s "Things That Will Break It" section this is the documented failure mode ("Forgetting to re-run `build:registry` after edits — the docs site and CLI both read from `public/r/`, not the source"). I cross-checked sibling `buttons` mirrors: `apps/docs/public/r/char-stagger-button.json` and `apps/docs/public/r/dot-fill-button.json` show the identical generic `"components/hyperiux/index.jsx"` target, while `apps/docs/public/r/arrow-fill-button.json` correctly has a slug-specific target (`"components/hyperiux/arrow-fill-button/index.jsx"`) — so this is a systemic stale-build issue affecting a subset of `buttons` mirrors, not a one-off typo unique to this slug. Rated Medium rather than High because the file is explicitly documented as machine-generated and always overwritten by `npm run build:registry`, i.e., it is recoverable by a rebuild rather than a source-code defect — but as currently checked into the repo it is inconsistent with the source of truth.

4. **Prop-name drift between the registry-distributed API and the docs-site sibling the demo actually renders: `btnText` vs. `text` — Medium.**
   The distributed component (`index.jsx#L8`) expects a `btnText` prop; the sibling docs-site copy that the live demo page renders (`apps/docs/src/components/char-stagger-primary-button/index.js#L8`) expects `text`, and the demo page passes `text="Hover me"` ([page.js#L24](../../../apps/docs/src/app/(marketing)/demo/char-stagger-primary-button/page.js#L24)). This works today only because the demo imports the docs-site sibling, not the registry component — but per `developer-new-component.md`'s Step 1→Step 3 workflow the two are supposed to stay in sync ("copy the distributable files into the private registry"). A developer who installs the real component via the CLI has no live reference confirming the `btnText`-shaped API, since the page they're looking at is running a different prop contract. Separately, that same demo page also passes a `className` prop ([page.js#L26](../../../apps/docs/src/app/(marketing)/demo/char-stagger-primary-button/page.js#L26)) that neither the docs-site copy (only `btnClassName` is destructured, and `{...props}` is spread *before* the component's own explicit `className={...}` in [index.js#L78-81](../../../apps/docs/src/components/char-stagger-primary-button/index.js#L78-81), so JSX prop order means it's silently overridden) nor the registry copy actually honor — a developer copy-pasting this demo usage would be misled into thinking `className` is a supported override.

5. **Non-string `children` are silently discarded — button can render with no visible label and no warning — Medium.**
   `sourceText = typeof children === "string" ? children : btnText` ([index.jsx#L27](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L27)), and the render tree never outputs `{children}` directly anywhere — only characters of `sourceText` are rendered ([index.jsx#L90-103](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L90-103)). A consumer using the common React pattern `<CharStaggerPrimaryButton>Some <b>rich</b> text</CharStaggerPrimaryButton>` (non-string children) gets `sourceText` falling back to `btnText` (default `""`), producing a button with **no visible label at all**, silently.

6. **Touch double-activation pattern can also affect keyboard users on hybrid pointer/keyboard devices, with no visible affordance — Medium.**
   `handleClick` ([index.jsx#L60-68](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L60-68)) calls `event.preventDefault()` and only sets `isTouchHovered` on the first activation whenever `supportsTouchHover` is true, requiring a second activation to navigate. `supportsTouchHover` is driven purely by `matchMedia("(hover: none), (pointer: coarse)")` ([index.jsx#L32](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L32)), which is also commonly `true` on touchscreen laptops/2-in-1s even while a user navigates by keyboard — so on that device class the first Enter/Space press on the focused link does nothing but replay the hover animation. There is also no visual cue that a second tap/press is required on any device, so a mobile user who taps once may reasonably believe the tap registered and not tap again. This on-device UX claim could not be fully verified (no live device testing performed as part of this audit); the code path itself is unambiguous.

7. **No `prefers-reduced-motion` handling — Medium.**
   Neither `registry/effects/buttons/char-stagger-primary-button/index.jsx` nor the docs-site sibling copies reference `prefers-reduced-motion` in any form (confirmed via grep across all relevant paths — no matches). The stagger/translate animation runs unconditionally regardless of OS-level reduced-motion preference. No `motion-reduce:` Tailwind variant or JS media-query gate exists.

8. **`package.json` is missing `peerDependencies` — Low.**
   `developer-new-component.md` Step 5 requires listing `react` and any major packages as peer dependencies; `registry/effects/buttons/char-stagger-primary-button/package.json` has no `peerDependencies` key at all (only an empty `"dependencies": {}`).

9. **Responsive breakpoint prefixes deviate from `CODING_STANDARDS.md` and from the sibling copy, shifting where "mobile" sizing kicks in — Low.**
   `CODING_STANDARDS.md` §5 specifies `max-sm:` for mobile and `max-md:` for tablet, consistently. The registry component instead mixes `max-xl:` and `max-md:` ([index.jsx#L80](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L80): `max-xl:h-[9vw] ... max-md:h-[15vw] max-md:text-[4.2vw]`), while the docs-site sibling copy uses the standard `max-md:`/`max-sm:` pair ([index.js#L81](../../../apps/docs/src/components/char-stagger-primary-button/index.js#L81)). This shifts the "compact mobile sizing" breakpoint from ~640px (`sm`) to ~768px (`md`) between the two copies — the two versions of this button resize at genuinely different viewport widths, not just a naming nit.

10. **`lineClassName` is a dead prop in both copies — Low.**
    Declared at [index.jsx#L15](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L15) but never read anywhere in either the registry or docs-site file. Appears carried over from the sibling `char-stagger-button` component (`apps/docs/src/components/char-stagger-button/index.js`), which does have a real `showLine`/`lineRef` underline feature this primary-button variant never implements. Pre-existing dead code (`CODING_STANDARDS.md` §"Dead code is noise"), not a regression unique to this component.

11. **Decorative arrow icon has no `aria-hidden` — Low.**
    The two stacked `<Icon />` instances used for the arrow-swap effect ([index.jsx#L113-114](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L113-114)) carry no `aria-hidden="true"`. Bounded impact (the icon has no distinguishing content), but a one-line hardening opportunity.

## Accessibility assessment

- Positive: animation triggers on `:focus-visible` as well as `:hover`, so keyboard users get equivalent visual feedback to mouse users, and the element is a real `<a>` (via `next/link`) so it is natively focusable and operable with Enter.
- Gap: non-string `children` silently produce a button with no accessible name at all (finding 5).
- Gap: double-tap/double-activation pattern with no visible affordance can also affect keyboard users on hybrid pointer/keyboard devices, not just touch (finding 6).
- Gap: no `prefers-reduced-motion` guard (finding 7).
- Gap: decorative icon not marked `aria-hidden` (finding 11).
- The character-split markup (each letter in its own `<span>`) does not add `aria-hidden` to the individual character spans or an `aria-label` on the wrapping element; screen readers generally concatenate adjacent inline text nodes correctly, and no evidence of broken announcement was found, but this pattern (many single-character spans) is a common source of mis-reading in some screen reader/browser combinations and was not verified against a live AT here.

## Performance assessment

- Pure CSS transition/transform animation, no `requestAnimationFrame` loop, no timers, no ResizeObserver — nothing to run continuously off-screen or in a background tab, so the F-042 rAF-suspension pattern genuinely does not apply here (consistent with `registry/effects/_shared/README.md`'s stated scope, which does not include `buttons`).
- `will-change-transform` is applied to the per-character spans and the icon wrapper ([index.jsx#L93](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L93), [index.jsx#L112](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L112)), appropriately scoped to elements that actually animate.
- For very long button labels the character-span-per-letter approach creates one DOM node per character, which is a standard and bounded cost for this animation technique; no evidence of unbounded growth (label length is developer-controlled, not user input in the observed demo).

## SEO and content-surface assessment

- The button label is split into `<span>` children but the underlying text content is still present in the DOM (not moved into `::before`/`content` or an image), so it remains crawlable/indexable text.
- The demo route [apps/docs/src/app/(marketing)/demo/char-stagger-primary-button/page.js](../../../apps/docs/src/app/(marketing)/demo/char-stagger-primary-button/page.js) calls `generateMetadata()` via `getDemoPageMetadata("char-stagger-primary-button")` (line 51), so the page has proper metadata wiring; the metadata source itself (`apps/docs/src/lib/demo-metadata.js`) was not read as it's outside this effect's required file set.
- The demo's background `<Image>` has meaningful `alt="bg image"` and a `title` — acceptable, though `alt="bg image"` is generic (Low, out of scope nit on a purely decorative background).

## Responsive / mobile / touch behavior assessment

- Sizing uses `vw`-based responsive classes with `max-xl:`/`max-md:` breakpoint overrides ([index.jsx#L80](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L80)), consistent with `CODING_STANDARDS.md`'s "convert arbitrary px to vw" guidance, though the standard's documented breakpoint convention is `max-sm:`/`max-md:` — this component instead uses `max-xl:`/`max-md:`, a real (if minor) deviation from the documented pair that shifts the effective mobile-sizing breakpoint (finding 9).
- Touch/no-hover handling is implemented deliberately (finding 6), not simply ignored — but the UX cost (silent double-activation requirement, and no visible affordance) is the actual finding, not the absence of touch handling.
- No horizontal-scroll or fixed-width risk observed; button uses `w-fit`.

## Maintainability and code-quality assessment

- File is compact, single-purpose, and easy to read in well under 10 seconds per line per `CODING_STANDARDS.md` principle 1.
- Two dead props (`hoverColor` — functionally broken, `lineClassName` — inert) reduce trust in the prop surface; per `CODING_STANDARDS.md` §"Dead code is noise," these should be either wired up or removed (no fix applied here per audit scope — `CHANGE_GUIDELINES.md` instructs this audit not to modify code).
- The registry copy and the docs-site copy (`apps/docs/src/components/char-stagger-primary-button/index.js`) have diverged in formatting (missing spaces after `from` in imports, inconsistent indentation in the docs-site copy), in the `hoverColor` behavior, in the prop name (`btnText` vs. `text`), and in responsive breakpoints — evidence the "copy, don't share" workflow in `developer-new-component.md` has drifted post-copy rather than being kept in sync.
- Named handlers (`updateTouchSupport`, `handlePointerDown`) are used and properly removed in cleanup, matching `CODING_STANDARDS.md` §3 "Name all inline functions" / §6 "Cleanup."

## Security and dependency concerns

- No secrets, tokens, or user-controlled `dangerouslySetInnerHTML`/`eval` present.
- `href` defaults to `"#"` and is otherwise fully caller-controlled — same trust model as any `next/link`-based component; no XSS surface since text is rendered as React children, not raw HTML.
- Single external dependency `lucide-react`, declared correctly in `registry.json` ([registry.json#L8-L10](../../../registry/effects/buttons/char-stagger-primary-button/registry.json#L8-L10)) and `package.json` has no runtime `dependencies` (relies on peer/host project providing `lucide-react`/`react`), which is standard for this registry.

## Browser compatibility considerations

- Uses `matchMedia` with a compound query `"(hover: none), (pointer: coarse)"` and `addEventListener("change", ...)` on the `MediaQueryList` — both are broadly supported in all evergreen browsers; no legacy `addListener` fallback, which is fine given this is a modern-React component registry.
- `cubic-bezier(0.625,0.05,0,1)` easing and `text-shadow`-based duplication are standard CSS with no vendor-prefix requirements in current browsers.
- No use of newer CSS features (`:has()`, container queries, etc.) that would need compatibility caveats.

## What was checked and found clean

- `registry.json` (the CLI/build source of truth) schema completeness against `developer-new-component.md`: `name` matches folder exactly, `type` is `"registry:component"`, `category` is exactly `"buttons"`, `main` (`index.jsx`) exists, the single file in `files` has correct `path`/`target`, `tier` is a valid value (`"pro"`), `previewUrl` (`/demo/char-stagger-primary-button`) matches the actual demo route folder. The CLI install path driven by this file is unaffected by the npm-tarball defect (finding 1).
- `registry/index.json` root entry: present, alphabetically placed, fields consistent with `registry.json` ([registry/index.json#L99-114](../../../registry/index.json#L99-114)).
- `apps/docs/src/lib/effect-slugs.js`: has a correct alias entry (`character-stagger-primary-button` → `char-stagger-primary-button`, [effect-slugs.js#L14-L17](../../../apps/docs/src/lib/effect-slugs.js#L14-L17)).
- Cleanup on unmount: both `useEffect` hooks in `index.jsx` return proper teardown functions that remove exactly the listener they added (`mediaQuery.removeEventListener`, [index.jsx#L41](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L41); `document.removeEventListener`, [index.jsx#L56](../../../registry/effects/buttons/char-stagger-primary-button/index.jsx#L56)) — no leaks found.
- No `requestAnimationFrame`/`setInterval` present, so rAF-suspension (F-042) is correctly out of scope for this effect, consistent with `registry/effects/_shared/README.md`'s documented rollout scope (webgl/cursor/backgrounds/scroll only).
- No hardcoded brand colors besides the intentional `bg-[#ff5f00]` button background, which is a deliberate default (overridable via `bgClassName`), not a stray site-specific token.

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per `CHANGE_GUIDELINES.md`. Any future fix should be re-verified for UI, responsiveness, and registry-behavior impact before landing:

1. **Priority 1 (High):** Fix `package.json`'s `main`/`files` fields to reference `index.jsx` (the real filename), then bump `version` per `developer-new-component.md`'s versioning rule and re-run `npm pack` to regenerate a working tarball — currently the packed npm distribution ships zero component code.
2. **Priority 2 (Medium):** Restore `hoverColor` wiring in `registry/effects/buttons/char-stagger-primary-button/index.jsx` to match the working implementation in `apps/docs/src/components/char-stagger-primary-button/index.js`, or remove the prop if it's intentionally unsupported — currently it's neither.
3. **Priority 2 (Medium):** Re-run `npm run build:registry` to refresh `apps/docs/public/r/char-stagger-primary-button.json` (and check `char-stagger-button.json`, `dot-fill-button.json` for the same stale `"components/hyperiux/index.jsx"` target) so the public mirror matches the current `registry.json` install target.
4. **Priority 3 (Medium):** Reconcile the `text`/`btnText` prop-name mismatch between the docs-site build copy and the registry copy so the live demo page's usage matches what CLI-installed consumers actually get, and fix the demo page's unused `className` prop.
5. **Priority 3 (Medium):** Add a `prefers-reduced-motion` guard (e.g. skip/shorten the `translateY` stagger transition), and add a visible affordance (or reconsider the pattern) for the double-activation touch/hybrid-device flow.
6. **Priority 4 (Low):** Add `peerDependencies` to `package.json`, remove the dead `lineClassName` prop, add `aria-hidden="true"` to the decorative duplicate arrow icons, reconcile the `max-xl:`/`max-md:` breakpoint choice with `CODING_STANDARDS.md`'s documented `max-sm:`/`max-md:` pair, and decide/document whether non-string `children` should be supported.

## Final score: 6/10

## Overall severity label: High
