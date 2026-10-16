"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowUpRight, LoaderCircle, RefreshCw } from "lucide-react";
import { DetailRows } from "@/components/Dashboard/DashboardUI";
import { Confirm, LINE_BUTTON, PANEL_CARD, formatDate, timeAgo } from "@/components/admin/drawerUI";
import { getDashboardPreview, sampleAdminAudit, sampleAdminBilling, sampleWebhookEvents } from "@/lib/dev/dashboardPreview";

// The Manage drawer's Billing and History sections (super admins): the account's
// subscription as Razorpay holds it, what disagrees with ours, Sync with Razorpay,
// cancelling, refunds - and the admin audit log for this account.

const STATUS = {
  created: "Created",
  authenticated: "Authorised",
  active: "Active",
  pending: "Payment pending",
  halted: "Halted (payments failed)",
  paused: "Paused",
  cancelled: "Cancelled",
  completed: "Completed",
  expired: "Expired",
};
const LIVE = new Set(["created", "authenticated", "active", "pending", "halted", "paused"]);

// Paise / cents, as money
function money(minor, currency) {
  if (typeof minor !== "number") return "—";
  const code = currency || "INR";
  try {
    return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", { style: "currency", currency: code, maximumFractionDigits: 2 }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${code}`;
  }
}

const LINK = "type-small inline-flex items-center gap-1 text-foreground/80 underline underline-offset-3 transition-colors duration-300 hover:text-primary [&_svg]:size-3.5";
const TEXT_BUTTON = "type-small cursor-pointer text-foreground underline underline-offset-3 transition-colors duration-300 hover:text-primary disabled:cursor-default disabled:opacity-50";

/**
 * `post(url, body)` posts as the drawer does (throws the API's error); `onSaved(patch)`
 * updates the user's row; `onChanged()` tells History something was logged.
 */
export function BillingSection({ user, post, onSaved, onChanged, onBusyChange }) {
  const userId = user.id;
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  // Which reload `data` came from: after a change, actions wait for fresh figures
  const [loadedFor, setLoadedFor] = useState(-1);
  // null | "cancel_period_end" | "cancel_now" | { refund: paymentId }
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [refundInput, setRefundInput] = useState("");

  useEffect(() => {
    let active = true;
    if (getDashboardPreview()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(sampleAdminBilling(userId));
      setLoadedFor(reload);
      return undefined;
    }
    fetch(`/api/admin/users/billing?clerkUserId=${encodeURIComponent(userId)}`, { cache: "no-store" })
      .then((res) => res.json().then((json) => (res.ok ? json : Promise.reject(new Error(json.error || "Couldn't load billing.")))))
      .then((json) => {
        if (!active) return;
        setData(json);
        setLoadedFor(reload);
        setLoadError("");
      })
      .catch((err) => active && setLoadError(err.message));
    return () => {
      active = false;
    };
  }, [userId, reload]);

  // The drawer stays open while a change is in flight
  useEffect(() => {
    onBusyChange?.(busy !== null);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  // No new action until nothing is saving and the figures are fresh
  const locked = busy !== null || loadedFor !== reload;

  // After a change: reload, and keep the Users row's plan in step
  async function run(kind, work) {
    setBusy(kind);
    setError("");
    setNotice(null);
    try {
      const result = await work();
      setPending(null);
      setNotice(result);
      setReload((n) => n + 1);
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  // The plan as Billing now shows it, for the Users row - once per load, so a change made
  // in Plan & access since (which Billing hasn't reloaded for) isn't put back
  const syncedData = useRef(null);
  useEffect(() => {
    if (!data?.account || syncedData.current === data) return;
    syncedData.current = data;
    const plan = data.account.plan === "free" ? "free" : "pro";
    if (plan !== user.plan) onSaved?.({ plan, tier: plan === "pro" ? data.account.plan : null });
  }, [data, user.plan, onSaved]);

  if (loadError) {
    return (
      <section aria-labelledby="manage-billing-h" className={`${PANEL_CARD} gap-(--cvw) max-lg:gap-4`}>
        <h3 id="manage-billing-h" className="type-h3">
          Billing
        </h3>
        <p className="type-small text-danger">{loadError}</p>
      </section>
    );
  }

  const sub = data?.razorpay;
  const subLive = sub && LIVE.has(sub.status);
  const refundTarget = pending?.refund ? data?.payments.find((p) => p.paymentId === pending.refund) : null;
  const refundMinor = refundTarget ? Math.round(parseFloat(refundInput || "0") * 100) : 0;
  const refundValid = refundTarget && Number.isFinite(refundMinor) && refundMinor > 0 && refundMinor <= refundTarget.refundable;
  const refundIsFull = refundTarget && refundMinor === refundTarget.refundable;

  return (
    <section aria-labelledby="manage-billing-h" className={`${PANEL_CARD} gap-(--cvw) max-lg:gap-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="manage-billing-h" className="type-h3">
          Billing
        </h3>
        <button
          type="button"
          disabled={!data || locked}
          onClick={() =>
            run("sync", async () => {
              const json = await post("/api/admin/users/sync-subscription", { clerkUserId: user.id });
              return json.changes.length ? { lines: json.changes } : { lines: [json.note || "Already matches Razorpay. Nothing changed."] };
            })
          }
          className={LINE_BUTTON}
        >
          {busy === "sync" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
          Sync with Razorpay
        </button>
      </div>

      {error && (
        <p role="alert" className="type-small bg-danger/15 px-4 py-3 text-danger">
          {error}
        </p>
      )}
      {notice && (
        <ul role="status" className="type-small flex flex-col gap-1 bg-primary/15 px-4 py-3 text-foreground">
          {notice.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}

      {!data ? (
        <p className="type-small text-foreground/80">Loading from Razorpay…</p>
      ) : (
        <>
          {/* Razorpay and us disagree */}
          {data.drift.length > 0 && (
            <div className="flex flex-col gap-1.5 bg-danger/10 px-4 py-3 ring-1 ring-inset ring-danger/30">
              {data.drift.map((line) => (
                <p key={line} className="type-small text-danger">
                  {line}
                </p>
              ))}
              <p className="type-small text-foreground/80">Sync with Razorpay fixes these.</p>
            </div>
          )}

          {data.razorpayError && <p className="type-small text-danger">Razorpay didn’t answer: {data.razorpayError}</p>}

          {sub ? (
            <DetailRows
              tone="dark"
              rows={[
                [
                  "At Razorpay",
                  <a key="sub" href={sub.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                    {STATUS[sub.status] || sub.status}
                    <ArrowUpRight aria-hidden="true" />
                  </a>,
                ],
                ["Current period ends", formatDate(sub.currentEnd)],
                ["Next charge", data.cancelScheduled ? "None - cancelled at period end" : sub.chargeAt ? formatDate(sub.chargeAt) : "None"],
                ["Paid charges", sub.paidCount ?? "—"],
              ]}
            />
          ) : (
            <p className="type-small text-foreground/80">
              {data.account?.granted ? "Pro was given from the dashboard - there’s no Razorpay subscription behind it." : "No Razorpay subscription on this account."}
            </p>
          )}

          {/* cancel */}
          {subLive &&
            !data.cancelScheduled &&
            (pending === "cancel_period_end" || pending === "cancel_now" ? (
              <Confirm
                lines={
                  pending === "cancel_now"
                    ? [
                        { text: "Razorpay cancels the subscription now, and Pro access stops straight away.", danger: true },
                        { text: "Nothing is refunded - refund a payment below for that." },
                      ]
                    : [{ text: `Pro stays until ${formatDate(sub.currentEnd)}, then ends. Nothing more is charged.` }]
                }
                busy={busy === "cancel"}
                onCancel={() => setPending(null)}
                onConfirm={() =>
                  run("cancel", async () => {
                    const json = await post("/api/admin/users/cancel-subscription", { clerkUserId: user.id, when: pending === "cancel_now" ? "now" : "period_end" });
                    return { lines: [json.when === "now" ? "Cancelled. The account is on Free now." : `Cancelled at period end. Pro until ${formatDate(json.accessUntil)}.`] };
                  })
                }
              />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" disabled={locked} onClick={() => setPending("cancel_period_end")} className={LINE_BUTTON}>
                  Cancel at period end
                </button>
                <button type="button" disabled={locked} onClick={() => setPending("cancel_now")} className={`${LINE_BUTTON} text-danger hover:text-danger hover:ring-danger`}>
                  Cancel now
                </button>
              </div>
            ))}

          {/* payments */}
          <div className="flex flex-col">
            <p className="type-label pb-2 text-foreground/80">Payments</p>
            {data.payments.length === 0 ? (
              <p className="type-small text-foreground/80">No payments.</p>
            ) : (
              <ul className="flex flex-col">
                {data.payments.map((payment) => (
                  <li key={`${payment.kind}-${payment.id}`} className="flex flex-col gap-3 border-t border-foreground/10 py-3 first:border-t-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="flex min-w-0 flex-col">
                        <span className="type-body truncate">{payment.label}</span>
                        <span className="type-small text-foreground/60">
                          {formatDate(payment.createdAt)} ·{" "}
                          <a href={payment.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-3 hover:text-primary">
                            {payment.paymentId}
                          </a>
                        </span>
                      </span>
                      <span className="flex flex-col items-end">
                        <span className={`type-body font-aeonik ${payment.status === "refunded" ? "text-foreground/50 line-through" : ""}`}>{money(payment.amount, payment.currency)}</span>
                        {payment.status === "refunded" ? (
                          <span className="type-small text-danger">Refunded</span>
                        ) : payment.refunded > 0 ? (
                          <span className="type-small text-danger">{money(payment.refunded, payment.currency)} refunded</span>
                        ) : null}
                        {payment.excluded && <span className="type-small text-foreground/60">Excluded from revenue</span>}
                      </span>
                    </div>

                    {pending?.refund === payment.paymentId ? (
                      <div className="flex flex-col gap-3">
                        <label className="type-small flex flex-wrap items-center gap-3 text-foreground/80">
                          Amount ({payment.currency})
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0.01"
                            step="0.01"
                            max={(payment.refundable / 100).toFixed(2)}
                            value={refundInput}
                            onChange={(event) => setRefundInput(event.target.value)}
                            className="type-body w-36 bg-foreground/5 px-3 py-2 text-foreground ring-1 ring-inset ring-foreground/20 outline-none focus:ring-primary"
                          />
                          <span>of {money(payment.refundable, payment.currency)} left</span>
                        </label>
                        <Confirm
                          lines={[
                            {
                              text: refundValid ? `Send ${money(refundMinor, payment.currency)} back to the customer through Razorpay. This can’t be undone.` : "Enter an amount up to what’s left.",
                              danger: true,
                            },
                            refundIsFull
                              ? payment.kind === "subscription"
                                ? { text: "A full refund: their plan ends now and the subscription is cancelled." }
                                : { text: "A full refund: the template purchase is marked refunded and its download stops." }
                              : { text: "A partial refund: their access doesn’t change." },
                          ]}
                          busy={busy === "refund"}
                          onCancel={() => setPending(null)}
                          onConfirm={() => {
                            if (!refundValid) return;
                            run("refund", async () => {
                              const json = await post("/api/admin/payments/refund", { paymentId: payment.paymentId, amount: refundMinor });
                              return { lines: [`Refunded ${money(json.refunded, json.currency)}.`, ...(json.followUpError ? [json.followUpError] : [])] };
                            });
                          }}
                        />
                      </div>
                    ) : (
                      payment.refundable > 0 &&
                      payment.status !== "refunded" && (
                        <button
                          type="button"
                          disabled={locked}
                          onClick={() => {
                            setPending({ refund: payment.paymentId });
                            setRefundInput((payment.refundable / 100).toFixed(2));
                          }}
                          className={`${TEXT_BUTTON} w-fit`}
                        >
                          Refund
                        </button>
                      )
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <AccountWebhookEvents userId={userId} reloadKey={reload} />
        </>
      )}
    </section>
  );
}

// One line of detail for a log entry
function detailOf(entry) {
  const d = entry.details || {};
  switch (entry.action) {
    case "payment.refund":
      return `${money(d.amount, d.currency)}${d.full ? " (full)" : ""} · ${d.paymentId}`;
    case "payment.exclude":
    case "payment.include":
      return d.paymentId || null;
    case "plan.update":
      return d.plan === "free" ? "Free" : `${d.tier === "pro_plus" ? "Pro+" : "Pro"}${d.currentPeriodEnd ? ` until ${formatDate(d.currentPeriodEnd)}` : ""}`;
    case "role.update":
      return d.role === "super_admin" ? "Super Admin" : d.role === "admin" ? "Admin" : "No access";
    case "subscription.sync":
      return (d.changes || []).join(" ");
    case "subscription.cancel_at_period_end":
      return d.accessUntil ? `Pro until ${formatDate(d.accessUntil)}` : null;
    case "waitlist.invite":
      return d.sent ? `${d.sent.length} sent` : null;
    case "credits.adjust":
      return `${d.delta > 0 ? "+" : ""}${d.delta} · ${d.reason || ""}`;
    case "template.give":
      return `${d.templateSlug}${d.reason ? ` · ${d.reason}` : ""}`;
    case "installs.bonus":
      return d.extra ? `+${d.extra} for ${d.date}` : "Removed";
    case "note.add":
      return d.body || null;
    case "effect.refresh":
      return d.path || null;
    case "settings.update":
      return `${d.key}: ${Array.isArray(d.value) ? d.value.join(", ") || "none" : String(d.value)}`;
    default:
      return null;
  }
}

export function AuditList({ entries, showTarget = false, tone = "dark" }) {
  const muted = tone === "dark" ? "text-foreground/60" : "text-black/60";
  const line = tone === "dark" ? "border-foreground/10" : "border-black/10";
  return (
    <ul className="flex flex-col">
      {entries.map((entry) => {
        const detail = detailOf(entry);
        return (
          <li key={entry.id} className={`flex flex-col gap-0.5 border-t py-2.5 first:border-t-0 ${line}`}>
            <span className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="type-body">
                {entry.label}
                {showTarget && entry.targetId && <span className={muted}> · {entry.targetName || entry.targetEmail || entry.targetId}</span>}
              </span>
              <span className={`type-small shrink-0 ${muted}`} title={new Date(entry.at).toLocaleString()}>
                {timeAgo(entry.at)}
              </span>
            </span>
            {detail && <span className={`type-small ${muted}`}>{detail}</span>}
            <span className={`type-small ${muted}`}>by {entry.actorEmail || "an admin"}</span>
          </li>
        );
      })}
    </ul>
  );
}

// This account's entries in the admin audit log; `reloadKey` changes after a change here
export function HistorySection({ userId, reloadKey }) {
  const [entries, setEntries] = useState(null);
  useEffect(() => {
    let active = true;
    if (getDashboardPreview()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries(sampleAdminAudit().entries.slice(0, 4));
      return undefined;
    }
    fetch(`/api/admin/audit?userId=${encodeURIComponent(userId)}&limit=8`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((json) => active && setEntries(json.entries || []))
      .catch(() => active && setEntries([]));
    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  return (
    <section aria-labelledby="manage-history-h" className={`${PANEL_CARD} gap-(--cvw) max-lg:gap-4`}>
      <h3 id="manage-history-h" className="type-h3">
        History
      </h3>
      {entries === null ? (
        <p className="type-small text-foreground/80">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="type-small text-foreground/80">No admin changes to this account yet.</p>
      ) : (
        <AuditList entries={entries} />
      )}
    </section>
  );
}

// A Razorpay webhook delivery's outcome, as a word in its colour
const OUTCOME_TONE = {
  applied: ["Applied", "text-success-strong"],
  skipped: ["Skipped", "text-primary"],
  ignored: ["Ignored", null],
  failed: ["Failed", "text-danger-strong"],
  rejected: ["Rejected", "text-danger-strong"],
};

// Razorpay webhook deliveries (lib/webhook-log), newest first
export function WebhookEventList({ events, showUser = false, tone = "dark" }) {
  const muted = tone === "dark" ? "text-foreground/60" : "text-black/60";
  const line = tone === "dark" ? "border-foreground/10" : "border-black/10";
  return (
    <ul className="flex flex-col">
      {events.map((event) => {
        const [label, color] = OUTCOME_TONE[event.outcome] || [event.outcome, null];
        return (
          <li key={event.id} className={`flex flex-col gap-0.5 border-t py-2.5 first:border-t-0 ${line}`}>
            <span className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="type-body">
                <span className="font-mono text-[0.92em]">{event.event || "—"}</span>
                <span className={`type-small ml-2 ${color || muted}`}>{label}</span>
                {showUser && event.userId && <span className={`type-small ${muted}`}> · {event.userName || event.userEmail || event.userId}</span>}
              </span>
              <span className={`type-small shrink-0 ${muted}`} title={new Date(event.at).toLocaleString()}>
                {timeAgo(event.at)}
              </span>
            </span>
            {event.detail && <span className={`type-small ${muted}`}>{event.detail}</span>}
            {(event.paymentId || event.subscriptionId) && (
              <span className={`type-small font-mono ${muted}`}>
                {[event.paymentId, event.subscriptionId, typeof event.amount === "number" && event.currency ? money(event.amount, event.currency) : null].filter(Boolean).join(" · ")}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// This account's latest Razorpay webhook deliveries, inside Billing
function AccountWebhookEvents({ userId, reloadKey }) {
  const [events, setEvents] = useState(null);
  useEffect(() => {
    let active = true;
    if (getDashboardPreview()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEvents(sampleWebhookEvents().events.slice(0, 3));
      return undefined;
    }
    fetch(`/api/admin/webhook-events?userId=${encodeURIComponent(userId)}&limit=5`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { events: [] }))
      .then((json) => active && setEvents(json.events || []))
      .catch(() => active && setEvents([]));
    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  return (
    <div className="flex flex-col">
      <p className="type-label pb-2 text-foreground/80">Razorpay events</p>
      {events === null ? (
        <p className="type-small text-foreground/80">Loading…</p>
      ) : events.length === 0 ? (
        <p className="type-small text-foreground/80">None received for this account yet.</p>
      ) : (
        <WebhookEventList events={events} />
      )}
    </div>
  );
}

