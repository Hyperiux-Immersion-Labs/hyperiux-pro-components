// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import gsap from "gsap";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { ArrowUpRight } from "../../Buttons/icons";

export type InteractiveListItem = {
  title: string;
  text: string;
  image: StaticImageData;
  href: string;
};

type InteractiveListPreviewProps = {
  items: InteractiveListItem[];
  duration?: number;
  smoothness?: number;
  lerp?: number;
};

const DEFAULT_IMAGE_Z_INDEX = 10;
const DEFAULT_DURATION = 0.6;
const DEFAULT_SMOOTHNESS = 0.35;
const DEFAULT_LERP = 0.18;
const IMAGE_OFFSET_MULTIPLIER = 20;
const ACTIVE_TEXT_COLOR = "#fafafa";
const INACTIVE_TITLE_COLOR = "#0a0a0a";
const INACTIVE_TEXT_COLOR = "#5e5e5e";
const ACCENT = "#ff5f00";
const HIDDEN_INSET = "inset(50%";
const VISIBLE_INSET = "inset(0%";

const clipFor = (element: HTMLElement | null, inset: string) => {
  const radius = element ? getComputedStyle(element).borderTopLeftRadius : "0px";
  return `${inset} round ${radius})`;
};

const clampNumber = (value: number, min: number, max: number, fallback: number) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
};

const InteractiveListPreview = ({
  items,
  duration = DEFAULT_DURATION,
  smoothness = DEFAULT_SMOOTHNESS,
  lerp = DEFAULT_LERP,
}: InteractiveListPreviewProps) => {
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const pendingLeaveRef = useRef<Record<number, boolean>>({});
  const tweenGenerationRef = useRef<Record<number, number>>({});
  const activeIndexRef = useRef<number | null>(null);
  const zIndexRef = useRef(DEFAULT_IMAGE_Z_INDEX);
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const pointerCurrentRef = useRef({ x: 0, y: 0 });
  const reduceMotionRef = useRef(
    typeof window !== "undefined" &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false),
  );
  const safeDuration = clampNumber(duration, 0.1, 2, DEFAULT_DURATION);
  const safeSmoothness = clampNumber(smoothness, 0.05, 1.5, DEFAULT_SMOOTHNESS);
  const safeLerp = clampNumber(lerp, 0.02, 1, DEFAULT_LERP);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;

    const onChange = (event: MediaQueryListEvent) => {
      reduceMotionRef.current = event.matches;
      if (event.matches && imageContainerRef.current) {
        gsap.killTweensOf(imageContainerRef.current);
        gsap.set(imageContainerRef.current, { x: 0, y: 0 });
        pointerTargetRef.current = { x: 0, y: 0 };
        pointerCurrentRef.current = { x: 0, y: 0 };
      }
    };

    reduceMotionRef.current = mq.matches;
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const tick = () => {
      const imageContainer = imageContainerRef.current;
      if (!imageContainer || reduceMotionRef.current) return;

      const current = pointerCurrentRef.current;
      const target = pointerTargetRef.current;
      if (Math.abs(target.x - current.x) + Math.abs(target.y - current.y) < 0.05) return;

      current.x += (target.x - current.x) * safeLerp;
      current.y += (target.y - current.y) * safeLerp;
      gsap.set(imageContainer, { x: current.x, y: current.y });
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [safeLerp]);

  useEffect(() => {
    imageRefs.current.forEach((imageElement) => {
      if (!imageElement) return;

      if (reduceMotionRef.current) {
        gsap.set(imageElement, {
          clipPath: clipFor(imageElement, VISIBLE_INSET),
          opacity: 0,
          visibility: "hidden",
        });
      } else {
        gsap.set(imageElement, {
          clipPath: clipFor(imageElement, HIDDEN_INSET),
          visibility: "hidden",
        });
      }
    });

    if (!highlightRef.current) return;
    gsap.set(highlightRef.current, { opacity: 0, y: 0, height: 0 });
  }, []);

  const getNextTweenGeneration = (index: number) => {
    tweenGenerationRef.current[index] = (tweenGenerationRef.current[index] || 0) + 1;
    return tweenGenerationRef.current[index];
  };

  const setRowActive = (index: number, active: boolean) => {
    const row = rowRefs.current[index];
    if (!row) return;

    const tween = { duration: safeSmoothness, ease: "power2.out", overwrite: "auto" as const };

    gsap.to(row.querySelector("[data-title]"), {
      ...tween,
      color: active ? ACTIVE_TEXT_COLOR : INACTIVE_TITLE_COLOR,
    });
    gsap.to(row.querySelector("[data-desc]"), {
      ...tween,
      color: active ? ACTIVE_TEXT_COLOR : INACTIVE_TEXT_COLOR,
    });
    gsap.to(row.querySelector("[data-icon]"), {
      ...tween,
      rotate: active ? 45 : 0,
      backgroundColor: active ? ACCENT : "rgba(232,71,59,0)",
      borderColor: active ? "rgba(232,71,59,0)" : "rgba(10,10,10,0.3)",
      color: INACTIVE_TITLE_COLOR,
    });
  };

  const moveHighlightToRow = (rowElement: HTMLLIElement | null) => {
    const listElement = listRef.current;
    const highlightElement = highlightRef.current;
    if (!listElement || !highlightElement || !rowElement) return;

    const listBounds = listElement.getBoundingClientRect();
    const rowBounds = rowElement.getBoundingClientRect();

    gsap.to(highlightElement, {
      y: rowBounds.top - listBounds.top,
      height: rowBounds.height,
      opacity: 1,
      duration: safeSmoothness,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const animateImageOut = (index: number) => {
    const imageElement = imageRefs.current[index];
    if (!imageElement) return;

    const tweenGeneration = getNextTweenGeneration(index);
    const reduceMotion = reduceMotionRef.current;

    gsap.killTweensOf(imageElement);

    gsap.to(imageElement, {
      ...(reduceMotion
        ? { opacity: 0 }
        : { clipPath: clipFor(imageElement, HIDDEN_INSET), opacity: 0 }),
      duration: reduceMotion ? Math.min(safeSmoothness, 0.35) : safeDuration,
      ease: reduceMotion ? "power2.out" : "power3.inOut",
      onComplete: () => {
        if (tweenGenerationRef.current[index] !== tweenGeneration) return;
        gsap.set(imageElement, { visibility: "hidden" });
      },
    });
  };

  const onRowEnter = (rowElement: HTMLLIElement | null, index: number) => {
    const imageElement = imageRefs.current[index];
    if (!imageElement) return;

    const reduceMotion = reduceMotionRef.current;
    const previousIndex = activeIndexRef.current;

    pendingLeaveRef.current[index] = false;

    if (reduceMotion && previousIndex !== null && previousIndex !== index) {
      pendingLeaveRef.current[previousIndex] = false;
      animateImageOut(previousIndex);
    }

    zIndexRef.current += 1;

    const tweenGeneration = getNextTweenGeneration(index);

    gsap.killTweensOf(imageElement);

    const finishLeave = () => {
      if (tweenGenerationRef.current[index] !== tweenGeneration) return;
      if (!pendingLeaveRef.current[index]) return;

      pendingLeaveRef.current[index] = false;
      animateImageOut(index);
    };

    if (reduceMotion) {
      gsap.set(imageElement, {
        zIndex: zIndexRef.current,
        visibility: "visible",
        clipPath: clipFor(imageElement, VISIBLE_INSET),
        opacity: 0,
      });
      gsap.to(imageElement, {
        opacity: 1,
        duration: Math.min(safeSmoothness, 0.35),
        ease: "power2.out",
        onComplete: finishLeave,
      });
    } else {
      gsap.set(imageElement, {
        zIndex: zIndexRef.current,
        visibility: "visible",
        clipPath: clipFor(imageElement, HIDDEN_INSET),
        opacity: 1,
      });
      gsap.to(imageElement, {
        clipPath: clipFor(imageElement, VISIBLE_INSET),
        opacity: 1,
        duration: safeDuration,
        ease: "power2.inOut",
        onComplete: finishLeave,
      });
    }

    if (previousIndex !== null && previousIndex !== index) {
      setRowActive(previousIndex, false);
    }

    activeIndexRef.current = index;

    setRowActive(index, true);
    moveHighlightToRow(rowElement);
  };

  const onRowLeave = (index: number) => {
    const imageElement = imageRefs.current[index];
    if (!imageElement) return;

    if (gsap.isTweening(imageElement)) {
      pendingLeaveRef.current[index] = true;
      return;
    }

    animateImageOut(index);
  };

  const onListLeave = () => {
    if (activeIndexRef.current !== null) {
      setRowActive(activeIndexRef.current, false);
      activeIndexRef.current = null;
    }

    pointerTargetRef.current = { x: 0, y: 0 };

    if (!highlightRef.current) return;

    gsap.to(highlightRef.current, {
      opacity: 0,
      duration: safeSmoothness,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const onMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (reduceMotionRef.current || !imageContainerRef.current) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    pointerTargetRef.current = {
      x: x * IMAGE_OFFSET_MULTIPLIER,
      y: y * IMAGE_OFFSET_MULTIPLIER,
    };
  };

  return (
    <>
      <div
        className="relative w-full max-lg:hidden"
        onMouseMove={onMouseMove}
        onMouseLeave={onListLeave}
      >
        <div
          ref={highlightRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 rounded-lg bg-[#0a0a0a]"
        />

        <div ref={imageContainerRef} aria-hidden className="pointer-events-none absolute inset-0 z-40">
          {items.map((item, index) => (
            <div
              key={item.title}
              ref={(element) => {
                imageRefs.current[index] = element;
              }}
              className="invisible absolute left-[77%] top-1/2 aspect-[13/15] w-[15vw] -translate-y-1/2 overflow-hidden rounded-lg will-change-[clip-path,opacity]"
            >
              <Image quality={95} src={item.image} alt="" sizes="15vw" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <ul ref={listRef} className="relative z-30 flex flex-col border-t border-black/10">
          {items.map((item, index) => (
            <li
              key={item.title}
              ref={(element) => {
                rowRefs.current[index] = element;
              }}
              onMouseEnter={(event) => onRowEnter(event.currentTarget, index)}
              onMouseLeave={() => onRowLeave(index)}
              className="border-b border-black/10"
            >
              <Link
                href={item.href}
                onFocus={() => onRowEnter(rowRefs.current[index], index)}
                onBlur={() => onRowLeave(index)}
                className="flex items-center justify-between gap-9 px-[1.3vw] py-[2vw]"
              >
                <span className="flex w-[74%] items-center gap-9">
                  <span
                    data-title
                    className="font-mpx-head w-[56%] text-40  leading-none text-[#0a0a0a]"
                  >
                    {item.title}
                  </span>
                  <span data-desc className="w-[44%] text-24 leading-[1.4] text-[#5e5e5e]">
                    {item.text}
                  </span>
                </span>
                <span
                  data-icon
                  className="flex aspect-square h-[5vh] shrink-0 items-center justify-center rounded-full border border-black/30 text-[#0a0a0a]"
                >
                  <ArrowUpRight className="size-[0.9vw]" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <ul className="hidden flex-col border-t border-black/10 max-lg:flex">
        {items.map((item) => (
          <li key={item.title} className="border-b border-black/10">
            <Link
              href={item.href}
              className="flex items-center justify-between gap-6 py-[3.5vw] max-md:gap-4 max-md:py-[6vw]"
            >
              <span className="flex w-[55%] flex-col gap-2 max-md:w-[56%]">
                <h3 className="text-28 ">{item.title}</h3>
                <span className="text-22 text-[#5e5e5e]">{item.text}</span>
              </span>
              <span className="relative aspect-[13/15] w-[32%] overflow-hidden rounded-lg max-md:w-[36%]">
                <Image quality={95}
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 36vw, 32vw"
                  className="object-cover"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default InteractiveListPreview;
