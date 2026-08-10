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
const SETTLE_DURATION = 1.4;
const CLOSE_DURATION = 0.45;
// Never hold the page longer than this, however slow the load is.
const MAX_WAIT_MS = 3000;

export default function LoaderV3() {
  const [done, setDone] = useState(false);

  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);

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

      const paint = () => {
        if (!counterRef.current) return;
        counterRef.current.textContent = String(
          Math.round(field.progress * 100)
        ).padStart(3, "0");
      };

      const settle = gsap
        .timeline()
        .from(contentRef.current, {
          autoAlpha: 0,
          duration: 0.5,
          ease: "power2.out",
        })
        .to(
          field,
          {
            progress: 0.92,
            duration: SETTLE_DURATION,
            ease: "power1.out",
            onUpdate: paint,
          },
          0
        )
        .to(
          barRef.current,
          { scaleX: 0.92, duration: SETTLE_DURATION, ease: "power1.out" },
          0
        );

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

      Promise.all([settle, capped]).then(() => {
        if (cancelled) return;

        gsap
          .timeline({
            onComplete: () => {
              release();
              setDone(true);
            },
          })
          .to(
            field,
            {
              progress: 1,
              duration: CLOSE_DURATION,
              ease: "power2.inOut",
              onUpdate: paint,
            },
            0
          )
          .to(
            barRef.current,
            { scaleX: 1, duration: CLOSE_DURATION, ease: "power2.inOut" },
            0
          )
          // The mark dissolves back through the same dither it arrived by.
          .to(
            field,
            { exit: 1, duration: 0.55, ease: "power2.in" },
            CLOSE_DURATION + 0.1
          )
          .to(
            contentRef.current,
            { autoAlpha: 0, duration: 0.4, ease: "power2.in" },
            CLOSE_DURATION + 0.2
          )
          // Hands off to the hero as the panel starts moving, so the hero
          // animates in behind the wipe instead of after it.
          .to(
            rootRef.current,
            {
              yPercent: -100,
              duration: 0.9,
              ease: "power4.inOut",
              onStart: markLoaderV3Complete,
            },
            CLOSE_DURATION + 0.4
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
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
