"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useDashboard } from "@/components/Dashboard/DashboardContext";
import { ALL_DATES, CARD, CARD_PAD, DateRangeFilter, EMPTY_TABLE, FILTER_WIDTH, FilteredCount, inDateRange, resolveDateRange, TOOLBAR } from "@/components/Dashboard/DashboardUI";
import { COLUMN_ITEMS, SlidingSegment } from "@/components/ui/SlidingSegment";
import { Bar, ToolbarBars } from "@/components/Dashboard/DashboardSkeletons";
import { useDashboardData } from "@/components/Dashboard/useDashboardData";
import Button from "@/homepage/components/Button";
import { CARD_LAYOUT_TRANSITION, EffectCard } from "@/app/(app)/(workspace)/effects/EffectCard";
import { FilterMenu } from "@/app/(app)/(workspace)/effects/FilterMenu";
import { useEffectCardActions } from "@/app/(app)/(workspace)/effects/useEffectCardActions";
import { EFFECT_GRID, EFFECT_GRID_COLS } from "@/app/(app)/(workspace)/templates/tokens";
import { effectCategories, getEffectHref, getQuickCategoryLabel, resolveEffectCategoryId } from "@/lib/categories";
import { getDashboardPreview } from "@/lib/dev/dashboardPreview";
import { WISHLIST_CHANGED_EVENT } from "@/lib/wishlistEvents";
import { useGridColumns } from "@/hooks/useGridColumns";
import { useGridMorph } from "@/hooks/useGridMorph";
import { useUserPlan } from "@/lib/useUserPlan";

const TIERS = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "pro", label: "Pro" },
];
// "recent" is the default order; the rest live in the filter menu, as on the effects listing
const SORTS = { recent: "Recently saved", oldest: "Oldest saved", az: "A to Z", za: "Z to A" };
const SORT_OPTIONS = ["oldest", "az", "za"];


const titleOf = (effect) => effect.title || effect.name;

export default function SavedEffectsPage() {
  const router = useRouter();
  const { catalog, effectBySlug, username, isAdmin } = useDashboard();
  // The plan from the server (lib/useUserPlan), not Clerk metadata, which can lag behind
  // the subscription; admins get every effect
  const { plan } = useUserPlan();
  const { cardActions, overlays } = useEffectCardActions({ userPlan: isAdmin ? "pro" : plan });

  // Saved rows, newest first: { name, created_at, ... }; null on the first load only
  // (cached across tabs, refreshed on every save or unsave)
  const { data: rows, failed, retry, mutate } = useDashboardData(`saved:${username}`, async () => {
    // Development preview: the first nine effects in the catalogue, a day apart
    if (getDashboardPreview()) return catalog.slice(0, 9).map((effect, i) => ({ name: effect.name, created_at: new Date(Date.now() - i * 86400000).toISOString() }));
    const res = await fetch("/api/dashboard/saved", { cache: "no-store" });
    if (!res.ok) throw new Error(`saved ${res.status}`);
    return (await res.json()).savedEffects || [];
  });
  const [tier, setTier] = useState("all");
  const [category, setCategory] = useState(null);
  const [sort, setSort] = useState("recent");
  const [dates, setDates] = useState(ALL_DATES);
  // 2 / 3 per row, in step with the sidebar like /effects (picking 3 closes it)
  const { cols, shownCols, chooseCols } = useGridColumns("hyperiux-dashboard-saved-cols");
  // A column switch eases each card's real width to its new slot (no scale, no snap)
  const gridRef = useRef(null);
  const { capture: captureGrid, morphing } = useGridMorph(gridRef);

  // Unsaving a card here takes it off the grid straight away (the refetch confirms it)
  useEffect(() => {
    const onChange = (event) => {
      const { saved, name } = event.detail || {};
      if (saved === false && name) mutate((list) => (list || []).filter((row) => row.name !== name));
    };
    window.addEventListener(WISHLIST_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(WISHLIST_CHANGED_EVENT, onChange);
  }, [mutate]);

  // Each saved row with the effect's full details from the catalogue (cover, tags, video)
  const saved = useMemo(() => (rows || []).map((row) => ({ ...row, ...(effectBySlug(row.name) || {}), savedAt: row.created_at })), [rows, effectBySlug]);

  // The category dropdown: every category among the saved effects, in the site's order
  const categoryChips = useMemo(() => {
    const counts = new Map();
    saved.forEach((effect) => {
      const id = resolveEffectCategoryId(effect);
      if (id) counts.set(id, (counts.get(id) || 0) + 1);
    });
    const ordered = effectCategories.map((c) => c.id).filter((id) => counts.has(id));
    return [...ordered, ...[...counts.keys()].filter((id) => !ordered.includes(id))].map((id) => ({ id, count: counts.get(id) }));
  }, [saved]);

  const shown = useMemo(() => {
    const { from, to } = resolveDateRange(dates);
    const list = saved.filter(
      (effect) =>
        (tier === "all" || (tier === "pro" ? effect.tier === "pro" : effect.tier !== "pro")) &&
        (!category || resolveEffectCategoryId(effect) === category) &&
        inDateRange(effect.savedAt, from, to),
    );
    if (sort === "oldest") return [...list].reverse();
    if (sort === "az") return [...list].sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
    if (sort === "za") return [...list].sort((a, b) => titleOf(b).localeCompare(titleOf(a)));
    return list;
  }, [saved, tier, category, sort, dates]);

  return (
    <div className="flex flex-col gap-[calc(var(--cvw)*1.6)] max-lg:gap-6">
      {overlays}

      {failed ? (
        <div className={`${CARD} ${CARD_PAD} items-start gap-4`}>
          <p className="type-h3">We couldn’t load your saved effects.</p>
          <p className="type-body text-black/60">Check your connection and try again.</p>
          <Button text="Try again" preventDefault onClick={retry} />
        </div>
      ) : rows === null ? (
        <div aria-busy="true" aria-label="Loading your saved effects" className="flex flex-col gap-[calc(var(--cvw)*1.6)] max-lg:gap-6">
          {/* the count and the filters, then cards: cover, title, category line */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Bar type="type-h3" className="w-32" />
            <ToolbarBars segment menus={2} />
          </div>
          <div className={`flex flex-wrap ${EFFECT_GRID}`}>
            {Array.from({ length: cols * 2 }, (_, i) => (
              <div key={i} className={`flex flex-col gap-3 ${EFFECT_GRID_COLS[cols]}`}>
                <Bar className="aspect-video w-full" />
                <Bar type="type-body" className="w-[55%]" />
                <Bar type="type-small" className="w-[35%]" />
              </div>
            ))}
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className={`${CARD} ${CARD_PAD} items-start gap-4`}>
          <p className="type-h3">Nothing saved yet.</p>
          <p className="type-body text-black/60">Tap the heart on any effect to keep it here.</p>
          <Button href="/effects" text="Browse All Effects" />
        </div>
      ) : (
        <>
          {/* tier, sort, saved date and columns - the effects listing's controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilteredCount shown={shown.length} total={rows.length} noun="saved" />
            <div className={TOOLBAR}>
              <SlidingSegment label="Tier" items={TIERS} value={tier} onChange={setTier} itemClassName="w-14" />
              {categoryChips.length > 1 && (
                <FilterMenu
                  tone="light"
                  variant="label"
                  alignRight
                  widthClassName={FILTER_WIDTH}
                  panelClassName="left-auto! right-0 max-h-[20vw] max-md:max-h-[50vh] overflow-y-auto"
                  options={["all", ...categoryChips.map((c) => c.id)]}
                  categoryFilter={category || "all"}
                  activeFilter={category}
                  getLabel={(id) => (id === "all" ? "All Categories" : getQuickCategoryLabel(id))}
                  onSelect={(id) => setCategory(id === "all" ? null : id)}
                />
              )}
              <FilterMenu
                tone="light"
                alignRight
                panelClassName="left-auto! right-0"
                options={SORT_OPTIONS}
                activeFilter={sort === "recent" ? null : sort}
                getLabel={(id) => SORTS[id] || SORTS.recent}
                onSelect={setSort}
                onClear={() => setSort("recent")}
              />
              <DateRangeFilter label="Saved" value={dates} onChange={setDates} />
              <SlidingSegment label="Columns" items={COLUMN_ITEMS} value={shownCols} onChange={(n) => { captureGrid(); chooseCols(n); }} itemClassName="w-8.5" className="max-lg:hidden" />
            </div>
          </div>

          {shown.length === 0 ? (
            <p className={EMPTY_TABLE}>No saved effects match these filters.</p>
          ) : (
            <div ref={gridRef} className={`flex flex-wrap ${EFFECT_GRID}`}>
              {/* the cards glide to their new slots on a column switch or filter, as on /effects */}
              {/* an unsaved card fades out and the rest close the gap */}
              <AnimatePresence initial={false}>
                {shown.map((effect) => (
                  <motion.div
                    key={effect.name}
                    data-morph-key={effect.name}
                    // position only: animating the size as a scale stretches the card's padding;
                    // a column switch is useGridMorph's
                    layout={morphing ? false : "position"}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
                    transition={CARD_LAYOUT_TRANSITION}
                    className={EFFECT_GRID_COLS[cols]}
                  >
                    <EffectCard effect={effect} {...cardActions(effect)} onOpen={(item) => router.push(getEffectHref(item))} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
