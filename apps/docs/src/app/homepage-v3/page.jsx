import SmallMotion from "@/components/Homepage/SmallMotion";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import CTAV3 from "@/homepage-v3/sections/CTAV3";
import CurvedGradient from "@/homepage-v3/sections/CurvedGradient";
import ExplainVault from "@/homepage-v3/sections/ExplainVault";
import ExploreTheEffects from "@/homepage-v3/sections/ExploreTheEffects";
import FAQV3 from "@/homepage-v3/sections/FAQV3";
import FooterV3 from "@/homepage-v3/sections/FooterV3";
import Hero from "@/homepage-v3/sections/Hero";
import NotAnotherUIKit from "@/homepage-v3/sections/NotAnotherUIKit";
import Preview from "@/homepage-v3/sections/Preview";
import PreviewVideo from "@/homepage-v3/sections/PreviewVideo";
import ProblemFixes from "@/homepage-v3/sections/Problem&Fixes";
import Quote from "@/homepage-v3/sections/Quote";
import Techstack from "@/homepage-v3/sections/Techstack";
import UseCases from "@/homepage-v3/sections/UseCases";
import React from "react";
import PricingV3 from "@/homepage-v3/sections/PricingV3";
import NavbarV3 from "@/homepage-v3/components/NavbarV3";
import LoaderV3 from "@/homepage-v3/components/LoaderV3";
import DitherTransition from "@/homepage-v3/components/DitherTransition";
import ScrollTopOnLoad from "@/homepage-v3/components/ScrollTopOnLoad";
import { getSearchIndexEffects } from "@/lib/search-index";
import { FAQJSONLD } from "@/lib/json-ld";
import MorphingDiether from "./MorphingDiether";

const faqItems = [
  {
    id: "faq-1",
    question: "What is Hyperiux Vault?",
    answer: (
      <>
        Vault is a source-first interaction effects library for React and Next.js. It covers scroll effects, text animations, cursor systems, page transitions, WebGL scenes, backgrounds, navigation patterns, creative components, and microinteractions. Effects install as editable code inside your project.
      </>
    ),
    defaultOpen: true,
  },
  {
    id: "faq-2",
    question: "How does Vault fit with a UI component library?",
    answer: (
      <>
        Keep the UI library. Your design system handles interface primitives such as buttons, forms, cards, grids, and tabs. Vault handles how parts of the interface enter, respond, transition, and move through time.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-3",
    question: "Why use Vault if I already know GSAP, Motion, or Three.js?",
    answer: (
      <>
        Those tools give you animation and rendering primitives. Vault gives you composed interaction patterns with a working structure, production decisions, and implementation guidance already in place. You still have the source, so the underlying tools remain fully available.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-4",
    question: "Do I own the code?",
    answer: (
      <>
        The effect source is installed inside your project and can be inspected and modified locally. Usage rights follow the Free Core or Pro license attached to the effect.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-5",
    question: "Will Vault effects hurt performance?",
    answer: (
      <>
        Any interaction can hurt performance when used badly. A text reveal and a continuous WebGL scene have very different costs. Vault exposes dependencies and implementation notes so your team can make that decision with the page, device, and performance budget in mind. Test production pages on real devices before shipping.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-6",
    question: "Does Vault support reduced motion?",
    answer: (
      <>
        Effects with significant motion should include a reduced-motion strategy or implementation guidance. The final behaviour remains under your control because the source lives in your project.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-7",
    question: "Can I customize the effects?",
    answer: (
      <>
        Yes. Copy, styling, timing, easing, breakpoints, triggers, layout, mobile behaviour, and implementation code can all be changed inside your project.
      </>
    ),
    defaultOpen: false,
  },
  {
    id: "faq-8",
    question: "What do I keep if I cancel Pro?",
    answer: (
      <>
        Code already installed in your project stays there. Access to new Pro downloads, updates, and future Pro releases follows the current subscription and license terms.
      </>
    ),
    defaultOpen: false,
  },
];

const USE_CASES = [
  {
    id: 1,
    title: "Creative Front-End Developers",
    text: "Stop rebuilding the same scroll reveal, text animation, cursor trail, and transition from scratch. Start from production-ready source and shape it to your project.",
    cta: "Browse Effects",
    link: "/effects",
  },
  {
    id: 2,
    title: "Startup Founders & Product Teams",
    text: "Make your launch page feel more premium without hiring a full motion team. Use Vault to speed up build cycles, and raise perceived product quality.",
    cta: "Start with Free Effects",
    link: "/effects/free",
  },
  {
    id: 3,
    title: "Agencies & Freelancers",
    text: "Move faster on client websites while keeping the work custom. Use Vault as a starting point for high-end interaction systems, then adapt the code for each brand.",
    cta: "See Agency Licensing",
    link: "#",
  },
  {
    id: 4,
    title: "CTOs & CPOs",
    text: "Get the creative benefit of premium motion without committing to an opaque dependency. Source-first code, clear stack choices, and a workflow your developers can own.",
    cta: "Read the Docs",
    link: "/docs",
  },
  {
    id: 5,
    title: "Marketing Teams",
    text: "Upgrade the moments that affect perception: hero sections, campaign pages, product storytelling, proof sections, and final CTAs.",
    cta: "Explore Use Cases",
    link: "#",
  },
];

export default async function page() {
  const effects = await getSearchIndexEffects();

  return (
    <>
      <FAQJSONLD faqs={faqItems} />
      <LoaderV3 />
      <NavbarV3 effects={effects} introOnLoader />
      <LenisSmoothScroll />
      <ScrollTopOnLoad />
      <div className="relative">
        <div className="sticky top-0 z-0 h-dvh overflow-hidden">
          <Hero />
        </div>
        <div className="relative z-10 bg-linear-to-b from-transparent from-0% via-background via-1%  to-background to-100%">
          <Techstack />
          <Quote />
          <CurvedGradient />
          <ProblemFixes />
          <ExplainVault />
          <ExploreTheEffects />
          <Preview />
          <PreviewVideo />
          <NotAnotherUIKit />
          <SmallMotion />
          <UseCases useCases={USE_CASES} />
          <DitherTransition
            markers={false}
            mobileStartTriggers="-10% bottom"
            mobileEndTriggers="bottom -50%"
            className="h-[60vw] max-md:m max-md:h-[150vw]! bg-background "
          />
          <PricingV3 />
          <DitherTransition
            dotColor="#050505"
            accentShift={0.8}
            start="top bottom"
            end="150% top"
            mobileStartTriggers="top bottom"
            mobileEndTriggers="bottom -50%"
            markers={false}
            accentColor="#eaeaea"
            className="h-[75vw] max-md:h-[150vw]! mt-[-10vw] bg-foreground"
          /> 
          <FAQV3 faqItems={faqItems} />
          <CTAV3 />
          <FooterV3 />
        </div>
      </div>

    </>
  );
}
