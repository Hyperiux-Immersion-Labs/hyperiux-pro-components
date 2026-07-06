"use client";

import dynamic from "next/dynamic";
import useIsMobile from "@/hooks/useIsMobile";
import DeferredMount from "@/components/WebsiteComps/DeferredMount";
import VaultShell from "@/Layouts/VaultShell";

// Three.js scene — loaded as its own chunk after the page is idle so the
// WebGL bundle never blocks first paint / TBT.
const GlowingPlates = dynamic(() => import("@/Experience/GlowingPlates"), {
  ssr: false,
});
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
        <DeferredMount strategy="idle">
          <GlowingPlates />
        </DeferredMount>
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
        <FAQs faqItems={faqItems} isHomePage fixWidth={true} />
        <CTA />
        <CTA2  href="#pricing-cards" isHomePage/>
        <Footer />
      </VaultShell>
    </>
  );
}
