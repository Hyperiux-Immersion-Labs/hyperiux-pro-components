# Fonts and colours

Everything the template uses today, taken from the code. Scope: `the-missing-pixel/` only.

## At a glance

| | Count |
|---|---|
| Font families | **2** (Host Grotesk, DM Sans) |
| Font files loaded | 13 (Host Grotesk 5 weights × normal and italic, DM Sans 3 weights) |
| Font weights used | 5 (300, 400, 500, 600, 700) plus italic |
| Brand colour variables | **9** (`ink`, `white`, `paper`, `grey`, `muted`, `accent`, `accent-light`, `accent-deep`, `surface`) |
| Distinct hex values | **8** (`surface` is an alias of `paper`) |
| Gradients | 1 (`--mpx-grad`) |

---

## Fonts

Two fonts, both loaded from Google Fonts in `layout.tsx` with `next/font` and exposed as CSS variables on the `.mpx-page` wrapper.

| Role | Font | Variable | Weights loaded |
|---|---|---|---|
| Headings, display, buttons, numbers, quotes | Host Grotesk | `--font-mpx-head` | 300, 400, 500, 600, 700, plus italic |
| Body copy, labels, small text | DM Sans | `--font-mpx-body` | 400, 500, 600 |

### How they are applied

- `.mpx-page *` defaults to `--font-mpx-body` (DM Sans).
- `h1`, `h2`, `h3` and everything inside them use `--font-mpx-head` (Host Grotesk).
- Any other element uses Host Grotesk through the `font-mpx-head` class (54 uses: buttons, chips, links, prices, big numbers, quotes, menu links, logo text, footer wordmark, page-transition label).
- `font-mpx-body` (4 uses) and `.mpx-eyebrow` switch an element back to DM Sans where it sits inside a heading-style element.
- Canvas text (the footer pixel field) reads the heading font at runtime.

### Weights in use

| Weight | Class | Uses |
|---|---|---|
| 500 | `font-medium` | 38. The standard heading, button and link weight. h1 is pinned to 500 in the stylesheet. |
| 600 | `font-semibold` | 8. Footer wordmark, cursor label, small menu eyebrow labels |
| 700 | `font-bold` | 4. "pixel" in the header and footer logo, two client names in the marquee |
| 400 | `font-normal` | 3. Intro statement, large quotes |
| 300 | `font-light` | 2. Two client names in the marquee |
| italic | `italic` | 4. Marquee client names, the hover version of each menu link |

Weights loaded but used only once or twice: 300 and 700 of Host Grotesk, 600 of DM Sans.

### Text sizes

Defined in `missing-pixel-styles.css` (`text-128`, `text-64`, `text-40`, `text-30`, `text-28`, `text-24`, `text-22`, `text-14`). Not repeated here.

---

## Colours

### Brand variables

Defined once on `.mpx-page` in `missing-pixel-styles.css`. This is the only place a hex value should be written for the page UI.

| Variable | Value | Role | Uses in components |
|---|---|---|---|
| `--mpx-ink` | `#0a0a0a` | Text, dark panels, buttons, hairlines | 150 |
| `--mpx-muted` | `#5e5e5e` | Muted text on light | 73 |
| `--mpx-white` | `#ffffff` | Cards, text and borders on dark | 53 |
| `--mpx-paper` | `#f5f5f5` | Page background, text and buttons on dark | 53 |
| `--mpx-accent` | `#ff5f00` | Brand orange | 31 |
| `--mpx-grey` | `#9a9a9a` | Muted text on dark | 16 |
| `--mpx-surface` | `var(--mpx-paper)` | Chips, hover fills | 10 |
| `--mpx-accent-deep` | `#e83a00` | Form error, input focus border | 5 |
| `--mpx-accent-light` | `#ffa033` | Gradient stop only | 0 direct |
| `--mpx-grad` | `linear-gradient(120deg, accent-light 0%, accent 50%, accent-deep 100%)` | Brand gradient (`bg-mpx-grad`) | 10 |

### How to write them in classes

- Plain classes defined in the stylesheet: `text-mpx-ink`, `text-mpx-muted`, `text-mpx-paper`, `text-mpx-accent`, `text-mpx-accent-deep`, `bg-mpx-ink`, `bg-mpx-paper`, `bg-mpx-accent`, `bg-mpx-surface`, `bg-mpx-grad`. Use these only when there is no variant and no opacity.
- Everything else uses the Tailwind variable syntax, because it supports `hover:`, `focus:`, `group-hover:` and `/NN` opacity:
  - text: `text-(color:--mpx-ink)`, `hover:text-(color:--mpx-accent)`, `text-(color:--mpx-white)/60`
  - background: `bg-(--mpx-ink)`, `hover:bg-(--mpx-paper)`
  - border: `border-(--mpx-ink)/30`, `border-(--mpx-white)/15`
- `text-` needs the `color:` hint, otherwise Tailwind reads the variable as a font size.
- The plain `text-mpx-*` and `bg-mpx-*` classes are unlayered CSS, so they beat Tailwind utilities. Do not combine one with a `hover:` colour on the same element.
- Short names like `text-mpx-white` or `border-mpx-ink/30` do not exist. They would need a `@theme` entry in `globals.css`, which this template does not touch.

### Hex values written in code

Only where CSS variables cannot be read: canvas drawing, GSAP tweens and the globe.

| Value | Where |
|---|---|
| `#0a0a0a` | Globe body, button colour map, process-grid cells |
| `#ff5f00` | Globe map colour, pixel-transition colour, process-grid highlight cells |
| `#ffffff` | Wordmark and pixel-field canvas masks, button colour map, globe grid lines |
| `#f5f5f5` | Button colour map |
| `#9a9a9a` | Process-grid muted cells |

Every one of these is a value from the brand table. There are no off-palette hex colours.

### Opacity and alpha

Opacity is applied to the brand variables with the `/NN` suffix (`border-(--mpx-ink)/10`, `border-(--mpx-ink)/30`, `bg-(--mpx-white)/15`, `text-(color:--mpx-white)/60`). Common steps are 10, 15, 30 and 60. A few `rgb()` and `rgba()` values built from the same ink and orange channels are used for shadows, glows and overlays.
