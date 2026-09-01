"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { useAdminRole } from "@/lib/useAdminRole";
import { TEMPLATES } from "@/lib/mock-templates";

// Payment detail across every user - restricted to super admins (see
// api/admin/invoices/route.js), unlike the rest of /dashboard/admin which
// any admin can see. requireAdmin() in admin/layout.js already keeps
// regular non-admins out; this page adds the stricter super-admin-only gate
// on top, same pattern as the Revenue Overview strip on User Management.

const EVENTS_PER_PAGE = 15;
const TEST_FILTERS = [
  { id: "all", label: "All invoices" },
  { id: "real", label: "Real only" },
  { id: "test", label: "Test only" },
];
const TEMPLATE_FILTERS = [
  { id: "all", label: "All templates" },
  ...TEMPLATES.map((t) => ({ id: t.slug, label: t.title })),
];

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatAmount(amount, currency = "INR") {
  if (typeof amount !== "number") return "-";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  }
}

// template_purchases.amount is already whole currency units (see
// api/admin/template-purchases/route.js), unlike invoices.amount above -
// this must not divide by 100.
function formatTemplateAmount(amount, currency = "USD") {
  if (typeof amount !== "number") return "-";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function getBillingLabel(value) {
  const labels = { monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };
  return labels[value] || "-";
}

// No Clerk identity ever falls back to "Anonymous" here (unlike the
// install-activity log) - every invoice has a clerk_user_id by construction
// (recordInvoice() requires one), so the only failure mode is a user whose
// Clerk account was later deleted, which falls back to the raw id.
// Shared between the invoices table and the template-purchases table below -
// both API routes return the same userName/userEmail/userImageUrl/userId
// shape (see api/admin/invoices and api/admin/template-purchases).
function UserCell({ record }) {
  return (
    <div className="flex items-center gap-3">
      {record.userImageUrl ? (
        <Image
          src={record.userImageUrl}
          alt={record.userName || ""}
          width={28}
          height={28}
          className="h-7 w-7  object-cover ring-1 ring-white/10"
        />
      ) : (
        <div className="flex h-7 w-7 items-center justify-center  bg-white/10 text-xs font-medium">
          {(record.userName?.[0] || record.userEmail?.[0] || "?").toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate font-medium text-white max-w-48">{record.userName || "-"}</p>
        <p className="truncate text-xs text-white/45 max-w-48">{record.userEmail || record.userId}</p>
      </div>
    </div>
  );
}

export default function AdminInvoicingPage() {
  const router = useRouter();
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();

  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testFilter, setTestFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [prevTestFilter, setPrevTestFilter] = useState(testFilter);

  const [templatePurchases, setTemplatePurchases] = useState([]);
  const [templateTotal, setTemplateTotal] = useState(0);
  const [templateStats, setTemplateStats] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [templateError, setTemplateError] = useState(null);
  const [templateFilter, setTemplateFilter] = useState("all");
  const [templateCurrentPage, setTemplateCurrentPage] = useState(1);
  const [prevTemplateFilter, setPrevTemplateFilter] = useState(templateFilter);

  // Reset to page 1 whenever the filter changes - derived purely from a
  // value already available during render, so adjust it here instead of in
  // an effect.
  if (prevTestFilter !== testFilter) {
    setPrevTestFilter(testFilter);
    setCurrentPage(1);
  }
  if (prevTemplateFilter !== templateFilter) {
    setPrevTemplateFilter(templateFilter);
    setTemplateCurrentPage(1);
  }

  useEffect(() => {
    // Billing detail across every user is a step up from what a regular
    // admin can already see in User Management - send non-super-admins back
    // rather than showing an empty/forbidden page.
    if (!roleLoading && !isSuperAdmin) {
      router.replace("/dashboard/admin");
    }
  }, [roleLoading, isSuperAdmin, router]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (testFilter !== "all") params.set("test", testFilter);
      params.set("limit", String(EVENTS_PER_PAGE));
      params.set("offset", String((currentPage - 1) * EVENTS_PER_PAGE));

      const res = await fetch(`/api/admin/invoices?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load invoices");
      setInvoices(json.invoices || []);
      setTotal(json.total || 0);
      setStats(json.stats || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [testFilter, currentPage]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    // Fetches from a network API in response to filter/page changes - this
    // is a genuine external-system sync, not derivable during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoices();
  }, [isSuperAdmin, fetchInvoices]);

  const fetchTemplatePurchases = useCallback(async () => {
    setTemplateLoading(true);
    setTemplateError(null);
    try {
      const params = new URLSearchParams();
      if (templateFilter !== "all") params.set("template", templateFilter);
      params.set("limit", String(EVENTS_PER_PAGE));
      params.set("offset", String((templateCurrentPage - 1) * EVENTS_PER_PAGE));

      const res = await fetch(`/api/admin/template-purchases?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load template purchases");
      setTemplatePurchases(json.purchases || []);
      setTemplateTotal(json.total || 0);
      setTemplateStats(json.stats || null);
    } catch (err) {
      setTemplateError(err.message);
    } finally {
      setTemplateLoading(false);
    }
  }, [templateFilter, templateCurrentPage]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTemplatePurchases();
  }, [isSuperAdmin, fetchTemplatePurchases]);

  if (roleLoading || !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-white/40">Loading…</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / EVENTS_PER_PAGE));
  const templateTotalPages = Math.max(1, Math.ceil(templateTotal / EVENTS_PER_PAGE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invoicing</h1>
        <p className="mt-1 text-sm text-white/50">
          Every payment recorded across all users, real and test.
        </p>
      </div>

      <h2 className="text-lg font-medium text-white/90">Subscription Invoices</h2>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Total Invoices" value={stats ? stats.totalInvoices : "…"} detail="Real payments only" />
        <StatCard
          label="Total Revenue"
          value={stats ? formatAmount(stats.totalRevenue) : "…"}
          detail="Real payments only"
        />
        <StatCard label="Showing" value={total} detail={testFilter === "all" ? "All invoices" : TEST_FILTERS.find((f) => f.id === testFilter)?.label} />
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <select
            value={testFilter}
            onChange={(e) => setTestFilter(e.target.value)}
            className="appearance-none  border border-white/10 bg-white/5 py-2.5 pl-4 pr-9 text-sm text-white outline-none focus:border-white/25"
          >
            {TEST_FILTERS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        </div>
      </div>

      {error && (
        <div className=" border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className=" border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Billing</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/45 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Payment ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4  bg-white/8 animate-pulse" style={{ width: j === 0 ? "140px" : "70px" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/40">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="transition hover:bg-white/2">
                    <td className="px-4 py-3">
                      <UserCell record={invoice} />
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {invoice.planLabel || "Vault Pro"}
                      {invoice.isTest && (
                        <span className="ml-2  bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
                          Test
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/60">{getBillingLabel(invoice.billingInterval)}</td>
                    <td className="px-4 py-3 text-right font-medium text-white whitespace-nowrap">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/50" title={invoice.paymentId}>
                      {invoice.paymentId ? `${invoice.paymentId.slice(0, 16)}…` : "-"}
                    </td>
                    <td className="px-4 py-3 text-white/60 whitespace-nowrap text-xs">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {invoice.invoiceUrl ? (
                        <a
                          href={invoice.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff5f00] hover:text-[#ff7a29]"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-white/25">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && invoices.length > 0 && (
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

      <h2 className="text-lg font-medium text-white/90 pt-4">Template Purchases</h2>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Total Purchases"
          value={templateStats ? templateStats.totalPurchases : "…"}
        />
        <StatCard
          label="Total Revenue"
          value={templateStats ? formatTemplateAmount(templateStats.totalRevenue) : "…"}
        />
        <StatCard
          label="Showing"
          value={templateTotal}
          detail={
            templateFilter === "all"
              ? "All templates"
              : TEMPLATE_FILTERS.find((f) => f.id === templateFilter)?.label
          }
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <select
            value={templateFilter}
            onChange={(e) => setTemplateFilter(e.target.value)}
            className="appearance-none  border border-white/10 bg-white/5 py-2.5 pl-4 pr-9 text-sm text-white outline-none focus:border-white/25"
          >
            {TEMPLATE_FILTERS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        </div>
      </div>

      {templateError && (
        <div className=" border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {templateError}
        </div>
      )}

      <div className=" border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Template</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/45 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Payment ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/45 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {templateLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4  bg-white/8 animate-pulse" style={{ width: j === 0 ? "140px" : "70px" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : templatePurchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-white/40">
                    No template purchases found.
                  </td>
                </tr>
              ) : (
                templatePurchases.map((purchase) => (
                  <tr key={purchase.id} className="transition hover:bg-white/2">
                    <td className="px-4 py-3">
                      <UserCell record={purchase} />
                    </td>
                    <td className="px-4 py-3 text-white/80">{purchase.templateTitle}</td>
                    <td className="px-4 py-3 text-right font-medium text-white whitespace-nowrap">
                      {formatTemplateAmount(purchase.amount, purchase.currency)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/50" title={purchase.paymentId}>
                      {purchase.paymentId ? `${purchase.paymentId.slice(0, 16)}…` : "-"}
                    </td>
                    <td className="px-4 py-3 text-white/60 whitespace-nowrap text-xs">
                      {formatDate(purchase.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!templateLoading && templatePurchases.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-white/45">
            Page {templateCurrentPage} of {templateTotalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTemplateCurrentPage((page) => Math.max(1, page - 1))}
              disabled={templateCurrentPage === 1}
              className="flex h-8 w-8 items-center justify-center  border border-white/10 bg-white/5 text-white/70 transition hover:border-white/25 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setTemplateCurrentPage((page) => Math.min(templateTotalPages, page + 1))}
              disabled={templateCurrentPage === templateTotalPages}
              className="flex h-8 w-8 items-center justify-center  border border-white/10 bg-white/5 text-white/70 transition hover:border-white/25 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
