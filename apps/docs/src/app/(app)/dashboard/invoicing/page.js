"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

function formatDate(value) {
  if (!value) return "Unknown";

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

function getBillingLabel(value) {
  const labels = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
  };

  return labels[value] || "Not available";
}

function StatCard({ label, value, detail }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-md p-6 bg-[#272727]">
      <p className="text-white mb-3">{label}</p>

      <p className="text-2xl font-medium font-laygrotesk leading-none">{value}</p>

      {detail && <div className="text-[#838383] mt-4">{detail}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const isPaid = status === "paid";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${
        isPaid ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-white/60"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

export default function InvoicingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const isAdmin = user?.publicMetadata?.role === "admin";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [testError, setTestError] = useState("");

  async function loadInvoices() {
    try {
      const res = await fetch("/api/dashboard/invoices");

      if (!res.ok) {
        throw new Error("Failed to load invoices");
      }

      const json = await res.json();

      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Invoicing is a customer-billing concept - admins don't have a paid
    // subscription of their own to review, so send them back rather than
    // showing an empty page.
    if (isLoaded && isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isAdmin, router]);

  useEffect(() => {
    if (!isLoaded || isAdmin) return;

    const frame = requestAnimationFrame(() => {
      loadInvoices();
    });

    return () => cancelAnimationFrame(frame);
  }, [isLoaded, isAdmin]);

  async function handleGenerateTestInvoice() {
    setGenerating(true);
    setTestError("");

    try {
      const res = await fetch("/api/dashboard/invoices/test", { method: "POST" });
      const result = await res.json();

      if (!res.ok) {
        setTestError(result.error || "Unable to generate a test invoice.");
        return;
      }

      setData((prev) =>
        prev ? { ...prev, invoices: [result.invoice, ...prev.invoices] } : prev
      );
    } catch (err) {
      console.error(err);
      setTestError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (!isLoaded || isAdmin || loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400">Loading invoicing...</p>
      </div>
    );
  }

  const { plan, subscription, invoices } = data;
  const isPro = plan === "pro";
  const hasRealSubscription = Boolean(subscription?.razorpay_subscription_id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display text-white">Invoicing</h1>

        <p className="text-white mt-2">
          Your plan validity, billing details, and previous invoices.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <StatCard
          label="Plan"
          value={<span className="capitalize">{plan}</span>}
          detail={
            isPro
              ? `Billed ${getBillingLabel(subscription?.billing_interval).toLowerCase()}`
              : "Upgrade to unlock Pro billing"
          }
        />

        <StatCard
          label="Valid Until"
          value={
            isPro
              ? subscription?.current_period_end
                ? formatDate(subscription.current_period_end)
                : "Active"
              : "-"
          }
          detail={
            isPro
              ? `Status: ${subscription?.status || "active"}`
              : null
          }
        />

        <StatCard
          label="Payment & Card"
          value={hasRealSubscription ? "Managed via Razorpay" : "No active billing"}
          detail={
            hasRealSubscription && subscription?.razorpay_short_url ? (
              <a
                href={subscription.razorpay_short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff5f00] hover:text-[#ff7a29]"
              >
                Update card / manage subscription
              </a>
            ) : isPro ? (
              "This Pro access was granted directly - no card on file."
            ) : (
              <a href="/pricing" className="text-[#ff5f00] hover:text-[#ff7a29]">
                View plans
              </a>
            )
          }
        />
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-white">Previous Bills</h2>

          {isPro && (
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={handleGenerateTestInvoice}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm text-white transition hover:bg-white hover:text-black disabled:opacity-60 cursor-pointer"
              >
                {generating && <Loader2 className="h-4 w-4 animate-spin" />}
                Generate test invoice
              </button>

              {testError && (
                <p className="text-xs text-red-400">{testError}</p>
              )}
            </div>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="rounded-md p-12 bg-[#272727] text-center">
            <h3 className="text-2xl text-white mb-2">No invoices yet</h3>

            <p className="text-zinc-400">
              {isPro
                ? "Your bills will show up here as soon as a payment goes through."
                : "Upgrade to Pro to start seeing invoices here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md bg-[#272727]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Invoice</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 text-white">{formatDate(invoice.created_at)}</td>

                    <td className="px-6 py-4 text-white/80">
                      {invoice.plan_label || "Vault Pro"}
                      {invoice.is_test && (
                        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
                          Test
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-white">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>

                    <td className="px-6 py-4">
                      {invoice.invoice_url ? (
                        <a
                          href={invoice.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff5f00] hover:text-[#ff7a29]"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-white/30">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
