// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { social } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { fade, lines, ready, scene } from "./Animations/scroll";

gsap.registerPlugin(useGSAP);

const SHAPES = [
  "M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2Z",
  "M12 3 21 12 12 21 3 12Z",
  "M3 9c3-3 6 3 9 0s6 3 9 0M3 15c3-3 6 3 9 0s6 3 9 0",
  "M5 5h14v14H5Z",
];

const Social = () => {
  const root = useRef<HTMLElement>(null);
  const { testimonial } = social;
  const initials = testimonial.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        ready(root.current);
        return;
      }

      const tl = scene(root.current, "top 75%", "center 50%");
      const split = lines(tl, root.current?.querySelector("h2") ?? null, 0);
      fade(tl, "[data-orn-logo]", 0.2, 0.1, 12);
      fade(tl, "[data-orn-quote]", 0.5, 0, 24);

      return () => split?.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="customers" data-orn-tone="light" className="orn-light relative z-[1] bg-orn-light-alt">
      <div className="orn-container orn-section flex items-center justify-between gap-12 max-lg:flex-col max-lg:items-start">
        <h2 data-orn-split className="w-[30%] max-lg:w-[70%] max-md:w-full">
          {social.title}
        </h2>
        <div className="flex w-[60%] flex-col gap-8 max-lg:w-full">
          <ul className="grid grid-cols-4 border border-orn-line max-md:grid-cols-2">
            {social.logos.map((name, i) => (
              <li
                key={i}
                data-orn-logo
                data-orn-fade
                className={`flex h-[9vh] items-center justify-center gap-2 border-orn-line text-14 text-orn-muted max-lg:h-[6vh] max-md:h-[9vh] ${i > 0 ? "border-l" : ""} ${i === 2 ? "max-md:border-l-0" : ""} ${i > 1 ? "max-md:border-t" : ""}`.replace(/\s+/g, " ").trim()}
              >
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[2.2vh] aspect-square max-lg:h-[1.6vh] max-md:h-[2.4vh]">
                  <path d={SHAPES[i % SHAPES.length]} />
                </svg>
                {name}
              </li>
            ))}
          </ul>
          <figure data-orn-quote data-orn-fade className="flex flex-col gap-8 border border-orn-line bg-[color-mix(in_srgb,white_60%,transparent)] px-[2.4vw] py-[2.4vw] max-lg:px-[4vw] max-lg:py-[4vw] max-md:gap-6 max-md:px-[5vw] max-md:py-[6vw]">
            <div className="flex items-start justify-between gap-4">
              <span aria-hidden className="text-48 font-orn-display text-orn-accent">&ldquo;</span>
              {testimonial.placeholder && <span className="font-orn-mono text-12 text-orn-muted">Placeholder testimonial</span>}
            </div>
            <blockquote className="text-30 font-orn-display">{testimonial.quote}</blockquote>
            <figcaption className="flex items-center gap-4">
              <span aria-hidden className="flex h-[5.4vh] aspect-square items-center justify-center bg-[var(--orn-forest)] text-14 text-[var(--orn-mint)] max-lg:h-[4vh] max-md:h-[6vh]">
                {initials}
              </span>
              <span className="flex flex-col">
                <span className="text-14 font-medium">{testimonial.name}</span>
                <span className="text-12 text-orn-muted">
                  {testimonial.role}, {testimonial.company}
                </span>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

export default Social;
