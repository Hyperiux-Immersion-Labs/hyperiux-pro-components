"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDashboard } from "@/components/Dashboard/DashboardContext";
import { ADMIN_PER_PAGE, ADMIN_PER_PAGE_OPTIONS, ALL_DATES, CARD, CARD_PAD, DateRangeFilter, EMPTY_TABLE, FILTER_WIDTH, Pager, PerPageMenu, SCROLL_PANEL, SearchField, TOOLBAR } from "@/components/Dashboard/DashboardUI";
import { Bar, SkeletonCard } from "@/components/Dashboard/DashboardSkeletons";
import { FilterMenu } from "@/app/(app)/(workspace)/effects/FilterMenu";
import {
  AuditList,
  WebhookEventList,
} from "@/components/admin/ManageUserBilling";
import { SlidingSegment } from "@/components/ui/SlidingSegment";
import {
  getDashboardPreview,
  sampleAdminAudit,
  sampleWebhookEvents,
} from "@/lib/dev/dashboardPreview";

// Two logs, newest first. Needs log.view; Razorpay events also need finance.view.
//   Admin changes - every change made from the admin dashboard (plan grants, roles,
//     suspensions, internal flags, revenue exclusions, cancellations, refunds, Razorpay
//     syncs, invites), who made it and when (lib/admin-audit)
//   Razorpay events - every webhook delivery and what we did with it: applied, skipped and
//     why, ignored, failed with the error, or rejected (lib/webhook-log)
const LOGS = [
  { id: "changes", label: "Admin changes" },
  { id: "razorpay", label: "Razorpay events" },
];
const OUTCOMES = {
  all: "All outcomes",
  failed: "Failed",
  rejected: "Rejected",
  skipped: "Skipped",
  applied: "Applied",
  ignored: "Ignored",
};
const ACTIONS = {
  all: "All changes",
  "payment.refund": "Refunds",
  "subscription.cancel_now": "Cancelled now",
  "subscription.cancel_at_period_end": "Cancelled at period end",
  "subscription.sync": "Razorpay syncs",
  "plan.update": "Plan changes",
  "access.update": "Admin access",
  "role.create": "Roles created",
  "role.edit": "Roles edited",
  "role.delete": "Roles deleted",
  "role.update": "Role changes (before roles)",
  "internal.mark": "Marked internal",
  "internal.unmark": "Counted as customer",
  "payment.exclude": "Excluded from revenue",
  "payment.include": "Counted in revenue",
  "account.suspend": "Suspensions",
  "account.delete": "Deletions",
  "account.restore": "Restores",
  "password.reset_sent": "Password resets",
  "user.create": "Accounts created",
  "waitlist.invite": "Waitlist invites",
  "credits.adjust": "Credit changes",
  "template.give": "Templates given",
  "installs.bonus": "Extra installs",
  "note.add": "Notes",
  "settings.update": "Settings",
  "effect.refresh": "Page refreshes",
};

export default function AdminLogPage() {
  const { path, can, accessLoaded } = useDashboard();
  // Needs log.view (lib/admin-permissions); the API checks it again
  const allowed = can("log.view");
  const seesFinance = can("finance.view");
  const router = useRouter();
  const [log, setLog] = useState("changes");
  const [action, setAction] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [dates, setDates] = useState(ALL_DATES);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(ADMIN_PER_PAGE);
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  // Admin changes by one admin: part of their email, searched after a short pause
  const [actorInput, setActorInput] = useState("");
  const [actor, setActor] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setActor(actorInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [actorInput]);

  // Without the permission: back to Users rather than an empty page
  useEffect(() => {
    if (accessLoaded && !allowed) router.replace(path("admin/users"));
  }, [accessLoaded, allowed, router, path]);

  useEffect(() => {
    if (!allowed) return undefined;
    let active = true;
    if (getDashboardPreview()) {
      requestAnimationFrame(
        () =>
          active &&
          setData(
            log === "changes" ? sampleAdminAudit() : sampleWebhookEvents(),
          ),
      );
      return () => {
        active = false;
      };
    }
    const params = new URLSearchParams({
      limit: String(perPage),
      offset: String(page * perPage),
    });
    // The window, as the admin Activity page sends it: a preset, or a custom from / to
    // (one day while only a start is picked)
    if (dates.preset === "custom") {
      if (dates.from) {
        params.set("from", dates.from);
        params.set("to", dates.to || dates.from);
      }
    } else if (dates.preset !== "all") {
      params.set("range", dates.preset);
    }
    if (log === "changes" && action !== "all") params.set("action", action);
    if (log === "changes" && actor) params.set("actor", actor);
    if (log === "razorpay" && outcome !== "all") params.set("outcome", outcome);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(null);
    fetch(
      `/api/admin/${log === "changes" ? "audit" : "webhook-events"}?${params}`,
      { cache: "no-store" },
    )
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`audit ${res.status}`)),
      )
      .then((json) => active && setData(json))
      .catch((error) => {
        console.error(error);
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [allowed, log, action, actor, outcome, dates, page, perPage]);

  if (failed) {
    return (
      <div className={`${CARD} ${CARD_PAD} items-start gap-4`}>
        <p className="type-h3">We couldn’t load the log.</p>
        <p className="type-body text-black/60">
          Check your connection and reload the page.
        </p>
      </div>
    );
  }

  // The list for the log on screen - right after switching logs, `data` still holds the
  // other log's response until the effect clears it, so that counts as loading
  const items = log === "changes" ? data?.entries : data?.events;
  const pages = Math.max(1, Math.ceil((data?.total || 0) / perPage));
  // Any filter change starts again from the first page
  const filter = (set) => (value) => {
    set(value);
    setPage(0);
  };

  return (
    <section
      aria-labelledby="log-h"
      className={`${CARD} ${CARD_PAD} gap-[calc(var(--cvw)*1.2)] max-lg:gap-4`}
    >
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 id="log-h" className="type-h3">
            {log === "changes" ? "Admin Changes" : "Razorpay Events"}
          </h2>
          <p className="type-small text-black/60">
            {log === "changes"
              ? "Newest first. Search by admin, or filter by change and date."
              : "Every webhook delivery from Razorpay and what we did with it."}
          </p>
        </div>
        <div className={TOOLBAR}>
          {log === "changes" && (
            <SearchField
              value={actorInput}
              onChange={(next) => {
                setActorInput(next);
                setPage(0);
              }}
              placeholder="By admin (email)"
              label="Changes by admin"
            />
          )}
          {log === "changes" ? (
            <FilterMenu
              tone="light"
              variant="label"
              alignRight
              label="Change"
              widthClassName={FILTER_WIDTH}
              panelClassName={SCROLL_PANEL}
              options={Object.keys(ACTIONS)}
              categoryFilter={action}
              activeFilter={action === "all" ? null : action}
              getLabel={(id) => ACTIONS[id]}
              onSelect={(next) => {
                setAction(next);
                setPage(0);
              }}
            />
          ) : (
            <FilterMenu
              tone="light"
              variant="label"
              alignRight
              label="Outcome"
              widthClassName={FILTER_WIDTH}
              panelClassName={SCROLL_PANEL}
              options={Object.keys(OUTCOMES)}
              categoryFilter={outcome}
              activeFilter={outcome === "all" ? null : outcome}
              getLabel={(id) => OUTCOMES[id]}
              onSelect={(next) => {
                setOutcome(next);
                setPage(0);
              }}
            />
          )}
          {/* Razorpay events name payments: only with finance.view (the API checks it too) */}
          {seesFinance && (
            <SlidingSegment
              label="Log"
              items={LOGS}
              value={log}
              onChange={(next) => {
                setLog(next);
                setPage(0);
              }}
              itemClassName="w-36"
            />
          )}
          <DateRangeFilter label={log === "changes" ? "Changed" : "Received"} value={dates} onChange={filter(setDates)} />
          <PerPageMenu value={perPage} onChange={filter(setPerPage)} options={ADMIN_PER_PAGE_OPTIONS} />
        </div>
      </div>

      {!items ? (
        <SkeletonCard className="gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Bar key={i} type="type-body" className="w-full" />
          ))}
        </SkeletonCard>
      ) : items.length === 0 ? (
        <p className={EMPTY_TABLE}>
          {dates.preset !== "all" || (log === "changes" ? action !== "all" : outcome !== "all")
            ? "Nothing matches these filters."
            : log === "changes"
              ? "No changes yet."
              : "No Razorpay events yet."}
        </p>
      ) : log === "changes" ? (
        <AuditList entries={items} showTarget tone="light" />
      ) : (
        <WebhookEventList events={items} showUser tone="light" />
      )}

      <Pager
        page={Math.min(page, pages - 1)}
        pages={pages}
        total={data?.total || 0}
        noun={
          log === "changes"
            ? (data?.total || 0) === 1
              ? "change"
              : "changes"
            : (data?.total || 0) === 1
              ? "event"
              : "events"
        }
        onPage={setPage}
      />
    </section>
  );
}
