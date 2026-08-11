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
      const textWrappers = rows.map((row) =>
        row.querySelector(".preview-text-wrapper"),
      );
      const icon = iconRef.current;

      if (!icon || rows.length !== STEPS.length) return;

      if (prefersReducedMotion()) {
        gsap.set(marks.flat(), { autoAlpha: 1 });
        gsap.set(icon, { yPercent: 0 });
        gsap.set(textWrappers, { x: 0 });
        return;
      }

      // Row 0 starts active. Rows 1–3 start hidden and slide in on scroll.
      gsap.set(marks.slice(1).flat(), { autoAlpha: 0 });
      gsap.set(textWrappers[0], { x: "3vw" }); // row 0 is already indented
      gsap.set(textWrappers.slice(1), { x: 0 }); // rows 1–3 start flush

      // ── x translate — neighbour falloff (same formula as SquareTranslate) ──
      // Instead of hard-coded fromTo tweens, we compute x continuously from
      // scroll progress so it is always smooth, even on scrub-back.
      //
      //   currentIndex  = progress * (total rows - 1)   → float 0 … 3
      //   distance      = |rowIndex - currentIndex|
      //   factor        = 1 - clamp(distance / FALLOFF, 0, 1)
      //   x             = INDENT_PX * factor
      //
      // Active row (distance = 0) → factor = 1 → full indent (3vw).
      // One row away (distance = 1, FALLOFF = 1.5) → factor ≈ 0.33 → 1vw nudge.
      // Two rows away → factor = 0 → flush.
      const INDENT_VW = 3;       // vw — how far the active row translates
      const FALLOFF    = 1.5;    // rows — how quickly the nudge fades to neighbours

      const updateX = (progress) => {
        const INDENT_PX = INDENT_VW * 0.01 * window.innerWidth;
        const currentIndex = progress * (STEPS.length - 1); // 0 … 3 (float)

        textWrappers.forEach((wrapper, i) => {
          const distance = Math.abs(i - currentIndex);
          const factor   = 1 - Math.min(distance / FALLOFF, 1);
          gsap.to(wrapper, {
            x: INDENT_PX * factor,
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
          });
        });
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 65%",
          end: "bottom 35%",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => updateX(progress),
        },
      });

      // ── Step 0 → 1  (timeline position 0 … 1) ────────────────────────────
      // Icon slides from row 0 to row 1.
      tl.to(icon, { yPercent: 100, duration: 1 }, 0);
      // Outgoing row 0 marks fade out, incoming row 1 marks fade in.
      tl.to(marks[0], { autoAlpha: 0, duration: 0.3 }, 0.35);
      tl.to(marks[1], { autoAlpha: 1, duration: 0.3 }, 0.5);
      // ASCII icon morphs from step 0 → 1 over the full travel window.
      tl.to(
        { p: 0 },
        {
          p: 1,
          duration: 1,
          onUpdate() {
            const p = this.targets()[0].p;
            asciiRef.current?.setStep(p < 0.5 ? 0 : 1);
            asciiRef.current?.setMorph(Math.sin(p * Math.PI));
          },
        },
        0,
      );

      // ── Step 1 → 2  (timeline position 1 … 2) ────────────────────────────
      tl.to(icon, { yPercent: 200, duration: 1 }, 1);
      tl.to(marks[1], { autoAlpha: 0, duration: 0.3 }, 1.35);
      tl.to(marks[2], { autoAlpha: 1, duration: 0.3 }, 1.5);
      tl.to(
        { p: 0 },
        {
          p: 1,
          duration: 1,
          onUpdate() {
            const p = this.targets()[0].p;
            asciiRef.current?.setStep(p < 0.5 ? 1 : 2);
            asciiRef.current?.setMorph(Math.sin(p * Math.PI));
          },
        },
        1,
      );

      // ── Step 2 → 3  (timeline position 2 … 3) ────────────────────────────
      tl.to(icon, { yPercent: 300, duration: 1 }, 2);
      tl.to(marks[2], { autoAlpha: 0, duration: 0.3 }, 2.35);
      tl.to(marks[3], { autoAlpha: 1, duration: 0.3 }, 2.5);
      tl.to(
        { p: 0 },
        {
          p: 1,
          duration: 1,
          onUpdate() {
            const p = this.targets()[0].p;
            asciiRef.current?.setStep(p < 0.5 ? 2 : 3);
            asciiRef.current?.setMorph(Math.sin(p * Math.PI));
          },
        },
        2,
      );
    },
    { scope: gridRef },
  );

  return (
    <section id="preview" className="w-full">
      <h2 className="t96 max-md:w-[70%] max-md:mx-auto max-md:text-[8vw]! font-neue-haas text-center">
        Preview. Install. Tune. Ship.
      </h2>

      <div
        ref={gridRef}
        className="h-screen relative mt-[4vw] max-md:mt-[12vw] border-t border-b border-grey w-full flex flex-col"
      >
        {/* Travelling icon: one image translated down the second column */}
        <div
          ref={iconRef}
          className="pointer-events-none absolute max-md:w-[30vw] max-md:left-[5vw]  left-[15vw] top-0 z-0 h-1/4 w-[15vw] p-[2.5vw] will-change-transform"
        >
          <AsciiMorphIcon
            ref={asciiRef}
            sources={STEPS.map((step) => step.icon)}
            className="h-full max-md:h-1/2 w-full"
          />
        </div>

        {STEPS.map((step, i) => (
          <div
            key={step.id}
            className={`preview-row relative z-10 flex flex-1 ${
              i === STEPS.length - 1 ? "" : "border-b border-grey"
            }`}
          >
            <div className="w-[15vw] max-md:w-[5vw] h-full border-r border-grey" />
            <div className="w-[15vw] max-md:w-[30vw] h-full border-r border-grey" />
            <div className="flex-1 flex relative flex-col justify-center px-[4vw] gap-[1vw] border-r border-grey">
              <span className={`${mark} -top-px -left-px border-t border-l`} />
              <span className={`${mark} -top-px -right-px border-t border-r`} />
              <span
                className={`${mark} -bottom-px -left-px border-b border-l`}
              />
              <span
                className={`${mark} -bottom-px -right-px border-b border-r`}
              />
              <div className="preview-text-wrapper flex flex-col max-md:gap-[3vw] gap-[1vw] will-change-transform">
                <p className="text34">{step.title}</p>
                <p className="t22 w-[80%] max-md:w-[95%]">{step.text}</p>
              </div>
            </div>
            <div className="w-[15vw] max-md:w-[5vw] h-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
