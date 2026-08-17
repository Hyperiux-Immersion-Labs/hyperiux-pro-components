"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/motion";
import AsciiMorphIcon from "@/homepage-v3/components/AsciiMorphIcon";
import LineReveal from "@/components/Animations/LineReveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Each row opens as its step number and morphs into its icon on scroll, so the
// two sources are the two ends of that row's own dissolve.
const STEPS = [
  {
    id: "preview",
    title: "Preview",
    number: "/homepage-v3/svgs/1.svg",
    icon: "/homepage-v3/svgs/eye.svg",
    text: "Browse by the moment you need: a sharper scroll, a cursor with presence, a cleaner transition. See exactly what it does before it touches your project.",
  },
  {
    id: "install",
    title: "Install",
    number: "/homepage-v3/svgs/2.svg",
    icon: "/homepage-v3/svgs/install.svg",
    text: "Use the Honyaku CLI to add only the effect you need. Vault adds only the files that effect needs, not a full interaction ocean. You can inspect and own the implementation.",
  },
  {
    id: "tune",
    title: "Tune",
    number: "/homepage-v3/svgs/3.svg",
    icon: "/homepage-v3/svgs/tune.svg",
    text: "Edit copy, layout, timing, easing, breakpoints, hover states, mobile fallbacks and reduced-motion behavior to match your brand and product.",
  },
  {
    id: "ship",
    title: "Ship",
    number: "/homepage-v3/svgs/4.svg",
    icon: "/homepage-v3/svgs/ship.svg",
    text: "Deploy a website that feels abstract, more noticeable, and more memorable, without rebuilding every interaction from scratch.",
  },
];

const mark =
  "preview-mark pointer-events-none absolute size-[0.5vw] border-primary max-[1025px]:size-2 max-md:size-2 max-sm:size-1.5";

export default function Preview() {
  const gridRef = useRef(null);
  const asciiRefs = useRef([]);

  useGSAP(
    () => {
      const rows = gsap.utils.toArray(".preview-row");
      const marks = rows.map((row) =>
        gsap.utils.toArray(row.querySelectorAll(".preview-mark")),
      );
      const textWrappers = rows.map((row) =>
        row.querySelector(".preview-text-wrapper"),
      );
      // One glyph per row, each parked in its own row's second column.
      const asciis = asciiRefs.current;

      if (rows.length !== STEPS.length) return;

      if (prefersReducedMotion()) {
        gsap.set(marks.flat(), { autoAlpha: 1 });
        gsap.set(textWrappers, { x: 0 });
        // No dissolve to scrub: land straight on the resolved icons.
        asciis.forEach((ascii) => ascii?.setStep(1));
        return;
      }

      // ── Numbers → icons: scrubbed dissolve, one per row, nothing travels ──
      // Every row simply *is* its step number — no reveal, no entrance, it is
      // crisp in its cell from the moment the section renders. The number is
      // never itself dissolved: the ASCII the canvas draws is always the icon's
      // shape (setGrid(1)), so what builds over the numeral is the icon
      // arriving, and it settles into the crisp icon on the way out.
      //
      //   t     = progress mapped into this row's window        → 0 … 1
      //   morph = 1 - |2t - 1|   triangle: nothing → scrambled icon → nothing
      //   step  = the crisp art underneath — number below the peak, icon above.
      //           It swaps while the cell is fully scrambled, so the number is
      //           replaced under cover rather than cutting on screen.
      //
      // Both are pure functions of scroll progress, so scrubbing back replays
      // the dissolve in reverse instead of snapping. The four windows are
      // staggered and don't overlap, so the numbers turn over one at a time and
      // the last lands before the section ends.
      const MORPH_START = 0.05; // progress at which row 0 begins its morph
      const MORPH_STAGGER = 0.22; // progress between one row's start and the next
      const MORPH_SPAN = 0.18; // progress a single number → icon morph takes

      // The dissolve is the icon's silhouette all the way through, for every row.
      asciis.forEach((ascii) => ascii?.setGrid(1));

      const updateIcons = (progress) => {
        asciis.forEach((ascii, i) => {
          if (!ascii) return;
          const start = MORPH_START + i * MORPH_STAGGER;
          const t = gsap.utils.clamp(0, 1, (progress - start) / MORPH_SPAN);
          ascii.setStep(t < 0.5 ? 0 : 1);
          ascii.setMorph(1 - Math.abs(t * 2 - 1));
        });
      };

      updateIcons(0);

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
          onUpdate: ({ progress }) => {
            updateX(progress);
            updateIcons(progress);
          },
        },
      });

      // ── Step 0 → 1  (timeline position 0 … 1) ────────────────────────────
      // Outgoing row 0 marks fade out, incoming row 1 marks fade in.
      tl.to(marks[0], { autoAlpha: 0, duration: 0.3 }, 0.35);
      tl.to(marks[1], { autoAlpha: 1, duration: 0.3 }, 0.5);

      // ── Step 1 → 2  (timeline position 1 … 2) ────────────────────────────
      tl.to(marks[1], { autoAlpha: 0, duration: 0.3 }, 1.35);
      tl.to(marks[2], { autoAlpha: 1, duration: 0.3 }, 1.5);

      // ── Step 2 → 3  (timeline position 2 … 3) ────────────────────────────
      tl.to(marks[2], { autoAlpha: 0, duration: 0.3 }, 2.35);
      tl.to(marks[3], { autoAlpha: 1, duration: 0.3 }, 2.5);
    },
    { scope: gridRef },
  );

  return (
    <section id="preview" className="w-full ">
      <LineReveal as='h2' className="t96 max-[1025px]:w-[85%] max-[1025px]:mx-auto max-md:w-[70%] max-md:mx-auto max-md:text-[8vw]! font-neue-haas text-center">
        Preview. Install. Tune. Ship.
      </LineReveal>

      <div
        ref={gridRef}
        className="h-screen relative mt-[7vw] max-[1025px]:mt-[8vw] max-md:mt-[12vw] border-t border-b border-grey w-full flex flex-col"
      >
        {STEPS.map((step, i) => (
          <div
            key={step.id}
            className={`preview-row relative z-10 flex flex-1 ${
              i === STEPS.length - 1 ? "" : "border-b border-grey"
            }`}
          >
            <div className="w-[15vw] max-[1025px]:w-[6vw] max-md:w-[5vw] h-full border-r border-grey" />
            {/* This row's number, morphing in place into this row's icon. */}
            <div className="relative w-[15vw] max-[1025px]:w-[20vw] max-md:w-[30vw] h-full border-r border-grey">
              <div className="preview-icon pointer-events-none absolute inset-0 p-[1.5vw] max-[1025px]:p-[3vw]">
                <AsciiMorphIcon
                  ref={(node) => {
                    asciiRefs.current[i] = node;
                  }}
                  sources={[step.number, step.icon]}
                  fit="contain"
                  className="h-full max-md:h-1/2 w-full"
                />
              </div>
            </div>
            <div className="flex-1 flex relative flex-col justify-center px-[4vw] gap-[1vw] max-[1025px]:gap-[1.5vw] border-r border-grey">
              <span className={`${mark} -top-px -left-px border-t border-l`} />
              <span className={`${mark} -top-px -right-px border-t border-r`} />
              <span
                className={`${mark} -bottom-px -left-px border-b border-l`}
              />
              <span
                className={`${mark} -bottom-px -right-px border-b border-r`}
              />
              <div className="preview-text-wrapper flex flex-col max-[1025px]:gap-[2vw] max-md:gap-[3vw] gap-[1vw] will-change-transform">
                <p className="text34">{step.title}</p>
                <p className="t22 w-[80%] max-[1025px]:w-[95%] max-md:w-[95%]">{step.text}</p>
              </div>
            </div>
            <div className="w-[15vw] max-[1025px]:w-[6vw] max-md:w-[5vw] h-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
