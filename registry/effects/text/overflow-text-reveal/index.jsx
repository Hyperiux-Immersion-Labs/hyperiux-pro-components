// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

// direction: "top" | "bottom" | "left" | "right"
// "bottom" is the original default behavior (yPercent: 100, rotate: 8)
const DIRECTION_INITIAL = {
  top: { yPercent: -100, xPercent: 0, rotate: -8 },
  bottom: { yPercent: 100, xPercent: 0, rotate: 8 },
  left: { yPercent: 0, xPercent: -100, rotate: -8 },
  right: { yPercent: 0, xPercent: 100, rotate: 8 },
};

const REDUCED_MOTION_FADE_DURATION = 0.8;
const REDUCED_MOTION_Y_OFFSET = 24;
const DEFAULT_TEXT = <p>Characters rise from below.</p>;

export default function OverflowTextReveal({
  children = DEFAULT_TEXT,
  animateOnScroll = true,
  delay = 0,
  className = "",
  scrub = false,
  direction = "bottom",
}) {
  const containerRef = useRef(null);
  const splitRefs = useRef([]);
  const charsRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    splitRefs.current = [];
    charsRef.current = [];

    const elements = containerRef.current.hasAttribute("data-copy-wrapper")
      ? Array.from(containerRef.current.children)
      : [containerRef.current];

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ctx;

    const init = async () => {
      await document.fonts.ready;

      ctx = gsap.context(() => {
        elements.forEach((element) => {
          const split = SplitText.create(element, {
            type: "lines,chars",
            mask: "chars",
            charsClass: "char++",
            reduceWhiteSpace: false,
          });

          split.masks?.forEach((mask) => {
            mask.style.paddingInline = "0.04em";
            mask.style.marginInline = "-0.04em";
            mask.style.boxSizing = "content-box";
          });

          splitRefs.current.push(split);
          charsRef.current.push(...split.chars);
        });

        if (prefersReduced) {
          gsap.set(charsRef.current, { yPercent: 0, xPercent: 0, rotate: 0, opacity: 1 });
          gsap.set(containerRef.current, { opacity: 0, y: REDUCED_MOTION_Y_OFFSET });

          const fadeUpProps = {
            opacity: 1,
            y: 0,
            duration: REDUCED_MOTION_FADE_DURATION,
            ease: "power2.out",
            delay,
          };

          if (animateOnScroll) {
            gsap.to(containerRef.current, {
              ...fadeUpProps,
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                once: true,
              },
            });
          } else {
            gsap.to(containerRef.current, fadeUpProps);
          }

          return;
        }

        const initialProps = DIRECTION_INITIAL[direction] ?? DIRECTION_INITIAL.bottom;

        // Reveal the container immediately - opacity-0 was only to prevent FOUC
        // GSAP will handle per-char opacity from here
        gsap.set(containerRef.current, { opacity: 1 });

        const fromProps = {
          ...initialProps,
          opacity: 0,
          willChange: "transform",
        };

        const toProps = {
          yPercent: 0,
          xPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.03,
          ease: "power3.out",
          delay,
        };

        if (animateOnScroll) {
          gsap.fromTo(charsRef.current, fromProps, {
            ...toProps,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
              end: "bottom 68%",
              scrub,
            },
          });
        } else {
          gsap.fromTo(charsRef.current, fromProps, toProps);
        }
      }, containerRef);
    };

    init();

    return () => {
      if (ctx) ctx.revert();
      splitRefs.current.forEach((split) => split?.revert());
    };
  }, [animateOnScroll, delay, scrub, direction]);

  return (
    <div ref={containerRef} data-copy-wrapper="true" className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
}
