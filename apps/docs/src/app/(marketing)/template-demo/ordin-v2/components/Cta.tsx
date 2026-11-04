// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cta } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { fade, lines, ready, scene } from "./Animations/scroll";
import Button from "./Button";
import ParticleGlobe, { globeDriver } from "./ParticleGlobe";

gsap.registerPlugin(useGSAP);

const Cta = () => {
  const root = useRef<HTMLElement>(null);
  const driver = useRef(globeDriver());

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        driver.current.form = 1;
        ready(root.current);
        return;
      }

      const tl = scene(root.current, "top 75%", "center 50%");
      const split = lines(tl, root.current?.querySelector("h2") ?? null, 0);
      fade(tl, "[data-orn-copy]", 0.3);
      fade(tl, "[data-orn-actions]", 0.45, 0, 16);
      tl.to(driver.current, { form: 1, duration: 1.4, ease: "power2.out" }, 0);
      tl.to(driver.current, { spin: 1.2, glow: 0.6, duration: 2 }, 0);

      return () => split?.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="get-started" data-orn-aurora className="orn-dark relative overflow-hidden">
      <div aria-hidden className="orn-veil-cta absolute inset-0 -z-10" />
      <div className="orn-container orn-section flex items-center justify-between gap-10 max-lg:flex-col max-lg:items-start">
        <div className="flex w-[50%] flex-col gap-6 max-lg:w-[80%] max-md:w-full">
          <h2 data-orn-split className="text-72">
            <span className="block">{cta.title[0]}</span>
            <span className="block text-orn-mint">{cta.title[1]}</span>
          </h2>
          <p data-orn-copy data-orn-fade className="text-16 text-orn-paper-muted">
            {cta.copy}
          </p>
          <div data-orn-actions data-orn-fade className="flex flex-wrap gap-3">
            <Button href={cta.primary.href}>{cta.primary.label}</Button>
            <Button href={cta.secondary.href} variant="line">
              {cta.secondary.label}
            </Button>
          </div>
        </div>
        <div className="w-[30vw] max-lg:w-[50vw] max-lg:self-center max-md:w-[60vw]">
          <ParticleGlobe driver={driver} density={0.8} />
        </div>
      </div>
    </section>
  );
};

export default Cta;
