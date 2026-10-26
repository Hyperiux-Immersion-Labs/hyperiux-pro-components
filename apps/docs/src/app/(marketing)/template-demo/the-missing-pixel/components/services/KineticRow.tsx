// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";

gsap.registerPlugin(useGSAP);

const WORDS = ["Strategy", "Identity", "Websites", "Motion", "Packaging", "Campaigns"];
const MAX_THROW = 60;

const KineticRow = () => {
  const lenis = useLenis();
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track || prefersReducedMotion()) return;

      const setX = gsap.quickSetter(track, "x", "px");
      const setSkew = gsap.quickSetter(track, "skewX", "deg");
      const state = { x: 0, skew: 0, scrollDir: 1, throwV: 0, dragV: 0, dragging: false, lastX: 0, lastT: 0, visible: true };

      const tick = () => {
        if (!state.visible) return;
        const velocity = lenis ? lenis.velocity : 0;
        if (Math.abs(velocity) > 0.5) state.scrollDir = Math.sign(velocity);
        const target = gsap.utils.clamp(
          -14,
          14,
          velocity * -0.35 + (state.dragging ? state.dragV * -0.25 : state.throwV * -0.2),
        );
        state.skew += (target - state.skew) * 0.12;
        state.throwV *= 0.94;
        if (!state.dragging) {
          state.x += -(1.1 + Math.abs(velocity) * 0.45) * state.scrollDir + state.throwV;
        }
        const half = track.scrollWidth / 2;
        state.x = gsap.utils.wrap(-half, 0, state.x);
        setX(state.x);
        setSkew(state.skew);
      };

      const down = (event: PointerEvent) => {
        state.dragging = true;
        state.lastX = event.clientX;
        state.lastT = performance.now();
        state.dragV = 0;
        section.setPointerCapture(event.pointerId);
      };
      const move = (event: PointerEvent) => {
        if (!state.dragging) return;
        const dx = event.clientX - state.lastX;
        const now = performance.now();
        state.dragV = (dx / Math.max(1, now - state.lastT)) * 16;
        state.lastX = event.clientX;
        state.lastT = now;
        state.x += dx;
      };
      const up = () => {
        if (!state.dragging) return;
        state.throwV = gsap.utils.clamp(-MAX_THROW, MAX_THROW, state.dragV);
        state.dragging = false;
      };

      const observer = new IntersectionObserver(([entry]) => {
        state.visible = entry.isIntersecting;
      });
      observer.observe(section);

      gsap.ticker.add(tick);
      section.addEventListener("pointerdown", down);
      section.addEventListener("pointermove", move);
      section.addEventListener("pointerup", up);
      section.addEventListener("pointercancel", up);

      return () => {
        gsap.ticker.remove(tick);
        observer.disconnect();
        section.removeEventListener("pointerdown", down);
        section.removeEventListener("pointermove", move);
        section.removeEventListener("pointerup", up);
        section.removeEventListener("pointercancel", up);
      };
    },
    { scope: sectionRef, dependencies: [lenis] },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Disciplines: Strategy, Identity, Websites, Motion, Packaging, Campaigns"
      className="flex cursor-grab touch-pan-y select-none flex-col gap-6 overflow-hidden py-[7%] active:cursor-grabbing max-lg:py-[9vw] max-md:py-[14vw]"
    >
      <div ref={trackRef} aria-hidden className="flex w-max">
        {[0, 1].map((group) => (
          <ul key={group} className="flex items-center">
            {WORDS.map((word) => (
              <li key={`${group}-${word}`} className="flex items-center gap-[10vw] pr-[3vw] max-md:gap-[6vw] max-md:pr-[6vw]">
                <span className="font-mpx-head text-128 font-medium leading-none">{word}</span>
               
              </li>
            ))}
          </ul>
        ))}
      </div>
    
    </section>
  );
};

export default KineticRow;
