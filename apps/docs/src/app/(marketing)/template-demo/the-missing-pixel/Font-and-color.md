# Fonts and colours

Everything the template uses today, taken from the code. Scope: `the-missing-pixel/` only (the copied HTML reference files in `the-missing-pixel/the-missing-pixel/` are not counted).

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
- Any other element uses Host Grotesk through the `font-mpx-head` class (buttons, chips, links, prices, big numbers, quotes, menu links, logo text, footer wordmark, page-transition label).
- `font-mpx-body` switches an element back to DM Sans where it sits inside a heading-style element (small studio labels, menu eyebrow labels, the footer pixel-field hint).
- The footer pixel field reads the heading font at runtime to draw its text.

### Weights in use

| Weight | Class | Where |
|---|---|---|
| 500 | `font-medium` | The standard heading, button and link weight (35 uses). h1 is pinned to 500 in the stylesheet. |
| 600 | `font-semibold` | Footer wordmark, cursor label, small menu eyebrow labels (7 uses) |
| 700 | `font-bold` | "pixel" in the header and footer logo, two client names in the marquee (4 uses) |
| 300 | `font-light` | Two client names in the marquee |
| 400 | `font-normal` | Intro statement, large quotes (3 uses) |
| italic | `italic` | Marquee client names, the hover version of each menu link (7 uses) |

Weights loaded but used only once or twice: 300 and 700 of Host Grotesk, 600 of DM Sans.

### Text sizes

Defined in `missing-pixel-styles.css` (`text-128`, `text-64`, `text-40`, `text-30`, `text-28`, `text-24`, `text-22`, `text-14`). Not repeated here.

---

## Colours

### Defined in `missing-pixel-styles.css` (on `.mpx-page`)

| Variable | Value |
|---|---|
| `--mpx-accent` | `#ff5f00` |
| `--mpx-accent-deep` | `#cc4a00` (defined, not used anywhere) |
| `--mpx-ink` | `#0a0a0a` |
| `--mpx-paper` | `#fafafa` |
| `--mpx-muted` | `#5e5e5e` |
| `--mpx-surface` | `#eeeeee` |
| `--mpx-grad` | `linear-gradient(135deg, #ffb27a 0%, #ff7a2e 38%, #ff5f00 68%, #c24400 100%)` |

### Hex values written directly in components (21 distinct in the whole template)

| Value | Role | Uses |
|---|---|---|
| `#0a0a0a` | Ink: text, dark panels, buttons | 82 |
| `#f5f5f5` | Text and buttons on dark | 28 |
| `#ff5f00` | Brand orange | 24 |
| `#fafafa` | Page background, light buttons | 20 |
| `#5e5e5e` | Muted text on light | 7 |
| `#eeeeee` | Surface: chips, hover fills | 5 |
| `#cc4a00` | Form error red | 5 |
| `#ff8a4d` | Light orange accent on dark (menu) | 4 |
| `#0e0e0e` | Menu background | 4 |
| `#9a9a9a` | Muted text on dark (menu labels) | 3 |
| `#000` | Text-reveal mask only (not a visible colour) | 2 |
| `#bdbdbd` | Muted pixels in the "How we find it" grid | 2 |
| `#ff5f00` | Live status dot | 2 |
| `#cc4a00` | Deep orange (defined, unused) | 1 |
| `#ffb27a`, `#ff7a2e`, `#ff5f00`, `#c24400` | Brand gradient stops | 1 each |
| `#ffffff`, `#fff` | White | 1 each |
| `#0d0d0d` | Footer pixel field background | 1 |

### Colours written as opacity variants of black or white

| Class | Meaning | Uses |
|---|---|---|
| `border-black/10` | Hairline border on light | 42 |
| `text-white/60` | Muted text on dark | 16 |
| `border-black/30` | Button, input and circle border on light | 14 |
| `bg-white` | Cards and dropdowns | 9 |
| `bg-black/10` | Hairline divider on light | 5 |
| `border-white/15` | Border on dark | 5 |
| `border-black/20` | Tag and tool-pill border on light | 4 |
| `bg-black/30` | Divider on light | 2 |
| `border-white/30` | Border on dark | 2 |
| `bg-white/15` | Divider on dark | 2 |
| `text-white/80`, `text-white/40`, `border-white/50`, `border-white/20` | One-offs on dark | 1 each |

Other alpha colours: `#fafafa` at 90% (frosted header and sub-nav), `#ff8a4d` at 60% (open-menu toggle border), and a few `rgba` values for button hover states.

---

## Planned palette

A consolidated palette has been proposed but is **not applied yet**. It maps the values above to named variables (`--mpx-ink`, `--mpx-paper`, `--mpx-on-dark`, `--mpx-card`, `--mpx-surface`, `--mpx-surface-strong`, `--mpx-muted`, `--mpx-muted-dark`, `--mpx-soft-dark`, `--mpx-accent`, `--mpx-accent-soft`, `--mpx-line`, `--mpx-line-mid`, `--mpx-line-strong`, `--mpx-line-dark`, `--mpx-line-dark-strong`, `--mpx-glass`, plus the four gradient stops), with the near-duplicate blacks merged into `#0a0a0a` and the two near-duplicate reds merged into `#ff5f00`. Until that is applied, the tables above are the source of truth.
