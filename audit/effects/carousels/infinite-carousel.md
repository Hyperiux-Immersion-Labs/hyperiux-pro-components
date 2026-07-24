# infinite-carousel (carousels)

## Summary

`infinite-carousel` is a GSAP-powered, infinitely-looping horizontal carousel built on the well-known GreenSock "horizontalLoop" helper, with `Draggable` + `InertiaPlugin` for drag/fling and two alternate mobile fallback modes (`wrap`, `swiper`). The animation engine (`InfiniteCarouselComp.jsx`) is genuinely prop-driven and well-cleaned-up (every `useEffect` with a side effect tears it down correctly), and `registry.json` itself is schema-complete. The serious problems sit outside the animation math: the npm-pack distribution tarball for this effect ships with zero component source due to a stale `package.json`, the prev/next controls in the **actual live demo configuration** are icon-only with no accessible name at all, the file the registry designates as the distributed entry point (`index.jsx`) is a hardcoded zero-prop demo rather than a reusable component, and the registry copy has drifted (different Tailwind breakpoints) from the docs-site copy that is actually shown at `/demo/infinite-carousel`.

## Implementation overview

- [`registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx`](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx) contains a locally-vendored copy of GSAP's public `horizontalLoop` recipe ([L10-L180](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L10)) plus the React wrapper component `InfiniteCarouselComp` ([L182](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L182)). It builds a paused GSAP timeline that loops the slide set, exposes `next`/`previous`/`toIndex`, and optionally attaches GSAP `Draggable` with inertia for drag-to-scrub.
- Three render modes are supported based on `isMobile` + `mobileMode` prop: default GSAP loop (desktop and mobile-default), `wrap` (CSS flex-wrap grid, no loop/nav), and `swiper` (native scroll-snap with a 3x-cloned item list and scroll-position rewinding for the infinite illusion).
- [`registry/effects/carousels/infinite-carousel/index.jsx`](registry/effects/carousels/infinite-carousel/index.jsx) is the registry's `main`/`exportName` entry point: a zero-prop `InfiniteCarousel` component that renders `InfiniteCarouselComp` with a hardcoded 6-card "Dubai real estate" dataset ([L68-L147](registry/effects/carousels/infinite-carousel/index.jsx#L68)) and hardcoded hex colors per card, and it overrides the nav button content with bare `lucide-react` icons ([L45-L46](registry/effects/carousels/infinite-carousel/index.jsx#L45)).
- The live demo at [`apps/docs/src/app/(marketing)/demo/infinite-carousel/page.js`](apps/docs/src/app/(marketing)/demo/infinite-carousel/page.js) renders `@/components/InfiniteCarousel`, a **separate** copy under `apps/docs/src/components/InfiniteCarousel/` that has drifted from the registry copy (see Risk #4).

## Strengths

- Every `useEffect` that attaches a listener, rAF, or GSAP instance has a matching cleanup: resize listener ([L245-L254](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L245)), the GSAP loop + `Draggable` + retry-rAF ([L261-L301](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L261)), the swiper initial-scroll rAF ([L303-L321](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L303)), and the swiper scroll listener ([L323-L372](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L323)).
- A live-region announces slide changes for screen-reader users (`aria-live="polite"`, [L425-L427](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L425)), derived from the active child's `title`/`aria-label`/`alt` props where available ([L226-L235](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L226)).
- Prev/Next controls are real `<button type="button">` elements ([L433-L449](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L433)), so they're natively keyboard-focusable and operable even though the drag gesture itself has no keyboard equivalent.
- Swiper-mode clones outside the "real" middle set are marked `aria-hidden` ([L481](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L481)) to keep screen readers from announcing tripled duplicate content.
- The GSAP timeline is `paused: true` and only tweened on explicit user action (drag, `next()`/`previous()`) — there is no `setInterval` autoplay and no self-perpetuating `requestAnimationFrame` render loop, so the rAF-suspension pattern from `registry/effects/_shared/README.md` genuinely does not apply here (see Cross-effect checks below).
- `registry.json` is internally consistent: `name` matches the folder, `type` is `"registry:component"`, `category` is `"carousels"`, `main` (`index.jsx`) exists, both files used by the component (`index.jsx`, `InfiniteCarouselComp.jsx`) are listed in `files` with correct targets, and `previewUrl` matches the live demo route.

## Risks and issues

### 1. npm-pack tarball for this component ships with zero component code — **Critical**

`registry/effects/carousels/infinite-carousel/package.json` declares:
```
"main": "infinite-carousel.jsx",
"files": ["infinite-carousel.jsx", "registry.json"]
```
[registry/effects/carousels/infinite-carousel/package.json#L5-L9](registry/effects/carousels/infinite-carousel/package.json#L5). No file named `infinite-carousel.jsx` exists in the folder — the real source is split across `index.jsx` and `InfiniteCarouselComp.jsx`. The already-built artifact confirms this in practice:
```
$ tar -tzf registry/dist/hyperiux-infinite-carousel-0.0.1.tgz
package/package.json
package/registry.json
```
Neither `index.jsx` nor `InfiniteCarouselComp.jsx` is in the tarball — npm's `files` field controls what `npm pack`/`npm publish` include, and since it only lists a nonexistent `infinite-carousel.jsx`, the real component code is silently excluded. This is a confirmed, already-shipped broken artifact for anyone installing via `registry/dist/hyperiux-infinite-carousel-0.0.1.tgz`, not a theoretical risk. (I could not find a reference to `registry/dist/*.tgz` anywhere under `apps/docs/src`, so I cannot confirm whether this tarball path is actually reachable through the live CLI/install flow versus the `public/r/*.json` metadata path being the only channel in active use — noting that uncertainty rather than guessing at it.)

**Scope note:** the identical `main`/`files` mismatch (pointing at a `{slug}.jsx` that never exists because these components are always split into `index.jsx` + `*Comp.jsx`) was also confirmed present in `ring-carousel`'s `package.json`/tarball when spot-checked here, and is called out in the existing `audit/effects/carousels/ring-carousel.md` report as a likely repo-wide template bug. It's reported here too because it's independently confirmed broken for this effect's own shipped tarball.

A smaller, effect-specific instance of the same class of drift: `package.json`'s `dependencies` only lists `gsap` ([package.json#L14-16](registry/effects/carousels/infinite-carousel/package.json#L14)), omitting `lucide-react`, even though `registry.json` declares `"dependencies": ["gsap", "lucide-react"]` ([registry.json#L8-11](registry/effects/carousels/infinite-carousel/registry.json#L8)) and `index.jsx` imports `ArrowLeft`/`ArrowRight` from `lucide-react` ([index.jsx#L3](registry/effects/carousels/infinite-carousel/index.jsx#L3)). `ring-carousel/package.json` correctly lists both `gsap` and `lucide-react`, so this specific omission is unique to `infinite-carousel`, not systemic.

### 2. Icon-only nav buttons in the actual live demo have no accessible name — **High**

`InfiniteCarouselComp.jsx`'s prev/next `<button>` elements render only `{prevLabel}`/`{nextLabel}` as their content and set no `aria-label` of their own ([InfiniteCarouselComp.jsx#L433-L449](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L433)). The component's own defaults are accessible text (`"← Prev"` / `"Next →"`, [InfiniteCarouselComp.jsx#L186-L187](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L186)), but the demo actually shipped at `/demo/infinite-carousel` overrides both with bare Lucide icons — `prevLabel={<ArrowLeft />}` / `nextLabel={<ArrowRight />}` ([index.jsx#L45-L46](registry/effects/carousels/infinite-carousel/index.jsx#L45)) — and `lucide-react` icons render as plain `<svg>` elements with no accessible text unless one is explicitly supplied. The result: the two primary carousel controls a screen-reader user encounters in the actual public demo have no discoverable name (WCAG 4.1.2, name-role-value). This is the live, shipped configuration, not a hypothetical misuse — confirmed by reading both files together.

### 3. Distributed entry point is a hardcoded, zero-prop demo, not a reusable component — **Medium**

`registry.json`'s `main`/`exportName` point at `index.jsx`'s `InfiniteCarousel` function ([registry.json#L16-17](registry/effects/carousels/infinite-carousel/registry.json#L16)). That function takes **no props** ([index.jsx#L31](registry/effects/carousels/infinite-carousel/index.jsx#L31)) and renders a fixed 6-card "Dubai real estate" dataset with hardcoded hex colors baked directly into the file (`cardsData`, [index.jsx#L68-L147](registry/effects/carousels/infinite-carousel/index.jsx#L68); e.g. `themeClass: "bg-[#111844] text-white"` at [L75](registry/effects/carousels/infinite-carousel/index.jsx#L75)). This is exactly the "docs-site-only demo wrapper" `developer-new-component.md` says not to copy into the registry ("Copy only the files users need - no Demo.jsx, no docs-site-only wrappers", [developer-new-component.md#L115](developer-new-component.md#L115)), and it also runs against the Step 1 authoring rules ("Accept a `className` prop", "No hardcoded colors - use props with sensible defaults", [developer-new-component.md#L68-69](developer-new-component.md#L68)). The actual reusable, prop-driven primitive is `InfiniteCarouselComp.jsx`, which does accept many `className`-equivalent props (`wrapperClassName`, `itemClassName`, etc.) — but that file is not the one the registry designates as the canonical export. Practically, a user running the CLI install for `infinite-carousel` gets a fixed "Luxury Residences / Dubai Marina" carousel baked into their codebase with no prop surface to swap in their own content without hand-editing the generated file.

**Scope note:** `ring-carousel/index.jsx` follows the identical pattern (zero-prop entry wrapping a hardcoded gallery config around a `*Comp.jsx` engine), so this looks like a category-wide convention in `carousels`, not unique to this effect.

### 4. Registry copy has drifted from the live-demoed docs copy — **Medium**

The demo route renders `apps/docs/src/components/InfiniteCarousel/` (`page.js#L1`), not the registry copy that actually gets installed. Diffing `InfiniteCarouselComp.jsx` between the two:
- Registry copy uses `max-[1025px]:` breakpoint prefixes throughout (e.g. [InfiniteCarouselComp.jsx#L424](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L424), [L430](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L430), [L455](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L455)).
- Docs copy uses `max-md:`/`max-sm:` for the same rules ([apps/docs/src/components/InfiniteCarousel/InfiniteCarouselComp.jsx#L424](apps/docs/src/components/InfiniteCarousel/InfiniteCarouselComp.jsx#L424), [L430](apps/docs/src/components/InfiniteCarousel/InfiniteCarouselComp.jsx#L430)).

Tailwind's default `xl` breakpoint (1280px) versus `md`/`sm` (768px/640px) means the installed component's mobile layout switches over at a materially different viewport width than what's shown in the live demo — what ships is not what's demoed. The same `max-[1025px]:` vs `max-md:`/`max-sm:` drift also shows up between the two `index.jsx` copies (compare [registry index.jsx#L33](registry/effects/carousels/infinite-carousel/index.jsx#L33) vs [docs index.jsx#L33](apps/docs/src/components/InfiniteCarousel/index.jsx#L33)). This is the same registry/docs drift category already documented for `ring-carousel` in `audit/effects/carousels/ring-carousel.md`, and it also means any future bugfix applied to one copy will not propagate to the other unless done twice.

### 5. `mobileMode="wrap"` still creates an active GSAP `Draggable` on the wrapper — **Medium**

The `useEffect` that builds the GSAP loop and optional `Draggable` runs whenever `childArray.length` changes, unconditional on `mobileMode`/`isWrapMode` ([InfiniteCarouselComp.jsx#L261-L301](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L261); dependency array at [L301](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L301) only lists `[childArray.length, draggable, isMobile]`, not the mode). `draggable` defaults to `true` ([L184](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L184)), so `horizontalLoop` is invoked with `draggable: true` even in `wrap` mode, and GSAP's `Draggable.create({ trigger: wrapperEl, type: "x", ... })` ([L145-L174](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L145)) attaches to the same wrapper element that `wrap` mode renders as a static `flex-wrap` grid. Items in wrap mode get `transform-[none!important]` ([L479](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L479)) to visually neutralize the GSAP transform, but the `Draggable` instance itself stays live and will intercept pointer/touch drag gestures over the wrapper with no visible movement resulting — a dead-gesture trap for any consumer who opts into `mobileMode="wrap"` while leaving the default `draggable={true}`. Not exercised by the live demo, which never sets `mobileMode`.

### 6. `aria-hidden` swiper clones can still be keyboard-focusable — **Medium**

Clone slides outside the "real" middle third in `swiper` mode are marked `aria-hidden` ([InfiniteCarouselComp.jsx#L481](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L481)) but are not also given `tabIndex={-1}` (or `inert`). If slide content passed by a consumer contains focusable elements (links, buttons — plausible for a general-purpose carousel primitive, even though the shipped demo's `CarouselCard` has none), keyboard users can still `Tab` into the two duplicate, visually-hidden-from-AT copies of each slide, landing focus on content a screen reader will not announce as present (a WCAG 4.1.2-adjacent gap). Only reachable in `mobileMode="swiper"`, which is opt-in and unused by the live demo.

### 7. No `prefers-reduced-motion` handling — **Medium**

No `matchMedia("(prefers-reduced-motion: reduce)")` check exists anywhere in `InfiniteCarouselComp.jsx` or `index.jsx` (confirmed via grep across both files). Drag-release inertia flings and the `next`/`previous` tween (`duration: 0.4`, [L409](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L409) and [L420](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L420)) run unconditionally regardless of the user's OS-level motion preference. Impact is bounded — there's no autoplay, so motion only occurs in direct response to user interaction — but the rubric explicitly treats missing `prefers-reduced-motion` handling as a Medium-class gap.

### 8. Minor CODING_STANDARDS.md / style deviations — **Low**

- The registry copy's `max-[1025px]:` prefix (see #4) is not one of the two breakpoint prefixes `CODING_STANDARDS.md` sanctions ("Use `max-sm:` for mobile-specific overrides and `max-md:` for tablet-specific overrides… Prefer those breakpoint prefixes consistently instead of mixing multiple mobile/tablet targeting patterns", [CODING_STANDARDS.md#L276-278](CODING_STANDARDS.md#L276)) — a standards violation independent of the drift issue itself.
- `attemptsRef.current < 10` ([InfiniteCarouselComp.jsx#L281](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L281)) is an unnamed magic number for the mount-retry cap; `CODING_STANDARDS.md` asks for magic numbers to become named constants ([CODING_STANDARDS.md#L71-88](CODING_STANDARDS.md#L71)).
- `items[0].getBoundingClientRect();` ([InfiniteCarouselComp.jsx#L11](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L11)) is a no-op statement with no assignment — almost certainly an intentional forced-reflow hack (common in this exact GSAP recipe) but is uncommented, which conflicts with the "comments explain *why*" principle for non-obvious lines ([CODING_STANDARDS.md#L12](CODING_STANDARDS.md#L12)).
- The resize handler (`checkMode`, [InfiniteCarouselComp.jsx#L245-L254](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L245)) runs on every `resize` event with no debounce/throttle. Impact is bounded (a single `window.innerWidth` read plus a `setState`), so this is a nit, not a performance finding.

## Accessibility assessment

- Live-region slide announcements and native `<button>` prev/next controls are a solid baseline (see Strengths).
- Confirmed gap: icon-only nav buttons ship with no accessible name in the actual public demo (Risk #2) — a real, not hypothetical, WCAG 4.1.2 failure.
- Gap: `aria-hidden` clones without `tabIndex={-1}` in swiper mode can trap keyboard focus on invisible-to-AT content (Risk #6).
- Gap: no `prefers-reduced-motion` accommodation (Risk #7).
- No keyboard equivalent exists for the drag/scrub gesture itself, but this is mitigated by the Prev/Next buttons providing a fully keyboard-operable path to the same functionality (once/if those buttons carry an accessible name).
- Not checked (no automated tooling run as part of this audit): color contrast of the hardcoded demo card copy, and full screen-reader behavior during rapid `next`/`previous` clicking — would need manual AT testing to confirm beyond static code reading.

## Performance assessment

- No continuous `requestAnimationFrame` loop or `setInterval` autoplay exists — the GSAP timeline stays paused except during an active tween (drag or `next`/`previous`), so this effect does not need the `createSuspendedRaf`/`createVisibilityGate` pattern from `registry/effects/_shared/README.md`, consistent with `carousels` being out of F-042 scope (Tasks 1-4 cover webgl/cursor/backgrounds/scroll only).
- `populateWidths()`/`getTotalWidth()` re-measure every item's `width`/`x`/`xPercent` via `gsap.getProperty` on init and on every drag `onPress` ([L31-46](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L31), [L151-152](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L151)) — O(n) over the slide count, fine for the demo's 6 cards, unmeasured at scale.
- The mount-retry loop (`tryInit`, [L270-290](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L270)) is capped at 10 rAF attempts, so it cannot spin indefinitely.
- No automated performance measurement (Lighthouse/profiler trace) was run as part of this audit — the above is a static-code assessment only.

## SEO and content-surface assessment

- Slide content (headings, paragraphs) renders unconditionally in the DOM regardless of animation/interaction state, so it is crawlable without requiring JS execution timing tricks.
- The demo page supplies `generateMetadata()` via `getDemoPageMetadata("infinite-carousel")` ([page.js#L29-31](<apps/docs/src/app/(marketing)/demo/infinite-carousel/page.js#L29>)), consistent with the docs site's SEO pattern; the implementation of `getDemoPageMetadata` itself is shared docs-site infra outside this effect's four required files and was not opened.
- In `swiper` mode, the slide set is tripled in the DOM (`mobileLoopItems`, [L240-243](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L240)) to support the infinite-scroll illusion. The non-real copies are `aria-hidden`, but `aria-hidden` does not remove content from the DOM or guarantee exclusion from a crawler's index — this triples any real (non-demo) slide copy a consumer puts in swiper mode. Bounded, low-severity content-duplication consideration; not flagged as a standalone finding given `mobileMode="swiper"` is opt-in and unused by the live demo.

## Responsive / mobile / touch behavior assessment

- Three distinct mobile strategies (`gsap` default, `wrap`, `swiper`) give integrators real flexibility, and the default (GSAP loop unchanged on mobile) is what the live demo actually exercises — the `wrap`/`swiper` paths exist in the code but are not demonstrated live.
- `[-webkit-overflow-scrolling:touch]` ([L461](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L461)) and `[scroll-snap-type:x_mandatory]` provide native momentum + snap scrolling for `swiper` mode.
- Risk #5 (dead `Draggable` gesture trap in `wrap` mode) is the one concrete mobile-specific behavioral bug found.
- Risk #4 (breakpoint drift between registry and docs copy) means the *actual* installed component's mobile cutover point differs from what's shown in the live preview — someone validating "does this look right on mobile" against the demo is validating the wrong breakpoint for what they'll actually receive.
- GSAP `Draggable` handles pointer/touch normalization internally on the default mobile path; not independently browser-tested as part of this static-code audit.

## Maintainability and code-quality assessment

- `horizontalLoop()` is GSAP's own published community recipe, copied close to verbatim — appropriate reuse of an established pattern rather than a bespoke reimplementation, though the file doesn't visually mark the boundary between "vendored, don't touch" code and "our React wrapper" beyond a blank line.
- Component file structure roughly follows `CODING_STANDARDS.md`'s prescribed top-to-bottom order, though section-comment markers (e.g. `// State & Refs`) are absent.
- Two near-duplicate full copies of the component exist (registry vs. docs-site legacy copy, Risk #4) — a real ongoing maintenance burden, since every future fix has to be applied twice or the copies keep drifting further.
- Prop list on `InfiniteCarouselComp` is large (18 props across style/className pairs, [L182-204](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L182)) but each is a small, single-purpose styling override — consistent with the repo's general customization pattern elsewhere, not flagged as over-engineering.
- Remaining style deviations covered in Risk #8.

## Security and dependency concerns

- No secrets, tokens, or credentials in source.
- No `dangerouslySetInnerHTML`, `eval`, or unescaped interpolation of external/user input — all rendered content (`children`, `cardsData`) is either React nodes or static, developer-authored JSX; no XSS surface found.
- `InertiaPlugin` was historically a "Club GreenSock" (paid-tier) bonus plugin; GSAP's bonus plugins became free for all users in a 2025 relicensing, so there is no current licensing gate to flag, but this is an external-distribution fact rather than something confirmed by reading this repo's own code.
- `lucide-react` is used only in the demo `index.jsx` for arrow icons — standard, no concerns beyond Risk #2 (no accessible name on the resulting buttons).
- Dependency-declaration inconsistency between `registry.json` and `package.json` is covered under Risk #1.

## Browser compatibility considerations

- CSS scroll-snap (`scroll-snap-type`, `snap-center`/`snap-always`) is broadly supported in all evergreen browsers.
- `-webkit-overflow-scrolling: touch` is a legacy iOS Safari momentum-scroll hint; harmless no-op elsewhere.
- GSAP `Draggable`/`InertiaPlugin` normalize pointer/touch input across browsers; no browser-specific branching was found in this component's own code.
- No use of newer/less-supported browser APIs (no `ResizeObserver`, no `IntersectionObserver`) — resize detection uses the universally-supported `window.resize` event.

## What was checked and found clean

- `registry.json` schema completeness against `developer-new-component.md`: `name`, `version`, `type`, `title`, `description`, `category`, `tier`, `dependencies`, `registryDependencies`, `previewUrl`, `main`, `exportName`, `exportKind`, `importPath`, `target`, and `files` are all present and correctly valued; `main` (`index.jsx`) exists on disk; both `files` entries exist and target the correct install path, matching `importPath`.
- Root registry index entry (`registry/index.json`) is consistent with `registry.json` (name, category, tier, paths, previewUrl).
- Public mirror (`apps/docs/public/r/infinite-carousel.json`) target-path rewrite (`components/hyperiux/...` instead of `src/components/effects/...`) matches the same pattern seen in every other carousel's public mirror spot-checked (`ring-carousel`, `clippath-slider`) — this is the build script's standard transformation, not drift specific to this effect.
- No slug/naming drift: registry folder, registry `name`, demo route, and root index entry all agree on `infinite-carousel`. No stale alias entry needed or present in `effect-slugs.js`.
- Cleanup on unmount: every `useEffect` with a side effect (resize listener, GSAP loop/Draggable/rAF, swiper initial-scroll rAF, swiper scroll listener) has a matching teardown — no leaked listeners or rAF handles found.
- No continuous `requestAnimationFrame` loop exists, so the F-042 rAF-suspension pattern does not apply to this effect (confirmed by reading the full component, not just grepping for `requestAnimationFrame`).
- `itemRefs`/`mobileCardRefs` arrays are correctly trimmed to the current child count on every relevant render ([L256-259](registry/effects/carousels/infinite-carousel/InfiniteCarouselComp.jsx#L256)); rendered slide `key` props (`` `${realIndex}-${i}` ``) are stable and collision-free.
- No secrets, unescaped HTML injection, or code-level licensing exposure found.

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per `CHANGE_GUIDELINES.md`. If addressed later, verify each fix doesn't regress the live demo's UI, responsiveness, or registry/CLI install behavior before merging, and confirm with the owner first per the "stop and ask" rule in `CHANGE_GUIDELINES.md`.

1. **(Critical)** Fix `registry/effects/carousels/infinite-carousel/package.json`'s `main`/`files` to reference the real files (`index.jsx`, `InfiniteCarouselComp.jsx`), add the missing `lucide-react` dependency, then re-run `npm pack` and replace `registry/dist/hyperiux-infinite-carousel-0.0.1.tgz` (bumping version per `developer-new-component.md`'s "Not bumping the version before re-packing" warning). Given the same `main`/`files` pattern was already confirmed broken for `ring-carousel` too, treat this as a category-wide (or repo-wide) sweep of the packaging template rather than a one-off patch.
2. **(High)** Give the prev/next buttons a default `aria-label` (e.g. `"Previous slide"`/`"Next slide"`) in `InfiniteCarouselComp.jsx` that applies regardless of what `prevLabel`/`nextLabel` content is passed, or require icon-only callers (like the shipped demo) to pass an explicit `aria-label`.
3. **(Medium)** Decide whether `index.jsx` should become a thin, prop-driven pass-through (accepting `className`/content props with sensible defaults) instead of a hardcoded demo, or explicitly document that `InfiniteCarouselComp.jsx` is the intended reusable export and `index.jsx` is a customizable starting example — either resolves the `developer-new-component.md` Step 1 conflict.
4. **(Medium)** Reconcile the registry copy's `max-[1025px]:` breakpoints with the docs-site copy's `max-md:`/`max-sm:` breakpoints (both `InfiniteCarouselComp.jsx` and `index.jsx`) so what's installed matches what's demoed, and so the registry copy conforms to `CODING_STANDARDS.md`'s two-prefix convention.
5. **(Medium)** Gate `Draggable` creation (and/or the whole `horizontalLoop` init) behind `!isWrapMode`, or drop the `transform-[none!important]` override and let wrap mode render through a fully separate, non-draggable code path, so `mobileMode="wrap"` doesn't leave a dead-gesture `Draggable` trap on the wrapper.
6. **(Medium)** Add `tabIndex={-1}` (or `inert`) to the `aria-hidden` clone slides in swiper mode so focusable descendants in consumer-supplied slide content can't be tabbed into invisible-to-AT duplicates.
7. **(Medium)** Add a `prefers-reduced-motion` check to shorten/skip the inertia fling and `next`/`previous` tween durations for users who've opted out of motion.
8. **(Low)** Name the `10`-attempt mount-retry cap as a constant, add a one-line comment on `items[0].getBoundingClientRect();` explaining the forced-reflow intent, and debounce the resize listener.

## Final score: 5/10

## Overall severity label: Critical
