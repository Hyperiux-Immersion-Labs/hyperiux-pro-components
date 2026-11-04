# Ordin

A minimal, scroll-driven landing page template for AI and SaaS products, built with Next.js, Tailwind CSS, GSAP and Lenis. Built using [Hyperiux Vault](https://vault.hyperiux.com).

Ordin presents a fictional AI agent platform, "the operating layer for autonomous work". The look is calm and technical: a mint and forest-green palette, editorial type, flat square-edged blocks, the Hyperiux Aurora Ribbon shader behind the dark sections and a particle globe as the brand symbol.

## Sections

| # | Section | Background | Scroll interaction |
|---|---|---|---|
| 1 | Hero | Dark, Aurora Ribbon, globe | Headline reveal on load; content lifts and the globe turns as you scroll away |
| 2 | Instruction to execution | Dark, Aurora Ribbon | Instruction card enters, connections draw, task rows appear, statuses activate |
| 3 | Six specialists | Dark, Aurora Ribbon, small globe | Globe assembles, six connections draw, specialists reveal in turn |
| 4 | Governance | Dark, Aurora Ribbon, bounded globe | The fixed boundary draws around the globe while the network inside keeps moving |
| 5 | Six-layer architecture | Light | Layers separate vertically, a spine draws; hovering a layer or row highlights both |
| 6 | Manifesto | Dark, Aurora Ribbon at the bottom | Headline reveal, then each line lights up in turn |
| 7 | Product proof | Light | Metrics count up, the execution report fills in |
| 8 | Pricing | Light | Monthly and yearly toggle, plans rise in |
| 9 | Social proof | Light | Logos and testimonial fade in |
| 10 | FAQ | Light | Accordion, one item open at a time |
| 11 | Final CTA | Dark, Aurora Ribbon, globe | Headline reveal, globe assembles |
| 12 | Footer | Light | Wordmark and link columns fade in |

Every section animation is scrubbed to the scroll position, so it plays forward and backward with the page. Nothing is pinned.

## Customizing

Everything a buyer edits lives in **`content.ts`**:

- `theme`: every colour on the page, plus the Aurora Ribbon colours. The page passes these to CSS variables (`--orn-mint`, `--orn-forest`, ...), and the globe and shader read them directly.
- `brand`, `nav`: name, home link, navigation and header button.
- `hero`, `execution`, `specialists`, `governance`, `architecture`, `manifesto`, `proof`, `pricing`, `social`, `faq`, `cta`, `footer`: all copy, links, icons, plans, metrics and FAQ items.

The metrics in `proof` and the testimonial in `social` are **placeholders**. Replace them with real, verified data before launch. The logo mark is `LogoMark` in `components/Icon.tsx`.

## Folder structure

```
ordin-v2/
├── page.tsx                 Metadata, fonts (Manrope, Inter, IBM Plex Mono), theme variables, section order
├── content.ts               All content and colours
├── ordin-v2-styles.css      Type scale, spacing, scoped base styles
└── components/
    ├── AuroraLayer.tsx      One fixed Aurora Ribbon behind every dark section (a single WebGL context)
    ├── ParticleGlobe.tsx    Canvas particle globe: scroll-driven form and spin, cursor response, signal pulses
    ├── Header.tsx           Nav that switches tone over light sections, scroll progress line, mobile menu
    ├── Hero.tsx … Footer.tsx One file per section
    ├── Button.tsx, Icon.tsx
    ├── LenisSmoothScroll.tsx
    ├── Animations/          scroll.ts (scrubbed timelines, line reveals, path drawing), reducedMotion.tsx
    └── effects/             aurora-ribbon, animated-faq
```

## Performance

- The Aurora Ribbon runs once, fixed behind the page. It is hidden, and stops rendering, whenever no dark section is on screen.
- Each globe stops rendering when it is off screen or the tab is hidden. Particle count and pixel ratio drop on mobile (DPR capped at 1.5 on desktop, 1 on mobile).
- Without WebGL, the dark sections fall back to the shader's solid background colour.

## Reduced motion

With `prefers-reduced-motion`, every section shows its final state, the globes are drawn once and the shader holds still.

## License

This template is licensed for use per your Hyperiux purchase agreement. See [vault.hyperiux.com](https://vault.hyperiux.com) for full license terms.
