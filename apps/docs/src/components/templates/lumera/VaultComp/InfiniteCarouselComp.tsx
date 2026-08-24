"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

import portfolio1 from "../assets/portfolio-1.png";
import portfolio2 from "../assets/portfolio-2.png";
import portfolio3 from "../assets/portfolio-3.png";
import portfolio4 from "../assets/portfolio-4.png";
import portfolio5 from "../assets/portfolio-5.png";

gsap.registerPlugin(Draggable, InertiaPlugin);

export interface CarouselSlide {
  src: string | StaticImageData;
  alt?: string;
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  { src: portfolio1, alt: "Waterfront landmark" },
  { src: portfolio2, alt: "Serene interiors" },
  { src: portfolio3, alt: "Architectural identity" },
  { src: portfolio4, alt: "Wellness retreat" },
  { src: portfolio5, alt: "Poolside living" },
];

/**
 * Every measurement is expressed in `vw` so the whole carousel scales with the
 * viewport, then converted to px once per resize for the transform maths.
 */
interface Metrics {
  smallW: number;
  smallH: number;
  centerW: number;
  centerH: number;
  gap: number;
}

const DESKTOP: Metrics = { smallW: 11.5, smallH: 14.5, centerW: 21, centerH: 28.5, gap: 5.5 };
const TABLET: Metrics = { smallW: 18, smallH: 23, centerW: 34, centerH: 45, gap: 6 };
const MOBILE: Metrics = { smallW: 26, smallH: 33, centerW: 54, centerH: 70, gap: 6 };

interface PixelMetrics extends Metrics {
  /** Centre-to-centre distance between two neighbouring side slides. */
  unit: number;
  /** Extra outward push the enlarged centre slide adds to its neighbours. */
  extra: number;
  /** Half the stage's own width — the clip edge slides are hidden beyond. */
  stageHalf: number;
}

const metricsFor = (width: number): Metrics => {
  if (width <= 640) return MOBILE;
  if (width <= 1024) return TABLET;
  return DESKTOP;
};

const toPixels = (m: Metrics, viewportWidth: number, stageWidth: number): PixelMetrics => {
  const vw = viewportWidth / 100;
  const unit = m.smallW + m.gap;
  return {
    stageHalf: stageWidth / 2,
    smallW: m.smallW * vw,
    smallH: m.smallH * vw,
    centerW: m.centerW * vw,
    centerH: m.centerH * vw,
    gap: m.gap * vw,
    unit: unit * vw,
    // Neighbours of the centre sit half-a-centre + gap + half-a-side away, so
    // anything beyond the plain `unit` spacing is the centre's extra bulk.
    extra: (m.centerW / 2 + m.gap + m.smallW / 2 - unit) * vw,
  };
};

const smoothstep = (t: number) => t * t * (3 - 2 * t);

interface InfiniteCarouselCompProps {
  slides?: CarouselSlide[];
  initialIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  draggable?: boolean;
  showNav?: boolean;
  className?: string;
}

export default function InfiniteCarouselComp({
  slides = DEFAULT_SLIDES,
  initialIndex = 0,
  onActiveIndexChange,
  draggable = true,
  showNav = true,
  className = "",
}: InfiniteCarouselCompProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pxRef = useRef<PixelMetrics>(toPixels(DESKTOP, 1440, 1440));
  const progressRef = useRef({ value: initialIndex });
  const lastIndexRef = useRef(-1);
  const draggedRef = useRef(false);
  const draggableRef = useRef<Draggable | null>(null);

  const [activeIndex, setActiveIndex] = useState(
    slides.length ? ((initialIndex % slides.length) + slides.length) % slides.length : 0
  );
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // The wrap point has to sit off-screen, which needs at least ~7 rendered
  // slides; short lists are repeated until they clear that bar.
  const items = useMemo(() => {
    if (!slides.length) return [] as { slide: CarouselSlide; sourceIndex: number; copy: number }[];
    const repeat = slides.length >= 7 ? 1 : Math.ceil(7 / slides.length);
    return Array.from({ length: slides.length * repeat }, (_, i) => ({
      slide: slides[i % slides.length],
      sourceIndex: i % slides.length,
      copy: Math.floor(i / slides.length),
    }));
  }, [slides]);

  const count = items.length;

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, count);
  }, [count]);

  useEffect(() => {
    onActiveIndexChange?.(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;

    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /** Positions, sizes and stacking for every slide from the current progress. */
  const render = useCallback(() => {
    if (!count) return;

    const px = pxRef.current;
    const wrapOffset = gsap.utils.wrap(-count / 2, count / 2);
    const progress = progressRef.current.value;

    for (let i = 0; i < count; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;

      const offset = wrapOffset(i - progress);
      const distance = Math.abs(offset);
      const near = Math.min(distance, 1);
      const centerness = smoothstep(1 - near);

      const x = offset * px.unit + Math.sign(offset) * smoothstep(near) * px.extra;
      const width = px.smallW + (px.centerW - px.smallW) * centerness;

      // Slides never fade — they'd be visibly translucent inside the stage.
      // They only wink out once their near edge has passed the clip boundary,
      // by which point overflow-hidden already hides them completely.
      const clipped = Math.abs(x) - width / 2 >= px.stageHalf;

      gsap.set(el, {
        // Centring lives here rather than in a Tailwind translate class because
        // GSAP owns the element's `transform` once it starts writing to it.
        xPercent: -50,
        yPercent: -50,
        x,
        width,
        height: px.smallH + (px.centerH - px.smallH) * centerness,
        zIndex: 100 - Math.round(distance * 10),
        opacity: 1,
        visibility: clipped ? "hidden" : "visible",
      });
    }

    const centered = ((Math.round(progress) % count) + count) % count;
    if (centered !== lastIndexRef.current) {
      lastIndexRef.current = centered;
      setActiveIndex(items[centered]?.sourceIndex ?? 0);
    }
  }, [count, items]);

  const measure = useCallback(() => {
    // Sizes are viewport-relative, but the clip boundary is the stage's own box,
    // which may be narrower than the viewport depending on where it's used.
    const viewport = window.innerWidth;
    const stageWidth = stageRef.current?.clientWidth || viewport;
    pxRef.current = toPixels(metricsFor(viewport), viewport, stageWidth);
    render();
  }, [render]);

  useEffect(() => {
    measure();
    setReady(true);

    window.addEventListener("resize", measure);

    const stage = stageRef.current;
    const observer = stage ? new ResizeObserver(measure) : null;
    if (stage && observer) observer.observe(stage);

    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [measure]);

  const goTo = useCallback(
    (target: number) => {
      // A throw in flight also writes to progress, so it has to go first or the
      // two would fight over the same value.
      draggableRef.current?.tween?.kill();
      gsap.killTweensOf(progressRef.current);
      gsap.to(progressRef.current, {
        value: target,
        duration: reduceMotion ? 0.2 : 0.8,
        ease: reduceMotion ? "power1.out" : "power3.out",
        onUpdate: render,
      });
    },
    [reduceMotion, render]
  );

  const step = useCallback(
    (direction: number) => goTo(Math.round(progressRef.current.value) + direction),
    [goTo]
  );

  useEffect(() => {
    if (!draggable || !count || !stageRef.current) return;

    const proxy = document.createElement("div");
    let startX = 0;
    let startProgress = 0;

    const align = (instance: Draggable) => {
      progressRef.current.value =
        startProgress - (instance.x - startX) / pxRef.current.unit;
      render();
    };

    const instance = Draggable.create(proxy, {
      trigger: stageRef.current,
      type: "x",
      inertia: !reduceMotion,
      allowNativeTouchScrolling: false,
      onPress(this: Draggable) {
        gsap.killTweensOf(progressRef.current);
        startX = this.x;
        startProgress = progressRef.current.value;
        draggedRef.current = false;
      },
      onDrag(this: Draggable) {
        draggedRef.current = true;
        align(this);
      },
      onThrowUpdate(this: Draggable) {
        align(this);
      },
      snap(value: number) {
        const projected = startProgress - (value - startX) / pxRef.current.unit;
        return startX - (Math.round(projected) - startProgress) * pxRef.current.unit;
      },
      onRelease() {
        // With inertia on, `snap` lands the throw on a whole slide for us.
        if (reduceMotion) goTo(Math.round(progressRef.current.value));
      },
      onThrowComplete() {
        progressRef.current.value = Math.round(progressRef.current.value);
        render();
      },
    })[0];

    draggableRef.current = instance;

    return () => {
      instance.kill();
      draggableRef.current = null;
    };
  }, [draggable, count, reduceMotion, render, goTo]);

  const activeSlide = slides[activeIndex];
  const announcement = slides.length
    ? `${activeSlide?.alt ? `${activeSlide.alt}, ` : ""}slide ${activeIndex + 1} of ${slides.length}`
    : "";

  if (!count) return null;

  return (
    <div className={`relative w-full select-none ${className}`}>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <div
        ref={stageRef}
        /* A touch taller than the centre slide so its border never clips. */
        className={`relative h-[30vw] w-full overflow-hidden transition-opacity duration-500 max-[1024px]:h-[47vw] max-[640px]:h-[73vw] ${
          draggable ? "cursor-grab active:cursor-grabbing" : ""
        } ${ready ? "opacity-100" : "opacity-0"}`}
      >
        {items.map((item, i) => (
          <div
            key={`${item.sourceIndex}-${item.copy}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            onClick={() => {
              if (draggedRef.current) return;
              const wrapOffset = gsap.utils.wrap(-count / 2, count / 2);
              const offset = wrapOffset(i - progressRef.current.value);
              if (Math.abs(offset) > 0.1) goTo(progressRef.current.value + offset);
            }}
            aria-hidden={item.copy > 0}
            className="absolute left-1/2 top-1/2 overflow-hidden rounded-[50%] border border-[#CA8216] will-change-transform"
          >
            <Image
              src={item.slide.src}
              alt={item.slide.alt ?? ""}
              fill
              quality={100}
              placeholder="empty"
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 50vw, 35vw"
              draggable={false}
              priority={item.copy === 0 && item.sourceIndex < 3}
              className="pointer-events-none h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {showNav && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => step(-1)}
            className="absolute top-1/2 left-[calc(50%-10.5vw)] z-[200] flex size-[3vw] -translate-x-1/2 -translate-y-1/2 items-center border border-white justify-center rounded-full bg-[#A4A4A41A]/10 text-[#1c1b1a] backdrop-blur-sm transition-colors hover:bg-[#A4A4A41A]/20 max-[1024px]:left-[calc(50%-17vw)] max-[1024px]:size-[6vw] max-[640px]:left-[calc(50%-27vw)] max-[640px]:size-[11vw]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-1/2"
              aria-hidden="true"
            >
              <path d="M19 12H5m6 6-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Next slide"
            onClick={() => step(1)}
            className="absolute top-1/2 border border-white right-[calc(50%-10.5vw)] z-[200] flex size-[3vw] translate-x-1/2 -translate-y-1/2 backdrop-blur-sm items-center justify-center rounded-full bg-[#A4A4A41A]/10 text-[#1c1b1a]  transition-colors hover:bg-[#A4A4A41A]/20 max-[1024px]:right-[calc(50%-17vw)] max-[1024px]:size-[6vw] max-[640px]:right-[calc(50%-27vw)] max-[640px]:size-[11vw]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-1/2"
              aria-hidden="true"
            >
              <path d="M5 12h14m-6 6 6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
