// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { manifesto } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { lines, ready, scene } from "./Animations/scroll";

gsap.registerPlugin(useGSAP);

const Manifesto = () => {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        ready(root.current);
        return;
      }

      const tl = scene(root.current, "top 70%", "bottom 75%");
      const split = lines(tl, root.current?.querySelector("h2") ?? null, 0);
      const rows = gsap.utils.toArray<HTMLElement>("[data-orn-manifesto]");
      rows.forEach((row) => row.setAttribute("data-orn-ready", ""));
      tl.from(rows, { opacity: 0.12, y: 12, duration: 0.6, stagger: 0.5, ease: "power2.out" }, 0.8);

      return () => split?.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="manifesto" data-orn-aurora className="orn-dark relative">
      <div aria-hidden className="orn-veil-bottom absolute inset-0 -z-10" />
      <div className="orn-container flex min-h-[90vh] flex-col items-center justify-center gap-10 py-[16vw] text-center max-lg:min-h-0 max-lg:py-[20vw] max-md:gap-8 max-md:py-[28vw]">
        <h2 data-orn-split className="text-72">
          {manifesto.title[0]}
          <br />
          {manifesto.title[1]}
          <span className="text-orn-mint">{manifesto.highlight}</span>
        </h2>
        <div className="flex flex-col gap-1">
          {manifesto.lines.map((line) => (
            <p key={line} data-orn-manifesto data-orn-fade className="text-19 text-orn-paper-muted">
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Manifesto;
