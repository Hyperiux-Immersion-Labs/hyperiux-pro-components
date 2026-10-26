"use client";

// A client component on purpose (every section is one anyway). Next merges client manifests
// by route with the (groups) stripped, so this page and the workspace layout share one; as a
// server component, the homepage's records for shared components (Lenis, Navbar, Footer...)
// overwrote the workspace's, and /effects, /docs and the effect pages loaded the homepage's
// own chunk. As a client component, only this file is recorded.
import WhyVault from "@/homepage/sections/WhyVault";
import dynamic from "next/dynamic";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import Hero from "@/homepage/sections/Hero";
import Navbar from "@/homepage/components/Navbar";
import Loader from "@/homepage/components/Loader";
import ScrollTopOnLoad from "@/homepage/components/ScrollTopOnLoad";
import SectionOverlay from "@/components/Animations/SectionOverlay";
import NotAnotherUIKit from "./sections/NotAnotherUIKit";

// Below-the-fold sections load as separate chunks (still server-rendered)
const ExplainVault = dynamic(() => import("@/homepage/sections/ExplainVault"));
const ProblemFixes = dynamic(() => import("@/homepage/sections/Problem&Fixes"));
const SignalSection = dynamic(() => import("@/homepage/sections/SignalSection"));
const ExploreTheEffects = dynamic(() => import("@/homepage/sections/ExploreTheEffects"));
const PricingPlansHome = dynamic(() => import("@/homepage/sections/PricingPlansHome"));
const FAQ = dynamic(() => import("@/homepage/sections/FAQ"));
const Footer = dynamic(() => import("@/homepage/sections/Footer"));

export default function Homepage({ faqItems }) {
  return (
    <div className="home-type">
      <Loader />
      <Navbar introOnLoader />
      <LenisSmoothScroll lerp={0.065} wheelMultiplier={0.85} syncTouchLerp={0.12} touchMultiplier={1.6} />
      <ScrollTopOnLoad />
      {/* Sections (not the header) cap Button's vw sizing at the 1536px container */}
      <div className="relative [--hx-vw:var(--cvw)]">
        <Hero />
        <div className="relative z-10">
          <WhyVault />
          <ExplainVault />
          <ProblemFixes />
          {/* <SignalSection /> */}
            <NotAnotherUIKit />
          <ExploreTheEffects />
          {/* Pricing + FAQ are one white sheet: it scales in at pricing and leaves after the FAQ */}
          {/* Above the footer (z-200), whose ribbons reach up behind the FAQ */}
          <SectionOverlay className="relative z-201 bg-light">
            <PricingPlansHome />
            <FAQ faqItems={faqItems} />
          </SectionOverlay>
          <Footer />
        </div>
      </div>
    </div>
  );
}
