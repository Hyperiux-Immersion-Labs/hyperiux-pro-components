# Kyntra Template — QC Issues

*Run against [`template-qc-checklist.md`](./template-qc-checklist.md).
First run 2026-09-03. **Re-run 2026-09-03** (this document).
Target: `apps/docs/src/app/(marketing)/templates/kyntra/`*

**Verdict: NOT SHIPPABLE.** 6 [BLOCK] items still fail, down from 9. Three
blockers (B3, B5, B7) and four warnings (W1, W2, W4, W7) were fixed since the
last run.

The remaining failures split cleanly in two: **infrastructure that does not
exist yet** (B1, B8, B9 — no template registry, no pricing layer, no scaffold)
and **two real code defects** (B4 scroll-lock, B6 reduced motion) that are
fixable today without any new infrastructure.

The page code remains in good condition: TypeScript compiles clean, CSS is
properly scoped, heading hierarchy is correct, attribution is now complete, and
the asset payload dropped from ~46MB to 5.4MB.

---

## Changes since the last run

| Item | Was | Now |
|---|---|---|
| **B3** attribution headers | 21 of 46 files missing | ✅ **Fixed** — 47/47 carry it |
| **B5** `@/lib/motion` alias | 2 files broke standalone build | ✅ **Fixed** — no `@/` imports remain |
| **B7** 46MB raster assets | 40MB in `blogs/` alone | ✅ **Largely fixed** — 5.4MB total; one residual (see B7) |
| **W2** duplicate export name | both exported `CharStaggerButton` | ✅ **Fixed** — now `CharStaggerPrimaryButton` |
| **W4** dead nav links | all five `target: "#"` | ✅ **Fixed** — wired to real section ids |
| **W7** 797KB OG PNG | oversized PNG | ✅ **Fixed** — 66KB JPEG at 1200×650 |
| **W1** phantom `framer-motion` | undeclared dep, transitive only | ✅ **Fixed** — now `motion/react` |
| **B4** scroll-lock | 3 uncoordinated owners | ❌ **Unchanged** |
| **B6** reduced motion | 4 unguarded components | ❌ **Unchanged** |
| **B1 / B8 / B9** | no manifest / pricing / preview | ❌ **Unchanged** |
| **B2** font licensing | both families bundled | ❌ **Unchanged** |
| **W3, W5, W6, W8** | — | ❌ **Unchanged** |

---

## Summary

| § | Area | BLOCK fails | WARN |
|---|------|:---:|:---:|
| 1 | Manifest & registry data | 10 | 0 |
| 2 | Composition & code integrity | 1 | 1 |
| 3 | Build & runtime | 0 | — |
| 4 | Responsive | 0 | 2 |
| 5 | Accessibility | 0 | 1 |
| 6 | Performance | 0 | 1 |
| 7 | Reduced motion | 1 | — |
| 8 | Content & copy | 0 | — |
| 9 | SEO & metadata | 0 | 0 |
| 10 | Multi-page nav | n/a | n/a |
| 11 | Licensing & attribution | 1 | 1 |
| 12 | Packaging & delivery | 2 | 1 |
| 13 | Pricing & access control | 3 | — |
| 15 | Preview parity | 1 | — |

---

## BLOCKERS

### B1 — §1: No `template.json` exists anywhere in the repo

**Status: unchanged.** `registry/` still contains only `dist/`, `effects/`,
`index.json`, `tsconfig.json`. There is no `registry/templates/` directory, and
a repo-wide search for `template.json` returns nothing.

Every §1 BLOCK item consequently fails: `name`/`version`/`title`/`description`/
`industry`/`layout`, `sectionsUsed[]`, `pricing.standaloneOneTime`,
`pricing.includedInAnnualPro`, `scaffoldAsset`, `previewUrl`, `changelog`.

**Fix:** author `registry/templates/<category>/kyntra/template.json`. Layout is
`"single-page"` — [page.tsx](apps/docs/src/app/(marketing)/templates/kyntra/page.tsx)
renders 15 components on one route, so §10 is genuinely n/a.

---

### B2 — §11: Commercially-licensed fonts bundled as raw `.woff2`

**Status: unchanged.** `assets/fonts/` still ships both families as
redistributable binaries:

- `helvetica-neue-woff2/` — 4 faces (Bold, Light, Medium, Roman)
- `aeonik-pro-woff2/` — 3 faces (Light, Medium, Regular)

Helvetica Neue (Monotype) and Aeonik Pro (CoType) are both paid, per-seat
licensed. Neither permits redistribution to buyers inside a resold template.
This remains the highest-liability item in the audit — the checklist explicitly
says to "flag and remove anything uncertain rather than assume fair use."

**Fix:** swap to a licensable substitute before packaging. Closest metric-
compatible open options: **Inter** or **Geist** for Helvetica Neue,
**Schibsted Grotesk** for Aeonik Pro. Alternatively document that buyers must
supply their own licensed copies and ship the scaffold with the `@font-face`
blocks pointing at absent files.

---

### B4 — §2: Three uncoordinated owners of `document.body.style.overflow`

**Status: unchanged — still the highest-priority code defect.** This is the
exact "no explicit coordinator" bug §2 describes, and it produces a real
stuck-scroll state.

| File | Line | Behavior |
|---|---|---|
| [Header.tsx](apps/docs/src/app/(marketing)/templates/kyntra/components/Header.tsx#L63) | 63–65 | sets `"hidden"` / `""` — **no save/restore** |
| [EnquiryModal.tsx](apps/docs/src/app/(marketing)/templates/kyntra/components/EnquiryModal.tsx#L56) | 56–63 | saves previous, restores it |
| [DownloadAppModal.tsx](apps/docs/src/app/(marketing)/templates/kyntra/components/DownloadAppModal.tsx#L148) | 148–155 | saves previous, restores it |

**Reproduction (mobile ≤1025px), re-verified this run:** open the hamburger menu
→ body locks to `hidden`. Tap "Get Started" → `openEnquiryModal()` runs
`setMenuOpen(false)` **and** `setEnquiryOpen(true)` in the same tick
([Header.tsx:32-35](apps/docs/src/app/(marketing)/templates/kyntra/components/Header.tsx#L32-L35)).
The modal's effect captures `previousBodyOverflow` — which may still read
`"hidden"` from the menu — then on close restores `"hidden"`. **The page is left
permanently unscrollable with no visible modal.**

Header's effect also unconditionally clears to `""` on cleanup, so the reverse
order stomps a modal's active lock.

**Fix:** a single ref-counted scroll-lock helper both modals and the menu call,
rather than three components each writing the same global.

---

### B6 — §7: Unguarded animation in four always-visible components

**Status: unchanged, and now more reachable.** §7 requires *every* page be fully
static under `prefers-reduced-motion: reduce`. All four still contain zero
references to any reduced-motion check (verified by grep this run):

- **[Header.tsx](apps/docs/src/app/(marketing)/templates/kyntra/components/Header.tsx#L37)** — 1s timed slide-in reveal (`setRevealed`), plus
  `lenis.scrollTo(target, { duration: 2 })` on every nav click, plus a
  700ms hide/show transition on scroll.
- **[CTA.tsx](apps/docs/src/app/(marketing)/templates/kyntra/components/CTA.tsx)** — `FadeUp` wrappers and a 300ms colour transition.
- **[Buttons/PrimaryButton.tsx](apps/docs/src/app/(marketing)/templates/kyntra/components/Buttons/PrimaryButton.tsx)** — GSAP `SplitText` character animation.
- **[effects/parallax-footer/ParallaxFooter.tsx](apps/docs/src/app/(marketing)/templates/kyntra/components/effects/parallax-footer/ParallaxFooter.tsx)** — fixed-position scroll reveal.

**Note this got worse in practice:** fixing W4 (dead nav links) means the
2-second `lenis.scrollTo` at
[Header.tsx:77](apps/docs/src/app/(marketing)/templates/kyntra/components/Header.tsx#L77)
now actually runs on every nav click, where previously it resolved nothing. The
reduced-motion gap is unchanged in code but newly reachable by users.

`LenisSmoothScroll` returning `null` under reduced motion also has a side
effect: `useLenis()` then yields `null`, so Header's nav falls back to
[`scrollIntoView({ behavior: "smooth" })`](apps/docs/src/app/(marketing)/templates/kyntra/components/Header.tsx#L81)
— **still animated**. Should be `behavior: "auto"` when reduced motion is set.

---

### B8 — §13: Pricing and access control do not exist

**Status: unchanged.** `getTemplateAccessDecision` is not defined anywhere in
`apps/` or `packages/`. There is no `template-demo` route and no gated download
route. All three §13 BLOCK items (annual-Pro grant, monthly-Pro deny, standalone
purchase grant, non-public zip serving) are unverifiable.

---

### B9 — §15: No preview/zip parity possible

**Status: unchanged.** With no `scaffoldAsset` and no `template-demo` route,
there is nothing to compare. Fails by absence.

---

## RESOLVED BLOCKERS

Kept for audit trail — verified fixed this run.

### B3 — §11: Attribution headers ✅ FIXED

All **47 of 47** `.tsx`/`.ts` files now carry `// Built using Hyperiux Vault` in
their first three lines (was 21 missing). Verified by per-file header check.

### B5 — §2/§3: `@/lib/motion` alias ✅ FIXED

No `@/` imports remain anywhere in the template. Both `LenisSmoothScroll.tsx`
and `effects/parallax-image-animation/index.tsx` now resolve within the template
directory, so a zipped scaffold no longer fails on an unresolved import.

### B7 — §6: Oversized raster assets ✅ LARGELY FIXED

Total `assets/` payload: **~46MB → 5.4MB**.

| Asset | Was | Now |
|---|---|---|
| `blogs/blog3` | 14.1 MB | 176 KB (jpg) |
| `blogs/blog4` | 12.7 MB | 172 KB (jpg) |
| `blogs/blog5` | 12.9 MB | 160 KB (jpg) |
| `trust.jpg` | 6.9 MB | 210 KB |
| `testimonial/sarah` | 2.0 MB | 44 KB (jpg) |
| `kyntra-og` | 797 KB | 66 KB (jpg) |

**Two residuals, both now WARN-level rather than BLOCK:**

1. `kyntra-hero-mockup.png` is still 1.83MB — the largest remaining asset. It
   has *genuine* transparency so it must stay PNG; palette quantization was
   measured and rejected (mean channel error 10.6/255, visible banding on the
   gradient). Needs a smaller source or an accepted quality trade-off.
2. `blogs/blog2.png` (350KB) is only **500×750** — roughly half the resolution
   of its siblings (1200px) and visibly soft on an 82vw mobile card. It was
   deliberately left as the original PNG; the real fix is a higher-resolution
   source photo, not re-encoding.
3. [Trust.tsx](apps/docs/src/app/(marketing)/templates/kyntra/components/Trust.tsx#L22)
   still loads `trust.jpg` **twice** — once as a `priority` background `<Image>`
   and again through `ParallaxImageAnimation` at `quality={100}`. Now 210KB
   rather than 6.9MB, so the impact is much smaller, but it is still a
   double-fetch of the same asset in one section.

---

## WARNINGS

### W3 — §2: Leftover `console.log` in the form handler
**Unchanged.** [effects/animated-form/index.tsx:61](apps/docs/src/app/(marketing)/templates/kyntra/components/effects/animated-form/index.tsx#L61) —
`console.log("Kyntra enquiry submitted:", data)` is the entire submit handler.
It logs user PII (name, email, phone) to the console and silently discards the
enquiry. Buyers get a contact form that does nothing. Needs at minimum a
documented `NEXT_PUBLIC_FORM_ENDPOINT` placeholder (§12 WARN). This is the only
`console.*` call left in the template.

### W5 — §4: Ultra-wide layout unverified
**Unchanged.** Layout is almost entirely `vw`-based (Testimonial 60 occurrences,
Blogs 39, Header 32, Hero 24). `max-w-400` caps some containers, but `text-[5vw]`
headings will scale without bound past 1920px. Needs a visual pass.

### W6 — §5: Form-label pattern is inconsistent
**Unchanged.** `Input.tsx` and `Textarea.tsx` use proper `<label htmlFor>`. But
[PhoneInput.tsx:230](apps/docs/src/app/(marketing)/templates/kyntra/components/effects/animated-form/PhoneInput.tsx#L230)
uses `placeholder={placeholder ?? (label === false ? "" : label)}` —
placeholder-as-label, the exact §5 anti-pattern. `Select.tsx` renders no
`<label>` at all; its trigger carries `aria-haspopup="listbox"` but no
`aria-labelledby`.

### W8 — §12: No README or LICENSE
**Unchanged.** Neither exists in the template directory. Both §12 BLOCK (setup
README) and §11 WARN (buyer license terms) fail once packaging begins.

### W9 — §6: Hero mockup is the largest remaining asset *(new)*
`kyntra-hero-mockup.png` (1.83MB) is above the fold and carries real
transparency, so it cannot be converted to JPEG. It is now ~34% of the entire
template payload. See B7 residual 1.

---

## RESOLVED WARNINGS

### W1 — §1: `framer-motion` phantom dependency ✅ FIXED
[Hero.tsx:6](apps/docs/src/app/(marketing)/templates/kyntra/components/Hero.tsx#L6)
now imports from `motion/react` — the package actually declared in
`apps/docs/package.json` (`motion@^12.40.0`). `framer-motion` was declared in no
`package.json` anywhere in the repo and resolved purely as a transitive install
of `motion`, so a scaffold mirroring the declared deps would have failed to
build.

Switching (rather than adding `framer-motion` as an explicit dep) was the right
direction: `motion` v12 is the renamed successor to `framer-motion` with the
same API, and the other 5 motion consumers in `apps/docs/src` already used
`motion/react`. Hero was the lone outlier; all 6 now share one convention. Its
single `motion.div` uses only `initial`/`animate`/`transition`, which are
identical across both packages. No `framer-motion` import remains in the
template or anywhere else in source.

### W2 — §2: Duplicate `CharStaggerButton` export name ✅ FIXED
`effects/char-stagger-primary-button/index.tsx` now exports
`CharStaggerPrimaryButton` (with matching `CharStaggerPrimaryButtonProps` /
`…OwnProps` types), distinct from `effects/char-stagger-button/index.tsx`'s
`CharStaggerButton`. This also realigns the template copy with the canonical
registry source and the `components/` mirror, which already used the `Primary`
naming. All 14 consumers already imported it under that alias, so no call site
changed.

### W4 — §4/§9: Dead nav links ✅ FIXED
All five `navLinks` now resolve to real section ids:

| Label | Target |
|---|---|
| For Homes | `#kyntra-about` |
| Product | `#features` |
| Kyntra Care | `#how-it-works` |
| Stories | `#stories` |
| Resources | `#resources` |

`#features`, `#how-it-works`, `#stories` and `#resources` were added to the
corresponding sections. No duplicate ids. Verified every target resolves.

Two related items deliberately **not** changed: "Get Started" keeps
`href="#get-started"` because it calls `preventDefault()` and opens the enquiry
modal (the href is a semantic fallback, never navigated), and the footer still
has four `href="#"` placeholders including a Play Store button — out of scope
for that fix, still open.

### W7 — §9: OG image size ✅ FIXED
`kyntra-og.png` (797KB) → `kyntra-og.jpg` (66KB) at 1200×650, the OG-recommended
width. JPEG rather than WebP deliberately: several scrapers and preview clients
do not reliably render WebP link previews, and WebP saved only ~20KB more.
4:4:4 chroma subsampling keeps the wordmark and headline crisp. A browser
tooltip artifact baked into the previous source image was also caught and
recaptured.

---

## PASSING

Re-verified this run, not carried over on trust:

- **§3 TypeScript** — `npx tsc --noEmit` passes with zero errors across the
  whole `apps/docs` project.
- **§3 Secrets** — no API keys, tokens, or credentials matching a
  `key/secret/token/password = "<12+ chars>"` pattern.
- **§2 CSS isolation** — all 314 lines of `kyntra-styles.css` are scoped under
  `.kyntra-page` or `html:has(.kyntra-page)`. No bare global selectors.
- **§5 Real text** — all copy is HTML text; no canvas/image-baked content.
- **§5 Alt text** — 17 `<Image>` tags, **17 with `alt`** (verified by tag-aware
  parse, not a line grep); decorative ones correctly use `alt="" aria-hidden`.
- **§6 Autoplay surfaces** — zero `<video>`, `<canvas>`, or WebGL. The §6
  one-surface-above-fold BLOCK passes trivially.
- **§7 Coverage** — 21 files correctly consult reduced motion (up from 19),
  including a reactive/one-shot split in `Animations/reducedMotion.tsx` and
  `motion-reduce:` CSS fallbacks in `scroll-stack`. `KyntraFaq` gained a
  `motion-reduce:transition-none` on its accordion fill since the last run, so
  the panel now snaps to its final state instead of wiping down; `Smarter`'s
  reduced-motion branch also no longer converts a vertical wheel into
  horizontal card scroll while the cursor is over a card.
- **§8 Copy** — no lorem ipsum. Content is on-brand for home services
  throughout.
- **§9 Metadata** — unique title + description, OG and Twitter cards complete
  and now pointing at the compressed `kyntra-og.jpg`.
- **§9 Headings** — exactly one `<h1>` (Hero), logical `<h2>`/`<h3>` nesting.
- **§11 Attribution** — 47/47 files carry the header.
- **§10** — n/a, correctly single-page.

## Not assessed

- **§3 build/runtime, §4 responsive, §6 LCP/CLS, §14 cross-browser** —
  `next build` still fails on an **unrelated** template
  (`oris-dental/assets/teeth.glb`, "Unknown module type"), which blocks a full
  production build. Kyntra is not implicated; the `.glb` is still present.
  Isolating it and starting a dev server both need a manual run.

---

## Suggested order

1. **B4** (scroll-lock) — real user-facing lockup bug, no infrastructure needed.
2. **B6** (reduced motion) — four components; now more reachable since the nav
   links actually scroll.
3. **W3** (form handler) — buyers get a contact form that silently discards
   enquiries and logs PII to the console.
4. **W6** (form labels) — accessibility, contained to two files.
5. **B7 residuals** — hero mockup size, blog2 resolution, Trust double-load.
6. **B2** (fonts) — needs a licensing decision before packaging.
7. **B1, B8, B9, W8** — manifest, pricing, packaging, README. Largest scope;
   blocked on the template-registry infrastructure existing at all.
