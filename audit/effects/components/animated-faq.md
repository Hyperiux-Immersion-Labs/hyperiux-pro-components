# animated-faq (components)

## Summary

`animated-faq` is a headless, compound-component accordion (`FAQGroup` / `FAQWrapper` / `FAQTitle` / `FAQContent`) built on GSAP height tweens, with a single source file (`index.jsx`), a valid `registry.json`, and a working demo route. The distributed implementation is functionally sound — controlled/uncontrolled state, `aria-expanded`/`aria-controls`/`role="region"` wiring, and keyboard support are all present — but the public demo page does not actually render this registry source; it imports a diverged legacy copy from `apps/docs/src/components/animated-faq`, so what visitors preview does not match what the CLI installs. There is also no `prefers-reduced-motion` handling, no cleanup of in-flight GSAP tweens on unmount, and the whole-wrapper `role="button"` pattern inflates the accessible name once an item is open. No critical or high-severity issues were found; all findings are Medium/Low.

## Implementation overview

- Single file: [`registry/effects/components/animated-faq/index.jsx`](../../../registry/effects/components/animated-faq/index.jsx) (332 lines). No sub-components.
- Compound API exported as `AnimatedFAQ = { Group, Wrapper, Title, Content }` (default export) plus four named exports, via React Context (`FAQContext`, `FAQGroupContext`).
- `FAQGroup` manages open-item state (controlled via `value`/`onChange`, or uncontrolled via `defaultOpenItems`); supports single-open or `allowMultiple`.
- `FAQWrapper` renders a `div[role="button"]` per item, wires `aria-expanded`/`aria-controls`, handles click/keyboard toggling, and runs the GSAP open/close height tween in a `useEffect`.
- `FAQTitle` renders the question row and a rotating `ChevronDown` icon.
- `FAQContent` renders a `role="region"` panel, `aria-labelledby` pointing back to the trigger.
- Demo: [`apps/docs/src/app/(marketing)/demo/animated-faq/page.js`](../../../apps/docs/src/app/(marketing)/demo/animated-faq/page.js), a static 3-item FAQ list on a full-bleed black section.

## Strengths

- Proper ARIA wiring end to end: `role="button"` + `tabIndex={0}` + `aria-expanded` + `aria-controls` on the trigger ([`index.jsx#L230-243`](../../../registry/effects/components/animated-faq/index.jsx#L230)), and `role="region"` + `aria-labelledby` on the panel ([`index.jsx#L306-317`](../../../registry/effects/components/animated-faq/index.jsx#L306)).
- Keyboard support for Enter/Space is implemented explicitly ([`index.jsx#L161-166`](../../../registry/effects/components/animated-faq/index.jsx#L161)), not just relying on native click semantics.
- `handleWrapperClick` deliberately ignores clicks on nested interactive elements via `event.target.closest("a, button, input, textarea, select")` ([`index.jsx#L151-159`](../../../registry/effects/components/animated-faq/index.jsx#L151)), showing the author anticipated rich content inside the answer.
- Controlled/uncontrolled duality is handled cleanly and consistently at both the group level (`FAQGroup`, [`index.jsx#L48-55`](../../../registry/effects/components/animated-faq/index.jsx#L48)) and the standalone level (`FAQWrapper`'s `controlledOpen`, [`index.jsx#L117-124`](../../../registry/effects/components/animated-faq/index.jsx#L117)).
- `normalizeOpenItems`/`String(itemId)` coercion ([`index.jsx#L19-29`](../../../registry/effects/components/animated-faq/index.jsx#L19), [`#L59`](../../../registry/effects/components/animated-faq/index.jsx#L59), [`#L115`](../../../registry/effects/components/animated-faq/index.jsx#L115)) avoids a common accordion bug where numeric vs. string item ids silently fail `.includes()` matches.
- `gsap.killTweensOf([outer, inner])` at the top of the effect ([`index.jsx#L174`](../../../registry/effects/components/animated-faq/index.jsx#L174)) prevents overlapping tweens if a user toggles rapidly.
- `registry.json` is fully schema-valid against `developer-new-component.md` (see below) — no CLI-install-breaking issues.

## Risks and issues

1. **Demo renders a diverged legacy copy, not the registry source (Medium).**
   The demo page imports `{ FAQContent, FAQGroup, FAQTitle, FAQWrapper } from "@/components/animated-faq"` ([`apps/docs/src/app/(marketing)/demo/animated-faq/page.js#L3-8`](<../../../apps/docs/src/app/(marketing)/demo/animated-faq/page.js#L3>)). The `@/*` alias resolves to `apps/docs/src/*` ([`apps/docs/jsconfig.json#L4`](../../../apps/docs/jsconfig.json#L4)), so this loads [`apps/docs/src/components/animated-faq/index.jsx`](../../../apps/docs/src/components/animated-faq/index.jsx) — a separate, meaningfully different implementation from the registry source at [`registry/effects/components/animated-faq/index.jsx`](../../../registry/effects/components/animated-faq/index.jsx) (confirmed via `diff`, non-trivial delta). Concrete divergences:
   - Legacy copy uses `useIsomorphicLayoutEffect` (`useLayoutEffect`) for the animation effect ([`apps/docs/src/components/animated-faq/index.jsx#L156`](../../../apps/docs/src/components/animated-faq/index.jsx#L156)); the registry copy uses plain `useEffect` ([`index.jsx#L168`](../../../registry/effects/components/animated-faq/index.jsx#L168)).
   - Legacy copy computes open height from `outer.scrollHeight` and remembers it in `openHeightRef` for the closing tween ([`apps/docs/src/components/animated-faq/index.jsx#L170-200`](../../../apps/docs/src/components/animated-faq/index.jsx#L170)); the registry copy uses `inner.offsetHeight` for opening and animates to `0` from whatever GSAP reads as the outer's current computed height for closing ([`index.jsx#L186`](../../../registry/effects/components/animated-faq/index.jsx#L186), [`#L202-211`](../../../registry/effects/components/animated-faq/index.jsx#L202)).
   - Legacy copy adds an `iconMode="rotate-left-down"` variant using `ChevronRight` ([`apps/docs/src/components/animated-faq/index.jsx#L240-270`](../../../apps/docs/src/components/animated-faq/index.jsx#L240)) that does not exist in the registry copy at all.
   - Legacy copy's closed-panel style is `height: isOpen ? "auto" : 0` with no `display: none` ([`apps/docs/src/components/animated-faq/index.jsx#L313-315`](../../../apps/docs/src/components/animated-faq/index.jsx#L313)), whereas the registry copy explicitly sets `display: "none"` when closed ([`index.jsx#L312-315`](../../../registry/effects/components/animated-faq/index.jsx#L312)) — a real behavioral difference (see Accessibility section).
   This is exactly the "legacy copy" drift pattern the audit brief calls out. It means the docs-site preview is not representative of the code a customer actually installs via the CLI (`registry.json#L16` `"main": "index.jsx"` → the registry copy). Per `developer-new-component.md`, `src/components/` is supposed to be the pre-registry build location that then gets copied verbatim into `registry/effects/`; here the two have since diverged post-copy.

2. **No `prefers-reduced-motion` handling (Medium).**
   The open/close GSAP tween in the registry source always runs at full `duration` (default `0.45`s, demo overrides to `0.5`s) regardless of the user's OS-level reduced-motion preference. No `matchMedia("(prefers-reduced-motion: reduce)")` check exists anywhere in the file (confirmed via grep across the effect folder — zero matches). Cite: [`index.jsx#L168-213`](../../../registry/effects/components/animated-faq/index.jsx#L168).

3. **No cleanup of in-flight GSAP tweens on unmount (Medium).**
   The `useEffect` at [`index.jsx#L168-213`](../../../registry/effects/components/animated-faq/index.jsx#L168) has no `return` cleanup function. If a consumer unmounts the tree while an item is mid-animation (e.g., a route change during an open/close tween), the tween keeps running against detached DOM nodes for up to `duration` seconds until it completes or is garbage collected. Impact is bounded (max ~0.5s per the demo's `duration` prop, no continuous loop), but this is a real gap against the repo's own standard ("Every `addEventListener` needs a corresponding `removeEventListener`... Cleanup - always remove what you added," `CODING_STANDARDS.md` §6) applied to the GSAP-tween equivalent (`gsap.killTweensOf` on unmount is the idiomatic fix, not applied here).

4. **`role="button"` wrapper spans the whole item (title + content), inflating the accessible name and risking nested-interactive-control conflicts (Medium, accessibility).**
   `FAQWrapper` puts `role="button"`/`tabIndex={0}`/`aria-expanded` on a `<div>` that wraps **both** `FAQTitle` and `FAQContent` as children ([`index.jsx#L228-243`](../../../registry/effects/components/animated-faq/index.jsx#L228); confirmed in actual usage at [`apps/docs/src/app/(marketing)/demo/animated-faq/page.js#L38-52`](<../../../apps/docs/src/app/(marketing)/demo/animated-faq/page.js#L38>), where `<FAQWrapper>` directly contains both `<FAQTitle>` and `<FAQContent>`). Two consequences:
   - Per the accessible-name computation algorithm, once a panel is open (`display: block`), all its visible descendant text — the full answer, not just the question — becomes part of the `role="button"` element's accessible name. A screen-reader user tabbing to an open item hears the entire answer read out as the "button" label, not just the question.
   - The component explicitly supports interactive content inside `FAQContent` (the `.closest("a, button, input, textarea, select")` guard at [`index.jsx#L151-159`](../../../registry/effects/components/animated-faq/index.jsx#L151) only makes sense if consumers put links/buttons in the answer). Any such control ends up nested inside a widget-role (`button`) ancestor, which ARIA authoring practices advise against (a focusable/interactive descendant inside another interactive-role container produces inconsistent AT behavior). The current demo content is plain text/list items with no real anchors or buttons, so this is not manifesting today, but it is a latent issue baked into the component's own supported API.

## Accessibility assessment

- Trigger semantics (`role="button"`, `tabIndex`, `aria-expanded`, `aria-controls`) and panel semantics (`role="region"`, `aria-labelledby`) are correctly paired — confirmed clean.
- Keyboard operability (Enter/Space) is implemented, not just inherited from a native `<button>` — confirmed clean ([`index.jsx#L161-166`](../../../registry/effects/components/animated-faq/index.jsx#L161)).
- Icon is `aria-hidden="true"` ([`index.jsx#L268`](../../../registry/effects/components/animated-faq/index.jsx#L268)) — correctly excluded from the accessibility tree — confirmed clean.
- Issue #4 above (accessible-name inflation / nested-interactive risk) is the main gap.
- Issue #2 above (no reduced-motion handling) also falls partly under accessibility (vestibular-disorder users).
- A native `<button>` was not used for the trigger (a `<div role="button">` was used instead); given the correct ARIA/keyboard shim this is not a functional blocker, but it is a deviation from "prefer native interactive elements" best practice, noted for completeness (not scored separately — folded into finding #4's severity).

## Performance assessment

- No continuous `requestAnimationFrame` loop exists — all motion is driven by discrete GSAP tweens fired on toggle, each bounded to `duration` seconds. Per the audit brief's rule ("Only flag missing rAF-suspension as a Medium finding if the effect genuinely runs a continuous rAF loop"), **no rAF-suspension finding applies here** — confirmed via full read of the file, no `requestAnimationFrame` call anywhere.
- `components` was explicitly out of scope for the F-042 rAF-suspension rollout per [`registry/effects/_shared/README.md`](../../../registry/effects/_shared/README.md), consistent with the above.
- The unmount-cleanup gap (finding #3) is the only performance-adjacent concern, and it is bounded, not unbounded.
- No automated performance test/benchmark exists in this repo for this component; any claim beyond static code reading (e.g., actual frame timing) cannot be verified and is not asserted here.

## SEO and content-surface assessment

- FAQ answer content stays in the DOM at all times — the registry copy toggles only inline `style.display`/`height` ([`index.jsx#L306-323`](../../../registry/effects/components/animated-faq/index.jsx#L306)), it never conditionally unmounts children — so crawlers indexing rendered HTML see the full question/answer text even when collapsed. This is good for SEO/crawlability — confirmed clean for the registry copy.
- No `FAQPage` JSON-LD structured data is emitted by either the component or the demo page — a missed opportunity for rich-result eligibility in search, but this is a suggestion, not a defect (structured data is a page-level/demo-content concern, not something a headless UI primitive should own).
- The demo page's `generateMetadata` delegates to `getDemoPageMetadata("animated-faq")` ([`apps/docs/src/app/(marketing)/demo/animated-faq/page.js#L102-104`](<../../../apps/docs/src/app/(marketing)/demo/animated-faq/page.js#L102>)) — metadata generation itself was not traced further as it is shared infrastructure outside this effect's scope.

## Responsive / mobile / touch behavior assessment

- The component itself is style-agnostic — no internal breakpoints, fixed pixel widths, or viewport assumptions in `index.jsx`; all sizing/spacing is left to consumer-supplied `className`/`titleClassName`/`contentClassName`/`iconClassName` props. Confirmed clean.
- Touch interaction works through the standard `onClick` handler (no separate touch-specific code needed, and none is present) — no touch-target sizing is enforced by the component (e.g., no minimum height/padding guarantee), so meeting a 44×44px touch target is entirely the consumer's responsibility via `className`. Not flagged as a defect since this is a headless primitive, but worth noting for anyone copy-pasting the demo's classes verbatim.
- The demo page itself uses `max-sm:`/`max-md:` responsive prefixes correctly per `CODING_STANDARDS.md` §5 (e.g., [`apps/docs/src/app/(marketing)/demo/animated-faq/page.js#L25-32`](<../../../apps/docs/src/app/(marketing)/demo/animated-faq/page.js#L25>)) for the heading/subtext, though the FAQ item container itself (`max-w-4xl`) does not have additional responsive overrides — acceptable for a single fixed-width column layout.

## Maintainability and code-quality assessment

- File structure roughly follows `CODING_STANDARDS.md` §1 (imports → context → helper → components), though there are no section comments (`// State & Refs`, etc.) — file is short enough (332 lines split across 4 exported components) that this is a minor nit, not flagged as a separate finding.
- Naming conventions (`camelCase`, `onEventName` handlers) are followed correctly — confirmed clean.
- No dead code, no unused imports/variables, no stray `console.log` — confirmed clean via full read.
- Default export as a compound object (`AnimatedFAQ = { Group, Wrapper, Title, Content }`, [`index.jsx#L325-330`](../../../registry/effects/components/animated-faq/index.jsx#L325)) diverges from the literal `export default function ComponentName()` example in `developer-new-component.md` Step 1 (Low) — this is a legitimate, common compound-component pattern and does not break anything functionally or in the registry pipeline; flagged only as a documentation-convention mismatch.
- `registry/effects/components/animated-faq/package.json` has no `peerDependencies` field at all ([`package.json#L1-17`](../../../registry/effects/components/animated-faq/package.json)), where `developer-new-component.md` Step 5 calls for listing `react` and major packages like `gsap` as peer dependencies for the npm tarball (Low). Only `"dependencies": {"gsap": "*"}` is present; `lucide-react` (used at [`index.jsx#L14`](../../../registry/effects/components/animated-faq/index.jsx#L14)) is also absent from `package.json` dependencies entirely, even though it correctly appears in `registry.json`'s `dependencies` array (Low — inconsistency between the two manifests, though `registry.json` is the one the CLI install flow actually reads for dependency install, so this does not break installs).

## Security and dependency concerns

- No secrets, tokens, or credentials in source — confirmed clean.
- No `dangerouslySetInnerHTML` or raw HTML injection; all content is passed as React children/JSX, so no XSS surface from user-supplied FAQ text — confirmed clean.
- Dependencies (`gsap`, `lucide-react`) are both established, widely used packages already used elsewhere in this repo — no new/unusual dependency introduced.

## Browser compatibility considerations

- Uses `useId()` (React 18+) — fine as long as the host app is on React 18+, which is standard for this registry's target stack; not independently verified against a repo-wide React version floor.
- GSAP handles cross-browser tweening; no raw browser API usage beyond standard DOM (`element.closest`, `KeyboardEvent.key`) which are broadly supported in all evergreen browsers.
- No Safari-specific or older-browser-specific problems identified from static reading; no automated cross-browser test exists in this repo to verify further, so this is a static-analysis-only assessment.

## What was checked and found clean

- `registry.json` schema completeness against `developer-new-component.md`: `name` matches folder (`animated-faq`), `type` is `"registry:component"`, `category` is exactly `"components"`, `tier` is a valid value (`"free"`), `main` (`index.jsx`) exists, `files` array is complete and correctly targets the only file, `exportName`/`exportKind` match the actual export (`export default AnimatedFAQ`), `importPath`/`target` are consistent with each other and with the CLI convention used across the rest of the registry.
- `previewUrl` (`/demo/animated-faq`) matches the actual demo route file at `apps/docs/src/app/(marketing)/demo/animated-faq/page.js` — confirmed clean.
- Root registry index entry at [`registry/index.json#L220-229`](../../../registry/index.json#L220) is present and consistent with the component's own `registry.json`.
- Public mirror at [`apps/docs/public/r/animated-faq.json`](../../../apps/docs/public/r/animated-faq.json) exactly matches the current registry source (byte-for-byte diff of the embedded `content` field against `index.jsx`, aside from expected JSON-escaping) — no build drift between the registry source and the generated public JSON.
- No continuous `requestAnimationFrame` loop — rAF-suspension pattern (`createSuspendedRaf`/`createVisibilityGate`) is correctly not applicable to this effect, and `components` is confirmed out of the F-042 rollout scope regardless.
- No hardcoded colors in the component — all styling is consumer-supplied via `className` props, per `developer-new-component.md`'s "no hardcoded colors" rule.
- `FAQGroup`/`FAQWrapper` controlled-vs-uncontrolled state logic reviewed line by line — no state desync bugs found (id normalization via `String()` prevents a common numeric/string id mismatch class of bug).
- No secrets, unescaped HTML injection, or unsafe dependencies.

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per instructions. If addressed later, verify against `CHANGE_GUIDELINES.md` (no UI/responsiveness/registry-behavior regressions) before shipping any fix. Priority order:

1. **Resolve the demo/registry drift** (finding #1) — either repoint the demo import to the registry source, or intentionally resync `apps/docs/src/components/animated-faq/index.jsx` from the registry copy per the documented Step 1→3 "build then copy" workflow, so the public preview matches installed code. This is the highest-leverage fix since it affects what every prospective user evaluates before installing.
2. **Add `prefers-reduced-motion` handling** (finding #2) — e.g., skip/shorten the GSAP tween when `matchMedia("(prefers-reduced-motion: reduce)").matches` is true.
3. **Add tween cleanup on unmount** (finding #3) — return `() => gsap.killTweensOf([outer, inner])` from the effect at [`index.jsx#L168-213`](../../../registry/effects/components/animated-faq/index.jsx#L168).
4. **Reconsider the `role="button"` scope** (finding #4) — scope the interactive/button role to just the title row rather than the whole title+content wrapper, so the accessible name doesn't balloon when open and nested interactive content in the answer isn't inside a widget-role ancestor. This would be a structural change (moving `role`/`tabIndex`/handlers from `FAQWrapper`'s outer div onto a dedicated trigger element within `FAQTitle`) and should be scoped carefully against `CHANGE_GUIDELINES.md`'s "do not impact the UI" constraint before implementation.
5. **Low-priority polish**: add `peerDependencies` to `package.json`, add `lucide-react` to its `dependencies`, and consider aligning the default export style/documentation with `developer-new-component.md`'s literal example (or updating that doc to acknowledge compound-component patterns).

## Final score: 7/10

## Overall severity label: Medium
