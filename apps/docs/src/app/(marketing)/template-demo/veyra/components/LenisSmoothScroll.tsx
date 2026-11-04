// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, type LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";
import { useReducedMotion } from "./Animations/reducedMotion";

gsap.registerPlugin(ScrollTrigger);

const LenisSmoothScroll = () => {
  const lenisRef = useRef<LenisRef>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => gsap.ticker.remove(update);
  }, [reduce]);

  if (reduce) return null;

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.085,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
        anchors: true,
      }}
    />
  );
};

export default LenisSmoothScroll;
