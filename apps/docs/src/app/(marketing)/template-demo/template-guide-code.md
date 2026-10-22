# Template code guide

How to build a template demo in `src/app/(marketing)/template-demo/`. Follow it for every new template and when porting an HTML/CSS design into Next.js.

Reference templates:

- `kyntra/` — the original pattern: scoped stylesheet, named text sizes, one component per section.
- `the-missing-pixel/` — the same pattern, applied strictly (six text sizes, no `ch`, no `max-w-`, GSAP for all motion).

The rules in the root `CLAUDE.md` still apply. This guide adds the template-specific ones.

---

## 1. Folder structure

```
template-demo/<template-name>/
  page.tsx                      metadata, fonts, section order
  <template-name>-styles.css    the only stylesheet (sizes, tokens, scoped base)
  assets/                       images + og image, imported statically
  components/
    Header.tsx, Hero.tsx, ...   one file per section
    Animations/
      gsapAnim.tsx              shared reveal components (FadeUp, MaskReveal, ...)
      reducedMotion.tsx         prefersReducedMotion() + hooks
      useMagnetic.ts            small shared hooks
    Buttons/
      <Name>Button.tsx, icons.tsx
    LenisSmoothScroll.tsx, ScrollTopOnLoad.tsx
```

- Videos and other large media go in `public/templates/<template-name>/` and are referenced by URL (`/templates/<template-name>/reel.mp4`). Next can't import `.mp4` like an image.
- If you copy the original HTML into the folder for reference, delete it once the port is done.

## 2. Header line and comments

- Every `.tsx`, `.ts` and `.css` file starts with `// Built using Hyperiux Vault: https://vault.hyperiux.com` (in CSS: `/* ... */`).
- No other comments in component code.

## 3. `page.tsx`

Copy the shape of `kyntra/page.tsx`:

- Import the stylesheet first: `import "./<template-name>-styles.css";`
- Fonts come from `next/font/google` and are exposed as CSS variables (`variable: "--font-<prefix>-head"`). If TypeScript says the font isn't exported, add it to `src/types/declarations.d.ts`.
- `metadata` has `title`, `description`, `alternates.canonical` (`https://vault.hyperiux.com/templates/<template-name>`), `openGraph` and `twitter` using the og image from `assets/`.
- Above-the-fold sections (header, hero) are normal imports. Everything below the fold uses `dynamic(() => import(...))`.
- Wrap everything in one element carrying the scope class and font variables: `<div className={`<prefix>-page relative ${headFont.variable} ${bodyFont.variable}`}>`.

## 4. Naming

- Pick a short prefix for the template (`kyntra`, `mpx`). Use it for the scope class (`.mpx-page`), CSS variables (`--mpx-accent`), utility classes (`.bg-mpx-accent`), data attributes (`data-mpx-inert`) and font variables.
- When porting outside code, rename everything. No class names, variables, keyframes or props from the original author survive.

## 5. The stylesheet

One file, scoped to the page class, unlayered (same as `kyntra-styles.css`). It holds only what Tailwind can't express cleanly:

1. Tokens on `.<prefix>-page` (colours, gradients).
2. Base font family for `.<prefix>-page *`, heading font for `h1, h2, h3` and their children.
3. The text-size scale (section 6).
4. Container and section spacing classes (`.mpx-container`, `.mpx-section`).
5. Things Tailwind truly can't do (mask-image line class for SplitText, scrollbar, selection).

Three media blocks: base (desktop), `@media (max-width: 1025px)` (tablet), `@media (max-width: 768px)` (mobile).

### Cascade gotcha

This CSS is **unlayered**, so it always beats Tailwind utilities, whatever the specificity. So:

- Never put a Tailwind `text-[...]`, `leading-*` or `tracking-*` utility on an `h1`/`h2` to change something the stylesheet sets. Change the stylesheet instead.
- Don't use a custom colour class (`text-mpx-ink`) on an element that also needs a `hover:` colour. Use arbitrary hex for both states: `text-[#0a0a0a] hover:text-[#fafafa]`.
- The global `globals.css` has an unlayered heading rule (weight 400, line-height 1.2, Aeonik). Your scoped `.<prefix>-page h1/h2/h3` rules must set font family, weight and line-height so they win.

## 6. Text sizes

Use **eight sizes only**, named Kyntra-style by their px size at a 1920px-wide screen, so `text-28` is about 28px at 1920 (1.4vw).

| Role | Class | Where |
|---|---|---|
| Display | `h1` element / `text-128` | Hero headline, menu links, intro label |
| Section heading | `h2` element / `text-64` | Section titles, statements, quotes, big numbers |
| Sub-heading | `text-40` | Large card titles, short statements between `h2` and `h3` |
| Card title | `text-30` | Every `h3`, captions, emails |
| Paragraph | `text-28` | All body copy under `h1`/`h2`, descriptions |
| Small paragraph | `text-24` | Captions and secondary copy next to a `text-28` paragraph |
| Link / button | `text-22` | Header items, buttons, footer and menu links, inputs |
| Small | `text-14` | Meta, dates, labels, counts, bottom bar |

Rules:

- `h1` and `h2` get their size from the element rule, so you don't add a class. Every `h3` gets its size class directly: `<h3 className="text-30">`.
- For a non-heading element in a heading role, use the alias class (`<p className="text-64">` for a statement).
- Each size is defined once per breakpoint in the stylesheet, with letter-spacing in `vw` next to it for the big sizes:

```css
.mpx-page h2,
.mpx-page .text-64 {
  font-size: 3.4vw;
  letter-spacing: -0.2vw;
}

@media (max-width: 1025px) {
  .mpx-page h2,
  .mpx-page .text-64 { font-size: 4.6vw; letter-spacing: -0.2vw; }
}

@media (max-width: 768px) {
  .mpx-page h2,
  .mpx-page .text-64 { font-size: 8.5vw; letter-spacing: -0.3vw; }
}
```

- Don't add one-off sizes (`text-[3.2vw]`, `text-[13vw]`). If something needs a new size, it probably belongs to one of the six roles.
- Don't use Tailwind's fixed sizes (`text-sm`, `text-lg`) or `rem`.

## 7. Units

| What | Use | Don't use |
|---|---|---|
| Widths | `vw` or `%`: `w-[25vw]`, `w-[46%]` | `max-w-*` of any kind, `ch` (`max-w-[46ch]`) |
| Padding (all sides) | `vw`: `px-[2vw]`, `py-[3vw]` | `rem`, `px`, `em` (`px-[1.5em]`) |
| Heights | `vh`: `h-[5.8vh]`, `h-screen`, `h-[400vh]` | `h-[3.6vw]` (heights in vw) |
| Circles and square controls | `h-[5vh] aspect-square` (height in vh, width follows) | `size-[3.1vw]` next to vh-tall buttons (they stop lining up) |
| Corners | Tailwind radius classes: `rounded-xs` … `rounded-3xl`, `rounded-full`, `rounded-t-3xl` | `rounded-[1vw]` |
| Gaps between siblings | Tailwind spacing scale: `gap-6`, `gap-x-8`, `space-y-4`, with `max-lg:`/`max-md:` overrides | `gap-[1.5vw]` (only allowed when a gap must equal a vw padding, e.g. a seamless marquee) |
| Hairlines and thin bars | `h-px`, `h-0.5`, `border` | `h-[0.1vw]` |
| Text | the six size classes (section 6) | `text-[3vw]`, `text-sm`, `em` |
| Things that sit inside text (inline images, button icons) | `vw` worked out from that text's size at each breakpoint | `em` units — **never** (`size-[1.1em]`, `pb-[0.1em]`) |

Also:

- `min()` with viewport units is fine: `w-[min(100%,54vh)]`.
- No `calc(100vw - 24px)` or other viewport-minus-pixel calcs.
- Never more than one decimal: `1.55vw` → `1.6vw`.
- Converting vw to vh: work it out for a reference screen per breakpoint (desktop 1440×900, tablet 820×1180, mobile 390×844). For example, a 52px button is `h-[5.8vh] max-lg:h-[4.2vh] max-md:h-[6.4vh]`.

Converting a size that depends on its text: the hero `h1` is 6.6vw / 7.6vw / 11.5vw, so an inline image meant to be 0.8 of that is `size-[5.3vw] max-lg:size-[6.1vw] max-md:size-[9.2vw]`.

Widths for text blocks:

```tsx
<p className="w-[28%] text-28 max-lg:w-[70%] max-md:w-full">…</p>
```

not

```tsx
<p className="max-w-[34ch] text-28">…</p>
```

## 8. Responsive

- Desktop first. Write the desktop class, then `max-lg:` (tablet, below 1025px; `--breakpoint-lg` is 1025px in this repo, same as Kyntra), then `max-md:` (mobile, below 768px).
- Never use `sm:`, `md:`, `lg:`, `xl:` or `min-[...]:`.
- Every vw/vh value usually needs a tablet and mobile override: `px-[2vw] max-lg:px-[4vw] max-md:px-[5vw]`, `gap-9 max-lg:gap-6 max-md:gap-5`.
- Drop an override that repeats the value above it (`rounded-2xl max-lg:rounded-2xl` → `rounded-2xl`).
- In JS, use `gsap.matchMedia()` with `(min-width: 1026px)` / `(max-width: 1025px)` to match.

## 9. Layout and spacing

- Plain flex: `flex`, `flex-col`, `justify-between`, `w-[30%]`, `gap-6`. Grid is fine for real grids (`grid grid-cols-4`).
- **No one-sided spacing.** Don't use `pt-`, `pb-`, `pl-`, `pr-`, `mt-`, `mb-`, `ml-`, `mr-` (or any margin). Use:
  - `gap-*` on a flex/grid parent, or `space-y-*` / `space-x-*`, to space siblings;
  - `px-[..vw]` / `py-[..vw]` for padding, always symmetric;
- **Never use a header-clearing spacer.** Do not add `<div aria-hidden className="h-[12vh] max-lg:h-[8vh] max-md:h-[9vh]" />` (or any empty `aria-hidden` div sized in `vh` to push content below the fixed header) in any page, hero or component. Get the room from the section's symmetric `py-*` and `gap-*` instead.
- Uneven padding in a pill (a label on the left, an icon circle on the right): give the pill a small even `px`, and give the label its own `px` (see the menu button in `the-missing-pixel/components/Header.tsx`).
- Hairlines between blocks: a `<div className="h-px w-full bg-black/10" />` inside a flex column instead of `border-t` + `pt`.
- Section padding comes from the stylesheet classes (`mpx-container`, `mpx-section`), like `kyntra-container`.
- One exception lives in the stylesheet: the SplitText mask line class uses `padding-block` with an equal negative `margin-block`, so masked letters don't clip and line spacing stays the same.
- No `style` prop unless the value is computed at runtime in JS (a fitted font size, a section height from a track width).

## 10. Colour

- Tokens live on `.<prefix>-page` as CSS variables, with a few utility classes (`.bg-mpx-accent`, `.text-mpx-muted`) for elements without hover changes.
- Anything with a hover/focus colour change uses arbitrary hex (`bg-[#e8473b]`).
- No dark-mode variants (`dark:`, `prefers-color-scheme`). One look.
- No shadows unless the source design has them.

## 11. Images and video

- Import images statically from `assets/`. Put the size on the wrapper, and make the image fill it:

```tsx
<div className="aspect-[4/5] w-full overflow-hidden rounded-2xl">
  <Image src={work} alt="…" sizes="25vw" className="h-full w-full object-cover" />
</div>
```

- The hero image gets `loading="eager"` and `fetchPriority="high"`.
- Videos: a small `AutoVideo` component that loads on first view, plays only while visible, and doesn't autoplay under reduced motion.

## 12. Animation

- **GSAP for all motion** (`gsap`, `@gsap/react` `useGSAP`, `ScrollTrigger`, `SplitText`), with Lenis for smooth scroll (`LenisSmoothScroll.tsx` driven from `gsap.ticker`, copied from Kyntra). Tailwind `transition-*` is fine for small colour hovers only.
- Never use GSAP `pin`. Use a tall relative outer section (`h-[400vh]`, or a height set in JS) with a `sticky top-0 h-screen` inner container, and drive the animation with a scrubbed `ScrollTrigger` on the outer section (`start: "top top", end: "bottom bottom"`).
- Shared reveals live in `Animations/gsapAnim.tsx` (`FadeUp`, `MaskReveal`/`ParaAnim`, `MediaReveal`, counters). Reuse them; don't re-implement per section.
- Every animation checks `prefersReducedMotion()` and shows the final state instead.
- **Don't combine Tailwind transform utilities with GSAP transforms on the same element.** Tailwind v4's `translate-*`, `scale-*` and `rotate-*` write to the separate CSS `translate`/`scale`/`rotate` properties, which stack with GSAP's `transform`. Either let GSAP set the starting state, or use an arbitrary transform (`[transform:scaleX(0)]`) that GSAP can take over.
- The intro overlay (curtain, pixel transition) must be in the server HTML so the page never flashes through. Add a `<noscript>` rule that hides it.

## 13. Accessibility

- Real `button`s for actions, `a` for navigation, `aria-expanded`/`aria-controls` on menu toggles, `aria-label` on icon-only buttons.
- Mark decorative duplicates (`aria-hidden`) such as rolled button labels and marquee copies.
- When a full-screen menu is open, make the page behind it `inert` and stop Lenis.

## 14. Content

- Never use em dashes (the long dash) anywhere in the content: headings, body copy, captions, labels, alt text, metadata or code comments. Rewrite with a comma, a full stop, a colon or parentheses instead. Hyphens in compound words are fine.
- Never use eyebrow text: no small, uppercase or tracked label sitting above a section heading (for example "About us" or "Selected work"). A section starts with its heading.

## 15. Checklist before handing over

- [ ] `npx tsc --noEmit -p tsconfig.json` shows no errors in the template folder.
- [ ] `npx eslint "src/app/(marketing)/template-demo/<template-name>"` is clean.
- [ ] No `max-w-`, no `ch`, no `em`, no `px`/`rem` sizing, no values with two decimals.
- [ ] Widths and padding in `vw`/`%`, heights in `vh`, corners and gaps from Tailwind's scale.
- [ ] No `pt-`/`pb-`/`pl-`/`pr-`, no margins: spacing comes from `gap-*`, `space-y-*` or symmetric `px`/`py`.
- [ ] Only the text-size classes are used, and every `h3` has its size class.
- [ ] No `sm:`/`md:`/`lg:` prefixes, no `dark:`, no GSAP `pin`.
- [ ] Screenshots at 1440, 820 and 390 wide look right, with no horizontal overflow.
- [ ] Reduced motion shows every section in its final state.
- [ ] No em dashes in any content, and no eyebrow text above section headings.
- [ ] No version bumps or changelog edits unless asked.
