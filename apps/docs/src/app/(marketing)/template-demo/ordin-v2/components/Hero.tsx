// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { hero } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { ready, SCRUB } from "./Animations/scroll";
import Button from "./Button";
import ParticleGlobe, { globeDriver } from "./ParticleGlobe";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const Hero = () => {
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const globe = useRef<HTMLDivElement>(null);
  const driver = useRef(globeDriver());

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        driver.current.form = 1;
        ready(root.current);
        return;
      }

      const title = SplitText.create("[data-orn-split]", { type: "lines", mask: "lines", linesClass: "orn-line" });
      ready(root.current);
      const intro = gsap.timeline({ delay: 0.15 });
      intro
        .from(title.lines, { yPercent: 105, duration: 0.8, stagger: 0.1, ease: "power3.out" }, 0)
        .from("[data-orn-fade]", { opacity: 0, y: 20, duration: 0.7, stagger: 0.1, ease: "power3.out" }, 0.3)
        .to(driver.current, { form: 1, duration: 2, ease: "power2.inOut" }, 0);

      const exit = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: SCRUB },
      });
      exit
        .to(content.current, { yPercent: -18, opacity: 0.15 }, 0)
        .to(globe.current, { yPercent: 14, scale: 0.86 }, 0)
        .to(driver.current, { spin: 1.4, glow: 0.6 }, 0);

      return () => title.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" data-orn-aurora className="orn-dark relative overflow-hidden">
      <div aria-hidden className="orn-veil-hero absolute inset-0 -z-10" />
      <div className="orn-container flex min-h-[94vh] items-center justify-between gap-10 py-[14vh] max-lg:min-h-0 max-lg:flex-col max-lg:items-start max-lg:py-[12vh] max-md:gap-6 max-md:py-[14vh]">
        <div ref={content} className="flex w-[58%] flex-col gap-8 max-lg:w-[80%] max-md:w-full max-md:gap-6">
          <h1 data-orn-split>
            {hero.title[0]}
            <br />
            {hero.title[1]}
            <span className="text-orn-mint">{hero.highlight}</span>
          </h1>
          <p data-orn-fade className="w-[70%] text-16 text-orn-paper-muted max-md:w-full">
            {hero.copy[0]} {hero.copy[1]}
          </p>
          <div data-orn-fade className="flex flex-wrap gap-3">
            <Button href={hero.primary.href}>{hero.primary.label}</Button>
            <Button href={hero.secondary.href} variant="line">
              {hero.secondary.label}
            </Button>
          </div>
        </div>
        <div ref={globe} className="w-[36vw] max-lg:w-[60vw] max-lg:self-center max-md:w-[64vw]">
          <ParticleGlobe driver={driver} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
