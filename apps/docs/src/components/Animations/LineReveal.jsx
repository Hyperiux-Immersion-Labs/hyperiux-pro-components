"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, ScrollTrigger);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : () => {};

function waitForFontsAndLayout() {
  return new Promise(async (resolve) => {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

function isInViewport(element) {
  if (!element || typeof window === "undefined") return false;

  const rect = element.getBoundingClientRect();

  return rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
}

export default function LineReveal({
  text,
  children,
  as = "div",
  className = "",
  direction = "next",
  animateOnScroll = true,
  start = "top 85%",
  delay = 0,
  duration = 0.85,
  stagger = 0.15,
  animationKey = "",
  ...rest
}) {
  const containerRef = useRef(null);
  const splitRef = useRef(null);
  const tweenRef = useRef(null);
  const triggerRef = useRef(null);
  const refreshRef = useRef(null);
  const runIdRef = useRef(0);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const runId = ++runIdRef.current;

    tweenRef.current?.kill();
    triggerRef.current?.kill();
    refreshRef.current?.kill();
    splitRef.current?.revert();
    splitRef.current = null;

    let isKilled = false;

    gsap.set(container, {
      autoAlpha: 0,
    });

    const run = async () => {
      await waitForFontsAndLayout();

      if (isKilled || runId !== runIdRef.current || !containerRef.current) {
        return;
      }

      splitRef.current = SplitText.create(container, {
        type: "lines",
        mask: "lines",
        linesClass: "line++",
        aria: "none",
      });

      const lines = splitRef.current.lines;

      if (!lines.length) {
        gsap.set(container, {
          autoAlpha: 1,
        });

        return;
      }

      const yFrom = direction === "next" ? 110 : -110;

      gsap.set(lines, {
        yPercent: yFrom,
        willChange: "transform",
      });

      gsap.set(container, {
        autoAlpha: 1,
      });

      tweenRef.current = gsap.to(lines, {
        yPercent: 0,
        duration,
        ease: "power2.out",
        delay,
        stagger: {
          each: stagger,
          from: direction === "next" ? "start" : "end",
        },
        paused: animateOnScroll,
        onComplete: () => {
          gsap.set(lines, {
            clearProps: "willChange",
          });

          refreshRef.current?.kill();
          refreshRef.current = gsap.delayedCall(0.05, () => {
            ScrollTrigger.refresh(true);
          });
        },
      });

      if (!animateOnScroll) {
        tweenRef.current.play(0);
        return;
      }

      triggerRef.current = ScrollTrigger.create({
        trigger: container,
        start,
        once: true,
        invalidateOnRefresh: true,
        // markers:true,
        onEnter: () => {
          tweenRef.current?.play(0);
        },
      });

      refreshRef.current?.kill();
      refreshRef.current = gsap.delayedCall(0.2, () => {
        ScrollTrigger.refresh(true);

        if (isInViewport(container) && tweenRef.current?.progress() === 0) {
          tweenRef.current.play(0);
          triggerRef.current?.kill();
          triggerRef.current = null;
        }
      });
    };

    run();

    return () => {
      isKilled = true;

      tweenRef.current?.kill();
      triggerRef.current?.kill();
      refreshRef.current?.kill();
      splitRef.current?.revert();
      splitRef.current = null;

      if (container) {
        gsap.set(container, {
          clearProps: "visibility,opacity,transform",
        });
      }
    };
  }, [text, direction, animateOnScroll, start, delay, duration, stagger, animationKey]);

  return React.createElement(
    as,
    { ref: containerRef, className, style: { opacity: 0 }, ...rest },
    text ?? children
  );
}
