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
| 1 | **Hero** | "The operating layer for autonomous work." | Aurora Ribbon shader, a cursor-reactive particle globe, line-by-line text reveal |
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

## Design language

- **Palette** - taken from the Hyperiux Aurora Ribbon's own colours and kept to one green family:
  - `#0C1218` teal-black background
  - `#73BEA1` mint primary (buttons, lines, active states)
  - `#6EF2B1` aurora green accent (highlights, numbers, statuses)
  - `#13605D` deep teal for accents on light sections
  - `#E6ECE4` pale mint paper for the light sections
- **Type** - Geist throughout. Small labels, numbers and logs use Geist at medium weight with even-width digits. Headings use a 1.2 line height and paragraphs 1.5.
- **Tone** - minimal and editorial, built on hairline dividers. The story sections are dark; Platform and everything from Proof to FAQ sit on pale mint paper with square, bordered cards and line icons. Every animation is tied to scroll and carries meaning (tokens, wires, policies, layers) rather than decoration.

## Folder structure

```
ordin/
├── page.tsx                    # Metadata, fonts and section order
├── ordin-styles.css            # Colour tokens, type scale, spacing, scrollbar
└── components/
    ├── IntroLoader.tsx          # Boot-sequence loader that hands off to the hero
    ├── SignalOrb.tsx            # Particle globe and the scroll timeline that moves it
    ├── HeroBackdrop.tsx         # Aurora Ribbon shader behind the hero
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
        ├── aurora-ribbon/
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

## Customizing content

- **Copy** - edit the text inside each section component. The demo prompt lives in `PROMPT` in `Hero.tsx` and is reused by the Intake section.
- **Agents, policies and layers** - edit the `AGENTS` array in `Swarm.tsx`, `POLICIES` and `ACTIONS` in `Guardrails.tsx`, and `LAYERS` in `Stack.tsx`. The animations adapt to the items you provide.
- **Metrics and report** - `STATS` and `REPORT` in `Metrics.tsx`.
- **Logos and quote** - `LOGOS` and `QUOTE` in `Social.tsx`.
- **Plans** - `PLANS` in `Pricing.tsx`; set `featured: true` on the plan that gets the highlight.
- **Colours** - tokens live at the top of `ordin-styles.css` (`--ord-ink`, `--ord-primary`, `--ord-primary-light`, `--ord-primary-deep`, `--ord-bone`). The globe colours are `MIST` and `PRIMARY` in `SignalOrb.tsx`, and the shader colours are set in `HeroBackdrop.tsx`.
- **Globe** - its position and size in each section are the `DESKTOP` and `MOBILE` pose tables in `SignalOrb.tsx`.
- **Loader** - the boot steps are `STEPS` in `IntroLoader.tsx`.
- **SEO** - title, description and canonical URL are in `page.tsx` (`export const metadata`).
- **Section order** - sections are composed in `page.tsx`; reorder or remove them there.

## Effects

Hyperiux effects used in `components/effects/`:

- **aurora-ribbon** - WebGL ribbon of light behind the hero that the pointer stirs
- **overflow-text-reveal** - masked line reveal used for every heading and paragraph
- **text-fill-animation** - scroll-synced colour fill for the section break
- **scramble-text** - scrambled reveal for labels, status lines and the chapter indicator
- **scramble-link-button** - nav and footer links that scramble on hover
- **number-counter** - rolling digit counters for the metrics
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
