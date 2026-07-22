# arrow-fill-button (buttons)

## Summary

`arrow-fill-button` is a single-file (`index.jsx`), free-tier, `next/link`-based CTA button that reveals a colored circle fill and swaps an `ArrowRight` icon on hover (and, on touch/compact layouts, on tap). The registry metadata (`registry.json`) is fully schema-conformant and drift-free against `apps/docs/public/r/arrow-fill-button.json` and the root `registry/index.json`. The component itself is clean, well-cleaned-up (no leaked listeners/timers/rAF), and accessible at the markup level (real anchor, decorative layers `aria-hidden`, no duplicate announced text). Two concrete High-severity defects were found: (1) a **breakpoint mismatch between the CSS layout switch and the JS touch-interaction gate in the exact code that ships to installers**, which creates a viewport band (~1025–1279px, default Tailwind config) where touch devices get neither a real `:hover` nor the JS-simulated "pressed" state — the button becomes visually inert on tap in that range — invisible when testing the live docs demo because the docs app's own copy of the component uses different (locally overridden) breakpoint tokens that happen to line up with the JS constant, while the registry copy (the one actually distributed to consumer projects) does not; and (2) the **npm tarball already built for this component (`registry/dist/hyperiux-arrow-fill-button-0.0.1.tgz`) is missing the component source entirely** — verified by inspecting its contents directly — because `package.json`'s `main`/`files` point at a file (`arrow-fill-button.jsx`) that doesn't exist, so `npm pack` silently excludes the real `index.jsx`.

## Implementation overview

- Single file: `registry/effects/buttons/arrow-fill-button/index.jsx` (also `registry.json`, `package.json`). No sub-components, no shared-effect utilities.
- Renders a `next/link` `<Link>` styled as a pill button with three stacked absolutely-positioned layers: base text, a growing circular fill (`bg-(--btn-fill-bg)`) that expands from an icon-sized circle to the full pill on hover/press, a clipped "filled-state" text duplicate, and an icon slot with two `ArrowRight` icons that cross-fade/slide on hover/press ([index.jsx#L125-L200](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L125-L200)).
- `isReady` state gates the transition classes so the very first paint doesn't animate in from an unstyled state ([index.jsx#L41-L47](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L41-L47)).
- `isCompactLayout` + `isPressed` state simulate a hover-like fill/arrow-swap for touch devices, driven by `pointerdown`/`pointerup`/`pointercancel` handlers and a `matchMedia` listener ([index.jsx#L49-L123](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L49-L123)).
- All colors are prop-driven CSS custom properties (`--btn-bg`, `--btn-fill-bg`, `--btn-arrow`, etc.), no hardcoded colors baked into the JSX beyond documented defaults ([index.jsx#L136-L146](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L136-L146)).

## Strengths

- Full, correct cleanup on unmount for every effect: `cancelAnimationFrame` for the ready-frame ([index.jsx#L46](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L46)), `removeEventListener` for the `matchMedia` change listener ([index.jsx#L66-L68](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L66-L68)), and `clearTimeout` for the press-release timer, both on unmount and before re-arming ([index.jsx#L71-L77](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L71-L77), [index.jsx#L79-L88](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L79-L88)).
- Correct "wrap, don't clobber" pattern for consumer-supplied pointer handlers: `{...props}` is spread first, and the explicit `onPointerDown/Up/Cancel` handlers call `props.onPointerDown?.(event)` etc. before doing their own work, so a consumer's own handler still fires ([index.jsx#L90-L123](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L90-L123)).
- Decorative layers (fill circle, clipped text duplicate, icon wrapper) are all `aria-hidden="true"`, so screen readers announce the button's visible text exactly once via the top-level `<span>` ([index.jsx#L148](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L148), [index.jsx#L159-L168](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L159-L168)).
- `registry.json` is fully schema-conformant per `developer-new-component.md` (see "What was checked and found clean" below).
- `-webkit-mask-image` is set alongside the standard `mask-image` for the icon-circle mask, a real Safari-compat consideration that's easy to forget ([index.jsx#L176-L179](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L176-L179)).

## Risks and issues

### 1. CSS/JS breakpoint mismatch creates a dead touch-interaction zone in the shipped (registry) component — **High**

`COMPACT_LAYOUT_BREAKPOINT` is hardcoded to `1025`, and `isCompactLayout` (the flag that gates the pointer-based "pressed" simulation that stands in for `:hover` on touch devices) only becomes `true` below that width ([index.jsx#L8](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L8), [index.jsx#L49-L69](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L49-L69)). But the CSS in this exact file switches to the "compact" sizing/spacing at Tailwind's `max-xl` breakpoint — `1280px` by default — via `max-xl:h-[11vw] ...` etc. ([index.jsx#L133](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L133), repeated at [#L161](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L161), [#L183](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L183), [#L192](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L192)). Verified this project does not override `xl` (only `--breakpoint-md: 1025px` and `--breakpoint-sm: 768px` are overridden in [apps/docs/src/app/globals.css#L86-87](../../../apps/docs/src/app/globals.css#L86-L87)), so `max-xl` in this file resolves to the Tailwind default of 1280px both in this repo and in any consumer project with a stock Tailwind v4 config.

Net effect: for a touch-only device with a viewport between roughly 1025px and 1279px (e.g. an iPad Pro 11" in landscape at 1194px, iPad Air landscape at 1180px, or a Surface-class tablet), the button renders with "compact" CSS but `isCompactLayout` is still `false`, so `data-pressed` never gets set. Since there is no real mouse to trigger `:hover` on such a device, neither the CSS hover state nor the JS press-simulation fires on tap — the fill/arrow-swap animation simply never happens for that device class in that orientation. This is a functional regression on a real, common device/viewport combination in the code that actually gets installed via the CLI/registry.

Notably, this is **not visible when testing the live docs demo**: the docs app's own copy of the component (`apps/docs/src/components/arrow-fill-button/index.jsx`, used by the demo page) uses `max-md`/`max-sm` instead of `max-xl`/`max-md`, and this app overrides `--breakpoint-md` to `1025px` ([globals.css#L86](../../../apps/docs/src/app/globals.css#L86)) — which happens to exactly match the hardcoded JS constant. So the demo "accidentally" works correctly while the registry-distributed code does not. See finding #2 for the broader drift this stems from.

### 2. Docs demo copy and registry (distributed) copy have diverged — **Medium**

The demo page imports `ArrowFillButton` from `@/components/arrow-fill-button` ([apps/docs/src/app/(marketing)/demo/arrow-fill-button/page.js#L4](<../../../apps/docs/src/app/(marketing)/demo/arrow-fill-button/page.js#L4>)), i.e. the docs-site build copy at `apps/docs/src/components/arrow-fill-button/index.jsx`, not the registry copy that `previewUrl` is meant to be previewing. A direct diff shows the two are no longer identical: Tailwind breakpoint tokens differ (`max-md`/`max-sm` in the docs copy vs. `max-xl`/`max-md` in the registry copy, at every one of the 5 responsive class lists), plus a trivial default-prop spacing difference (`btnText="Hover Me"` vs `btnText = "Hover Me"`). Per `developer-new-component.md`'s own model ("You build in `src/components/`, then copy the source into `registry/effects/`"), these are supposed to stay in sync as a copy-paste, but they've drifted. Confirmed via:
```
diff apps/docs/src/components/arrow-fill-button/index.jsx registry/effects/buttons/arrow-fill-button/index.jsx
```
which reports differences at the default-prop line and all five `max-xl`/`max-md` vs `max-md`/`max-sm` responsive class strings. Practical impact: what a user sees at `/demo/arrow-fill-button` is not a faithful preview of what `npx <cli> add arrow-fill-button` actually installs (see finding #1 for the concrete behavioral consequence of this drift).

### 3. No `prefers-reduced-motion` handling — **Medium**

None of the transition-bearing class strings check `prefers-reduced-motion`; the 450ms cubic-bezier transitions for the fill circle, clipped text, and icon swap are applied unconditionally whenever `isReady` is true ([index.jsx#L153-L156](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L153-L156), [#L162-L165](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L162-L165), [#L172-L175](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L172-L175), [#L184-L187](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L184-L187), [#L193-L196](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L193-L196)). There's no `motion-reduce:` Tailwind variant or `matchMedia("(prefers-reduced-motion: reduce)")` check anywhere in the file. This is a per-instance hover animation (not a large/continuous motion effect), so the impact is bounded, but it's a real, documented WCAG 2.3.3 best-practice gap.

### 4. `package.json` `main`/`files` bug already produced a broken npm tarball missing the component source — **High**

`package.json` declares `"main": "arrow-fill-button.jsx"` and `"files": ["arrow-fill-button.jsx", "registry.json"]` ([package.json#L5-L9](../../../registry/effects/buttons/arrow-fill-button/package.json#L5-L9)), but the only source file in the folder is `index.jsx` — there is no `arrow-fill-button.jsx`. This isn't just a theoretical `require()` break: I inspected the tarball already built and committed in this repo at `registry/dist/hyperiux-arrow-fill-button-0.0.1.tgz` via `tar -tzf`, and it contains only:
```
package/package.json
package/registry.json
```
**`index.jsx` — the actual component code — is not in the tarball at all.** Because `npm pack`/`npm publish` filters the package contents by the `files` array, and that array only lists a filename that doesn't exist plus `registry.json`, the real source file is silently excluded. Per `developer-new-component.md` Step 9, this tarball is the distributable artifact for the npm install path; as it stands today, installing `@hyperiux/arrow-fill-button` from this tarball gives a package with no component code whatsoever — a concrete, already-realized break of the packaging/CLI install flow, not just a latent risk. This exact mismatch pattern (`main` = `{slug}.jsx`, real file = `index.jsx`) was also found in sibling button effects (`dot-fill-button`, `char-stagger-primary-button`, `animated-toggle`, `char-stagger-button`, `scramble-link-button`), so it looks like a repo-wide template issue rather than something specific to this component — noted here because it's present, and already manifesting as a broken build artifact, in this component's own distribution. Note: the shadcn-style registry install flow (`public/r/arrow-fill-button.json`) is unaffected by this bug, since it reads `main`/`files` from `registry.json`, not `package.json` (confirmed correct there — see "found clean"); only the standalone npm-package distribution path is broken.

### 5. `package.json` has no `peerDependencies` and doesn't declare `lucide-react` anywhere in itself — **Low**

`developer-new-component.md` Step 5 says `package.json` should list `peerDependencies` including `react` and any major packages the component uses. This file has an empty `dependencies: {}` and no `peerDependencies` key at all ([package.json#L1-L14](../../../registry/effects/buttons/arrow-fill-button/package.json)), even though the component imports `lucide-react` ([index.jsx#L5](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L5)) and `react`. `registry.json`'s `dependencies` field does correctly list `lucide-react` ([registry.json#L8-L10](../../../registry/effects/buttons/arrow-fill-button/registry.json#L8-L10)), so the CLI install path is unaffected; this only matters for the standalone npm-package distribution path.

### 6. Naive substring heuristic for "does this className already set a background" — **Low**

`usesUtilityBackground` is computed as `className.includes("bg-") || className.includes("from-") || className.includes("via-") || className.includes("to-")` ([index.jsx#L35-L39](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L35-L39)). This is a plain substring match, not a Tailwind-class-boundary-aware check. A consumer-supplied `className` containing an unrelated substring — e.g. `"photo-frame"` (contains `"oto-"`... specifically `"to-"` at index 3-5), `"auto-scroll"`, or `"moto-icon"` — would false-positive and cause the component to silently drop `bg-(--btn-bg)`, leaving the button with no background color even though the consumer never intended to supply one via a gradient/bg utility.

### 7. Handler naming and repeated-guard duplication deviate from `CODING_STANDARDS.md` — **Low**

- `CODING_STANDARDS.md`'s naming table prescribes `onEventName` for "All event handlers" ([CODING_STANDARDS.md](../../../CODING_STANDARDS.md), Naming Conventions table). This file uses `handlePointerDown`/`handlePointerUp`/`handlePointerCancel` instead ([index.jsx#L90](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L90), [#L105](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L105), [#L115](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L115)).
- The standard's "Extract repeated guards" rule says a condition repeated more than twice should be extracted. `if (!isCompactLayout || event.pointerType === "mouse") { return; }` (or its early-return equivalent) is repeated verbatim 3 times across the three pointer handlers ([index.jsx#L93-95](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L93-L95), [#L108-110](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L108-L110), [#L118-120](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L118-L120)) and was never factored into a shared `isTouchInteraction(event)` helper.

### 8. Unclamped `vw`-based sizing has no upper bound — **Low**

`text-[1.1vw]`, `size-[1.5vw]`, and `--icon-circle:3.1vw` ([index.jsx#L133](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L133), [#L171](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L171), [#L183](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L183)) scale linearly with viewport width above the `xl` breakpoint with no `clamp()`/max cap. On an ultra-wide or 4K desktop viewport (e.g. 3840px) this computes to roughly a 42px label and a ~119px icon circle — not broken, but unbounded and untested at that scale.

### 9. Demo page: generic alt text on a decorative background image — **Low**

`apps/docs/src/app/(marketing)/demo/arrow-fill-button/page.js` renders a full-bleed background photo behind a `bg-black/70` overlay with `alt="bg image"` ([page.js#L34-L44](<../../../apps/docs/src/app/(marketing)/demo/arrow-fill-button/page.js#L34-L44>)). The image is purely decorative (it conveys no content beyond mood), so per WCAG it should use `alt=""` rather than a non-empty but non-descriptive string that screen readers will still announce. This is a demo-page issue, not a component issue.

## Accessibility assessment

- The interactive element is a real `<Link>`/`<a>`, not a `<div>` with a click handler, so it is natively keyboard-focusable and activatable, and is correctly exposed to assistive tech as a link ([index.jsx#L126-L147](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L126-L147)).
- Button label text is present exactly once in the accessibility tree; the duplicate "filled-state" text layer and both `ArrowRight` icons are `aria-hidden="true"` ([index.jsx#L150](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L150), [#L159-160](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L159-L160), [#L180](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L180)).
- No custom `focus`/`focus-visible` styling is defined anywhere in the class list; the component relies entirely on the browser's default focus ring (nothing in the file suppresses `outline`). This isn't a defect, but it also isn't a deliberate, on-brand focus treatment — worth a design pass, not scored as a finding since default outlines remain functional.
- `prefers-reduced-motion` is not respected (Risk #3, Medium).
- The touch/tap-simulation dead zone described in Risk #1 (High) is itself an accessibility-adjacent issue: on affected tablet widths, a touch user gets no visual confirmation their tap registered before navigation occurs.

## Performance assessment

- No continuous `requestAnimationFrame` loop exists in this component — the only `requestAnimationFrame` call is a one-shot "wait one frame, then mark ready" ([index.jsx#L42-L44](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L42-L44)), so the rAF-suspension pattern (`createSuspendedRaf`/`createVisibilityGate` from `registry/effects/_shared/README.md`) does not apply here, per the audit's own instruction to only require it for genuine continuous rAF loops. Confirmed clean — not flagged as a finding.
- All animation is done via CSS transitions (`transition-all duration-450 ...`), which run on the compositor/GPU path for `transform`/`opacity`-adjacent properties, not JS-driven per-frame work.
- No unbounded loops, no unmemoized expensive computation, no missing cleanup (see Strengths). Cannot verify actual paint/layout cost (e.g., whether animating `inset`/`clip-path` triggers layout thrash) without a runtime profiling pass — no such trace was available in this audit, so this is noted as unverified rather than asserted.

## SEO and content-surface assessment

- The component renders a genuine `<a href>` via `next/link`, so its destination is crawlable and indexable — no `<div onClick>` anti-pattern.
- `href` defaults to `"#"` ([index.jsx#L7](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L7)); this is a documented, intentional placeholder default for a reusable button component, not a bug, but any real deployment must set a real `href` or the link will point at the current page's URL fragment.
- Demo page decorative image alt text issue noted in Risk #9 (Low).

## Responsive / mobile / touch behavior assessment

- Two responsive breakpoints keyed to Tailwind `max-xl`/`max-md` classes adjust height, padding, font size, and icon-circle size for progressively smaller viewports ([index.jsx#L133](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L133), [#L161](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L161), [#L183](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L183), [#L192](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L192)).
- Touch handling is deliberate: a `pointerType === "mouse"` check means the tap-simulation logic doesn't fire on real mice/trackpads even inside the "compact" width range, avoiding double-triggering with genuine `:hover` ([index.jsx#L93](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L93), [#L108](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L108), [#L118](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L118)).
- The core defect in this category is Risk #1 (High): the CSS compact-layout threshold and the JS touch-simulation threshold disagree in the shipped code, producing a real dead zone for touch devices in the ~1025–1279px viewport band.
- No explicit min-width/orientation handling beyond the two breakpoints; unbounded `vw` scaling above `xl` is Risk #8 (Low).

## Maintainability and code-quality assessment

- File-structure ordering mostly follows `CODING_STANDARDS.md` (constants at top, state/refs first) but `usesUtilityBackground` (a derived value) is computed before the `useEffect` blocks rather than after, per the doc's prescribed "State & Refs → Effects → Derived values → Return" ordering ([index.jsx#L35-L47](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L35-L47)) — a minor ordering nit, not called out as a scored finding on its own.
- Naming and DRY deviations from `CODING_STANDARDS.md` are captured in Risk #7 (Low).
- The component is otherwise compact, single-purpose, and easy to read top-to-bottom; no dead code, no unused props, no leftover debug code found.

## Security and dependency concerns

- No secrets, tokens, or credentials in source.
- No use of `dangerouslySetInnerHTML`, no unescaped interpolation of user-controlled HTML — `btnText` is rendered as plain JSX children (React-escaped), not injected as raw HTML, so there is no XSS vector even though `btnText` is fully consumer-controlled.
- Sole runtime dependency is `lucide-react`, a widely-used, actively maintained icon library; declared correctly in `registry.json` ([registry.json#L8-L10](../../../registry/effects/buttons/arrow-fill-button/registry.json#L8-L10)). No version pin is specified in `registry.json` (dependency list has no version strings), consistent with sibling effects — not flagged as a unique issue here.

## Browser compatibility considerations

- `mask-image` is given both a standard and `-webkit-` prefixed value, covering Safari ([index.jsx#L176-L179](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L176-L179)) — a good, deliberate compat choice.
- `clip-path: inset(...)`, CSS custom properties, `matchMedia`, and the Pointer Events API (`onPointerDown`/`onPointerUp`/`onPointerCancel`) are all broadly supported in evergreen browsers (Chrome/Edge/Firefox/Safari current and last-2 versions); no polyfills are needed or present.
- Arbitrary-value Tailwind v4 syntax (`bg-(--btn-fill-bg)`, `max-xl:`) is a build-time-only concern (resolved by the Tailwind compiler), not a runtime browser-compat concern.

## What was checked and found clean

- `registry.json` schema conformance against `developer-new-component.md`: `name` matches the folder (`arrow-fill-button`) ✓; `type` is `"registry:component"` ✓; `category` is exactly `"buttons"` ✓; `tier` is `"free"` ✓ (valid enum value); `main` (`"index.jsx"`) points at a file that exists ✓; the single entry in `files` correctly references `index.jsx` with a target matching `importPath`/`target` ✓; `previewUrl` (`/demo/arrow-fill-button`) matches the actual demo route at `apps/docs/src/app/(marketing)/demo/arrow-fill-button/page.js` ✓; `exportName`/`exportKind` (`ArrowFillButton`/`default`) match the actual `export default function ArrowFillButton` ✓ ([index.jsx#L11](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L11), [#L204](../../../registry/effects/buttons/arrow-fill-button/index.jsx#L204)).
- Root `registry/index.json` entry for `arrow-fill-button` is consistent with the component's own `registry.json` (`registryPath`, `importPath`, `target`, `previewUrl` all match) — confirmed via `grep`.
- Generated public mirror `apps/docs/public/r/arrow-fill-button.json` embeds the exact registry `index.jsx` source verbatim (including the `max-xl`/`max-md` breakpoint classes) — the build script itself is not introducing any additional drift; the drift is solely between the two hand-maintained source copies (registry vs. docs-app), not between registry and its generated output.
- No stray/duplicate source files in the registry folder that could confuse `build-registry.js`'s extension-based entry-point detection (only `index.jsx`, `package.json`, `registry.json` present).
- No `@/`-alias imports between the component's own files (there's only one file, and its only import besides React/Next is the external `lucide-react` package).
- All `useEffect` hooks have correct, complete cleanup — no leaked listeners, timers, or rAF handles (see Strengths and Performance assessment).
- No continuous rAF loop exists, so the F-042 rAF-suspension pattern does not apply to this component (confirmed against `registry/effects/_shared/README.md`); this is not a gap.
- No secrets, unescaped HTML injection, or other security exposure found.
- `registryDependencies: []` is correct — the component has no dependency on other Hyperiux registry packages.

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per `CHANGE_GUIDELINES.md`. If addressed later, any fix must be re-verified against desktop hover, tablet-width touch, and mobile-width touch, and must not alter the public prop API. Priority order:

1. **(High)** Fix `package.json`'s `main`/`files` fields so the npm tarball actually includes `index.jsx` — this is not a latent risk, the tarball already sitting in `registry/dist/` is broken today. Since the identical pattern exists across multiple sibling `buttons` effects, this likely warrants a single batch/template fix (and a re-pack of every affected tarball) rather than a one-off patch here.
2. **(High)** Reconcile the JS `COMPACT_LAYOUT_BREAKPOINT` constant with the actual CSS breakpoint used in the registry copy (`max-xl` / 1280px), or vice versa, so the touch-press simulation window and the CSS compact-layout window are the same threshold in the code that actually ships to installers.
3. **(Medium)** Re-sync `apps/docs/src/components/arrow-fill-button/index.jsx` and `registry/effects/buttons/arrow-fill-button/index.jsx` so the live demo is a faithful preview of the distributed code — ideally by having the demo page import from (or be generated from) the registry copy rather than maintaining two hand-edited copies.
4. **(Medium)** Add `motion-reduce:transition-none` (or an equivalent `prefers-reduced-motion` check) to the transition-bearing class strings.
5. **(Low)** Add `peerDependencies` for `react`/`lucide-react` to `package.json`.
6. **(Low)** Replace the substring-based `usesUtilityBackground` check with a Tailwind-class-boundary-aware check (e.g. a regex anchored on `\b` or a dedicated `noBackground` prop) to avoid false positives on unrelated class names.
7. **(Low)** Rename `handlePointerDown/Up/Cancel` to the `onEventName` convention and extract the repeated `isCompactLayout && pointerType !== "mouse"` guard into a single helper, per `CODING_STANDARDS.md`.
8. **(Low)** Set `alt=""` on the decorative background `<Image>` in the demo page.

## Final score: 5.5/10

## Overall severity label: High
