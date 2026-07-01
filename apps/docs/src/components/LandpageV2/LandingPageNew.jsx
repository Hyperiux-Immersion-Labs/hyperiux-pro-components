

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

const faqItems = [
  {
    id: "faq-1",
    title: "Hyperiux Vault a UI kit?",
    content: (
      <>
        No. Vault is the interaction layer around your UI kit. Use it beside your design system, shadcn, Tailwind, Radix,
        or custom components.
      </>
    ),
    defaultOpen: true,
  },
  {
    id: "faq-2",
    title: "What do I get for free?",
    content: (
      <div className="space-y-3">
        <p>Yes. This content area accepts full React nodes, not just text.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Paragraphs</li>
          <li>Lists</li>
          <li>Buttons</li>
          <li>Inline links</li>
        </ul>
      </div>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-3",
    title: "What does Pro unlock?",
    content: (
      <>
        Yes. The open and close state is visually driven by ChevronBird, so your
        motion language stays consistent across the whole system.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-4",
    title: "Hyperiux Vault a UI kit?",
    content: (
      <>
        No. Vault is the interaction layer around your UI kit. Use it beside your design system, shadcn, Tailwind, Radix,
        or custom components.
      </>
    ),
    defaultOpen: true,
  },
  {
    id: "faq-5",
    title: "What do I get for free?",
    content: (
      <div className="space-y-3">
        <p>Yes. This content area accepts full React nodes, not just text.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Paragraphs</li>
          <li>Lists</li>
          <li>Buttons</li>
          <li>Inline links</li>
        </ul>
      </div>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-6",
    title: "What does Pro unlock?",
    content: (
      <>
        Yes. The open and close state is visually driven by ChevronBird, so your
        motion language stays consistent across the whole system.
      </>
    ),
    defaultOpen: false,
  },
];

export default function LandingPageNew() {

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
        <FeaturedStoryTelling />
        <Workflow />
        <UIKit />
        <SmallMotion />
        <ForDevelopers />
        <StripTransition />
        {/* <Pricing /> */}
        <FAQs faqItems={faqItems} />
        {/* <CTA /> */}
        {/* <Footer /> */}


      </VaultShell>
    </>
  );
}
