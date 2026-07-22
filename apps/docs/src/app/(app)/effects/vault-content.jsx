"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VaultLayout } from "@/components/layout/VaultLayout";
import { AppVaultHeader as VaultHeader } from "@/components/layout/AppVaultHeader";
import { RouteFade } from "@/components/layout/RouteFade";
import { EffectCard } from "@/components/ui/EffectCardNew";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { emitWishlistChanged } from "@/lib/wishlistEvents";
import {
  effectsOverviewContent,
  effectCategories,
  freeEffectsContent,
  proEffectsContent,
  getEffectCategory,
  getEffectCategoryBySlug,
  getEffectCategoryHref,
} from "@/lib/categories";

import HeadAnim from "@/components/Animations/HeadAnim";
import { getFeaturedEffects } from "@/lib/featured-effects";
import Button from "@/components/WebsiteComps/Button";
import LinkButton from "@/components/WebsiteComps/LinkButton";
import { useFadeUp, useFadeIn } from "@/components/Animations/gsapAnimations";
import Copy from "@/components/Animations/Copy";
import { CustomAnimationFormTrigger } from "@/components/WebsiteComps/modals/CustomAnimationFormModal";
import { useUser } from "@clerk/nextjs";
import FAQs from "@/components/Homepage/FAQs";
import { FilterMenu, FILTER_OPTIONS } from "./FilterMenu";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Resolve category ID from Sanity categorySlug first, fall back to registry fields
function resolveEffectCategoryId(effect) {
  if (effect.categorySlug) {
    return getEffectCategoryBySlug(effect.categorySlug)?.id || effect.category;
  }
  return effect.categories?.[0] || effect.category;
}

function RouteAnimationSync({ syncKey }) {
  const refreshCallRef = useRef(null);

  useEffect(() => {
    refreshCallRef.current?.kill();

    refreshCallRef.current = gsap.delayedCall(0.12, () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh(true);
        });
      });
    });

    return () => {
      refreshCallRef.current?.kill();
    };
  }, [syncKey]);

  return null;
}

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={[
        "relative overflow-hidden bg-[#272727]",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.4s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className,
      ].join(" ")}
    />
  );
}



function EffectsGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-6 rounded-xl max-md:pt-6 max-sm:pt-0 grid-cols-3 max-md:grid-cols-[20%_40%_40%] max-sm:grid-cols-[20%_40%_40%] max-md:gap-10 max-sm:gap-16">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`effect-card-skeleton-${index}`}
          className="effect-card-shell group relative"
        >
          <div className="relative aspect-[1.02/1] w-full overflow-hidden rounded-md bg-[#272727] p-[2vw] max-md:p-5 max-sm:p-5">
            {index % 3 === 2 && (
              <SkeletonBlock className="absolute right-4 top-4 h-10 w-14 rounded-full bg-[#3a3a3a]" />
            )}

            <div className="flex h-full w-full items-center justify-center">
              <SkeletonBlock className="aspect-[1.78/1] w-[88%] rounded-sm bg-[#111111]" />
            </div>
          </div>

          <div className="relative mt-5 flex items-start justify-between gap-4 px-3 max-sm:px-1">
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="mb-2 h-5 w-[58%] rounded-sm bg-[#2f2f2f]" />
              <SkeletonBlock className="h-4 w-[34%] rounded-sm bg-[#242424]" />
            </div>

            <div className="hidden items-center gap-3 xl:flex">
              <SkeletonBlock className="h-10 w-10 rounded-full bg-[#161616]" />
              <SkeletonBlock className="h-10 w-10 rounded-full bg-[#161616]" />
              <SkeletonBlock className="h-10 w-10 rounded-full bg-[#ff5f00]/50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function VaultContent({
  effects: incomingEffects,
  effectCounts: incomingEffectCounts,
  initialCategory = "all",
  userPlan = "free",
  isLoading = false,
}) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamString = searchParams.toString();

  const justUpgraded = searchParams.get("upgraded") === "true";
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [upgradeToastDismissed, setUpgradeToastDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wishlistTimerRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!showWishlistToast) return;
    wishlistTimerRef.current = setTimeout(() => setShowWishlistToast(false), 6000);
    return () => clearTimeout(wishlistTimerRef.current);
  }, [showWishlistToast]);

const animationSearchParamString = useMemo(() => {
  const params = new URLSearchParams(searchParamString);

  params.delete("waitlist");
  params.delete("custom-animation-form");
  params.delete("upgraded");

  return params.toString();
}, [searchParamString]);

const routeKey = `${pathname}${
  animationSearchParamString ? `?${animationSearchParamString}` : ""
}`;

  const safeEffects = useMemo(
    () => (Array.isArray(incomingEffects) ? incomingEffects : []),
    [incomingEffects]
  );
  const safeEffectCounts = useMemo(
    () =>
      incomingEffectCounts &&
      typeof incomingEffectCounts === "object" &&
      !Array.isArray(incomingEffectCounts)
        ? incomingEffectCounts
        : {},
    [incomingEffectCounts]
  );

  const categoryPageRef = useRef(null);
  const routeTweenRef = useRef(null);

  useFadeUp(categoryPageRef, [routeKey]);
  useFadeIn(categoryPageRef, [routeKey]);

  // testing purpose - set to 0 in production, any positive ms to show skeleton
  const TEST_SKELETON_DELAY = 0;
  const [hasPassedSkeletonDelay, setHasPassedSkeletonDelay] = useState(
    TEST_SKELETON_DELAY === 0
  );

  useEffect(() => {
    if (TEST_SKELETON_DELAY === 0) return;

    setHasPassedSkeletonDelay(false);

    const timeoutId = window.setTimeout(() => {
      setHasPassedSkeletonDelay(true);
    }, TEST_SKELETON_DELAY);

    return () => window.clearTimeout(timeoutId);
  }, [routeKey]);

  const isProUser = userPlan === "pro";
  const isEffectsLoading =
    isLoading || !hasPassedSkeletonDelay || !Array.isArray(incomingEffects);

  const isCountsLoading =
    isLoading ||
    !hasPassedSkeletonDelay ||
    !incomingEffectCounts ||
    typeof incomingEffectCounts !== "object";

  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [gridColumns, setGridColumns] = useState(3);

  const featuredEffects = useMemo(
    () => getFeaturedEffects(safeEffects),
    [safeEffects]
  );

  const featuredEffectNames = useMemo(
    () => new Set(featuredEffects.map((effect) => effect.name)),
    [featuredEffects]
  );

  const categoryFromUrl = useMemo(() => {
    const queryCategory = new URLSearchParams(searchParamString).get("category");

    if (queryCategory) {
      return queryCategory === "all" ? initialCategory : queryCategory;
    }

    const [, rootSegment, categorySlug] = pathname.split("/");

    if (rootSegment !== "effects" || !categorySlug) {
      return initialCategory;
    }

    return getEffectCategoryBySlug(categorySlug)?.id || initialCategory;
  }, [initialCategory, pathname, searchParamString]);

  const categoryFilter = categoryFromUrl;

  const refreshAfterCategoryChange = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });
  }, []);

 const getCategoryUrl = useCallback(
  (nextCategory) => {
    const resolvedCategory = nextCategory || "all";

    const params = new URLSearchParams(searchParamString);

    params.delete("category");
    params.delete("waitlist");
    params.delete("custom-animation-form");

    const nextQuery = params.toString();
    const categoryHref = getEffectCategoryHref(resolvedCategory);

    return nextQuery ? `${categoryHref}?${nextQuery}` : categoryHref;
  },
  [searchParamString]
);

  const navigateWithRouteFade = useCallback(
    (href) => {
      if (!href || typeof window === "undefined") {
        return true;
      }

      const currentUrl = `${pathname}${searchParamString ? `?${searchParamString}` : ""
        }`;

      if (href === currentUrl) {
        return true;
      }

      const page = categoryPageRef.current;

      setSearchQuery("");

      routeTweenRef.current?.kill();

      if (!page) {
        router.push(href, { scroll: false });
        return true;
      }

      routeTweenRef.current = gsap.to(page, {
        autoAlpha: 0,
        y: 0,
        duration: 0.32,
        ease: "power2.inOut",
        onComplete: () => {
          router.push(href, { scroll: false });

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              ScrollTrigger.refresh();
            });
          });
        },
      });

      return true;
    },
    [pathname, router, searchParamString]
  );

  useEffect(() => {
    const page = categoryPageRef.current;

    routeTweenRef.current?.kill();

    if (page) {
      gsap.set(page, {
        autoAlpha: 1,
        y: 0,
      });
    }

    refreshAfterCategoryChange();

    return () => {
      routeTweenRef.current?.kill();
    };
  }, [routeKey, refreshAfterCategoryChange]);

  const handleCategoryLinkClick = useCallback(
    (nextCategory) => {
      const href = getCategoryUrl(nextCategory || "all");

      return navigateWithRouteFade(href);
    },
    [getCategoryUrl, navigateWithRouteFade]
  );

  const showAllEffects = useCallback(() => {
    return navigateWithRouteFade("/effects");
  }, [navigateWithRouteFade]);

  const quickCategories = useMemo(() => {
    const knownCategories = effectCategories
      .filter(
        (category) =>
          category.id !== "featured" && safeEffectCounts?.[category.id]
      )
      .map((category) => category.id);

    const extraCategories = Object.keys(safeEffectCounts || {}).filter(
      (id) =>
        id &&
        id !== "all" &&
        id !== "featured" &&
        !knownCategories.includes(id) &&
        safeEffectCounts[id]
    );

    return ["featured", "free", "pro", ...knownCategories, ...extraCategories];
  }, [safeEffectCounts]);

  const categoryChips = useMemo(
    () => quickCategories.filter((cat) => !FILTER_OPTIONS.includes(cat)),
    [quickCategories]
  );

  const activeFilter = FILTER_OPTIONS.includes(categoryFilter)
    ? categoryFilter
    : null;

  const getQuickCategoryLabel = useCallback((cat) => {
    if (cat === "free") return "Free";
    if (cat === "pro") return "Pro";
    if (cat === "featured") return "Featured";
    if (cat === "webgl") return "WebGL";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;

    async function loadWishlist() {
      try {
        const res = await fetch("/api/wishlist");

        if (!res.ok) return;

        const data = await res.json();

        setWishlist(
          (data || []).map((item) => item.effect_slug || item.name || item)
        );
      } catch (err) {
        console.error(err);
      }
    }

    loadWishlist();
  }, [isSignedIn]);

  const toggleWishlist = async (effect) => {
    if (!isSignedIn) {
      setShowWishlistToast(true);
      return;
    }

    try {
      const slug = effect.name;

      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ effect }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error(data);
        return;
      }

      const data = await res.json();

      if (data.saved) {
        setWishlist((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
      } else {
        setWishlist((prev) => prev.filter((x) => x !== slug));
      }

      emitWishlistChanged(data.saved);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEffects = useMemo(() => {
    if (isEffectsLoading) return [];

    return safeEffects.filter((effect) => {
      if (categoryFilter === "free") {
        if (effect.tier === "pro") return false;
      } else if (categoryFilter === "pro") {
        if (effect.tier !== "pro") return false;
      } else if (categoryFilter === "featured") {
        if (!featuredEffectNames.has(effect.name)) return false;
      } else if (categoryFilter !== "all") {
        if (resolveEffectCategoryId(effect) !== categoryFilter) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const catId = resolveEffectCategoryId(effect);

        return (
          effect.name.toLowerCase().includes(query) ||
          effect.title.toLowerCase().includes(query) ||
          catId?.toLowerCase().includes(query) ||
          effect.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [
    safeEffects,
    categoryFilter,
    searchQuery,
    featuredEffectNames,
    isEffectsLoading,
  ]);

  const totalEffects = useMemo(() => {
    if (isEffectsLoading) return 0;

    if (categoryFilter === "all") {
      return safeEffects.length;
    }

    if (categoryFilter === "free") {
      return safeEffects.filter((effect) => effect.tier !== "pro").length;
    }

    if (categoryFilter === "pro") {
      return safeEffects.filter((effect) => effect.tier === "pro").length;
    }

    if (categoryFilter === "featured") {
      return featuredEffects.length;
    }

    return safeEffects.filter(
      (effect) => resolveEffectCategoryId(effect) === categoryFilter
    ).length;
  }, [safeEffects, categoryFilter, featuredEffects, isEffectsLoading]);

  const activeCategory = getEffectCategory(categoryFilter);

  const activeCategoryContent =
    categoryFilter === "all"
      ? effectsOverviewContent
      : categoryFilter === "free"
        ? freeEffectsContent
        : categoryFilter === "pro"
          ? proEffectsContent
          : activeCategory;

  const activeCategoryName = activeCategoryContent?.name || categoryFilter;

  const activeCategoryDescription =
    activeCategoryContent?.description ||
    "Explore free effects from the Hyperiux vault, ready to install, remix, and use in real projects.";

  const activeCategoryDescriptions = Array.isArray(activeCategoryDescription)
    ? activeCategoryDescription
    : [activeCategoryDescription];

  const activeCategoryFaqItems = useMemo(
    () =>
      (activeCategoryContent?.faqs || []).map((item, index) => ({
        id: `${categoryFilter}-faq-${index + 1}`,
        question: item.question,
        answer: item.answer,
        defaultOpen: index === 0,
      })),
    [activeCategoryContent?.faqs, categoryFilter]
  );

  return (
    <>
    <VaultLayout
      effectCounts={safeEffectCounts}
      effects={safeEffects}
      activeCategory={categoryFilter}
      onOverviewNavigate={showAllEffects}
      onCategoryNavigate={handleCategoryLinkClick}
    >
      {({ isSidebarOpen }) => (
        <>
        {/* Outside RouteFade: its transform would turn the header's
            position:fixed into transform-relative and scroll it away. */}
        <VaultHeader
          showSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalEffects={totalEffects}
          effects={safeEffects}
        />

        <RouteFade
          key={routeKey}
          motionKey={routeKey}
          ref={categoryPageRef}
          className="relative min-h-screen text-foreground effects-comp border-b border-white/10"
        >

          <RouteAnimationSync syncKey={routeKey} />

          <div>
            <div
              key={`category-intro-${categoryFilter}`}
              className="mx-auto px-8 pt-28 pb-12 text-center space-y-8 max-sm:px-7 max-sm:pt-32 max-sm:pb-16"
            >
              <Breadcrumb className="fadeup mx-auto" />

              <HeadAnim animateOnScroll={false} delay={0.3} animationKey={routeKey}>
                <h1
                  className="mb-4 mx-auto w-[80%] font-display text110 font-normal text-foreground max-sm:w-[90%] max-sm:text-4xl"
                  style={{ lineHeight: "1.1" }}
                >
                  {activeCategoryName}
                </h1>
              </HeadAnim>

              <div className="category-fadeup mx-auto flex max-w-[65vw] flex-col text-lg text-muted max-md:max-w-full max-sm:text-base">
                {activeCategoryDescriptions.map((description, index) => (
                  <Copy
                    key={`${categoryFilter}-description-${index}`}
                    delay={0.3}
                    animationKey={`${routeKey}-${index}`}
                  >
                    <p className="mt-3">
                      {description}
                    </p>
                  </Copy>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto px-10 pb-7 pt-20 max-sm:px-0 max-md:pt-10">
            <div
              className="relative max-md:w-full flex items-end gap-4 fadein"
              data-fadein-delay="1"
            >
              <div className="relative min-w-0 flex-1">
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 hidden w-12 max-md:block"
                style={{
                  background:
                    "linear-gradient(to left, var(--background, #000) 0%, transparent 100%)",
                }}
              />


                <div
                  className={[
                    "category-fadeup flex items-center gap-2.5",
                    "flex-wrap",
                    "max-md:flex-nowrap max-md:overflow-x-auto max-md:px-6",
                    "scrollbar-thin [scrollbar-color:#CC4C04_transparent]",
                    "[&::-webkit-scrollbar]:h-1",
                    "[&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-track]:rounded-full",
                    "[&::-webkit-scrollbar-thumb]:bg-[#CC4C04] [&::-webkit-scrollbar-thumb]:rounded-full",
                    "max-md:pb-3",
                  ].join(" ")}
                  
                >
                  {/* Filter dropdown: featured / free / pro */}
                  <FilterMenu
                    activeFilter={activeFilter}
                    categoryFilter={categoryFilter}
                    getLabel={getQuickCategoryLabel}
                    onSelect={handleCategoryLinkClick}
                  />

                  {/* Divider between filters and categories */}
                  <span
                    aria-hidden="true"
                    className="mx-1 h-7 w-px shrink-0 self-center bg-white/15 max-sm:h-6"
                  />

                  {categoryChips.map((cat) => {
                    const isSelected = categoryFilter === cat;
                    const label = getQuickCategoryLabel(cat);

                    return (
                      <Link
                        key={cat}
                        href={getCategoryUrl(cat)}
                        scroll={false}
                        onClick={(event) => {
                          event.preventDefault();
                          handleCategoryLinkClick(cat);
                        }}
                        className={`
                          px-6 py-2.5 text-md text-center relative rounded-full max-sm:px-5 max-sm:py-2
                          backdrop-blur-[6px] font-sans group flex items-center cursor-pointer
                          transition-colors duration-300 max-sm:text-lg text20
                          ${isSelected
                            ? "bg-white text-[#111111] hover:text-[#111111] hover:bg-white"
                            : "bg-[#272727] text-foreground hover:text-[#111111] hover:bg-white"
                          }
                        `}
                      >
                        <span className="leading-none">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Grid density viewer: 2 or 3 cards per row */}
              <div className="relative shrink-0 max-md:hidden flex items-end gap-1 rounded-sm bg-[#272727] p-1">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1 left-1 h-8 w-10 rounded-sm bg-white transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateX(${gridColumns === 3 ? "calc(2.5rem + 0.25rem)" : "0"})`,
                  }}
                />
                {[2, 3].map((cols) => {
                  const isActive = gridColumns === cols;

                  return (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => setGridColumns(cols)}
                      aria-label={`Show ${cols} cards per row`}
                      aria-pressed={isActive}
                      className={`
                        relative z-10 flex h-8 w-10 items-center justify-center rounded-sm text20 font-medium
                        transition-colors duration-300 cursor-pointer
                        ${isActive
                          ? "text-[#111111]"
                          : "text-foreground hover:text-white"
                        }
                      `}
                    >
                      {cols}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="category-fadeup fadeup mx-auto relative px-10 pb-12 max-sm:px-[7vw]">
            <div
              className={`flex flex-wrap items-center gap-3 transition-opacity duration-200 ${searchQuery
                  ? "mb-8 min-h-10 opacity-100"
                  : "mb-0 min-h-0 opacity-0 pointer-events-none"
                }`}
            >
              {searchQuery && (
                <span
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#555555]/33 backdrop-blur-md border border-border/50 text-foreground text-sm font-medium max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
                  style={{ borderRadius: "56px" }}
                >
                  <span>&quot;{searchQuery}&quot;</span>

                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="hover:text-white transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}
            </div>

            {isEffectsLoading ? (
              <EffectsGridSkeleton count={9} />
            ) : filteredEffects.length === 0 ? (
              <div className="py-20 text-center max-sm:px-4 max-sm:py-14">
                <div className="mb-6 text-6xl max-sm:mb-4 max-sm:text-4xl">
                  🔍
                </div>

                <h3
                  className="mb-3 font-display text-3xl font-normal text-foreground max-sm:text-2xl"
                  style={{ lineHeight: "1.1" }}
                >
                  No effects found
                </h3>

                <p className="font-sans text-base text-muted max-sm:text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <EffectsGrid
                filteredEffects={filteredEffects}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                isProUser={isProUser}
                isSidebarOpen={isSidebarOpen}
                animationKey={routeKey}
                columns={gridColumns}
              />
            )}

            {!isEffectsLoading && (
              <div className="relative text-foreground w-full mx-auto max-md:w-full">
                {activeCategoryFaqItems.length > 0 && (
                  <div key={`category-faq-${categoryFilter}`}>
                    <FAQs faqItems={activeCategoryFaqItems} />
                  </div>
                )}

                {activeCategoryContent?.cta &&
                  (activeCategoryContent?.cta.heading ||
                    activeCategoryContent?.cta.buttonText) && (
                    <section
                      key={`category-cta-${categoryFilter}`}
                      className="category-fadeup fadeup w-full bg-[#272727] rounded-md text-center mb-[7vw] mx-auto"
                    >
                      <div className="mx-auto w-full flex flex-col items-center max-w-6xl px-10 max-md:px-6 max-sm:px-[7vw] py-15">
                        {activeCategoryContent.cta.heading && (
                          <h2 className="text-[4vw] font-medium text-foreground max-sm:text-[7vw]">
                            {activeCategoryContent.cta.heading}
                          </h2>
                        )}

                        {activeCategoryContent.cta.description && (
                          <p className="mt-4 mx-auto max-w-3xl text20 text-muted">
                            {activeCategoryContent.cta.description}
                          </p>
                        )}

                        {activeCategoryContent.cta.buttonText && (
                          <CustomAnimationFormTrigger>
                          <div className="mt-6 w-fit">
                            <Button
                             preventDefault={false}
                              text={activeCategoryContent.cta.buttonText}
                              href={activeCategoryContent.cta.buttonLink || "#"}
                              variant="white"
                              className="shrink-0 w-fit mx-auto"
                              scaleClass="group-hover:scale-[100]"
                            />
                          </div>
                          </CustomAnimationFormTrigger>
                        )}
                      </div>
                    </section>
                  )}
              </div>
            )}
          </div>
        </RouteFade>
        </>
      )}

    </VaultLayout>

    {mounted && createPortal(
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-sm:bottom-4 max-sm:left-4 max-sm:right-4">
        {/* Pro upgrade success toast */}
        <div
          className={`flex w-80 fixed bottom-6 right-6  max-sm:w-full flex-col gap-3 rounded-md border bg-[#0e0e0e] border-white/20 p-5 shadow-2xl transition-all duration-300 ${justUpgraded && !upgradeToastDismissed ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4"}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm ">You&apos;re now Pro - full vault unlocked.</p>
            <button type="button" onClick={() => setUpgradeToastDismissed(true)} className="shrink-0 text-white/50 hover:text-[#ff5f00] transition-colors">✕</button>
          </div>
          <Link href="/effects" className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ff5f00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e05500] transition-colors">
            Explore effects
          </Link>
        </div>

        {/* Wishlist sign-in toast */}
        <div
          className={`flex w-80 fixed bottom-6 right-6 max-sm:translate-x-[-50%] max-sm:left-1/2 max-md:bottom-12 max-sm:w-[80vw] max-md:w-[40vw] max-sm:bottom-20 flex-col gap-3 rounded-md border border-white/20 bg-[#0e0e0e] p-5 shadow-2xl transition-all duration-300 ${showWishlistToast ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4"}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-white">Sign in to save effects to your wishlist.</p>
            <button type="button" onClick={() => setShowWishlistToast(false)} className="shrink-0 text-white/50 hover:text-[#ff5f00] transition-colors">✕</button>
          </div>
          <Link href="/sign-in?redirect_url=/effects" className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ff5f00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e05500] transition-colors" onClick={() => setShowWishlistToast(false)}>
            Sign In
          </Link>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}

const BATCH_SIZE = 12;
// Keeps the cards' entrance well behind the heading/description (delay 0.3s)
// so they clearly follow it rather than firing at the same time.
const CARD_ENTRANCE_BASE_DELAY = 1;

// Inner component - keyed by filteredEffectsKey so state resets automatically on filter change
function EffectsGridInner({
  filteredEffects,
  wishlist,
  toggleWishlist,
  isProUser,
  animationKey,
  columns = 3,
}) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const gridRef = useRef(null);
  const sentinelRef = useRef(null);

  // TEMP DEBUG for F-014 - remove once root cause is confirmed. Deliberately
  // mount-only (empty deps) - the whole point is detecting unwanted remounts.
  useEffect(() => {
    console.log("[F-014 debug] EffectsGridInner mounted, visibleCount reset to", BATCH_SIZE, "filteredEffects.length =", filteredEffects.length);
  }, []);

  // Load next batch when the sentinel enters the viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    console.log("[F-014 debug] observer effect ran, sentinel =", sentinel, "filteredEffects.length =", filteredEffects.length);
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log("[F-014 debug] observer fired, isIntersecting =", entry.isIntersecting);
        if (entry.isIntersecting) {
          setVisibleCount((prev) => {
            const next = Math.min(prev + BATCH_SIZE, filteredEffects.length);
            console.log("[F-014 debug] setVisibleCount", prev, "->", next);
            return next;
          });
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredEffects.length]);

  const visibleEffects = filteredEffects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEffects.length;

  // Animate only newly-mounted cards (those without .card-entered yet)
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = Array.from(
      grid.querySelectorAll(".effect-card-shell:not(.card-entered)")
    );
    if (!cards.length) return;

    cards.forEach((card, i) => {
      card.style.setProperty(
        "--card-delay",
        `${CARD_ENTRANCE_BASE_DELAY + (i % BATCH_SIZE) * 0.06}s`
      );
    });

    const raf = requestAnimationFrame(() => {
      cards.forEach((card) => card.classList.add("card-entered"));
    });

    return () => cancelAnimationFrame(raf);
  }, [visibleEffects.length, animationKey]);

  // Only the desktop (lg+) column count is user-controlled; the md/sm grids
  // stay fixed. `layout` FLIP-animates the resize/reflow when the count
  // changes so it reads as a smooth transition instead of a snap.
  //
  // The FLIP transform lives on the OUTER motion.div, while the entrance
  // animation (which also drives `transform`, with animation-fill-mode `both`)
  // stays on the inner `.effect-card-shell`. Keeping them on separate elements
  // stops the finished entrance animation from clobbering Framer's transform.
  const baseColsClass = columns === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <>
      <div
        ref={gridRef}
        className={`grid gap-6 rounded-xl max-md:pt-6 max-sm:pt-0 ${baseColsClass} max-md:grid-cols-2 max-sm:grid-cols-1 max-md:gap-10 max-sm:gap-16`}
      >
        {visibleEffects.map((effect, i) => (
          <motion.div
            key={effect.name}
            layout
            transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          >
            <div className="effect-card-shell">
              <EffectCard
                effect={effect}
                priority={i < 4}
                isWishlisted={wishlist.includes(effect.name)}
                toggleWishlist={toggleWishlist}
                isProUser={isProUser}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sentinel - 400px ahead of viewport triggers the next batch before user reaches bottom */}
      {hasMore && <div ref={sentinelRef} className="h-1" aria-hidden="true" />}

      {/* Manual fallback - covers slow IntersectionObserver support or scroll
          that never reaches the sentinel (short viewports, trackpads, etc). */}
      {hasMore && (
        <div className="flex justify-center pt-10">
          <LinkButton
            text="Load More"
            shimmer
            tilted={false}
            onClick={() =>
              setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredEffects.length))
            }
          />
        </div>
      )}
    </>
  );
}

function EffectsGrid({
  filteredEffects,
  wishlist,
  toggleWishlist,
  isProUser = false,
  isSidebarOpen = false,
  animationKey,
  columns = 3,
}) {
  const filteredEffectsKey = filteredEffects
    .map((effect) => effect.name)
    .join("|");

  return (
    <EffectsGridInner
      key={filteredEffectsKey}
      filteredEffects={filteredEffects}
      wishlist={wishlist}
      toggleWishlist={toggleWishlist}
      isProUser={isProUser}
      animationKey={animationKey}
      columns={columns}
    />
  );
}