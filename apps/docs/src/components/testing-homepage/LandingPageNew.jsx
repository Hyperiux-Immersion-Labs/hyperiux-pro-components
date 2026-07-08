"use client";

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
import Pricing from "./Pricing";
import GradientFill from "./GradientFill";
import Footer from "./Footer";
import CTA from "./CTA";
import StorytellingMobile from "./StoryTellingMoble";
import VaultGridNewMobile from "./VaultGridMobile";

export default function LandingPageNew({ faqItems }) {
  const { isMounted, isMobile } = useIsMobile();

  return (
    <>

      <VaultShell>
        <Loader />
        <Hero />
        {/* <GlowingPlatesDeferred /> */}
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
        <Footer />
      </VaultShell>
    </>
  );
}
