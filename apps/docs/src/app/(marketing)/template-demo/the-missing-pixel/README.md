# The Missing Pixel

A multi-page website template for a brand and digital design studio, built with Next.js, Tailwind CSS, and GSAP scroll animations. Built using [Hyperiux Vault](https://vault.hyperiux.com).

## What's in this download

```
the-missing-pixel/
├── Code/          # this Next.js project - see "Getting started" below
└── LICENSE.md     # your license terms and third-party credits
```

## What's included

Six page types, 31 pages in total:

- **Home** - hero, client marquee, scroll-opening showreel, horizontal work gallery, pixel process scrollytelling, services, testimonials, journal
- **Work** - filterable project grid, plus 8 case studies (`/work/[slug]`)
- **Services** - service list and pricing, plus 6 service detail pages (`/services/[slug]`)
- **About** - studio story, beliefs, team grid, awards list
- **Journal** - featured post and post grid, plus 9 articles (`/blog/[slug]`) with a reading progress bar
- **Contact** - validated contact form and a studio locations panel
- **Shared** - pixel page transition, full-screen menu with page previews, custom cursor, footer CTA, parallax footer with newsletter form, optional synthesised sound

## Folder structure

Inside `Code/`:

```
src/
├── app/
│   ├── layout.tsx               # Loads Host Grotesk + DM Sans (Google Fonts) via next/font; shared shell
│   ├── page.tsx                 # Home - composes every section, in order
│   ├── work/                    # /work and /work/[slug]
│   ├── services/                # /services and /services/[slug]
│   ├── about/                   # /about
│   ├── blog/                    # /blog and /blog/[slug]
│   ├── contact/                 # /contact
│   ├── routes.ts                # Every internal link in one place
│   ├── metadata.ts              # Shared SEO / social preview helper (set your domain here)
│   ├── globals.css              # Tailwind import and theme values
│   └── missing-pixel-styles.css # Colour tokens and scoped base styles
├── assets/
│   ├── pictures/                # Images
│   └── video/                   # Showreel and menu videos
└── components/
    ├── home/                    # Home page sections
    ├── work/                    # Work grid and case study parts + projects.ts (content)
    ├── services/                # Services parts + services.ts (content)
    ├── about/                   # About page sections
    ├── blog/                    # Journal parts + posts.ts (content)
    ├── contact/                 # Contact form, studio panel, studio map
    ├── shared/                  # Header, menu, footer, cursor, smooth scroll, page hero, etc.
    ├── Buttons/                 # Pixel button, underline link, icons
    ├── Animations/              # Shared GSAP + reduced-motion helpers
    ├── Sound/                   # Synthesised sound effects and the sound toggle
    └── effects/                 # Self-contained effect components
        ├── animated-faq/
        ├── animated-form/
        ├── globe/
        ├── immersive-full-screen-nav/
        ├── number-counter/
        ├── parallax-footer/
        ├── parallax-image/
        ├── pixel-reveal/
        ├── pixel-transition/
        ├── spotlight-effect/
        ├── square-translate/
        └── testimonial-swiper/
```

## Requirements

- Node.js 20.9+ (LTS recommended)
- npm, pnpm, or yarn

## Getting started

1. Install dependencies (from the `Code/` folder). No environment variables or API keys are needed:

   ```bash
   cd Code
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

- **Copy** - edit the text directly inside each section component (e.g. `components/home/Hero.tsx`, `components/about/Beliefs.tsx`).
- **Projects, services and articles** - the content behind the list and detail pages lives in `components/work/projects.ts`, `components/services/services.ts` and `components/blog/posts.ts`. Adding an entry there creates its detail page.
- **Images and videos** - replace the files in `assets/` with your own, keeping the same filenames, or update the `import` paths in the component that uses them.
- **Colors & fonts** - the `--mpx-*` colour tokens live in `missing-pixel-styles.css`. Headings use Host Grotesk and body text uses DM Sans, both loaded in `layout.tsx` with `next/font/google`; swap either for any other Google font there, or use `next/font/local` with font files you're licensed to use.
- **SEO / social preview** - each page sets its title and description with `pageMetadata()` from `metadata.ts`. Before deploying, change `SITE_URL` in `metadata.ts` to your live domain so canonical URLs and social preview images resolve correctly. The social preview image is `assets/pictures/missing-pixel-og.png`.
- **Contact details** - the email address (`hello@example.com`) and studio addresses are placeholders, in `components/contact/`, `components/shared/` and `components/about/TeamGrid.tsx`.
- **Forms** - the contact form (`components/contact/ContactForm.tsx`) and newsletter form (`components/shared/Footer.tsx`) validate and show a success state, but don't send anywhere. Connect them to your own endpoint or form service.
- **Links** - every internal link comes from `routes.ts`. To serve the site under a sub-path, set `BASE` there and `basePath` in `next.config.mjs`.

## Sound

The template plays short synthesised sounds on hover and navigation, generated in the browser with the Web Audio API (`components/Sound/`). Sound is off until the visitor turns it on with the toggle in the header, and the choice is remembered.

## Smooth scrolling

`components/shared/LenisSmoothScroll.tsx` mounts [Lenis](https://lenis.darkroom.engineering/) for smooth scrolling, and `ScrollTopOnLoad.tsx` resets scroll position on load. Scrollable areas opt out with the `data-lenis-prevent` attribute.

## Reduced motion

Animated sections respect `prefers-reduced-motion` via the helpers in `components/Animations/reducedMotion.tsx` - visitors with that OS/browser setting enabled get a static, fully browsable page instead of scroll/loop animations.

## License

This template is licensed for use per your Hyperiux purchase agreement - see [`LICENSE.md`](../LICENSE.md) or [vault.hyperiux.com](https://vault.hyperiux.com) for full license terms. Do not redistribute or resell the source files outside of your licensed usage.
