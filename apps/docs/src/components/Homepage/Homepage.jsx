"use client";

import dynamic from "next/dynamic";
import useIsMobile from "@/hooks/useIsMobile";
import VaultShell from "@/Layouts/VaultShell";
import TrustStrip from "./TrustStrip";
import Problem from "./Problem";
import Tension from "./Tension";
import Solution from "./Solution";
import Hero from "./Hero";
import Workflow from "./WorkFlow";
import FAQs from "./FAQs";
import UIKit from "./UIKit";
import SmallMotion from "./SmallMotion";
import ForDevelopers from "./ForDevelopers";
// import StripTransition from "./StripTransition";
import Pricing from "./Pricing";
import GradientFill from "./GradientFill";
import CTA from "./CTA";
// import CTA2 from "./CTA2";

// Heaviest and conditional components
const GlowingPlatesDeferred = dynamic(() => import("./GlowingPlatesDeferred"), { ssr: false });
const FeaturedStoryTelling = dynamic(() => import("./FeaturedStoryTelling"), {
  // Keep layout height while the chunk loads — otherwise every ScrollTrigger
  // below this section (Workflow, ForDevelopers, …) is created at the wrong
  // offset and seeks to the end of its timeline until a late refresh.
  loading: () => (
    <div className="relative w-full h-[600vh] max-md:hidden" aria-hidden />
  ),
});
const StorytellingMobile = dynamic(() => import("./StoryTellingMoble"), {
  loading: () => (
    <div
      className="relative hidden max-md:block w-full h-[250vh] mt-[10vw] mb-[20vw]"
      aria-hidden
    />
  ),
});
const VaultGridNewMobile = dynamic(() => import("./VaultGridMobile"));
import Loader from "./Loader2";

const Footer = dynamic(() => import("./Footer"), {
  loading: () => null,
});

function StorytellingSpacer() {
  return (
    <>
      <div className="relative w-full h-[600vh] max-md:hidden" aria-hidden />
      <div
        className="relative hidden max-md:block w-full h-[250vh] mt-[10vw] mb-[20vw]"
        aria-hidden
      />
    </>
  );
}

export default function Homepage({ faqItems }) {
  const { isMounted, isMobile } = useIsMobile();

  return (
    <>
      <VaultShell>
        <Loader />
        <main id="main-content">
          <Hero />
          <GlowingPlatesDeferred />
          <TrustStrip />
          <Problem />
          <GradientFill />
          <Tension />
          <Solution />
          {!isMounted ? (
            <StorytellingSpacer />
          ) : isMobile ? (
            <>
              <StorytellingMobile />
              <VaultGridNewMobile />
            </>
          ) : (
            <FeaturedStoryTelling />
          )}
          <Workflow />
          <UIKit />
          <SmallMotion />
          <ForDevelopers />
          <Pricing padding={isMobile ? "pt-[130vw]! max-sm:mt-[-20vw]" : ""} />
          <FAQs faqItems={faqItems} isHomePage fixWidth={true} />
          <CTA />
        </main>
        <Footer />
      </VaultShell>
    </>
  );
}
