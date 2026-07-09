"use client";

import dynamic from "next/dynamic";
import useIsMobile from "@/hooks/useIsMobile";
import GlowingPlatesDeferred from "@/Experience/GlowingPlatesDeferred";
import VaultShell from "@/Layouts/VaultShell";
import Loader from "@/components/WebsiteComps/Loader";
import TrustStrip from "./TrustStrip";
import Problem from "./Problem";
import Tension from "./Tension";
import Solution from "./Solution";
import FeaturedStoryTelling from "./FeaturedStoryTelling";
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
import StorytellingMobile from "./StoryTellingMoble";
import VaultGridNewMobile from "./VaultGridMobile";

const Footer = dynamic(() => import("./Footer"), {
  loading: () => null,
});

export default function LandingPageNew({ faqItems }) {
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
