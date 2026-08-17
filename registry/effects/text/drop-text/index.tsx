// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";

type StaggerFrom = "left" | "right" | "center" | "random";
type SplitBy = "characters" | "words" | "lines";
type TextAlign = "left" | "center" | "right";
type DropTextVariant = "drop" | "perspective";
type DropTextEase =
  | "linear"
  | "power2.out"
  | "power2.in"
  | "power2.inOut"
  | "back.out(1.7)"
  | "circ.out"
  | "expo.out";

type DropTextProps = {
  text?: string;
  variant?: DropTextVariant;
  splitBy?: SplitBy;
  staggerFrom?: StaggerFrom;
  xOffset?: number;
  yOffset?: number;
  rotate?: number;
  blur?: number;
  scaleFrom?: number;
  startOpacity?: number;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: CSSProperties["fontWeight"];
  textAlign?: TextAlign;
  lineHeight?: number;
  letterSpacing?: number;
  backgroundColor?: string;
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: DropTextEase;
  animateOnScroll?: boolean;
  className?: string;
};

const DEFAULT_TEXT = "Drop Text";

function mapStaggerFrom(staggerFrom: StaggerFrom) {
  if (staggerFrom === "left") return "start";
  if (staggerFrom === "right") return "end";
  return staggerFrom;
}

function splitText(text: string, splitBy: SplitBy) {
  if (splitBy === "lines") {
    return text.split(/\n/).map((line, index, lines) => ({
      value: line,
      separator: index < lines.length - 1 ? "\n" : "",
    }));
  }

  if (splitBy === "words") {
    const matches = text.match(/\S+\s*/g);
    return (matches ?? [text]).map((word) => ({
      value: word.trimEnd(),
      separator: word.endsWith(" ") ? "\u00a0" : "",
    }));
  }

  return Array.from(text).map((character) => ({
    value: character === " " ? "\u00a0" : character,
    separator: "",
  }));
}

export default function DropText({
  text = DEFAULT_TEXT,
  variant = "drop",
  splitBy = "characters",
  staggerFrom = "random",
  xOffset = 0,
  yOffset = -115,
  rotate = 0,
  blur = 0,
  scaleFrom = 1,
  startOpacity = 0,
  fontSize = 9,
  fontColor = "#ffffff",
  fontWeight = 600,
  textAlign = "center",
  lineHeight = 1,
  letterSpacing = 0,
  backgroundColor = "#101113",
  duration = 0.5,
  delay = 0,
  stagger = 0.05,
  ease = "power2.out",
  animateOnScroll = false,
  className = "",
}: DropTextProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const segments = useMemo(() => splitText(text, splitBy), [text, splitBy]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mediaQuery) return;

    setPrefersReducedMotion(mediaQuery.matches);

    const onReduceMotionChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener?.("change", onReduceMotionChange);

    return () => {
      mediaQuery.removeEventListener?.("change", onReduceMotionChange);
    };
  }, []);

  const playAnimation = useCallback(() => {
    if (!containerRef.current) return;
    const pieces = containerRef.current.querySelectorAll<HTMLElement>("[data-drop-piece]");

    gsap.killTweensOf(pieces);
    gsap.set(pieces, { clearProps: "transform,opacity,filter" });

    if (prefersReducedMotion) {
      gsap.set(pieces, {
        x: 0,
        y: 0,
        z: 0,
        rotate: 0,
        rotateX: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
      });
      return;
    }

    gsap.from(pieces, {
      x: xOffset,
      y: yOffset,
      z: variant === "perspective" ? -420 : 0,
      rotate,
      rotateX: variant === "perspective" ? 68 : 0,
      scale: scaleFrom,
      opacity: startOpacity,
      filter: `blur(${blur}px)`,
      duration,
      delay,
      stagger: {
        each: stagger,
        from: mapStaggerFrom(staggerFrom),
      },
      ease,
    });
  }, [blur, delay, duration, ease, prefersReducedMotion, rotate, scaleFrom, stagger, staggerFrom, startOpacity, variant, xOffset, yOffset]);

  useEffect(() => {
    if (!animateOnScroll) {
      playAnimation();
      return () => {
        if (!containerRef.current) return;
        const pieces = containerRef.current.querySelectorAll<HTMLElement>("[data-drop-piece]");
        gsap.killTweensOf(pieces);
      };
    }

    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          playAnimation();
        }
      },
      { threshold: 0.45 },
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      if (!containerRef.current) return;
      const pieces = containerRef.current.querySelectorAll<HTMLElement>("[data-drop-piece]");
      gsap.killTweensOf(pieces);
    };
  }, [animateOnScroll, playAnimation, segments]);

  return (
    <section
      ref={sectionRef}
      className={`flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-16 ${className}`}
      style={{
        backgroundColor,
        perspective: variant === "perspective" ? "900px" : undefined,
      }}
    >
      <h2
        ref={containerRef}
        className="m-0 block w-full select-none whitespace-pre-wrap"
        style={{
          color: fontColor,
          fontSize: `${fontSize}vw`,
          fontWeight,
          letterSpacing: `${letterSpacing}em`,
          lineHeight,
          textAlign,
          transformStyle: variant === "perspective" ? "preserve-3d" : undefined,
        }}
      >
        {segments.map((segment, index) => (
          <span
            key={`${segment.value}-${index}`}
            data-drop-piece
            className={splitBy === "lines" ? "block" : "inline-block"}
            style={{
              backfaceVisibility: variant === "perspective" ? "hidden" : undefined,
              transformStyle: variant === "perspective" ? "preserve-3d" : undefined,
            }}
          >
            {segment.value}
            {segment.separator}
          </span>
        ))}
      </h2>
    </section>
  );
}
