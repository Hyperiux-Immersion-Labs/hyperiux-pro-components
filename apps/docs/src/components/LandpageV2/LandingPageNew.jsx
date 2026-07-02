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
import Footer from "../LandingPage/Footer";
import CTA from "./CTA";
import CTA2 from "./CTA2";
import StorytellingMobile from "./StoryTellingMoble";
import { Vault } from "lucide-react";
import VaultGridNewMobile from "./VaultGridMobile";
import { FAQJSONLD, WebpageJsonLd } from "@/lib/json-ld";

const faqItems = [
  {
    id: "faq-1",
    question: "How much does Pro cost?",
    answer: (
      <>
        Pro is $20/month when billed monthly or $179/year when billed annually. Annual billing is equivalent to $14.92/month and saves $61 compared with monthly billing.
      </>
    ),
    defaultOpen: true,
  },
  {
    id: "faq-2",
    question: "Can I use Vault commercially?",
    answer: (
      <>
        Free and Pro usage terms are separated clearly in the license. Free effects are commercial-friendly where marked. Pro is designed for production use by developers, teams, founders, and agencies.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-3",
    question: "Do I own the code?",
    answer: (
      <>
        Yes. Vault is source-first. Effects are added into your project so you can inspect, customize, and maintain them locally.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-4",
    question: "Does Vault work with Next.js?",
    answer: (
      <>
        Yes. Vault is built for modern React and Next.js projects. Some browser-heavy effects require client-side boundaries, and the docs explain how to handle them.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-5",
    question: "Will these effects hurt performance?",
    answer: (
      <>
        Motion should earn its place. Vault effects are designed with modern performance practices in mind, but final performance depends on usage, page context, assets, and implementation choices. Use the docs, reduce unnecessary effects, and always test on real devices.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-6",
    question: "Do you support reduced motion?",
    answer: (
      <>
        Effects should respect motion-sensitive users. Use reduced-motion fallbacks where appropriate and avoid making critical content dependent on animation.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-7",
    question: "Why not build these effects myself?",
    answer: (
      <>
        You can. Vault is for teams that want to skip the blank file, start from a high-quality pattern, and spend their time customizing instead of rebuilding the same interaction from scratch.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-8",
    question: "Why not use another animated component library?",
    answer: (
      <>
        Use the tool that matches the job. Vault is built specifically around premium motion identity: scroll systems, cursor reactions, WebGL atmosphere, transitions, source-first workflow, and agency-grade creative frontend thinking.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-9",
    question: "Can Hyperiux build a custom effect for us?",
    answer: (
      <>
        Yes. If your brand needs a custom interaction, immersive visual system, or motion direction beyond the library, you can brief Hyperiux for a bespoke build. <a href="#" className="underline">Request a custom animation →</a>
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-10",
    question: "What happens after I subscribe?",
    answer: (
      <>
        All 100+ effects unlock instantly. Run npx hyperiux login and start installing. New drops are included. Cancel anytime. Your installed code stays in your repo.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-11",
    question: "Does it work with the Next.js App Router and server components?",
    answer: (
      <>
        Yes. Each effect flags client-component requirements, hydration notes, and any browser-API usage so there are no surprises.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-12",
    question: "Copy-paste means no updates. How do I get fixes?",
    answer: (
      <>
        Install with the CLI and pull updates as new versions ship. The changelog tracks every drop and fix.
      </>
    ),
    defaultOpen: false,
  }
];

export const metadata = {
  title: "Hyperiux Vault - Beautiful Effects for Your Website",
  description: "A collection of animated effects and UI components. Copy-paste or use our CLI to add stunning animations to your Next.js project.",
};

export default function LandingPageNew() {

  // Mobile/tablet (<1025px) gets the mobile storytelling + vault grid;
  // desktop gets the FeaturedStoryTelling orbit. Gate on isMounted so the
  // heavy GSAP component for the wrong viewport never mounts (and no flash).
  const { isMounted, isMobile } = useIsMobile();

  return (
    <>
    <WebpageJsonLd metadata={metadata}/>
    <FAQJSONLD faqs={faqItems}/>
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
        <Pricing padding={isMobile?"pt-[140vw]!":""} />
        <FAQs faqItems={faqItems} isHomePage />
        <CTA />
        <CTA2  href="#pricing-cards"/>
        <Footer />
      </VaultShell>
    </>
  );
}
