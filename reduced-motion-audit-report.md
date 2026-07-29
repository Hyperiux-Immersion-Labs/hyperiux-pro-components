# Reduced-Motion Audit Report

Audits every effect under `registry/effects/{category}/{effect-name}/` for consistency between:
- **The claim** — what `registry.json`'s changelog says about reduced-motion behavior.
- **The code** — what the `.jsx` actually does when `prefersReducedMotion` is true.
- **The docs mirror** — whether `apps/docs/src/components/{effect-name}/` matches the registry copy's reduced-motion logic.

Status legend: **CONSISTENT** (claim matches code) · **MISMATCH** (claim and code disagree) · **UNDOCUMENTED** (code has reduced-motion logic with no changelog claim) · **MIRROR_OK** / **MIRROR_DRIFT** (docs copy matches / diverges from registry copy).

**Status: complete.** All 11 categories / 115 effects audited (registry `.jsx` code vs. `registry.json` changelog claims, plus the `apps/docs/src/components/{effect-name}/` mirror).

**Totals:** 109 consistent · 1 mismatch (open) · 5 undocumented (all fixed 2026-07-28) · 5 mirror drifts (all fixed 2026-07-28).

> **Correction:** the initial pass flagged `arrow-fill-button` as a mismatch because the audit agent only searched for JS-level `prefersReducedMotion`/`matchMedia` calls. On manual review (`registry/effects/buttons/arrow-fill-button/index.jsx:151-197`), every animated element carries a `motion-reduce:transition-none` Tailwind class — a pure-CSS implementation of the same media query that the browser applies live, with no JS needed. This fully satisfies the claim ("fill/clip-path/arrow hover transitions are disabled... instead of animating") and works correctly in the demo and on install. Reclassified as CONSISTENT. The agent's check has a blind spot: it doesn't recognize CSS-only (`motion-reduce:`) implementations as valid "code handling," only JS-level checks. Any future rerun should also grep for `motion-reduce:`/`motion-safe:` classes before calling something a mismatch.

---

## Mismatches found

| Effect | Category | Issue |
|---|---|---|
| `pixel-bloom` | cursor | Changelog claims "reduce-motion applied" but the component has **zero** `prefersReducedMotion`/`matchMedia`/`motion-reduce:` handling of any kind (confirmed via direct grep) — pure overclaim. |

## Undocumented reduced-motion handling — ALL FIXED (2026-07-28)

| Effect | Category | Was | Fix applied |
|---|---|---|---|
| `scramble-link-button` | buttons | No changelog entry at all, but code already had a real `matchMedia` check skipping the scramble animation. | Added changelog entry (v1.0.1) documenting the existing behavior. No code change needed. |
| `webgl-slider` | carousels | Changelog only claimed "scroll-snap animations are skipped/shortened," undersell­ing the actual scope (also disables hover-bend, zeroes GPU fold/curl, widens spacing). | Added a v1.1.1 changelog entry correcting the scope. No code change needed. |
| `animated-faq` | components | Code zeroes the GSAP accordion tween duration under reduced motion, no changelog entry mentioned motion/reduce at all. | Added changelog entry (v1.1.1). No code change needed. |
| `text-fill-animation` | text | No changelog field at all; code already skipped the scroll-scrubbed stagger fill under reduced motion. | Added changelog entry (v1.0.1). No code change needed. |
| `svg-pixel-reveal` | scroll | Registry source had **zero** reduced-motion code; only its docs mirror had a "this effect can't be reduced" notice. | Ported the mirror's `usePrefersReducedMotion` hook + notice into the registry `index.jsx` (matching this file's existing inline-style convention, not the mirror's Tailwind classes), and added a changelog entry (v1.1.0). This was a real code fix, not just documentation — the registry source was missing functionality its own mirror already had. |

## Mirror drift (docs copy vs. registry copy) — ALL FIXED (2026-07-28)

| Effect | Category | Was | Fix applied |
|---|---|---|---|
| `dotted-grid` | backgrounds | Registry has an imperative `reduceMotion` flag that freezes the canvas into a static shape under reduced motion. The docs mirror kept only the notice — it had dropped the static-fallback branch entirely. | Ported the local `reduceMotion` variable, its own `matchMedia` change-listener, the static-shape draw-loop branch, and the `handleClick` skip into the mirror's `index.jsx`, matching the registry exactly. **Then, per user request:** removed the "this effect can't be reduced" notice from both copies entirely — now that the effect has a real static-fallback under reduced motion, the notice was inaccurate. Also removed the now-dead `usePrefersReducedMotion` hook infrastructure (registry's local `useSyncExternalStore`-based hook, mirror's `@/lib/motion` import) that existed solely to feed that notice. `registry.json` bumped to v1.1.2. |
| `perspective-text-reveal` | text | Registry replaces the 3D rotateX/perspective stagger with a plain fade-up under reduced motion. The mirror had **no** `prefersReducedMotion` check at all — always ran the full 3D animation. | Ported the `prefersReduced` check and the entire fade-up branch (constants + `gsap.set`/`gsap.to` block) into the mirror. Mirror is now byte-identical to registry for this file. |
| `text-fill-animation` | text | Registry skips the scroll-scrubbed stagger fill under reduced motion. The mirror had zero reduced-motion handling — always ran the scroll-scrubbed animation. | Ported the `prefersReducedMotion` check and the `gsap.set(...show)` / else-branch split into the mirror. |
| `horizontal-feature-reveal` | scroll | Registry hard-skipped all SplitText reveals under reduced motion (early return); the mirror instead ran opacity-fade variants of the same tweens for all four reveals — a genuine design difference, not just missing code. | **User's call: made the mirror's gentle-fade approach canonical.** Removed registry's early return; added the `reducedMotion ? {opacity fade} : {directional version}` ternary to all four `gsap.from(...)` reveal blocks (head, number, title, content) and an explicit `if (reducedMotion) { gsap.set(x:0); return }` for the image parallax, matching the mirror. Added `registry.json` v1.2.0 changelog entry. |
| `svg-pixel-reveal` | scroll | Registry had **zero** reduced-motion code; only the mirror had a "this effect can't be reduced" notice. | Ported the mirror's `usePrefersReducedMotion` hook + notice into the registry `index.jsx` (see UNDOCUMENTED fix above). Both sides now equivalent. |

All edited files (registry + mirror) were syntax-validated (ESLint for files inside `apps/docs`, `acorn-jsx` parse check for registry files outside its lint scope) — zero errors.

## Clean categories (no mismatches, no drift)

- **backgrounds** (3/3) — dither-canvas, dotted-grid (mirror drift fixed above), spider-particles all consistent, all mirrors OK.
- **buttons** (7/7, except scramble-link-button undocumented above) — animated-toggle, arrow-fill-button (CSS-only `motion-reduce:` implementation, see correction note above), char-stagger-button, char-stagger-primary-button, dot-fill-button, link-button all consistent.
- **carousels** (5/5, except webgl-slider undocumented-scope above) — clippath-slider, infinite-carousel, ring-carousel, zoom-slider consistent.
- **cursor** (16/16, except pixel-bloom mismatch above) — all others (butterfly-trail-cursor, character-trail, coffee-bean-cursor, colorful-cursor-aura, cursor-move, fish-eye, full-screen-crosshair, inertia-img, interactive-arrows, liquid-glass-cursor, magnetic-image-trail, noise-ripple-cursor, phantom-image-trail, pixelated-image-effect, rope-cursor) consistent, all mirrors OK.
- **loaders** (3/3) — lines-loader, numeric-tunnel, stack-loader all consistent, all mirrors OK.
- **navigation** (4/4) — directional-menu, elevate-navbar, expanding-navbar, immersive-full-screen-nav all consistent, all mirrors OK.
- **transitions** (6/6) — block-transition, chess-grid-transition, page-flip-transition, pixel-transition, radial-slice-transition, svg-brush-transition all consistent, all mirrors OK.
- **components** (14/14, except animated-faq undocumented above) — animated-form, animated-modal, animated-tabs, border-beam, card-drift, cards-runway, depth-card-stack, gooey-counter, hover-stack, interactive-list-preview, ribbon-drift, testimonial-swiper, video-player all consistent, all mirrors OK.
- **text** (16/16) — blur-text, circle-text-reveal, glitchy-text, mask-text-reveal, number-counter, overflow-stagger-text, overflow-text-reveal, perspective-text-reveal (mirror drift fixed above), rectangular-text-reveal, scramble-text, slide-text-reveal, spotlight-text, text-cloning, text-fill-animation (undocumented + mirror drift fixed above), text-hover, text-stream all consistent, all mirrors OK.
- **scroll** (22/22) — circular-slider, circular-split-roll, draggable-marquee, grid-scale, helix-slider, horizontal-feature-reveal (mirror drift fixed above), infinite-perspective-slider, parallax-footer, parallax-gallery, parallax-image-animation, parallax-slider, rotation-slider, scroll-distortion, scroll-shuffled-cards, scroll-stack, split-canvas, square-translate, stacking-cards, sticky-content-wrapper, svg-path, svg-pixel-reveal (undocumented + mirror drift fixed above), text-convergence all consistent, all mirrors OK.
- **webgl** (19/19) — 3d-portfolio-slider, book-flip, colliding-models, curved-plane, donut-particles, draggable-canvas, file-encryption, fractal-glass, grid-lift, grid-tunnel, hero-banner-animated, hover-slider, hyperiux-glitter, infinite-grid-gallery, interactive-blur-reveal, milky-way, mouse-pixelation, progressive-bloom-valley, strip-slider all consistent, all mirrors OK. Cleanest category in the whole audit — no issues of any kind.
