"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

// Animation timing
const STRIP_COUNT = 12;
const REVEAL_DURATION = 0.5;
const STRIP_STAGGER = 0.04;
const ZOOM_DURATION = 0.9;
const ZOOM_FROM = 1.2;
const TITLE_CHAR_DURATION = 0.6;
const TITLE_CHAR_STAGGER = 0.04;
const TITLE_CHAR_Y_PERCENT = 100;
const PROGRESS_DURATION = 0.9;

type Slide = {
  src: string;
  title: string;
  chapter?: string;
};

type ParallaxStripSliderProps = {
  slides: Slide[];
  className?: string;
  stripCount?: number;
};

type TransitionDirection = "next" | "prev";

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function ArrowIcon({
  dir,
  className = "",
}: {
  dir: TransitionDirection;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d={dir === "prev" ? "M10 3L5 8L10 13" : "M6 3L11 8L6 13"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ParallaxStripSlider({
  slides,
  className = "",
  stripCount = STRIP_COUNT,
}: ParallaxStripSliderProps) {
  const [current, setCurrent] = useState(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [caption, setCaption] = useState(0);
  const [direction, setDirection] = useState<TransitionDirection>("next");
  const rootRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const counterNumRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stripsRef = useRef<HTMLDivElement[]>([]);
  const zoomRef = useRef<HTMLDivElement[]>([]);
  const isAnimating = useRef(false);
  const isFirstCaption = useRef(true);
  const splitRef = useRef<SplitText | null>(null);

  const total = slides.length;

  const goTo = useCallback(
    (next: number, transitionDirection: TransitionDirection) => {
      if (isAnimating.current || next === current || total < 2) return;
      isAnimating.current = true;
      setDirection(transitionDirection);
      setIncoming(next);
    },
    [current, total]
  );

  const onNext = useCallback(
    () => goTo((current + 1) % total, "next"),
    [current, total, goTo]
  );
  const onPrev = useCallback(
    () => goTo((current - 1 + total) % total, "prev"),
    [current, total, goTo]
  );

  // Wipe + zoom + progress on slide change.
  useGSAP(
    () => {
      if (incoming === null) return;

      const strips = stripsRef.current.slice(0, stripCount).filter(Boolean);
      const zooms = zoomRef.current.slice(0, stripCount).filter(Boolean);
      if (!strips.length) return;
      const isPrevious = direction === "prev";
      const orderedStrips = isPrevious ? [...strips].reverse() : strips;

      // Reduced motion: swap without the reveal.
      if (prefersReducedMotion()) {
        setCaption(incoming);
        setCurrent(incoming);
        setIncoming(null);
        isAnimating.current = false;
        return;
      }

      const settle = () => {
        setCaption(incoming);
        setCurrent(incoming);
        setIncoming(null);
        isAnimating.current = false;
      };

      const tl = gsap.timeline({ onComplete: settle });

      // Reverse stagger + clip origin when moving backward.
      tl.fromTo(
        orderedStrips,
        { clipPath: isPrevious ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
        {
          clipPath: isPrevious ? "inset(0 0 0 0%)" : "inset(0 0% 0 0)",
          duration: REVEAL_DURATION,
          ease: "power3.out",
          stagger: STRIP_STAGGER,
        },
        0
      );

      tl.fromTo(
        zooms,
        { scale: ZOOM_FROM },
        {
          scale: 1,
          duration: ZOOM_DURATION,
          ease: "power3.out",
        },
        0
      );

      // Bar slides toward the incoming fill.
      if (progressRef.current) {
        tl.to(
          progressRef.current,
          {
            scaleX: (incoming + 1) / total,
            duration: PROGRESS_DURATION,
            ease: "power3.inOut",
          },
          0
        );
      }

      // Outgoing caption texts fade out under the strips.
      const outgoing = [
        captionRef.current,
        titleRef.current,
        counterRef.current,
      ].filter(Boolean);
      if (outgoing.length) {
        tl.to(
          outgoing,
          {
            autoAlpha: 0,
            y: -2,
            duration: 0.35,
            ease: "power2.in",
          },
          0.15
        );
        tl.add(() => setCaption(incoming), 0.5);
      }
    },
    { dependencies: [incoming, direction, stripCount], scope: rootRef }
  );

  // Revert the split before React commits the new title.
  useLayoutEffect(() => {
    splitRef.current?.revert();
    splitRef.current = null;
  }, [caption]);

  // Incoming caption reveal: title chars, chapter fade, counter number.
  useGSAP(
    () => {
      if (isFirstCaption.current) {
        isFirstCaption.current = false;
        return;
      }
      if (!captionRef.current || !titleRef.current) return;

      // Snap back what the outgoing tween hid.
      gsap.set([captionRef.current, titleRef.current], { autoAlpha: 1, y: 0 });

      if (prefersReducedMotion()) {
        gsap.set(
          [chapterRef.current, titleRef.current, counterRef.current, counterNumRef.current],
          { autoAlpha: 1, y: 0, yPercent: 0 }
        );
        return;
      }

      // Chars only — no line/mask wrappers that shift metrics.
      const split = new SplitText(titleRef.current, { type: "chars" });
      splitRef.current = split;

      const tl = gsap.timeline({
        // Restore plain <h2> once the reveal is done.
        onComplete: () => {
          split.revert();
          if (splitRef.current === split) splitRef.current = null;
        },
      });

      // Title: char stagger up from below the clip.
      tl.from(
        split.chars,
        {
          yPercent: TITLE_CHAR_Y_PERCENT,
          duration: TITLE_CHAR_DURATION,
          ease: "power2.out",
          stagger: TITLE_CHAR_STAGGER,
        },
        0
      );

      // Chapter: fade only.
      if (chapterRef.current) {
        tl.fromTo(
          chapterRef.current,
          { autoAlpha: 0, y: 0 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
          0
        );
      }

      // Counter: fade block, lift just the number.
      if (counterRef.current) {
        tl.fromTo(
          counterRef.current,
          { autoAlpha: 0, y: 0 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
          0
        );
      }
      if (counterNumRef.current) {
        tl.from(
          counterNumRef.current,
          {
            yPercent: 110,
            duration: 0.55,
            ease: "power3.out",
          },
          0
        );
      }
    },
    { dependencies: [caption], scope: rootRef }
  );

  // Drop the last live split on unmount.
  useGSAP(
    () => () => {
      splitRef.current?.revert();
      splitRef.current = null;
    },
    { scope: rootRef }
  );

  const renderStrips = (slide: Slide) => {
    const width = 100 / stripCount;

    return Array.from({ length: stripCount }, (_, i) => (
      <div
        key={i}
        ref={(el) => {
          if (el) stripsRef.current[i] = el;
        }}
        className="absolute inset-y-0 overflow-hidden"
        style={{
          left: `${i * width}%`,
          width: `${width}%`,
          // Cover the seam between neighbours.
          marginLeft: i === 0 ? 0 : "-0.5px",
          paddingLeft: i === 0 ? 0 : "0.5px",
        }}
      >
        {/* Full-width image pulled back by this strip's offset. */}
        <div
          className="absolute inset-y-0"
          style={{
            left: `-${i * 100}%`,
            width: `${stripCount * 100}%`,
          }}
        >
          <div
            ref={(el) => {
              if (el) zoomRef.current[i] = el;
            }}
            className="relative h-full w-full will-change-transform"
          >
            <Image
              src={slide.src}
              alt=""
              fill
              sizes="100vw"
              draggable={false}
              className="object-cover select-none"
            />
          </div>
        </div>
      </div>
    ));
  };

  const activeSlide = slides[caption];

  return (
    <div
      ref={rootRef}
      className={`parallax-strip-slider relative h-full w-full overflow-hidden bg-black ${className}`}
    >
      {/* Outgoing slide, revealed away underneath. */}
      <div className="absolute inset-0">
        <Image
          src={slides[current].src}
          alt={slides[current].title}
          fill
          priority
          sizes="100vw"
          draggable={false}
          className="object-cover select-none"
        />
      </div>

      {/* Incoming slide, mounted only during a transition. */}
      {incoming !== null && (
        <div className="absolute inset-0">{renderStrips(slides[incoming])}</div>
      )}

      {/* Top progress bar, floating over the image. */}
      <div className="pointer-events-none absolute inset-x-10 top-7 z-10 h-px bg-white/20">
        <div
          ref={progressRef}
          className="h-full w-full origin-left bg-white"
          style={{ transform: `scaleX(${(caption + 1) / total})` }}
        />
      </div>

      {/* Top-left label */}
      <div
        ref={captionRef}
        className="pointer-events-none absolute inset-x-0 top-0 p-10"
      >
        <span
          ref={chapterRef}
          className="block text-xs font-medium tracking-wide text-white"
        >
          {activeSlide.chapter ??
            `Collection ${String(caption + 1).padStart(2, "0")}`}
        </span>
      </div>

      {/* Bottom bar: three fixed thirds on one line; on mobile it stacks with
          the title + counter above and the controls below. */}
      <div className="absolute inset-x-0 bottom-0 flex items-end px-10 pb-10 max-[1025px]:flex-col max-[1025px]:items-stretch max-[1025px]:gap-6">
        <h2
          ref={titleRef}
          className="pointer-events-none w-1/3 shrink-0 overflow-hidden text-8xl leading-none text-white flex items-end max-[1025px]:order-1 max-[1025px]:w-full"
          style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
        >
          {activeSlide.title}
        </h2>

        {/* Controls */}
        <div className="flex w-1/3 shrink-0 items-end justify-center gap-2 max-[1025px]:order-3 max-[1025px]:w-full max-[1025px]:justify-center">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous slide"
            className="group flex size-11 items-center justify-center rounded-full border  border-white/25 bg-white/5 text-white backdrop-blur-md transition-all duration-300   active:scale-95"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
              <ArrowIcon dir="prev" className="size-4" />
            </span>
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next slide"
            className="group flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white backdrop-blur-md transition-all duration-300   active:scale-95"
          >
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowIcon dir="next" className="size-4" />
            </span>
          </button>
        </div>

        <span
          ref={counterRef}
          className="pointer-events-none flex w-1/3 pb-5 shrink-0 h-full items-center  pt-5! justify-end text-xs text-white/70 max-[1025px]:order-2 max-[1025px]:h-auto max-[1025px]:w-full max-[1025px]:justify-start max-[1025px]:p-0"
        >
          {/* Fixed-width clip so the number can lift in without reflow. */}
          <span className="inline-block w-[2ch] overflow-hidden text-right">
            <span ref={counterNumRef} className="inline-block">
              {String(caption + 1).padStart(2, "0")}
            </span>
          </span>
          <span> / {String(total).padStart(2, "0")}</span>
        </span>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap");
      `}</style>
    </div>
  );
}
