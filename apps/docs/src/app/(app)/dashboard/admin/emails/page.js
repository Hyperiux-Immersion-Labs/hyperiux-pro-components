"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, X } from "lucide-react";

const EMAIL_TYPES = [
  "all",
  "welcome",
  "waitlist_invite",
  "pro_onboarding",
  "subscription_invoice",
  "subscription_renewal",
  "subscription_cancelled",
  "payment_failed",
  "custom_animation_request",
];

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        status === "success"
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400"
      }`}
    >
      {status}
    </span>
  );
}

function TypeLabel({ type }) {
  const labels = {
    welcome: "Welcome",
    waitlist_invite: "Waitlist Invite",
    pro_onboarding: "Pro Onboarding",
    subscription_invoice: "Invoice",
    subscription_renewal: "Renewal",
    subscription_cancelled: "Cancelled",
    payment_failed: "Payment Failed",
    custom_animation_request: "Animation Request",
    transactional: "Transactional",
  };
  return <span className="text-xs text-white/55">{labels[type] || type}</span>;
}

function EmailPreviewModal({ emailId, onClose }) {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    fetch(`/api/admin/emails?id=${emailId}`)
      .then((r) => r.json())
      .then(setEmail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [emailId]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-white/15 bg-[#0a0a0a] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-white/10">
          <div className="min-w-0">
            {loading ? (
              <div className="h-4 w-48 rounded bg-white/10 animate-pulse" />
            ) : (
              <>
                <p className="text-sm font-medium text-white truncate">{email?.subject}</p>
                <p className="text-xs text-white/45 mt-0.5">{email?.recipient_email} · {formatDate(email?.sent_at)}</p>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Email HTML preview */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-white/40 text-sm">
              Loading…
            </div>
          ) : email?.html_content ? (
            <iframe
              ref={iframeRef}
              srcDoc={email.html_content}
              sandbox="allow-popups"
              className="w-full h-full min-h-[500px] border-0"
              title="Email preview"
            />
          ) : (
            <div className="p-6">
              <pre className="whitespace-pre-wrap text-sm text-white/60 font-mono">
                {email?.text_content || "No content available."}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewId, setPreviewId] = useState(null);
  const [error, setError] = useState(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/emails?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load emails");
      setEmails(json.emails || []);
      setTotal(json.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const successCount = emails.filter((e) => e.status === "success").length;
  const failedCount = emails.filter((e) => e.status === "failed").length;

  return (
    <>
      {previewId && (
        <EmailPreviewModal emailId={previewId} onClose={() => setPreviewId(null)} />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
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
            <h1 className="text-2xl font-semibold">Email Log</h1>
            <p className="mt-1 text-sm text-white/50">
              {total} total · {successCount} delivered · {failedCount} failed
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none rounded-full border border-white/10 bg-white/5 py-2.5 pl-4 pr-9 text-sm text-white outline-none focus:border-white/25"
            >
              {EMAIL_TYPES.map((t) => (
                <option key={t} value={t}>{t === "all" ? "All types" : t}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-full border border-white/10 bg-white/5 py-2.5 pl-4 pr-9 text-sm text-white outline-none focus:border-white/25"
            >
              <option value="all">All statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Recipient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Sent At</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/45 uppercase tracking-wider">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded bg-white/8 animate-pulse" style={{ width: j === 1 ? "200px" : "100px" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : emails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-white/40">
                      No emails found.
                    </td>
                  </tr>
                ) : (
                  emails.map((email) => (
                    <tr key={email.id} className="transition hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <span className="text-white/80 truncate block max-w-48">{email.recipient_email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white truncate block max-w-64">{email.subject}</span>
                        {email.error_message && (
                          <span className="text-xs text-red-400 truncate block max-w-64">{email.error_message}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <TypeLabel type={email.email_type} />
                      </td>
                      <td className="px-4 py-3 text-white/50 whitespace-nowrap text-xs">
                        {formatDate(email.sent_at)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={email.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setPreviewId(email.id)}
                          className="rounded-full px-3 py-1.5 text-xs font-medium bg-white/8 text-white/60 hover:bg-white/15 hover:text-white transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
