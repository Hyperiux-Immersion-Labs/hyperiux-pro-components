"use client";

import { useRef, useState } from "react";

import AsciiMorph from "@/homepage-v3/components/AsciiMorph";

const NUMBER_SRC = "/homepage-v3/svgs/1.svg";
const EYE_SRC = "/homepage-v3/svgs/eye.svg";
const COLS = 100; // glyph columns across the box
const MORPH_MS = 1500; // one number → eye (or back) journey

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export default function MorphingDiether() {
  const asciiRef = useRef(null);
  const progressRef = useRef(0);
  const tweenRef = useRef(null);
  const [toEye, setToEye] = useState(false);

  const play = () => {
    const target = toEye ? 0 : 1;
    setToEye((v) => !v);

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);

    if (prefersReduced) {
      progressRef.current = target;
      asciiRef.current?.setProgress(target);
      return;
    }

    const from = progressRef.current;
    const start = performance.now();
    const distance = Math.abs(target - from) || 1;

    const step = (now) => {
      const frac = Math.min((now - start) / (MORPH_MS * distance), 1);
      const p = from + (target - from) * easeInOutCubic(frac);
      progressRef.current = p;
      asciiRef.current?.setProgress(p);
      if (frac < 1) tweenRef.current = requestAnimationFrame(step);
    };

    tweenRef.current = requestAnimationFrame(step);
  };

  return (
    <section className="flex min-h-dvh w-full flex-col items-center justify-center gap-[3vw] bg-black py-[6vw]">
      <AsciiMorph
        ref={asciiRef}
        sources={[NUMBER_SRC, EYE_SRC]}
        fit="contain"
        cols={COLS}
        className="aspect-square w-[36vw] max-[1025px]:w-[70vw] max-md:w-[85vw]"
      />

      <button
        type="button"
        onClick={play}
        className="cursor-pointer border border-primary px-[2vw] py-[0.8vw] font-neue-haas text-[1.1vw] uppercase tracking-widest text-primary transition-colors duration-300 hover:bg-primary hover:text-black max-[1025px]:px-6 max-[1025px]:py-3 max-[1025px]:text-sm"
      >
        {toEye ? "Reverse" : "Play"}
      </button>
    </section>
  );
}
