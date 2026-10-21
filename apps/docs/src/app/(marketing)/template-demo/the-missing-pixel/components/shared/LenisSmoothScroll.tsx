// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";
import { prefersReducedMotion } from "../Animations/reducedMotion";

interface LenisSmoothScrollProps {
  duration?: number;
  lerp?: number;
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
}

const LenisSmoothScroll = ({
  duration = 1.4,
  lerp = 0.1,
  smoothWheel = true,
  wheelMultiplier = 1,
  touchMultiplier = 1,
}: LenisSmoothScrollProps) => {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => gsap.ticker.remove(update);
  }, []);

  if (prefersReducedMotion()) {
    return null;
  }

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        duration,
        lerp,
        smoothWheel,
        wheelMultiplier,
        touchMultiplier,
      }}
      ref={lenisRef}
    />
  );
};

export default LenisSmoothScroll;
