"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

const REDUCED_MOTION_FADE_DURATION = 0.8;
const REDUCED_MOTION_Y_OFFSET = 24;
const DEFAULT_TEXT = <p>Slide from right.</p>;

export default function SlideTextReveal({
  children = DEFAULT_TEXT,
  animateOnScroll = true,
  delay = 0,
  className = "",
  start = "top 80%",
  end = "bottom 60%",
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
            charsClass: "char++",
            reduceWhiteSpace: false,
          });

          splitRefs.current.push(split);
          charsRef.current.push(...split.chars);
        });

        if (prefersReduced) {
          gsap.set(charsRef.current, { x: 0, opacity: 1 });
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
                start,
                end,
                scrub: false,
              },
            });
          } else {
            gsap.to(containerRef.current, fadeUpProps);
          }

          return;
        }

        gsap.set(containerRef.current, {
          opacity: 1,
        });

        gsap.set(charsRef.current, {
          x: 20,
          opacity: 0,
          willChange: "transform",
        });

        const animationProps = {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.03,
          ease: "power3.out",
          delay,
        };

        if (animateOnScroll) {
          gsap.to(charsRef.current, {
            ...animationProps,
            scrollTrigger: {
              trigger: containerRef.current,
              start,
              end,
              scrub: false,
              // markers: true,
            },
          });
        } else {
          gsap.to(charsRef.current, animationProps);
        }
      }, containerRef);
    };

    init();

    return () => {
      if (ctx) ctx.revert();
      splitRefs.current.forEach((split) => split?.revert());
    };
  }, [animateOnScroll, delay, start, end]);

  return (
    <div
      ref={containerRef}
      data-copy-wrapper="true"
      className={`opacity-0 ${className}`}
    >
      {children}
    </div>
  );
}