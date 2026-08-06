"use client";
import React, { Suspense, useEffect, useRef } from "react";
import gsap from "gsap";
import ButtonV3 from "../components/ButtonV3";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import { useWorkWithHyperiuxModal } from "@/components/WebsiteComps/modals/WorkWithHyperiuxModal";
import LineReveal from "@/components/Animations/LineReveal";

function CTAButtonV3s() {
  const { open } = useWorkWithHyperiuxModal();
  return (
    <div className="w-fit flex max-md:gap-[2vw] max-sm:gap-[7vw] items-center max-sm:flex-col max-md:items-start max-md:w-[75%] max-md:mx-auto max-sm:w-[88%] gap-[1.5vw]">
      <ButtonV3
        variant="outline2"
        className="max-md:w-full border-white/40"
        text="See Our Work"
        href="https://www.hyperiux.com/hyperiux-creds-2026.pdf"
        target_blank
      />
      <ButtonV3
        variant="orange"
        className="max-md:w-full"
        text="Work with Hyperiux"
        href="#"
        preventDefault
        onClick={open}
      />
    </div>
  );
}

export default function CTAV3() {
  const ctaRef = useRef(null);

  useEffect(() => {
    let mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 768px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions;
        if (isDesktop) {
          gsap.to(".cta-line", {
            opacity: 0,
            duration: 1.2,
            ease: "sine.inOut",
            stagger: {
              each: 0.04,
              repeat: reduceMotion ? 0 : -1,
              yoyo: !reduceMotion,
            },
          });
        }
      },
      ctaRef,
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={ctaRef}
      id="CTA"
      className="h-fit gap-[4vw] max-md:h-fit max-md:py-[10vw] max-sm:py-[15vw]! max-sm:mb-[30vw] max-md:mb-[10vw] overflow-x-hidden flex items-start justify-between max-sm:gap-[24vw] max-md:gap-[8vw] flex-col text-foreground self-padd relative z-500 w-full py-[7vw]!"
    >
      <LineReveal as="h2" className="t96 font-neue-haas relative z-2 w-[90%]">
        Need More Than a Component? We Build the Whole Interaction.
      </LineReveal>
      <div className="space-y-[3.5vw] max-md:space-y-[10vw] relative z-2">
        <SplitLine as="p" className="text24 max-md:w-full w-[40vw]">
          Vault is a public slice of how Hyperiux approaches interaction design.
          Need something custom? We'll design and build it from scratch.
        </SplitLine>
        <Suspense
          fallback={
            <div className="w-fit flex max-md:gap-[2vw] max-sm:gap-[7vw] items-center max-sm:flex-col max-md:items-start max-md:w-[75%] max-md:mx-auto max-sm:w-[88%] gap-[1.5vw]">
              <ButtonV3
                variant="outline2"
                className="max-md:w-full border-white/40"
                text="See Our Work"
                href="/hyperiux-creds-2026"
              />
              <ButtonV3
                variant="orange"
                className="max-md:w-full"
                text="Work with Hyperiux"
                href="#"
              />
            </div>
          }
        >
          <CTAButtonV3s />
        </Suspense>
      </div>

      <div className="h-[15vw] max-md:hidden z-0 w-[50vw] absolute bottom-0 right-0 pointer-events-none flex justify-between items-end">
        {Array.from({ length: 75 }).map((_, i) => (
          <div key={i} className="cta-line w-[1.5px] h-full bg-foreground" />
        ))}
      </div>
    </section>
  );
}
