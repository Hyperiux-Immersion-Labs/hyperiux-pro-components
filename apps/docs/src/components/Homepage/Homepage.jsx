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
  loading: () => null,
});
const StorytellingMobile = dynamic(() => import("./StoryTellingMoble"));
const VaultGridNewMobile = dynamic(() => import("./VaultGridMobile"));
import Loader from "./Loader";

const Footer = dynamic(() => import("./Footer"), {
  loading: () => null,
});

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
          {isMounted &&
            (isMobile ? (
              <>
                <StorytellingMobile />
                <VaultGridNewMobile />
              </>
            ) : (
              <FeaturedStoryTelling />
            ))}
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
