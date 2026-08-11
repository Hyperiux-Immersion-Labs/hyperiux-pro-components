"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getEffectHref, getEffectPreviewHref } from "@/lib/categories";
import { resolveEffectVideoUrl, resolveMediaUrl, resizeR2ImageUrl } from "@/lib/media";
import { ArrowUpRight, Download, Eye, Heart } from "lucide-react";

function formatLabel(value = "") {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatInstallCount(value) {
  const count = Number.isFinite(Number(value)) ? Number(value) : 0;

  if (count >= 1000) {
    return new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(count);
  }

  return String(count);
}

// Media sits inside inset-x-7 (56px) on desktop / inset-x-4 (32px) on mobile.
// 280px desktop slot matches ~264px measured display; avoids 400px overshoot in srcset.
const VAULT_GRID_SIZES =
  "(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 40px), 280px";

// 2x the largest slot (280px) for retina listing thumbnails (16:9).
const LISTING_COVER_WIDTH = 560;
const LISTING_COVER_HEIGHT = 315;

function resolveEffectCoverImage(effect) {
  const resolved =
    resolveMediaUrl(effect.coverImage || effect.imageSrc, {
      defaultDirectory: "vault-listing-images",
      defaultExtension: "png",
    }) || "/assets/img/image01.webp";

  if (resolved.startsWith("/")) return resolved;

  return resizeR2ImageUrl(resolved, {
    width: LISTING_COVER_WIDTH,
    height: LISTING_COVER_HEIGHT,
  });
}

export function EffectCard({
  effect,
  priority = false,
  isWishlisted = false,
  toggleWishlist,
  isProUser = false,
  sizes = VAULT_GRID_SIZES,
}) {
  const [active, setActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [hasAppeared, setHasAppeared] = useState(false);

  const router = useRouter();
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const prefetchTimerRef = useRef(null);

  // Single observer: latches the one-time entrance fade and stops playback once
  // the card scrolls away. setState lives in the observer callback (external
  // event), the sanctioned alternative to setState in an effect body.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAppeared(true);
        } else {
          setActive(false);
        }
      },
      { rootMargin: "200px 0px", threshold: 0.1 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const videoPreviewUrl = useMemo(() => resolveEffectVideoUrl(effect), [effect]);
  const coverImage = useMemo(() => resolveEffectCoverImage(effect), [effect]);

  const effectHref = getEffectHref(effect);
  const previewHref = getEffectPreviewHref(effect);

  // Drive the <video> imperatively so React never owns `src`. Activating attaches
  // the source and plays; deactivating detaches it, releasing the WebMediaPlayer
  // (crbug.com/1144736). An empty <video> holds no decoder, so the element stays
  // mounted without accumulating toward Chrome's ~75-player limit. (Managing src
  // via a React prop + a cleanup ref breaks under StrictMode's mount/remount,
  // which strips the attribute and never restores it.)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoPreviewUrl) return;

    if (active) {
      if (video.getAttribute("src") !== videoPreviewUrl) {
        video.src = videoPreviewUrl;
        video.load();
      }
      video.play().catch(() => {});
    } else if (video.getAttribute("src")) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }, [active, videoPreviewUrl]);

  const handleMouseEnter = () => {
    if (videoPreviewUrl) setActive(true);
    // Delay prefetch so brushing past a card while moving the cursor doesn't
    // queue a request for every card under the pointer.
    prefetchTimerRef.current = setTimeout(() => router.prefetch(effectHref), 120);
  };

  const handleMouseLeave = () => {
    clearTimeout(prefetchTimerRef.current);
    setActive(false);
  };

  useEffect(() => () => clearTimeout(prefetchTimerRef.current), []);

  // active drives whether the source is attached/playing; showVideo drives opacity
  const showVideo = active && videoReady;

  const primaryCategoryLabel = useMemo(() => {
    const categories = (
      effect.categories?.length ? effect.categories : [effect.category]
    ).filter(Boolean);
    return formatLabel(categories[0] || "components");
  }, [effect.categories, effect.category]);

  const dependencyPills = useMemo(
    () =>
      (effect.dependencies || []).slice(0, 2).map(formatLabel).filter(Boolean),
    [effect.dependencies]
  );
  const installCount = Number.isFinite(Number(effect.installCount))
    ? Number(effect.installCount)
    : 0;
  const installCountLabel = formatInstallCount(installCount);

  return (
    <Link
      href={effectHref}
      prefetch={false}
      ref={cardRef}
      style={{
        opacity: hasAppeared ? 1 : 0,
        transition: "opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: hasAppeared ? "auto" : "opacity",
      }}
      className="group relative block w-full cursor-pointer rounded-md"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >


      {/* Preview - square card with 16:9 media centered via absolute + translate */}
      <div className="pointer-events-none relative aspect-square overflow-hidden rounded-sm bg-[#272727]">

        {/* Pills & tier badge */}
        <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-3 max-[1025px]:inset-x-5 max-[1025px]:top-7 max-md:inset-x-3 max-md:top-3 max-md:gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2 max-md:gap-1.5">
            {dependencyPills.map((pill) => (
              <span
                key={pill}
                className="rounded-full bg-[#0E0E0E] px-5 py-1.5 text18 font-medium text-white/70 max-md:px-3 max-md:py-1 max-md:text-[3.5vw]!"
              >
                {pill}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-3 max-sm:gap-2">
            {/* {installCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full border border-white/18 bg-transparent px-3 py-1 text-18 font-medium text-white/55 max-sm:px-2.5 max-sm:text-[3vw]!">
                {installCountLabel}
                <Download className="h-4 w-4 text-white/45 max-sm:h-3 max-sm:w-3" aria-hidden="true" />
              </span>
            )} */}
            {effect.tier === "pro" && (
              <span className="rounded-full bg-primary px-4 py-1.5 text18 font-medium text-white max-sm:px-4 max-sm:py-1 max-sm:text-[3.5vw]!">
                Pro
              </span>
            )}
          </div>
        </div>

        {/* Media: inset horizontally, centered vertically, 16:9 aspect ratio */}
        <div className="absolute inset-x-7 top-1/2 aspect-video -translate-y-1/2 overflow-hidden rounded-sm max-md:inset-x-4">
          <Image
            src={coverImage}
            alt={effect.title || effect.name}
            fill
            sizes={sizes}
            quality={60}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className={`object-cover transition-[opacity,transform] duration-500 ${
              showVideo ? "opacity-0" : "opacity-100"
            }`}
          />
          {hasAppeared && videoPreviewUrl && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="none"
              onLoadedData={() => setVideoReady(true)}
              onEmptied={() => setVideoReady(false)}
              onError={() => setVideoReady(false)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                showVideo ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pointer-events-none relative flex items-start justify-between gap-4 px-3 pt-5 pb-1 max-[1025px]:pt-8 max-md:gap-3 max-md:px-2 max-md:pt-7">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="truncate font-sans text22 font-medium leading-none text-white max-md:text-base">
            <span>
              {effect.title}
            </span>
          </h3>
          <p className="text18 text-[#AEAEAE] max-md:text-xs">
            {primaryCategoryLabel}
          </p>
        </div>

        <div className="pointer-events-auto relative z-30 flex shrink-0 items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-[1025px]:opacity-100 max-md:gap-1.5">
          <button
            type="button"
            data-no-card-link
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist?.(effect);
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-white/10 max-[1025px]:h-12 max-[1025px]:w-12 max-md:h-10 max-md:w-10"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 max-[1025px]:h-6 max-[1025px]:w-6 max-md:h-5 max-md:w-5 ${
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
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-white/10 max-[1025px]:h-12 max-[1025px]:w-12 max-md:h-10 max-md:w-10"
            aria-label="Preview"
          >
            <Eye className="h-4 w-4 max-[1025px]:h-6 max-[1025px]:w-6 max-md:h-5 max-md:w-5" />
          </button>

          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white max-[1025px]:h-12 max-[1025px]:w-12 max-md:h-10 max-md:w-10"
            aria-hidden="true"
          >
            <ArrowUpRight className="h-5 w-5 max-md:h-4 max-md:w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
