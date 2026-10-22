"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { useDashboard } from "@/components/Dashboard/DashboardContext";
import { CARD, CARD_PAD, DetailRows, EMPTY_TABLE, PaymentsTable, TextButton } from "@/components/Dashboard/DashboardUI";
import { Bar, ButtonBar, SkeletonCard, useAccountHint } from "@/components/Dashboard/DashboardSkeletons";
import { refreshDashboard, useDashboardData } from "@/components/Dashboard/useDashboardData";
import { Modal } from "@/components/ui/SignInRequiredModal";
import Button from "@/homepage/components/Button";
import { PLANS, formatPrice, getMonthlyEquivalent } from "@/lib/plans";
import { markScrollToPricingCards } from "@/lib/pricingScrollIntent";
import { useCurrency } from "@/lib/useCurrency";
import { getDashboardPreview, sampleInvoices } from "@/lib/dev/dashboardPreview";

const subscribeNever = () => () => {};

const INTERVAL_LABEL = { monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };

const formatDate = (value) => (value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "—");

// invoices.amount is in the smallest unit (paise / cents); template_purchases.amount in
// whole units (see api/admin/template-purchases)
function money(amount, currency, minorUnits = false) {
  if (typeof amount !== "number") return "—";
  const value = minorUnits ? amount / 100 : amount;
  const code = currency || "USD";
  try {
    return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", { style: "currency", currency: code, minimumFractionDigits: 2 }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
}

// The next plan up, with what it adds - Pro for free accounts, Pro+ for Pro
// A yearly price in the visitor's currency: "$79 a year · about $6.58/mo" (INR + GST)
function yearlyPrice(tier, currency) {
  const gst = currency === "INR" ? " + GST" : "";
  return `${formatPrice(PLANS[tier].prices.yearly[currency], currency)}${gst} a year · about ${formatPrice(getMonthlyEquivalent(tier, "yearly", currency), currency)}/mo`;
}

function nextPlan(plan, tier, currency) {
  if (plan !== "pro") {
    const pro = PLANS.pro;
    return {
      label: "Pro · Yearly",
      lead: "Go",
      accent: "Pro.",
      ticks: ["Every effect, free and Pro", `${pro.installsPerDay} effects a day across web, CLI and MCP`, `${pro.credits.yearly.amount} template credits a year`],
      price: yearlyPrice("pro", currency),
      cta: "Upgrade to Pro",
    };
  }
  if (tier === "pro_plus") return null;
  const plus = PLANS.pro_plus;
  return {
    label: "Pro+ · Yearly",
    lead: "Go",
    accent: "further.",
    ticks: [`${plus.installsPerDay} effects a day across web, CLI and MCP`, `${plus.credits.yearly.amount} template credits a year, full catalogue`, "Everything in Pro"],
    price: yearlyPrice("pro_plus", currency),
    cta: "Upgrade to Pro+",
  };
}

// Loading: the dark current-plan card (its detail rows on Pro), the next-plan card beside it
// (not on Pro+), then the receipts table
function InvoicingSkeleton() {
  const { isAdmin, plan, tier } = useAccountHint();
  const isPro = plan === "pro";
  // no next-plan card on Pro+, or for an admin without a paid plan
  const upsell = tier !== "pro_plus" && !(isAdmin && !isPro);
  return (
    <div aria-busy="true" aria-label="Loading your billing" className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
      <div className="flex gap-[calc(var(--cvw)*0.8)] max-lg:flex-col max-lg:gap-3">
        <SkeletonCard dark className={`justify-between gap-[calc(var(--cvw)*1.6)] max-lg:w-full max-lg:gap-6 ${upsell ? "w-[63%]" : "w-full"}`}>
          <div className="flex flex-col gap-2">
            <Bar type="type-label" className="w-28" />
            <Bar type="type-h2" className="w-[40%]" />
          </div>
          {isPro ? (
            <div className="flex flex-col">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between gap-4 border-t border-foreground/10 py-[calc(var(--cvw)*0.9)] first:border-t-0 max-lg:py-3">
                  <Bar type="type-small" className="w-24" />
                  <Bar type="type-body" className="w-[35%]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Bar type="type-body" className="w-full" />
              <Bar type="type-body" className="w-[55%]" />
            </div>
          )}
          {isPro && <ButtonBar className="w-52" />}
        </SkeletonCard>
        {upsell && (
          <SkeletonCard className="flex-1 gap-(--cvw) max-lg:gap-4">
            <Bar type="type-label" className="w-28" />
            <Bar type="type-h2" className="w-[60%]" />
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <Bar key={i} type="type-body" className="w-[85%]" />
              ))}
            </div>
            <Bar type="type-small" className="w-[70%]" />
            <ButtonBar className="mt-auto w-40" />
          </SkeletonCard>
        )}
      </div>
      <SkeletonCard className="gap-[calc(var(--cvw)*1.2)] max-lg:gap-4">
        <div className="flex justify-between gap-3">
          <Bar type="type-h3" className="w-28" />
          <Bar type="type-small" className="w-52" />
        </div>
        <div className="flex flex-col">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-black/10 py-[calc(var(--cvw)*0.8)] last:border-b-0 max-lg:py-3">
              <Bar type="type-small" className="w-[14%]" />
              <Bar type="type-body" className="w-[30%] flex-1" />
              <Bar type="type-body" className="w-[10%]" />
              <Bar type="type-small" className="w-[8%]" />
              <Bar type="type-small" className="w-10" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}

export default function InvoicingPage() {
  const { isAdmin, username } = useDashboard();
  const currency = useCurrency();
  // Cached across tabs: the skeleton shows on the first load only
  const { data, failed, retry, mutate } = useDashboardData(`invoices:${username}`, async () => {
    const preview = getDashboardPreview();
    if (preview) return sampleInvoices(preview);
    const res = await fetch("/api/dashboard/invoices", { cache: "no-store" });
    if (!res.ok) throw new Error(`invoices ${res.status}`);
    return res.json();
  });

  // Cancel subscription: asks first, then cancels at the end of the paid period
  // (api/user/cancel-subscription) - the plan stays until then
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  async function cancelSubscription() {
    setCancelling(true);
    setCancelError("");
    try {
      const preview = getDashboardPreview();
      if (!preview) {
        const res = await fetch("/api/user/cancel-subscription", { method: "POST" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Couldn’t cancel your subscription.");
      }
      mutate((current) => ({ ...current, cancelAtPeriodEnd: true }));
      // The overview's plan card follows too (the preview's sample data has no cancellation
      // to refetch, so it stays as set here)
      if (!preview) refreshDashboard();
      setCancelOpen(false);
    } catch (error) {
      setCancelError(error.message);
    } finally {
      setCancelling(false);
    }
  }

  if (failed) {
    return (
      <div className={`${CARD} ${CARD_PAD} items-start gap-4`}>
        <p className="type-h3">We couldn’t load your billing.</p>
        <p className="type-body text-black/60">Check your connection and try again.</p>
        <Button id="dashboard-invoicing-try-again" text="Try again" preventDefault onClick={retry} />
      </div>
    );
  }

  if (!data) return <InvoicingSkeleton />;

  const isPro = data.plan === "pro";
  const subscription = data.subscription;
  // Cancelled: already ended at Razorpay, or cancelled here and running to the period's end
  const cancelled = subscription?.status === "cancelled" || Boolean(data.cancelAtPeriodEnd);
  const interval = INTERVAL_LABEL[subscription?.billing_interval];
  // An admin with no paid plan of their own: full access that isn't billed - no upsell.
  // An admin who does pay sees their subscription like anyone else (and can cancel it).
  const adminAccess = (isAdmin || data.isAdmin) && !isPro;
  const planName = isPro ? (data.tier === "pro_plus" ? "Pro+" : "Pro") : adminAccess ? "Admin" : "Free";
  const upsell = adminAccess ? null : nextPlan(data.plan, data.tier, currency);

  // Subscription and template payments together, newest first
  const receipts = [
    ...data.invoices.map((invoice) => ({
      id: invoice.id,
      date: invoice.created_at,
      description: `${invoice.plan_label || "Vault Pro"}${INTERVAL_LABEL[invoice.billing_interval] ? ` · ${INTERVAL_LABEL[invoice.billing_interval]}` : ""}`,
      amount: money(invoice.amount, invoice.currency, true),
      status: invoice.status,
      url: invoice.invoice_url,
    })),
    // A template redeemed with a credit was never paid for: "1 credit", nothing to download
    ...data.templatePurchases.map((purchase) => ({
      id: purchase.id,
      date: purchase.createdAt,
      description: `Template · ${purchase.templateTitle}`,
      amount: purchase.redeemedWithCredit ? "1 credit" : money(purchase.amount, purchase.currency),
      status: purchase.redeemedWithCredit && purchase.status === "paid" ? "redeemed" : purchase.status,
      url: purchase.redeemedWithCredit ? null : purchase.invoiceUrl,
    })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const lastPayment = data.invoices?.[0];

  return (
    <div className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
      {/* current plan, and the next plan up */}
      <div className="flex gap-[calc(var(--cvw)*0.8)] max-lg:flex-col max-lg:gap-3">
        <section aria-labelledby="current-plan-h" className={`flex flex-col justify-between gap-[calc(var(--cvw)*1.6)] bg-ink text-foreground ${CARD_PAD} max-lg:w-full max-lg:gap-6 ${upsell ? "w-[63%]" : "w-full"}`}>
          <div className="flex flex-col gap-2">
            <p className="type-label text-foreground/80">Current plan</p>
            <h2 id="current-plan-h" className="type-h2">
              {planName}
              {isPro && interval && <span className="text-primary"> · {interval}</span>}
            </h2>
          </div>

          {isPro && (
            <DetailRows
              tone="dark"
              rows={[
                ["Status", <span key="s" className="capitalize">{cancelled ? "cancelled" : subscription?.status || "active"}</span>],
                [cancelled ? "Access until" : "Renews on", formatDate(subscription?.current_period_end)],
                ["Billing cycle", interval ? `${interval}, ${cancelled ? "doesn’t renew" : "renews automatically"}` : "—"],
                ["Last payment", lastPayment ? `${money(lastPayment.amount, lastPayment.currency, true)} on ${formatDate(lastPayment.created_at)}` : "—"],
                ["Payment", subscription?.razorpay_subscription_id ? "Managed by Razorpay" : "Access granted by the Vault team"],
              ]}
            />
          )}
          {adminAccess && <p className="type-body text-foreground/80">Admin accounts get every effect with no daily limit. Nothing is billed unless you subscribe.</p>}
          {!isPro && !adminAccess && (
            <p className="type-body text-foreground/80">
              Free accounts get the free effects{data.freeDailyLimit ? ` and ${data.freeDailyLimit} a day` : ""}. Upgrade for every effect and template credits.
            </p>
          )}

          {/* free accounts upgrade from the Pro card beside this one */}
          {/* manage at Razorpay, and cancel (only a paid subscription that's still renewing) */}
          {isPro && (subscription?.razorpay_short_url || (subscription?.razorpay_subscription_id && !cancelled)) && (
            <div className="flex flex-wrap items-center gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
              {subscription?.razorpay_short_url && <Button id="dashboard-invoicing-manage-subscription" text="Manage Subscription" href={subscription.razorpay_short_url} target_blank className="w-fit" />}
              {subscription?.razorpay_subscription_id && !cancelled && <Button id="dashboard-invoicing-cancel-subscription" text="Cancel Subscription" variant="outline" preventDefault onClick={() => setCancelOpen(true)} className="w-fit" />}
            </div>
          )}
          {isPro && cancelled && (
            <p className="type-small text-foreground/80">
              Cancelled. You keep {planName} until {formatDate(subscription?.current_period_end)}, then your account moves to Free.
            </p>
          )}

          {mounted &&
            createPortal(
              <Modal open={cancelOpen} onClose={() => !cancelling && setCancelOpen(false)} title="Cancel your subscription?">
                {`You keep ${planName} until ${formatDate(subscription?.current_period_end)}. After that your account moves to Free and you won’t be charged again. The rest of this period isn’t refunded.`}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex flex-wrap items-center justify-center gap-[calc(var(--cvw)*1.2)] max-lg:gap-4">
                    <Button id="dashboard-invoicing-cancel-subscription-confirm" text={cancelling ? "Cancelling…" : "Cancel Subscription"} preventDefault disabled={cancelling} onClick={cancelSubscription} />
                    <TextButton id="dashboard-invoicing-keep-it" disabled={cancelling} onClick={() => setCancelOpen(false)}>
                      Keep It
                    </TextButton>
                  </div>
                  {cancelError && (
                    <p role="alert" className="type-small text-primary">
                      {cancelError}
                    </p>
                  )}
                </div>
              </Modal>,
              document.body,
            )}
        </section>

        {upsell && (
          <section aria-labelledby="upsell-h" className={`${CARD} ${CARD_PAD} flex-1 gap-(--cvw) max-lg:gap-4`}>
            <p className="type-label text-black/60">{upsell.label}</p>
            <h2 id="upsell-h" className="type-h2">
              {upsell.lead} <span className="gradient-text-animate">{upsell.accent}</span>
            </h2>
            <ul className="flex flex-col gap-2">
              {upsell.ticks.map((tick) => (
                <li key={tick} className="type-body flex items-start gap-2">
                  <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {tick}
                </li>
              ))}
            </ul>
            <p className="type-small text-black/60">{upsell.price}</p>
            <div className="mt-auto">
              <Button id="dashboard-invoicing-upgrade" text={upsell.cta} href="/pricing#plans" onClick={markScrollToPricingCards} className="w-fit" />
            </div>
          </section>
        )}
      </div>

      {/* every payment */}
      <section aria-labelledby="receipts-h" className={`${CARD} ${CARD_PAD} gap-[calc(var(--cvw)*1.2)] max-lg:gap-4`}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="receipts-h" className="type-h3">
            Receipts
          </h2>
          <p className="type-small text-black/60">Subscription and template payments</p>
        </div>
        {receipts.length === 0 ? (
          <p className={EMPTY_TABLE}>No payments yet. Your receipts show up here once a payment goes through.</p>
        ) : (
          <PaymentsTable rows={receipts} />
        )}
      </section>
    </div>
  );
}
