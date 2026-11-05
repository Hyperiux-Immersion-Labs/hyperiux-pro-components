// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { OrdButton } from "./Buttons";
import { ENQUIRE, ROUTES } from "./nav";
import LineReveal from "./Animations/LineReveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Cta = () => {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-ord-cta]", {
        opacity: 0,
        y: 16,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 20%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      data-ord-orb="cta"
      className="relative flex h-[120vh] flex-col items-center justify-center gap-12 ord-container text-center max-md:gap-8"
    >
      <LineReveal className="w-[64%] max-lg:w-full">
        <h2 className="text-128">
          Hand it the job. <span className="text-ord-primary-light">Keep the rules.</span>
        </h2>
      </LineReveal>
      <LineReveal className="w-[30%] max-lg:w-[64%] max-md:w-full" delay={0.15}>
        <p className="text-28 text-ord-ash">
        Free for the first 10,000 runs. Bring your own model, keep your own data, ship your first agent this
        afternoon.
        </p>
      </LineReveal>
      <div data-ord-cta className="flex flex-wrap justify-center gap-3">
        <OrdButton href={ROUTES.pricing}>Start building</OrdButton>
        <OrdButton href={ENQUIRE.demo} variant="line">
          Talk to an engineer
        </OrdButton>
      </div>
    </section>
  );
};

export default Cta;
