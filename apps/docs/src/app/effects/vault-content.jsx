"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VaultLayout } from "@/components/layout/VaultLayout";
import { VaultHeader } from "@/components/layout/VaultHeader";
import { EffectCard } from "@/components/ui/EffectCardNew";
import CharStaggerButton from "@/components/char-stagger-button";
import {
  effectsOverviewContent,
  effectCategories,
  freeEffectsContent,
  getEffectCategory,
  getEffectCategoryBySlug,
  getEffectCategoryHref,
} from "@/lib/categories";

import HeadAnim from "@/components/Animations/HeadAnim";
import FAQSection from "@/components/LandingPage/FAQ";
import { getFeaturedEffects } from "@/lib/featured-effects";
import Button from "@/components/WebsiteComps/Button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function VaultContent({
  effects,
  effectCounts,
  initialCategory = "all",
  userPlan = "free",
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryPageRef = useRef(null);

  const isProUser = userPlan === "pro";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const featuredEffects = useMemo(() => getFeaturedEffects(effects), [effects]);

  const featuredEffectNames = useMemo(
    () => new Set(featuredEffects.map((effect) => effect.name)),
    [featuredEffects]
  );

  const categoryFromUrl = useMemo(() => {
    const queryCategory = searchParams.get("category");

    if (queryCategory) {
      return queryCategory === "all" ? initialCategory : queryCategory;
    }

    const [, rootSegment, categorySlug] = pathname.split("/");

    if (rootSegment !== "effects" || !categorySlug) {
      return initialCategory;
    }

    return getEffectCategoryBySlug(categorySlug)?.id || initialCategory;
  }, [initialCategory, pathname, searchParams]);

  const categoryFilter = selectedCategory || categoryFromUrl;

  const replayCategoryFadeUp = useCallback(() => {
    const root = categoryPageRef.current;

    if (!root) return;

    const fadeItems = gsap.utils.toArray(".category-fadeup", root);

    if (!fadeItems.length) {
      ScrollTrigger.refresh(true);
      return;
    }

    gsap.killTweensOf(fadeItems);

    gsap.set(fadeItems, {
      autoAlpha: 0,
      y: 30,
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gsap.to(fadeItems, {
          autoAlpha: 1,
          y: 0,
            delay: 0.3,
          duration: 0.75,
          ease: "power3.out",
          stagger: {
            each: 0.08,
            from: "start",
          },
          clearProps: "transform,opacity,visibility",
          onComplete: () => {
            ScrollTrigger.refresh(true);
          },
        });
      });
    });
  }, []);

  useEffect(() => {
    replayCategoryFadeUp();
  }, [categoryFilter, replayCategoryFadeUp]);

  const refreshAfterCategoryChange = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
      });
    });
  }, []);

  const updateCategoryFilter = useCallback(
    (nextCategory) => {
      const resolvedCategory = nextCategory || "all";

      const params = new URLSearchParams(searchParams.toString());

      params.delete("category");

      const nextQuery = params.toString();
      const categoryHref = getEffectCategoryHref(resolvedCategory);
      const nextUrl = nextQuery ? `${categoryHref}?${nextQuery}` : categoryHref;

      setSearchQuery("");
      setSelectedCategory(resolvedCategory);

      if (typeof window !== "undefined") {
        window.history.pushState(null, "", nextUrl);
      }

      refreshAfterCategoryChange();
    },
    [searchParams, refreshAfterCategoryChange]
  );

  const showAllEffects = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");

    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/effects");
    }

    refreshAfterCategoryChange();
  }, [refreshAfterCategoryChange]);

  const quickCategories = useMemo(() => {
    const knownCategories = effectCategories
      .filter(
        (category) => category.id !== "featured" && effectCounts?.[category.id]
      )
      .map((category) => category.id);

    const extraCategories = Object.keys(effectCounts || {}).filter(
      (id) =>
        id &&
        id !== "all" &&
        id !== "featured" &&
        !knownCategories.includes(id) &&
        effectCounts[id]
    );

    return ["featured", "free", ...knownCategories, ...extraCategories];
  }, [effectCounts]);

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

  const filteredEffects = useMemo(() => {
    return effects.filter((effect) => {
      if (categoryFilter === "free") {
        if (effect.tier === "pro") return false;
      } else if (categoryFilter === "featured") {
        if (!featuredEffectNames.has(effect.name)) return false;
      } else if (categoryFilter !== "all") {
        const cats = effect.categories?.length
          ? effect.categories
          : [effect.category];

        if (!cats.includes(categoryFilter)) return false;
      }

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
  }, [effects, categoryFilter, searchQuery, featuredEffectNames]);

  const totalEffects = useMemo(() => {
    if (categoryFilter === "all") {
      return effects.length;
    }

    if (categoryFilter === "free") {
      return effects.filter((effect) => effect.tier !== "pro").length;
    }

    if (categoryFilter === "featured") {
      return featuredEffects.length;
    }

    return effects.filter((effect) => {
      const cats = effect.categories?.length
        ? effect.categories
        : [effect.category];

      return cats.includes(categoryFilter);
    }).length;
  }, [effects, categoryFilter, featuredEffects]);

  const activeCategory = getEffectCategory(categoryFilter);

  const activeCategoryContent =
    categoryFilter === "all"
      ? effectsOverviewContent
      : categoryFilter === "free"
        ? freeEffectsContent
        : activeCategory;
  const activeCategoryName =
    activeCategoryContent?.name || categoryFilter;
  const activeCategoryDescription =
    activeCategoryContent?.description ||
    "Explore free effects from the Hyperiux vault, ready to install, remix, and use in real projects.";

  const activeCategoryDescriptions = Array.isArray(activeCategoryDescription)
    ? activeCategoryDescription
    : [activeCategoryDescription];
  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Effects", href: "/effects" },
    ];

    if (categoryFilter !== "all") {
      items.push({
        label: activeCategoryName,
        href: getEffectCategoryHref(categoryFilter),
      });
    }

    return items;
  }, [activeCategoryName, categoryFilter]);
  const activeCategoryFaqItems = useMemo(
    () =>
      (activeCategoryContent?.faqs || []).map((item, index) => ({
        id: `${categoryFilter}-faq-${index + 1}`,
        title: item.question,
        content: item.answer,
        defaultOpen: index === 0,
      })),
    [activeCategoryContent?.faqs, categoryFilter]
  );

  return (
    <div ref={categoryPageRef}>
      <VaultLayout
        effectCounts={effectCounts}
        effects={effects}
        activeCategory={categoryFilter}
        onOverviewNavigate={showAllEffects}
        onCategoryNavigate={updateCategoryFilter}
      >
        {({ isSidebarOpen }) => (
          <div className="relative min-h-screen text-foreground effects-comp">
            <VaultHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalEffects={totalEffects}
              effects={effects}
            />

            <div>
              <div
                key={`category-intro-${categoryFilter}`}
                className="mx-auto px-8 pt-28 pb-12 text-center space-y-8 max-sm:px-7 max-sm:pt-32 max-sm:pb-16"
              >
               
              <nav
                aria-label="Breadcrumb"
                className="fadeup mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-2 text-sm text-muted max-sm:text-xs fadeup"
              >
                {breadcrumbItems.map((item, index) => {
                  const isLast = index === breadcrumbItems.length - 1;

                  return (
                    <span key={item.href} className="flex items-center gap-2">
                      {index > 0 && (
                        <span className="text-white/25">/</span>
                      )}

                      {isLast ? (
                        <span className="capitalize text-primary">
                          {item.label}
                        </span>
                      ) : (
                        <Link
                          href={item.href}
                          className="capitalize transition-colors hover:text-primary"
                        >
                          {item.label}
                        </Link>
                      )}
                    </span>
                  );
                })}
              </nav>
            

            <HeadAnim animateOnScroll={false}>
                  <h1
                    className="mb-4 mx-auto w-[80%] font-display text110 font-normal text-foreground max-sm:w-[90%] max-sm:text-4xl"
                    style={{ lineHeight: "1.1" }}
                  >
                    {activeCategoryName}
                  </h1>
                </HeadAnim>

                <div className="category-fadeup mx-auto flex max-w-[50vw] flex-col text-lg text-muted max-md:max-w-full max-sm:text-base">
                  {activeCategoryDescriptions.map((description, index) => (
                    <p
                      key={`${categoryFilter}-description-${index}`}
                      className="mt-3"
                    >
                      {description}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mx-auto px-10 pb-7 pt-20 max-sm:px-0 max-md:pt-10">
              <div className="relative max-md:w-full">
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
                  {quickCategories.map((cat) => {
                    const isSelected = categoryFilter === cat;

                    const label =
                      cat === "free"
                        ? "Free"
                        : cat === "featured"
                        ? "Featured"
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
                          ${
                            isSelected
                              ? "bg-white text-[#111111]"
                              : "bg-[#272727] text-foreground"
                          }
                        `}
                      >
                        <span className="leading-none">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="category-fadeup mx-auto relative px-10 pb-12 max-sm:px-6">
              <div
                className={`flex flex-wrap items-center gap-3 transition-opacity duration-200 ${
                  searchQuery
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

              {filteredEffects.length === 0 ? (
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
                />
              )}
            </div>
          </div>
        )}
      </VaultLayout>

      <div className="relative z-50 text-foreground px-8 max-md:px-[7vw]">
        {activeCategoryFaqItems.length > 0 && (
          <div key={`category-faq-${categoryFilter}`}>
            <FAQSection faqItems={activeCategoryFaqItems} />
          </div>
        )}

        {activeCategoryContent?.cta &&
          (activeCategoryContent?.cta.heading ||
            activeCategoryContent?.cta.buttonText) && (
            <section
              key={`category-cta-${categoryFilter}`}
              className="category-fadeup w-full bg-[#272727] rounded-md max-w-[78%] text-center my-[5vw] mx-auto"
            >
              <div className="mx-auto w-full max-w-6xl px-10 max-md:px-6 max-sm:px-[7vw] py-15">
                {activeCategoryContent.cta.heading && (
                  <h2 className="text-[4vw] font-medium text-foreground">
                    {activeCategoryContent.cta.heading}
                  </h2>
                )}

                {activeCategoryContent.cta.description && (
                  <p className="mt-4 mx-auto max-w-3xl text20 text-muted">
                    {activeCategoryContent.cta.description}
                  </p>
                )}

                {activeCategoryContent.cta.buttonText && (
                  <div className="mt-6">
                    <Button
                      text={activeCategoryContent.cta.buttonText}
                      href={activeCategoryContent.cta.buttonLink || "#"}
                      variant="white"
                      className="shrink-0 w-fit mx-auto"
                      scaleClass="group-hover:scale-[100]"
                    />
                  </div>
                )}
              </div>
            </section>
          )}
      </div>
    </div>
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
    setShowAllMobileCards(false);
  }, [filteredEffects]);

  useEffect(() => {
    const grid = gridRef.current;

    if (!grid) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".effect-card-shell", grid);

      gsap.killTweensOf(cards);

      gsap.fromTo(
        cards,
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
          onComplete: () => {
            ScrollTrigger.refresh(true);
          },
        }
      );
    }, grid);

    return () => ctx.revert();
  }, [filteredEffects]);

  return (
    <>
      <div
        ref={gridRef}
        className="grid gap-6 rounded-xl max-md:pt-6 max-sm:pt-0 grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 max-md:gap-10 max-sm:gap-16"
      >
        {filteredEffects.map((effect, i) => (
          <div
            key={effect.name}
            className={`effect-card-shell ${
              !showAllMobileCards && i >= 10 ? "max-sm:hidden" : ""
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
          <CharStaggerButton
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