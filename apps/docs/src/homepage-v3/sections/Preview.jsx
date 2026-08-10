"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/motion";
import AsciiMorphIcon from "@/homepage-v3/components/AsciiMorphIcon";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const STEPS = [
  {
    id: "preview",
    title: "Preview",
    icon: "/homepage-v3/svgs/eye.svg",
    text: "Browse by the moment you need: a sharper scroll, a cursor with presence, a cleaner transition. See exactly what it does before it touches your project.",
  },
  {
    id: "install",
    title: "Install",
    icon: "/homepage-v3/svgs/install.svg",
    text: "Use the Honyaku CLI to add only the effect you need. Vault adds only the files that effect needs, not a full interaction ocean. You can inspect and own the implementation.",
  },
  {
    id: "tune",
    title: "Tune",
    icon: "/homepage-v3/svgs/tune.svg",
    text: "Edit copy, layout, timing, easing, breakpoints, hover states, mobile fallbacks and reduced-motion behavior to match your brand and product.",
  },
  {
    id: "ship",
    title: "Ship",
    icon: "/homepage-v3/svgs/ship.svg",
    text: "Deploy a website that feels abstract, more noticeable, and more memorable, without rebuilding every interaction from scratch.",
  },
];

const mark =
  "preview-mark pointer-events-none absolute size-[0.5vw] border-primary max-md:size-2 max-sm:size-1.5";

export default function Preview() {
  const gridRef = useRef(null);
  const iconRef = useRef(null);
  const asciiRef = useRef(null);

  useGSAP(
    () => {
      const rows = gsap.utils.toArray(".preview-row");
      const marks = rows.map((row) =>
        gsap.utils.toArray(row.querySelectorAll(".preview-mark")),
      );
      const icon = iconRef.current;

      if (!icon || rows.length !== STEPS.length) return;

      if (prefersReducedMotion()) {
        gsap.set(marks.flat(), { autoAlpha: 1 });
        gsap.set(icon, { yPercent: 0 });
        return;
      }

      // First row starts active, the rest hand over on scrub.
      gsap.set(marks.slice(1).flat(), { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 75%",
          end: "bottom 25%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      STEPS.forEach((_, i) => {
        if (i === 0) return;

        // Each step gets one hold beat and one travel beat.
        const at = (i - 1) * 2;

        tl.to(
          marks[i - 1],
          { autoAlpha: 0, duration: 0.4, ease: "power1.out" },
          at + 0.6,
        )
          .to(
            icon,
            { yPercent: i * 100, duration: 1, ease: "power2.inOut" },
            at + 0.6,
          )
          .to(
            marks[i],
            { autoAlpha: 1, duration: 0.4, ease: "power1.out" },
            at + 1.2,
          )
          // One proxy drives the whole swap: the icon dissolves into ASCII,
          // changes to this step's SVG at the peak, and resolves back out of
          // the noise. Deriving both values from a single tween keeps a
          // backwards scrub exactly symmetrical.
          .to(
            { p: 0 },
            {
              p: 1,
              duration: 1,
              onUpdate() {
                const p = this.targets()[0].p;
                asciiRef.current?.setStep(p < 0.5 ? i - 1 : i);
                asciiRef.current?.setMorph(Math.sin(p * Math.PI));
              },
            },
            at + 0.6,
          );
      });

      // Keeps the last row active for a beat before the section scrolls away.
      tl.to({}, { duration: 0.6 });
    },
    { scope: gridRef },
  );

  return (
    <section id="preview" className="w-full">
      <h2 className="t96 font-neue-haas text-center">
        Preview. Install. Tune. Ship.
      </h2>

      <div
        ref={gridRef}
        className="h-screen relative mt-[4vw] border-t border-b border-grey w-full flex flex-col"
      >
        {/* Travelling icon: one image translated down the second column */}
        <div
          ref={iconRef}
          className="pointer-events-none absolute left-[15vw] top-0 z-0 h-1/4 w-[15vw] p-[2.5vw] will-change-transform"
        >
          <AsciiMorphIcon
            ref={asciiRef}
            sources={STEPS.map((step) => step.icon)}
            className="h-full w-full"
          />
        </div>

        {STEPS.map((step, i) => (
          <div
            key={step.id}
            className={`preview-row relative z-10 flex flex-1 ${i === STEPS.length - 1 ? "" : "border-b border-grey"
              }`}
          >
            <div className="w-[15vw] h-full border-r border-grey" />
            <div className="w-[15vw] h-full border-r border-grey" />
            <div className="flex-1 flex relative flex-col justify-center px-[4vw] gap-[1vw] border-r border-grey">
              <span className={`${mark} -top-px -left-px border-t border-l`} />
              <span className={`${mark} -top-px -right-px border-t border-r`} />
              <span
                className={`${mark} -bottom-px -left-px border-b border-l`}
              />
              <span
                className={`${mark} -bottom-px -right-px border-b border-r`}
              />
              <p className="text34">{step.title}</p>
              <p className="t22 w-[80%]">{step.text}</p>
            </div>
            <div className="w-[15vw] h-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
