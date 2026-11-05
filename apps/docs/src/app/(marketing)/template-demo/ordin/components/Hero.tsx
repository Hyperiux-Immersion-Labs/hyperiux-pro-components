// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { OrdButton } from "./Buttons";
import { ROUTES } from "./nav";
import { onIntroDone } from "./Animations/intro";

gsap.registerPlugin(useGSAP, SplitText);

export const PROMPT = "Reconcile Q3 invoices, flag anything over budget and draft the vendor emails.";

const Hero = () => {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const split = SplitText.create("[data-ord-hero-title]", { type: "lines", mask: "lines", linesClass: "ord-line" });
      const copy = SplitText.create("[data-ord-hero-copy]", { type: "lines", mask: "lines", linesClass: "ord-line" });
      const tl = gsap.timeline({ paused: true });
      tl.from(split.lines, { yPercent: 105, duration: 1.4, stagger: 0.1, ease: "expo.out" }, 0)
        .from(copy.lines, { yPercent: 105, duration: 1.4, stagger: 0.1, ease: "expo.out" }, 0.35)
        .from("[data-ord-hero-fade]", { opacity: 0, y: 16, duration: 1.1, stagger: 0.08, ease: "power3.out" }, 0.6);

      gsap.to("[data-ord-hero-title]", {
        yPercent: -18,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      const stop = onIntroDone(() => tl.play());

      return () => {
        stop();
        split.revert();
        copy.revert();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      data-ord-orb="hero"
      className="relative flex h-screen items-center ord-container max-lg:items-end max-lg:pb-[14vh] max-md:pb-[12vh]"
    >
      <div className="relative flex w-[58%] flex-col gap-10 max-lg:w-[80%] max-md:w-full max-md:gap-6">
        <h1 data-ord-hero-title data-ord-hide className="ord-hero-title">
          Agents that
          <br />
          <span className="text-ord-primary-light">finish the job.</span>
        </h1>
        <div data-ord-hide className="flex w-[70%] flex-col gap-8 max-md:w-full max-md:gap-6">
          <p data-ord-hero-copy className="text-28 text-ord-ash">
            Ordin plans, routes, governs and ships agent work. One prompt in, a finished job out, every step on the
            record.
          </p>
          <div data-ord-hero-fade className="flex flex-wrap gap-3">
            <OrdButton href={ROUTES.pricing}>Start building</OrdButton>
            <OrdButton href={ROUTES.platform} variant="line">
              See the platform
            </OrdButton>
          </div>
        </div>
      </div>
      <div data-ord-hide aria-hidden className="absolute inset-x-0 bottom-[5vh] ord-container max-md:bottom-[4vh]">
        <span data-ord-hero-rule className="block h-px w-full origin-left bg-(--ord-primary)/40" />
      </div>
    </section>
  );
};

export default Hero;
