"use client"
import React, { useEffect, useState } from 'react'
import { ChevronBird } from './ChevronBird'
import Cross from './Cross'
import Plus from './Plus'

const AnimatedToggle = () => {
  const [chevronActive, setChevronActive] = useState(false);
  const [crossActive, setCrossActive] = useState(false);
  const [plusActive, setPlusActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    const syncReducedMotion = (event) => {
      const matches = "matches" in event ? event.matches : event.currentTarget.matches;
      setPrefersReducedMotion(matches);
    };

    if (mediaQuery) {
      syncReducedMotion(mediaQuery);
      mediaQuery.addEventListener("change", syncReducedMotion);
    }

    return () => {
      mediaQuery?.removeEventListener("change", syncReducedMotion);
    };
  }, []);
  return (
    <div className="flex gap-8 justify-center">
      <button
        onClick={() => setChevronActive((prev) => !prev)}
        className={`cursor-pointer size-24 max-md:size-18 rounded-lg flex group items-center justify-center transition-all duration-300 motion-reduce:transition-none motion-safe:active:scale-90 ${chevronActive ? "bg-[#ff5f00]" : "bg-zinc-400"}`}
      >
        <ChevronBird
          className="mt-2 duration-300 transition-all motion-reduce:transition-none motion-safe:group-hover:rotate-180 motion-safe:group-hover:translate-y-[-30%]"
          size={32}
          isActive={chevronActive}
          prefersReducedMotion={prefersReducedMotion}
        />
      </button>
      <button
        onClick={() => setCrossActive((prev) => !prev)}
        className={`group cursor-pointer size-24 max-md:size-18 rounded-lg flex items-center justify-center transition-all duration-300 motion-reduce:transition-none motion-safe:active:scale-90 ${crossActive ? "bg-[#ff5f00]" : "bg-zinc-400"}`}
      >
        <Cross size={24} isActive={crossActive} prefersReducedMotion={prefersReducedMotion} />
      </button>
      <button
        onClick={() => setPlusActive((prev) => !prev)}
        className={`group cursor-pointer size-24 max-md:size-18 rounded-lg flex items-center justify-center transition-all duration-300 motion-reduce:transition-none motion-safe:active:scale-90 ${plusActive ? "bg-[#ff5f00]" : "bg-zinc-400"}`}
      >
        <Plus size={24} isActive={plusActive} prefersReducedMotion={prefersReducedMotion} />
      </button>
    </div>
  )
}
export default AnimatedToggle
