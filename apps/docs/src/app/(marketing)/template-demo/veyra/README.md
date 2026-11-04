# Veyra

A scroll-driven AI and SaaS landing template, built with Next.js, Tailwind CSS, GSAP and Lenis. One flowing line travels the whole page: it connects particles, scattered data, workflows, agents and integrations through a dark story, then opens into a clean light product site with a live dashboard, team tabs, pricing and FAQ. Built using [Hyperiux Vault](https://vault.hyperiux.com).

## What's in this download

```
veyra/
├── Code/          # this Next.js project - see "Getting started" below
└── LICENSE.md     # your license terms
```

## What's included

Dark story (scroll-driven, nothing pinned; every scene animates as it passes through the viewport):

- **Initialization + Hero** - loading line and scrambled intro text, then an ASCII Band shader background, particle field, large headline and a live command card where agents run a typed request
- **Promise** - tangled lines organise into one workflow ribbon with activating nodes
- **Connected system** - scattered sources settle into a structured layout and connect to the intelligence layer
- **Context to action** - Understand, Plan, Execute drawn along a rising path
- **Intelligence engine** - nested rings that breathe with scroll, orbiting signals
- **Four pillars** - capability rows activate one by one with a live preview panel
- **Architecture** - four isometric layers stack, connect, then merge into one system
- **Integrations** - central node, outward connectors, data flowing back in
- **How it works** - Input, Analyse, Decide, Execute cards with a travelling packet and typed request
- **Automation** - a five-step run with status changes, checkmarks and a streamed AI summary
- **Outcome** - the thread straightens into a result and blooms into the light site

Light product site:

- **Platform** - editorial intro, scrolling "Veyra does..." band, capability hover previews
- **Features** - four cards with hover illustrations over an interactive dot grid
- **Dashboard** - real component-built workspace: count-ups, chart range toggle, checkable tasks, tooltips
- **Teams** - six animated tabs with a workflow demo per team
- **Proof** - draggable logo marquee and rolling metric counters (sample data)
- **Testimonials** - accessible quote carousel
- **Pricing** - monthly/yearly switch with rolling prices and a highlighted plan
- **FAQ** - animated accordion
- **CTA + Footer** - the line returns with interactive points

## Folder structure

Inside `Code/`:

```
app/
├── page.tsx                  # Metadata, fonts and section order
├── content.ts                # ALL copy, links, pricing, testimonials, metrics, FAQ
├── veyra-styles.css          # Colour tokens, text sizes, spacing, header themes
└── components/
    ├── Header.tsx / Footer.tsx / StoryRail.tsx
    ├── Hero.tsx, ParticleField.tsx
    ├── Promise.tsx ... Outcome.tsx        # dark story sections
    ├── Platform.tsx ... Pricing.tsx, Faq.tsx, Cta.tsx   # light product sections
    ├── Scene.tsx               # natural-height scene shell used by the story sections
    ├── Buttons.tsx, Icons.tsx  # shared UI
    ├── LenisSmoothScroll.tsx
    ├── Animations/
    │   ├── scene.ts            # useScene (scroll-scrubbed scenes), useReveal, draw/fade/line helpers
    │   ├── paths.ts            # SVG path builders (smooth curves, waves, connectors)
    │   ├── Lines.tsx           # masked heading lines
    │   └── reducedMotion.tsx
    └── effects/                # Hyperiux Vault effects used by the template
```

## Requirements

- Node.js 18.18+ (LTS recommended)
- npm, pnpm, or yarn

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Build with `npm run build` and `npm start`.

## Customizing content

- **Brand, copy, links and data** - everything lives in `content.ts`: brand name and tagline, navigation, every heading (as line arrays, so you control line breaks), integrations, testimonials, metrics, pricing plans, FAQ and footer links. You should not need to edit components to rebrand.
- **Placeholder data** - customer logos, testimonials and metrics are clearly marked samples. Replace them with your own verified content before launch.
- **Colours** - tokens are defined once on `.vey-page` in `veyra-styles.css` (`--vey-night`, `--vey-deep`, `--vey-lilac`, `--vey-mist`, `--vey-paper`, `--vey-ink`, `--vey-slate`, `--vey-line`).
- **Fonts** - Geist and Geist Mono via `next/font/google` in `page.tsx`.
- **SEO** - title, description and Open Graph tags are in `page.tsx` (`export const metadata`).
- **Section order** - compose, reorder or remove sections in `page.tsx`.

## Animation architecture

- **Scenes** - each story section is a natural-height `<Scene>`. `useScene` builds one GSAP timeline per section and scrubs it while the section scrolls into view, so motion follows the scroll and nothing is pinned. Headings and descriptions reveal once.
- **Responsive behaviour** - mobile uses the same timelines with simpler stacked layouts and fewer particles.
- **Header and story rail** - sections declare `data-vey-tone` (dark or light) and `data-vey-chapter`; the header switches theme and the side rail tracks the chapter from these.
- **Smooth scroll** - Lenis is driven from the GSAP ticker, and nav links scroll smoothly to section anchors.

## Effects

Reusable Hyperiux Vault effects in `components/effects/`:

- **ascii-band** - WebGL band of light drawn in flickering ASCII behind the hero
- **char-stagger-button** - per-character hover on every CTA
- **rolling-text** - rolling hover on header and footer links
- **scramble-text** - intro message and footer column titles
- **typing-text** - typed request and streamed AI answers
- **text-stream** - scroll-reactive vertical capability band
- **animated-hover-card** - capability preview cards
- **dotted-grid** - interactive dot background behind features
- **animated-tabs** - team tabs
- **animated-checkbox-group** - dashboard tasks
- **animated-tooltip** - dashboard stat and status hints
- **animated-toggle** - spinning plus on "New workflow"
- **border-beam** - light beam around the dashboard and Pro plan
- **animated-switch** - monthly/yearly billing switch
- **number-counter** - rolling metric digits
- **draggable-marquee** - draggable customer logo row
- **animated-faq** - FAQ accordion

## Reduced motion

Every scene checks `prefers-reduced-motion` and renders its final, fully readable state. The particle field draws a single static frame, and looping effects hold still.

## License

This template is licensed for use per your Hyperiux purchase agreement - see [`LICENSE.md`](../LICENSE.md) or [vault.hyperiux.com](https://vault.hyperiux.com) for full license terms. Do not redistribute or resell the source files outside of your licensed usage.
