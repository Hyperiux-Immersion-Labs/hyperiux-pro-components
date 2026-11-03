# Oris Dental - Modern Dental Clinic Template

A single-page website template for dental clinics, orthodontists, and cosmetic dental practices. One scrolling page - 3D interactive hero, about us with slot counters, scroll-pinned treatments, parallax statement break, a four-step booking guide, floating ribbon review showcase, a meet-the-team section with per-doctor booking, FAQs, an appointment form with date and time-slot pickers, and interactive footer - built from [Hyperiux Vault](https://vault.hyperiux.com) effects arranged into a full site.

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript / JSX |
| 3D | Three.js + `@react-three/fiber` + `@react-three/drei` |
| Styling | Tailwind CSS + `oris-dental.css` |
| Animation | GSAP 3 (`ScrollTrigger`, `SplitText`) |
| Smooth scroll | Lenis (`lenis/react`) |

No CMS, no backend - content lives directly in the section files as plain data.

## What's in this download

```
oris-dental/
├── Code/          # this Next.js project - see "Running it locally" below
├── Figma File/    # the source .fig design file
└── LICENSE.md     # your license terms
```

## Folder structure

Inside `Code/`:

```
app/
├── page.tsx                    # Composes every section, in order
├── Header.tsx                  # Fixed nav, scroll-aware hide/show
├── Hero.tsx                    # 3D interactive tooth visualizer & intro copy
├── AboutOris.tsx                # Practice overview + animated slot counters
├── DentalTreatments.tsx         # Scroll-pinned stacked card deck of treatments
├── CareComfort.tsx              # Care & comfort feature section
├── ParallaxSectionBreak.tsx     # Full-bleed parallax statement break
├── Reviews.tsx                  # Ribbon review strips + section break
├── BookingFlow.tsx              # "Book your visit in four easy steps" guide
├── Team.tsx                     # Meet the team; each card pre-fills the form with that doctor
├── FAQ.tsx                      # Accordion of common patient questions
├── BookAppointment.tsx          # Appointment booking card + contact form (date & time-slot pickers)
├── booking.ts                   # Event a team card fires to pre-fill the form
├── Footer.tsx                   # Interactive dot canvas footer with brand wordmark
├── Loader.tsx                   # Watermark fill progress loading screen
├── OrisWrapper.tsx              # Lenis smooth scroll root wrapper
├── LenisSmoothScroll.tsx        # Lenis provider
├── ScrollTopOnLoad.tsx          # Resets scroll position on route load
├── oris-dental.css              # Custom font faces and scoped typographic tokens
├── assets/                      # Images, self-hosted fonts, review cards
│   ├── OrisDental.svg           # Brand logo watermark
│   ├── fonts/                   # Self-hosted AeonikPro font files (woff2)
│   └── reviews/                 # Review ribbon cards
├── teeth-3d/                    # 3D tooth visualizer (Three.js + drei)
│   ├── TeethCanvas.tsx
│   ├── ToothShield.tsx
│   ├── DotsCanvas.tsx
│   └── MouseTilt.tsx
└── effects/                     # Extracted self-contained effects
    ├── dot-fill-btn/
    ├── circular-button/
    ├── slot-counter/
    ├── text-fill/
    ├── split-text-lines/
    ├── patient-card/
    ├── contact-form/
    └── smooth-carousel/
```

The 3D tooth model itself ships as a static asset at `Code/public/teeth-compressed.glb`
(referenced by URL from `teeth-3d/TeethCanvas.tsx`, not bundled).

## Running it locally

This is a standalone Next.js project - no monorepo, no workspace setup.

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

## Customizing

- **Copy** - every section's text lives as plain data at the top of its file: `STATS` in `AboutOris.tsx`, `TREATMENTS_DATA` in `DentalTreatments.tsx`, `STEPS` in `BookingFlow.tsx`, `TEAM` in `Team.tsx`, `FAQS` in `FAQ.tsx`, `TIME_SLOTS` in `effects/contact-form/DateTimeFields.tsx`, and so on. Edit those directly.
- **3D Model** - swap the 3D model under `assets/teeth.glb` and adjust lights/materials in `effects/teeth-3d/TeethCanvas.tsx`.
- **Colors** - Primary blue (`#3365e2`) and secondary navy (`#13314a`) are configured in `oris-dental.css` and can be adjusted across the template.
- **Contact Form** - Update the `handleSubmit` handler in `effects/contact-form/ContactForm.tsx` to connect to your backend or CRM API.
