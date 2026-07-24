# dot-fill-button (buttons)

## Summary

`dot-fill-button` is a small, dependency-free `Link`-based CTA that stagger-splits its label into per-character spans and reveals a color-swapped duplicate on hover via a `textShadow`/`translateY` trick, while a small `aria-hidden` dot scales up (`scale(120)`) behind it to "fill" the background. The core visual mechanic is solid, GPU-cheap (transform/color only), and correctly Unicode-safe (`[...sourceText]`). However, the audit surfaces one **Critical** distribution defect (the packed npm tarball ships no component source at all) and one **High** drift issue (the registry copy that CLI users actually install is functionally behind the improved touch-aware copy the live demo page renders). There are also unaddressed Medium-level accessibility/reduced-motion gaps common to character-stagger effects, and several Low code-quality nits.

## Implementation overview

- Single-file component: [`registry/effects/buttons/dot-fill-button/index.jsx`](../../../registry/effects/buttons/dot-fill-button/index.jsx) (110 lines), no sub-files.
- Renders a Next.js `<Link>` styled as a pill button. On mount/update, a `useEffect` ([index.jsx#L22-L40](../../../registry/effects/buttons/dot-fill-button/index.jsx#L22)) tears down and rebuilds `textRef.current` as one `<span>` per character (with a per-index `transitionDelay = index * staggerStep`), and a second `useEffect` ([index.jsx#L42-L56](../../../registry/effects/buttons/dot-fill-button/index.jsx#L42)) applies shared inline styles (`textShadow: 0px 1.3em currentColor`, `transform`, `transition`) to those spans — the classic "flip the duplicated-via-shadow text on hover" stagger technique.
- Hover handlers ([index.jsx#L58-L76](../../../registry/effects/buttons/dot-fill-button/index.jsx#L58)) translate all character spans up by `-1.3em` (revealing the shadow-duplicated text in `hoverTextColor`) and flip a boolean that drives the dot scale/text color via inline `style`.
- The decorative dot ([index.jsx#L86-L94](../../../registry/effects/buttons/dot-fill-button/index.jsx#L86)) is `aria-hidden`, absolutely positioned, and scales from `1` to `120` on hover with its own cubic-bezier easing — this is the "fill" the name refers to.
- No `requestAnimationFrame` loop anywhere — the whole effect is CSS-transition-driven off two React state-triggered inline-style writes.

## Strengths

- Zero runtime dependencies (`dependencies: []` in [registry.json#L8](../../../registry/effects/buttons/dot-fill-button/registry.json#L8)) — light footprint.
- Uses `transform`/`color` transitions, not layout-triggering properties — cheap to animate, verified by inspection ([index.jsx#L91](../../../registry/effects/buttons/dot-fill-button/index.jsx#L91), [index.jsx#L52-L53](../../../registry/effects/buttons/dot-fill-button/index.jsx#L52)).
- `[...sourceText]` iterates by Unicode code point rather than `split("")`, so multi-byte characters/emoji in `btnText` won't be torn in half ([index.jsx#L29](../../../registry/effects/buttons/dot-fill-button/index.jsx#L29)).
- Text is inserted via `textContent`, never `innerHTML` with untrusted content — no injection surface ([index.jsx#L27-L31](../../../registry/effects/buttons/dot-fill-button/index.jsx#L27)).
- Decorative dot is correctly `aria-hidden` ([index.jsx#L87](../../../registry/effects/buttons/dot-fill-button/index.jsx#L87)).
- Fully prop-driven color scheme (`bgColor`, `textColor`, `fillColor`, `hoverTextColor`, `dotColor`) with no hardcoded brand colors, per `developer-new-component.md`'s "no hardcoded colors" rule.
- Uses Next.js `Link` (not a raw `<a>`), consistent with `CODING_STANDARDS.md` §5.

## Risks and issues

### 1. Critical — Packed npm tarball ships no component source

`registry/effects/buttons/dot-fill-button/package.json` declares `"main": "dot-fill-button.jsx"` and `"files": ["dot-fill-button.jsx", "registry.json"]` ([package.json#L5-L9](../../../registry/effects/buttons/dot-fill-button/package.json#L5)), but the actual source file in that folder is `index.jsx` — there is no `dot-fill-button.jsx`. I extracted the already-built tarball to confirm the real-world effect:

```
$ tar -tzf registry/dist/hyperiux-dot-fill-button-0.0.1.tgz
package/package.json
package/registry.json
```

`index.jsx` — the only file that actually contains the component — is absent from the packed tarball. Anyone installing `@hyperiux/dot-fill-button` via the npm tarball gets a package with no usable component; `require`/`import` of the declared `main` field fails outright. This is a genuine crash-on-install for that distribution channel, not a style nit. Note: this same `{slug}.jsx` vs. `index.jsx` mismatch exists across every sibling button package I checked (`animated-toggle`, `arrow-fill-button`, `char-stagger-button`, `char-stagger-primary-button`, `link-button`, `scramble-link-button`), so it is very likely a repo-wide packaging bug rather than something unique to this component — but it is confirmed broken for `dot-fill-button` specifically, so it is reported here as required by this audit's scope. The primary CLI/registry-JSON install path (`registry.json` → `apps/docs/public/r/dot-fill-button.json`) is unaffected by this bug and works correctly (see "What was checked and found clean").

### 2. High — Distributed registry source is behind the version the live demo actually renders (functional drift, not just naming)

The demo page ([apps/docs/src/app/(marketing)/demo/dot-fill-button/page.js#L1](<../../../apps/docs/src/app/(marketing)/demo/dot-fill-button/page.js#L1>)) imports `DotFillBtn` from `@/components/dot-fill-button`, which resolves to [apps/docs/src/components/dot-fill-button/index.jsx](../../../apps/docs/src/components/dot-fill-button/index.jsx). That copy is materially different from the copy the CLI/npm actually distributes ([registry/effects/buttons/dot-fill-button/index.jsx](../../../registry/effects/buttons/dot-fill-button/index.jsx)):

- The docs copy adds `MOBILE_BREAKPOINT`/`MOBILE_HOLD_MS` constants, an `isMobile` state synced via `matchMedia` ([apps/docs/…/index.jsx#L62-L74](../../../apps/docs/src/components/dot-fill-button/index.jsx#L62)), and a `handlePointerDown` that activates the fill/stagger animation on touch and auto-releases it after 1s ([apps/docs/…/index.jsx#L114-L131](../../../apps/docs/src/components/dot-fill-button/index.jsx#L114)).
- The registry copy has **none of this** — `handleMouseEnter`/`handleMouseLeave` are the only triggers ([registry/…/index.jsx#L58-L76](../../../registry/effects/buttons/dot-fill-button/index.jsx#L58)), so on touch devices (no `:hover`) the entire visual point of the component — the dot fill and character stagger — never fires for CLI/npm-installed users. The button still functions as a plain link, but the effect it's named and sold on is inert on touch.
- The two copies also disagree on responsive breakpoint prefixes: the registry copy uses `max-[1025px]:`/`max-md:` ([registry/…/index.jsx#L83](../../../registry/effects/buttons/dot-fill-button/index.jsx#L83), [registry/…/index.jsx#L88](../../../registry/effects/buttons/dot-fill-button/index.jsx#L88)) while the docs copy correctly uses `max-md:`/`max-sm:` ([apps/docs/…/index.jsx#L139](../../../apps/docs/src/components/dot-fill-button/index.jsx#L139), [apps/docs/…/index.jsx#L144](../../../apps/docs/src/components/dot-fill-button/index.jsx#L144)) per `CODING_STANDARDS.md`'s "use `max-sm:` for mobile … `max-md:` for tablet" rule — the registry copy is the one that deviates from the documented standard.

Per `developer-new-component.md`'s own workflow ("You build in `src/components/`, then copy the source into `registry/effects/`"), this looks like the mobile-touch fix was applied to the docs copy and never copied back into the registry, and no `version` bump was made in [registry.json#L3](../../../registry/effects/buttons/dot-fill-button/registry.json#L3) (still `1.0.0`) to reflect that the two sources have diverged. Net effect: what's demoed publicly is not what CLI/npm users receive.

### 3. Medium — No `prefers-reduced-motion` handling

Neither copy of the component checks `window.matchMedia("(prefers-reduced-motion: reduce)")`, and no global stylesheet fallback exists (`grep -rl "prefers-reduced-motion" apps/docs/src/app/globals.css apps/docs/src/styles` returned nothing). The `0.6s` character-flip transition ([index.jsx#L52-L53](../../../registry/effects/buttons/dot-fill-button/index.jsx#L52)) and the dot's `scale(120)` transform ([index.jsx#L91](../../../registry/effects/buttons/dot-fill-button/index.jsx#L91)) run unconditionally for users who have indicated they want reduced motion.

### 4. Medium — Per-character text splitting has no accessible fallback

The label is split into one `<span>` per character with no compensating `aria-label` on the container and no `aria-hidden` on the individual character spans ([index.jsx#L29-L39](../../../registry/effects/buttons/dot-fill-button/index.jsx#L29), [index.jsx#L96-L104](../../../registry/effects/buttons/dot-fill-button/index.jsx#L96)). This is a known screen-reader gap for stagger-text effects: some screen reader/browser combinations (notably VoiceOver/Safari) can announce per-character DOM text node runs with unnatural letter-by-letter pauses instead of the whole word. The line `aria-hidden={false}` on [index.jsx#L100](../../../registry/effects/buttons/dot-fill-button/index.jsx#L100) is explicit but doesn't address this — it only affirms the (already-default) non-hidden state of the wrapping span, not the fragmented character spans inside it.

### 5. Low — Duplicate `useEffect`s with identical dependency arrays

[index.jsx#L22-L40](../../../registry/effects/buttons/dot-fill-button/index.jsx#L22) and [index.jsx#L42-L56](../../../registry/effects/buttons/dot-fill-button/index.jsx#L42) both key off `[btnText, staggerStep]` and both iterate the same span children immediately after each other on every relevant update. Per `CODING_STANDARDS.md` Core Principle 5 ("Don't repeat yourself"), these are natural candidates to merge into one effect (build spans, then style them, in a single pass) — purely a readability/maintainability nit, no functional impact since both effects still run synchronously post-mount.

### 6. Low — `package.json` `main`/`files` naming mismatch (root cause of Finding 1)

Beyond the tarball being broken in practice (Finding 1), the `package.json` itself is internally inconsistent with the folder contents: it never references `index.jsx` anywhere ([package.json#L5-L9](../../../registry/effects/buttons/dot-fill-button/package.json#L5)), despite `index.jsx` being the only source file and the file `registry.json` explicitly names as `main` ([registry.json#L12](../../../registry/effects/buttons/dot-fill-button/registry.json#L12)). Flagged separately at Low because the fix is a one-line rename, distinct from the packaging consequence already captured as Critical.

## Accessibility assessment

- Semantic element: uses `<Link>` (renders as `<a>`), not a `<div>`/`<span>` fake button — correct choice for a navigational CTA.
- Decorative dot correctly hidden from assistive tech via `aria-hidden` ([index.jsx#L87](../../../registry/effects/buttons/dot-fill-button/index.jsx#L87)).
- Keyboard: since this is a real anchor, it is natively focusable and activatable via Enter — no custom keyboard handling was needed or added. I could not find any `:focus-visible` styling override in this file (none present), so the button relies on the browser/Tailwind base's default focus ring; not further verifiable without a running app and DOM inspection, which was out of scope for this static audit.
- Character-splitting a11y gap — see Finding 4 (Medium).
- No `prefers-reduced-motion` support — see Finding 3 (Medium).
- No explicit `aria-label` fallback if `btnText` is empty/whitespace-only (defaults to `""` at [index.jsx#L8](../../../registry/effects/buttons/dot-fill-button/index.jsx#L8)); an empty-labeled link is a real but low-probability edge case since `btnText` is presented as a required-in-practice prop by every caller I found.

## Performance assessment

- No `requestAnimationFrame` loop exists in this component — confirmed by reading the full 110-line file; all motion is delegated to CSS `transition`s fired off two React state/style writes on hover. The rAF-suspension pattern (`createSuspendedRaf`/`createVisibilityGate`, [registry/effects/_shared/README.md](../../../registry/effects/_shared/README.md)) therefore does not apply here, and its absence is not a finding, per this audit's instructions to only flag it where a genuine continuous rAF loop exists.
- The two mount-time `useEffect`s ([index.jsx#L22-L56](../../../registry/effects/buttons/dot-fill-button/index.jsx#L22)) rebuild all character spans via direct DOM manipulation (`innerHTML = ""` + `appendChild` per character) whenever `btnText`/`staggerStep` change. For typical short button labels (a handful of words) this is negligible; no evidence of it running per-frame or per-render.
- Animated properties are limited to `transform` and `color`/`text-shadow`, which are compositor/paint-friendly rather than layout-triggering — no forced synchronous reflow pattern (no read-then-write-in-loop) was found.
- I did not run a live profiler/Lighthouse pass against the actual demo page as part of this static audit; the above is a code-level assessment only, not a measured trace. No automated performance test exists in this repo for this component to independently verify these claims.

## SEO and content-surface assessment

- The demo route ([apps/docs/src/app/(marketing)/demo/dot-fill-button/page.js#L50-L52](<../../../apps/docs/src/app/(marketing)/demo/dot-fill-button/page.js#L50>)) implements `generateMetadata` via `getDemoPageMetadata("dot-fill-button")`, consistent with the rest of the demo pages; I confirmed `apps/docs/src/lib/demo-metadata.js` exists and exports that function, but did not trace its internals as part of this component-scoped audit.
- The component itself renders no headings, doesn't affect document `<title>`, and has no SEO-relevant surface beyond being a normal in-page link — nothing specific to flag.
- The background `<Image>` on the demo page uses a remote R2 URL with `alt="bg image"` — a low-value/non-descriptive alt string for what's a purely decorative full-bleed background, but this is demo-page furniture, not the audited component, so it's mentioned only for completeness and not scored.

## Responsive / mobile / touch behavior assessment

- The **distributed** registry copy (what CLI/npm users get) has no touch handling at all — only `onMouseEnter`/`onMouseLeave` ([index.jsx#L58-L76](../../../registry/effects/buttons/dot-fill-button/index.jsx#L58)). On touch devices the dot-fill/text-stagger animation simply never triggers; the link itself still works. This is the mobile-facing consequence of Finding 2 (High).
- The **docs-site** copy (what the live demo actually shows) does handle this correctly: a `matchMedia`-driven `isMobile` flag gates hover handlers and a `pointerdown`-triggered activate/auto-release-after-1s flow drives the same animation on touch ([apps/docs/…/index.jsx#L62-L131](../../../apps/docs/src/components/dot-fill-button/index.jsx#L62)) — this is good design, it's just not the code being shipped.
- Sizing uses `vw`-based fluid values with `max-[1025px]:`/`max-md:` (registry) or `max-md:`/`max-sm:` (docs) step-downs for tablet/mobile — consistent with the project's fluid-typography convention (`CODING_STANDARDS.md` §5's "convert arbitrary px to vw" rule), just inconsistent about which breakpoint prefixes are used between the two copies (see Finding 2).

## Maintainability and code-quality assessment

- File is short (110 lines), single-purpose, easy to read top-to-bottom.
- Two effects with identical dependency arrays could be merged (Finding 5, Low).
- Formatting is inconsistent within the file itself: lines 1–56 use space-indentation with no leading tab, while lines 58 onward switch to tab-indentation (visible when reading raw file: the `handleMouseEnter` block and everything after it is tab-indented, everything before is space-indented). This isn't functionally meaningful but is a real diff-noise/lint-config smell suggesting the file was edited by two different formatting passes.
- No JSDoc/prop comments, but the prop names are self-explanatory (`bgColor`, `textColor`, etc.) so this is a minor, not urgent, gap.
- Constants (`staggerStep` default, easing curves) are inline rather than named module-level constants; `CODING_STANDARDS.md` §2 asks for "Magic Numbers → Named Constants" for thresholds/speeds — the cubic-bezier easing strings (`cubic-bezier(0.625, 0.05, 0, 1)`, `cubic-bezier(0.785, 0.135, 0.15, 0.86)`) at [index.jsx#L53](../../../registry/effects/buttons/dot-fill-button/index.jsx#L53) and [index.jsx#L92](../../../registry/effects/buttons/dot-fill-button/index.jsx#L92) are borderline candidates but are each used exactly once, so per the same doc's "Avoid one-off constants" guidance this is a judgment call, not a clear violation — not scored as a separate finding.

## Security and dependency concerns

- No dependencies declared ([registry.json#L8](../../../registry/effects/buttons/dot-fill-button/registry.json#L8)), so no third-party supply-chain surface.
- No secrets, tokens, or API keys present anywhere in the four files reviewed.
- All dynamic text (`btnText`, individual characters) is written via `textContent`, never `innerHTML` with unsanitized input — no XSS surface (`el.innerHTML = ""` on [index.jsx#L27](../../../registry/effects/buttons/dot-fill-button/index.jsx#L27) is only ever used to clear, not to inject).

## Browser compatibility considerations

- Relies on standard, broadly-supported CSS (`transform`, `transition`, `text-shadow`) and DOM APIs (`createElement`, `appendChild`, `style`) — no bleeding-edge features.
- The docs-site copy's `window.matchMedia` usage ([apps/docs/…/index.jsx#L63](../../../apps/docs/src/components/dot-fill-button/index.jsx#L63)) and `PointerEvent`-based `handlePointerDown` (`event.pointerType`) are both widely supported in all modern evergreen browsers; not an issue for the docs copy. The registry copy avoids these APIs entirely simply because it doesn't implement touch handling at all (Finding 2).
- `vw`-based sizing (`h-[4.2vw]`, `text-[1.5vw]`, etc.) is standard CSS, no compatibility concern, though very small viewports could theoretically produce sub-pixel or overly small tap targets — not independently measured in this static audit.

## What was checked and found clean

- `registry.json` schema completeness against `developer-new-component.md`: `name` matches the folder exactly, `type` is `"registry:component"`, `category` is exactly `"buttons"`, `main` (`index.jsx`) exists, the single entry in `files` correctly targets `src/components/effects/dot-fill-button/index.jsx`, `previewUrl` (`/demo/dot-fill-button`) matches the real demo route, `tier` is a valid value (`"pro"`), `exportName`/`exportKind` (`DotFillBtn`/`default`) match the actual export in `index.jsx`. No schema violations found.
- Public registry mirror ([apps/docs/public/r/dot-fill-button.json](../../../apps/docs/public/r/dot-fill-button.json)): metadata (name/title/description/exportName/tier/version) matches `registry.json` exactly. Its `files[0].target` of `"components/hyperiux/index.jsx"` initially looked like drift versus `registry.json`'s `"src/components/effects/dot-fill-button/index.jsx"`, but I compared it against two sibling pro-tier components (`char-stagger-button.json`, and free-tier `link-button.json`) and confirmed this generic `components/hyperiux/…` target plus omitted `content` field is the standard, intentional shape the build script emits for **pro**-tier components (source code is withheld from the public JSON and served via authenticated API per `developer-new-component.md`) — not a bug specific to this component.
- `package.json`: `name` correctly follows `@hyperiux/{slug}` convention, `version` starts at `0.0.1` per the guide. (`main`/`files` naming mismatch and its tarball consequence are captured as Findings 6 and 1 respectively.)
- No continuous `requestAnimationFrame` loop exists, so the F-042 rAF-suspension rollout (`createSuspendedRaf`/`createVisibilityGate`) legitimately does not apply to this component — confirmed by full-file read, not assumed.
- No event listeners are attached imperatively via `addEventListener` in the registry copy (hover is wired through React's synthetic `onMouseEnter`/`onMouseLeave` props), so there is no missing-cleanup risk in that copy for listener leaks. The docs-site copy's imperative `matchMedia`/`setTimeout` usage does include correct cleanup (`removeEventListener` and `clearTimeout` in effect return functions, [apps/docs/…/index.jsx#L73](../../../apps/docs/src/components/dot-fill-button/index.jsx#L73), [apps/docs/…/index.jsx#L76-L82](../../../apps/docs/src/components/dot-fill-button/index.jsx#L76)).
- No hardcoded/site-specific colors — every color is prop-driven with defaults, satisfying `developer-new-component.md`'s Step 1 code rules.
- Unicode-safe character splitting (`[...sourceText]`, not `.split("")`) — verified correct for surrogate-pair/emoji safety.
- No `dangerouslySetInnerHTML`, no secrets, no unvetted third-party dependency.

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per `CHANGE_GUIDELINES.md` scope. If addressed later, verify none of these break existing UI, responsiveness, or registry install behavior before merging, per `CHANGE_GUIDELINES.md`.

1. **(Critical)** Fix `registry/effects/buttons/dot-fill-button/package.json`'s `main`/`files` fields to reference `index.jsx` (or rename the file to match), then re-run `npm pack` and replace `registry/dist/hyperiux-dot-fill-button-0.0.1.tgz` so the tarball actually contains the component. Worth flagging to maintainers as a likely repo-wide bug across all `registry/effects/buttons/*` packages, not just this one.
2. **(High)** Reconcile `registry/effects/buttons/dot-fill-button/index.jsx` with `apps/docs/src/components/dot-fill-button/index.jsx` — port the mobile/touch handling and the `max-sm:`/`max-md:` breakpoint convention into the registry copy (the version CLI/npm users actually receive), and bump `version` in `registry.json` per the versioning workflow once done.
3. **(Medium)** Add a `prefers-reduced-motion` check (gate the transform/transition intensity or skip straight to end-state) consistent with how such handling is likely done elsewhere in the codebase — not verified elsewhere in this audit's scope.
4. **(Medium)** Add an accessible-name fallback for the split-character label (e.g., `aria-hidden="true"` on each character span plus a visually-hidden element carrying the full `btnText`, or Safari's `role="text"` container trick) so screen readers announce the word normally instead of letter-by-letter.
5. **(Low)** Merge the two `[btnText, staggerStep]` effects into one; normalize file indentation (currently split between space- and tab-indented halves of the same file).

## Final score: 5/10

## Overall severity label: Critical
