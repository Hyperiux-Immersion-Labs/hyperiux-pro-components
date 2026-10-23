// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { hasFinePointer, prefersReducedMotion } from "../Animations/reducedMotion";

const FILL_TARGETS = "h1, h2, [data-cursor-fill]";
const INTERACTIVE_TARGETS = "a, button, summary, label, [role='button']";
const TEXT_TARGETS = "input, textarea, select";

const subscribe = (onChange: () => void) => {
  const queries = [
    window.matchMedia("(hover: hover) and (pointer: fine)"),
    window.matchMedia("(prefers-reduced-motion: reduce)"),
  ];
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
};

const getEnabled = () => hasFinePointer() && !prefersReducedMotion();

const Cursor = () => {
  const enabled = useSyncExternalStore(subscribe, getEnabled, () => false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const wrap = wrapRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!wrap || !ring || !dot || !label) return;

    const pointer = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    const labelPos = { x: -100, y: -100 };
    const scale = { ring: 1, ringTarget: 1, dot: 1, dotTarget: 1, label: 0, labelTarget: 0 };
    let visible = false;
    let lastCheck = 0;

    const setState = (target: Element | null) => {
      let fill = false;
      scale.labelTarget = 0;

      if (!target) {
        scale.ringTarget = 1;
        scale.dotTarget = 1;
      } else if (target.closest(TEXT_TARGETS)) {
        scale.ringTarget = 0;
        scale.dotTarget = 0;
      } else if (target.closest("[data-cursor]")) {
        label.textContent =
          target.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
        scale.ringTarget = 0;
        scale.dotTarget = 0;
        scale.labelTarget = 1;
      } else if (target.closest(INTERACTIVE_TARGETS)) {
        scale.ringTarget = 1.5;
        scale.dotTarget = 0;
        fill = true;
      } else if (target.closest(FILL_TARGETS)) {
        scale.ringTarget = 2.6;
        scale.dotTarget = 0;
        fill = true;
      } else {
        scale.ringTarget = 1;
        scale.dotTarget = 1;
      }

      ring.classList.toggle("bg-(--mpx-white)", fill);
      ring.classList.toggle("border-0", fill);
    };

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = labelPos.x = pointer.x;
        ringPos.y = labelPos.y = pointer.y;
        wrap.classList.replace("opacity-0", "opacity-100");
      }
      setState(event.target as Element);
    };

    const handleLeave = () => {
      visible = false;
      scale.labelTarget = 0;
      wrap.classList.replace("opacity-100", "opacity-0");
    };

    const handleDown = () => {
      scale.ring *= 0.7;
    };

    const handleScroll = () => {
      const now = performance.now();
      if (!visible || now - lastCheck < 90) return;
      lastCheck = now;
      setState(document.elementFromPoint(pointer.x, pointer.y));
    };

    const tick = () => {
      ringPos.x += (pointer.x - ringPos.x) * 0.2;
      ringPos.y += (pointer.y - ringPos.y) * 0.2;
      labelPos.x += (pointer.x - labelPos.x) * 0.2;
      labelPos.y += (pointer.y - labelPos.y) * 0.2;
      scale.ring += (scale.ringTarget - scale.ring) * 0.2;
      scale.dot += (scale.dotTarget - scale.dot) * 0.3;
      scale.label += (scale.labelTarget - scale.label) * 0.2;

      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%) scale(${scale.dot.toFixed(3)})`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale.ring.toFixed(3)})`;
      label.style.transform = `translate3d(${labelPos.x}px, ${labelPos.y}px, 0) translate(-50%, -50%) scale(${scale.label.toFixed(3)})`;
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
      gsap.ticker.remove(tick);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={wrapRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-200 h-0 w-0 opacity-0 mix-blend-difference transition-opacity duration-300"
      >
        <div
          ref={ringRef}
          className="absolute left-0 top-0 size-[2.1vw] rounded-full border-[0.1vw] border-(--mpx-white) transition-[background-color,border-width] duration-300 will-change-transform"
        />
        <div
          ref={dotRef}
          className="absolute left-0 top-0 size-[0.4vw] rounded-full bg-(--mpx-white) will-change-transform"
        />
      </div>
      <div
        ref={labelRef}
        aria-hidden
        className="font-mpx-head pointer-events-none fixed left-0 top-0 z-201 flex size-[5.6vw] items-center justify-center rounded-full bg-mpx-ink p-3 text-center text-14 font-semibold leading-[1.1] text-mpx-paper will-change-transform"
      />
    </>
  );
};

export default Cursor;
