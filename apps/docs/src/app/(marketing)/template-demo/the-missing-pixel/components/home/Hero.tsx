// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FadeUp, INTRO_DELAY, MaskReveal, LineReveal } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import PixelButton from "../Buttons/PixelButton";
import StatusDot from "../shared/StatusDot";
import { ROUTES } from "../../routes";
import reelPixel from "../../assets/pictures/reel-pixel.webp";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Hero = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const driftRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const hero = heroRef.current;
      const drift = driftRef.current;
      if (!hero || !drift || prefersReducedMotion()) return;

      gsap.delayedCall(INTRO_DELAY + 0.8, () => {
        const pixel = hero.querySelector<HTMLElement>("[data-hero-pixel]");
        if (!pixel) return;
        const radius = getComputedStyle(pixel).borderTopLeftRadius;
        gsap.fromTo(
          pixel,
          { clipPath: `inset(50% round ${radius})` },
          {
            clipPath: `inset(0% round ${radius})`,
            duration: 1.2,
            ease: "power3.inOut",
          },
        );
      });

      gsap.to(drift, {
        y: () => hero.offsetHeight * (window.innerWidth <= 1025 ? 0.1 : window.innerWidth <= 1025 ? 0.2 : 0.3),
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: heroRef },
  );

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative flex max-lg:h-screen flex-col max-lg:justify-center gap-[3.8vw] px-[5vw] pb-[4.4vw] pt-[calc(5.2vw+12vh)]  max-lg:px-[6vw] max-lg:pb-[8vw] max-lg:pt-[calc(10vw+10vh)] max-md:gap-20 max-md:px-[7vw] max-md:pb-[12vw] max-md:pt-[calc(20vw+8vh)] max-lg:gap-18"
    >
      
      <div ref={driftRef} className="w-full will-change-transform">
        <MaskReveal as="h1" delay={INTRO_DELAY}>
          Every brand has
          <br />
          a missing{" "}
          <span
            data-hero-pixel
            className="relative inline-block size-[0.8em] overflow-hidden rounded-[0.1em] bg-mpx-surface align-[-0.1em] [clip-path:inset(50%)] motion-reduce:[clip-path:none]"
          >
            <Image
              quality={95}
              src={reelPixel}
              alt=""
              loading="eager"
              fetchPriority="high"
              sizes="8vw"
              className="h-full w-full object-cover"
            />
          </span>{" "}
          pixel.
          <br />
          We find it.
        </MaskReveal>
      </div>

      <div className="flex items-end justify-end gap-9 max-lg:flex-col-reverse max-lg:items-start max-lg:gap-12 max-md:gap-9">
       
       
      
        <div className="flex w-[46%] flex-col gap-[1.9vw] max-lg:w-[80%] max-lg:gap-7 max-md:gap-14 max-md:w-full">
          <LineReveal delay={INTRO_DELAY + 0.75} className="w-[90%] text-28 leading-[1.5] text-mpx-ink max-lg:w-full">
            The Missing Pixel is a brand and digital studio in Delhi, London,
            Dubai and New York. We obsess over the small thing that makes the
            big thing work.
          </LineReveal>
          <FadeUp delay={INTRO_DELAY + 0.75} className="flex flex-wrap max-md:flex-col  gap-3 max-md:gap-4">
            <PixelButton label="See The Work" href={ROUTES.work} icon />
            <PixelButton label="Start A Project" href={ROUTES.contact} variant="outline" />
          </FadeUp>
        </div>
      </div>
    </section>
  );
};

export default Hero;
