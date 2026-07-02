"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "motion/react";
import { useRouter } from "next/navigation";
import { getEffectHref, getEffectPreviewHref } from "@/lib/categories";
import { resolveEffectVideoUrl, resolveMediaUrl } from "@/lib/media";
import { ArrowUpRight, Eye, Heart } from "lucide-react";

function formatLabel(value = "") {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Default sizes reflects the main vault grid: 3 cols with ~288px sidebar, 80px container padding,
// 48px grid gap, and 56px horizontal inset on the image container.
const VAULT_GRID_SIZES =
  "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px";

export function EffectCard({
  effect,
  priority = false,
  isWishlisted = false,
  toggleWishlist,
  isProUser = false,
  sizes = VAULT_GRID_SIZES,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoMounted, setVideoMounted] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const router = useRouter();
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const unmountTimerRef = useRef(null);

  const isInView = useInView(cardRef, { once: true, margin: "0px", amount: 0.1 });

  // Force-unmount video when card scrolls out of viewport so off-screen
  // WebMediaPlayers don't accumulate and hit Chrome's hard limit (~75).
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          clearTimeout(unmountTimerRef.current);
          setIsHovered(false);
          setVideoMounted(false);
          setVideoReady(false);
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  // Explicitly release the WebMediaPlayer when the video element unmounts.
  // Just removing it from the DOM is not enough — Chrome keeps the player alive
  // until src is cleared and load() is called (crbug.com/1144736).
  useEffect(() => {
    if (!videoMounted) {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
    }
  }, [videoMounted]);

  // Release resources and cancel pending timers when the card unmounts entirely
  // (e.g. user navigates away while videos are still active).
  useEffect(() => {
    return () => {
      clearTimeout(unmountTimerRef.current);
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
    };
  }, []);

  const videoPreviewUrl = resolveEffectVideoUrl(effect);

  const coverImage =
    resolveMediaUrl(effect.coverImage || effect.imageSrc, {
      defaultDirectory: "vault-listing-images",
      defaultExtension: "png",
    }) || "/assets/img/image01.webp";

  const effectHref = getEffectHref(effect);
  const previewHref = getEffectPreviewHref(effect);

  const handleMouseEnter = () => {
    clearTimeout(unmountTimerRef.current);
    setIsHovered(true);
    if (videoPreviewUrl && !videoError) setVideoMounted(true);
    router.prefetch(effectHref);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    // Keep video in DOM for the fade-out duration before unmounting
    unmountTimerRef.current = setTimeout(() => {
      setVideoMounted(false);
      setVideoReady(false);
    }, 300);
  };

  // showVideo drives opacity; videoMounted drives whether the element is in the DOM
  const showVideo = videoReady && isHovered;

  const categories = (
    effect.categories?.length ? effect.categories : [effect.category]
  ).filter(Boolean);

  const primaryCategoryLabel = formatLabel(categories[0] || "components");

  const dependencyPills = (effect.dependencies || [])
    .slice(0, 2)
    .map(formatLabel)
    .filter(Boolean);

  return (
    <Link
      href={effectHref}
      prefetch={false}
      ref={cardRef}
      style={{
        opacity: isInView ? 1 : 0,
        transition: "opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: isInView ? "auto" : "opacity",
      }}
      className="group relative block w-full cursor-pointer rounded-md"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >


      {/* Preview — square card with 16:9 media centered via absolute + translate */}
      <div className="pointer-events-none relative aspect-square overflow-hidden rounded-sm bg-[#272727]">

        {/* Pills & tier badge */}
        <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-3 max-md:inset-x-5 max-md:top-7 max-sm:inset-x-3 max-sm:top-3 max-sm:gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2 max-sm:gap-1.5">
            {dependencyPills.map((pill) => (
              <span
                key={pill}
                className="rounded-full bg-[#0E0E0E] px-5 py-1.5 text18 font-medium text-white/70 max-sm:px-3 max-sm:py-1 max-sm:text-[3.5vw]!"
              >
                {pill}
              </span>
            ))}
          </div>
          {effect.tier === "pro" && (
            <span className="rounded-full bg-primary px-4 py-1.5 text18 font-medium text-white max-sm:px-4 max-sm:py-1 max-sm:text-[3.5vw]!">
              Pro
            </span>
          )}
        </div>

        {/* Media: inset horizontally, centered vertically, 16:9 aspect ratio */}
        <div className="absolute inset-x-7 top-1/2 aspect-video -translate-y-1/2 overflow-hidden rounded-sm max-sm:inset-x-4">
          <Image
            src={coverImage}
            alt={effect.title || effect.name}
            fill
            sizes={sizes}
            priority={priority}
            className={`object-cover transition-[opacity,transform] duration-500 ${
              showVideo ? "opacity-0" : "opacity-100"
            }`}
          />
          {videoMounted && (
            <video
              ref={videoRef}
              src={videoPreviewUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={() => setVideoReady(true)}
              onError={() => setVideoError(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                showVideo ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pointer-events-none relative flex items-start justify-between gap-4 px-3 pt-5 pb-1 max-md:pt-8 max-sm:gap-3 max-sm:px-2 max-sm:pt-7">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="truncate font-sans text22 font-medium leading-none text-white max-sm:text-base">
            <span className="">
              {effect.title}
            </span>
          </h3>
          <p className="text18 text-[#AEAEAE] max-sm:text-xs">
            {primaryCategoryLabel}
          </p>
        </div>

        <div className="pointer-events-auto relative z-30 flex shrink-0 items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-md:opacity-100 max-sm:gap-1.5">
          <button
            type="button"
            data-no-card-link
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist?.(effect);
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-white/10 max-md:h-12 max-md:w-12 max-sm:h-10 max-sm:w-10"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 max-md:h-6 max-md:w-6 max-sm:h-5 max-sm:w-5 ${
                isWishlisted ? "fill-white" : ""
              }`}
            />
          </button>

          <button
            type="button"
            data-no-card-link
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(previewHref, "_blank", "noopener,noreferrer");
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-white/10 max-md:h-12 max-md:w-12 max-sm:h-10 max-sm:w-10"
            aria-label="Preview"
          >
            <Eye className="h-4 w-4 max-md:h-6 max-md:w-6 max-sm:h-5 max-sm:w-5" />
          </button>

          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white max-md:h-12 max-md:w-12 max-sm:h-10 max-sm:w-10"
            aria-hidden="true"
          >
            <ArrowUpRight className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
