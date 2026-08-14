"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getEffectHref } from "@/lib/categories";
import { resolveMediaUrl, resizeR2ImageUrl } from "@/lib/media";

const CARD_SIZES = "(max-width: 768px) 80vw, (max-width: 1025px) 40vw, 22vw";
const COVER_WIDTH = 640;
const COVER_HEIGHT = 480;

// Card width (w-80/w-64) + track gap (gap-5/gap-4) below, kept in sync with
// the track's className so prev/next steps land exactly one card at a time.
const CARD_STEP = 340;
const CARD_STEP_MOBILE = 272;

// Continuous autoplay speed, in pixels per animation frame.
const AUTOPLAY_SPEED = 0.6;

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
      className="group relative block h-full w-full overflow-hidden rounded-md bg-[#171717]"
    >
      <Image
        src={resolveCoverImage(effect)}
        alt={effect.title || effect.name}
        fill
        sizes={CARD_SIZES}
        quality={65}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />

      <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/0 to-transparent" />

      <span className="absolute left-3 top-3 z-10 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium tracking-wide text-white/85 backdrop-blur-sm max-md:text-[11px]">
        {categoryLabel}
      </span>

      <span className="absolute inset-x-3 bottom-3 z-10 text-lg font-medium leading-tight text-white max-md:text-base">
        {effect.title}
      </span>
    </Link>
  );
}

export default function TrendingRightNow({ effects = [] }) {
  const trackRef = useRef(null);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);

  // Tripled so the middle copy can be scrolled seamlessly in either
  // direction before a wrap-reset is needed.
  const loopEffects = effects.length ? [...effects, ...effects, ...effects] : [];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !effects.length) return;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

    let frameId = null;
    let setWidth = 0;

    const measure = () => {
      setWidth = track.scrollWidth / 3;
    };

    measure();
    // Start in the middle copy so both prev and next have room to scroll.
    track.scrollLeft = setWidth;

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    const tick = () => {
      if (!isHoveredRef.current && !isDraggingRef.current && !reduceMotion) {
        track.scrollLeft += AUTOPLAY_SPEED;
      }

      if (setWidth > 0) {
        if (track.scrollLeft >= setWidth * 2) {
          track.scrollLeft -= setWidth;
        } else if (track.scrollLeft <= 0) {
          track.scrollLeft += setWidth;
        }
      }

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

    track.scrollBy({ left: direction * cardStep, behavior: "smooth" });
  };

  if (!effects.length) return null;

  return (
    <section className="relative w-full overflow-hidden  px-8 pt-16 pb-4 max-md:px-5 max-md:pt-12">
      <div className="mb-7 flex items-center justify-between max-md:mb-5">
        <h2 className="font-sans text-3xl font-medium text-foreground max-md:text-2xl">
          Trending right now
        </h2>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => step(-1)}
            className="flex size-10 min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-sm bg-[#242424] text-white transition-colors duration-200 hover:bg-[#2f2f2f]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Next"
            onClick={() => step(1)}
            className="flex size-10 min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-sm bg-primary text-white transition-colors duration-200 hover:bg-primary/90"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="w-full bg-[#1E1E1E] px-8 py-8 mt-3">
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
          className="flex w-full items-stretch gap-5 overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch] max-md:gap-4"
        >
          {loopEffects.map((effect, index) => (
            <div
              key={`${effect.name}-${index}`}
              className="h-56 w-80 shrink-0 max-md:h-44 max-md:w-64"
            >
              <TrendingEffectCard effect={effect} priority={index < 4} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
