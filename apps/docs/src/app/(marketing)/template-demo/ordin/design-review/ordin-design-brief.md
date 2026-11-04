# Ordin: AI / SaaS landing page template, full design walkthrough

This document describes, top to bottom, everything currently on the Ordin landing page: layout, copy, colours, type, motion and interaction. It comes with a stitched screenshot (`ordin-full-page-desktop.png`, 17 frames at 1440 x 900). The scroll-driven sections are captured both mid-animation and fully played, because a single static capture can't show them.

**The goal:** improve the design so it becomes a premium, minimal and aesthetic template for AI and SaaS products, one that template buyers would click on from a listing and want to buy. Please give concrete, implementable suggestions (layout, spacing, type, colour, motion, content hierarchy), and keep the core concept unless you have a clearly better one.

---

## 1. The concept

**Product (fictional): Ordin**, "the operating layer for autonomous work". It's an AI agent platform: a company types a job in plain language, and Ordin reads the intent, wakes a team of specialist AI agents, checks every action against company policies, and delivers a finished, fully logged result.

**Positioning:** trust and control rather than raw AI power. The key line is *"Agents improvise. Policies don't."*

**Storytelling device:** one example prompt, *"Reconcile Q3 invoices, flag anything over budget and draft the vendor emails."*, travels through the whole page. A **particle globe** (the AI "core") stays on screen (fixed position) from the loader to the final CTA. Each section changes the globe's position, size and behaviour, so the page reads as one continuous run.

**Inspiration:** sui.io, for its serious, infrastructure-like tone, numbered systems, mono labels and scroll-driven storytelling.

**Who buys it:** founders and teams launching AI agent platforms, LLM infrastructure, AI copilots, automation tools and dev-tool SaaS.

---

## 2. Design system (current)

### Colour: one green family, taken from the "Aurora Ribbon" shader's default palette
| Token | Hex | Use |
|---|---|---|
| Ink (background) | `#0C1218` | Page background, dark text on light sections |
| Carbon (surface) | `#121B22` | Cards, featured pricing card |
| Graphite | `#1E2B31` | Dim text-fill colour, subtle lines |
| Stone (muted text) | `#7D8F8A` | Second half of headings, labels |
| Ash (secondary text) | `#B3C2BC` | Paragraphs |
| Bone (main text / light bg) | `#E6ECE4` | Headings on dark; background of the light sections |
| Primary (mint) | `#73BEA1` | Buttons, progress lines, active slabs, quote card, wires |
| Accent (aurora green) | `#6EF2B1` | Highlighted words, numbers' units, statuses, data pulses, globe highlights |
| Deep teal | `#13605D` | Accents on light sections |

The rule so far is **green only**; purple and yellow were tried and rejected. Text on mint fills is dark ink, not white.

### Type
- **Geist** (sans) for headings and body, regular weight with tight negative tracking on large sizes.
- **Geist Mono** for system labels, numbers, logs and chapter names, often uppercase.
- **Type scale:** sizes are in vw, at 1440px wide: H1 about 6.6vw, H2 4vw, card titles 1.5vw, body 1.2vw, small labels 0.7vw.
- **Line heights:** 1.2 for headings, 1.5 for paragraphs.
- **Heading pattern:** first sentence in bright text, second sentence in muted Stone (for example "One prompt. *Six specialists.*"). The hero and CTA instead put the second half in accent green.

### Layout and surfaces
- **Shapes:** a full-width editorial layout with a 3vw side gutter, hairline dividers (1px at low opacity), and square-ish corners (2–4px radius). No drop shadows.
- **Light sections:** two pale mint "paper" sections break up the dark page (Platform and Footer). The header switches to dark text over them.
- **Texture:** a subtle film-grain noise overlay across the whole page.

### Global elements
- **Header (fixed):** logo mark (a ringed circle with a mint dot) plus "Ordin" on the left, five nav links in the centre (Platform, Agents, Governance, Pricing, Docs) that scramble their letters on hover, and "Sign in" plus a solid mint "Get started" button on the right. A 1px mint scroll-progress line runs along the very top.
- **Chapter indicator (fixed, bottom-left):** a mono label such as "03 —— ORCHESTRATE" that rolls and scrambles to the current section's name. It hides over the footer.
- **Buttons:** magnetic toward the cursor, with a light sweep across on hover and an arrow that slides out diagonally and back in. Two styles: solid mint, and a 1px outline.
- **Cursor spotlight:** a soft mint radial glow follows the cursor inside agent cards, policy rows and pricing cards.
- **Scrollbar:** thin, with a teal-to-mint gradient thumb.
- **Smooth scroll:** Lenis.
- **Reduced motion:** a full fallback that shows every section in its final state.

---

## 3. Section-by-section walkthrough (top to bottom)

### 0. Loader / boot sequence (frame 01)
- **Screen:** full-screen teal-black with mono labels "ORDIN RUNTIME / BOOT SEQUENCE" top-left and "V4.2.0 / EU-WEST-1" top-right.
- **Bottom-left:** four status lines (Booting runtime, Loading memory, Arming policies, Waking agents). Each scrambles in when it's active and flips from "--" to "..." to "OK".
- **Bottom-right:** a large light counter running from 000 to 100%.
- **Progress line:** a horizontal 1px line fills in mint. It sits exactly where the hero's divider line will be.
- **Centre:** the particle globe assembles from a single point, spinning into a sphere while its orbit rings fade in. It already reacts to the cursor.
- **Hand-off:** the loader text slides away, the globe flies from the centre to its hero position, the progress line becomes the hero divider, and then the hero reveals. Scrolling is locked during the roughly 4.5-second intro.

### 1. Hero (frame 02)
- **Background:** a WebGL **Aurora Ribbon** shader, a soft diagonal ribbon of teal and mint light with film grain. It's kept subtle (75% opacity, lower on mobile), stirs like ink under the cursor, and parallaxes slowly on scroll.
- **Right side:** the **particle globe**, about 1,100 round dots on a rotating sphere with three thin orbit ellipses. The dots shade from aurora green at the back to pale mist at the front.
  - **Cursor physics:** dots are pushed away from the cursor and dragged along with its motion, then spring back. Nearby dots grow, brighten to aurora green, and get thin lines to the cursor, like neurons firing.
- **Headline (bottom-left, very large):** "The operating layer / for **autonomous work.**" The second line is in accent green. Lines rise up from a mask, and on scroll the headline drifts up and fades.
- **Under a 1px divider:** the paragraph "Ordin plans, routes, governs and ships agent work. One prompt in, a finished job out, every step on the record.", plus the buttons "Start building" (solid) and "Read the docs" (outline).
- **Bottom-right:** three mono trust labels (SOC 2 Type II / EU and US regions / Bring your own model) that scramble in.

### 2. Intake: "Every job starts as a sentence. *Not a workflow.*" (frames 03–04)
- **Scroll length:** sticky section, about 340vh of scroll.
- **Top:** the heading on the left and a paragraph on the right ("Ordin reads intent, not keywords…").
- **Centre:** the full prompt sentence in large text. As you scroll, each word becomes a bordered "token chip" with a small numeric token ID above it. The chips then fly one by one into the globe, now small and centred below, and vanish.
- **Bottom bar (mono):** "TOKENS IN 00 / 12" counting up, and "INTENT: finance.reconcile / 3 sub-tasks / 2 tools / budget USD 0.04" appearing at the end.

### 3. Orchestrate: "One prompt. *Six specialists.*" (frames 05–06)
- **Scroll length:** sticky section, about 420vh of scroll.
- **Globe:** small at centre, bursting outward.
- **Six agent cards:** 3 on the left and 3 on the right, each with an index, name, role and a progress hairline:
  - Planner: splits the job into nine ordered steps
  - Researcher: pulls the Q3 ledger and 212 contracts
  - Analyst: finds 14 invoices over budget
  - Coder: writes and tests the reconcile script
  - Critic: re-checks every figure against source
  - Courier: drafts 14 vendor emails for sign-off
- **Per-card sequence:** a curved wire draws from the globe to the card, the card fades in only when the wire reaches it, a bright pulse travels along the wire, the card's hairline fills, and its status flips from QUEUED to "DONE 1.1s".
- **End:** "RUN COMPLETE / 4.2s / 0 ERRORS".

### 4. Govern: "Agents improvise. *Policies don't.*" (frames 07–08)
- **Scroll length:** sticky section, about 400vh of scroll.
- **Left:** the globe sits inside three concentric policy rings (dotted, dashed and solid, slowly counter-rotating, with tick marks).
- **Right:** a heading and a list of five policies, each with an index, name and description: Scoped permissions, All-or-nothing runs, Spend ceilings, Human sign-off, Full audit trail. They start invisible.
- **Action packets:** small mono "action" chips fly in from the right toward the rings. As each one is checked, a wire draws from the ring out to the policy that governs it, and that policy fades in while earlier ones dim.
- **The six actions:**

  | Action | Result |
  |---|---|
  | `read ledger.q3()` | passes into the core |
  | `drop table vendors()` | hits the ring, gets struck through as DENIED, falls away |
  | `pay 14 invoices as one batch()` | passes |
  | `wire USD 48,000()` | denied |
  | `email 14 vendors()` | held as AWAITING SIGN-OFF, then passes |
  | `commit run 8821()` | passes |

### 5. Platform: "Six layers. *One runtime.*" (frames 09–10), light section
- **Section:** pale mint paper background, about 400vh of scroll, sticky.
- **Left:** an isometric tower of six square slabs, built from the bottom up as you scroll. Each slab drops in, turns mint as it lands, then settles to ink.
- **Right:** a heading, a paragraph, and a 2-column list of the six layers with index, name and description:
  - Runtime: durable execution
  - Memory: vector and graph recall
  - Tools: 840 connectors
  - Guard: policies
  - Evals: regression tests
  - Observe: traces, costs, replays
- **List reveal:** each list item appears with its slab.
- **Hover:** once the tower is complete, hovering a layer in the list slides its slab out to the right.

### 6. Principle: section break (frame 11)
- **Layout:** a centred statement in large type: "Autonomy without oversight is a liability. **Ordin** makes every agent accountable: scoped, budgeted, reviewed and replayable, by default, from the first run."
- **Motion:** about 170vh of scroll. The characters fill from dim to an aurora flash to white as you scroll, and the word "Ordin" fills to mint.

### 7. Proof: "Built for the load agents actually create. *Measured, not promised.*" (frames 12–13)
- **Stats:** four stats in columns separated by mint vertical hairlines, with rolling-digit counters: **2.4B** tokens routed every day / **142ms** median routing latency / **99.99%** runs finished without a retry / **38%** lower inference spend. The units are in accent green.
- **Trace panel:** a "TRACE / JOB_8821 • LIVE" panel, a continuously scrolling mono log of the run (timestamps, agent names in green, the denied line struck through).
- **Quote:** next to the trace, a solid mint card with a large quote: "We replaced four internal tools and a pager rotation with one Ordin workflow." (Priya Raman, Head of Finance Ops, Kestrel).
- **Logos:** a **draggable, throwable marquee** of fictional customer wordmarks (Kestrel, Monarch Labs, Fieldnote, Opaline, Brightwave, Atlas Freight, Northbeam, Quill & Co).

### 8. Pricing: "Priced per run. *Not per prompt.*" (frame 14)
- **Top:** a mono note on the right ("EVERY PLAN INCLUDES GUARDRAILS, TRACES AND REPLAYS"), and a pill toggle below it: **Monthly / Annual, save 20%** (a sliding mint pill, with the content sliding when switched).
- **Plans:** three cards.

  | Plan | Price | For | Features |
  |---|---|---|---|
  | Starter | $0, free forever | One builder shipping a first agent | 4 features |
  | Scale (featured, "MOST TEAMS" badge) | $49 per seat per month | Teams running agents in production | 5 features |
  | Enterprise | Custom | Regulated work and private deployments | 4 features |

- **Featured card:** a thin mint light travels around Scale's border.
- **Card details:** each card lists features with a green "+" and has a CTA button.

### 9. FAQ: "Questions, *answered.*" (frame 15)
- **Left:** heading, paragraph ("Still deciding? An engineer can walk your team through a live run in thirty minutes."), and a "Book a walkthrough" outline button.
- **Right:** a five-item animated accordion with numbered rows and plus/minus icons. Titles nudge right and borders turn mint on hover. Questions cover models, how policies stop agents, data residency, human approval, and run failures.

### 10. CTA (frame 16)
- **Layout:** a full-height centred headline, "Hand it the job. **Keep the rules.**" (second sentence in accent green), a short paragraph ("Free for the first 10,000 runs…"), and "Start building" / "Talk to an engineer" buttons.
- **Globe:** large behind the content, cleanly clipped at the section's bottom edge.

### 11. Footer (frame 17), light section
- **Reveal:** parallax, sliding out from under the page.
- **Background:** pale mint paper with ink text.
- **Left:** logo plus the tagline.
- **Right:** four link columns (Platform, Solutions, Developers, Company) with mono teal titles. Links scramble on hover.
- **Wordmark:** a huge soft-tint "ordin" wordmark across the middle.
- **Bottom bar:** "(C) 2026 ORDIN LABS / • ALL SYSTEMS OPERATIONAL / PRIVACY / TERMS".

### Mobile (frame 18)
Same story in a single column. The globe repositions per section, and the shader is dimmer. The agent cards become a 2x3 grid without wires, the policy list sits under the rings, and the stack tower is smaller.

---

## 4. Tech and constraints (keep suggestions implementable)
- **Stack:** Next.js (App Router), React, Tailwind CSS v4, GSAP with ScrollTrigger and SplitText, Lenis, Canvas 2D for the globe, and WebGL for the shader.
- **Hyperiux effects in use:** Aurora Ribbon (shader), overflow text reveal, text fill animation, scramble text, scramble link button, number counter, draggable marquee, animated tabs, animated FAQ, parallax footer.
- **House rules:**
  - **Units:** vw widths and padding, vh heights, and eight named text sizes only.
  - **Content:** no em dashes in copy, and no "eyebrow" labels above headings.
  - **Motion:** all motion via GSAP, and sticky sections instead of GSAP pinning.
  - **Performance:** it currently runs at 60fps. Avoid heavy blur or filter animations; a border-beam effect was removed for causing lag.

---

## 5. Known weaknesses I'd like you to tackle
1. **Hero impact for listing thumbnails:** the hero should be instantly striking in a template listing card. The headline is strong, but the composition could be more distinctive.
2. **Sameness:** the dark sections share the same pattern (big two-tone heading top-left, content below). The rhythm could use more variety in layout, scale and negative space.
3. **Typography:** Geist is clean but common. Consider a more distinctive display face, or a better scale and contrast between display, body and mono.
4. **Colour:** the all-green palette is cohesive but can feel flat. Suggest how to add depth (tints, gradients, materials, light) without adding a second hue.
5. **Proof section:** it's dense (stats, trace, quote and marquee together). It could be more elegant.
6. **Pricing and FAQ:** functional but generic. How could they feel as premium as the storytelling sections?
7. **Micro-details:** iconography, product UI mockups (there are no real product screenshots yet), imagery, and a stronger visual signature that makes it feel like a premium template brand.
8. **Mobile and tablet:** suggestions for an equally premium small-screen experience.

**Please return:** prioritised design improvements, an updated section order if useful, specific type, colour and spacing values, motion ideas tied to the AI-agent story, and any section you would add, cut or merge.
