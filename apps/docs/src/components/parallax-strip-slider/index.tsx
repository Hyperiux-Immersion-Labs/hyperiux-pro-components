"use client";

import React, { useCallback, useRef, useState } from "react";
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
// Incoming caption: SplitText line reveal from the y-axis.
const TITLE_LINE_DURATION = 0.75;
const TITLE_LINE_STAGGER = 0.09;
const TITLE_LINE_Y_PERCENT = 110;

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

export default function ParallaxStripSlider({
  slides,
  className = "",
  stripCount = STRIP_COUNT,
}: ParallaxStripSliderProps) {
  // State and refs
  const [current, setCurrent] = useState(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [caption, setCaption] = useState(0);
  const [direction, setDirection] = useState<TransitionDirection>("next");
  const rootRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const stripsRef = useRef<HTMLDivElement[]>([]);
  const zoomRef = useRef<HTMLDivElement[]>([]);
  const isAnimating = useRef(false);
  const isFirstCaption = useRef(true);

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

  // Runs once the incoming layer has mounted, so the strips exist to animate.
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

      // Reverse both the stagger and clip origin when moving backward, so the
      // wipe sweeps right-to-left on "prev" and each strip peels from its right edge.
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

      // Zoom starts on the same frame as the first strip so the image is
      // already settling as the leading strips wipe open.
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

      // Outgoing caption texts fade out under cover of the strips. The incoming
      // texts are animated separately, by the SplitText effect keyed on `caption`.
      if (captionRef.current) {
        tl.to(
          [captionRef.current, counterRef.current],
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

  // Incoming caption reveal: fired after `caption` swaps and the new text has
  // rendered. Fades the caption block back in and drops the title in line by
  // line from the y-axis with SplitText.
  useGSAP(
    () => {
      if (isFirstCaption.current) {
        isFirstCaption.current = false;
        return;
      }
      const targets = [
        chapterRef.current,
        titleRef.current,
        counterRef.current,
      ].filter((el): el is HTMLElement => el !== null);
      if (!captionRef.current || !targets.length) return;

      if (prefersReducedMotion()) {
        gsap.set([captionRef.current, counterRef.current], {
          autoAlpha: 1,
          y: 0,
        });
        return;
      }

      // `mask: "lines"` wraps every line in its own overflow-clip box, so each
      // line rises into view from below its own mask on the y-axis. All three
      // caption texts — chapter label, title, counter — get the same reveal.
      const split = new SplitText(targets, {
        type: "lines",
        mask: "lines",
      });

      const tl = gsap.timeline({
        onComplete: () => split.revert(),
      });

      tl.fromTo(
        [captionRef.current, counterRef.current],
        { autoAlpha: 0, y: 0 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.inOut" },
        0
      );

      tl.from(
        split.lines,
        {
          yPercent: TITLE_LINE_Y_PERCENT,
          duration: TITLE_LINE_DURATION,
          ease: "power3.out",
          stagger: TITLE_LINE_STAGGER,
        },
        0
      );
    },
    { dependencies: [caption], scope: rootRef }
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
          // Cover the seam between neighbours so no hairline shows through.
          marginLeft: i === 0 ? 0 : "-0.5px",
          paddingLeft: i === 0 ? 0 : "0.5px",
        }}
      >
        {/* Sized to the full slider and pulled back by the strip's own offset,
            so every strip shows its correct slice of one shared image. */}
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
            className="h-full w-full will-change-transform"
          >
            <img
              src={slide.src}
              alt=""
              draggable={false}
              className="h-full w-full object-cover select-none"
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
      className={`relative h-full w-full overflow-hidden bg-black ${className}`}
    >
      {/* Outgoing slide sits underneath, untouched, and is revealed away. */}
      <div className="absolute inset-0">
        <img
          src={slides[current].src}
          alt={slides[current].title}
          draggable={false}
          className="h-full w-full object-cover select-none"
        />
      </div>

      {/* Incoming slide, only mounted while a transition is running. */}
      {incoming !== null && (
        <div className="absolute inset-0">{renderStrips(slides[incoming])}</div>
      )}

      {/* Overlays */}
      <div
        ref={captionRef}
        className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-10"
      >
        <span ref={chapterRef} className="text-xs tracking-wide text-white/70">
          {activeSlide.chapter ?? `Chapter ${String(caption + 1).padStart(2, "0")}`}
        </span>
        <h2
          ref={titleRef}
          className="text-5xl font-light text-white md:text-7xl"
        >
          {activeSlide.title}
        </h2>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 md:bottom-10">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous slide"
          className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
        >
          <span aria-hidden="true">&#8249;</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next slide"
          className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
        >
          <span aria-hidden="true">&#8250;</span>
        </button>
      </div>

      <span
        ref={counterRef}
        className="pointer-events-none absolute bottom-6 right-6 text-xs text-white/70 md:bottom-10 md:right-10"
      >
        {String(caption + 1).padStart(2, "0")} /{" "}
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}
