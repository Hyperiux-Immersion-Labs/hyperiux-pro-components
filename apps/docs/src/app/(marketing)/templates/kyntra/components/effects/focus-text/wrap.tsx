"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);

// Same curve as the standalone FocusText section.
const FOCUS_EASE = CustomEase.create("focusTextWrapEase", "0.16,1,0.3,1");

const REDUCED_MOTION_DURATION = 0.3;

interface FocusTextWrapProps {
 
  children: ReactNode;
  className?: string;
  characterStagger?: number;
  revealDuration?: number;
  delay?: number;
  startScale?: number;
  blurAmount?: number;

  scrub?: boolean;
  scrollStart?: string;
  scrollEnd?: string;
}


export default function FocusTextWrap({
  children,
  className = "",
  characterStagger = 0.02,
  revealDuration = 1.1,
  delay = 0,
  startScale = 0.4,
  blurAmount = 0,
  scrub = false,
  scrollStart = "top 85%",
  scrollEnd = "bottom 55%",
}: FocusTextWrapProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const target = root.firstElementChild as HTMLElement | null;
    if (!target) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let split: SplitText | null = null;

    const ctx = gsap.context(() => {

      split = SplitText.create(target, {
        type: "words,chars",
        wordsClass: "focus-word",
      });
      const characters = split.chars;

      if (!characters.length) {
     
        gsap.set(target, { opacity: 1 });
        return;
      }

    
      gsap.set(characters, {
        opacity: 0,
        ...(prefersReducedMotion
          ? {}
          : { scale: startScale, filter: `blur(${blurAmount}px)` }),
      });
      gsap.set(target, { opacity: 1 });

      if (prefersReducedMotion) {
      
        gsap.to(characters, {
          opacity: 1,
          duration: REDUCED_MOTION_DURATION,
          delay,
          ease: "none",
          scrollTrigger: {
            trigger: target,
            start: scrollStart,
            once: true,
          },
        });
        return;
      }

      gsap.to(characters, {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: revealDuration,
        delay: scrub ? 0 : delay,
        stagger: characterStagger,
        ease: FOCUS_EASE,
        force3D: true,
        scrollTrigger: scrub
          ? {
              trigger: target,
              start: scrollStart,
              end: scrollEnd,
              scrub: true,
            }
          : {
              trigger: target,
              start: scrollStart,
              once: true,
            },
      });
    }, root);

    return () => {
      ctx.revert();
      split?.revert();
      split = null;
    };
  }, [
    characterStagger,
    revealDuration,
    delay,
    startScale,
    blurAmount,
    scrub,
    scrollStart,
    scrollEnd,
  ]);

  const child = isValidElement<{ className?: string }>(children)
    ? cloneElement(children, {
        className: `${children.props.className ?? ""} opacity-0`.trim(),
      })
    : children;

  return (
    <div ref={rootRef} className={className} style={{ display: "contents" }}>
      {child}
    </div>
  );
}
