# hover-stack (components)

## Summary

`hover-stack` is a two-file, CSS-transform card-stack component: `HoverStackComp.jsx` is a genuinely reusable, prop-driven primitive (card width/height/overlap/lift/push distance, `className` passthrough, a responsive mobile fallback), but the registry's actual entry point, `index.jsx`, is not a reusable component at all — it is a hardcoded marketing section (fixed heading, fixed body copy, seven hardcoded testimonial-card objects with fixed colors/text) that violates this repo's own "no demo wrappers, accept `className`, no hardcoded content" rules for `index.jsx`. Registry metadata (`registry.json`) is internally consistent and matches the demo route, but `package.json` points `main`/`files` at a nonexistent `hover-stack.jsx` and omits `HoverStackComp.jsx`, and the live docs demo page renders a stale, independently-diverged duplicate of the component from `apps/docs/src/components/hover-stack/` rather than the registry source. No accessibility affordance exists for keyboard users to trigger the hover fan-out, and there is no `prefers-reduced-motion` handling. No continuous rAF loop is used (pure CSS transitions on hover), so rAF-suspension does not apply here.

## Implementation overview

- `registry/effects/components/hover-stack/index.jsx` — default-exports `HoverStack`, a fixed `<section>` with a hardcoded `h1`/`p` and a hardcoded 7-item `cards` array (quotes, tags, background hex colors), rendering `<HoverStackComp cards={cards} cardWidth={280} cardHeight={360} overlap={96} pushDistance={235} hoverLift={30} />`. This is the file `registry.json` designates as `main` and the file the CLI installs as the component entry point.
- `registry/effects/components/hover-stack/HoverStackComp.jsx` — `"use client"` component accepting `cards`, `cardWidth`, `cardHeight`, `overlap`, `hoverLift`, `pushDistance`, `className`. Tracks `activeIndex` (hover target), `isSmallScreen` (via a `resize` listener against a `1025px` breakpoint), and `hasMounted` (to avoid SSR/CSR mismatch, returning `null` until mounted — [HoverStackComp.jsx#L101-L103](registry/effects/components/hover-stack/HoverStackComp.jsx#L101-L103)). Below the breakpoint it renders a plain vertical stack of full cards (no hover mechanics needed); above it, cards are absolutely positioned and shifted via inline `transform: translate3d(...) rotate(...) scale(...)` on `mouseenter`/`mouseleave`, using CSS transitions (no rAF loop) — [HoverStackComp.jsx#L54-L94](registry/effects/components/hover-stack/HoverStackComp.jsx#L54-L94).
- `registry/effects/components/hover-stack/registry.json` — `type: "registry:component"`, `category: "components"`, `tier: "free"`, `main: "index.jsx"`, `exportName: "HoverStack"`, `exportKind: "default"`, `files` lists both `index.jsx` and `HoverStackComp.jsx` with correct targets, `previewUrl: "/demo/hover-stack"`.
- `registry/effects/components/hover-stack/package.json` — npm packaging metadata (separate from the CLI/registry.json install path).

## Strengths

- `HoverStackComp.jsx` itself is well-parameterized: dimensions, spacing, lift, and push distance are all props with sensible defaults, and it forwards `className` — this part follows the component-authoring rules in [developer-new-component.md](developer-new-component.md) even though it isn't the file those rules are formally applied to.
- Genuine mobile fallback: below `1025px` the hover/stack mechanics are dropped entirely in favor of a stacked full-width card list ([HoverStackComp.jsx#L107-L146](registry/effects/components/hover-stack/HoverStackComp.jsx#L107-L146)), so there's no dependence on a `:hover` state that touch devices can't produce.
- Animation is pure CSS `transform`/`box-shadow` transitions driven by React state, not a continuous `requestAnimationFrame` loop — there is nothing running when the user isn't interacting, so the F-042 rAF-suspension pattern genuinely does not apply.
- `resize` listener is cleaned up in the `useEffect` return ([HoverStackComp.jsx#L32-L34](registry/effects/components/hover-stack/HoverStackComp.jsx#L32-L34)) — no leaked listener.
- `registry.json` itself is schema-complete against [developer-new-component.md](developer-new-component.md) Step 4's required-fields table, `main` points at a real file, both files it lists exist with correct `target` paths, and `previewUrl` matches the actual demo route.

## Risks and issues

1. **`index.jsx` (the distributed entry point) is a hardcoded demo wrapper, not a reusable component — Medium.** `developer-new-component.md`'s Step 1 code rules require `index.jsx` to "Accept a `className` prop" and use "No hardcoded colors — use props with sensible defaults," and the Registry checklist requires "Distributable files copied in (**no demo wrappers**)." `index.jsx` violates all three: it takes zero props ([registry/effects/components/hover-stack/index.jsx#L57-L82](registry/effects/components/hover-stack/index.jsx#L57-L82)), does not accept or forward `className`, and hardcodes a fixed heading ("Hover Stack Cards"), fixed body copy, and a fixed 7-card testimonial dataset with hardcoded hex background colors ([index.jsx#L5-L55](registry/effects/components/hover-stack/index.jsx#L5-L55)). A user who installs `hover-stack` via the CLI gets this exact marketing section as their component, not a generic reusable card-stack primitive — the actually-reusable piece (`HoverStackComp`) is only reachable by editing the installed `index.jsx` by hand. Impact is bounded because installed source is editable, so this is not a Critical/High break, but it is a real, cited violation of this repo's own documented rules for what `index.jsx` must be.

2. **`package.json` is out of sync with the actual files and would produce a broken npm tarball — Medium.** `main` is `"hover-stack.jsx"` and `files` is `["hover-stack.jsx", "registry.json"]` ([registry/effects/components/hover-stack/package.json#L5-L9](registry/effects/components/hover-stack/package.json#L5-L9)), but no file named `hover-stack.jsx` exists in the folder (only `index.jsx` and `HoverStackComp.jsx`), and `HoverStackComp.jsx` — required by `index.jsx`'s import — is absent from `files` entirely. Per [developer-new-component.md](developer-new-component.md) Step 9, `npm pack` reads this `package.json`; as configured it would either fail to find `main` or produce a tarball missing the sub-component the entry file imports. This does not affect the primary CLI/`registry.json` install path (which correctly lists both files), only the secondary npm-tarball distribution channel. Confirmed as a **systemic pattern**, not unique to `hover-stack`: 10 of 12 `components`-category effects have a `package.json` `main` field pointing at a nonexistent file (`animated-faq`, `animated-form`, `animated-modal`, `card-drift`, `depth-card-stack`, `gooey-counter`, `hover-stack`, `interactive-list-preview`, `testimonial-swiper`, `video-player`); only `animated-tabs` and `ribbon-drift` have a correct `main`. `package.json` also omits `peerDependencies` (Step 5 calls for listing `react`), though this is likely also category-wide and not verified against siblings here.

3. **Live demo page renders a stale, independently-diverged duplicate, not the registry source — Medium.** `apps/docs/src/app/(marketing)/demo/hover-stack/page.js#L1` imports `HoverStack` from `@/components/hover-stack` (i.e. `apps/docs/src/components/hover-stack/`), a separate copy that has drifted from `registry/effects/components/hover-stack/`. Diffed differences: different responsive breakpoint tokens (`max-md:` vs `max-sm:` swapped throughout, e.g. section height `h-screen max-md:h-full` in the docs copy vs. no such rule in the registry copy — [apps/docs/src/components/hover-stack/index.jsx](apps/docs/src/components/hover-stack/index.jsx) vs [registry/effects/components/hover-stack/index.jsx#L60-L67](registry/effects/components/hover-stack/index.jsx#L60-L67)); the docs copy of `HoverStackComp.jsx` wraps the mount/resize-check logic in `queueMicrotask(...)` while the registry copy calls `checkWidth()`/`setHasMounted(true)` synchronously ([apps/docs/src/components/hover-stack/HoverStackComp.jsx](apps/docs/src/components/hover-stack/HoverStackComp.jsx) vs [registry/effects/components/hover-stack/HoverStackComp.jsx#L27-L28](registry/effects/components/hover-stack/HoverStackComp.jsx#L27-L28)); and the docs copy exports `HoverStackComp` as a default export while the registry copy uses a named export, with each file's importer adjusted to match its own local convention. Practically: what a visitor sees on the live `/demo/hover-stack` preview is not what the CLI actually installs, and any refinement made to the docs copy (e.g. the `queueMicrotask` change, tighter mobile sizing) was not backported to the distributed registry source. I cannot confirm from the diff alone which version is "more correct" — only that they have diverged, which is itself the finding.

4. **No keyboard-equivalent trigger for the hover fan-out effect — Medium.** Card interaction is wired exclusively to `onMouseEnter`/`onMouseLeave` ([HoverStackComp.jsx#L162-L163](registry/effects/components/hover-stack/HoverStackComp.jsx#L162-L163)); there is no `onFocus`/`onBlur`, no `tabIndex`, and no `role` on the cards, despite them carrying `cursor-pointer` styling that visually signals interactivity ([HoverStackComp.jsx#L160](registry/effects/components/hover-stack/HoverStackComp.jsx#L160)). Keyboard-only users cannot reproduce the fan-out/lift interaction at all. Impact is bounded rather than blocking because all quote/tag content is already present and readable in the DOM regardless of hover state — no content is hidden behind the interaction — which is why this is Medium rather than High under the rubric's "blocking core functionality" bar.

5. **No `prefers-reduced-motion` handling anywhere in the component — Medium.** Neither `index.jsx` nor `HoverStackComp.jsx` references `matchMedia` or `prefers-reduced-motion` (confirmed via repo-wide grep of the folder). The hover interaction drives large-amplitude transforms (`pushDistance` up to 235px, scale, rotation) with 700–900ms eased transitions ([HoverStackComp.jsx#L80-L84](registry/effects/components/hover-stack/HoverStackComp.jsx#L80-L84)) that will run at full amplitude for users who have requested reduced motion at the OS level.

6. **Dead empty `<div />` markup — Low.** Both render branches contain a bare `<div />` with no className or content immediately before the quote block ([HoverStackComp.jsx#L117](registry/effects/components/hover-stack/HoverStackComp.jsx#L117) and [HoverStackComp.jsx#L165](registry/effects/components/hover-stack/HoverStackComp.jsx#L165)). These render nothing and serve no visible layout purpose (likely a leftover placeholder for a removed overlay/gradient element). Per `CODING_STANDARDS.md`'s "Dead code is noise" principle, this should be removed — noted here, not changed.

7. **Minor copy typo shipped in the distributed file — Low.** `index.jsx#L66` reads `"Hover any card , so they can pop out."` — a stray space before the comma. Since `index.jsx` is the file actually distributed to installers (see finding 1), this typo ships as-is to every install.

## Accessibility assessment

- Cards use `cursor-pointer` (visual affordance of interactivity) but have no `role`, `tabIndex`, `onFocus`/`onBlur`, or `aria-label` — see finding 4. Screen reader users get no indication these elements are interactive, and keyboard users cannot trigger the hover state at all.
- All textual content (quotes, tags, index numbers, "Explore" label) is real DOM text, not canvas/SVG-rendered, so it is readable by assistive tech regardless of animation state — this is a genuine strength.
- No `prefers-reduced-motion` gating — see finding 5.
- The "↗" arrow glyph and numeric index (`01`, `02`, ...) are decorative/non-interactive text with no semantic markup issues found.

## Performance assessment

- No continuous `requestAnimationFrame` loop exists; all motion is CSS-transition-driven off discrete React state changes on `mouseenter`/`mouseleave` ([HoverStackComp.jsx#L162-L163](registry/effects/components/hover-stack/HoverStackComp.jsx#L162-L163)). This means the createSuspendedRaf/createVisibilityGate pattern from `registry/effects/_shared/README.md` is not applicable here, and its absence is not a finding, consistent with the audit brief's instruction to only flag missing rAF-suspension when a genuine continuous rAF loop exists.
- `will-change-transform` is applied to each card ([HoverStackComp.jsx#L160](registry/effects/components/hover-stack/HoverStackComp.jsx#L160)), which is reasonable given the number of cards here (7) — not large enough to be a GPU-memory concern, but worth noting it's an unconditional `will-change`, not toggled only during interaction.
- `resize` listener has no debounce/throttle, but since it only flips a boolean (`isSmallScreen`) rather than doing layout math per event, the cost per resize tick is negligible; no evidence of a real performance problem.
- `hasMounted` gate causes an initial render of `null` ([HoverStackComp.jsx#L101-L103](registry/effects/components/hover-stack/HoverStackComp.jsx#L101-L103)) before the real content mounts — see SEO section below for the consequence.
- No automated performance test/benchmark exists in the repo for this component; any FPS/jank claim beyond the static-code observations above cannot be verified and is not asserted.

## SEO and content-surface assessment

- `HoverStackComp` renders `null` until `hasMounted` flips true on the client ([HoverStackComp.jsx#L101-L103](registry/effects/components/hover-stack/HoverStackComp.jsx#L101-L103)). For a Next.js app this means the initial HTML payload for the card content is empty and only appears after client-side hydration; a crawler that does not execute JavaScript (or executes it with a budget that expires before hydration) will not see the quotes/tags/copy. This is a real but bounded SEO consideration for a marketing-testimonial-shaped component — flagged, not scored as a hard failure since Next.js SSR + modern crawler JS execution mitigates most of the risk, and no test confirms actual crawl behavior either way.
- All content is real text (not image-embedded), which is otherwise good for indexability.

## Responsive / mobile / touch behavior assessment

- The `1025px` breakpoint switch to a fully stacked, non-hover-dependent card list ([HoverStackComp.jsx#L23-L24](registry/effects/components/hover-stack/HoverStackComp.jsx#L23-L24), [HoverStackComp.jsx#L107-L146](registry/effects/components/hover-stack/HoverStackComp.jsx#L107-L146)) is a correct approach for touch devices — it does not rely on `:hover` at all below that width, avoiding the common "sticky hover state" bug on touch.
- Breakpoint detection is `window.innerWidth`-based via a `resize` listener rather than a CSS media query / `matchMedia`, so it will not react to viewport changes that don't fire `resize` in the same way (e.g. some devtools device-emulation edge cases) — a minor implementation-choice note, not a defect.
- The demo page's hardcoded `index.jsx` uses viewport-unit (`vw`) typography (`text-[5.5vw] max-md:text-[9vw] max-xl:text-[7vw]`, [index.jsx#L62](registry/effects/components/hover-stack/index.jsx#L62)) which scales continuously but has no clamp/min-max bound visible in this file — cannot confirm actual rendered size at extreme viewport widths without a browser check, which was out of scope for this static audit.

## Maintainability and code-quality assessment

- `HoverStackComp.jsx` is reasonably organized (constants at top, effects, derived values, render) broadly following the section order in `CODING_STANDARDS.md` §1, though it lacks the explicit inline section comments (`// State & Refs`, `// Effects`, etc.) the standard shows as the target style.
- `getCardStyle` is a clear, readable function — no deep nesting, no magic-number soup beyond the `PRESET_ROTATIONS` array which is itself a named, documented-by-context constant.
- The `index.jsx`/`HoverStackComp.jsx` split itself is reasonable in principle (container + primitive), but as detailed in finding 1, the container was never generalized into the reusable entry point the docs process calls for.
- No PropTypes/TypeScript types exist for either component (no JSDoc either) — consistent with the rest of this JS-only registry, not treated as its own finding since no ground-truth doc requires it.

## Security and dependency concerns

- No third-party dependencies (`registry.json` lists `dependencies: []`), no `dangerouslySetInnerHTML`, no dynamic `eval`/`Function` construction, no user-supplied data rendered unescaped (the `cards` array is hardcoded in `index.jsx`; when consumers pass their own `cards` array through `HoverStackComp`, React's default JSX text interpolation escapes it — no injection vector found).
- No secrets, tokens, or API keys present in either source file.
- No network calls, no `localStorage`/`cookie` access.

## Browser compatibility considerations

- Uses `translate3d`, CSS custom properties (`--card-width`, `--stack-width`, etc.), `cubic-bezier` transitions, and `Array.prototype.at()` ([HoverStackComp.jsx#L98](registry/effects/components/hover-stack/HoverStackComp.jsx#L98)) — all broadly supported in evergreen browsers (`Array.prototype.at` has been available since 2022 in all major engines); no legacy-browser fallback is present or apparently needed given the rest of this codebase's stack.
- No vendor-prefixed properties used or needed for the transforms/transitions here.

## What was checked and found clean

- `registry.json` schema completeness against `developer-new-component.md` Step 4's required-fields table — all fields present, `type: "registry:component"` correct, `category: "components"` correct, `main` points at an existing file, both files in `files[]` exist with correct `target` paths, `previewUrl` (`/demo/hover-stack`) matches the actual demo route.
- Root `registry/index.json` entry for `hover-stack` — present, alphabetically placed, fields consistent with the component's own `registry.json`.
- Generated public mirror `apps/docs/public/r/hover-stack.json` — content matches the registry source files verbatim (both `index.jsx` and `HoverStackComp.jsx` embedded correctly for this free-tier component), confirming the build script ran correctly against the current registry source; the drift noted in finding 3 is between the registry source and the separate `apps/docs/src/components/` working copy, not between the registry source and its own generated mirror.
- `useEffect` cleanup for the `resize` listener — present and correct ([HoverStackComp.jsx#L32-L34](registry/effects/components/hover-stack/HoverStackComp.jsx#L32-L34)).
- No continuous rAF loop exists, so the createSuspendedRaf/createVisibilityGate pattern genuinely does not apply to this effect (confirmed via grep — no `requestAnimationFrame`, `createSuspendedRaf`, or `createVisibilityGate` references anywhere in the folder).
- No XSS/injection vectors, no secrets, no unsafe dynamic code execution.
- No slug-alias entry needed/expected in `apps/docs/src/lib/effect-slugs.js` (none exists — consistent with this not being a renamed component).

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per `CHANGE_GUIDELINES.md`. If addressed, suggested priority order:

1. Decide the intended shape of the distributed component: either (a) make `index.jsx` a thin, prop-driven, `className`-accepting wrapper around `HoverStackComp` with a small default dataset (matching the documented `index.jsx` rules), or (b) explicitly document `hover-stack` as a "ready-made section" rather than a primitive so the hardcoding is an intentional design choice, not an oversight. Any change here must preserve the current visual output on `/demo/hover-stack` and not alter `HoverStackComp`'s public prop surface, per `CHANGE_GUIDELINES.md`.
2. Fix `package.json` `main`/`files` to reference the real files (`index.jsx`, `HoverStackComp.jsx`) so `npm pack` produces a working tarball; likely worth fixing as a batch across the 9 other affected `components`-category effects rather than one at a time, given the pattern is systemic.
3. Reconcile the registry source with the docs-site working copy (or make the demo page import directly from the registry source) so the live preview and the CLI-installed code stay identical.
4. Add keyboard-focus equivalents (`tabIndex`, `onFocus`/`onBlur` mirroring the mouse handlers) so the fan-out interaction is reachable without a mouse, and add `prefers-reduced-motion` handling to shorten/disable the transform transitions.
5. Remove the two dead empty `<div />` elements and the stray-space typo in the hardcoded copy, as low-priority cleanup.

Any of the above must be verified against the live `/demo/hover-stack` route and a fresh CLI install before merging, per `CHANGE_GUIDELINES.md`.

## Final score: 6/10

## Overall severity label: Medium
