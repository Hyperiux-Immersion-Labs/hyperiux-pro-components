// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { governance } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { fade, lines, ready, scene } from "./Animations/scroll";
import Icon from "./Icon";
import ParticleGlobe, { globeDriver } from "./ParticleGlobe";

gsap.registerPlugin(useGSAP);

const Governance = () => {
  const root = useRef<HTMLElement>(null);
  const driver = useRef(globeDriver());

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        driver.current.form = 1;
        ready(root.current);
        return;
      }

      const tl = scene(root.current, "top 75%", "bottom 85%");
      tl.to(driver.current, { form: 1, duration: 1.4, ease: "power2.out" }, 0);
      const split = lines(tl, root.current?.querySelector("h2") ?? null, 0.2);
      fade(tl, "[data-orn-copy]", 0.5);
      fade(tl, "[data-orn-rule]", 0.8, 0.2, 16);
      tl.to(driver.current, { spin: 1.6, glow: 0.5, duration: 2.2 }, 0.2);

      return () => split?.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="governance" data-orn-aurora className="orn-dark relative">
      <div aria-hidden className="orn-veil absolute inset-0 -z-10" />
      <div className="orn-container orn-section flex items-center justify-between gap-12 max-lg:flex-col max-lg:items-start">
        <div className="w-[40vw] max-lg:w-[60vw] max-lg:self-center max-md:w-[78vw]">
          <ParticleGlobe driver={driver} density={0.75} bounded />
        </div>
        <div className="flex w-[44%] flex-col gap-10 max-lg:w-full max-md:gap-8">
          <div className="flex flex-col gap-5">
            <h2 data-orn-split>
              {governance.title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p data-orn-copy data-orn-fade className="w-[84%] text-16 text-orn-paper-muted max-md:w-full">
              {governance.copy}
            </p>
          </div>
          <ul className="flex flex-col">
            {governance.rows.map((row) => (
              <li key={row.title} data-orn-rule data-orn-fade className="flex items-start gap-5 border-t border-orn-line-dark py-[1.4vw] last:border-b max-lg:py-[2.4vw] max-md:gap-4 max-md:py-[5vw]">
                <span className="flex h-[4.8vh] aspect-square shrink-0 items-center justify-center border border-orn-line-dark text-orn-mint max-lg:h-[3.4vh] max-md:h-[5vh]">
                  <Icon name={row.icon} className="h-[50%] aspect-square" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-19">{row.title}</h3>
                  <p className="text-14 text-orn-paper-muted">{row.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Governance;
