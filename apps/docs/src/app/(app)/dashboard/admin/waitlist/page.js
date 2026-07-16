"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }) {
  const color =
    status === "invited"
      ? "text-blue-400"
      : status === "completed"
        ? "text-emerald-400"
        : status === "rejected"
          ? "text-red-400"
          : "text-white/40";
  return <span className={`text-xs capitalize ${color}`}>{status}</span>;
}

export default function AdminWaitlistPage() {
  return (
    <Suspense fallback={null}>
      <AdminWaitlistPageInner />
    </Suspense>
  );
}

function AdminWaitlistPageInner() {
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitingId, setInvitingId] = useState(null);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "new" ? "new" : "entries"
  );
  const [newEmail, setNewEmail] = useState("");
  const [sendingNew, setSendingNew] = useState(false);
  const [newInviteMessage, setNewInviteMessage] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/waitlist");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load waitlist");
      setEntries(json.entries || []);
      setTotal(json.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchEntries, 0);
    return () => clearTimeout(timer);
  }, [fetchEntries]);

  async function handleInvite(entry) {
    setInvitingId(entry.id);
    try {
      const res = await fetch("/api/admin/waitlist/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: entry.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Invite failed");
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, invited: true } : e))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setInvitingId(null);
    }
  }

  async function handleSendNewInvite(e) {
    e.preventDefault();
    if (!newEmail) return;
    setSendingNew(true);
    setNewInviteMessage(null);
    try {
      const res = await fetch("/api/admin/waitlist/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Invite failed");
      setNewInviteMessage({ type: "success", text: `Invitation sent to ${newEmail}` });
      setNewEmail("");
      fetchEntries();
    } catch (err) {
      setNewInviteMessage({ type: "error", text: err.message });
    } finally {
      setSendingNew(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Users
          </Link>
        </div>
        <h1 className="text-2xl font-semibold">Waitlist</h1>
        <p className="mt-1 text-sm text-white/50">{total} total entries</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-1 border-b border-white/10">
        <button
          onClick={() => setActiveTab("entries")}
          className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
            activeTab === "entries"
              ? "border-[#ff5f00] text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Entries
        </button>
        <button
          onClick={() => setActiveTab("new")}
          className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
            activeTab === "new"
              ? "border-[#ff5f00] text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          New Invitation
        </button>
      </div>

      {activeTab === "new" ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-6">
          <p className="mb-4 text-sm text-white/50">
            Send a waitlist invitation to any email address — useful for
            testing the custom invite mail without waiting for a real
            signup.
          </p>
          <form onSubmit={handleSendNewInvite} className="flex flex-wrap items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-white/40" />
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="min-w-60 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/25"
            />
            <button
              type="submit"
              disabled={sendingNew}
              className="rounded-full px-4 py-2.5 text-xs font-medium bg-[#ff5f00]/15 text-[#ff5f00] transition hover:bg-[#ff5f00]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingNew ? "Sending…" : "Send Invitation"}
            </button>
          </form>
          {newInviteMessage && (
            <p
              className={`mt-3 text-sm ${
                newInviteMessage.type === "success" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {newInviteMessage.text}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/45 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 4 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded bg-white/8 animate-pulse" style={{ width: j === 0 ? "180px" : "80px" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-white/40">
                      No waitlist entries found.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="transition hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white/80">{entry.email}</td>
                      <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleInvite(entry)}
                          disabled={invitingId === entry.id || entry.invited}
                          className="rounded-full px-3 py-1.5 text-xs font-medium bg-[#ff5f00]/15 text-[#ff5f00] hover:bg-[#ff5f00]/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {invitingId === entry.id
                            ? "Inviting…"
                            : entry.invited
                              ? "Invited"
                              : "Invite"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
