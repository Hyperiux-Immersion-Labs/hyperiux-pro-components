# Ordin

A scroll-driven landing page template for AI and SaaS products, built with Next.js, Tailwind CSS, GSAP and Lenis. Built using [Hyperiux Vault](https://vault.hyperiux.com).

Ordin presents a fictional **AI agent platform**: "the operating layer for autonomous work". The whole page follows one prompt from the moment it is typed to the moment the job is finished, so the product story and the scroll animations are the same thing.

## Who it is for

Teams launching an AI or SaaS product that needs to look serious and premium:

- AI agent and automation platforms
- LLM infrastructure, AI ops and model governance tools
- AI copilots and assistants for business teams
- Developer tools and API-first SaaS

Swap the name, copy, numbers and logos and the structure carries any product that turns a request into a governed, finished result.

## The concept

**Product.** Ordin lets a company hand real work to AI agents without losing control. A user types a job in plain language (the demo uses *"Reconcile Q3 invoices, flag anything over budget and draft the vendor emails."*) and Ordin:

1. **Reads intent** - the sentence is tokenized and parsed into tasks, tools and a budget.
2. **Orchestrates** - it wakes only the specialist agents the job needs and gives them a shared memory.
3. **Governs** - every action is checked against company policies before it runs.
4. **Delivers on the record** - the run settles in full, and every step is traced and replayable.

**Positioning.** Most AI products sell smart agents. Ordin sells trust: *"Agents improvise. Policies don't."*

**Storytelling.** A particle globe, the AI "core", stays on screen through the whole page. It forms in the loader, settles into the hero, absorbs the prompt's tokens, bursts into a swarm of agents, sits inside the policy rings, and returns large behind the final call to action. Each section gives it a new role, so the page reads as one continuous run instead of separate blocks.

## What's included

| # | Section | What it shows | Signature interaction |
|---|---|---|---|
| 0 | **Loader** | A boot sequence: runtime, memory, policies, agents | The globe assembles from a point, a counter runs to 100, and the progress line becomes the hero rule |
| 1 | **Hero** | "Agents that finish the job." | Mint Arc Light shader you can stir with the cursor, a cursor-reactive particle globe, line-by-line text reveal |
| 2 | **Intake** | "Every job starts as a sentence." | The prompt splits into token chips that fly into the globe |
| 3 | **Orchestrate** | "One prompt. Six specialists." | Wires draw from the globe to six agent cards, which appear as each wire arrives and flip from queued to done |
| 4 | **Govern** | "Agents improvise. Policies don't." | Actions fly at a policy ring: safe ones pass, risky ones are denied, and each policy wires in as it is triggered |
| 5 | **Platform** | "Six layers. One runtime." | An isometric tower builds from the bottom up; hovering a layer slides its slab out |
| 6 | **Principle** | The brand statement | Scroll-synced text fill, with the brand name in the primary colour |
| 7 | **Proof** | Scale and trust metrics and an execution report for one run | Rolling counters, ticks that land row by row |
| 8 | **Pricing** | Starter, Scale and Enterprise, priced per run | Monthly and annual tabs, a travelling light around the featured plan |
| 9 | **Customers** | Logos and a testimonial | Draggable logo marquee |
| 10 | **FAQ** | Models, policies, data residency, approvals, failures | Animated accordion |
| 11 | **CTA** | "Hand it the job. Keep the rules." | The globe grows behind the headline and is clipped cleanly at the section edge |
| 12 | **Footer** | Links, status, large wordmark | Parallax reveal from under the page, scramble links |

Site-wide details: a header that hides as you scroll down, returns as you scroll up and switches tone over light sections, a scroll progress line, a chapter indicator that names the current section, magnetic buttons, cursor spotlights on cards, and a themed scrollbar.

## Pages

| Route | Page | What's on it |
|---|---|---|
| `/` | **Home** | The full story above, from loader to footer |
| `/platform` | **Platform** | Live run trace, pinned isometric tour of the six layers, capabilities grid, connector marquees, SDK code that types itself |
| `/agents` | **Agents** | Agent handoff graph, "Ordin does..." text stream, horizontal relay of the six specialists, live agent chat, custom-agent code card |
| `/governance` | **Governance** | Policy rings with a decision log, pinned policy gate that stamps each action, sortable audit-log table, compliance grid, policy-as-code card |
| `/pricing` | **Pricing** | Live usage meter, cost estimator on the Animated Slider, plans with monthly and annual tabs, comparison table, FAQ |
| any other URL | **404** | Branded not-found page |

Every page shares one layout (header with a mobile menu, parallax footer, smooth scroll, grain, and the enquiry dialog) and moves between pages with the Hyperiux **Block Transition**. Every hero uses the same mint Arc Light shader, mirrored and paced differently per page, and every inner page ends with the particle globe behind the closing call to action.

The inner pages are built from reusable, prop-driven sections in `components/pages/`, so a new page is mostly copy:

- `PageHero` - headline, copy, buttons, an optional animated visual and an Arc Light shape
- `Tour` - a pinned walk-through with a progress list (or an isometric tower) and swapping detail panels
- `FeatureGrid` - a light, bordered grid whose cards wipe in and whose icons draw on hover
- `CodeShowcase` - copy and points beside a code card that types itself as you scroll

A section names its own chapter for the bottom-left indicator with `data-ord-chapter`.


## Design language

- **Palette** - one mint-green family on a blue-black ink, all set in `theme.ts`:
  - `#0C1218` teal-black background
  - `#73BEA1` mint primary (buttons, lines, active states)
  - `#6EF2B1` bright mint accent (highlights, numbers, statuses)
  - `#13605D` deep teal for accents on light sections
  - `#E6ECE4` pale mint paper for the light sections
- **Type** - Geist throughout. Small labels, numbers and logs use Geist at medium weight with even-width digits. Headings use a 1.2 line height and paragraphs 1.5.
- **Tone** - minimal and editorial, built on hairline dividers. The story sections are dark; Platform and everything from Proof to FAQ sit on pale mint paper with square, bordered cards and line icons. Every animation is tied to scroll and carries meaning (tokens, wires, policies, layers) rather than decoration.

## Folder structure

```
ordin/
├── layout.tsx                  # Fonts, header, footer, smooth scroll and page transition for every page
├── page.tsx                    # Home: metadata and section order
├── platform/ agents/ governance/ pricing/   # One page.tsx per route
├── not-found.tsx               # Branded 404
├── theme.ts                    # Every colour in the template
├── metadata.ts                 # Per-page title, description, canonical URL
├── ordin-styles.css            # Colour tokens, type scale, spacing, scrollbar
└── components/
    ├── IntroLoader.tsx          # Boot-sequence loader that hands off to the hero
    ├── SignalOrb.tsx            # Particle globe and the scroll timeline that moves it
    ├── HeroBackdrop.tsx         # Arc Light shader behind the home hero
    ├── MintArc.tsx              # The Arc Light in the theme colour, used by every hero
    ├── MobileMenu.tsx           # Full-screen menu below 1025px
    ├── nav.ts                   # Routes and nav links for header, menu and footer
    ├── pages/                   # Reusable inner-page sections and their content.ts
    ├── platform/                # Platform-only sections and content.ts
    ├── Header.tsx               # Nav, progress line, chapter indicator
    ├── Hero.tsx                 # Headline, copy and calls to action
    ├── Tokens.tsx               # Intake: prompt to tokens
    ├── Swarm.tsx                # Orchestrate: six agents
    ├── Guardrails.tsx           # Govern: policy ring and actions
    ├── Stack.tsx                # Platform: six-layer tower
    ├── Statement.tsx            # Principle: text-fill section break
    ├── Metrics.tsx              # Proof: counters and execution report
    ├── Pricing.tsx              # Plans with monthly and annual tabs
    ├── Social.tsx               # Customers: logo marquee and testimonial
    ├── Faq.tsx                  # Questions
    ├── Cta.tsx                  # Closing call to action
    ├── Footer.tsx               # Parallax footer
    ├── Buttons.tsx              # Magnetic button and logo mark
    ├── Icon.tsx                 # Line icons used in the light sections
    ├── LenisSmoothScroll.tsx    # Lenis provider driven by the GSAP ticker
    ├── Animations/              # Shared helpers
    │   ├── intro.ts             # "Intro finished" signal shared by loader, globe, hero, header
    │   ├── LineReveal.tsx       # Line-by-line heading and paragraph reveal
    │   ├── BeamFrame.tsx        # Lightweight travelling-light border
    │   ├── Spotlight.tsx        # Cursor spotlight for cards
    │   ├── useMagnetic.ts       # Magnetic hover
    │   ├── useReveal.ts         # Fade-up for cards as they scroll in
    │   ├── useResizeKey.ts      # Rebuilds scroll timelines on resize
    │   └── reducedMotion.tsx    # Reduced-motion and device helpers
    └── effects/                 # Hyperiux effects, adapted to the Ordin theme
        ├── overflow-text-reveal/
        ├── text-fill-animation/
        ├── scramble-text/
        ├── scramble-link-button/
        ├── number-counter/
        ├── draggable-marquee/
        ├── animated-tabs/
        ├── animated-faq/
        └── parallax-footer/
```

## Requirements

- Node.js 18.18+ (LTS recommended)
- npm, pnpm, or yarn

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the dev server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the template.

4. Build for production:

   ```bash
   npm run build
   npm start
   ```

## Customizing

### Brand colours - one file

Every colour lives in **`app/theme.ts`**. Change the values there and the whole site follows: the CSS, every Tailwind class (they read `--ord-*` custom properties generated from this file), the particle globe, the Arc Light shaders, the page transition and the data table and chat components.

```ts
export const THEME = {
  ink: "#0c1218",          // page background
  primary: "#73bea1",      // buttons, lines, active states
  primaryLight: "#6ef2b1", // highlights, numbers, glows
  primaryDeep: "#13605d",  // accents on light sections
  // ...
};
```

Pick `primary`, `primaryLight`, `primaryDeep` and `primaryHover` from one hue and the rest stays balanced. In your own components, use `bg-(--ord-primary)`, `text-(--ord-primary-light)/60` and so on, or import `THEME` / `alpha()` for canvas, SVG and GSAP values.

### Navigation and links

- **`components/nav.ts`** - the page routes and the links shown in the header, the mobile menu and the footer. Add a page here and it appears in all three.
- `BASE` in the same file prefixes every internal link. Leave it empty to serve the site from `/`, or set it (with `basePath` in `next.config.mjs`) to serve it under a sub-path.

### Copy

- **Inner pages** - `components/pages/content.ts` (agents, policies, compliance, code samples, plan comparison) and `components/platform/content.ts` (layers, capabilities, connectors, SDK code).
- **Home page** - each section keeps its list at the top of its own file: `AGENTS` in `Swarm.tsx`, `POLICIES` and `ACTIONS` in `Guardrails.tsx`, `LAYERS` in `Stack.tsx`, `STATS` and `REPORT` in `Metrics.tsx`, `PLANS` in `Pricing.tsx`, `QUOTES` and `LOGOS` in `Social.tsx`, `ITEMS` in `Faq.tsx`, and the demo prompt `PROMPT` in `Hero.tsx`.
- **Page titles and descriptions** - each route's `page.tsx` calls `pageMetadata(title, description, slug)`. Set `SITE_URL` in `app/metadata.ts` to your domain.
- **Numbers are samples.** Metrics, certifications, connector counts and prices are illustrative. Replace them with your own before launch.

### The enquiry dialog

There is no contact page: every "Talk to sales", "Talk to security" and "Book a walkthrough" opens `components/EnquiryDialog.tsx`, the Hyperiux Animated Dialog growing out of the button that was clicked. Point any link at `ENQUIRE.demo`, `ENQUIRE.sales` or `ENQUIRE.security` (from `nav.ts`) and it opens on that topic.

The form validates and shows a success state, but has no backend. In `onSubmit`, replace the `setTimeout` with a `fetch` to your CRM, email service or API route, then call `setState("sent")` when it succeeds.

### Rolling numbers

Every number that reveals or changes (stats, prices, counters, the estimator, the usage meter, the trace clock, the loader) uses `components/Animations/Roll.tsx`, built on the Animated Slider's odometer digits. Use `<Roll value="2.4" reveal />` to roll up from zero on scroll, or pass changing values and it springs between them.

### The pricing estimator

The sample rates sit at the top of `components/pages/CostEstimator.tsx` (`FREE_RUNS`, `SCALE_RATE`, `ENTERPRISE_FROM`, `ENTERPRISE_RATE`). Change them to match your real pricing.

### Layout limits worth knowing

A few home-page set pieces are hand-placed for their sample content:

- **Orchestrate** (`Swarm.tsx`) places exactly six agent cards; to change the count, add or remove entries and adjust each card's `pos`.
- **Govern** (`Guardrails.tsx`) ties each action to a policy by index (`policy: 0..4`).
- **The globe** moves between poses keyed by each home section's `data-ord-orb` name (the `DESKTOP` and `MOBILE` tables in `SignalOrb.tsx`). A section without a pose keeps the globe where it was, so give a new home section an entry, or a pose with `opacity: 0` to hide it.

The inner-page sections (`Tour`, `FeatureGrid`, `CodeShowcase`, the relay, the policy gate and the audit table) adapt to however many items you pass them.


## Effects

Hyperiux effects used in `components/effects/`:

- **arc-light** - WebGL arcs of light behind every hero (through `MintArc.tsx`), rendered in greyscale and tinted mint, mirrored per page, and stirred by the cursor
- **block-transition** - blocks in the primary colour that cover and reveal the page between routes
- **animated-slider** - the cost estimator's slider, and the odometer digits behind every rolling number
- **animated-dialog** - the enquiry dialog
- **animated-data-table** - the Governance audit log: sortable, filterable, rolling numbers, rows that open to their steps
- **animated-chat-bubble** - the Agents handoff chat, with typing indicators and streamed replies
- **typing-text** - the prompt that types itself into the Agents chat
- **text-stream** - "Ordin" finishing one sentence many ways on the Agents page
- **colorful-cursor-aura** - three trailing mint circles that show through the footer wordmark
- **overflow-text-reveal** - masked line reveal used for every heading and paragraph
- **text-fill-animation** - scroll-synced colour fill for the section break
- **scramble-text** - scrambled reveal for labels, status lines and the chapter indicator
- **scramble-link-button** - nav and footer links that scramble on hover
- **draggable-marquee** - logo strip you can drag and throw
- **animated-tabs** - monthly and annual pricing toggle
- **animated-faq** - accordion for the questions section
- **parallax-footer** - footer revealed from under the page

## Smooth scrolling

`LenisSmoothScroll.tsx` mounts [Lenis](https://lenis.darkroom.engineering/), driven by the GSAP ticker so every ScrollTrigger animation stays in sync. The loader locks scrolling until the intro finishes.

## Reduced motion

Every animated section respects `prefers-reduced-motion`. Visitors with it enabled skip the loader, see each section in its final state, and get a static globe and shader.

## License

This template is licensed for use per your Hyperiux purchase agreement - see [vault.hyperiux.com](https://vault.hyperiux.com) for full license terms. Do not redistribute or resell the source files outside of your licensed usage.
