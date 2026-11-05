// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { hasFinePointer } from "../../Animations/reducedMotion";

type ColorfulCursorAuraProps = {
  children: ReactNode;
  className?: string;
  textClassName?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  // Radius of the outer aura in vw; the inner two scale from it
  auraSize?: number;
  followSpeed?: number;
};

// Three coloured circles trail the cursor at different speeds and show through the text only
export default function ColorfulCursorAura({
  children,
  className = "",
  textClassName = "",
  color1 = "#13605d",
  color2 = "#73bea1",
  color3 = "#6ef2b1",
  auraSize = 12,
  followSpeed = 0.12,
}: ColorfulCursorAuraProps) {
  const root = useRef<HTMLDivElement>(null);
  const mask = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const maskEl = mask.current;
    if (!el || !maskEl || !hasFinePointer()) return;
    const trackers = [0, 1, 2].map(() => ({ x: -9999, y: -9999 }));
    const size = { r: 0 };

    const sync = () => {
      trackers.forEach((t, i) => {
        maskEl.style.setProperty(`--aura-x${i}`, `${t.x}px`);
        maskEl.style.setProperty(`--aura-y${i}`, `${t.y}px`);
      });
      maskEl.style.setProperty("--aura-r", String(size.r));
    };
    sync();

    const local = (e: PointerEvent) => {
      const r = maskEl.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onEnter = (e: PointerEvent) => {
      const at = local(e);
      trackers.forEach((t) => Object.assign(t, at));
      gsap.to(size, { r: 1, duration: 0.8, ease: "expo.out", onUpdate: sync, overwrite: "auto" });
    };
    const onMove = (e: PointerEvent) => {
      const at = local(e);
      gsap.to(trackers, {
        ...at,
        duration: Math.min(Math.max(0.06 / followSpeed, 0.04), 2),
        ease: "power1.out",
        stagger: -0.1,
        overwrite: "auto",
        onUpdate: sync,
      });
    };
    const onLeave = () => gsap.to(size, { r: 0, duration: 0.6, ease: "power3.inOut", onUpdate: sync, overwrite: "auto" });

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf([...trackers, size]);
    };
  }, [followSpeed]);

  const circle = (i: number, scale: number, color: string) =>
    `radial-gradient(circle calc(${auraSize * scale}vw * var(--aura-r)) at var(--aura-x${i}) var(--aura-y${i}), ${color} 0 99%, transparent 100%)`;

  return (
    <div ref={root} className={`relative w-fit ${className}`}>
      <span className={`block ${textClassName}`}>{children}</span>
      <span
        ref={mask}
        aria-hidden
        className={`pointer-events-none absolute inset-0 block bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] ${textClassName}`}
        style={
          {
            "--aura-r": 0,
            backgroundImage: [circle(2, 0.42, color3), circle(1, 0.68, color2), circle(0, 1, color1)].join(","),
          } as CSSProperties
        }
      >
        {children}
      </span>
    </div>
  );
}
