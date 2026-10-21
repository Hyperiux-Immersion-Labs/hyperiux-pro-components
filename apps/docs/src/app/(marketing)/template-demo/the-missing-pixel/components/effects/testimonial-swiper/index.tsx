// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../../Animations/reducedMotion";
import NavButtons from "../../Buttons/NavButtons";

gsap.registerPlugin(SplitText);

export type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  image: StaticImageData;
};

type TestimonialSwiperProps = {
  items: TestimonialItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
};

type Direction = 1 | -1;

const DEFAULT_AUTOPLAY_DELAY = 7000;
const FADE_OUT_DURATION = 0.2;
const LINES_DURATION = 0.85;
const LINES_STAGGER = 0.12;

const pad = (n: number) => String(n).padStart(2, "0");

const TestimonialSwiper = ({
  items,
  autoplay = true,
  autoplayDelay = DEFAULT_AUTOPLAY_DELAY,
}: TestimonialSwiperProps) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const quoteRef = useRef<HTMLParagraphElement | null>(null);
  const captionRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const rollRef = useRef<HTMLSpanElement | null>(null);
  const splitRef = useRef<SplitText | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const progressRef = useRef<gsap.core.Tween | null>(null);
  const currentRef = useRef(0);
  const previousCounterRef = useRef(0);
  const directionRef = useRef<Direction>(1);
  const isAnimatingRef = useRef(false);
  const pausedRef = useRef(false);
  const firstRef = useRef(true);

  const total = items.length;
  const item = items[current];
  const longestQuote = items.reduce(
    (longest, entry) => (entry.quote.length > longest.length ? entry.quote : longest),
    "",
  );

  const revertSplit = () => {
    splitRef.current?.revert();
    splitRef.current = null;
  };

  const restartProgress = () => {
    progressRef.current?.kill();
    const bar = barRef.current;
    if (!bar) return;

    gsap.set(bar, { scaleX: 0 });
    if (!autoplay || prefersReducedMotion() || total <= 1) return;

    progressRef.current = gsap.to(bar, {
      scaleX: 1,
      duration: autoplayDelay / 1000,
      ease: "none",
      paused: pausedRef.current,
      onComplete: () => go(1),
    });
  };

  const fadeOutCurrent = () =>
    new Promise<void>((resolve) => {
      const quote = quoteRef.current;
      const caption = captionRef.current;
      if (!quote || !caption) {
        resolve();
        return;
      }

      timelineRef.current?.kill();
      gsap.killTweensOf([quote, caption]);
      gsap.to(caption, { autoAlpha: 0, duration: FADE_OUT_DURATION, ease: "power1.in" });
      gsap.to(quote, {
        autoAlpha: 0,
        duration: FADE_OUT_DURATION,
        ease: "power1.in",
        onComplete: () => resolve(),
      });
    });

  const go = async (direction: Direction) => {
    if (isAnimatingRef.current || total <= 1) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);
    progressRef.current?.kill();

    if (!prefersReducedMotion()) await fadeOutCurrent();

    revertSplit();
    directionRef.current = direction;
    const next = (currentRef.current + direction + total) % total;
    currentRef.current = next;
    setCurrent(next);
  };

  const animateIn = (direction: Direction) => {
    const quote = quoteRef.current;
    const caption = captionRef.current;
    if (!quote || !caption) return;

    const done = () => {
      isAnimatingRef.current = false;
      setIsAnimating(false);
      restartProgress();
    };

    if (prefersReducedMotion()) {
      gsap.set([quote, caption], { autoAlpha: 1 });
      done();
      return;
    }

    gsap.set(quote, { autoAlpha: 1 });
    const split = SplitText.create(quote, { type: "lines", mask: "lines" });
    splitRef.current = split;

    gsap.set(split.lines, { yPercent: 110 * direction });
    gsap.set(caption, { autoAlpha: 0 });

    timelineRef.current = gsap
      .timeline({ onComplete: done })
      .to(split.lines, {
        yPercent: 0,
        duration: LINES_DURATION,
        ease: "power2.out",
        stagger: { each: LINES_STAGGER, from: direction > 0 ? "start" : "end" },
      })
      .to(caption, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, 0.35);
  };

  useEffect(() => {
    const roll = rollRef.current;
    if (roll) {
      const previous = previousCounterRef.current;
      const forwardWrap = !firstRef.current && directionRef.current === 1 && previous === total - 1 && current === 0;
      const backwardWrap = !firstRef.current && directionRef.current === -1 && previous === 0 && current === total - 1;
      const position = forwardWrap ? total + 1 : backwardWrap ? 0 : current + 1;
      previousCounterRef.current = current;
      gsap.to(roll, {
        yPercent: -(position * 100) / (total + 2),
        duration: firstRef.current || prefersReducedMotion() ? 0 : 0.7,
        ease: "power3.inOut",
        overwrite: true,
        onComplete: () => {
          gsap.set(roll, { yPercent: -((current + 1) * 100) / (total + 2) });
        },
      });
    }

    if (firstRef.current) {
      firstRef.current = false;
      restartProgress();
      return;
    }
    animateIn(directionRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(
    () => () => {
      timelineRef.current?.kill();
      progressRef.current?.kill();
      revertSplit();
    },
    [],
  );

  const pause = (paused: boolean) => {
    pausedRef.current = paused;
    if (paused) progressRef.current?.pause();
    else progressRef.current?.resume();
  };

  if (!total || !item) return null;

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onPointerEnter={() => pause(true)}
      onPointerLeave={() => pause(false)}
      onFocusCapture={() => pause(true)}
      onBlurCapture={() => pause(false)}
      className="flex flex-col gap-7 max-lg:gap-10 max-md:gap-9"
    >
      <figure className="flex w-[83%] flex-col gap-12 max-lg:w-full max-lg:gap-10 max-md:gap-9">
        <blockquote data-cursor-fill className="font-mpx-head text-64 leading-[1.2] text-balance">
          <div className="grid">
            <p aria-hidden className="invisible col-start-1 row-start-1">
              {longestQuote}
            </p>
            <p ref={quoteRef} className="col-start-1 row-start-1">
              {item.quote}
            </p>
          </div>
        </blockquote>
        <figcaption ref={captionRef} className="flex items-center gap-3 max-lg:gap-4">
          <div className="size-[2.7vw] shrink-0 overflow-hidden rounded-full max-lg:size-[6vw] max-md:size-[13vw]">
            <Image src={item.image} alt="" sizes="6vw" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col">
            <cite className="text-28 font-medium not-italic">{item.name}</cite>
            <span className="text-14 text-mpx-muted">{item.role}</span>
          </div>
        </figcaption>
      </figure>

      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 max-lg:gap-5">
          <span aria-live="polite" className="flex text-14 tabular-nums text-mpx-muted">
            <span className="relative inline-block overflow-hidden">
              <span aria-hidden className="invisible">
                {pad(total)}
              </span>
              <span ref={rollRef} className="absolute left-0 top-0 flex flex-col">
                <span aria-hidden>{pad(total)}</span>
                {items.map((_, index) => (
                  <span key={index}>{pad(index + 1)}</span>
                ))}
                <span aria-hidden>{pad(1)}</span>
              </span>
            </span>
            <span className="whitespace-pre"> / {pad(total)}</span>
          </span>
          <span aria-hidden className="h-0.5 w-[11.5vw] overflow-hidden bg-black/10 max-lg:w-[20vw] max-md:w-[25vw]">
            <span ref={barRef} className="block h-full w-full origin-left [transform:scaleX(0)] bg-[#0a0a0a]" />
          </span>
        </div>

        <NavButtons
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          prevDisabled={isAnimating}
          nextDisabled={isAnimating}
        />
      </div>
    </div>
  );
};

export default TestimonialSwiper;
