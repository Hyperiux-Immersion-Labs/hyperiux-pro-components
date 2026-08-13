import SmallMotion from '@/components/Homepage/SmallMotion'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import CTAV3 from '@/homepage-v3/sections/CTAV3'
import CurvedGradient from '@/homepage-v3/sections/CurvedGradient'
import ExplainVault from '@/homepage-v3/sections/ExplainVault'
import ExploreTheEffects from '@/homepage-v3/sections/ExploreTheEffects'
import FAQV3 from '@/homepage-v3/sections/FAQV3'
import FooterV3 from '@/homepage-v3/sections/FooterV3'
import Hero from '@/homepage-v3/sections/Hero'
import NotAnotherUIKit from '@/homepage-v3/sections/NotAnotherUIKit'
import Preview from '@/homepage-v3/sections/Preview'
import PreviewVideo from '@/homepage-v3/sections/PreviewVideo'
import ProblemFixes from '@/homepage-v3/sections/Problem&Fixes'
import Quote from '@/homepage-v3/sections/Quote'
import Techstack from '@/homepage-v3/sections/Techstack'
import UseCases from '@/homepage-v3/sections/UseCases'
import React from 'react'
import PricingV3 from '@/homepage-v3/sections/PricingV3'
import NavbarV3 from '@/homepage-v3/components/NavbarV3'
import LoaderV3 from '@/homepage-v3/components/LoaderV3'
import DitherTransition from '@/homepage-v3/components/DitherTransition'
import { getSearchIndexEffects } from '@/lib/search-index'
import { FAQJSONLD } from '@/lib/json-ld'

const faqItems = [
  {
    id: "faq-1",
    question: "How much does Pro cost?",
    answer: (
      <>
        Pro is $20/month when billed monthly or $179/year when billed annually.
        Annual billing is equivalent to $14.92/month and saves $61 compared with
        monthly billing.
      </>
    ),
    defaultOpen: true,
  },
  {
    id: "faq-2",
    question: "Can I use Vault commercially?",
    answer: (
      <>
        Free and Pro usage terms are separated clearly in the license. Free
        effects are commercial-friendly where marked. Pro is designed for
        production use by developers, teams, founders, and agencies.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-3",
    question: "Do I own the code?",
    answer: (
      <>
        Yes. Vault is source-first. Effects are added into your project so you
        can inspect, customize, and maintain them locally.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-4",
    question: "Does Vault work with Next.js?",
    answer: (
      <>
        Yes. Vault is built for modern React and Next.js projects. Some
        browser-heavy effects require client-side boundaries, and the docs
        explain how to handle them.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-5",
    question: "Will these effects hurt performance?",
    answer: (
      <>
        Motion should earn its place. Vault effects are designed with modern
        performance practices in mind, but final performance depends on usage,
        page context, assets, and implementation choices. Use the docs, reduce
        unnecessary effects, and always test on real devices.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-6",
    question: "Do you support reduced motion?",
    answer: (
      <>
        Effects should respect motion-sensitive users. Use reduced-motion
        fallbacks where appropriate and avoid making critical content dependent
        on animation.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-7",
    question: "Why not build these effects myself?",
    answer: (
      <>
        You can. Vault is for teams that want to skip the blank file, start from
        a high-quality pattern, and spend their time customizing instead of
        rebuilding the same interaction from scratch.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-8",
    question: "Why not use another animated component library?",
    answer: (
      <>
        Use the tool that matches the job. Vault is built specifically around
        premium motion identity: scroll systems, cursor reactions, WebGL
        atmosphere, transitions, source-first workflow, and agency-grade
        creative frontend thinking.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-9",
    question: "Can Hyperiux build a custom effect for us?",
    answer: (
      <>
        Yes. If your brand needs a custom interaction, immersive visual system,
        or motion direction beyond the library, you can brief Hyperiux for a
        bespoke build.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-10",
    question: "What happens after I subscribe?",
    answer: (
      <>
        All 115 effects unlock instantly. Run npx hyperiux login and start
        installing. New drops are included. Cancel anytime. Your installed code
        stays in your repo.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-11",
    question: "Does it work with the Next.js App Router and server components?",
    answer: (
      <>
        Yes. Each effect flags client-component requirements, hydration notes,
        and any browser-API usage so there are no surprises.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-12",
    question: "Copy-paste means no updates. How do I get fixes?",
    answer: (
      <>
        Install with the CLI and pull updates as new versions ship. The
        changelog tracks every drop and fix.
      </>
    ),
    defaultOpen: false,
  },
];

const USE_CASES = [
  {
    id: 1,
    title: "Creative Front-End Developers",
    text: "Stop rebuilding the same scroll reveal, text animation, cursor trail, and transition from scratch. Start from production-ready source and shape it to your project.",
    cta: "Browse Effects",
    link: "/effects",
  },
  {
    id: 2,
    title: "Startup Founders & Product Teams",
    text: "Make your launch page feel more premium without hiring a full motion team. Use Vault to speed up build cycles, and raise perceived product quality.",
    cta: "Start with Free Effects",
    link: "/effects/free",
  },
  {
    id: 3,
    title: "Agencies & Freelancers",
    text: "Move faster on client websites while keeping the work custom. Use Vault as a starting point for high-end interaction systems, then adapt the code for each brand.",
    cta: "See Agency Licensing",
    link: "#",
  },
  {
    id: 4,
    title: "CTOs & CPOs",
    text: "Get the creative benefit of premium motion without committing to an opaque dependency. Source-first code, clear stack choices, and a workflow your developers can own.",
    cta: "Read the Docs",
    link: "/docs",
  },
  {
    id: 5,
    title: "Marketing Teams",
    text: "Upgrade the moments that affect perception: hero sections, campaign pages, product storytelling, proof sections, and final CTAs.",
    cta: "Explore Use Cases",
    link: "#",
  },
];

export default async function page() {
  const effects = await getSearchIndexEffects()

  return (
    <>
      <FAQJSONLD faqs={faqItems} />
      <LoaderV3 />
      <NavbarV3 effects={effects} introOnLoader />
      <LenisSmoothScroll />
      <div className="relative">
        <div className="sticky top-0 z-0 h-dvh overflow-hidden">
          <Hero />
        </div>
        <div className="relative z-10 bg-linear-to-b from-transparent from-0% via-background via-1%  to-background to-100%">
          <Techstack />
          <Quote />
          <CurvedGradient />
          <ProblemFixes />
          <ExplainVault />
          <ExploreTheEffects />
          <Preview />
          <PreviewVideo />
          <NotAnotherUIKit />
          <SmallMotion />
          <UseCases useCases={USE_CASES} />
          <DitherTransition className="h-[75vw] max-md:h-[150vw]! bg-background " />
          <PricingV3 />
          <DitherTransition
            dotColor="#050505"
            accentColor="#eaeaea"
            className="h-[75vw] max-md:h-[150vw]! mt-[-10vw] bg-foreground"
          />
          <FAQV3 faqItems={faqItems} />
          <CTAV3 />
          <FooterV3 />
        </div>
      </div>
    </>
  )
}
