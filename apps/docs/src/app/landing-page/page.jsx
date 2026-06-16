"use client";

import AgencyProof from "@/components/LandingPage/AgencyProof";
import AgencyProofMobile from "@/components/LandingPage/AgencyProofMobile";
import FeaturedEffects from "@/components/LandingPage/FeaturedEffects";
import Footer from "@/components/LandingPage/Footer";
import FreeVault from "@/components/LandingPage/FreeVault";
import Hero from "@/components/LandingPage/Hero";
import FeaturedStoryTelling from "@/components/LandingPage/FeaturedStoryTelling";
import StorytellingMobile from "@/components/LandingPage/StorytellingMobile";
import VaultGridMobile from "@/components/LandingPage/VaultGridMobile";
import Workflow from "@/components/LandingPage/Workflow";
import GlowingPlates from "@/Experience/GlowingPlates";
import VaultShell from "@/Layouts/VaultShell";
import CTA from "@/components/LandingPage/CTA";
import useIsMobile from "@/hooks/useIsMobile";
import Loader from "@/components/Reusable/Loader";

export default function Page() {
  const { isMounted, isMobile } = useIsMobile();

  return (
    <VaultShell>
      <Loader />
      <Hero />
      <GlowingPlates />

      {!isMounted ? (
        // SSR / Initial hydration fallback: render desktop to preserve HTML structure
        <>
          <FeaturedStoryTelling />
          {/* <FeaturedEffects /> */}
          <Workflow />
          <FreeVault />
          <AgencyProof />
          <CTA />
          <Footer />
        </>
      ) : isMobile ? (
        // Mobile-only render
        <>
          <StorytellingMobile />
          <VaultGridMobile />
          {/* <FeaturedEffects /> */}
          <Workflow />
          <FreeVault />
          <AgencyProofMobile />
          <CTA />
          <Footer />
        </>
      ) : (
        // Desktop-only render
        <>
          <FeaturedStoryTelling />
          {/* <FeaturedEffects /> */}
          <Workflow />
          <FreeVault />
          <AgencyProof />
          <CTA />
          <Footer />
        </>
      )}
    </VaultShell>
  );
}
