"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";

import { prefersReducedMotion } from "@/lib/motion";
import { createAsciiLoaderField } from "./loader-ascii-field";
import { markLoaderV3Complete } from "./loader-v3-state";

// The counter runs to 92 on its own, then only closes the last 8 once the page
// has actually finished loading — so the number tracks something real instead
// of sitting at 100 while assets are still coming in.
const SETTLE_DURATION = 1.6;
const CLOSE_DURATION = 0.45;
// Never hold the page longer than this, however slow the load is.
const MAX_WAIT_MS = 3000;

// Exit: one scalar drives the whole burst. The field hands each cell its own
// start time and direction out of this, so the mark breaks apart rather than
// unwinding letter by letter.
//
// Eased with "none" — the field's geometry is linear in this scalar, so a
// linear scalar is what gives every glyph constant outward velocity. Any ease
// here would make the burst surge or coast and read as a dissolve again.
const BURST_DURATION = 1.8;
// The black backing clears over the first part of the burst, uncovering the
// hero underneath while the glyphs are still crossing it. That overlap is the
// join between the two ASCII fields — hold the backdrop to the end instead and
// the loader reads as a panel that fades, not as a field that hands over.
const BACKDROP_LEAD = 0.1;
const BACKDROP_DURATION = 0.75;

export default function LoaderV3() {
  const [done, setDone] = useState(false);

  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const canvasRef = useRef(null);

  // Mutated by GSAP, read by the field's own render loop.
  const fieldRef = useRef({ progress: 0, exit: 0 });

  const lenis = useLenis();

  useGSAP(
    () => {
      let cancelled = false;
      let waitTimeout = 0;

      const release = () => {
        document.documentElement.style.overflow = "";
        lenis?.start?.();
      };

      if (prefersReducedMotion()) {
        markLoaderV3Complete();
        setDone(true);
        return;
      }

      document.documentElement.style.overflow = "hidden";
      lenis?.stop?.();

      const field = fieldRef.current;
      const destroyField = createAsciiLoaderField(canvasRef.current, field);

      // ── Phase 1: Build — progress runs 0 → 0.92 while the page loads ──
      const settle = gsap
        .timeline()
        .to(field, {
          progress: 0.92,
          duration: SETTLE_DURATION,
          ease: "power1.out",
        });

      const pageReady = new Promise((resolve) => {
        if (document.readyState === "complete") {
          resolve();
          return;
        }
        window.addEventListener("load", resolve, { once: true });
      });

      const capped = Promise.race([
        pageReady,
        new Promise((resolve) => {
          waitTimeout = window.setTimeout(resolve, MAX_WAIT_MS);
        }),
      ]);

      // ── Phase 2: Close — finish the counter, burst the field, uncover hero ──
      Promise.all([settle, capped]).then(() => {
        if (cancelled) return;

        const tl = gsap.timeline({
          onComplete: () => {
            release();
            setDone(true);
          },
        });

        // Finish the progress counter → 100
        tl.to(field, {
          progress: 1,
          duration: CLOSE_DURATION,
          ease: "power2.inOut",
        });

        // Brief beat, then the field bursts outward from the centre
        const burstStart = CLOSE_DURATION + 0.15;

        tl.to(
          field,
          {
            exit: 1,
            duration: BURST_DURATION,
            ease: "none",
            onStart: () => {
              // Stop swallowing clicks the moment the panel starts clearing.
              gsap.set(rootRef.current, { pointerEvents: "none" });
              // Hand off at the *start* of the burst, not the end: the hero's
              // own ASCII field needs to be coming up underneath while these
              // glyphs are still crossing the screen, or the two read as two
              // effects in sequence instead of one continuous field.
              markLoaderV3Complete();
            },
          },
          burstStart
        );

        tl.to(
          backdropRef.current,
          {
            opacity: 0,
            duration: BACKDROP_DURATION,
            ease: "power2.inOut",
          },
          burstStart + BACKDROP_LEAD
        );
      });

      return () => {
        cancelled = true;
        window.clearTimeout(waitTimeout);
        destroyField();
        release();
      };
    },
    { scope: rootRef }
  );

  if (done) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-1000 overflow-hidden"
    >
      {/* Separate layer from the canvas so it can clear on its own — the
          glyphs have to stay at full strength while they burst across the
          hero, which a fade on the whole panel would take out with it. */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-background will-change-[opacity]"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
      />
    </div>
  );
}
