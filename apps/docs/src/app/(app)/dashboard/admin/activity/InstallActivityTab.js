"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { StatCard } from "@/components/admin/StatCard";
import { LineTrendChart } from "@/components/admin/charts/LineTrendChart";
import { BarRankChart } from "@/components/admin/charts/BarRankChart";
import { DonutChart } from "@/components/admin/charts/DonutChart";
import { buildUserActivitySlug } from "@/lib/user-slug";

// Merges the former standalone /dashboard/admin/installs (aggregate charts)
// and /dashboard/admin/copy-activity (raw per-event log) pages into one tab.
// Both read the same install_events ledger - a copy on the website, a
// `hyperiux add`, and an MCP hyperiux_get_effect call are all just different
// sources for the same underlying "this effect is being (or about to be)
// installed" event, so viewing them as two separate admin pages was drawing
// a distinction the data itself doesn't have.

const EVENTS_PER_PAGE = 15;
const SOURCES = ["all", "web", "cli", "mcp"];

function ChartPanel({ title, children }) {
  return (
    <div className=" bg-[#272727] p-6">
      <p className="mb-4 text-white">{title}</p>
      {children}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="flex h-full flex-col justify-between  p-6 bg-[#272727]">
      <div className="mb-3 h-4 w-20 animate-pulse  bg-white/10" />
      <div className="h-7 w-16 animate-pulse  bg-white/15" />
    </div>
  );
}

function ChartPanelSkeleton({ height = 260 }) {
  return (
    <div className=" bg-[#272727] p-6">
      <div className="mb-4 h-4 w-32 animate-pulse  bg-white/10" />
      <div className="animate-pulse  bg-white/5" style={{ height }} />
    </div>
  );
}

function formatPercent(fraction) {
  return `${Math.round((fraction || 0) * 100)}%`;
}

function SourceBadge({ source }) {
  const styles = {
    web: "bg-blue-500/15 text-blue-400",
    cli: "bg-purple-500/15 text-purple-300",
    mcp: "bg-emerald-500/15 text-emerald-400",
  };

  return (
    <span
      className={`inline-flex items-center  px-2.5 py-0.5 text-xs font-medium uppercase ${
        styles[source] || "bg-white/8 text-white/50"
      }`}
    >
      {source || "unknown"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

// A copy event only has a Clerk identity when it came from a signed-in user
// - anonymous web visitors and unauthenticated CLI/MCP calls are tracked by
// identity_key (device:/ip:) instead, so there's no name/email to show.
function UserCell({ event }) {
  if (event.userId) {
    return (
      <div className="flex items-center gap-3">
        {event.userImageUrl ? (
          <Image
            src={event.userImageUrl}
            alt={event.userName || ""}
            width={28}
            height={28}
            className="h-7 w-7  object-cover ring-1 ring-white/10"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center  bg-white/10 text-xs font-medium">
            {(event.userName?.[0] || event.userEmail?.[0] || "?").toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-medium text-white max-w-48">{event.userName || "-"}</p>
          <p className="truncate text-xs text-white/45 max-w-48">{event.userEmail || event.userId}</p>
        </div>
      </div>
    );
  }

  return (
    <span className="font-mono text-xs text-white/40" title={event.identityKey}>
      Anonymous · {event.identityKey?.split(":")[0] || "unknown"}
    </span>
  );
}

function AggregatePanels() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/admin/installs");
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Failed to load install data");
        if (active) setData(json);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className=" border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (loading || !data) {
    return (
      <>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartPanelSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Installs (30d)" value={data.stats.totalEvents} />
        <StatCard label="Installs Today" value={data.stats.eventsToday} />
        <StatCard
          label="Would-Be-Denied Rate"
          value={formatPercent(data.stats.wouldHaveDeniedRate)}
          detail={`${data.stats.wouldHaveDeniedCount} of ${data.stats.totalEvents} would've hit the cap`}
        />
        <StatCard
          label="Enforcement"
          value={data.stats.enforced ? "ON" : "Shadow mode"}
          detail={data.stats.enforced ? "Limits are actively blocking" : "Tracking only, nothing blocked"}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartPanel title="Installs — last 30 days">
          <LineTrendChart data={data.installTrend} xKey="label" color="#ff5f00" valueLabel="installs" />
        </ChartPanel>

        <ChartPanel title="Would-be-denied — last 30 days">
          <LineTrendChart
            data={data.wouldHaveDeniedTrend}
            xKey="label"
            color="#f87171"
            valueLabel="would-be denials"
          />
        </ChartPanel>

        <ChartPanel title="By source">
          <DonutChart data={data.sourceBreakdown} />
        </ChartPanel>

        <ChartPanel title="By plan">
          <DonutChart data={data.planBreakdown} />
        </ChartPanel>

        <ChartPanel title="Top effects installed">
          <BarRankChart data={data.topEffects} nameKey="name" color="#ff5f00" valueLabel="installs" />
        </ChartPanel>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-white">Top users by copies</h2>
          <p className="mt-1 text-sm text-white/50">
            Signed-in users ranked by successful copies/installs in the last 30 days.
            Click a row for their full activity detail.
          </p>
        </div>

        <div className="overflow-hidden  border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/45">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/45">User</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-white/45">Copies</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/6">
                {data.topUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-white/40">
                      No signed-in copies in the last 30 days.
                    </td>
                  </tr>
                ) : (
                  data.topUsers.map((user, index) => (
                    <tr key={user.clerkUserId} className="transition hover:bg-white/2">
                      <td className="px-4 py-3 text-white/45">#{index + 1}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/admin/activity/${buildUserActivitySlug(user)}`}
                          className="flex items-center gap-3 w-fit"
                        >
                          {user.imageUrl ? (
                            <Image
                              src={user.imageUrl}
                              alt={user.name || ""}
                              width={28}
                              height={28}
                              className="h-7 w-7  object-cover ring-1 ring-white/10"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center  bg-white/10 text-xs font-medium">
                              {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
                            </div>
                          )}
                          <span className="text-white/80 hover:text-white hover:underline">
                            {user.name || user.email || user.clerkUserId}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-white">{user.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function EventLog() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [effectSearch, setEffectSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [prevEffectSearch, setPrevEffectSearch] = useState(effectSearch);
  const [prevSourceFilter, setPrevSourceFilter] = useState(sourceFilter);

  // Reset to page 1 whenever a filter changes - derived purely from values
  // already available during render, so adjust it here instead of in an effect.
  if (prevEffectSearch !== effectSearch || prevSourceFilter !== sourceFilter) {
    setPrevEffectSearch(effectSearch);
    setPrevSourceFilter(sourceFilter);
    setCurrentPage(1);
  }

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (effectSearch) params.set("effect", effectSearch);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      params.set("limit", String(EVENTS_PER_PAGE));
      params.set("offset", String((currentPage - 1) * EVENTS_PER_PAGE));

      const res = await fetch(`/api/admin/copy-activity?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load activity");
      setEvents(json.events || []);
      setTotal(json.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [effectSearch, sourceFilter, currentPage]);

  useEffect(() => {
    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const totalPages = Math.max(1, Math.ceil(total / EVENTS_PER_PAGE));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-white">Recent installs &amp; copies</h2>
        <p className="mt-1 text-sm text-white/50">
          {total} events across web, CLI, and MCP — every one is a real (or would-be) effect delivery.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            placeholder="Search by effect…"
            value={effectSearch}
            onChange={(e) => setEffectSearch(e.target.value)}
            className="w-full  border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/25"
          />
        </div>
        <CustomSelect
          value={sourceFilter}
          onChange={setSourceFilter}
          options={SOURCES.map((s) => ({
            value: s,
            label: s === "all" ? "All sources" : s.toUpperCase(),
          }))}
        />
      </div>

      {error && (
        <div className=" border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className=" border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Effect</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4  bg-white/8 animate-pulse" style={{ width: j === 0 ? "140px" : "80px" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-white/40">
                    No activity found.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="transition hover:bg-white/2">
                    <td className="px-4 py-3">
                      <UserCell event={event} />
                    </td>
                    <td className="px-4 py-3 text-white/80">{event.effectTitle}</td>
                    <td className="px-4 py-3">
                      <SourceBadge source={event.source} />
                    </td>
                    <td className="px-4 py-3 text-white/60 whitespace-nowrap text-xs">
                      {formatDate(event.occurredAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && events.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-white/45">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center  border border-white/10 bg-white/5 text-white/70 transition hover:border-white/25 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center  border border-white/10 bg-white/5 text-white/70 transition hover:border-white/25 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function InstallActivityTab() {
  return (
    <div className="space-y-6">
      <AggregatePanels />
      <EventLog />
    </div>
  );
}
