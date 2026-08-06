import SmallMotion from '@/components/Homepage/SmallMotion'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import CTAV3 from '@/homepage-v3/sections/CTAV3'
import CurvedGradient from '@/homepage-v3/sections/CurvedGradient'
import ExplainVault from '@/homepage-v3/sections/ExplainVault'
import ExploreTheEffects from '@/homepage-v3/sections/ExploreTheEffects'
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

export default function page() {
  return (
    <>
      <LenisSmoothScroll />
      <div className="relative">
        <div className="sticky top-0 z-0 h-dvh overflow-hidden">
          <Hero />
        </div>
        <div className="relative border-t bg-background border-grey z-10">
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
          <CTAV3 />
          <FooterV3 />
        </div>
      </div>
    </>
  )
}
