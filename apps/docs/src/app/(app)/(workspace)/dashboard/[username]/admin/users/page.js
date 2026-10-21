"use client";

import { nameFromEmail } from "@/lib/display-name";
import { useDashboard } from "@/components/Dashboard/DashboardContext";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import { X, Upload, CheckCircle2, XCircle, UserCog, Download, UserPlus, UserRoundKey, LoaderCircle, Trash2 } from "lucide-react";
import { ToastViewport, useToastQueue } from "@/components/ui/Toast";
import { DeleteAccountsModal } from "@/components/admin/DeleteAccountsModal";
import { Checkbox } from "@/components/ui/Checkbox";
import { getDashboardPreview, sampleAdminUsers } from "@/lib/dev/dashboardPreview";
import Button, { BUTTON_SIZE } from "@/homepage/components/Button";
import { AUDIENCE_PAIR, AdminAudienceFilter, PAIR_WIDTH, useAdminAudience } from "@/components/admin/AdminAudience";
import { ACTION_LINE, ADMIN_PER_PAGE, ADMIN_PER_PAGE_OPTIONS, ALL_DATES, CARD, CARD_PAD, DATE_PRESETS, DateRangeFilter, EMPTY_CELL, FILTER_WIDTH, HEAD_ROW, NUM, Pager, PerPageMenu, ROW, SCROLL_PANEL, SearchField, STICKY_END, STICKY_START, TABLE, TableScroll, TD, TH, TOOLBAR } from "@/components/Dashboard/DashboardUI";
import { STAT_EACH, StatCard, StatCardSkeleton } from "@/components/Dashboard/TrendStat";
import { Tooltip } from "@/components/ui/Tooltip";
import { ManageUserDrawer } from "@/components/admin/ManageUserDrawer";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { FilterMenu } from "@/app/(app)/(workspace)/effects/FilterMenu";
import { buildUserActivityPath } from "@/lib/user-slug";
import { useLenisLock } from "@/hooks/useLenisLock";

const DEFAULT_PAGE_SIZE = ADMIN_PER_PAGE;


// An icon-only action beside the date filter, as tall as it
const ICON_BUTTON = "grid size-9.5 cursor-pointer place-items-center bg-foreground text-black/60 ring-1 ring-inset ring-black/10 transition-[color,box-shadow] duration-300 hover:text-primary hover:ring-primary [&_svg]:size-4";

// The plan each account has now (an expired plan is Free)
const PLAN_FILTERS = { all: "All plans", pro_plus: "Pro+", pro: "Pro", free: "Free" };
const ROLE_FILTERS = { all: "All roles", user: "Not an admin", admin: "Any admin", super_admin: "Super admin" };
const SORTS = { newest: "Newest", installs: "Most installs", web: "Most web", cli: "Most CLI", mcp: "Most MCP", saves: "Most saves" };

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

// Clerk's Name field is optional by default, so some existing accounts have
// none - falls back to the email's local part rather than a bare "-", which
// reads as broken data rather than "this person just never set a name".
// The real fix is requiring a name at sign-up (Clerk Dashboard -> User &
// Authentication -> Personal Information -> Name -> Required), which only
// affects future sign-ups; this fallback covers accounts that predate that.
function displayName(user) {
  if (user.name) return user.name;
  if (user.email) return nameFromEmail(user.email) || user.email;
  return "Unnamed user";
}

function PlanBadge({ plan, tier }) {
  return (
    <span className={`type-small inline-flex w-fit items-center px-2.5 py-0.5 ${plan === "pro" ? "bg-primary text-background" : "text-black/60 ring-1 ring-inset ring-black/10"}`}>
      {plan === "pro" ? (tier === "pro" ? "Pro" : "Pro+") : "Free"}
    </span>
  );
}

// Stat cards for the picked window and accounts (signups, of those on a paid plan now,
// installs, saves), each with its change against the previous period and its line - not
// the table's own filters, so switching pages / filters never changes what they mean.
// `dates` is the page's date filter ({ preset, from, to }), `audience` whose accounts.
function UserStatsTiles({ dates, audience }) {
  const [data, setData] = useState(null);
  const isCustom = dates.preset === "custom";

  useEffect(() => {
    // A custom range with nothing picked yet has nothing to fetch for
    if (isCustom && !dates.from && !dates.to) return;

    let active = true;
    if (getDashboardPreview()) {
      requestAnimationFrame(() => active && setData(sampleAdminUsers().stats));
      return () => {
        active = false;
      };
    }
    // Clears the previous window's numbers immediately so a range switch never
    // flashes stale data while the new fetch is in flight.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(null);

    const params = new URLSearchParams({ range: dates.preset, audience });
    if (isCustom && dates.from) params.set("from", dates.from);
    if (isCustom && dates.to) params.set("to", dates.to);

    fetch(`/api/admin/users/stats?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => active && setData(json))
      .catch(() => active && setData(null));

    return () => {
      active = false;
    };
  }, [dates.preset, isCustom, dates.from, dates.to, audience]);

  // Only "All time" is a headcount ("Total") - every other window is a "New" count
  const isAllTime = dates.preset === "all";
  const cards = data?.kpis
    ? [
        [isAllTime ? "Total users" : "New users", data.kpis.users, isAllTime ? "Accounts" : "Joined in this window"],
        // The plan today, for both windows: older signups have had longer to upgrade
        [isAllTime ? "Paid users" : "New paid users", data.kpis.paidUsers, isAllTime ? "On Pro or Pro+ now" : "Joined in this window, on Pro or Pro+ now"],
        // Installs and saves are on the Activity tab
      ]
    : null;
  const ROW = "flex gap-[calc(var(--cvw)*0.8)] max-lg:flex-wrap max-lg:gap-3";

  if (!cards) {
    return (
      <div className={ROW}>
        {[0, 1].map((i) => (
          <StatCardSkeleton key={i} className={STAT_EACH} />
        ))}
      </div>
    );
  }

  return (
    <div className={ROW}>
      {cards.map(([label, stat, note]) => (
        <StatCard key={label} className={STAT_EACH} label={label} value={new Intl.NumberFormat("en").format(stat.value || 0)} note={note} stat={stat} comparison={data.kpis.comparison} />
      ))}
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loosely matches email-shaped tokens anywhere inside a CSV cell/line.
const EMAIL_TOKEN_RE = /[^\s,;<>"']+@[^\s,;<>"']+\.[^\s,;<>"']+/g;
// Matches the server's hard per-request cap (MAX_EMAILS_PER_REQUEST in the
// invite route) - a single click on "Send Invitations" fires this many
// sequential requests instead of one big one, so nothing ever gets sent in
// bulk even with a full CSV queued up.
const BATCH_SIZE = 10;

function parseEmailsFromText(text) {
  const matches = text.match(EMAIL_TOKEN_RE) || [];
  return matches
    .map((m) => m.trim().replace(/[.,;]+$/, "").toLowerCase())
    .filter((m) => EMAIL_RE.test(m));
}

function InviteModal({ onClose }) {
  const [emails, setEmails] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);
  const [results, setResults] = useState(null);
  const [csvNote, setCsvNote] = useState(null);
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    fetch("/api/admin/waitlist/invite")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => json && setQuota(json))
      .catch(() => {});
  }, []);

  const atDailyLimit = quota && quota.remaining <= 0;

  function addEmails(text) {
    const found = parseEmailsFromText(text);
    if (found.length === 0) return;
    setEmails((prev) => {
      const merged = [...new Set([...prev, ...found])];
      if (quota && merged.length > quota.remaining) {
        setCsvNote({
          type: "error",
          text: `Only ${quota.remaining} invite${quota.remaining === 1 ? "" : "s"} left today (${quota.limit}/day limit) - trimmed the rest.`,
        });
        return merged.slice(0, quota.remaining);
      }
      return merged;
    });
  }

  function commitInput() {
    if (!inputValue.trim()) return;
    addEmails(inputValue);
    setInputValue("");
  }

  function removeEmail(target) {
    setEmails((prev) => prev.filter((e) => e !== target));
  }

  function handleInputKeyDown(e) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (inputValue.trim()) {
        e.preventDefault();
        commitInput();
      } else if (e.key === "Enter" && emails.length > 0) {
        // Empty box + Enter = send, mirroring the old native submit-button behavior.
        e.preventDefault();
        handleSubmit(e);
      }
    } else if (e.key === "Backspace" && !inputValue && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  }

  function handleInputPaste(e) {
    const pasted = e.clipboardData?.getData("text") || "";
    if (/[\s,;]/.test(pasted)) {
      e.preventDefault();
      addEmails(pasted);
      setInputValue("");
    }
  }

  function handleCsvFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const found = parseEmailsFromText(text);
      if (found.length === 0) {
        setCsvNote({ type: "error", text: "No valid email addresses found in that file." });
        return;
      }
      setEmails((prev) => {
        let merged = [...new Set([...prev, ...found])];
        const addedCount = merged.length - prev.length;

        if (quota && merged.length > quota.remaining) {
          merged = merged.slice(0, quota.remaining);
          const kept = merged.length - prev.length;
          setCsvNote({
            type: kept > 0 ? "success" : "error",
            text: `Only ${quota.remaining} invite${quota.remaining === 1 ? "" : "s"} left today (${quota.limit}/day limit) - added ${kept} from the CSV, skipped the rest.`,
          });
        } else {
          setCsvNote({
            type: "success",
            text: `Added ${addedCount} email${addedCount === 1 ? "" : "s"} from CSV.`,
          });
        }
        return merged;
      });
    };
    reader.onerror = () => {
      setCsvNote({ type: "error", text: "Could not read that file." });
    };
    reader.readAsText(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    commitInput();

    const toSend = inputValue.trim() ? [...new Set([...emails, ...parseEmailsFromText(inputValue)])] : emails;
    if (toSend.length === 0) return;

    const batches = [];
    for (let i = 0; i < toSend.length; i += BATCH_SIZE) {
      batches.push(toSend.slice(i, i + BATCH_SIZE));
    }

    setSending(true);
    setMessage(null);
    setResults([]);
    setInputValue("");

    let allResults = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      try {
        const res = await fetch("/api/admin/waitlist/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: batch }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Invite failed");

        allResults = [...allResults, ...(json.results || [])];
        setResults(allResults);
        setQuota((prev) =>
          prev
            ? {
                ...prev,
                sentToday: prev.sentToday + json.sentCount,
                remaining: Math.max(0, prev.remaining - json.sentCount),
              }
            : prev
        );
      } catch (err) {
        // A whole-batch failure (network/auth/etc, not a per-email one) - stop
        // there rather than firing further batches, but still account for
        // every email that never got attempted so none silently vanish.
        const unattempted = batches.slice(i).flat();
        allResults = [
          ...allResults,
          ...unattempted.map((email) => ({ email, success: false, error: err.message })),
        ];
        setResults(allResults);
        break;
      }
    }

    const sentCount = allResults.filter((r) => r.success).length;
    const failedCount = allResults.length - sentCount;
    const failedEmails = allResults.filter((r) => !r.success).map((r) => r.email);
    setEmails(failedEmails);

    if (failedCount === 0) {
      setMessage({
        type: "success",
        text: `Invitation${sentCount === 1 ? "" : "s"} sent to ${sentCount} address${sentCount === 1 ? "" : "es"}.`,
      });
    } else {
      setMessage({
        type: "error",
        text: `${sentCount} sent, ${failedCount} failed. Fix and retry the ones below.`,
      });
    }

    setSending(false);
  }

  const pendingCount = emails.length + (inputValue.trim() && EMAIL_RE.test(inputValue.trim()) ? 1 : 0);

  return (
    <motion.div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 px-4 backdrop-blur-lg"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <motion.div
        data-lenis-prevent
        className="relative max-h-[80svh] w-full max-w-lg overflow-y-auto overscroll-contain border border-white/10 bg-background p-6 text-foreground"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className=" group absolute right-5 top-5 flex h-10 w-10 items-center justify-center  border border-white/20 bg-white/10 text-xl leading-none text-white/70 transition-all duration-500 ease-in-out hover:border-primary hover:bg-primary hover:text-white "
        >
          <div className="relative flex h-4 w-4 items-center justify-center duration-500 ease-in-out group-hover:rotate-90">
            <span className="h-px w-4 rotate-45 bg-white" />
            <span className="absolute h-px w-4 -rotate-45 bg-white" />
          </div>
        </button>

        <div className="mb-6">
          <h2 className="type-h3 text-foreground">Invite users</h2>
        </div>
        <p className="mb-2 text-sm text-white/80">
          Add one or more addresses - type and press Enter, paste a list, or
          upload a CSV. Everyone in the list gets an invite link when you send.
        </p>
        <p className="mb-5 text-xs text-white/45">
          {quota
            ? `${quota.remaining} of ${quota.limit} invites left today`
            : "Limit: 100 invites per day"}
        </p>

        {atDailyLimit && (
          <p className="mb-4  border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            Daily invite limit reached ({quota.limit}/day). Try again tomorrow.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div data-lenis-prevent className="max-h-[calc(var(--cvw)*30)] overflow-y-auto border border-white/10 bg-white/5 p-2 focus-within:border-white/25">
            {emails.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5 px-1 pt-1">
                {emails.map((e) => (
                  <span
                    key={e}
                    className="inline-flex items-center gap-1.5  bg-white/10 py-1 pl-3 pr-1.5 text-xs text-white/80"
                  >
                    {e}
                    <button
                      type="button"
                      onClick={() => removeEmail(e)}
                      aria-label={`Remove ${e}`}
                      className="flex h-4 w-4 items-center justify-center  text-white/50 transition hover:bg-white/15 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              disabled={atDailyLimit}
              placeholder={atDailyLimit ? "Daily limit reached" : emails.length === 0 ? "name@example.com" : "Add another…"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onPaste={handleInputPaste}
              onBlur={commitInput}
              className="w-full bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-white/35 outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Upload CSV is the site Button's size (BUTTON_SIZE); on phones both are full width */}
          <div className="flex flex-wrap items-center justify-between gap-3 max-md:flex-col max-md:items-stretch">
            <label className={`inline-flex items-center justify-center gap-2 border border-white/15 px-(--pad) font-avenir font-medium tracking-wide text-white/70 transition [--pad:calc(var(--hx-vw,1vw)*1.2)] max-md:w-full max-md:[--pad:24px] ${BUTTON_SIZE} ${atDailyLimit ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-white/30 hover:text-white"}`}>
              <Upload className="size-4 shrink-0" />
              Upload CSV
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleCsvFile}
                disabled={atDailyLimit}
                className="hidden"
              />
            </label>

            <Button
              href="#"
              preventDefault
              disabled={sending || pendingCount === 0 || atDailyLimit}
              onClick={handleSubmit}
              variant="orange"
              className="max-md:w-full"
              text={
                sending
                  ? "Sending…"
                  : pendingCount > 0
                    ? `Send ${pendingCount} Invitation${pendingCount === 1 ? "" : "s"}`
                    : "Send Invitations"
              }
            />
          </div>
        </form>

        {csvNote && (
          <p className={`mt-3 text-xs ${csvNote.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {csvNote.text}
          </p>
        )}
        {message && (
          <p
            className={`mt-3 text-sm ${
              message.type === "success" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
        {results && results.length > 0 && (
          <ul data-lenis-prevent className="mt-3 max-h-40 space-y-1 overflow-y-auto border border-white/10 bg-white/3 p-2">
            {results.map((r) => (
              <li key={r.email} className="flex items-center gap-2 px-1.5 py-1 text-xs">
                {r.success ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                )}
                <span className="truncate text-white/70">{r.email}</span>
                {!r.success && r.error && (
                  <span className="truncate text-white/35">- {r.error}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function AdminPage() {
  // What this admin may do (lib/admin-permissions; the development preview has everything):
  // the billing columns need finance.view, the toolbar's buttons their own permission.
  // Everyone gets Manage - the drawer shows only the sections they can use.
  const { path, can, isSuperAdmin } = useDashboard();
  // Super admins can also filter by one admin role (the Roles tab's): "role:<id>"
  const [roleFilters, setRoleFilters] = useState(ROLE_FILTERS);
  useEffect(() => {
    if (!isSuperAdmin || getDashboardPreview()) return undefined;
    let active = true;
    fetch("/api/admin/roles", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json?.roles) return;
        setRoleFilters({ ...ROLE_FILTERS, ...Object.fromEntries(json.roles.map((role) => [`role:${role.id}`, `${role.name} admins`])) });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isSuperAdmin]);
  const seesMoney = can("finance.view");
  const { user: viewer } = useUser();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  // Customers / Internal / All: chosen in the tab row (DashboardShell)
  const [audience] = useAdminAudience();
  // When they joined: the dashboard's date filter ({ preset, from, to })
  const [dates, setDates] = useState(ALL_DATES);
  const dateRange = dates.preset;
  const customFrom = dates.from;
  const customTo = dates.to;
  const [sortBy, setSortBy] = useState("newest");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manageUser, setManageUser] = useState(null);
  // Super admins: rows picked with the checkboxes, and whether the delete dialog is open
  const [selected, setSelected] = useState(() => new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [prevSearch, setPrevSearch] = useState(search);
  const [prevPlanFilter, setPrevPlanFilter] = useState(planFilter);
  const [prevRoleFilter, setPrevRoleFilter] = useState(roleFilter);
  const [prevDateRange, setPrevDateRange] = useState(dateRange);
  const [prevCustomFrom, setPrevCustomFrom] = useState(customFrom);
  const [prevCustomTo, setPrevCustomTo] = useState(customTo);
  const [prevSortBy, setPrevSortBy] = useState(sortBy);
  const [prevPageSize, setPrevPageSize] = useState(pageSize);
  const [prevAudience, setPrevAudience] = useState(audience);

  // Reset to page 1 whenever a filter changes - derived purely from values
  // already available during render, so adjust it here instead of in an effect.
  if (
    prevSearch !== search ||
    prevPlanFilter !== planFilter ||
    prevRoleFilter !== roleFilter ||
    prevDateRange !== dateRange ||
    prevCustomFrom !== customFrom ||
    prevCustomTo !== customTo ||
    prevSortBy !== sortBy ||
    prevPageSize !== pageSize ||
    prevAudience !== audience
  ) {
    setPrevSearch(search);
    setPrevPlanFilter(planFilter);
    setPrevRoleFilter(roleFilter);
    setPrevCustomFrom(customFrom);
    setPrevCustomTo(customTo);
    setPrevDateRange(dateRange);
    setPrevSortBy(sortBy);
    setPrevPageSize(pageSize);
    setPrevAudience(audience);
    setCurrentPage(1);
  }

  // The page holds still behind the invite and create-user modals without losing its
  // scrollbar's width (lib hooks/useLenisLock); the Manage drawer holds it itself
  useLenisLock(showInviteModal || showCreateModal, { closeMs: 250 });

  // Guards against out-of-order responses: a broad, slow request (e.g. no
  // search text, a large page size) can resolve *after* a narrower, faster
  // one fired right behind it (e.g. once search text lands), which would
  // otherwise overwrite the correct filtered result with a stale unfiltered
  // one - exactly the "search box has text but the table shows everyone"
  // symptom. Only the most recently *started* request is allowed to apply
  // its result.
  const requestIdRef = useRef(0);

  // Shared by fetchUsers and handleExport, which filter the same table by
  // the same "Activity window" control - a custom range sends explicit
  // from/to instead of the "custom" preset name, which the server doesn't
  // otherwise know how to bound.
  const appendDateRangeParams = useCallback(
    (params) => {
      if (dateRange === "custom") {
        if (customFrom) params.set("joinedFrom", customFrom);
        if (customTo) params.set("joinedTo", customTo);
      } else if (dateRange !== "all") {
        params.set("joined", dateRange);
      }
    },
    [dateRange, customFrom, customTo]
  );

  const fetchUsers = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    // Development preview: sample users, no session needed
    if (getDashboardPreview()) {
      const sample = sampleAdminUsers();
      setUsers(sample.users);
      setTotal(sample.total);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ audience });
      if (search) params.set("search", search);
      if (planFilter !== "all") params.set("plan", planFilter);
      if (roleFilter !== "all") params.set("role", roleFilter);
      appendDateRangeParams(params);
      if (sortBy !== "newest") params.set("sort", sortBy);
      params.set("limit", String(pageSize));
      params.set("offset", String((currentPage - 1) * pageSize));

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load users");
      if (requestId !== requestIdRef.current) return;
      setUsers(json.users || []);
      setTotal(json.total || 0);
      // A new page or filter: nothing picked
      setSelected(new Set());
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [search, planFilter, roleFilter, audience, appendDateRangeParams, sortBy, pageSize, currentPage]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Download the filtered list as a CSV without leaving the page: fetched in the
  // background and saved from memory, with a toast for how it went
  const { toast, showToast, dismissToast } = useToastQueue();
  const [exporting, setExporting] = useState(false);
  async function handleExport() {
    if (exporting) return;
    const params = new URLSearchParams({ audience });
    if (search) params.set("search", search);
    if (planFilter !== "all") params.set("plan", planFilter);
    if (roleFilter !== "all") params.set("role", roleFilter);
    appendDateRangeParams(params);

    setExporting(true);
    try {
      const res = await fetch(`/api/admin/users/export?${params.toString()}`);
      if (!res.ok) throw new Error(`export ${res.status}`);
      const blob = await res.blob();
      const name = res.headers.get("content-disposition")?.match(/filename="?([^";]+)"?/)?.[1] || "vault-users.csv";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      // A file, not a page: the page transitions leave it alone
      link.setAttribute("data-no-page-transition", "");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast({ title: "Export Downloaded", description: `${name} - the users matching these filters.` });
    } catch (err) {
      console.error(err);
      showToast({ title: "Couldn't Export Users", description: "Please try again in a moment." });
    } finally {
      setExporting(false);
    }
  }

  function applyManageChanges(userId, patch) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...patch } : u)));
  }

  // Who can be deleted: super admins only, never your own account or another super admin's
  // (the API checks again)
  const deletable = (user) => isSuperAdmin && user.id !== viewer?.id && user.role !== "super_admin";
  const pickable = users.filter(deletable);
  const picked = users.filter((user) => selected.has(user.id));
  const allPicked = pickable.length > 0 && pickable.every((user) => selected.has(user.id));
  const toggle = (id) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  function deletionDone({ deleted, failed }) {
    setConfirmDelete(false);
    setSelected(new Set());
    if (deleted.length) {
      setUsers((current) => current.filter((user) => !deleted.includes(user.id)));
      setTotal((current) => Math.max(0, current - deleted.length));
    }
    showToast(
      failed.length
        ? { title: deleted.length ? `${deleted.length} Deleted, ${failed.length} Not` : "Couldn’t Delete", description: failed[0].error, tone: "error" }
        : { title: deleted.length === 1 ? "Account Deleted" : `${deleted.length} Accounts Deleted`, description: "Gone for good: they can’t be restored." },
    );
    fetchUsers();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const columns = seesMoney ? 9 : 8;

  return (
    <>
    <ToastViewport toast={toast} onDismiss={dismissToast} />
    <div className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
      {/* the window and whose accounts, left; export, invite, create, whose accounts and the date, right */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="type-label text-black/60">
          {dates.preset === "custom" ? "Custom range" : `${DATE_PRESETS[dates.preset]}`} · {audience === "all" ? "every account" : audience === "internal" ? "internal accounts" : "customers"}
        </p>
        {/* not the table's toolbar grid: the icon actions stay in one row, the filters below */}
        <div className="flex flex-wrap items-start gap-[calc(var(--cvw)*0.7)] max-lg:gap-3 max-md:w-full">
          {can("users.export") && (
            <Tooltip label="Export CSV">
              <button type="button" onClick={handleExport} disabled={exporting} aria-label="Export CSV" className={ICON_BUTTON}>
                {exporting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
              </button>
            </Tooltip>
          )}
          {can("users.invite") && (
            <Tooltip label="Invite">
              <button type="button" onClick={() => setShowInviteModal(true)} aria-label="Invite people" className={ICON_BUTTON}>
                <UserPlus aria-hidden="true" />
              </button>
            </Tooltip>
          )}
          {/* an account with a password the admin sets (users.create) */}
          {can("users.create") && (
            <Tooltip label="Create user">
              <button type="button" onClick={() => setShowCreateModal(true)} aria-label="Create user" className={ICON_BUTTON}>
                <UserRoundKey aria-hidden="true" />
              </button>
            </Tooltip>
          )}
          <div className={AUDIENCE_PAIR}>
            <AdminAudienceFilter widthClassName={PAIR_WIDTH} />
            <DateRangeFilter label="Joined" value={dates} onChange={setDates} widthClassName={PAIR_WIDTH} className="min-w-0" />
          </div>
        </div>
      </div>

      <UserStatsTiles dates={dates} audience={audience} />

      <section aria-label="Users" className={`${CARD} ${CARD_PAD} gap-[calc(var(--cvw)*1.2)] max-lg:gap-4`}>
        {/* search and filters */}
        <div className={TOOLBAR}>
          <SearchField value={search} onChange={setSearch} placeholder="Search by name or email" label="Search users" className="min-w-40 flex-1" />
          {/* phones: plans and sort side by side, roles on its own row below */}
          {[
            [PLAN_FILTERS, planFilter, setPlanFilter, "all", ""],
            [roleFilters, roleFilter, setRoleFilter, "all", "max-md:order-1 max-md:col-span-2"],
            [SORTS, sortBy, setSortBy, "newest", ""],
          ].map(([labels, value, set, idle, phone]) => (
            <FilterMenu
              key={Object.values(labels)[0]}
              tone="light"
              variant="label"
              alignRight
              widthClassName={`${FILTER_WIDTH} ${phone}`}
              panelClassName={SCROLL_PANEL}
              options={Object.keys(labels)}
              categoryFilter={value}
              activeFilter={value === idle ? null : value}
              getLabel={(id) => labels[id]}
              onSelect={set}
            />
          ))}
          <div className="ml-auto max-md:order-2 max-md:col-span-2 max-md:ml-0">
            <PerPageMenu value={pageSize} onChange={setPageSize} options={ADMIN_PER_PAGE_OPTIONS} />
          </div>
        </div>

        {error && <p className="type-small bg-primary/10 px-4 py-3 text-ink ring-1 ring-inset ring-primary/30">{error}</p>}

        {/* picked rows: how many, and Delete (super admins) */}
        {picked.length > 0 && (
          // the site's dark surface (#111111) with the orange action, as the dashboard's own bars
          <div role="region" aria-label="Selected accounts" className="flex flex-wrap items-center justify-between gap-3 bg-background px-4 py-3 text-foreground max-md:flex-col max-md:items-stretch">
            <p className="type-body">
              {picked.length} selected
              <button type="button" onClick={() => setSelected(new Set())} className="type-small ml-3 cursor-pointer text-foreground/70 underline underline-offset-3 transition-colors duration-300 hover:text-primary">
                Clear
              </button>
            </p>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className={`type-label inline-flex cursor-pointer items-center justify-center gap-2 bg-primary px-5 ${BUTTON_SIZE} text-black transition-colors duration-300 hover:bg-primary-hover [&_svg]:size-4`}
            >
              <Trash2 aria-hidden="true" />
              Delete Permanently
            </button>
          </div>
        )}

        {/* the table */}
        <TableScroll>
          <table className={TABLE}>
            <thead>
              <tr className={HEAD_ROW}>
                <th className={`${TH} ${STICKY_START}`}>
                  <span className="flex items-center gap-3">
                    {isSuperAdmin && (
                      <Checkbox
                        label="Select every account on this page"
                        checked={allPicked}
                        disabled={!pickable.length}
                        onChange={() => setSelected(allPicked ? new Set() : new Set(pickable.map((user) => user.id)))}
                      />
                    )}
                    User
                  </span>
                </th>
                <th className={TH}>Joined</th>
                <th className={TH}>Plan</th>
                {/* installs by source, in the charts' colours (Web ink, CLI orange, MCP grey) */}
                <th className={`${TH} ${NUM}`}>
                  <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2 bg-ink" />Web</span>
                </th>
                <th className={`${TH} ${NUM}`}>
                  <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2 bg-primary" />CLI</span>
                </th>
                <th className={`${TH} ${NUM}`}>
                  <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2 bg-black/30" />MCP</span>
                </th>
                <th className={`${TH} ${NUM}`}>Saves</th>
                {/* the Razorpay customer ID is in the Manage drawer (Plan & access), so the table fits */}
                {seesMoney && <th className={TH}>Valid until</th>}
                <th className={`${TH} ${STICKY_END} text-right`}>
                  <span className="sr-only">Manage</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: Math.min(pageSize, 6) }, (_, i) => (
                  <tr key={i} className={ROW}>
                    <td colSpan={columns} className="py-3">
                      <Skeleton className="h-9 w-full" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={columns} className={EMPTY_CELL}>
                    No users match these filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={ROW}>
                    <td className={`${TD} ${STICKY_START}`}>
                      <div className="flex items-center gap-3">
                        {isSuperAdmin && (
                          <Checkbox
                            label={`Select ${displayName(user)}`}
                            checked={selected.has(user.id)}
                            disabled={!deletable(user)}
                            title={deletable(user) ? undefined : user.id === viewer?.id ? "Your own account can't be deleted here" : "Super admins can't be deleted"}
                            onChange={() => toggle(user.id)}
                          />
                        )}
                        <UserAvatar name={user.name} email={user.email} imageUrl={user.imageUrl} className="size-9" />
                        <div className="flex min-w-0 flex-col">
                          <span className="flex items-center gap-1.5">
                            <Link href={path(buildUserActivityPath(user))} className="type-body truncate transition-colors duration-300 hover:text-primary">
                              {displayName(user)}
                            </Link>
                            {user.role && user.role !== "user" && <span className="type-small shrink-0 bg-black/5 px-1.5 text-black/60">{user.role === "super_admin" ? "Super admin" : "Admin"}</span>}
                            {user.id === viewer?.id && <span className="type-small shrink-0 text-black/40">(you)</span>}
                            {user.suspended && <span className="type-small shrink-0 bg-danger-strong/10 px-1.5 text-danger-strong">Suspended</span>}
                            {/* admins are internal anyway: their role tag says enough */}
                            {user.internal && !(user.role && user.role !== "user") && <span className="type-small shrink-0 bg-black/5 px-1.5 text-black/60" title="Kept out of the customer numbers">Internal</span>}
                          </span>
                          <span className="type-small truncate text-black/60">{user.email || user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className={`type-small whitespace-nowrap ${TD} text-black/60`}>{formatDate(user.joinedAt)}</td>
                    <td className={`${TD}`}>
                      <PlanBadge plan={user.plan} tier={user.tier} />
                    </td>
                    <td className={`type-body ${TD} ${NUM} text-center text-ink`}>{user.webCount ?? 0}</td>
                    <td className={`type-body ${TD} ${NUM} text-center text-primary`}>{user.cliCount ?? 0}</td>
                    <td className={`type-body ${TD} ${NUM} text-center text-black/50`}>{user.mcpCount ?? 0}</td>
                    <td className={`type-body ${TD} ${NUM} text-center`}>{user.savesCount ?? 0}</td>
                    {seesMoney && <td className={`type-small whitespace-nowrap text-center ${TD} text-black/60`}>{user.plan === "pro" ? formatDate(user.planValidUntil) : "—"}</td>}
                    <td className={`py-3 text-right ${STICKY_END}`}>
                      {/* icon only on phones, where the pinned column would take a third of the row */}
                      <button type="button" onClick={() => setManageUser(user)} aria-label={`Manage ${user.name || user.email}`} className={`${ACTION_LINE} max-md:px-3`}>
                        <UserCog aria-hidden="true" />
                        <span className="max-md:hidden">Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableScroll>

        <Pager page={currentPage - 1} pages={totalPages} total={total} noun={total === 1 ? "user" : "users"} onPage={(p) => setCurrentPage(p + 1)} />
      </section>
    </div>
    <AnimatePresence>
      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
      {confirmDelete && picked.length > 0 && <DeleteAccountsModal users={picked} onClose={() => setConfirmDelete(false)} onDone={deletionDone} />}
      {showCreateModal && <CreateUserModal onClose={() => setShowCreateModal(false)} onCreated={fetchUsers} />}

    </AnimatePresence>
    <ManageUserDrawer
      user={manageUser}
      isOwnRow={manageUser?.id === viewer?.id}
      activityHref={manageUser ? path(buildUserActivityPath(manageUser)) : "#"}
      onClose={() => setManageUser(null)}
      onSaved={(patch) => {
        applyManageChanges(manageUser.id, patch);
        setManageUser((current) => (current ? { ...current, ...patch } : current));
      }}
    />
    </>
  );
}
