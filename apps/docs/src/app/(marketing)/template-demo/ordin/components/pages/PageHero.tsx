// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { onIntroDone } from "../Animations/intro";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { OrdButton } from "../Buttons";
import MintArc, { type MintArcShape } from "../MintArc";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type Link = { label: string; href: string };

type PageHeroProps = {
  orb: string;
  chapter: string;
  title: ReactNode;
  copy: string;
  primary: Link;
  secondary?: Link;
  // Anything animated on the right; without it the copy runs wider and the hero is shorter
  visual?: ReactNode;
  // Each page reshapes the same mint Arc Light so no two heroes share a form
  arc?: MintArcShape;
};

const PageHero = ({ orb, chapter, title, copy, primary, secondary, visual, arc }: PageHeroProps) => {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const heading = SplitText.create("[data-ph-title]", { type: "lines", mask: "lines", linesClass: "ord-line" });
      const body = SplitText.create("[data-ph-copy]", { type: "lines", mask: "lines", linesClass: "ord-line" });
      const tl = gsap.timeline({ paused: true });
      tl.from(heading.lines, { yPercent: 105, duration: 1.4, stagger: 0.1, ease: "expo.out" }, 0)
        .from(body.lines, { yPercent: 105, duration: 1.4, stagger: 0.1, ease: "expo.out" }, 0.3)
        .from("[data-ph-fade]", { opacity: 0, y: 16, duration: 1.1, ease: "power3.out" }, 0.55)
        .from("[data-ph-visual]", { opacity: 0, y: 30, duration: 1.6, ease: "expo.out" }, 0.3)
        .from("[data-ph-backdrop]", { opacity: 0, duration: 2.4, ease: "expo.out" }, 0);
      const stop = onIntroDone(() => tl.play());

      gsap.to("[data-ph-content]", {
        yPercent: -14,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      return () => {
        stop();
        heading.revert();
        body.revert();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      data-ord-orb={orb}
      data-ord-chapter={chapter}
      className={`relative flex items-center justify-between gap-6 overflow-hidden ord-container max-lg:flex-col max-lg:justify-center max-lg:gap-8 ${
        visual ? "h-screen max-lg:h-auto max-lg:pt-[16vh] max-lg:pb-[8vh]" : "min-h-[78vh] pt-[18vh] pb-[8vh] items-end"
      }`}
    >
      <div
        data-ph-backdrop
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-90 [mask-image:linear-gradient(to_bottom,#000_55%,transparent_96%)] max-md:opacity-50"
      >
        <MintArc {...arc} />
      </div>
      <div
        data-ph-content
        data-ord-hide
        className={`relative z-1 flex flex-col gap-10 max-lg:w-[80%] max-md:w-full max-md:gap-6 ${visual ? "w-[60%]" : "w-[70%]"}`}
      >
        <h1 data-ph-title className="ord-hero-title">
          {title}
        </h1>
        <div className={`flex flex-col gap-8 max-md:w-full max-md:gap-6 ${visual ? "w-[80%]" : "w-[52%]"}`}>
          <p data-ph-copy className="text-28 text-ord-ash">
            {copy}
          </p>
          <div data-ph-fade className="flex flex-wrap gap-3">
            <OrdButton href={primary.href}>{primary.label}</OrdButton>
            {secondary && (
              <OrdButton href={secondary.href} variant="line">
                {secondary.label}
              </OrdButton>
            )}
          </div>
        </div>
      </div>
      {visual && (
        <div data-ph-visual data-ord-hide className="relative z-1 w-[40%] max-lg:w-full">
          {visual}
        </div>
      )}
    </section>
  );
};

export default PageHero;
