// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { hasFinePointer, prefersReducedMotion } from "./reducedMotion";

export function useTilt(ref: RefObject<HTMLElement | null>, x = 8, y = 6) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;

    gsap.set(el, { transformPerspective: 900 });
    const rotateY = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
    const rotateX = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });

    const handleMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      rotateY(((event.clientX - rect.left) / rect.width - 0.5) * x);
      rotateX(-((event.clientY - rect.top) / rect.height - 0.5) * y);
    };

    const handleLeave = () => {
      rotateX(0);
      rotateY(0);
    };

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", handleLeave);

    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
      gsap.set(el, { clearProps: "rotationX,rotationY,transformPerspective" });
    };
  }, [ref, x, y]);
}
