"use client";

import useIsMobile from "@/hooks/useIsMobile";
import GlowingPlates from "@/Experience/GlowingPlates";
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
import StripTransition from "./StripTransition";
import Pricing from "./Pricing";
import GradientFill from "./GradientFill";
import Footer from "./Footer";
import CTA from "./CTA";
import CTA2 from "./CTA2";
import StorytellingMobile from "./StoryTellingMoble";
import VaultGridNewMobile from "./VaultGridMobile";



export default function LandingPageNew({faqItems}) {
  const { isMounted, isMobile } = useIsMobile();

  return (
    <>
  
      <VaultShell>
        <Loader />
        <Hero />
        <GlowingPlates />
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
        <StripTransition />
        <Pricing padding={isMobile?"pt-[130vw]! max-sm:mt-[-20vw]":""} />
        <FAQs faqItems={faqItems} isHomePage />
        <CTA />
        <CTA2  href="#pricing-cards" isHomePage/>
        <Footer />
      </VaultShell>
    </>
  );
}
