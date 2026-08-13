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
      <LoaderV3 />
      <NavbarV3 effects={effects} />
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
            className="h-[75vw] max-md:h-[150vw]! bg-foreground"
          />
          <FAQV3 />
          <CTAV3 />
          <FooterV3 />
        </div>
      </div>
    </>
  )
}
