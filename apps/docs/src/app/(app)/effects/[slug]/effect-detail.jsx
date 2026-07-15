"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  Suspense,
  forwardRef,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { VaultLayout } from "@/components/layout/VaultLayout";
import { AppVaultHeader as VaultHeader } from "@/components/layout/AppVaultHeader";
import { EffectCard } from "@/components/ui/EffectCardNew";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  FAQContent,
  FAQGroup,
  FAQTitle,
  FAQWrapper,
} from "@/components/animated-faq";
import { getEffectHref, getEffectPreviewHref } from "@/lib/categories";
import { resolveEffectVideoUrl, resolveMediaUrl } from "@/lib/media";
import Button from "@/components/WebsiteComps/Button";
import CircularButton from "@/components/WebsiteComps/CirclularButton";
import HeadAnim from "@/components/Animations/HeadAnim";
import Copy from "@/components/Animations/Copy";
import { useFadeUp, useLineAnim } from "@/components/Animations/gsapAnimations";
import styles from "./effect-content.module.css";
import { ChevronLeft, ChevronRight, LockKeyhole } from "lucide-react";
import { CustomAnimationFormTrigger } from "@/components/WebsiteComps/modals/CustomAnimationFormModal";

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={[
        "relative overflow-hidden bg-[#272727]",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.4s_infinite]",
        "before:bg-linear-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className,
      ].join(" ")}
    />
  );
}

function EffectDetailMainSkeleton() {
  return (
    <main className="mx-auto w-full relative px-10 max-md:px-0 pt-25 pb-12 max-sm:pt-36">
      <section className="space-y-7">
        <div className="flex items-start max-sm:px-[7vw] max-md:px-[6vw] justify-between gap-5">
          <div className="w-full space-y-5">
            <div className="mb-6 flex w-fit max-w-full flex-wrap items-center gap-2 max-md:mx-auto max-md:justify-center">
              <SkeletonBlock className="h-4 w-12 rounded-full bg-[#272727]" />
              <span className="text-white/25">/</span>
              <SkeletonBlock className="h-4 w-16 rounded-full bg-[#272727]" />
              <span className="text-white/25">/</span>
              <SkeletonBlock className="h-4 w-24 rounded-full bg-[#272727]" />
              <span className="text-white/25">/</span>
              <SkeletonBlock className="h-4 w-40 rounded-full bg-[#272727]" />
            </div>

            <SkeletonBlock className="h-[5.2vw] w-[62%] rounded-md bg-[#272727] max-md:mx-auto max-md:h-14 max-md:w-[82%] max-sm:h-12" />

            <div className="space-y-3 max-md:mx-auto max-md:w-[90%]">
              <SkeletonBlock className="h-5 w-[72%] rounded-full bg-[#272727] max-md:mx-auto" />
              <SkeletonBlock className="h-5 w-[54%] rounded-full bg-[#272727] max-md:mx-auto" />
            </div>

            <div className="mt-12 flex w-full items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <SkeletonBlock className="h-10 w-20 rounded-full bg-[#272727]" />
                <SkeletonBlock className="h-10 w-24 rounded-full bg-[#272727]" />
                <SkeletonBlock className="h-10 w-18 rounded-full bg-[#272727]" />
              </div>

              <div className="ml-auto shrink-0 max-sm:hidden">
                <SkeletonBlock className="h-12 w-36 rounded-full bg-[#ff5f00]/45" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-sm:px-[7vw] max-md:px-[6vw] h-[46vw] rounded-sm w-full">
          <SkeletonBlock className="h-full w-full rounded-sm bg-[#272727]" />
        </div>

        <div className="max-sm:flex max-sm:px-[7vw] max-md:px-[6vw] w-full max-sm:pt-4 justify-center shrink-0 hidden">
          <SkeletonBlock className="h-12 w-36 rounded-full bg-[#ff5f00]/45" />
        </div>

        <div className="relative max-sm:px-[7vw] max-md:px-[6vw] pt-[1.5vw]">
          <div className="space-y-8 w-[70%] max-md:w-full">
            <SkeletonBlock className="h-10 w-[58%] rounded-md bg-[#272727]" />

            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-full rounded-full bg-[#272727]" />
              <SkeletonBlock className="h-5 w-[92%] rounded-full bg-[#272727]" />
              <SkeletonBlock className="h-5 w-[76%] rounded-full bg-[#272727]" />
            </div>

            <SkeletonBlock className="h-9 w-[46%] rounded-md bg-[#272727]" />

            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-full rounded-full bg-[#272727]" />
              <SkeletonBlock className="h-5 w-[88%] rounded-full bg-[#272727]" />
              <SkeletonBlock className="h-5 w-[64%] rounded-full bg-[#272727]" />
            </div>

            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-[82%] rounded-full bg-[#272727]" />
              <SkeletonBlock className="h-5 w-[70%] rounded-full bg-[#272727]" />
              <SkeletonBlock className="h-5 w-[74%] rounded-full bg-[#272727]" />
            </div>

            <SkeletonBlock className="h-[18vw] w-full rounded-xl bg-[#171717] max-md:h-64" />
          </div>
        </div>

        <div className="w-[70%] max-md:w-full max-sm:px-[7vw] max-md:px-[6vw] max-sm:mt-[10vw]">
          <div className="w-full rounded-md bg-[#272727] my-[5vw] mx-auto px-10 max-md:px-6 max-sm:px-[7vw] py-15">
            <SkeletonBlock className="h-10 w-[52%] rounded-md bg-[#333333] max-sm:h-8 max-sm:w-[84%]" />

            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-5 w-[78%] rounded-full bg-[#333333]" />
              <SkeletonBlock className="h-5 w-[58%] rounded-full bg-[#333333]" />
            </div>

            <SkeletonBlock className="mt-7 h-12 w-36 rounded-full bg-white/40" />
          </div>
        </div>

        <section className="my-20 relative max-sm:pt-[5vh] space-y-10 max-md:space-y-16">
          <div className="flex items-center justify-between gap-5 max-md:flex-col">
            <SkeletonBlock className="h-12 w-[30%] rounded-md bg-[#272727] max-md:w-[60%] max-sm:w-[80%]" />
            <SkeletonBlock className="h-12 w-44 rounded-full bg-[#ff5f00]/45 max-md:hidden" />
          </div>

          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`related-effect-skeleton-${index}`}
                className="min-w-[31vw] max-xl:min-w-[44vw] max-md:min-w-[55vw] max-sm:min-w-full"
              >
                <div className="relative aspect-[1.02/1] w-full overflow-hidden rounded-md bg-[#272727] p-[2vw] max-md:p-5 max-sm:p-5">
                  <div className="flex h-full w-full items-center justify-center">
                    <SkeletonBlock className="aspect-[1.78/1] w-[88%] rounded-sm bg-[#111111]" />
                  </div>
                </div>

                <div className="mt-5 px-3">
                  <SkeletonBlock className="mb-2 h-5 w-[58%] rounded-sm bg-[#2f2f2f]" />
                  <SkeletonBlock className="h-4 w-[34%] rounded-sm bg-[#242424]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export function EffectDetailContent({
  slug,
  categorySlug,
  effect,
  content,
  relatedEffects = [],
  effectCounts,
  totalEffects,
  isLocked = false,
  userPlan = "free",
  searchEffects = [],
}) {
  useFadeUp();
  useLineAnim();

  const router = useRouter();

  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef(null);
  const contentRef = useRef(null);
  const ctaSectionRef = useRef(null);
  const relatedEffectsRef = useRef(null);
  const relatedSliderRef = useRef(null);

  const relatedSliderDragRef = useRef({
    isPointerDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);


  //testing purpose

  const TEST_MAIN_SKELETON_DELAY = 0; // set to 0 before production

  const [hasPassedMainSkeletonDelay, setHasPassedMainSkeletonDelay] = useState(
    TEST_MAIN_SKELETON_DELAY === 0
  );

  useEffect(() => {
    if (TEST_MAIN_SKELETON_DELAY === 0) {
      queueMicrotask(() => {
        setHasPassedMainSkeletonDelay(true);
      });
      return;
    }

    queueMicrotask(() => {
      setHasPassedMainSkeletonDelay(false);
    });

    const timeoutId = window.setTimeout(() => {
      setHasPassedMainSkeletonDelay(true);
    }, TEST_MAIN_SKELETON_DELAY);

    return () => window.clearTimeout(timeoutId);
  }, [slug, categorySlug]);

  const isMainDataLoading =
    !hasPassedMainSkeletonDelay || !effect || !content;

  const safeEffect = effect || {};
  const safeContent = content || null;
  const safeRelatedEffects = Array.isArray(relatedEffects)
    ? relatedEffects
    : [];

  const videoPreviewUrl = resolveEffectVideoUrl({
    videoUrl: content?.videoUrl || safeEffect.videoUrl || `${slug}.mp4`,
  });

  const updateRelatedScrollState = useCallback(() => {
    const slider = relatedSliderRef.current;

    if (!slider) return;

    const { scrollLeft, scrollWidth, clientWidth } = slider;

    setCanScrollPrev(scrollLeft > 8);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);


  const showVideo = videoPreviewUrl && !videoError && videoReady;
  const showRelatedSliderControls = safeRelatedEffects.length > 3;

  const pageTitle = safeContent
    ? safeContent.title?.trim()
    : safeEffect.title;

  const pageSummary = safeContent
    ? safeContent.summary?.trim()
    : safeEffect.description;

  const hasCtaSection = Boolean(
    safeContent?.ctaBanner?.heading || safeContent?.ctaBanner?.buttonText
  );

  const scrollRelatedEffects = (direction) => {
    const slider = relatedSliderRef.current;

    if (!slider) return;

    const scrollAmount = slider.clientWidth * 0.86;

    slider.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });

    requestAnimationFrame(updateRelatedScrollState);
    setTimeout(updateRelatedScrollState, 250);
  };

  useEffect(() => {
    const slider = relatedSliderRef.current;

    if (!slider) return;

    queueMicrotask(() => {
      updateRelatedScrollState();
    });

    slider.addEventListener("scroll", updateRelatedScrollState, {
      passive: true,
    });

    return () => {
      slider.removeEventListener("scroll", updateRelatedScrollState);
    };
  }, [updateRelatedScrollState, safeRelatedEffects.length]);

  const handleRelatedPointerDown = (event) => {
    const slider = relatedSliderRef.current;

    if (!slider) return;

    relatedSliderDragRef.current = {
      isPointerDown: true,
      isDragging: false,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: slider.scrollLeft,
    };
  };

  const handleRelatedPointerMove = (event) => {
    const slider = relatedSliderRef.current;
    const dragState = relatedSliderDragRef.current;

    if (!slider || !dragState.isPointerDown) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    const isHorizontalDrag =
      Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY);

    if (!isHorizontalDrag && !dragState.isDragging) return;

    dragState.isDragging = true;

    event.preventDefault();

    slider.scrollLeft = dragState.scrollLeft - deltaX;
  };

  const handleRelatedPointerEnd = () => {
    const dragState = relatedSliderDragRef.current;

    dragState.isPointerDown = false;

    window.setTimeout(() => {
      dragState.isDragging = false;
    }, 0);
  };

  const handleRelatedCardClick = useCallback(
    (event, relatedEffect) => {
      const dragState = relatedSliderDragRef.current;

      if (dragState.isDragging) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const interactiveEl = event.target.closest(
        "button, input, textarea, select, [role='button'], [data-no-card-link]"
      );

      if (interactiveEl) return;

      event.preventDefault();
      event.stopPropagation();

      router.push(getEffectHref(relatedEffect));
    },
    [router]
  );

  const handleVideoReady = () => {
    const video = videoRef.current;

    setVideoReady(true);

    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.play?.().catch(() => { });
  };

  const previewHref = getEffectPreviewHref({
    ...safeEffect,
    effectSlug: slug,
    categorySlug,
  });

  const dependencies = Array.isArray(content?.tags) && content.tags.length > 0
    ? content.tags
    : safeEffect.dependencies || [];

  const coverImage =
    resolveMediaUrl(content?.coverImage || safeEffect.coverImage || slug, {
      defaultDirectory: "vault-listing-images",
      defaultExtension: "png",
    }) || "/assets/img/image01.webp";

  return (
    <VaultLayout
      effectCounts={effectCounts || {}}
      totalEffects={totalEffects || 0}
      bgImageSrc=""
      activeCategory={categorySlug || safeEffect.categories?.[0] || safeEffect.category}
      searchEffects={searchEffects}
    >
      <div className="min-h-screen text-foreground">
        <Suspense fallback={<div className="h-12" />}>
          <VaultHeader effectName={pageTitle || safeEffect.title}
            showSearch={true}
            effects={searchEffects} />
        </Suspense>

        {isMainDataLoading ? (
          <EffectDetailMainSkeleton />
        ) : (
          <main className="mx-auto w-full relative px-10 max-md:px-0 pt-25 pb-12 max-sm:pt-36">
            <section className="space-y-7">
              <div className="flex items-start max-sm:px-[7vw] max-md:px-[6vw] justify-between gap-5">
                <div className="w-full space-y-5">
                  <Breadcrumb />

                  {pageTitle && (
                    <HeadAnim>
                      <h1 className="w-full max-sm:text-[6vw] max-sm:font-bold max-md:w-[90%] max-sm:w-[80%] max-md:mx-auto max-md:text-center font-semibold leading-[1.05] max-sm:leading-[1.3] text-foreground text80">
                        {pageTitle}
                      </h1>
                    </HeadAnim>
                  )}

                  {pageSummary && (
                    <Copy delay={0.5}>
                      <p className="mt-4 w-full max-md:text-center max-md:w-[90%] max-md:mx-auto text-foreground opacity-90 text22 leading-relaxed max-md:leading-[1.3]">
                        {pageSummary}
                      </p>
                    </Copy>
                  )}

                  <div className="mt-12 flex w-full items-center justify-between gap-3 fadeup max-sm:mt-8">
                    {(dependencies.length > 0 || (content?.tier ?? safeEffect.tier) === "pro") && (
                      <div className="flex flex-wrap items-center gap-2">
                        {dependencies.map((dep) => (
                          <span
                            key={dep}
                            className="rounded-full bg-[#272727] px-4 py-2 text20 capitalize text-foreground max-sm:text-muted max-sm:px-6"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="ml-auto shrink-0 max-sm:hidden">
                      <Button
                        text="Live Preview"
                        href={previewHref}
                        target_blank={true}
                        target="_blank"
                        variant="orange"
                        className="shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="fadeup max-sm:px-[7vw] max-md:px-[6vw] h-auto rounded-sm w-full">
                <div className="relative h-auto w-full aspect-16/8.5 overflow-hidden rounded-sm bg-black isolate">
                  <Image
                    src={coverImage}
                    alt={safeEffect.title || slug}
                    fill
                    sizes="(max-width: 1024px) 100vw, 980px"
                    priority
                    className={`rounded-[inherit] object-cover transition-all duration-500 ${showVideo ? "opacity-0" : "opacity-100"
                      }`}
                  />

                  {videoPreviewUrl && !videoError && (
                    <video
                      key={videoPreviewUrl}
                      ref={videoRef}
                      src={videoPreviewUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      onLoadedMetadata={handleVideoReady}
                      onLoadedData={handleVideoReady}
                      onCanPlay={handleVideoReady}
                      onPlaying={handleVideoReady}
                      onError={() => setVideoError(true)}
                      className={`absolute inset-0 h-full w-full rounded-[inherit] object-cover transition-opacity duration-500 ${showVideo ? "opacity-100" : "opacity-0"
                        }`}
                    />
                  )}


                  {!showVideo && (
                    <>
                      <div aria-hidden="true" className="absolute inset-0 rounded-[inherit] bg-black/40" />
                      <div className="absolute bottom-4 right-4 z-10">
                        <div
                          aria-label="Loading preview"
                          role="status"
                          className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="max-sm:flex max-sm:px-[7vw] max-md:px-[6vw] w-full max-sm:pt-4 justify-center shrink-0 hidden">
                <Button
                  text="Live Preview"
                  href={previewHref}
                  target="_blank"
                  variant="orange"
                  className="shrink-0"
                />
              </div>

              <div className="relative max-sm:px-[7vw] max-md:px-[6vw] pt-[1.5vw]">
                <div className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
                  <TableOfContents
                    containerRef={contentRef}
                    stopRef={hasCtaSection ? ctaSectionRef : relatedEffectsRef}
                    watchKey={slug}
                  />
                </div>

                <EffectDynamicContent
                  ref={contentRef}
                  content={safeContent}
                  isLocked={isLocked}
                />
              </div>

              <div className="w-[70%] max-md:w-full max-sm:px-[7vw] max-md:px-[6vw] max-sm:mt-[10vw]">
                <EffectCtaSection
                  cta={safeContent?.ctaBanner}
                  sectionRef={ctaSectionRef}
                />
              </div>

              {safeRelatedEffects?.length > 0 && (
                <section
                  ref={relatedEffectsRef}
                  className="my-20 relative max-sm:pt-[5vh] space-y-10 max-md:space-y-16"
                >
                  <div className="flex items-center justify-between gap-5 max-md:flex-col">
                    <HeadAnim>
                      <h2 className="text-center text-[3.32vw] max-md:text-[5vw] max-sm:text-[2rem] font-medium text-foreground">
                        Related Effects
                      </h2>
                    </HeadAnim>

                    <div className="fadeup flex max-md:hidden flex-col justify-center items-end gap-5 max-md:w-full max-md:items-stretch">
                      <Button
                        text="Explore all effects"
                        href="/effects"
                        variant="orange"
                        className="shrink-0"
                      />
                    </div>
                  </div>

                  <div className="max-md:hidden">
                    {showRelatedSliderControls && (
                      <div className="flex items-center justify-end gap-2 max-md:justify-center">
                        <CircularButton
                          type="button"
                          onClick={() => scrollRelatedEffects("previous")}
                          disabled={!canScrollPrev}
                          aria-label="Show previous related effects"
                          className={`h-11 w-11 p-4 border-white/12 bg-[#272727] text-white transition-all ${!canScrollPrev
                            ? "cursor-not-allowed opacity-50 hover:border-white/10"
                            : "hover:border-[#ff5f00]"
                            }`}
                          bgColor="#ff5f00"
                        >
                          <ChevronLeft className="h-5 w-5 transition-colors duration-500 group-hover:text-white" />
                        </CircularButton>

                        <CircularButton
                          type="button"
                          onClick={() => scrollRelatedEffects("next")}
                          disabled={!canScrollNext}
                          aria-label="Show next related effects"
                          className={`h-11 p-4 w-11 border-white/12 bg-[#272727] text-white transition-all ${!canScrollNext
                            ? "cursor-not-allowed opacity-50 hover:border-white/10"
                            : "hover:border-[#ff5f00]"
                            }`}
                          bgColor="#ff5f00"
                        >
                          <ChevronRight className="h-5 w-5 transition-colors duration-500 group-hover:text-white" />
                        </CircularButton>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl fadeup">
                    <div
                      ref={relatedSliderRef}
                      onPointerDown={handleRelatedPointerDown}
                      onPointerMove={handleRelatedPointerMove}
                      onPointerUp={handleRelatedPointerEnd}
                      onPointerLeave={handleRelatedPointerEnd}
                      onPointerCancel={handleRelatedPointerEnd}
                      onDragStart={(event) => event.preventDefault()}
                      className="flex cursor-grab snap-x snap-mandatory select-none gap-6 overflow-x-auto max-sm:gap-6 max-md:gap-2 scroll-smooth pb-4 active:cursor-grabbing"
                    >
                      {safeRelatedEffects.map((relatedEffect) => (
                        <div
                          key={relatedEffect.name}
                          onClick={(event) =>
                            handleRelatedCardClick(event, relatedEffect)
                          }
                          className="min-w-[31vw] cursor-pointer max-sm:px-[7vw] max-md:px-[6vw] snap-start max-xl:min-w-[44vw] max-md:min-w-[55vw]! max-sm:min-w-full!"
                        >
                          <EffectCard
                            effect={relatedEffect}
                            sizes="(max-width: 639px) 100vw, (max-width: 767px) 55vw, (max-width: 1023px) 44vw, 31vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hidden max-md:block">
                    {showRelatedSliderControls && (
                      <div className="flex items-center justify-end gap-2 max-md:justify-center">
                        <CircularButton
                          type="button"
                          onClick={() => scrollRelatedEffects("previous")}
                          disabled={!canScrollPrev}
                          aria-label="Show previous related effects"
                          className={`h-11 w-11 p-4 border-white/12 bg-[#272727] text-white transition-all ${!canScrollPrev
                            ? "cursor-not-allowed opacity-50 hover:border-white/10"
                            : "hover:border-[#ff5f00]"
                            }`}
                          bgColor="#ff5f00"
                        >
                          <ChevronLeft className="h-5 w-5 transition-colors duration-500 group-hover:text-white" />
                        </CircularButton>

                        <CircularButton
                          type="button"
                          onClick={() => scrollRelatedEffects("next")}
                          disabled={!canScrollNext}
                          aria-label="Show next related effects"
                          className={`h-11 p-4 w-11 border-white/12 bg-[#272727] text-white transition-all ${!canScrollNext
                            ? "cursor-not-allowed opacity-50 hover:border-white/10"
                            : "hover:border-[#ff5f00]"
                            }`}
                          bgColor="#ff5f00"
                        >
                          <ChevronRight className="h-5 w-5 transition-colors duration-500 group-hover:text-white" />
                        </CircularButton>
                      </div>
                    )}
                  </div>

                  <div className="fadeup max-md:mx-auto max-md:flex hidden flex-col justify-center items-end gap-5 max-md:w-fit max-md:items-stretch">
                    <Button
                      text="Explore all effects"
                      href="/effects"
                      variant="orange"
                      className="shrink-0"
                    />
                  </div>
                </section>
              )}
            </section>
          </main>
        )}
      </div>
    </VaultLayout>
  );
}

const EffectDynamicContent = forwardRef(function EffectDynamicContent(
  { content, isLocked = false },
  ref
) {
  if (!content) return null;

  return (
    <div
      ref={ref}
      className={`space-y-8 w-[70%] max-md:w-full ${styles.content}`}
    >
      <SanityBodyRenderer body={content.body} isLocked={isLocked} />
    </div>
  );
});

function EffectCtaSection({ cta, sectionRef }) {
  if (!cta?.heading && !cta?.buttonText) return null;

  const buttonLink = cta.buttonLink || "#";

  return (
    <section
      ref={sectionRef}
      className="fadeup w-full bg-[#272727] rounded-md my-[5vw] mx-auto"
    >
      <div className="mx-auto w-full flex flex-col items-start max-w-6xl px-10 max-md:px-6 max-sm:px-[6vw] py-15">
        {cta.heading && (
          <h2 className="text-[2.5vw] font-medium text-foreground max-sm:text-[7vw]">
            {cta.heading}
          </h2>
        )}

        {cta.description && (
          <p className="mt-4 max-w-3xl text20 text-muted">
            {cta.description}
          </p>
        )}

        <div className="w-fit max-sm:mt-[8vw] mt-6">
          <CustomAnimationFormTrigger>
            {cta.buttonText && (

              <Button
                preventDefault={false}
                text={cta.buttonText}
                href={buttonLink}
                scaleClass="group-hover:scale-[100]!"
                target="_blank"
                variant="white"
                className="shrink-0 w-fit max-sm:px-5! max-sm:py-3! max-sm:gap-4! max-sm:text-lg!"
              />
            )}
          </CustomAnimationFormTrigger>
        </div>
      </div>
    </section>
  );
}

function SanityBodyRenderer({ body = [], isLocked = false }) {
  if (!body.length) return null;

  const groupedBlocks = groupBodyBlocks(body);

  return (
    <div className="space-y-6">
      {groupedBlocks.map((block, index) => (
        <SanityBodyBlock
          key={block._key || block._groupKey || `${block._type}-${index}`}
          block={block}
          isLocked={isLocked}
        />
      ))}
    </div>
  );
}

function SanityBodyBlock({ block, isLocked = false }) {
  if (!block) return null;

  if (block._type === "block") {
    return <PortableTextBlock block={block} isLocked={isLocked} />;
  }

  if (block._type === "listGroup") {
    const ListTag = block.listItem === "number" ? "ol" : "ul";

    const listClassName =
      block.listItem === "number" ? `fadeup ${styles.numberList}` : "fadeup";

    return (
      <ListTag className={listClassName}>
        {block.items.map((item, index) => (
          <li key={item._key || `${block._groupKey}-${index}`}>
            {buildMarkedChildren(item)}
          </li>
        ))}
      </ListTag>
    );
  }

  if (block._type === "effectImage") {
    return (
      <figure className="fadeup">
        <div className={styles.imageFrame}>
          <img src={block.url} alt={block.alt || ""} className={styles.image} />
        </div>

        {block.caption && (
          <figcaption className={styles.caption}>{block.caption}</figcaption>
        )}
      </figure>
    );
  }

  if (block._type === "effectCodeBlock") {
    if (isLocked) {
      return (
        <LockedCodePlaceholder
          filename={block.filename}
          language={block.language || "jsx"}
        />
      );
    }

    return (
      <div className="fadeup">
        <CodeBlock
          code={normalizeCodeString(block.code || "")}
          language={block.language || "jsx"}
          filename={block.filename}
          hideHeaderWhenNoFilename
          className={!block.filename ? styles.contentCodeBlockNoFilename : ""}
        />
      </div>
    );
  }

  if (block._type === "horizontalRule") {
    return <hr className={`fadeup ${styles.contentDivider}`} />;
  }

  if (block._type === "effectFaqAccordion") {
    const faqItems = block.items || [];

    if (!faqItems.length) return null;

    return (
      <section className={`fadeup ${styles.faqAccordion}`}>
        {block.title && (
          <h2 className={styles.faqAccordionTitle}>{block.title}</h2>
        )}

        <FAQGroup
          allowMultiple={false}
          defaultOpenItems={faqItems[0]?._key ? [faqItems[0]._key] : []}
        >
          <div className={styles.faqAccordionItems}>
            {faqItems.map((item, index) => {
              const itemId = item._key || `faq-${index}`;

              return (
                <FAQWrapper
                  key={itemId}
                  itemId={itemId}
                  className={styles.faqAccordionItem}
                  titleClassName={styles.faqAccordionQuestion}
                  iconClassName={styles.faqAccordionIcon}
                  iconSize={18}
                  iconStrokeWidth={1.8}
                >
                  <FAQTitle
                    className="pb-0 justify-start gap-3"
                    iconPosition="left"
                    iconMode="rotate-left-down"
                  >
                    <h3 className={styles.faqAccordionQuestionHeading}>
                      {item.question}
                    </h3>
                  </FAQTitle>

                  <FAQContent className={`${styles.faqAccordionAnswer} pl-10`}>
                    {item.answer}
                  </FAQContent>
                </FAQWrapper>
              );
            })}
          </div>
        </FAQGroup>
      </section>
    );
  }

  if (block._type === "effectTableBlock") {
    return (
      <div className="space-y-3 fadeup">
        {block.caption && (
          <h3 className="text-xl tracking-tighter text-foreground">
            {block.caption}
          </h3>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {(block.headers || []).map((header, index) => (
                  <th key={`${header}-${index}`}>{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {(block.rows || []).map((row, rowIndex) => (
                <tr key={row._key || `${rowIndex}`}>
                  {(row.cells || []).map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (block._type === "effectCalloutBlock") {
    const toneClass =
      block.tone === "info"
        ? styles.calloutInfo
        : block.tone === "warning"
          ? styles.calloutWarning
          : block.tone === "success"
            ? styles.calloutSuccess
            : "";

    const shouldRenderAsCardGrid = !block.tone || block.tone === "default";

    return (
      <section className={`fadeup ${styles.callout} ${toneClass}`}>
        {block.title && <h3 className={styles.calloutTitle}>{block.title}</h3>}

        {shouldRenderAsCardGrid ? (
          <CalloutCardGrid body={block.content || []} />
        ) : (
          <SanityBodyRenderer body={block.content || []} isLocked={isLocked} />
        )}
      </section>
    );
  }

  return null;
}

function CalloutCardGrid({ body = [] }) {
  const items = body.map((block) => extractPlainBlockText(block)).filter(Boolean);

  if (!items.length) {
    return <SanityBodyRenderer body={body} />;
  }

  return (
    <div className={styles.calloutGrid}>
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className={styles.calloutGridItem}>
          {item}
        </div>
      ))}
    </div>
  );
}

function LockedCodePlaceholder({ filename }) {
  const teaserLines = [
    "const premiumSnippet = unlock({ technique: 'inspect-element-jutsu' });",
    "if (devtools.open) throw new Error('nice try, detective');",
    "console.log('inspect will not work every time, boss');",
    "const fallbackPlan = subscribe({ reason: 'time saved > ego' });",
    "return 'blurred until your Pro arc begins';",
  ];

  const subtitle =
    "You can preview it now. Pro install access opens next week for Founding Access users.";

  return (
    <section className="fadeup relative min-h-[40vh] max-sm:min-h-[40vh] max-md:min-h-[30vh] overflow-hidden  border rounded-md border-white/30">
      <div
        aria-hidden="true"
        className="absolute inset-0 "
      />
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">

        <div className="absolute left-2 top-0 max-md:top-3 max-md:left-3 max-sm:top-5 max-sm:left-0 px-6 py-5 text-[11px] leading-6 text-white max-sm:text-[10px]">
          {teaserLines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className="whitespace-nowrap  blur-md select-none"
            >
              <span className="mr-3 text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              {line}
            </p>
          ))}
          <p className="mt-4 whitespace-nowrap blur-md  text-[#9ad0ff]/25 select-none">
            {"// inspect won't work every time... time to subscribe ;)"}
          </p>
          <p className="whitespace-nowrap blur-md  text-[#b7ffb0]/25 select-none">
            {"export default function AccessDenied() {}"}
          </p>
        </div>
      </div>

      <div className="relative z-10 min-h-[40vh] max-sm:min-h-[40vh] max-md:min-h-[30vh] flex rounded-md  flex-col items-center justify-center gap-2  bg-white/5 px-8 py-6 text-center  max-sm:px-6">
        <LockKeyhole className="h-16 w-16 text-white" strokeWidth={1.2} />

        <div className="flex flex-col items-center gap-0">
          <h3 className="text-3xl font-bold text-white max-md:text-2xl max-sm:text-xl">
            This is a Pro effect.
          </h3>

          <p className="max-w-sm text-sm leading-[1.2]! max-md:leading-relaxed text-white/50">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center pt-3 max-md:pt-6 justify-center gap-3">
          <Button
            text="Upgrade to Pro"
            href="/pricing"
            variant="orange"
            className="shrink-0"
            hoverTextClassName="group-hover:text-black!"
          />
        </div>


      </div>
    </section>
  );
}

function PortableTextBlock({ block, isLocked = false }) {
  if (isCodeOnlyBlock(block)) {
    const code = normalizeCodeString(getBlockText(block));

    if (!code.trim()) return null;

    if (isLocked) {
      return <LockedCodePlaceholder language={inferCodeLanguage(code)} />;
    }

    return (
      <div className="fadeup">
        <CodeBlock code={code} language={inferCodeLanguage(code)} />
      </div>
    );
  }

  const children = buildMarkedChildren(block);
  const style = block.style || "normal";

  if (style === "h2") {
    return <h2 className="fadeup">{children}</h2>;
  }

  if (style === "h3") {
    return <h3 className="fadeup">{children}</h3>;
  }

  if (style === "blockquote") {
    return <blockquote className="fadeup">{children}</blockquote>;
  }

  if (block.listItem === "bullet") {
    return (
      <ul className="fadeup">
        <li>{children}</li>
      </ul>
    );
  }

  if (block.listItem === "number") {
    return (
      <ol className="fadeup">
        <li>{children}</li>
      </ol>
    );
  }

  return <p className="fadeup">{children}</p>;
}

function groupBodyBlocks(body) {
  const grouped = [];

  for (const block of body) {
    if (block?._type === "block" && block.listItem) {
      const previous = grouped[grouped.length - 1];

      if (
        previous?._type === "listGroup" &&
        previous.listItem === block.listItem &&
        (previous.level || 1) === (block.level || 1)
      ) {
        previous.items.push(block);
        continue;
      }

      grouped.push({
        _type: "listGroup",
        _groupKey: `list-${block._key || grouped.length}`,
        listItem: block.listItem,
        level: block.level || 1,
        items: [block],
      });

      continue;
    }

    grouped.push(block);
  }

  return grouped;
}

function isCodeOnlyBlock(block) {
  const children = block?.children || [];

  if (!children.length) return false;

  return children.every((child) => {
    if (child?._type !== "span") return false;

    const marks = child.marks || [];

    return marks.includes("code");
  });
}

function getBlockText(block) {
  return (block?.children || []).map((child) => child?.text || "").join("");
}

function extractPlainBlockText(block) {
  if (block?._type !== "block") return "";

  const text = getBlockText(block).trim();

  if (!text) return "";

  return text;
}

function inferCodeLanguage(code) {
  const trimmed = code.trim();

  if (
    trimmed.startsWith("npm ") ||
    trimmed.startsWith("npx ") ||
    trimmed.startsWith("pnpm ") ||
    trimmed.startsWith("yarn ")
  ) {
    return "bash";
  }

  return "jsx";
}

function normalizeCodeString(code) {
  return code
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function buildMarkedChildren(block) {
  const markDefs = block.markDefs || [];

  return (block.children || []).map((child, index) => {
    if (!child?.text) return null;

    let node = child.text;

    for (const mark of child.marks || []) {
      if (mark === "strong") {
        node = <strong key={`strong-${index}`}>{node}</strong>;
        continue;
      }

      if (mark === "em") {
        node = <em key={`em-${index}`}>{node}</em>;
        continue;
      }

      if (mark === "code") {
        node = (
          <code key={`code-${index}`} className={styles.contentInlineCode}>
            {node}
          </code>
        );
        continue;
      }

      const markDef = markDefs.find((item) => item._key === mark);

      if (markDef?._type === "link" && markDef.href) {
        node = (
          <a
            key={`link-${index}`}
            href={markDef.href}
            target="_blank"
            rel="noreferrer"
          >
            {node}
          </a>
        );
      }
    }

    return <span key={child._key || index}>{node}</span>;
  });
}
