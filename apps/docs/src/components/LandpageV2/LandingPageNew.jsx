"use client";

import dynamic from "next/dynamic";
import useIsMobile from "@/hooks/useIsMobile";
import DeferredMount from "@/components/WebsiteComps/DeferredMount";
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
// Keep the three.js/@react-three bundle out of the initial page chunk — it only
// downloads/parses when DeferredMount actually mounts the scene. The dark
// placeholder matches --background (#0e0e0e) so there's never a white flash;
// the effect fades in on top exactly as before.
const GlowingPlates = dynamic(() => import("@/Experience/GlowingPlates"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-10 h-[140vh] max-md:hidden w-full bg-background" />
  ),
});



export default function LandingPageNew({ faqItems }) {
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
        {/* <StripTransition /> */}
        <Pricing padding={isMobile ? "pt-[130vw]! max-sm:mt-[-20vw]" : ""} />
        <FAQs faqItems={faqItems} isHomePage fixWidth={true} />
        <CTA />
        {/* <CTA2 href="#pricing-cards" isHomePage /> */}
        <Footer />
      </VaultShell>
    </>
  );
}
