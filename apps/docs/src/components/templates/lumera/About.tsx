"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import styles from "./styles.module.css";
import portfolio1 from "./assets/portfolio-1.png";
import portfolio2 from "./assets/portfolio-2.png";
import portfolio3 from "./assets/portfolio-3.png";
import portfolio4 from "./assets/portfolio-4.png";
import portfolio5 from "./assets/portfolio-5.png";

gsap.registerPlugin(Draggable, InertiaPlugin);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

const REDUCED_MOTION_NAV_DURATION = 0.15;

interface HorizontalLoopConfig {
  repeat?: number;
  snap?: number | false;
  paddingRight?: string | number;
  draggable?: boolean;
  wrapperEl?: Element;
  onIndexChange?: (index: number) => void;
  reduceMotion?: boolean;
  reversed?: boolean;
  speed?: number;
  pauseOnHover?: boolean;
  isHoveredRef?: { current: boolean };
}

/**
 * Official GSAP horizontalLoop recipe - returns a timeline augmented with
 * next/previous/current/toIndex helpers. Typed loosely since it's an
 * internal implementation detail.
 */
function horizontalLoop(items: HTMLElement[], config: HorizontalLoopConfig = {}): any {
  items[0].getBoundingClientRect();

  const tl: any = gsap.timeline({
    repeat: config.repeat,
    paused: true,
    defaults: { ease: "none" },
    onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
  });

  const length = items.length;
  const startX = items[0].offsetLeft;
  const times: number[] = [];
  const widths: number[] = [];
  const xPercents: number[] = [];
  let curIndex = 0;

  const pixelsPerSecond = 100 * Math.max(config.speed ?? 1, 0.01);
  const snap =
    config.snap === false ? ((v: number) => v) : gsap.utils.snap(config.snap || 1);

  const populateWidths = () =>
    items.forEach((el, i) => {
      widths[i] = parseFloat(gsap.getProperty(el, "width", "px") as string);
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, "x", "px") as string) / widths[i]) * 100 +
          (gsap.getProperty(el, "xPercent") as number)
      );
    });

  const getTotalWidth = () =>
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    items[length - 1].offsetWidth *
      (gsap.getProperty(items[length - 1], "scaleX") as number) +
    (parseFloat(config.paddingRight as string) || 0);

  populateWidths();
  if (!widths[0]) return null;

  gsap.set(items, { xPercent: (i: number) => xPercents[i] });
  gsap.set(items, { x: 0 });

  const totalWidth = getTotalWidth();

  for (let i = 0; i < length; i++) {
    const item = items[i];
    const curX = (xPercents[i] / 100) * widths[i];
    const distanceToStart = item.offsetLeft + curX - startX;
    const distanceToLoop =
      distanceToStart + widths[i] * (gsap.getProperty(item, "scaleX") as number);

    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    )
      .fromTo(
        item,
        {
          xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100),
        },
        {
          xPercent: xPercents[i],
          duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond
      )
      .add("label" + i, distanceToStart / pixelsPerSecond);

    times[i] = distanceToStart / pixelsPerSecond;
  }

  function toIndex(index: number, vars: Record<string, any> = {}) {
    if (Math.abs(index - curIndex) > length / 2) {
      index += index > curIndex ? -length : length;
    }

    const newIndex = gsap.utils.wrap(0, length, index);
    let time = times[newIndex];

    if (time > tl.time() !== index > curIndex) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }

    curIndex = newIndex;
    config.onIndexChange?.(newIndex);
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }

  tl.next = (vars: Record<string, any>) => toIndex(curIndex + 1, vars);
  tl.previous = (vars: Record<string, any>) => toIndex(curIndex - 1, vars);
  tl.current = () => curIndex;
  tl.toIndex = (index: number, vars: Record<string, any>) => toIndex(index, vars);
  tl.updateIndex = () => {
    curIndex = gsap.utils.wrap(0, length, Math.round(tl.progress() * length));
    config.onIndexChange?.(curIndex);
  };
  tl.times = times;

  tl.progress(1, true).progress(0, true);

  if (config.reversed) {
    tl.vars.onReverseComplete();
    tl.reverse();
  }

  if (config.draggable) {
    const proxy = document.createElement("div");
    const wrap = gsap.utils.wrap(0, 1);

    let ratio: number;
    let startProgress: number;
    let draggableInst: any;
    let dragSnap: number;
    let roundFactor: number;

    const align = () => {
      tl.progress(wrap(startProgress + (draggableInst.startX - draggableInst.x) * ratio));
    };

    const syncIndex = () => tl.updateIndex();

    draggableInst = Draggable.create(proxy, {
      trigger: config.wrapperEl,
      type: "x",
      onPress() {
        startProgress = tl.progress();
        tl.progress(0);
        populateWidths();
        const totalWidthCache = getTotalWidth();
        ratio = 1 / totalWidthCache;
        dragSnap = totalWidthCache / length;
        roundFactor = Math.pow(10, ((dragSnap + "").split(".")[1] || "").length);
        tl.progress(startProgress);
        this.vars.inertia =
          config.pauseOnHover && config.isHoveredRef?.current ? false : !config.reduceMotion;
      },
      onDrag: align,
      onThrowUpdate: align,
      inertia: !config.reduceMotion,
      snap: (value: any) => {
        const n = Math.round(parseFloat(value) / dragSnap) * dragSnap * roundFactor;
        return (n - (n % 1)) / roundFactor;
      },
      onRelease: syncIndex,
      onThrowComplete: () => {
        gsap.set(proxy, { x: 0 });
        syncIndex();
      },
    })[0];

    tl.draggable = draggableInst;
  }

  return tl;
}

interface InfiniteCarouselProps {
  children?: ReactNode;
  draggable?: boolean;
  speed?: number;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  initialIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  itemClassName?: string;
}

function InfiniteCarousel({
  children,
  draggable = true,
  speed = 1,
  pauseOnHover = true,
  direction = "left",
  initialIndex = 0,
  onActiveIndexChange,
  itemClassName = "",
}: InfiniteCarouselProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const loopRef = useRef<any>(null);
  const attemptsRef = useRef(0);
  const isHoveredRef = useRef(false);
  const hasSetInitialIndexRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const childArray: any[] = useMemo(
    () => (Array.isArray(children) ? children.flat().filter(Boolean) : children ? [children] : []),
    [children]
  );

  useEffect(() => {
    onActiveIndexChange?.(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = (event: MediaQueryList | MediaQueryListEvent) => {
      setReduceMotion("matches" in event ? event.matches : prefersReducedMotion());
    };
    if (!mediaQuery) return;
    syncReducedMotion(mediaQuery);
    mediaQuery.addEventListener("change", syncReducedMotion);
    return () => mediaQuery.removeEventListener("change", syncReducedMotion);
  }, []);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, childArray.length);
  }, [childArray.length]);

  useEffect(() => {
    loopRef.current?.draggable?.kill();
    loopRef.current?.kill();
    loopRef.current = null;
    hasSetInitialIndexRef.current = false;

    if (!childArray.length) return;

    attemptsRef.current = 0;

    function tryInit() {
      const items = itemRefs.current.filter(Boolean) as HTMLElement[];
      if (!items.length || !wrapperRef.current) return;

      const loop = horizontalLoop(items, {
        draggable,
        reduceMotion,
        speed,
        pauseOnHover,
        isHoveredRef,
        reversed: direction === "right",
        wrapperEl: wrapperRef.current,
        onIndexChange: setActiveIndex,
      });

      if (!loop) {
        if (attemptsRef.current < 10) {
          attemptsRef.current += 1;
          requestAnimationFrame(tryInit);
        }
        return;
      }

      loopRef.current = loop;

      if (!hasSetInitialIndexRef.current && initialIndex) {
        hasSetInitialIndexRef.current = true;
        loop.toIndex(initialIndex, { duration: 0 });
      } else {
        setActiveIndex(loop.current());
      }
    }

    const raf = requestAnimationFrame(tryInit);

    return () => {
      cancelAnimationFrame(raf);
      loopRef.current?.draggable?.kill();
      loopRef.current?.kill();
      loopRef.current = null;
      attemptsRef.current = 0;
    };
  }, [childArray.length, draggable, reduceMotion, speed, pauseOnHover, direction, initialIndex]);

  const handleNext = () => {
    loopRef.current?.next(
      reduceMotion
        ? { duration: REDUCED_MOTION_NAV_DURATION, ease: "power2.out" }
        : { duration: 0.4, ease: "power1.inOut" }
    );
  };

  const handlePrev = () => {
    loopRef.current?.previous(
      reduceMotion
        ? { duration: REDUCED_MOTION_NAV_DURATION, ease: "power2.out" }
        : { duration: 0.4, ease: "power1.inOut" }
    );
  };

  return (
    <div className="relative w-full">
      <div
        ref={wrapperRef}
        onPointerEnter={() => {
          isHoveredRef.current = true;
        }}
        onPointerLeave={() => {
          isHoveredRef.current = false;
        }}
        className="relative flex w-full flex-nowrap items-center justify-center overflow-hidden gap-[1.5vw] py-[3vw]"
      >
        {childArray.map((child, i) => (
          <div
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={`relative shrink-0 select-none transition-all duration-500 ease-out ${itemClassName}`}
          >
            {child}
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={handlePrev}
        className="absolute left-[36%] top-1/2 z-10 flex size-[2.6vw] -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/70 tablet:size-[8vw] tablet:left-[8%]"
      >
        ←
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={handleNext}
        className="absolute right-[36%] top-1/2 z-10 flex size-[2.6vw] -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/70 tablet:size-[8vw] tablet:right-[8%]"
      >
        →
      </button>
    </div>
  );
}

interface AboutSlide {
  src: StaticImageData;
  title: string;
  description: string;
}

const aboutSlides: AboutSlide[] = [
  {
    src: portfolio1,
    title: "Waterfront Landmark",
    description: "An iconic waterfront address blending grandeur with modern hospitality.",
  },
  {
    src: portfolio2,
    title: "Serene Interiors",
    description: "Warm, tactile interiors designed for comfort and quiet luxury.",
  },
  {
    src: portfolio3,
    title: "Architectural Identity",
    description:
      "A bold modern structure designed to define the Manhattan skyline with elegance and strength.",
  },
  {
    src: portfolio4,
    title: "Wellness Retreat",
    description: "Private spa spaces crafted for rest, recovery and quiet reflection.",
  },
  {
    src: portfolio5,
    title: "Poolside Living",
    description: "Resort-style pools framed by warm stone and ambient lighting.",
  },
];

const CENTER_SLIDE_INDEX = 2;

const About = () => {
  const [activeIndex, setActiveIndex] = useState(CENTER_SLIDE_INDEX);
  const activeSlide = aboutSlides[activeIndex] ?? aboutSlides[CENTER_SLIDE_INDEX];

  return (
    <section className="overflow-hidden bg-[#E0D4C6]" id="about">
      <div className={`${styles["container-lg"]} py-[5%] mobile:py-[20%] mobile:pb-[40%] tablet:py-[15%]`}>
        <div className="w-full flex justify-between tablet:flex-col tablet:gap-[8vw]">
          <h2
            data-para-anim
            className={`w-[40%] text-[3.8vw] ${styles["title-2"]} text-[#1c1b1a] mt-[-1vw] tablet:w-[90%] tablet:text-[8vw]`}
          >
            Real Estate,
            <br />
            Considered Differently
          </h2>
          <div className="w-[35%] space-y-[1.5vw] text-[#1c1b1a]/80 tablet:w-full">
            <p data-para-anim>We believe finding the right home begins with understanding how you want to live.</p>
            <p data-para-anim>
              From waterfront residences to private villas and landmark penthouses, we bring together exceptional
              properties with thoughtful guidance to make every decision feel considered, personal and effortless.
            </p>
          </div>
        </div>

        <div className="fadeup mt-[4vw]">
          <InfiniteCarousel initialIndex={CENTER_SLIDE_INDEX} onActiveIndexChange={setActiveIndex}>
            {aboutSlides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={slide.title}
                  className={`relative overflow-hidden rounded-[50%] transition-all duration-500 ease-out ${
                    isActive
                      ? "w-[20vw] h-[20vw] tablet:w-[45vw] tablet:h-[45vw]"
                      : "w-[9vw] h-[13vw] tablet:w-[20vw] tablet:h-[28vw]"
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.title}
                    fill
                    className="object-cover"
                  />
                </div>
              );
            })}
          </InfiniteCarousel>

          <div data-para-anim className="mx-auto mt-[1vw] max-w-[24vw] text-center tablet:max-w-[70vw]">
            <p className={`${styles["title-2"]} text-[1.6vw] text-[#1c1b1a] tablet:text-[5vw]`}>
              {activeSlide.title}
            </p>
            <p className="mt-[0.5vw] text-[0.95vw] text-[#1c1b1a]/70 tablet:text-[3.5vw]">
              {activeSlide.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
