// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client"

import React, { useEffect, useState, type CSSProperties } from 'react'
import { ChevronBird } from './ChevronBird'
import Cross from './Cross'
import Plus from './Plus'

export interface AnimatedToggleProps {
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  duration?: number;
}

const AnimatedToggle = ({
  size = 96,
  activeColor = "#ff5f00",
  inactiveColor = "#a1a1aa",
  duration = 0.32,
}: AnimatedToggleProps) => {
  const [chevronActive, setChevronActive] = useState(false);
  const [crossActive, setCrossActive] = useState(false);
  const [plusActive, setPlusActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    const syncReducedMotion = (event: MediaQueryList | MediaQueryListEvent) => {
      const matches = "matches" in event ? event.matches : ((event as any).currentTarget as MediaQueryList).matches;
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

  const chevronIconSize = Math.round(size / 3);
  const iconSize = Math.round(size / 4);

  const boxStyle = {
    "--toggle-size": `${size}px`,
    transitionDuration: prefersReducedMotion ? "0s" : `${duration}s`,
  } as CSSProperties;

  return (
    <div className="flex gap-8 justify-center">
      <button
        onClick={() => setChevronActive((prev) => !prev)}
        className="cursor-pointer size-(--toggle-size) max-md:size-[calc(var(--toggle-size)*0.75)] rounded-lg flex group items-center justify-center transition-[background-color,transform] motion-reduce:transition-none motion-safe:active:scale-90"
        style={{ ...boxStyle, backgroundColor: chevronActive ? activeColor : inactiveColor }}
      >
        <ChevronBird
          className="mt-2 transition-all motion-reduce:transition-none motion-safe:group-hover:rotate-180 motion-safe:group-hover:translate-y-[-30%]"
          size={chevronIconSize}
          isActive={chevronActive}
          prefersReducedMotion={prefersReducedMotion}
          duration={duration}
        />
      </button>
      <button
        onClick={() => setCrossActive((prev) => !prev)}
        className="group cursor-pointer size-(--toggle-size) max-md:size-[calc(var(--toggle-size)*0.75)] rounded-lg flex items-center justify-center transition-[background-color,transform] motion-reduce:transition-none motion-safe:active:scale-90"
        style={{ ...boxStyle, backgroundColor: crossActive ? activeColor : inactiveColor }}
      >
        <Cross size={iconSize} isActive={crossActive} prefersReducedMotion={prefersReducedMotion} duration={duration} />
      </button>
      <button
        onClick={() => setPlusActive((prev) => !prev)}
        className="group cursor-pointer size-(--toggle-size) max-md:size-[calc(var(--toggle-size)*0.75)] rounded-lg flex items-center justify-center transition-[background-color,transform] motion-reduce:transition-none motion-safe:active:scale-90"
        style={{ ...boxStyle, backgroundColor: plusActive ? activeColor : inactiveColor }}
      >
        <Plus size={iconSize} isActive={plusActive} prefersReducedMotion={prefersReducedMotion} duration={duration} />
      </button>
    </div>
  )
}
export default AnimatedToggle
