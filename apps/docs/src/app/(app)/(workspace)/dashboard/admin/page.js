"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import {
  Search,
  ArrowUpRight,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAdminRole } from "@/lib/useAdminRole";
import ButtonV3 from "@/homepage-v3/components/ButtonV3";
import { CustomSelect } from "@/components/ui/CustomSelect";

const USERS_PER_PAGE = 10;

function formatCurrency(amountInSubunits, currency = "INR") {
  if (typeof amountInSubunits !== "number") return "-";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amountInSubunits / 100);
  } catch {
    return `${(amountInSubunits / 100).toFixed(2)} ${currency}`;
  }
}

function RevenueOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/revenue/overview")
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const stats = [
    { label: "Total Revenue", value: data ? formatCurrency(data.totalRevenue, data.currency) : "…" },
    { label: "This Month", value: data ? formatCurrency(data.revenueThisMonth, data.currency) : "…" },
    { label: "Last 30 Days", value: data ? formatCurrency(data.revenueLast30Days, data.currency) : "…" },
    {
      label: "Active Pro",
      value: data ? `${data.activeProCount} (${data.monthlySubscribers}mo / ${data.yearlySubscribers}yr)` : "…",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className=" border border-white/10 bg-white/3 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-white/45">{stat.label}</p>
          <p className="mt-1 text-lg font-semibold text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function RoleBadge({ role }) {
  if (role === "super_admin") {
    return (
      <span className="inline-flex items-center bg-white/10 border border-white/15 px-3 py-1 text-xs font-medium text-white/90">
        Super Admin
      </span>
    );
  }
  if (role === "admin") {
    return (
      <span className="inline-flex items-center bg-[#ff5f00]/15 px-3 py-1 text-xs font-medium text-[#ff5f00]">
        Admin
      </span>
    );
  }
  return <span className="text-xs text-white/25">-</span>;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function PlanBadge({ plan }) {
  return (
    <span
      className={`inline-flex items-center  px-3 py-1 text-xs font-medium ${
        plan === "pro"
          ? "bg-[#ff5f00]/15 text-[#ff5f00]"
          : "bg-white/8 text-white/60"
      }`}
    >
      {plan === "pro" ? "Pro" : "Free"}
    </span>
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
      className="fixed inset-0 z-900 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <motion.div
        className="relative w-full max-w-lg  border border-white/10 bg-[#0a0a0a] p-6"
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
          className=" group absolute right-5 top-5 flex h-10 w-10 items-center justify-center  border border-white/20 bg-white/10 text-xl leading-none text-white/70 transition-all duration-500 ease-in-out hover:border-[#ff5f00] hover:bg-[#ff5f00] hover:text-white "
        >
          <div className="relative flex h-4 w-4 items-center justify-center duration-500 ease-in-out group-hover:rotate-90">
            <span className="h-px w-4 rotate-45 bg-white" />
            <span className="absolute h-px w-4 -rotate-45 bg-white" />
          </div>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Invite users</h2>
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
          <div className="max-h-[30vw] overflow-y-auto border border-white/10 bg-white/5 p-2 focus-within:border-white/25">
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className={`inline-flex items-center gap-2  border border-white/15 px-3 py-[.8vw] text-[1.1vw] max-md:text-[3.5vw] max-[1025px]:text-[2.5vw] font-medium text-white/70 transition ${atDailyLimit ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-white/30 hover:text-white"}`}>
              <Upload className="h-5 w-5" />
              Upload CSV
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleCsvFile}
                disabled={atDailyLimit}
                className="hidden"
              />
            </label>

            <ButtonV3
              href="#"
              preventDefault
              disabled={sending || pendingCount === 0 || atDailyLimit}
              onClick={handleSubmit}
              variant="orange"
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
          <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto  border border-white/10 bg-white/3 p-2">
            {results.map((r) => (
              <li key={r.email} className="flex items-center gap-2 px-1.5 py-1 text-xs">
                {r.success ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                )}
                <span className="truncate text-white/70">{r.email}</span>
                {!r.success && r.error && (
                  <span className="truncate text-white/35">— {r.error}</span>
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
  const { user: viewer } = useUser();
  const { isSuperAdmin } = useAdminRole();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [intervalByUser, setIntervalByUser] = useState({});
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [prevSearch, setPrevSearch] = useState(search);
  const [prevPlanFilter, setPrevPlanFilter] = useState(planFilter);

  // Reset to page 1 whenever a filter changes - derived purely from values
  // already available during render, so adjust it here instead of in an effect.
  if (prevSearch !== search || prevPlanFilter !== planFilter) {
    setPrevSearch(search);
    setPrevPlanFilter(planFilter);
    setCurrentPage(1);
  }

  useEffect(() => {
    if (!showInviteModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showInviteModal]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (planFilter !== "all") params.set("plan", planFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load users");
      setUsers(json.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, planFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  async function togglePlan(user) {
    const newPlan = user.plan === "pro" ? "free" : "pro";
    const billingInterval = newPlan === "pro" ? intervalByUser[user.id] || "yearly" : null;
    setUpdatingId(user.id);
    try {
      const res = await fetch("/api/admin/users/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkUserId: user.id, plan: newPlan, billingInterval }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                plan: newPlan,
                status: newPlan === "pro" ? "active" : "inactive",
                billingInterval: json.billingInterval,
                planValidUntil: json.currentPeriodEnd,
              }
            : u
        )
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateRole(user, role) {
    setUpdatingId(user.id);
    try {
      const res = await fetch("/api/admin/users/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkUserId: user.id, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role, isAdmin: role !== null } : u))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const proCount = users.filter((u) => u.plan === "pro").length;
  const freeCount = users.filter((u) => u.plan === "free").length;

  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const pagedUsers = users.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="mt-1 text-sm text-white/50">
            {users.length} users · {proCount} Pro · {freeCount} Free
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2  border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Invite
            <UserPlus className="h-3.5 w-3.5" />
          </button>
          <Link
            href="/dashboard/admin/emails"
            className="inline-flex items-center gap-2  border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Email Log
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {isSuperAdmin && <RevenueOverview />}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full  border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/25"
          />
        </div>
        <CustomSelect
          value={planFilter}
          onChange={setPlanFilter}
          options={[
            { value: "all", label: "All plans" },
            { value: "pro", label: "Pro" },
            { value: "free", label: "Free" },
          ]}
        />
      </div>

      {error && (
        <div className=" border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className=" border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Role</th>
                {isSuperAdmin && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Valid Until</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Razorpay</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-white/45 uppercase tracking-wider">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: isSuperAdmin ? 7 : 4 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/8 animate-pulse" style={{ width: j === 0 ? "140px" : "80px" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 4} className="px-4 py-10 text-center text-white/40">
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
                            className="h-8 w-8  object-cover ring-1 ring-white/10"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center  bg-white/10 text-xs font-medium">
                            {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white max-w-48">
                            {user.name || "-"}
                          </p>
                          <p className="truncate text-xs text-white/45 max-w-48">
                            {user.email || user.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                      {formatDate(user.joinedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={user.plan} />
                    </td>
                    <td className="px-4 py-3">
                      {isSuperAdmin && user.id !== viewer?.id ? (
                        <CustomSelect
                          size="compact"
                          value={user.role || ""}
                          onChange={(newValue) => updateRole(user, newValue || null)}
                          disabled={updatingId === user.id}
                          options={[
                            { value: "", label: "No access" },
                            { value: "admin", label: "Admin" },
                            { value: "super_admin", label: "Super Admin" },
                          ]}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <RoleBadge role={user.role} />
                          {isSuperAdmin && user.id === viewer?.id && (
                            <span className="text-xs text-white/30">(you)</span>
                          )}
                        </div>
                      )}
                    </td>
                    {isSuperAdmin && (
                      <>
                        <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                          {user.plan === "pro" ? formatDate(user.planValidUntil) : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {user.razorpayCustomerId ? (
                            <span className="font-mono text-xs text-white/40" title={user.razorpayCustomerId}>
                              {user.razorpayCustomerId.slice(0, 12)}…
                            </span>
                          ) : (
                            <span className="text-xs text-white/25">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {user.plan !== "pro" && (
                              <CustomSelect
                                size="compact"
                                align="right"
                                value={intervalByUser[user.id] || "yearly"}
                                onChange={(newValue) =>
                                  setIntervalByUser((prev) => ({ ...prev, [user.id]: newValue }))
                                }
                                disabled={updatingId === user.id}
                                options={[
                                  { value: "monthly", label: "1 month" },
                                  { value: "yearly", label: "1 year" },
                                ]}
                              />
                            )}
                            <button
                              onClick={() => togglePlan(user)}
                              disabled={updatingId === user.id}
                              className={` px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.plan === "pro"
                                  ? "bg-white/10 text-white/70 hover:bg-white/15"
                                  : "bg-[#ff5f00]/15 text-[#ff5f00] hover:bg-[#ff5f00]/25"
                              }`}
                            >
                              {updatingId === user.id
                                ? "Updating…"
                                : user.plan === "pro"
                                  ? "Downgrade"
                                  : "Upgrade to Pro"}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && users.length > 0 && (
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
    <AnimatePresence>
      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
    </AnimatePresence>
    </>
  );
}
