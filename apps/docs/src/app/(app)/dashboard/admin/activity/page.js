"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { LineTrendChart } from "@/components/admin/charts/LineTrendChart";
import { BarRankChart } from "@/components/admin/charts/BarRankChart";
import { DonutChart } from "@/components/admin/charts/DonutChart";
import { buildUserActivitySlug } from "@/lib/user-slug";

const USERS_PER_PAGE = 10;

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function ChartPanel({ title, children }) {
  return (
    <div className="rounded-md bg-[#272727] p-6">
      <p className="mb-4 text-white">{title}</p>
      {children}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="flex h-full flex-col justify-between rounded-md p-6 bg-[#272727]">
      <div className="mb-3 h-4 w-20 animate-pulse rounded bg-white/10" />
      <div className="h-7 w-16 animate-pulse rounded bg-white/15" />
    </div>
  );
}

function ChartPanelSkeleton({ height = 260 }) {
  return (
    <div className="rounded-md bg-[#272727] p-6">
      <div className="mb-4 h-4 w-32 animate-pulse rounded bg-white/10" />
      <div className="animate-pulse rounded bg-white/5" style={{ height }} />
    </div>
  );
}

function PlanBadge({ plan }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        plan === "pro"
          ? "bg-[#ff5f00]/15 text-[#ff5f00]"
          : "bg-white/8 text-white/60"
      }`}
    >
      {plan === "pro" ? "Pro" : "Free"}
    </span>
  );
}

export default function AdminActivityPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      try {
        const res = await fetch("/api/admin/activity/overview");
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Failed to load activity overview");
        if (active) setOverview(json);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOverview();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setUsersLoading(true);

      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);

        const res = await fetch(`/api/admin/users?${params.toString()}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Failed to load users");
        if (active) setUsers(json.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setUsersLoading(false);
      }
    }

    const timer = setTimeout(loadUsers, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const pagedUsers = useMemo(
    () =>
      users.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE),
    [users, currentPage]
  );

  return (
    <div className="space-y-6">
      <div>
        

        <h1 className="text-2xl font-semibold">User Activity</h1>
        <p className="mt-1 text-sm text-white/50">
          Site-wide usage trends and per-user drill-down.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading || !overview ? (
        <>
          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChartPanelSkeleton key={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total Users" value={overview.stats.totalUsers} />
            <StatCard label="Pro Users" value={overview.stats.proUsers} />
            <StatCard label="Copies Today" value={overview.stats.copiesToday} />
            <StatCard label="Saved Effects" value={overview.stats.totalSaved} />
            <StatCard
              label="Revenue (MTD)"
              value={formatCurrency(overview.stats.monthToDateRevenue)}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartPanel title="Signups — last 30 days">
              <LineTrendChart
                data={overview.signupTrend}
                xKey="label"
                color="#60a5fa"
                valueLabel="signups"
              />
            </ChartPanel>

            <ChartPanel title="Copy activity — last 30 days">
              <LineTrendChart
                data={overview.copyTrend}
                xKey="label"
                color="#ff5f00"
                valueLabel="copies"
              />
            </ChartPanel>

            <ChartPanel title="Revenue — last 30 days">
              <LineTrendChart
                data={overview.revenueTrend}
                xKey="label"
                color="#4ade80"
                valueLabel="revenue (₹)"
              />
            </ChartPanel>

            <ChartPanel title="Plan distribution">
              <DonutChart data={overview.planDistribution} />
            </ChartPanel>

            <ChartPanel title="Top saved effects">
              <BarRankChart
                data={overview.topSavedEffects}
                nameKey="name"
                color="#c084fc"
                valueLabel="saves"
              />
            </ChartPanel>

            <ChartPanel title="Top copied effects">
              <BarRankChart
                data={overview.topCopiedEffects}
                nameKey="name"
                color="#ff5f00"
                valueLabel="copies"
              />
            </ChartPanel>
          </div>
        </>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-white">Users</h2>

          <div className="relative min-w-60 flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/25"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/45">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/45">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/45">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-white/45">
                    Activity
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/6">
                {usersLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 4 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div
                            className="h-4 animate-pulse rounded bg-white/8"
                            style={{ width: j === 0 ? "140px" : "80px" }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-white/40">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  pagedUsers.map((user) => (
                    <tr key={user.id} className="transition hover:bg-white/2">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.imageUrl ? (
                            <Image
                              src={user.imageUrl}
                              alt={user.name || ""}
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                              {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="max-w-48 truncate font-medium text-white">
                              {user.name || "-"}
                            </p>
                            <p className="max-w-48 truncate text-xs text-white/45">
                              {user.email || user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-white/60">
                        {formatDate(user.joinedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <PlanBadge plan={user.plan} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/admin/activity/${buildUserActivitySlug(user)}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
                        >
                          View
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!usersLoading && users.length > 0 && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-white/45">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
