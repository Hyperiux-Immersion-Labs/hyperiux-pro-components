"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { LineTrendChart } from "@/components/admin/charts/LineTrendChart";

function StatCardSkeleton() {
  return (
    <div className="flex h-full flex-col justify-between rounded-md p-6 bg-[#272727]">
      <div className="mb-3 h-4 w-20 animate-pulse rounded bg-white/10" />
      <div className="h-7 w-16 animate-pulse rounded bg-white/15" />
    </div>
  );
}

function ActivityDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-white/10" />

      <div className="flex items-center gap-4">
        <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />

        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-52 animate-pulse rounded bg-white/8" />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="rounded-md bg-[#272727] p-6">
        <div className="mb-4 h-4 w-48 animate-pulse rounded bg-white/10" />
        <div className="h-[220px] animate-pulse rounded bg-white/5" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
            <div className="divide-y divide-white/6 overflow-hidden rounded-lg border border-white/10">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="h-14 animate-pulse bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

// `amount` is in the smallest currency unit (paise for INR), matching how
// invoices.amount is stored - see recordInvoice() in @/lib/pro-access.
function formatAmount(amount, currency = "INR") {
  if (typeof amount !== "number") return "-";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  }
}

// stats.lifetimeSpend from the API is already a rupee decimal (pre-divided
// server-side), not paise - format it directly rather than round-tripping
// through formatAmount's paise assumption.
function formatRupees(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

function StatusBadge({ status }) {
  const isPaid = status === "paid";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${
        isPaid ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-white/60"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

export default function AdminUserActivityPage({ params }) {
  const { userSlug } = use(params);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadActivity() {
      try {
        // The API route extracts the real Clerk user id from the slug -
        // forwarding the whole thing keeps the two in lockstep instead of
        // duplicating the "--id" parsing on the client too.
        const res = await fetch(`/api/admin/activity/${userSlug}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Failed to load user activity");
        if (active) setData(json);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadActivity();

    return () => {
      active = false;
    };
  }, [userSlug]);

  if (loading) {
    return <ActivityDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/admin/activity"
          className="flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Activity
        </Link>

        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error || "User not found."}
        </div>
      </div>
    );
  }

  const { profile, session, subscription, stats, copyTrend, savedEffects, copiedEffects, invoices } =
    data;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin/activity"
        className="flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Activity
      </Link>

      <div className="flex items-center gap-4">
        {profile.imageUrl ? (
          <Image
            src={profile.imageUrl}
            alt={profile.name || ""}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover ring-1 ring-white/10"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-lg font-medium">
            {(profile.name?.[0] || profile.email?.[0] || "?").toUpperCase()}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{profile.name || "Unnamed user"}</h1>

            {profile.isAdmin && (
              <span className="rounded-full bg-[#ff5f00]/15 px-2.5 py-0.5 text-xs font-medium text-[#ff5f00]">
                Admin
              </span>
            )}

            {!profile.isAdmin && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  subscription?.plan === "pro"
                    ? "bg-[#ff5f00]/15 text-[#ff5f00]"
                    : "bg-white/8 text-white/60"
                }`}
              >
                {subscription?.plan === "pro" ? "Pro" : "Free"}
              </span>
            )}
          </div>

          <p className="text-sm text-white/50">{profile.email || profile.id}</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Saved Effects" value={stats.savedCount} />
        <StatCard label="Effects Copied" value={stats.copiedCount} />
        <StatCard label="Lifetime Spend" value={formatRupees(stats.lifetimeSpend)} />
        <StatCard
          label="Last Sign-in"
          value={profile.lastSignInAt ? formatDate(profile.lastSignInAt) : "Never"}
          detail={
            session ? (
              <span>
                {[session.browserName, session.deviceType, session.city, session.country]
                  .filter(Boolean)
                  .join(" · ") || "Active session"}
              </span>
            ) : (
              "No active session"
            )
          }
        />
      </div>

      <div className="rounded-md bg-[#272727] p-6">
        <p className="mb-4 text-white">Copy activity — last 30 days</p>
        <LineTrendChart data={copyTrend} xKey="label" color="#ff5f00" valueLabel="copies" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-medium text-white">
            Saved Effects ({savedEffects.length})
          </h2>

          {savedEffects.length === 0 ? (
            <div className="rounded-md bg-[#272727] p-6 text-center text-sm text-white/40">
              No saved effects yet.
            </div>
          ) : (
            <div className="divide-y divide-white/6 overflow-hidden rounded-lg border border-white/10">
              {savedEffects.map((effect) => (
                <div
                  key={effect.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-white">{effect.title}</p>
                    <p className="truncate text-xs text-white/40">
                      Saved {formatDate(effect.savedAt)}
                    </p>
                  </div>

                  {effect.tier === "pro" && (
                    <span className="shrink-0 rounded-full bg-[#ff5f00]/15 px-2.5 py-0.5 text-xs font-medium text-[#ff5f00]">
                      Pro
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-medium text-white">
            Copied Effects ({copiedEffects.length})
          </h2>

          {copiedEffects.length === 0 ? (
            <div className="rounded-md bg-[#272727] p-6 text-center text-sm text-white/40">
              No copied effects yet.
            </div>
          ) : (
            <div className="divide-y divide-white/6 overflow-hidden rounded-lg border border-white/10">
              {copiedEffects.map((effect) => (
                <div
                  key={effect.name}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-white">{effect.title}</p>
                    <p className="truncate text-xs text-white/40">
                      Last copied {formatDate(effect.lastCopiedAt)}
                    </p>
                  </div>

                  {effect.tier === "pro" && (
                    <span className="shrink-0 rounded-full bg-[#ff5f00]/15 px-2.5 py-0.5 text-xs font-medium text-[#ff5f00]">
                      Pro
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium text-white">
          Billing History ({invoices.length})
        </h2>

        {invoices.length === 0 ? (
          <div className="rounded-md bg-[#272727] p-6 text-center text-sm text-white/40">
            No invoices yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md bg-[#272727]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 text-white">{formatDateTime(invoice.created_at)}</td>

                    <td className="px-6 py-4 text-white/80">
                      {invoice.plan_label || "Vault Pro"}
                      {invoice.is_test && (
                        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
                          Test
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-white">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
