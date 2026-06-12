"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { VaultLayout } from "@/components/layout/VaultLayout";
import { VaultHeader } from "@/components/layout/VaultHeader";
import { EffectCard } from "@/components/ui/EffectCardNew";
import CharStaggerLinkBtn from "@/components/Buttons/LinkButtons/CharStaggerLinkBtn/CharStaggerLinkBtn";
import {
  effectCategories,
  getEffectCategory,
  getEffectCategoryBySlug,
  getEffectCategoryHref,
} from "@/lib/categories";
import Link from "next/link";
import HeadAnim from "@/components/Animations/HeadAnim";
import { fadeUp } from "@/components/Animations/gsapAnimations";
import Footer from "@/components/LandingPage/Footer";

export function VaultContent({
  effects,
  effectCounts,
  initialCategory = "all",
  userPlan = "free",
}) {
  fadeUp();
  const pathname = usePathname();
  const isProUser = userPlan === "pro";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const categoryFilter = useMemo(() => {
    const queryCategory = searchParams.get("category");
    if (queryCategory) return queryCategory;

    const [, rootSegment, categorySlug] = pathname.split("/");
    if (rootSegment !== "effects" || !categorySlug) return "all";

    return getEffectCategoryBySlug(categorySlug)?.id || initialCategory;
  }, [initialCategory, pathname, searchParams]);

  const updateCategoryFilter = useCallback((nextCategory) => {
    const resolvedCategory = nextCategory || "all";

    const params = new URLSearchParams(searchParams.toString());

    params.delete("category");

    if (resolvedCategory === "free") {
      const nextQuery = params.toString();
      router.push(nextQuery ? `/effects/free?${nextQuery}` : "/effects/free");
      return;
    }

    const nextQuery = params.toString();
    const categoryHref = getEffectCategoryHref(resolvedCategory);
    const nextUrl = nextQuery ? `${categoryHref}?${nextQuery}` : categoryHref;

    router.push(nextUrl);
  }, [router, searchParams]);
  const quickCategories = useMemo(() => {
    const knownCategories = effectCategories
      .filter((category) => category.id !== "all" && effectCounts?.[category.id])
      .map((category) => category.id);
    const extraCategories = Object.keys(effectCounts || {}).filter(
      (id) =>
        id &&
        id !== "all" &&
        !knownCategories.includes(id) &&
        effectCounts[id],
    );

    return ["all", "free", ...knownCategories, ...extraCategories];
  }, [effectCounts]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
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
  }, []);

  const toggleWishlist = async (effect) => {
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
    } catch (err) {
      console.error(err);
    }
  };

  // Filter effects based on search and category
  const filteredEffects = useMemo(() => {
    return effects.filter((effect) => {
      // Category filter
      if (categoryFilter === "free") {
        if (effect.tier === "pro") return false;
      } else if (categoryFilter !== "all") {
        const cats = effect.categories?.length
          ? effect.categories
          : [effect.category];
        if (!cats.includes(categoryFilter)) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const cats = effect.categories?.length
          ? effect.categories
          : [effect.category];
        return (
          effect.name.toLowerCase().includes(query) ||
          effect.title.toLowerCase().includes(query) ||
          cats.some((c) => c?.toLowerCase().includes(query)) ||
          effect.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [effects, categoryFilter, searchQuery]);

  const totalEffects = useMemo(() => {
    if (categoryFilter === "all") return effects.length;

    if (categoryFilter === "free") {
      return effects.filter((effect) => effect.tier !== "pro").length;
    }

    return effects.filter((effect) => {
      const cats = effect.categories?.length
        ? effect.categories
        : [effect.category];
      return cats.includes(categoryFilter);
    }).length;
  }, [effects, categoryFilter]);
  const activeCategoryName =
    categoryFilter === "free"
      ? "Free"
      : getEffectCategory(categoryFilter)?.name || categoryFilter;

  return (
    <VaultLayout
      effectCounts={effectCounts}
      effects={effects}
      activeCategory={categoryFilter}
    >
      {({ isSidebarOpen }) => (
      <div className="min-h-screen text-foreground relative">
        <VaultHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalEffects={totalEffects}
          effects={effects}
        />

        <div className="">
          <div className=" mx-auto px-8 max-sm:px-7 pt-28 pb-12 text-center space-y-8 max-sm:pt-32 max-sm:pb-16">
            <div className="flex items-center justify-center gap-4 text-lg  font-sans max-sm:flex-wrap max-sm:gap-2 max-sm:text-sm fadeup text-light-grey">
              <span>The Vault Library</span>
            </div>
            <HeadAnim>
              <h1
                className="mb-4 font-display text110 w-[80%] mx-auto font-normal max-sm:w-[90%]  text-foreground max-sm:text-4xl"
                style={{ lineHeight: "1.1" }}
              >
                {categoryFilter === "all" ? (
                  <>
                    Browse creative effects for modern websites.
                  </>
                ) : (
                  <>
                    {activeCategoryName} <br /> effects
                  </>
                )}
              </h1>
            </HeadAnim>
          </div>
        </div>

        {/* Filter pills — desktop wraps, mobile single-line scroll */}
        <div className="mx-auto px-10 pb-7 max-sm:px-0 pt-20">
          <div className="relative max-sm:w-full">
            {/* Right fade hint on mobile */}
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 hidden max-sm:block"
              style={{
                background:
                  "linear-gradient(to left, var(--background, #000) 0%, transparent 100%)",
              }}
            />
            <div
              className={[
                "flex items-center gap-2.5 fadeup",
                // desktop: wrapping
                "flex-wrap",
                // mobile: horizontal scroll, no wrap, padded edges
                "max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:px-6",
                // always-visible orange scrollbar
                "scrollbar-thin [scrollbar-color:#CC4C04_transparent]",
                "[&::-webkit-scrollbar]:h-1",
                "[&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-track]:rounded-full",
                "[&::-webkit-scrollbar-thumb]:bg-[#CC4C04] [&::-webkit-scrollbar-thumb]:rounded-full",
                "max-sm:pb-3 ",
              ].join(" ")}
            >
              {quickCategories.map((cat) => {
                const isSelected = categoryFilter === cat;
                const label =
                  cat === "all"
                    ? "All"
                    : cat === "free"
                      ? "Free"
                      : cat === "webgl"
                        ? "WebGL"
                        : cat.charAt(0).toUpperCase() + cat.slice(1);

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateCategoryFilter(cat)}
                    className={`
    px-6 py-2.5 text-md text-center relative rounded-full max-sm:px-4 max-sm:py-2
    backdrop-blur-[6px] font-sans group flex items-center cursor-pointer
    transition-all duration-500 ease-in-out max-sm:text-lg
    hover:text-[#111111] hover:bg-white text20 
    ${isSelected
                        ? "bg-white text-[#111111]  "
                        : "bg-[#272727] text-foreground "
                      }
  `}
                  >
                    <span className="leading-none">
                      {label}
                    </span>

                    {/* <span
                      className={`
      absolute right-5 top-1/2 -translate-y-1/2
      flex items-center overflow-hidden
      transition-all duration-300 ease-in-out
      ${isSelected
                          ? "opacity-100 scale-100 delay-150"
                          : "opacity-0 scale-75 delay-0"
                        }
    `}
                    >
                      <svg
                        className="w-4 h-4 shrink-0"
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
                    </span> */}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto px-10 pb-12 fadeup max-sm:px-6">
          <div
            className={`flex flex-wrap items-center gap-3 transition-opacity duration-200 ${categoryFilter !== "all" || searchQuery
              ? "mb-8 min-h-10 opacity-100"
              : "mb-0 min-h-0 opacity-0 pointer-events-none"
              }`}
          >
            {(categoryFilter !== "all" || searchQuery) && (
              <span className="text-sm text-muted font-sans max-sm:text-xs">
                Showing {filteredEffects.length} of {totalEffects} effects
              </span>
            )}
            {categoryFilter !== "all" && (
              <>
                <span
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#555555]/33 backdrop-blur-md border border-border/50 text-foreground text-sm capitalize font-medium max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
                  style={{ borderRadius: "56px" }}
                >
                  <span>{categoryFilter}</span>
                  <button
                    type="button"
                    onClick={() => updateCategoryFilter("all")}
                    className="hover:text-white cursor-pointer transition-colors"
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
              </>
            )}
            {searchQuery && (
              <>
                <span
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#555555]/33 backdrop-blur-md border border-border/50 text-foreground text-sm font-medium max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
                  style={{ borderRadius: "56px" }}
                >
                  <span>&quot;{searchQuery}&quot;</span>
                  <button
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
              </>
            )}
          </div>

          {filteredEffects.length === 0 ? (
            <div className="py-20 text-center max-sm:px-4 max-sm:py-14">
              <div className="mb-6 text-6xl max-sm:mb-4 max-sm:text-4xl">🔍</div>
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
            <>
              <EffectsGrid
                filteredEffects={filteredEffects}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                isProUser={isProUser}
                isSidebarOpen={isSidebarOpen}
              />


            </>
          )}
        </div>
        <div className="px-10 py-8">
          <Footer/>
        </div>
      </div>
      )}
    </VaultLayout>
  );
}

function EffectsGrid({
  filteredEffects,
  wishlist,
  toggleWishlist,
  isProUser = false,
  isSidebarOpen = false,
}) {
  const [showAllMobileCards, setShowAllMobileCards] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".effect-card-shell",
        {
          autoAlpha: 0,
          y: 34,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: "power3.out",
          stagger: {
            each: 0.06,
            from: "start",
          },
          clearProps: "transform,opacity,visibility",
        },
      );
    }, grid);

    return () => ctx.revert();
  }, [filteredEffects]);

  return (
    <>
      <div
        ref={gridRef}
        className="grid gap-6 rounded-xl grid-cols-3 max-sm:grid-cols-1 max-sm:gap-16"
      >
        {filteredEffects.map((effect, i) => (
          <div
            key={effect.name}
            className={`effect-card-shell ${!showAllMobileCards && i >= 10 ? "max-sm:hidden" : ""
              }`}
          >
            <EffectCard
              effect={effect}
              priority={i < 4}
              isWishlisted={wishlist.includes(effect.name)}
              toggleWishlist={toggleWishlist}
              isProUser={isProUser}
            />
          </div>
        ))}
      </div>

      {filteredEffects.length > 10 && !showAllMobileCards && (
        <div className="mt-10 hidden justify-center max-sm:flex">
          <CharStaggerLinkBtn
            href="#"
            text="View more"
            showLine
            onClick={(e) => {
              e.preventDefault();
              setShowAllMobileCards(true);
            }}
            className="font-sans text-lg text-foreground max-sm:text-base"
          />
        </div>
      )}
    </>
  );
}
