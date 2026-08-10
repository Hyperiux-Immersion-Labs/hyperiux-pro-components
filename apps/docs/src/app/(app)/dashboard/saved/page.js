"use client";

import { useEffect, useMemo, useState } from "react";
import { EffectCard } from "@/components/ui/EffectCardNew";
import { effectCategories, getQuickCategoryLabel } from "@/lib/categories";
import { getFeaturedEffects } from "@/lib/featured-effects";
import { emitWishlistChanged } from "@/lib/wishlistEvents";
import { FilterMenu, FILTER_OPTIONS } from "@/app/(app)/effects/FilterMenu";

function getEffectCategories(effect) {
  return effect.categories?.length
    ? effect.categories
    : [effect.category || "components"];
}

export default function SavedPage() {
  const [savedEffects, setSavedEffects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  async function loadSavedEffects() {
    try {
      const res = await fetch("/api/dashboard/saved");

      if (!res.ok) {
        throw new Error("Failed to load saved effects");
      }

      const data = await res.json();

      setSavedEffects(data.savedEffects || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const toggleWishlist = async (effect) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ effect }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        return;
      }

      if (data.saved === false) {
        setSavedEffects((prev) =>
          prev.filter((item) => item.name !== effect.name)
        );
      } else {
        loadSavedEffects();
      }

      emitWishlistChanged(data.saved);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      loadSavedEffects();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const featuredEffects = useMemo(
    () => getFeaturedEffects(savedEffects),
    [savedEffects]
  );

  // Same shape as vault-content's quickCategories/categoryChips split -
  // featured/free/pro live in the FilterMenu dropdown, everything else
  // becomes a chip, ordered to match the site's category order first.
  const categoryChips = useMemo(() => {
    const presentCategories = new Set();

    savedEffects.forEach((effect) => {
      getEffectCategories(effect).forEach((category) => {
        if (category) presentCategories.add(category);
      });
    });

    const knownCategories = effectCategories
      .filter(
        (category) =>
          category.id !== "featured" && presentCategories.has(category.id)
      )
      .map((category) => category.id);

    const extraCategories = [...presentCategories].filter(
      (id) => !knownCategories.includes(id)
    );

    return [...knownCategories, ...extraCategories];
  }, [savedEffects]);

  const activeFilter = FILTER_OPTIONS.includes(categoryFilter)
    ? categoryFilter
    : null;

  const filteredEffects = useMemo(() => {
    if (categoryFilter === "all") return savedEffects;

    if (categoryFilter === "featured") {
      const featuredNames = new Set(featuredEffects.map((effect) => effect.name));
      return savedEffects.filter((effect) => featuredNames.has(effect.name));
    }

    if (categoryFilter === "free") {
      return savedEffects.filter((effect) => effect.tier !== "pro");
    }

    if (categoryFilter === "pro") {
      return savedEffects.filter((effect) => effect.tier === "pro");
    }

    return savedEffects.filter((effect) =>
      getEffectCategories(effect).includes(categoryFilter)
    );
  }, [categoryFilter, savedEffects, featuredEffects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400">
          Loading saved effects...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display text-white">
          Saved Effects
        </h1>

        <p className="text-white mt-2">
          Your wishlist of saved effects.
        </p>
      </div>

      {savedEffects.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`
              px-7 py-[.8vw] max-md:py-[2vw] rounded-full border transition
              ${categoryFilter === "all"
                ? "bg-white text-black border-white"
                : "bg-[#272727] text-white border-white/0 hover:bg-white hover:text-black"}
            `}
          >
            All
          </button>

          <FilterMenu
            activeFilter={activeFilter}
            categoryFilter={categoryFilter}
            getLabel={getQuickCategoryLabel}
            onSelect={setCategoryFilter}
          />

          {categoryChips.map((cat) => {
            const active = categoryFilter === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`
                  px-7 py-[.8vw] max-md:py-[2vw] rounded-full border transition
                  ${active
                    ? "bg-white text-black border-white"
                    : "bg-[#272727] text-white border-white/0 hover:bg-white hover:text-black"}
                `}
              >
                {getQuickCategoryLabel(cat)}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {savedEffects.length === 0 ? (
        <div className="rounded-md p-12 bg-[#272727] text-center">
          <h3 className="text-2xl text-white mb-2">
            No saved effects yet
          </h3>

          <p className="text-zinc-400">
            Start exploring the vault and save your
            favourite effects.
          </p>
        </div>
      ) : filteredEffects.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-12 text-center bg-white/5 backdrop-blur-lg ">
          <h3 className="text-xl text-white mb-2">
            No saved effects in this category
          </h3>

          <p className="text-zinc-400">
            Choose another category to view your saved effects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 max-[1025px]:grid-cols-2 max-md:grid-cols-1 max-md:gap-12">
          {filteredEffects.map((effect) => (
            <EffectCard
              key={effect.id}
              effect={effect}
              isWishlisted={true}
              toggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
