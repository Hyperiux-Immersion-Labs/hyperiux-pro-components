// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FadeUp, INTRO_DELAY, MaskReveal } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import PixelButton from "../Buttons/PixelButton";
import StatusDot from "../shared/StatusDot";
import { ROUTES } from "../../routes";
import reelPoster from "../../assets/reel-poster.webp";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Hero = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const driftRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const hero = heroRef.current;
      const drift = driftRef.current;
      if (!hero || !drift || prefersReducedMotion()) return;

      const pixel = hero.querySelector<HTMLElement>("[data-hero-pixel]");
      if (pixel) {
        const radius = getComputedStyle(pixel).borderTopLeftRadius;
        gsap.fromTo(
          pixel,
          { clipPath: `inset(50% round ${radius})` },
          {
            clipPath: `inset(0% round ${radius})`,
            duration: 1.2,
            delay: INTRO_DELAY + 0.8,
            ease: "power3.inOut",
          },
        );
      }

      gsap.to(drift, {
        y: () => hero.offsetHeight * 0.3,
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
      className="mpx-container py-[7%] relative flex flex-col px-[5vw] h-screen justify-center  gap-12  max-lg:gap-12 max-lg:py-[6vw] max-md:gap-10 max-md:py-[10vw]"
    >
      
      <div ref={driftRef} className="w-[65%] will-change-transform max-lg:w-full">
        <MaskReveal as="h1" delay={INTRO_DELAY}>
          Every brand has a missing{" "}
          <span
            data-hero-pixel
            className="relative inline-block size-[5.3vw] overflow-hidden rounded-xl bg-mpx-surface align-[-0.7vw] [clip-path:inset(50%)] max-lg:size-[6.1vw] max-lg:rounded-md max-lg:align-[-0.8vw] max-md:size-[9.2vw] max-md:align-[-1.2vw] motion-reduce:[clip-path:none]"
          >
            <Image
              src={reelPoster}
              alt=""
              loading="eager"
              fetchPriority="high"
              sizes="8vw"
              className="h-full w-full object-cover"
            />
          </span>{" "}
          pixel. We find it .
        </MaskReveal>
      </div>

      <div className="flex items-end justify-between gap-9 max-lg:flex-col-reverse max-lg:items-start max-lg:gap-12 max-md:gap-9">
        <FadeUp delay={INTRO_DELAY + 0.6} className="w-[40%] max-lg:w-full">
          <StatusDot label="Booking spring 2027. Two slots left, probably." />
        </FadeUp>
       
      
        <FadeUp
          delay={INTRO_DELAY + 0.75}
          className="flex w-[46%] flex-col gap-12 max-lg:w-[80%] max-lg:gap-7 max-md:w-full"
        >
          <p className="w-[90%] text-28 leading-[1.5] text-mpx-ink max-lg:w-full">
            The Missing Pixel is a brand and digital studio in Delhi, London,
            Dubai and New York. We obsess over the small thing that makes the
            big thing work.
          </p>
          <div className="flex flex-wrap gap-3 max-md:gap-2">
            <PixelButton label="See The Work" href={ROUTES.work} icon />
            <PixelButton label="Start A Project" href={ROUTES.contact} variant="outline" />
          </div>
        </FadeUp>
      </div>
    </section>
  );
};

export default Hero;
