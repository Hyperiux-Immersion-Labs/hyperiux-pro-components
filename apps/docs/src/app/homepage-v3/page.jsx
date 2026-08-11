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

export default function page() {
  return (
    <>
      <LoaderV3 />
      <NavbarV3 />
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
          <UseCases />
          <DitherTransition className="h-[75vw] bg-background max-md:h-[60vw] max-sm:h-[90vw]" />
          <PricingV3 />
          <FAQV3 />
          <CTAV3 />
          <FooterV3 />
        </div>
      </div>
    </>
  )
}
