"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";

import { prefersReducedMotion } from "@/lib/motion";
import { createAsciiLoaderField } from "./loader-ascii-field";
import { markLoaderV3Complete } from "./loader-v3-state";

const CHAR_COUNT = 8; // H-Y-P-E-R-I-U-X

// The counter runs to 92 on its own, then only closes the last 8 once the page
// has actually finished loading — so the number tracks something real instead
// of sitting at 100 while assets are still coming in.
const SETTLE_DURATION = 1.6;
const CLOSE_DURATION = 0.45;
// Never hold the page longer than this, however slow the load is.
const MAX_WAIT_MS = 3000;

/**
 * Stagger order for the character dissolve: centre characters go last so the
 * word appears to collapse inward. Index order: 0=H 1=Y 2=P 3=E 4=R 5=I 6=U 7=X
 * Dissolve from the edges toward the middle.
 */
const DISSOLVE_ORDER = [0, 7, 1, 6, 2, 5, 3, 4];

export default function LoaderV3() {
  const [done, setDone] = useState(false);

  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  // Mutated by GSAP, read by the field's own render loop.
  // `exits` is an array of 8 floats — one per character of HYPERIUX.
  const fieldRef = useRef({
    progress: 0,
    exits: new Float32Array(CHAR_COUNT),
    globalExit: 0,
  });

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

      // ── Phase 2: Close — finish the counter, then dissolve each letter ──
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

        // Brief beat before letters start dissolving
        const dissolveStart = CLOSE_DURATION + 0.15;

        // Stagger each character's exit — edges first, centre last
        const perCharDuration = 0.5;
        const staggerGap = 0.07;

        DISSOLVE_ORDER.forEach((charIdx, orderIdx) => {
          tl.to(
            field.exits,
            {
              [charIdx]: 1,
              duration: perCharDuration,
              ease: "power2.in",
            },
            dissolveStart + orderIdx * staggerGap
          );
        });

        // Fade out any remaining static noise
        const globalExitStart =
          dissolveStart + (DISSOLVE_ORDER.length - 1) * staggerGap;
        tl.to(
          field,
          {
            globalExit: 1,
            duration: 0.5,
            ease: "power2.in",
          },
          globalExitStart
        );

        // Slide the panel away and hand off to the hero
        tl.to(
          rootRef.current,
          {
            yPercent: -100,
            duration: 0.9,
            ease: "power4.inOut",
            onStart: markLoaderV3Complete,
          },
          globalExitStart + 0.25
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
      className="fixed inset-0 z-1000 overflow-hidden bg-background will-change-transform"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
      />
    </div>
  );
}
