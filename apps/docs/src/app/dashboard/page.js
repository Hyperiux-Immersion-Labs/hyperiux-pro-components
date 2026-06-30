"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CliTokenManager from "@/components/Dashboard/CliTokenManager";

function formatDate(value) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getBillingLabel(value) {
  const labels = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
  };

  return labels[value] || "Not available";
}

function StatCard({
  label,
  value,
  detail,
  href,
}) {
  const content = (
    <div className="h-full border border-white/10 rounded-lg p-6 bg-white/5 backdrop-blur-lg transition duration-300 hover:border-[#ff5f00]">
      <p className="text-white/75 mb-3">
        {label}
      </p>

      <p className="text-2xl font-medium leading-none">
        {value}
      </p>

      {detail && (
        <p className="text-white/75 mt-4">
          {detail}
        </p>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const justUpgraded = searchParams.get("upgraded") === "true";
  const sessionId = searchParams.get("session_id");

  const [data, setData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [portalError, setPortalError] = useState(null);
  const [upgradeCycle, setUpgradeCycle] = useState("monthly");

  async function handleManageSubscription() {
    setOpeningPortal(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPath: "/dashboard/settings" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Portal unavailable");
      window.location.href = json.url;
    } catch (err) {
      setPortalError(err.message);
      setOpeningPortal(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    setUpgradeError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingInterval: upgradeCycle,
          successUrl: "/effects?upgraded=true",
          cancelUrl: "/dashboard",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");
      window.location.href = json.url;
    } catch (err) {
      setUpgradeError(err.message);
      setUpgrading(false);
    }
  }

  // When Stripe redirects back with a session_id, sync the subscription to
  // Supabase + Clerk immediately (covers local dev where webhooks don't fire).
  useEffect(() => {
    if (!justUpgraded || !sessionId) return;

    let active = true;
    setSyncing(true);

    fetch("/api/stripe/sync-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then(() => {
        if (!active) return;
        // Reload dashboard data to reflect the updated plan
        return fetch("/api/dashboard")
          .then((r) => r.json())
          .then((json) => { if (active) setData(json); });
      })
      .catch(console.error)
      .finally(() => { if (active) setSyncing(false); });

    return () => { active = false; };
  }, [justUpgraded, sessionId]);

  useEffect(() => {
    let active = true;

    async function load() {
      const res = await fetch("/api/dashboard");
      const json = await res.json();

      if (active) setData(json);
    }

    const frame = requestAnimationFrame(() => {
      load();
    });

    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, []);

  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const daysRemaining = useMemo(() => {
    if (!data?.planValidUntil || now === null) return null;

    const end = new Date(data.planValidUntil).getTime();

    if (Number.isNaN(end)) return null;

    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }, [data?.planValidUntil, now]);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  const planLabel = data.plan === "pro" ? "Pro" : "Free";
  const accessLabel = `${data.totalEffectsAccess}`;

  const proValidityDetail =
    data.plan === "pro"
      ? data.planValidUntil
        ? `${daysRemaining} days remaining`
        : "Active subscription"
      : "Upgrade to unlock validity";

  return (
    <div className="space-y-8">
      {justUpgraded && (
        <div className="border border-green-500/30 rounded-lg px-6 py-4 bg-green-500/10 text-green-400">
          {syncing
            ? "Activating your Pro account…"
            : "🎉 Welcome to Pro! Your account has been upgraded."}
        </div>
      )}

      <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-5">
        <StatCard
          label="Saved Effects"
          value={data.savedCount}
          detail="Effects in your wishlist"
          href="/dashboard/saved"
        />

        <StatCard
          label="Joined"
          value={formatDate(data.joinedAt)}
          detail="Account creation date"
        />

        <StatCard
          label="Plan"
          value={planLabel}
          detail={data.plan === "pro" ? "Full vault access" : "Starter access"}
          href="/pricing"
        />

        <StatCard
          label="Effects Access"
          value={accessLabel}
          detail={`${data.totalEffectsAccess} of ${data.totalEffects} effects available`}
        />

        <StatCard
          label={data.plan === "pro" ? "Valid Until" : "Plan Validity"}
          value={data.plan === "pro" ? formatDate(data.planValidUntil) : "Free"}
          detail={proValidityDetail}
          href={data.plan === "pro" ? undefined : "/pricing"}
        />
      </div>

      <div className="border border-white/10 rounded-lg p-6 bg-white/5 backdrop-blur-lg">
        <div className="flex items-center justify-between gap-6 max-md:flex-col max-md:items-start">
          <div>
            <h2 className="text-2xl font-semibold">
              Vault access
            </h2>

            {data.plan === "pro" ? (
              <div className="mt-2 space-y-2 text-white/75">
                <p>
                  Your Pro access is active. You have full access to the Hyperiux Vault.
                </p>
                <p>
                  Billing cycle:{" "}
                  <span className="text-white">
                    {getBillingLabel(data.billingInterval)}
                  </span>
                </p>
                <p>
                  Valid until / renews on:{" "}
                  <span className="text-white">
                    {formatDate(data.planValidUntil)}
                  </span>
                </p>
                <p>
                  Status:{" "}
                  <span className="text-white capitalize">
                    {data.subscriptionStatus}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-white/75 mt-2">
                Free accounts include 30 effects. Upgrade to unlock the full vault.
              </p>
            )}
          </div>

          {data.plan === "free" && (
            <div className="flex flex-col items-end gap-3">
              <div className="flex rounded-full border border-white/15 bg-white/5 p-1 text-sm">
                <button
                  type="button"
                  onClick={() => setUpgradeCycle("monthly")}
                  className={`rounded-full px-4 py-1.5 transition-colors duration-200 ${
                    upgradeCycle === "monthly"
                      ? "bg-white text-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setUpgradeCycle("yearly")}
                  className={`rounded-full px-4 py-1.5 transition-colors duration-200 ${
                    upgradeCycle === "yearly"
                      ? "bg-white text-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Yearly
                  <span className="ml-1.5 rounded-full bg-[#ff5f00] px-1.5 py-0.5 text-[10px] font-medium text-white">
                    20% off
                  </span>
                </button>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="inline-flex px-5 py-3 rounded-full bg-white text-black transition duration-300 hover:bg-[#ff5f00] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upgrading ? "Redirecting…" : "Upgrade to Pro"}
              </button>

              {upgradeError && (
                <p className="text-red-400 text-sm">{upgradeError}</p>
              )}
            </div>
          )}

          {data.plan === "pro" && (
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-3">
                <button
                  onClick={handleManageSubscription}
                  disabled={openingPortal}
                  className="inline-flex px-5 py-3 rounded-full border border-white/20 text-white transition duration-300 hover:border-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {openingPortal ? "Opening…" : "Manage Subscription"}
                </button>
                <Link
                  href="/effects"
                  className="inline-flex px-5 py-3 rounded-full bg-white text-black transition duration-300 hover:bg-[#ff5f00] hover:text-white"
                >
                  Explore Pro Effects
                </Link>
              </div>
              {portalError && (
                <p className="text-red-400 text-sm">{portalError}</p>
              )}
            </div>
          )}
        </div>
      </div>
      <CliTokenManager plan={data.plan} />
    </div>
  );
}