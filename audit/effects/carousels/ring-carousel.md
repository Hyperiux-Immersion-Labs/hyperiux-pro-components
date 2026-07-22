# ring-carousel (carousels)

## Summary

`ring-carousel` is a GSAP-driven 3D ring gallery with drag momentum, snap-to-step rotation, autoplay, and nav/dot controls. The reusable primitive (`RingCarouselComp.jsx`) is well-built — it cleans up GSAP context and Draggable instances on unmount, exposes a props API (`items`, `radius`, `dragSensitivity`, `momentum`, `friction`, `className`, `renderItem`, etc.), and includes an `aria-live` slide announcer. However, the file the registry actually distributes as the main entry point (`index.jsx`) is not that reusable component — it is a hardcoded demo wrapper with fixed image URLs and no prop passthrough, which directly violates this repo's own component-authoring rules ("no hardcoded ... site-specific tokens", "no Demo.jsx / docs-site-only wrappers" as the distributed file). The `package.json` used for `npm pack` distribution also references a source file (`ring-carousel.jsx`) that does not exist anywhere in the folder and omits the real source files from its `files` array. There is also a real, reproducible performance bug: the demo wrapper's unthrottled `resize` listener rewrites carousel config on every resize tick, which forces the child component's `useLayoutEffect` to tear down and rebuild the whole GSAP context (including replaying the entrance stagger animation) on every tick. Accessibility is partially handled (live region, nav/dot `aria-label`s) but lacks `prefers-reduced-motion` handling and standard carousel ARIA roles.

## Implementation overview

- `registry/effects/carousels/ring-carousel/RingCarouselComp.jsx` — the actual 3D ring carousel primitive. Uses `gsap.context()` + `Draggable` for drag/rotate, `requestAnimationFrame`-driven momentum decay with friction, `setInterval`-driven autoplay with hover-pause, and a `matchMedia` listener for a `<640px` mobile scale factor. Renders nav arrows, pagination dots, and an `aria-live` slide announcement.
- `registry/effects/carousels/ring-carousel/index.jsx` — registered as the package `main`. This is **not** a thin re-export of `RingCarouselComp`; it hardcodes 6 CDN image URLs (`imageItems`, [index.jsx#L83-108](registry/effects/carousels/ring-carousel/index.jsx#L83-L108)), owns its own responsive breakpoint config state, and accepts **zero props** ([index.jsx#L6](registry/effects/carousels/ring-carousel/index.jsx#L6)).
- `registry/effects/carousels/ring-carousel/package.json` — npm packaging metadata for `npm pack` distribution (Step 9 of `developer-new-component.md`).
- `registry/effects/carousels/ring-carousel/registry.json` — CLI install metadata (name, files, targets).
- Demo route: `apps/docs/src/app/(marketing)/demo/ring-carousel/page.js` imports a **separate, drifted copy** at `apps/docs/src/components/ring-carousel/` (not the registry copy, not through the registry path at all).

## Strengths

- Clean GSAP lifecycle management: `gsap.context()` scoped to `containerRef`, reverted in the `useLayoutEffect` cleanup, and `Draggable.create` lives inside that context so it's killed automatically on unmount ([RingCarouselComp.jsx#L219-L284](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L219-L284)).
- Momentum rAF loop is self-terminating (decays via `friction` until `< 0.02`) and explicitly cancelled via `stopMomentum()` in the effect cleanup ([RingCarouselComp.jsx#L60-65](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L60-L65), [RingCarouselComp.jsx#L281-284](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L281-L284)) — it is not an unbounded/continuous loop.
- Autoplay `setInterval` is cleared on unmount and re-evaluated on every dependency change ([RingCarouselComp.jsx#L307-317](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L307-L317)).
- `aria-live="polite"` region announces the active slide by label/index for screen-reader users ([RingCarouselComp.jsx#L343-345](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L343-L345)).
- Nav and dot controls all carry explicit `aria-label`s ([RingCarouselComp.jsx#L388](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L388), [RingCarouselComp.jsx#L397](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L397), [RingCarouselComp.jsx#L414](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L414)).
- `goToSlide` picks the shorter rotation direction (forward vs. backward) rather than always spinning one way — a small but real UX nicety ([RingCarouselComp.jsx#L129-147](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L129-L147)).

## Risks and issues

### 1. Distributed `main` file is a hardcoded demo, not a reusable component — **High**
`registry.json` declares `"main": "index.jsx"` and `"exportName": "RingCarousel"` ([registry/effects/carousels/ring-carousel/registry.json#L16-19](registry/effects/carousels/ring-carousel/registry.json#L16-L19)). But `index.jsx` accepts no props at all ([index.jsx#L6](registry/effects/carousels/ring-carousel/index.jsx#L6)) and hardcodes both the image set ([index.jsx#L83-108](registry/effects/carousels/ring-carousel/index.jsx#L83-L108)) and a fixed `bg-black` section wrapper ([index.jsx#L62](registry/effects/carousels/ring-carousel/index.jsx#L62)). A user who installs `ring-carousel` via the CLI gets this fixed demo as the top-level export — to use their own images they must reach past the documented entry point into `RingCarouselComp.jsx` directly. `developer-new-component.md` explicitly requires the distributed `index.jsx` to "Accept a `className` prop", have "No hardcoded colors — use props with sensible defaults" ([developer-new-component.md#L66-70](developer-new-component.md#L66-L70)), and states registry copies should have "no Demo.jsx, no docs-site-only wrappers" ([developer-new-component.md#L115](developer-new-component.md#L115)). This file is exactly that kind of wrapper. Functionally this breaks the primary promise of the CLI install flow (a reusable, prop-configurable component).

### 2. `package.json` references a nonexistent source file and omits real files — **High**
`package.json` sets `"main": "ring-carousel.jsx"` and `"files": ["ring-carousel.jsx", "registry.json"]` ([package.json#L5-9](registry/effects/carousels/ring-carousel/package.json#L5-L9)). No file named `ring-carousel.jsx` exists anywhere in the folder (only `index.jsx` and `RingCarouselComp.jsx` do, per the directory listing). Per Step 9 of `developer-new-component.md`, `npm pack` run in this folder would produce a tarball whose `files` allowlist excludes both real source files and whose declared `main` doesn't resolve — a broken package. `developer-new-component.md` Step 5 also calls for `peerDependencies` listing `react` and major libs like `gsap`; this file instead declares plain `dependencies` with no `react` entry at all ([package.json#L14-17](registry/effects/carousels/ring-carousel/package.json#L14-L17)).

### 3. Unthrottled `resize` listener forces full GSAP re-init and entrance-animation replay — **High**
`index.jsx` attaches a raw `resize` listener with no debounce/throttle that calls `setGalleryConfig` on every tick ([index.jsx#L56](registry/effects/carousels/ring-carousel/index.jsx#L56)). Each config change changes `itemWidth`/`itemHeight`/`radius`/`dragSensitivity`/`momentum`/`friction` props passed into `RingCarouselComp`, all of which are dependencies of the main `useLayoutEffect` ([RingCarouselComp.jsx#L285-305](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L285-L305)). Because that effect's cleanup calls `ctx.revert()` and its body re-runs `Draggable.create` plus `gsap.from(panels, { y: 120, opacity: 0, stagger: 0.08, ease: "expo.out" })` ([RingCarouselComp.jsx#L243-249](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L243-L249)), every resize tick during an active window resize (or mobile browser chrome show/hide) tears down and replays the full entrance animation and rebuilds the drag handler. This is reproducible on any manual window resize and is a real, visible jank/flicker bug, not just a theoretical one.

### 4. Docs-site copy has drifted from the registry source — **Medium**
`apps/docs/src/components/ring-carousel/RingCarouselComp.jsx` (used live by the demo page) differs from `registry/effects/carousels/ring-carousel/RingCarouselComp.jsx` in three mobile-only rules: `max-sm:top-[30%]` on the ring container, an `// eslint-disable-next-line @next/next/no-img-element` comment, `max-sm:bottom-[10%]` on the nav buttons, and `max-sm:bottom-[30%]` vs `max-sm:bottom-[14%]` on the dots row (diff confirmed directly). The docs `index.jsx` also differs (`max-sm:pt-0` vs registry's `max-sm:pt-6`). This means what ships to CLI installers already renders differently on mobile than what the live demo page shows — a slug/version drift the audit was asked to check for.

### 5. No `prefers-reduced-motion` handling — **Medium**
Neither `RingCarouselComp.jsx` nor `index.jsx` reference `matchMedia("(prefers-reduced-motion: reduce)")` anywhere (confirmed by reading both files in full). The entrance stagger (`gsap.from(panels, {...})`, [RingCarouselComp.jsx#L243-249](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L243-L249)), the momentum spin, and the continuous autoplay rotation all run unconditionally regardless of the user's OS-level motion preference.

### 6. Missing standard carousel ARIA structure — **Medium**
The outer carousel container has no `role="region"`/`aria-roledescription="carousel"`, and individual panels ([RingCarouselComp.jsx#L353-373](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L353-L373)) carry no `role="group"`/`aria-roledescription="slide"`/`aria-label`. The `aria-live` announcer (finding above, under Strengths) partially compensates by announcing slide changes, but screen-reader users get no structural indication that this is a carousel widget with N slides, differing from the W3C APG carousel pattern.

### 7. Carousel images ship with no `loading` attribute or explicit dimensions — **Medium**
`<img src={imageSrc} alt={imageAlt} className="... object-cover absolute inset-0" />` ([RingCarouselComp.jsx#L364-368](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L364-L368)) has no `loading="lazy"`, no `width`/`height`, and no `decoding` attribute. All items' images load eagerly regardless of visibility/step, and lacking intrinsic size hints on `absolute inset-0`-positioned images offers no layout-shift protection if this pattern is reused outside the fixed-size ring geometry.

### 8. Generic fallback alt text for string items — **Low**
When an item is passed as a bare string (image URL) rather than `{src, alt}`, the alt text falls back to `` `ring-item-${i}` `` ([RingCarouselComp.jsx#L351](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L351)) — not meaningful to assistive technology, though this is an edge case (the shipped demo data always supplies real `alt` text).

### 9. Overlapping/duplicated responsive breakpoint logic — **Low**
`index.jsx` defines its own breakpoints at `540px`/`1024px` to swap `itemWidth`/`itemHeight`/`radius`/etc. ([index.jsx#L20-52](registry/effects/carousels/ring-carousel/index.jsx#L20-L52)), while `RingCarouselComp.jsx` independently runs a `matchMedia("(max-width: 639px)")` check that applies an additional `× 0.88` scale on top of whatever was passed in ([RingCarouselComp.jsx#L160-170](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L160-L170), [RingCarouselComp.jsx#L43-44](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L43-L44)). Two independent, non-aligned breakpoint systems compounding on the same dimensions is hard to reason about and a likely source of future bugs when either is tuned in isolation.

### 10. Minor formatting deviations from `CODING_STANDARDS.md` — **Low**
Missing whitespace around operators/imports throughout, e.g. `from"react"` ([index.jsx#L3](registry/effects/carousels/ring-carousel/index.jsx#L3)), `className =""` ([RingCarouselComp.jsx#L20](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L20)), `isImage ==="string"` ([RingCarouselComp.jsx#L349](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L349)). Not functionally significant but inconsistent with the "same person wrote it" formatting goal in `CODING_STANDARDS.md#L1-5`.

## Accessibility assessment

Partial. Present: `aria-live="polite"` slide announcer ([RingCarouselComp.jsx#L343-345](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L343-L345)), `aria-label`s on all nav/dot buttons, keyboard-operable prev/next/dot buttons (native `<button>` elements, reachable via Tab). Missing: `prefers-reduced-motion` handling (finding #5), carousel/slide ARIA roles (finding #6), and the drag surface (`draggerRef` div, [RingCarouselComp.jsx#L377](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L377)) is mouse/touch-only with no keyboard equivalent for rotating by drag — acceptable since the nav buttons provide a keyboard path to the same functionality, but worth noting the drag interaction itself is not keyboard-accessible.

## Performance assessment

The momentum rAF loop is transient/self-terminating and correctly cancelled on unmount, so it is not a case requiring the `createSuspendedRaf`/`createVisibilityGate` pattern per the audit's own instructions (only continuous rAF loops need that). Autoplay uses `setInterval`, not rAF, and is paused on hover when `pauseOnHover` is set and always cleared on unmount. The real performance issue is finding #3 (unthrottled resize triggering full GSAP context rebuild + entrance replay), which is High severity. Finding #7 (no lazy-loading/no dimensions on images) is a secondary, bounded performance/CLS concern.

## SEO and content-surface assessment

Component is `"use client"` and renders entirely client-side; images and text are not present in server-rendered HTML, so this carousel's content is not directly crawlable in initial HTML (typical tradeoff for GSAP/Draggable-driven UI, not unique to this component). Image `alt` text is present and descriptive in the shipped demo data ([index.jsx#L84-107](registry/effects/carousels/ring-carousel/index.jsx#L84-L107)) but generic when items are passed as bare strings (finding #8). No structured data is applicable to a decorative gallery carousel.

## Responsive / mobile / touch behavior assessment

Touch is supported via GSAP `Draggable`'s `type: "x,y"` and the `onPress`/`onDrag` handlers explicitly branch on `e.touches` ([RingCarouselComp.jsx#L258](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L258), [RingCarouselComp.jsx#L263](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L263)), so drag works on touch devices. Responsive sizing is handled at two independent layers (finding #9), and the demo wrapper's resize handling is unthrottled and causes visible jank on every resize tick (finding #3). Mobile-specific positioning has drifted between the docs copy and the registry copy (finding #4), meaning the registry-distributed version's mobile layout has not been visually verified against what currently ships on the live demo page.

## Maintainability and code-quality assessment

`RingCarouselComp.jsx` is reasonably well organized (refs/state, memoized derived values, callbacks, one big layout effect, render) and follows the general shape `CODING_STANDARDS.md` asks for, though it does not use the file's section-comment convention (`// Renderer and scene`, etc., per `CODING_STANDARDS.md#L46-54`) and has scattered magic numbers (`0.02` momentum-stop threshold, `639` mobile breakpoint, `0.88` mobile scale factor, `180` base rotation offset) that per `CODING_STANDARDS.md#L71-88` should be named constants at the top of the file. The bigger maintainability problem is structural: the registry's `main` entry point is a demo, not the reusable primitive (finding #1), which means anyone maintaining "the component users actually get" needs to edit the wrong file first.

## Security and dependency concerns

No secrets, tokens, or unescaped user input found. Images load from a public R2 bucket over HTTPS; no `dangerouslySetInnerHTML` or `eval`. Dependencies (`gsap`, `lucide-react`) are declared consistently across `registry.json` and `package.json` (aside from the `package.json` `peerDependencies`/`files` gaps in finding #2).

## Browser compatibility considerations

Relies on GSAP `Draggable`, CSS 3D transforms (`transformStyle: preserve-3d`, `perspective`, `rotateY`, `backfaceVisibility`), all broadly supported in current evergreen browsers without vendor prefixing. No use of newer/experimental CSS or JS APIs was found. `matchMedia` and `IntersectionObserver`-style APIs are not used for anything requiring polyfills here (no `IntersectionObserver` used at all, consistent with finding that no visibility-based rAF suspension exists — not required since the rAF loop is transient, see Performance assessment).

## What was checked and found clean

- GSAP context and Draggable cleanup on unmount: confirmed via `ctx.revert()` and `stopMomentum()` in the `useLayoutEffect` return ([RingCarouselComp.jsx#L281-284](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L281-L284)).
- Autoplay `setInterval` cleanup on unmount and dependency change: confirmed ([RingCarouselComp.jsx#L307-317](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L307-L317)).
- `matchMedia` mobile-detection listener cleanup: confirmed ([RingCarouselComp.jsx#L160-170](registry/effects/carousels/ring-carousel/RingCarouselComp.jsx#L160-L170)).
- Window `resize` listener cleanup in `index.jsx`: confirmed ([index.jsx#L58](registry/effects/carousels/ring-carousel/index.jsx#L58)) — cleaned up correctly, even though the listener itself is unthrottled (finding #3).
- `registry.json` schema conformance against `developer-new-component.md`: `name` matches folder (`ring-carousel`), `type` is `"registry:component"`, `category` is exactly `"carousels"`, `main` (`index.jsx`) exists, both files in `files` array exist with correct `target` paths, `previewUrl` (`/demo/ring-carousel`) matches the demo route folder. All confirmed clean at the schema-field level (the *content* of the `main` file is the problem — finding #1 — not the registry.json wiring).
- No secrets, XSS-able unescaped input, or eval-style code found anywhere in the four files read.
- Continuous/unbounded rAF loop: none present — momentum rAF self-terminates via friction decay, so the `createSuspendedRaf`/`createVisibilityGate` pattern from `registry/effects/_shared/README.md` does not apply here per the audit's own criteria.
- Public mirror (`apps/docs/public/r/ring-carousel.json`) matches `registry.json` on `name`, `title`, `description`, `dependencies`, `exportName`/`exportKind`, `tier`, and `version` — no drift found on those fields. (Note: the mirror's `files[].target` values, e.g. `components/hyperiux/index.jsx`, differ from `registry.json`'s `src/components/effects/ring-carousel/index.jsx` targets — this could not be confirmed as a bug vs. intentional build-script path normalization without reading `build-registry.js`, which was out of scope for this single-effect audit; flagged here as unverified rather than as a finding.)

## Suggested improvements and remediation priorities

No code was changed as part of this audit, per `CHANGE_GUIDELINES.md`. If remediated, any fix must not alter current UI, responsiveness, or registry behavior without owner sign-off (`CHANGE_GUIDELINES.md#L5-23`). Suggested priority order:

1. Decide whether the distributed `index.jsx` should be the generic `RingCarouselComp` (re-exported/renamed) or a documented demo — if it must stay demo-shaped, that should be an explicit, acknowledged exception to `developer-new-component.md`, not a silent one (finding #1).
2. Fix `package.json`'s `main`/`files`/`peerDependencies` to point at real files before the next `npm pack` (finding #2).
3. Debounce/throttle the `resize` listener in `index.jsx`, or move to a `ResizeObserver` with debounce, so the child's `useLayoutEffect` doesn't tear down and replay the entrance animation on every resize tick (finding #3).
4. Reconcile the docs-site copy (`apps/docs/src/components/ring-carousel/`) with the registry copy so the demo page reflects what CLI installers actually receive (finding #4).
5. Add a `prefers-reduced-motion` check gating the entrance stagger, momentum spin distance, and autoplay (finding #5).
6. Add `role="region"`/`aria-roledescription="carousel"` on the container and `role="group"`/`aria-roledescription="slide"` on each panel (finding #6).
7. Add `loading="lazy"` (or eager only for the initially active slide) and explicit `width`/`height` on the `<img>` (finding #7).

## Final score: 5.5/10

## Overall severity label: High
