// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../../Animations/reducedMotion";

gsap.registerPlugin(SplitText);

export type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  image: StaticImageData;
  media: StaticImageData;
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
const EASE_OUT = "ease-[cubic-bezier(0.25,1,0.5,1)]";
const STAR_PATH = "M10 1.6l2.47 5.3 5.8.68-4.29 3.96 1.15 5.73L10 14.4l-5.13 2.87 1.15-5.73L1.73 7.58l5.8-.68z";
const QUOTE_PATH =
  "M0 36V22.6C0 9.9 6.4 2.4 19.1 0l1.9 4.6C13.7 6.6 10.3 11 10 17.3h9.3V36H0zm27 0V22.6C27 9.9 33.4 2.4 46.1 0L48 4.6c-7.3 2-10.7 6.4-11 12.7h9.3V36H27z";

const TestimonialSwiper = ({
  items,
  autoplay = true,
  autoplayDelay = DEFAULT_AUTOPLAY_DELAY,
}: TestimonialSwiperProps) => {
  const [current, setCurrent] = useState(0);

  const quoteRef = useRef<HTMLParagraphElement | null>(null);
  const captionRef = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const splitRef = useRef<SplitText | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const autoplayRef = useRef<gsap.core.Tween | null>(null);
  const currentRef = useRef(0);
  const directionRef = useRef<Direction>(1);
  const isAnimatingRef = useRef(false);
  const firstRef = useRef(true);

  const total = items.length;
  const item = items[current];

  const revertSplit = () => {
    splitRef.current?.revert();
    splitRef.current = null;
  };

  const restartAutoplay = () => {
    autoplayRef.current?.kill();
    if (!autoplay || prefersReducedMotion() || total <= 1) return;

    autoplayRef.current = gsap.delayedCall(autoplayDelay / 1000, () =>
      goTo((currentRef.current + 1) % total),
    );
  };

  const fadeOutCurrent = () =>
    new Promise<void>((resolve) => {
      const quote = quoteRef.current;
      const caption = captionRef.current;
      const media = mediaRef.current;
      if (!quote || !caption || !media) {
        resolve();
        return;
      }

      timelineRef.current?.kill();
      gsap.killTweensOf([quote, caption, media]);
      gsap.to(caption, { autoAlpha: 0, duration: FADE_OUT_DURATION, ease: "power1.in" });
      gsap.to(media, { autoAlpha: 0, duration: FADE_OUT_DURATION, ease: "power1.in" });
      gsap.to(quote, {
        autoAlpha: 0,
        duration: FADE_OUT_DURATION,
        ease: "power1.in",
        onComplete: () => resolve(),
      });
    });

  const goTo = async (index: number) => {
    if (isAnimatingRef.current || total <= 1 || index === currentRef.current) return;
    isAnimatingRef.current = true;
    autoplayRef.current?.kill();

    if (!prefersReducedMotion()) await fadeOutCurrent();

    revertSplit();
    directionRef.current = index > currentRef.current ? 1 : -1;
    currentRef.current = index;
    setCurrent(index);
  };

  const animateIn = (direction: Direction) => {
    const quote = quoteRef.current;
    const caption = captionRef.current;
    const media = mediaRef.current;
    if (!quote || !caption || !media) return;

    const done = () => {
      isAnimatingRef.current = false;
      restartAutoplay();
    };

    if (prefersReducedMotion()) {
      gsap.set([quote, caption, media], { autoAlpha: 1 });
      done();
      return;
    }

    gsap.set(quote, { autoAlpha: 1 });
    const split = SplitText.create(quote, { type: "lines", mask: "lines" });
    splitRef.current = split;

    gsap.set(split.lines, { yPercent: 110 * direction });
    gsap.set(caption, { autoAlpha: 0 });
    gsap.set(media, { autoAlpha: 0 });

    timelineRef.current = gsap
      .timeline({ onComplete: done })
      .to(split.lines, {
        yPercent: 0,
        duration: LINES_DURATION,
        ease: "power2.out",
        stagger: { each: LINES_STAGGER, from: direction > 0 ? "start" : "end" },
      })
      .to(caption, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, 0.35)
      .to(media, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, 0);
  };

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      restartAutoplay();
      return;
    }
    animateIn(directionRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(
    () => () => {
      timelineRef.current?.kill();
      autoplayRef.current?.kill();
      revertSplit();
    },
    [],
  );

  if (!total || !item) return null;

  const faces = items.slice(0, 4);
  const longestRole = items.reduce(
    (longest, entry) => (entry.role.length > longest.length ? entry.role : longest),
    "",
  );
  const longestQuote = items.reduce(
    (longest, entry) => (entry.quote.length > longest.length ? entry.quote : longest),
    "",
  );

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      className="flex flex-col gap-[3.3vw] max-lg:gap-10 max-md:gap-9"
    >
      <div className="grid grid-cols-[4fr_8fr] items-stretch gap-[2.4vw] max-lg:grid-cols-1 max-lg:gap-[5vw] max-md:gap-8">
        <div className="relative h-[29vw] rounded-lg bg-mpx-surface max-lg:h-[56vw] max-md:h-[64vw]">
          <div ref={mediaRef} className="absolute inset-0 rounded-[inherit]">
            {items.map((entry, index) => (
              <Image quality={95}
                key={entry.name}
                src={entry.media}
                alt=""
                aria-hidden
                sizes="(max-width: 1025px) 90vw, 30vw"
                className={`absolute inset-0 h-full w-full rounded-[inherit] object-cover ${
                  index === current ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
          <span className="absolute bottom-0 left-1/2 z-10 flex w-max -translate-x-1/2 translate-y-1/2 max-md:hidden items-center gap-[0.8vw] rounded-full border border-(--mpx-ink)/10 bg-(--mpx-paper) py-[0.3vw] pl-[1.2vw] pr-[0.35vw] text-14 font-medium shadow-[0_10px_30px_rgb(10_10_10/0.18)] max-lg:gap-3 max-lg:py-1.5 max-lg:pl-4 max-lg:pr-1.5 ">
            Trusted clients
            <span className="flex items-center -space-x-[0.6vw] max-lg:-space-x-2">
              {faces.map((face) => (
                <span
                  key={face.name}
                  className="size-[2vw] overflow-hidden rounded-full border-2 border-(--mpx-paper) max-lg:size-[4.4vw] max-md:size-8"
                >
                  <Image quality={95} src={face.image} alt="" sizes="4vw" className="h-full w-full object-cover" />
                </span>
              ))}
              <span className="grid size-[2vw] place-items-center rounded-full border-2 border-(--mpx-paper) bg-(--mpx-accent) text-14 font-semibold text-(color:--mpx-ink) max-lg:size-[4.4vw]  max-md:size-8 ">
                +{Math.max(total - faces.length, 0)}
              </span>
            </span>
          </span>
        </div>

        <figure className="flex h-[29vw] min-w-0 flex-col justify-between gap-6 overflow-hidden rounded-lg bg-mpx-surface p-[3.3vw] max-lg:h-auto max-lg:gap-[6vw] max-lg:p-[5vw] max-md:gap-8 max-md:p-[6vw]">
          <div className="flex items-center justify-between gap-4">
            <svg
              viewBox="0 0 48 36"
              aria-hidden
              className="h-auto w-[3vw] fill-(--mpx-accent) max-lg:w-[6vw] max-md:w-10"
            >
              <path d={QUOTE_PATH} />
            </svg>
            <span
              role="img"
              aria-label="Rated 5 out of 5"
              className="inline-flex gap-[0.2vw] rounded-full bg-(--mpx-white) px-[0.7vw] py-[0.5vw] max-lg:gap-1 max-lg:px-3 max-lg:py-2"
            >
              {Array.from({ length: 5 }, (_, star) => (
                <svg
                  key={star}
                  viewBox="0 0 20 20"
                  aria-hidden
                  className="size-[1vw] fill-(--mpx-accent) max-lg:size-[2.4vw] max-md:size-4"
                >
                  <path d={STAR_PATH} />
                </svg>
              ))}
            </span>
          </div>

          <blockquote data-cursor-fill className="font-mpx-head grid">
            <p
              aria-hidden
              className="invisible col-start-1 row-start-1 w-[90%] text-30 leading-[1.38] tracking-tight max-lg:w-full"
            >
              {longestQuote}
            </p>
            <p
              ref={quoteRef}
              className="col-start-1 row-start-1 w-[90%] text-30 leading-[1.38] tracking-tight max-lg:w-full "
            >
              {item.quote}
            </p>
          </blockquote>

          <figcaption ref={captionRef} className="flex items-center gap-[0.85vw] max-lg:gap-4">
            <div className="size-[3.3vw] shrink-0 overflow-hidden rounded-full max-lg:size-[8vw] max-md:size-12">
              <Image quality={95} src={item.image} alt="" sizes="6vw" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-[0.1vw]">
              <cite className="font-mpx-head text-24 font-medium not-italic ">
                {item.name}
              </cite>
              <div className="grid text-24 text-mpx-muted">
                <span aria-hidden className="invisible col-start-1 row-start-1">
                  {longestRole}
                </span>
                <span className="col-start-1 row-start-1">{item.role}</span>
              </div>
            </div>
          </figcaption>
        </figure>
      </div>

      <div role="group" aria-label="Choose a testimonial" className="flex justify-center gap-[0.6vw] max-lg:gap-2">
        {items.map((entry, index) => {
          const isActive = index === current;
          return (
            <button
              key={entry.name}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Show testimonial ${index + 1} of ${total}`}
              aria-current={isActive}
              className={`flex h-[1.2vw] items-center transition-[width] duration-500 ${EASE_OUT} motion-reduce:transition-none max-lg:h-5 ${
                isActive ? "w-[2.7vw] max-lg:w-9" : "w-[1.8vw] max-lg:w-6"
              }`}
            >
              <span
                className={`h-[0.2vw] w-full rounded-full transition-colors duration-500 max-lg:h-0.5 ${
                  isActive ? "bg-(--mpx-accent)" : "bg-(--mpx-ink)/30 hover:bg-mpx-muted"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TestimonialSwiper;
