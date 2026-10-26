"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CopyButtonContent } from "@/components/ui/CodeBlock";
import { useDashboard } from "@/components/Dashboard/DashboardContext";
import { ALL_DATES, CARD, CARD_PAD, CardLink, DATE_PRESETS, DateRangeFilter, EMPTY_TABLE, FILTER_WIDTH, HEAD_ROW, inDateRange, Pager, PerPageMenu, resolveDateRange, ROW, SearchField, SourceChip, STICKY_END, STICKY_START, TABLE, TableScroll, TD, TH, TOOLBAR } from "@/components/Dashboard/DashboardUI";
import { Bar, SkeletonCard, useAccountHint, ToolbarBars } from "@/components/Dashboard/DashboardSkeletons";
import { useDashboardData } from "@/components/Dashboard/useDashboardData";
import { useUserPlan } from "@/lib/useUserPlan";
import { RingMeter } from "@/components/Dashboard/RingMeter";
import { SOURCE_BARS, UsageBars } from "@/components/Dashboard/UsageBars";
import { SlidingSegment } from "@/components/ui/SlidingSegment";
import Button from "@/homepage/components/Button";
import { resolveCover } from "@/app/(app)/(workspace)/effects/EffectCard";
import { useEffectCardActions } from "@/app/(app)/(workspace)/effects/useEffectCardActions";
import { getEffectHref } from "@/lib/category-routes";
import { markScrollToPricingCards } from "@/lib/pricingScrollIntent";
import { PLANS } from "@/lib/plans";
import { getDashboardPreview, sampleUsage } from "@/lib/dev/dashboardPreview";
import { buttonId } from "@/lib/button-id";

const SOURCES = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
  { id: "cli", label: "CLI" },
  { id: "mcp", label: "MCP" },
];
// The chart's days with no range picked, and the most it draws for a long custom range
const DEFAULT_DAYS = 30;
const MAX_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

const localDay = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const shortDate = (day) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${day}T00:00:00`));
const formatWhen = (value) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

// The daily limit resets at midnight UTC (install_unlocks counts UTC days)
function untilReset(now) {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  const minutes = Math.ceil((next - now) / 60000);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

// Midnight UTC on the visitor's clock ("5:30 AM" in India): the chart's bars are local
// days, so this says where the limit's day actually turns over
function resetClock(now) {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(next);
}

// Copies `npx hyperiux add …` through the effect cards' copy - just the command; the
// install counts when the CLI runs it. The icon and label flip to a tick and "Copied"
// with the code blocks' animation.
function CopyCommand({ effect, copyInstall }) {
  const [copied, setCopied] = useState(false);
  const name = effect.title || effect.name;
  return (
    <button
      id={buttonId("dashboard-usage-copy-install", effect.name)}
      type="button"
      aria-label={copied ? `Copied the install command for ${name}` : `Copy the install command for ${name}`}
      onClick={async () => {
        if (await copyInstall(effect)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }
      }}
      className={`type-small inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 px-3 ring-1 ring-inset transition-[color,box-shadow] duration-300 ${copied ? "text-primary ring-primary" : "text-black/60 ring-black/10 hover:text-ink hover:ring-primary"}`}
    >
      <CopyButtonContent copied={copied} labelClassName="max-md:hidden" />
    </button>
  );
}

// Loading: the cards in their own shapes - the dark Today card (not for unlimited
// accounts), the chart, then the table's header and rows
function UsageSkeleton() {
  const { isAdmin } = useAccountHint();
  return (
    <div aria-busy="true" aria-label="Loading your usage" className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Bar type="type-label" className="w-[30%] max-md:w-full" />
        <Bar className={`h-9.5 ${FILTER_WIDTH}`} />
      </div>
      <div className="flex gap-[calc(var(--cvw)*0.8)] max-lg:flex-col max-lg:gap-3">
        {!isAdmin && (
          <SkeletonCard dark className="w-1/2 flex-row items-center gap-[calc(var(--cvw)*2)] max-lg:w-full max-md:flex-col max-md:items-start max-md:gap-6">
            <Bar className="size-[calc(var(--cvw)*8)] shrink-0 rounded-full max-lg:size-32" />
            <div className="flex flex-1 flex-col gap-[calc(var(--cvw)*0.6)] max-lg:gap-2">
              <Bar type="type-label" className="w-14" />
              <Bar type="type-h1" className="w-[40%]" />
              <Bar type="type-body" className="w-[85%]" />
              <Bar type="type-label" className="w-[60%]" />
            </div>
          </SkeletonCard>
        )}
        <SkeletonCard className="min-w-0 flex-1 gap-[calc(var(--cvw)*1.6)] max-lg:gap-5">
          <div className="flex justify-between gap-3">
            <div className="flex w-[50%] flex-col gap-1">
              <Bar type="type-h3" className="w-[60%]" />
              <Bar type="type-small" className="w-full" />
            </div>
            <Bar type="type-small" className="w-32" />
          </div>
          <div className="flex h-[calc(var(--cvw)*10)] items-end gap-1 max-lg:h-40">
            {[40, 65, 30, 80, 55, 20, 70, 45, 90, 35, 60, 50, 75, 25].map((h, i) => (
              <Bar key={i} className="flex-1" style={{ height: `${h}%` }} />
            ))}
          </div>
        </SkeletonCard>
      </div>
      <SkeletonCard className="gap-[calc(var(--cvw)*1.2)] max-lg:gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Bar type="type-h3" className="w-44" />
          <ToolbarBars search segment />
        </div>
        <div className="flex flex-col">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-black/10 py-[calc(var(--cvw)*0.7)] last:border-b-0 max-lg:py-3">
              <Bar className="aspect-[16/10] w-12 shrink-0" />
              <Bar type="type-body" className="w-[30%] flex-1" />
              <Bar type="type-small" className="w-12" />
              <Bar type="type-small" className="w-[18%] max-md:hidden" />
              <Bar className="h-8 w-24" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}

export default function UsagePage() {
  const { effectBySlug, catalog, isAdmin, username } = useDashboard();
  // The plan from the server (lib/useUserPlan), not Clerk metadata, which can lag behind
  // the subscription; admins get every effect
  const { plan } = useUserPlan();
  const { copyInstall, overlays } = useEffectCardActions({ userPlan: isAdmin ? "pro" : plan });

  // Cached across tabs (skeleton on the first load only), refreshed after every copy or
  // install here or elsewhere, on focus and every 30s - the table and chart stay live
  const { data, failed, retry } = useDashboardData(
    `usage:${username}`,
    async () => {
      const preview = getDashboardPreview();
      if (preview) return sampleUsage(preview, catalog);
      const res = await fetch("/api/dashboard/usage", { cache: "no-store" });
      if (!res.ok) throw new Error(`usage ${res.status}`);
      return res.json();
    },
    { pollMs: 30000 },
  );
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [dates, setDates] = useState(ALL_DATES);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Date.now() must not run during render: it differs between server and browser.
  const [now, setNow] = useState(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // The picked range, as YYYY-MM-DD local days ("" = all time)
  const { from, to } = resolveDateRange(dates);

  const events = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.events || []).filter(
      (event) =>
        (source === "all" || event.source === source) &&
        inDateRange(event.at, from, to) &&
        (!q || `${effectBySlug(event.name)?.title || event.title} ${event.name}`.toLowerCase().includes(q)),
    );
  }, [data, source, from, to, query, effectBySlug]);

  // The chart: one bar per local day over the picked range (the last 30 days for all
  // time), from the same events as the table, split by source
  const days = useMemo(() => {
    if (!data?.events || !now) return null;
    const endDay = to ? new Date(`${to}T00:00:00`) : new Date(now);
    const startDay = from ? new Date(`${from}T00:00:00`) : new Date(endDay.getTime() - (DEFAULT_DAYS - 1) * DAY_MS);
    const count = Math.min(MAX_DAYS, Math.max(1, Math.round((endDay - startDay) / DAY_MS) + 1));
    const list = Array.from({ length: count }, (_, i) => ({
      date: localDay(new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate() - (count - 1 - i))),
      web: 0,
      cli: 0,
      mcp: 0,
    }));
    const index = new Map(list.map((day, i) => [day.date, i]));
    for (const event of data.events) {
      const i = index.get(localDay(new Date(event.at)));
      if (i !== undefined && list[i][event.source] !== undefined) list[i][event.source] += 1;
    }
    return list;
  }, [data, now, from, to]);

  const chartTitle =
    dates.preset === "all"
      ? "Last 30 days"
      : dates.preset === "custom"
        ? days?.length
          ? `${shortDate(days[0].date)} – ${shortDate(days[days.length - 1].date)}`
          : "Custom range"
        : DATE_PRESETS[dates.preset];

  const pages = Math.max(1, Math.ceil(events.length / perPage));
  const current = Math.min(page, pages - 1);
  const shown = events.slice(current * perPage, (current + 1) * perPage);
  // Any filter change starts again from the first page
  const filter = (set) => (value) => {
    set(value);
    setPage(0);
  };

  if (failed) {
    return (
      <div className={`${CARD} ${CARD_PAD} items-start gap-4`}>
        <p className="type-h3">We couldn’t load your usage.</p>
        <p className="type-body text-black/60">Check your connection and try again.</p>
        <Button id="dashboard-usage-try-again" text="Try again" preventDefault onClick={retry} />
      </div>
    );
  }

  if (!data) return <UsageSkeleton />;

  // Admins (and any account without a limit) have no Today meter
  const unlimited = isAdmin || data.isAdmin || !data.limit;

  return (
    <div className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
      {overlays}

      {/* the range for the chart and the table */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="type-label text-black/60">Every effect you’ve installed - from the website, the CLI or MCP - by day.</p>
        <DateRangeFilter label="Showing" value={dates} onChange={filter(setDates)} />
      </div>

      {/* today against the daily limit (not for unlimited accounts) and the chart, equal widths */}
      <div className="flex gap-[calc(var(--cvw)*0.8)] max-lg:flex-col max-lg:gap-3">
        {!unlimited && (
          <section aria-label="Today" className={`flex w-1/2 items-center gap-[calc(var(--cvw)*2)] bg-ink text-foreground ${CARD_PAD} max-lg:w-full max-md:flex-col max-md:items-start max-md:gap-6`}>
            <RingMeter value={data.count} max={data.limit} className="size-[calc(var(--cvw)*8)] shrink-0 max-lg:size-32" />
            <div className="flex flex-col gap-[calc(var(--cvw)*0.6)] max-lg:gap-2">
              <p className="type-label text-foreground/80">Today</p>
              <p className="type-h1">
                <span className="text-primary">{data.count}</span>
                <span className="type-h3 text-foreground/80"> / {data.limit}</span>
              </p>
              <p className="type-body text-foreground/80">
                Effects today across web, CLI and MCP.{now ? ` Resets at ${resetClock(now)} your time, in ${untilReset(now)}.` : ""}
              </p>
              {data.tier !== "pro_plus" && (
                <CardLink tone="dark" href="/pricing#plans" onClick={markScrollToPricingCards}>
                  {data.plan === "pro" ? `Need More? Pro+ Gives You ${PLANS.pro_plus.installsPerDay} a Day` : `Upgrade to Pro for ${PLANS.pro.installsPerDay} a Day`}
                </CardLink>
              )}
            </div>
          </section>
        )}

        <section aria-labelledby="chart-h" className={`${CARD} ${CARD_PAD} min-w-0 flex-1 gap-[calc(var(--cvw)*1.6)] max-lg:gap-5`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="chart-h" className="type-h3">
                {chartTitle}
              </h2>
              <p className="type-small text-black/60">Effects a day. Hover a bar for its numbers.</p>
            </div>
            <ul className="type-small flex gap-3 text-black/60">
              {SOURCE_BARS.map(({ key, label, tone }) => (
                <li key={key} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className={`size-2 ${tone}`} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          {days && <UsageBars days={days} limit={unlimited ? null : data.limit} todayKey={now ? localDay(new Date(now)) : null} />}
        </section>
      </div>

      {/* every effect taken, newest first */}
      <section aria-labelledby="history-h" className={`${CARD} ${CARD_PAD} gap-[calc(var(--cvw)*1.2)] max-lg:gap-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="history-h" className="type-h3">
              Installs
            </h2>
            {data.truncated && <p className="type-small text-black/60">Your latest {data.events.length} installs. Older ones aren’t shown.</p>}
          </div>
          <div className={TOOLBAR}>
            <SearchField value={query} onChange={filter(setQuery)} placeholder="Search effects" label="Search effects" />
            <SlidingSegment id="dashboard-usage-source" label="Source" items={SOURCES} value={source} onChange={filter(setSource)} itemClassName="w-14" />
            <PerPageMenu value={perPage} onChange={filter(setPerPage)} />
          </div>
        </div>

        {data.events.length === 0 ? (
          <div className={EMPTY_TABLE}>
            <p>Nothing yet. Effects you install - copied on the website, or with the CLI or MCP - show up here.</p>
            <Button id="dashboard-usage-browse-all-effects" href="/effects" text="Browse All Effects" />
          </div>
        ) : events.length === 0 ? (
          <p className={EMPTY_TABLE}>No effects match these filters.</p>
        ) : (
          <>
            <TableScroll>
              <table className={TABLE}>
                <thead>
                  <tr className={HEAD_ROW}>
                    <th className={`${TH} ${STICKY_START}`}>Effect</th>
                    <th className={TH}>Source</th>
                    <th className={TH}>When</th>
                    <th className={`${TH} ${STICKY_END}`}>
                      <span className="sr-only">Install command</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((event) => {
                    const effect = effectBySlug(event.name) || { name: event.name, title: event.title };
                    const cover = resolveCover(effect);
                    return (
                      <tr key={`${event.name}-${event.at}`} className={ROW}>
                        <td className={`${TD} ${STICKY_START}`}>
                          <Link href={getEffectHref(effect)} className="group flex items-center gap-3">
                            <span className="relative block aspect-[16/10] w-12 shrink-0 overflow-hidden bg-dark-card">
                              {cover && <Image src={cover} alt="" fill sizes="48px" className="object-cover" />}
                            </span>
                            <span className="type-body max-w-64 truncate transition-colors duration-300 group-hover:text-primary max-md:max-w-36">{effect.title || event.title}</span>
                          </Link>
                        </td>
                        <td className={TD}>
                          <SourceChip source={event.source} />
                        </td>
                        <td className={`type-small ${TD} text-black/60`}>{formatWhen(event.at)}</td>
                        <td className={`${TD} ${STICKY_END} text-right`}>
                          <CopyCommand effect={effect} copyInstall={copyInstall} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScroll>
            <Pager page={current} pages={pages} total={events.length} noun={events.length === 1 ? "event" : "events"} onPage={setPage} />
          </>
        )}
      </section>
    </div>
  );
}
