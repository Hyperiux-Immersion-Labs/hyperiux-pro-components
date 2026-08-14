"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getEffectHref } from "@/lib/categories";
import { resolveMediaUrl, resizeR2ImageUrl } from "@/lib/media";
import CircularButton from "@/components/WebsiteComps/CirclularButton";

const CARD_SIZES = "(max-width: 768px) 80vw, (max-width: 1025px) 40vw, 22vw";
const COVER_WIDTH = 640;
const COVER_HEIGHT = 480;

// Card width (w-80/w-64) + track gap (gap-5/gap-4) below, kept in sync with
// the track's className so prev/next steps land exactly one card at a time.
const CARD_STEP = 340;
const CARD_STEP_MOBILE = 272;

// Continuous autoplay speed, in pixels per animation frame.
const AUTOPLAY_SPEED = 0.6;
const LERP_FACTOR = 0.085;

function formatLabel(value = "") {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function resolveCoverImage(effect) {
  const resolved =
    resolveMediaUrl(effect.coverImage || effect.imageSrc, {
      defaultDirectory: "vault-listing-images",
      defaultExtension: "png",
    }) || "/assets/img/image01.webp";

  if (resolved.startsWith("/")) return resolved;

  return resizeR2ImageUrl(resolved, { width: COVER_WIDTH, height: COVER_HEIGHT });
}

function TrendingEffectCard({ effect, priority = false }) {
  const categoryLabel = formatLabel(
    (effect.categories?.length ? effect.categories[0] : effect.category) ||
      "components",
  );

  return (
    <Link
      href={getEffectHref(effect)}
      prefetch={false}
      draggable={false}
      className="group relative block h-full w-full overflow-hidden bg-[#161616]"
    >
      <span className="absolute left-5 top-3 z-10 bg-[#2B2B2B] px-3 py-[0.1vw] text-[0.8vw]  tracking-[0.06em] text-white max-md:left-5 max-md:top-5 max-md:px-4 max-md:py-1.5 ">
        {categoryLabel}
      </span>

      <div className="absolute inset-x-3 top-[22%] h-[62%] bottom-3 overflow-hidden bg-[#efe9da] md:inset-x-5 md:top-[20%] md:bottom-5">
        <Image
          src={resolveCoverImage(effect)}
          alt={effect.title || effect.name}
          fill
          sizes={CARD_SIZES}
          quality={65}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
    </Link>
  );
}

export default function TrendingRightNow({ effects = [] }) {
  const trackRef = useRef(null);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const manualPauseUntilRef = useRef(0);
  const setWidthRef = useRef(0);
  const currentScrollRef = useRef(0);
  const targetScrollRef = useRef(0);

  // Tripled so the middle copy can be scrolled seamlessly in either
  // direction before a wrap-reset is needed.
  const loopEffects = effects.length ? [...effects, ...effects, ...effects] : [];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !effects.length) return;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

    let frameId = null;

    const measure = () => {
      setWidthRef.current = track.scrollWidth / 3;
    };

    const normalizeScrollPosition = () => {
      const setWidth = setWidthRef.current;
      if (setWidth <= 0) return;

      if (currentScrollRef.current >= setWidth * 2) {
        currentScrollRef.current -= setWidth;
        targetScrollRef.current -= setWidth;
      } else if (currentScrollRef.current <= 0) {
        currentScrollRef.current += setWidth;
        targetScrollRef.current += setWidth;
      }
    };

    measure();
    // Start in the middle copy so both prev and next have room to scroll.
    currentScrollRef.current = setWidthRef.current;
    targetScrollRef.current = setWidthRef.current;
    track.scrollLeft = setWidthRef.current;

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    const tick = () => {
      const manualPauseActive = Date.now() < manualPauseUntilRef.current;

      if (
        !isHoveredRef.current &&
        !isDraggingRef.current &&
        !manualPauseActive &&
        !reduceMotion
      ) {
        targetScrollRef.current += AUTOPLAY_SPEED;
      }

      normalizeScrollPosition();
      currentScrollRef.current +=
        (targetScrollRef.current - currentScrollRef.current) * LERP_FACTOR;
      track.scrollLeft = currentScrollRef.current;

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [effects.length]);

  const step = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const cardStep = window.innerWidth <= 768 ? CARD_STEP_MOBILE : CARD_STEP;
    const setWidth = setWidthRef.current;

    manualPauseUntilRef.current = Date.now() + 900;

    if (setWidth > 0) {
      if (currentScrollRef.current >= setWidth * 2) {
        currentScrollRef.current -= setWidth;
        targetScrollRef.current -= setWidth;
      } else if (currentScrollRef.current <= 0) {
        currentScrollRef.current += setWidth;
        targetScrollRef.current += setWidth;
      }
    }

    targetScrollRef.current += direction * cardStep;
  };

  if (!effects.length) return null;

  return (
    <section className="relative w-full overflow-hidden  px-8 pt-16 pb-4 max-md:px-0 max-md:pt-12">
      <div className="mb-7 flex items-center max-sm:px-5 justify-between max-md:mb-5">
        <h2 className="font-sans text-2xl font-medium text-foreground max-md:text-2xl">
          Trending Right Now
        </h2>

        <div className="flex shrink-0 items-center gap-2">
          <CircularButton
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous"
            className="h-8 w-8 p-2 border-white/12 bg-[#272727] text-white transition-all hover:border-[#ff5f00]"
            bgColor="#ff5f00"
          >
            <ChevronLeft className="h-5 w-5 transition-colors duration-500 group-hover:text-black" />
          </CircularButton>

          <CircularButton
            type="button"
            onClick={() => step(1)}
            aria-label="Next"
            className="h-8 w-8 p-2 border-white/12  bg-[#272727] text-white transition-all hover:border-[#ff5f00]"
            bgColor="#ff5f00"
          >
            <ChevronRight className="h-5 w-5 group-hover:text-black transition-colors duration-500" />
          </CircularButton>
        </div>
      </div>

      <div className="w-full bg-[#1E1E1E] py-8 mt-3">
        <div
          ref={trackRef}
          onPointerEnter={() => {
            isHoveredRef.current = true;
          }}
          onPointerLeave={() => {
            isHoveredRef.current = false;
          }}
          onPointerDown={() => {
            isDraggingRef.current = true;
          }}
          onPointerUp={() => {
            isDraggingRef.current = false;
          }}
          className="flex w-full items-stretch gap-6 overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch] max-md:gap-4"
        >
          {loopEffects.map((effect, index) => (
            <div
              key={`${effect.name}-${index}`}
              className="h-60 w-80 shrink-0 max-md:h-44 max-md:w-64"
            >
              <TrendingEffectCard effect={effect} priority={index < 4} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
