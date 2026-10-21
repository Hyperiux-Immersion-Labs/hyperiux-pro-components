"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { useDashboard } from "@/components/Dashboard/DashboardContext";
import { ACTION_LINE, ALL_DATES, CARD, CARD_PAD, DateRangeFilter, EMPTY_TABLE, PaymentsTable } from "@/components/Dashboard/DashboardUI";
import { SOURCE_BARS, UsageBars } from "@/components/Dashboard/UsageBars";
import { SlidingSegment } from "@/components/ui/SlidingSegment";
import { Bar, SkeletonCard } from "@/components/Dashboard/DashboardSkeletons";
import { EffectCard } from "@/app/(app)/(workspace)/effects/EffectCard";
import { SliderArrowButton } from "@/components/ui/SliderArrowButton";
import { useGlideRow } from "@/hooks/useGlideRow";
import { TemplateCard } from "@/app/(app)/(workspace)/templates/TemplateCard";
import { getEffectHref } from "@/lib/categories";
import { getDashboardPreview, sampleAdminUser } from "@/lib/dev/dashboardPreview";

// One user's activity, for admins: who they are, their numbers, installs by day, the
// effects they saved / installed, templates they bought, and every payment.

const EFFECT_TABS = [
  { id: "saved", label: "Saved", key: "savedEffects", date: "savedAt", verb: "Saved" },
  { id: "installed", label: "Installed", key: "installedEffects", date: "lastInstalledAt", verb: "Last installed" },
];

const formatDate = (value) => (value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "—");

// `minorUnits`: invoices store paise / cents; template purchases and lifetime spend whole units
function money(amount, currency = "USD", minorUnits = false) {
  if (typeof amount !== "number") return "—";
  const value = minorUnits ? amount / 100 : amount;
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

// The date filter as the API's range / from / to
function rangeParams(dates) {
  const params = new URLSearchParams();
  if (dates.preset === "custom") {
    if (dates.from) params.set("from", dates.from);
    if (dates.to) params.set("to", dates.to);
  } else {
    params.set("range", dates.preset);
  }
  return params;
}

function Kpi({ label, value, detail }) {
  return (
    <div className={`${CARD} ${CARD_PAD} min-w-0 flex-1 justify-between gap-(--cvw) max-lg:w-[calc((100%-1.5rem)/3)] max-lg:flex-none max-lg:gap-3 max-md:w-full`}>
      <p className="type-label text-black/60">{label}</p>
      <p className="type-h2 truncate">{value}</p>
      {detail && <p className="type-small text-black/60">{detail}</p>}
    </div>
  );
}

// The page while it loads, from the real cards' frames (DashboardSkeletons, as every other
// dashboard tab): the person, their numbers (one fewer without View finances), installs by
// day, and the Effects slider
function UserSkeleton({ finance }) {
  return (
    <div aria-busy="true" aria-label="Loading user" className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
      <SkeletonCard className="flex-row flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-[calc(var(--cvw)*1.2)] max-lg:gap-4">
          <Bar className="size-14 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1">
            <Bar type="type-h3" className="w-[calc(var(--cvw)*12)] max-lg:w-40" />
            <Bar type="type-small" className="w-[calc(var(--cvw)*14)] max-lg:w-48" />
          </div>
        </div>
        <Bar className="h-9.5 w-[calc(var(--cvw)*13)] max-lg:w-48" />
      </SkeletonCard>

      <div className="flex gap-[calc(var(--cvw)*0.8)] max-lg:flex-wrap max-lg:gap-3">
        {Array.from({ length: finance ? 5 : 4 }, (_, i) => (
          <SkeletonCard key={i} className="min-w-0 flex-1 gap-(--cvw) max-lg:w-[calc((100%-1.5rem)/3)] max-lg:flex-none max-lg:gap-3 max-md:w-full">
            <Bar type="type-label" className="w-[45%]" />
            <Bar type="type-h2" className="w-[40%]" />
            <Bar type="type-small" className="w-[70%]" />
          </SkeletonCard>
        ))}
      </div>

      <SkeletonCard className="gap-[calc(var(--cvw)*1.6)] max-lg:gap-5">
        <div className="flex justify-between gap-3">
          <div className="flex w-[50%] flex-col gap-1">
            <Bar type="type-h3" className="w-[45%]" />
            <Bar type="type-small" className="w-[60%]" />
          </div>
          <Bar type="type-small" className="w-32" />
        </div>
        <div className="flex h-[calc(var(--cvw)*10)] items-end gap-1 max-lg:h-40">
          {[40, 65, 30, 80, 55, 20, 70, 45, 90, 35, 60, 50, 75, 25, 55, 85, 40, 65].map((h, i) => (
            <Bar key={i} className="flex-1" style={{ height: `${h}%` }} />
          ))}
        </div>
      </SkeletonCard>

      <SkeletonCard className="gap-(--cvw) max-lg:gap-4">
        <div className="flex items-center justify-between gap-3">
          <Bar type="type-h3" className="w-28" />
          <Bar className="h-9.5 w-52 max-md:w-40" />
        </div>
        <div className="flex gap-[calc(var(--cvw)*1.3)] overflow-hidden max-lg:gap-[2vw] max-md:gap-[4vw]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex w-[calc((100%-var(--cvw)*2.6)/3)] shrink-0 flex-col gap-2 max-lg:w-[45%] max-md:w-[82%]">
              <Bar className="aspect-[16/8.6] h-auto w-full" />
              <Bar type="type-body" className="w-[55%]" />
              <Bar type="type-small" className="w-[40%]" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}

// Back to wherever the admin came from (Users, Activity...), or Activity on a cold load
function BackButton() {
  const { path } = useDashboard();
  const router = useRouter();
  return (
    <button type="button" onClick={() => (window.history.length > 1 ? router.back() : router.push(path("admin/activity")))} className={ACTION_LINE}>
      <ArrowLeft aria-hidden="true" />
      Back
    </button>
  );
}

export default function AdminUserActivityPage({ params }) {
  const { userSlug } = use(params);
  const clerkUserId = useSearchParams().get("u");
  const { effectBySlug, catalog, can } = useDashboard();

  const [dates, setDates] = useState(ALL_DATES);
  const [tab, setTab] = useState("saved");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  // The Effects slider: drag, wheel and the arrows (hooks/useGlideRow), re-measured per tab
  const { ref: rowRef, edges: rowEdges, step: stepRow, handlers: rowHandlers } = useGlideRow([tab, data]);
  // ...and the Purchased templates slider
  const { ref: tplRef, edges: tplEdges, step: stepTpl, handlers: tplHandlers } = useGlideRow([data]);

  useEffect(() => {
    if (dates.preset === "custom" && !dates.from) return undefined;
    let active = true;
    if (getDashboardPreview()) {
      requestAnimationFrame(() => active && setData(sampleAdminUser(catalog)));
      return () => {
        active = false;
      };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(null);
    // The API route turns the slug back into the Clerk user
    // ?u= (the account's id, on every link) goes along so two people sharing a name can't mix
    const query = rangeParams(dates);
    if (clerkUserId) query.set("u", clerkUserId);
    fetch(`/api/admin/activity/${userSlug}?${query}`)
      .then((res) => res.json().then((json) => (res.ok ? json : Promise.reject(new Error(json.error || "Failed to load user activity")))))
      .then((json) => active && setData(json))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [userSlug, clerkUserId, dates, catalog]);

  if (error) {
    return (
      <div className={`${CARD} ${CARD_PAD} items-start gap-4`}>
        <BackButton />
        <p className="type-h3">We couldn’t load this user.</p>
        <p className="type-body text-black/60">{error}</p>
      </div>
    );
  }

  if (!data) return <UserSkeleton finance={can("finance.view")} />;

  const { profile, session, subscription, stats, installTrend, templatePurchases, purchasedTemplates, invoices } = data;
  const current = EFFECT_TABS.find((t) => t.id === tab);
  const effects = data[current.key] || [];
  const spend = stats.lifetimeSpendByCurrency || [];
  // Payments and spend: super admins only (the API leaves them out for other admins;
  // the development preview's sample has them)
  const showBilling = data.showBilling !== false;
  const usd = spend.find((row) => row.currency === "USD")?.amount || 0;
  const days = (installTrend || []).map(({ date, web, cli, mcp }) => ({ date, web: web || 0, cli: cli || 0, mcp: mcp || 0 }));

  // Subscriptions and templates together, newest first
  const payments = [
    ...invoices.map((invoice) => ({
      id: `i-${invoice.id}`,
      date: invoice.created_at,
      description: invoice.plan_label || "Vault Pro",
      amount: money(invoice.amount, invoice.currency, true),
      paymentId: invoice.razorpay_payment_id,
      status: invoice.status,
      url: invoice.invoice_url,
    })),
    ...templatePurchases.map((purchase) => ({
      id: `t-${purchase.id}`,
      date: purchase.createdAt,
      description: `Template · ${purchase.templateTitle}`,
      amount: money(purchase.amount, purchase.currency),
      paymentId: purchase.paymentId,
      status: purchase.status,
      url: purchase.invoiceUrl,
    })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return (
    <div className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
      {/* who: the person, their plan; the date filter (the header's arrow goes back) */}
      <section aria-label="User" className={`${CARD} ${CARD_PAD} flex-row flex-wrap items-center justify-between gap-4`}>
        <div className="flex min-w-0 items-center gap-[calc(var(--cvw)*1.2)] max-lg:gap-4">
          <UserAvatar name={profile.name} email={profile.email} imageUrl={profile.imageUrl} className="size-14" textClassName="type-body" />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="flex flex-wrap items-center gap-2">
              <span className="type-h3 truncate">{profile.name || "Unnamed user"}</span>
              <span className={`type-small px-2 py-0.5 ${profile.isAdmin || subscription?.plan === "pro" ? "bg-primary text-background" : "text-black/60 ring-1 ring-inset ring-black/10"}`}>
                {profile.isAdmin ? "Admin" : subscription?.plan === "pro" ? "Pro" : "Free"}
              </span>
            </p>
            <span className="type-small truncate text-black/60">{profile.email || profile.id}</span>
          </div>
        </div>
        <DateRangeFilter label="Showing" value={dates} onChange={setDates} />
      </section>

      {/* their numbers */}
      <div className="flex gap-[calc(var(--cvw)*0.8)] max-lg:flex-wrap max-lg:gap-3">
        <Kpi label="Saved" value={stats.savedCount} detail="Effects saved" />
        <Kpi
          label="Installs"
          value={stats.installCount ?? 0}
          detail={`${stats.installsBySource?.web ?? 0} web · ${stats.installsBySource?.cli ?? 0} CLI · ${stats.installsBySource?.mcp ?? 0} MCP`}
        />
        <Kpi label="Templates" value={purchasedTemplates.length} detail="Owned: bought or redeemed" />
        {showBilling && (
          <Kpi
            label="Lifetime spend"
            value={money(usd, "USD")}
            detail={
              spend
                .filter((row) => row.currency !== "USD")
                .map((row) => `+ ${money(row.amount, row.currency)}${row.currency === "INR" ? " incl. GST" : ""}`)
                .join(" ") || "Every payment, whatever the dates above"
            }
          />
        )}
        <Kpi
          label="Last sign-in"
          value={profile.lastSignInAt ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(profile.lastSignInAt)) : "Never"}
          detail={session ? [session.browserName, session.deviceType, session.city, session.country].filter(Boolean).join(" · ") || "Active session" : "No active session"}
        />
      </div>

      {/* installs by day */}
      <section aria-labelledby="user-by-day-h" className={`${CARD} ${CARD_PAD} gap-[calc(var(--cvw)*1.6)] max-lg:gap-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="user-by-day-h" className="type-h3">
              Installs by day
            </h2>
            <p className="type-small text-black/60">Hover a bar for its numbers.</p>
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
        {days.length ? <UsageBars days={days} /> : <p className="type-body text-black/60">Nothing in this window.</p>}
      </section>

      {/* their effects: saved / installed, in a slider like the effects listing's Trending row */}
      <section aria-labelledby="user-effects-h" className={`${CARD} ${CARD_PAD} gap-(--cvw) max-lg:gap-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="user-effects-h" className="type-h3">
            Effects
          </h2>
          <div className="flex items-center gap-3">
            <SlidingSegment label="Effects" items={EFFECT_TABS} value={tab} onChange={setTab} itemClassName="w-24" />
            {!(rowEdges.start && rowEdges.end) && (
              <>
                <SliderArrowButton direction="prev" tone="light" ariaLabel="Previous effects" disabled={rowEdges.start} onClick={() => stepRow(-1)} />
                <SliderArrowButton direction="next" tone="light" ariaLabel="Next effects" disabled={rowEdges.end} onClick={() => stepRow(1)} />
              </>
            )}
          </div>
        </div>
        {effects.length === 0 ? (
          <p className="type-body text-black/60">None in this window.</p>
        ) : (
          <div
            ref={rowRef}
            {...rowHandlers}
            // data-cursor-drag: the site cursor shows its drag state over the row. overflow-y
            // set explicitly so Lenis doesn't treat the row as a vertical scroller.
            data-cursor-drag
            className="flex cursor-grab select-none gap-[calc(var(--cvw)*1.3)] overflow-x-hidden overflow-y-hidden scrollbar-none max-lg:gap-[2vw] max-lg:overflow-x-auto max-md:gap-[4vw]"
          >
            {effects.map((item) => {
              const effect = effectBySlug(item.slug) || { name: item.slug, title: item.slug, ...item };
              return (
                // Three to a row, gaps included; 45% on tablets, most of the width on phones
                <div key={item.slug} className="flex w-[calc((100%-var(--cvw)*2.6)/3)] shrink-0 flex-col gap-1 max-lg:w-[45%] max-md:w-[82%]">
                  <EffectCard effect={effect} small plain onOpen={(picked) => router.push(getEffectHref(picked))} sizes="(max-width: 767px) 82vw, (max-width: 1024px) 45vw, 25vw" />
                  <p className="type-small text-black/60">
                    {current.verb} {formatDate(item[current.date])}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* templates they own */}
      {purchasedTemplates.length > 0 && (
        // the same card and slider as Effects above
        <section aria-labelledby="user-templates-h" className={`${CARD} ${CARD_PAD} gap-(--cvw) max-lg:gap-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="user-templates-h" className="type-h3">
              Purchased templates
            </h2>
            {!(tplEdges.start && tplEdges.end) && (
              <div className="flex items-center gap-3">
                <SliderArrowButton direction="prev" tone="light" ariaLabel="Previous templates" disabled={tplEdges.start} onClick={() => stepTpl(-1)} />
                <SliderArrowButton direction="next" tone="light" ariaLabel="Next templates" disabled={tplEdges.end} onClick={() => stepTpl(1)} />
              </div>
            )}
          </div>
          {/* compact cards: laid out like the plain effect cards, no price, description or Buy */}
          <div
            ref={tplRef}
            {...tplHandlers}
            data-cursor-drag
            className="flex cursor-grab select-none gap-[calc(var(--cvw)*1.3)] overflow-x-hidden overflow-y-hidden scrollbar-none max-lg:gap-[2vw] max-lg:overflow-x-auto max-md:gap-[4vw]"
          >
            {purchasedTemplates.map((template) => (
              <div key={template.slug} className="flex w-[calc((100%-var(--cvw)*2.6)/3)] shrink-0 flex-col gap-1 max-lg:w-[45%] max-md:w-[82%]">
                <TemplateCard template={template} small compact />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* every payment in the window (super admins) */}
      {showBilling && (
        <section aria-labelledby="user-payments-h" className={`${CARD} ${CARD_PAD} gap-(--cvw) max-lg:gap-4`}>
        <h2 id="user-payments-h" className="type-h3">
          Payments
        </h2>
        {payments.length === 0 ? (
          <p className={EMPTY_TABLE}>No payments.</p>
        ) : (
          <PaymentsTable rows={payments} showPaymentId />
        )}
        </section>
      )}
    </div>
  );
}
