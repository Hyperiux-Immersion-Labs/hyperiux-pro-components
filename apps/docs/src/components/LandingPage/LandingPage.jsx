"use client";

import dynamic from "next/dynamic";

import AgencyProof from "@/components/LandingPage/AgencyProof";
import AgencyProofMobile from "@/components/LandingPage/AgencyProofMobile";
import Footer from "@/components/LandingPage/Footer";
import FreeVault from "@/components/LandingPage/FreeVault";
import Hero from "@/components/LandingPage/Hero";
import GlowingPlates from "@/Experience/GlowingPlates";
import VaultShell from "@/Layouts/VaultShell";
import CTA from "@/components/LandingPage/CTA";
import useIsMobile from "@/hooks/useIsMobile";
import Loader from "@/components/WebsiteComps/Loader";
import FeaturedEffects from "@/components/LandingPage/FeaturedEffects";
import Pricing from "./Pricing";

// Dynamically imported components
const StorytellingMobile = dynamic(() => import("@/components/LandingPage/StorytellingMobile"), { ssr: false });
const VaultGridMobile = dynamic(() => import("@/components/LandingPage/VaultGridMobile"), { ssr: false });
const Workflow = dynamic(() => import("@/components/LandingPage/Workflow"), { ssr: false });
const FeaturedStoryTelling = dynamic(() => import("@/components/LandingPage/FeaturedStoryTelling"), { ssr: false });

export default function LandingPage() {
  const { isMobile } = useIsMobile();

  return (
    <>
      <VaultShell>
        <Loader />
        <Hero />
        <GlowingPlates />
        {isMobile ? (
          // Mobile-only render
          <>
            <StorytellingMobile />
            <VaultGridMobile />
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
            <FeaturedEffects />
            <Workflow />
            <Pricing/>
            <AgencyProof />
            <div className="mt-[-50vh] max-md:mt-0">
            <CTA />

            </div>
            <Footer />
          </>
        )}
      </VaultShell>
    </>
  );
}
