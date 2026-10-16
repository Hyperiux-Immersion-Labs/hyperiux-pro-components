"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, RefreshCw, Search } from "lucide-react";
import { CARD, CARD_PAD, FILTER_WIDTH, Pager } from "@/components/Dashboard/DashboardUI";
import { Bar, SkeletonCard } from "@/components/Dashboard/DashboardSkeletons";
import { FilterMenu } from "@/app/(app)/(workspace)/effects/FilterMenu";
import { SlidingSegment } from "@/components/ui/SlidingSegment";
import { HEALTH_KINDS } from "@/lib/effect-health";
import { getDashboardPreview, sampleEffectHealth } from "@/lib/dev/dashboardPreview";

// The admin Effects tab: every effect whose Sanity guide and registry entry disagree, or
// whose guide is incomplete (api/admin/effects/health) - worst first, filterable - with a
// link to the page, to its Sanity document and a "Refresh page" for its cache.

const PER_PAGE = 20;
const SEVERITIES = [
  { id: "all", label: "All" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];
const DOT = { high: "bg-danger-strong", medium: "bg-primary", low: "bg-black/25" };
const KIND_FILTERS = { all: "Every issue", ...Object.fromEntries(Object.entries(HEALTH_KINDS).map(([kind, { label }]) => [kind, label])) };
const LINK = "type-small inline-flex items-center gap-1 text-ink underline underline-offset-3 transition-colors duration-300 hover:text-primary disabled:cursor-default disabled:opacity-50 [&_svg]:size-3.5";

function RefreshButton({ path }) {
  const [state, setState] = useState("idle"); // idle | busy | done | error
  async function refresh() {
    setState("busy");
    try {
      if (getDashboardPreview()) throw new Error("preview");
      const res = await fetch("/api/admin/effects/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path }) });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }
  return (
    <button type="button" onClick={refresh} disabled={state === "busy"} className={`${LINK} cursor-pointer`} title="Rebuild this effect's cached page on its next visit">
      <RefreshCw aria-hidden="true" />
      {state === "done" ? "Refreshed" : state === "error" ? "Didn’t refresh" : state === "busy" ? "Refreshing…" : "Refresh page"}
    </button>
  );
}

export default function AdminEffectsPage() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [severity, setSeverity] = useState("all");
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;
    if (getDashboardPreview()) {
      requestAnimationFrame(() => active && setData(sampleEffectHealth()));
      return () => {
        active = false;
      };
    }
    fetch("/api/admin/effects/health", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`health ${res.status}`))))
      .then((json) => active && setData(json))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  const shown = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    return data.effects
      .map((effect) => ({
        ...effect,
        issues: effect.issues.filter((issue) => (severity === "all" || issue.severity === severity) && (kind === "all" || issue.kind === kind)),
      }))
      .filter((effect) => effect.issues.length && (!needle || effect.title.toLowerCase().includes(needle) || effect.slug.includes(needle)));
  }, [data, severity, kind, query]);

  if (failed) {
    return (
      <div className={`${CARD} ${CARD_PAD} items-start gap-4`}>
        <p className="type-h3">We couldn’t check the effects.</p>
        <p className="type-body text-black/60">Check your connection and reload the page.</p>
      </div>
    );
  }
  if (!data) {
    return (
      <SkeletonCard className="gap-3">
        <Bar type="type-h3" className="w-48" />
        {Array.from({ length: 6 }, (_, i) => (
          <Bar key={i} type="type-body" className="w-full" />
        ))}
      </SkeletonCard>
    );
  }

  const bySeverity = { high: 0, medium: 0, low: 0 };
  for (const [issueKind, count] of Object.entries(data.counts)) bySeverity[HEALTH_KINDS[issueKind]?.severity || "low"] += count;
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const visible = shown.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const reset = (set) => (value) => {
    set(value);
    setPage(0);
  };

  return (
    <section aria-labelledby="effects-h" className={`${CARD} ${CARD_PAD} gap-[calc(var(--cvw)*1.2)] max-lg:gap-4`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="effects-h" className="type-h3">
            {data.effects.length} of {data.total} effects need attention
          </h2>
          <p className="type-small text-black/60">
            {bySeverity.high} high · {bySeverity.medium} medium · {bySeverity.low} low. Fix the copy in Sanity, then Refresh page (publishing in Sanity refreshes it too).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-[calc(var(--cvw)*0.7)] max-md:gap-[2.5vw]">
          <label className="type-small flex h-9.5 items-center gap-2 bg-light px-3 text-black/60 ring-1 ring-inset ring-black/10 focus-within:ring-primary">
            <Search className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">Search effects</span>
            <input value={query} onChange={(event) => reset(setQuery)(event.target.value)} placeholder="Search effects" className="w-[calc(var(--cvw)*12)] bg-transparent text-ink outline-none placeholder:text-black/40 max-lg:w-40" />
          </label>
          <FilterMenu
            tone="light"
            variant="label"
            alignRight
            label="Issue"
            widthClassName={FILTER_WIDTH}
            panelClassName="left-auto! right-0"
            options={Object.keys(KIND_FILTERS)}
            categoryFilter={kind}
            activeFilter={kind === "all" ? null : kind}
            getLabel={(id) => KIND_FILTERS[id]}
            onSelect={reset(setKind)}
          />
          <SlidingSegment label="Severity" items={SEVERITIES} value={severity} onChange={reset(setSeverity)} itemClassName="w-18" />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="type-body py-10 text-center text-black/60">{data.effects.length ? "Nothing matches these filters." : "Every effect is in good shape."}</p>
      ) : (
        <ul className="flex flex-col">
          {visible.map((effect) => (
            <li key={`${effect.slug}-${effect.sanityId}`} className="flex flex-col gap-2 border-t border-black/10 py-[calc(var(--cvw)*1)] first:border-t-0 max-lg:py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="type-body">{effect.title}</span>
                  <span className="type-small text-black/60">
                    {effect.slug}
                    {effect.categorySlug ? ` · ${effect.categorySlug}` : ""}
                    {effect.tier ? ` · ${effect.tier === "pro" ? "Pro" : "Free"}` : ""}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-4">
                  {effect.docsUrl && (
                    <a href={effect.docsUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
                      Page
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  )}
                  {effect.sanityId &&
                    (data.studioUrl ? (
                      <a href={`${data.studioUrl.replace(/\/$/, "")}/intent/edit/id=${effect.sanityId};type=effectContent`} target="_blank" rel="noopener noreferrer" className={LINK}>
                        Open in Sanity
                        <ArrowUpRight aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="type-small font-mono text-black/40" title="Sanity document ID">
                        {effect.sanityId}
                      </span>
                    ))}
                  {effect.docsUrl && <RefreshButton path={effect.docsUrl} />}
                </span>
              </div>
              <ul className="flex flex-col gap-1">
                {effect.issues.map((issue, i) => (
                  <li key={`${issue.kind}-${i}`} className="type-small flex items-start gap-2 text-ink">
                    <span aria-hidden="true" className={`mt-[0.5em] size-1.5 shrink-0 rounded-full ${DOT[issue.severity]}`} />
                    <span>
                      <span className="text-black/60">{HEALTH_KINDS[issue.kind]?.label || issue.kind}: </span>
                      {issue.message}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <Pager page={Math.min(page, pages - 1)} pages={pages} total={shown.length} noun={shown.length === 1 ? "effect" : "effects"} onPage={setPage} />
    </section>
  );
}
