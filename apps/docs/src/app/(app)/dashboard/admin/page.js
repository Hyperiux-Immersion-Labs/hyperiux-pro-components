"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowUpRight, ChevronDown, Mail, X, UserPlus } from "lucide-react";

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

// Admins don't necessarily have an active subscription row (they get full
// access via publicMetadata.role, a separate axis from plan/status), so
// showing them as "inactive" is wrong rather than merely unstyled - check
// isAdmin first. For everyone else, "inactive" only ever means "never
// subscribed" (every user gets a free/inactive row at signup - see the
// Clerk webhook), not a lapsed subscription, so free plans read as "Free"
// instead of a status word that implies something broke.
function StatusBadge({ status, plan, isAdmin }) {
  if (isAdmin) {
    return <span className="text-xs font-medium text-[#ff5f00]">Admin</span>;
  }

  if (plan !== "pro") {
    return <span className="text-xs text-white/40">Free</span>;
  }

  const color =
    status === "active"
      ? "text-emerald-400"
      : status === "trialing"
        ? "text-blue-400"
        : "text-white/40";
  return <span className={`text-xs capitalize ${color}`}>{status || "inactive"}</span>;
}

function InviteModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/waitlist/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Invite failed");
      setMessage({ type: "success", text: `Invitation sent to ${email}` });
      setEmail("");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-900 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-white/10 bg-[#0a0a0a] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Invite user</h2>
          <button
            onClick={onClose}
            className="text-white/40 transition hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-sm text-white/50">
          Send an invitation email to any address — they&apos;ll get a link
          straight to account setup.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
          <Mail className="h-4 w-4 shrink-0 text-white/40" />
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-w-60 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/25"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-full px-4 py-2.5 text-xs font-medium bg-[#ff5f00]/15 text-[#ff5f00] transition hover:bg-[#ff5f00]/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending…" : "Send Invitation"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-3 text-sm ${
              message.type === "success" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [intervalByUser, setIntervalByUser] = useState({});
  const [showInviteModal, setShowInviteModal] = useState(false);

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

  const proCount = users.filter((u) => u.plan === "pro").length;
  const freeCount = users.filter((u) => u.plan === "free").length;

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="mt-1 text-sm text-white/50">
            {users.length} users · {proCount} Pro · {freeCount} Free
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Invite
            <UserPlus className="h-3.5 w-3.5" />
          </button>
          <Link
            href="/dashboard/admin/emails"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Email Log
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/25"
          />
        </div>
        <div className="relative">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="appearance-none rounded-full border border-white/10 bg-white/5 py-2.5 pl-4 pr-9 text-sm text-white outline-none focus:border-white/25"
          >
            <option value="all">All plans</option>
            <option value="pro">Pro</option>
            <option value="free">Free</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Valid Until</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Razorpay</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/45 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-white/8 animate-pulse" style={{ width: j === 0 ? "140px" : "80px" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/40">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
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
                      <StatusBadge status={user.status} plan={user.plan} isAdmin={user.isAdmin} />
                    </td>
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
                          <div className="relative">
                            <select
                              value={intervalByUser[user.id] || "yearly"}
                              onChange={(e) =>
                                setIntervalByUser((prev) => ({ ...prev, [user.id]: e.target.value }))
                              }
                              disabled={updatingId === user.id}
                              className="appearance-none rounded-full border border-white/10 bg-white/5 py-1.5 pl-3 pr-7 text-xs text-white/70 outline-none focus:border-white/25 disabled:opacity-50"
                            >
                              <option value="monthly">1 month</option>
                              <option value="yearly">1 year</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                          </div>
                        )}
                        <button
                          onClick={() => togglePlan(user)}
                          disabled={updatingId === user.id}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
    
    </>
  );
}
