"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { LineTrendChart } from "@/components/admin/charts/LineTrendChart";
import { EffectRankSlider } from "@/components/admin/EffectRankSlider";

// Users can land here from three different places (User Management, the
// Activity tab's user table, or its "Top users by copies" list) - going
// back should return to whichever of those was actually clicked, not
// always the Activity tab. router.back() does that; the history-length
// check is only a fallback for a cold load (bookmark, refresh, direct
// link) where there's nothing in this tab's history to go back to.
function BackLink() {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/admin/activity");
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back
    </button>
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

function ActivityDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-32 animate-pulse  bg-white/10" />

      <div className="flex items-center gap-4">
        <div className="h-14 w-14 animate-pulse  bg-white/10" />

        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse  bg-white/10" />
          <div className="h-4 w-52 animate-pulse  bg-white/8" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className=" bg-[#272727] p-6">
        <div className="mb-4 h-4 w-48 animate-pulse  bg-white/10" />
        <div className="h-[220px] animate-pulse  bg-white/5" />
      </div>

      <div className="flex flex-col gap-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className=" bg-[#272727] p-6">
            <div className="mb-4 h-5 w-40 animate-pulse  bg-white/10" />
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 3 }).map((__, j) => (
                <div key={j} className="min-w-[26vw] max-xl:min-w-[38vw] max-md:min-w-[70vw] shrink-0 space-y-3">
                  <div className="aspect-3/2 animate-pulse bg-white/5" />
                  <div className="h-5 w-2/3 animate-pulse bg-white/10" />
                </div>
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

// stats.lifetimeSpend from the API is already a decimal (pre-divided
// server-side), not the smallest currency unit - format it directly rather
// than round-tripping through formatAmount's paise assumption. Takes the
// same currency as stats.lifetimeSpendCurrency, which the API derives from
// the user's own paid invoices - so this always matches what Billing
// History below shows per-row, instead of a hardcoded "INR" that reads
// wrong for a USD customer.
function formatSpend(amount, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${(amount || 0).toFixed(2)} ${currency}`;
  }
}

function StatusBadge({ status }) {
  const isPaid = status === "paid";

  return (
    <span
      className={`inline-flex items-center  px-3 py-1 text-xs font-medium capitalize ${
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
      <div className="space-y-4">
        <BackLink />

        <div className=" border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error || "User not found."}
        </div>
      </div>
    );
  }

  const {
    profile,
    session,
    subscription,
    stats,
    copyTrend,
    savedEffects,
    copiedEffects,
    installedEffects,
    templatePurchases,
    invoices,
  } = data;

  // Copies are always a subset of installs (every web copy is also an
  // install_unlocks row) - when a user has never installed anything via
  // CLI/MCP, "Installed Effects" would just be the exact same list as
  // "Copied Effects" a second time, so it's hidden rather than shown
  // twice.
  const installsMatchCopies =
    installedEffects.length === copiedEffects.length &&
    installedEffects.every((effect) => copiedEffects.some((copied) => copied.slug === effect.slug));

  return (
    <div className="space-y-4">
      <BackLink />

      <div className="flex items-center gap-4">
        {profile.imageUrl ? (
          <Image
            src={profile.imageUrl}
            alt={profile.name || ""}
            width={56}
            height={56}
            className="h-14 w-14  object-cover ring-1 ring-white/10"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center  bg-white/10 text-lg font-medium">
            {(profile.name?.[0] || profile.email?.[0] || "?").toUpperCase()}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{profile.name || "Unnamed user"}</h1>

            {profile.isAdmin && (
              <span className=" bg-[#ff5f00]/15 px-2.5 py-0.5 text-xs font-medium text-[#ff5f00]">
                Admin
              </span>
            )}

            {!profile.isAdmin && (
              <span
                className={` px-2.5 py-0.5 text-xs font-medium ${
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Saved Effects" value={stats.savedCount} />
        <StatCard label="Effects Copied" value={stats.copiedCount} />
        <StatCard
          label="Lifetime Spend"
          value={formatSpend(stats.lifetimeSpend, stats.lifetimeSpendCurrency)}
        />
        <StatCard label="Templates Purchased" value={templatePurchases.length} />
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

      <div className=" bg-[#272727] p-6">
        <p className="mb-4 text-white">Copy activity - last 30 days</p>
        <LineTrendChart data={copyTrend} xKey="label" color="#ff5f00" valueLabel="copies" />
      </div>

      <div className="flex flex-col gap-5">
        <div className=" bg-[#272727] p-6">
          {savedEffects.length === 0 ? (
            <>
              <p className="mb-4 text-white text-xl">Saved Effects (0)</p>
              <div className="text-center text-sm text-white/40">No saved effects yet.</div>
            </>
          ) : (
            <EffectRankSlider
              title={`Saved Effects (${savedEffects.length})`}
              effects={savedEffects}
              renderValue={(effect) => (
                <span className="text-sm font-normal text-white/60">
                  Saved {formatDate(effect.savedAt)}
                </span>
              )}
            />
          )}
        </div>

        <div className=" bg-[#272727] p-6">
          {copiedEffects.length === 0 ? (
            <>
              <p className="mb-4 text-white text-xl">Copied Effects (0)</p>
              <div className="text-center text-sm text-white/40">No copied effects yet.</div>
            </>
          ) : (
            <EffectRankSlider
              title={`Copied Effects (${copiedEffects.length})`}
              effects={copiedEffects}
              renderValue={(effect) => (
                <span className="text-sm font-normal text-white/60">
                  Last copied {formatDate(effect.lastCopiedAt)}
                </span>
              )}
            />
          )}
        </div>

        {!installsMatchCopies && (
          <div className=" bg-[#272727] p-6">
            {installedEffects.length === 0 ? (
              <>
                <p className="mb-4 text-white text-xl">Installed Effects (0)</p>
                <div className="text-center text-sm text-white/40">No installed effects yet.</div>
              </>
            ) : (
              <EffectRankSlider
                title={`Installed Effects (${installedEffects.length})`}
                effects={installedEffects}
                renderValue={(effect) => (
                  <span className="text-sm font-normal text-white/60">
                    Last installed {formatDate(effect.lastInstalledAt)}
                  </span>
                )}
              />
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium text-white">
          Billing History ({invoices.length})
        </h2>

        {invoices.length === 0 ? (
          <div className=" bg-[#272727] p-6 text-center text-sm text-white/40">
            No invoices yet.
          </div>
        ) : (
          <div className="overflow-x-auto  bg-[#272727]">
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
                        <span className="ml-2  bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
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

      <div>
        <h2 className="mb-3 text-lg font-medium text-white">
          Template Purchases ({templatePurchases.length})
        </h2>

        {templatePurchases.length === 0 ? (
          <div className="rounded-md bg-[#272727] p-6 text-center text-sm text-white/40">
            No template purchases yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md bg-[#272727]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Template</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Payment ID</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {templatePurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 text-white">{formatDateTime(purchase.createdAt)}</td>

                    <td className="px-6 py-4 text-white/80">{purchase.templateTitle}</td>

                    <td className="px-6 py-4 text-white">
                      {formatTemplateAmount(purchase.amount, purchase.currency)}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-white/50">
                      {purchase.paymentId ? `${purchase.paymentId.slice(0, 16)}…` : "-"}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={purchase.status} />
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
