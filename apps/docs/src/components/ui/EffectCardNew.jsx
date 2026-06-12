"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAnimate, useInView } from "motion/react";
import { getEffectHref, getEffectPreviewHref } from "@/lib/categories";
import { resolveEffectVideoUrl, resolveMediaUrl } from "@/lib/media";
import { ArrowUpRight, Eye, Heart } from "lucide-react";
import gsap from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);

function formatLabel(value = "") {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function EffectCard({
  effect,
  priority = false,
  isWishlisted = false,
  toggleWishlist,
  isProUser = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef(null);
  const [scope, animate] = useAnimate();

  const isInView = useInView(scope, {
    once: true,
    margin: "0px",
    amount: 0.1,
  });

  useEffect(() => {
    if (isInView) {
      if (!scope.current) return;
      animate(scope.current, { opacity: 1 }, { duration: 0.55 });
    }
  }, [animate, isInView, scope]);

  const videoPreviewUrl = resolveEffectVideoUrl(effect);

  const coverImage =
    resolveMediaUrl(effect.coverImage || effect.imageSrc, {
      defaultDirectory: "vault-listing-images",
      defaultExtension: "png",
    }) ||
    "/assets/img/image01.webp";

  useEffect(() => {
    if (!isHovered && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setVideoReady(false);
    }
  }, [isHovered]);

  const shouldLoadVideo = videoPreviewUrl && !videoError && isHovered;
  const showVideo = shouldLoadVideo && videoReady;
  const effectHref = getEffectHref(effect);
  const previewHref = getEffectPreviewHref(effect);
  const categories = (effect.categories?.length ? effect.categories : [effect.category]).filter(Boolean);
  const primaryCategoryLabel = formatLabel(categories[0] || "others");
  const dependencyPills = (effect.dependencies || [])
    .slice(0, 2)
    .map(formatLabel)
    .filter(Boolean);

  return (
    <div
      ref={scope}
      style={{
        opacity: isInView ? 1 : 0,
        transition: "opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "opacity",
        position: "relative",
      }}
      className="group w-full overflow-hidden rounded-md duration-500 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={effectHref} className="block">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-[#272727]">
          <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {dependencyPills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full bg-[#0E0E0E] px-5 py-1.5 text18 font-medium text-white/70 max-sm:px-4 max-sm:text-xs"
                >
                  {pill}
                </span>
              ))}
            </div>

            {effect.tier === "pro" && (
              <span className="rounded-full bg-primary px-4 py-1.5 text18 font-medium text-white max-sm:px-4 max-sm:text-xs">
                Pro
              </span>
            )}
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-7">
            <div className="relative aspect-video w-full overflow-hidden rounded-sm">
              <Image
                src={coverImage}
                alt={effect.title || effect.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={priority}
                className={`object-cover transition-all duration-500 group-hover:scale-[1.02] ${
                  showVideo ? "opacity-0" : "opacity-100"
                }`}
              />
              {shouldLoadVideo && (
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
        </div>
      </Link>

      <div className="flex items-start justify-between gap-4 px-3 pt-5 pb-1">
        <Link href={effectHref} className="block min-w-0 gap-1">
          <h3 className="truncate font-sans text22 font-medium leading-none text-white transition-colors group-hover:text-white">
            {effect.title}
          </h3>
          <p className="mt-0.5 text18 text-[#AEAEAE]">
            {primaryCategoryLabel}
          </p>
        </Link>

        <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleWishlist?.(effect);
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-white/10"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 ${
                isWishlisted ? "fill-white text-white" : "text-white"
              }`}
            />
          </button>

          <button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              window.open(previewHref, "_blank");
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-white/10"
            aria-label="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>

          <Link
            href={effectHref}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/85"
            aria-label={`Open ${effect.title || effect.name}`}
          >
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
