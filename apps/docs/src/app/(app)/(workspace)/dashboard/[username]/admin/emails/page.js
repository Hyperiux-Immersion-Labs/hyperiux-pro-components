"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Eye } from "lucide-react";
import { ACTION_LINE, ADMIN_PER_PAGE, ADMIN_PER_PAGE_OPTIONS, CARD, CARD_PAD, EMPTY_CELL, FILTER_WIDTH, HEAD_ROW, Pager, PerPageMenu, ROW, SearchField, STICKY_END, STICKY_START, TABLE, TableScroll, TD, TH, TOOLBAR } from "@/components/Dashboard/DashboardUI";
import { Bar, SkeletonCard } from "@/components/Dashboard/DashboardSkeletons";
import { FilterMenu } from "@/app/(app)/(workspace)/effects/FilterMenu";
import { useLenisLock } from "@/hooks/useLenisLock";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/components/Dashboard/DashboardContext";

// Every email Vault has sent (sent_emails, logged by lib/resend), for admins: filter by
// type and delivery, page through, and open one to see it as it was sent.

const TYPES = {
  all: "All types",
  welcome: "Welcome",
  reset_password_code: "Reset password code",
  password_reset_link: "Password reset link",
  password_changed: "Password changed",
  password_reset_otp: "Password reset code",
  pro_unlocked: "Pro unlocked",
  invitations: "Invitations",
  exit_intent_invite: "Exit-intent invite",
  subscription_invoice: "Invoice",
  custom_animation_request: "Animation request",
  custom_animation_request_confirmation: "Animation request confirmation",
  // The Work with Hyperiux form is gone; its past emails are still in the log
  work_with_hyperiux: "Work enquiry",
  work_with_hyperiux_confirmation: "Work enquiry confirmation",
  verification_code: "Verification code",
  password_removed: "Password removed",
  primary_email_address_changed: "Primary email changed",
  account_locked: "Account locked",
  new_device_sign_in: "New device sign-in",
  transactional: "Transactional",
};
// "Sent" is Resend accepting the email; bounces and spam reports aren't tracked here
const STATUSES = { all: "Sent and failed", success: "Sent", failed: "Failed" };

const subscribeNever = () => () => {};
const number = (n) => new Intl.NumberFormat("en").format(n || 0);
const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "—";

// One sent email, as it was sent: the site's dark dialog, the email's own HTML inside
function EmailPreview({ emailId, onClose }) {
  const [email, setEmail] = useState(null);
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  useLenisLock(Boolean(emailId));

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/emails?id=${emailId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => active && setEmail(json || { text_content: "Couldn’t load this email." }))
      .catch(() => active && setEmail({ text_content: "Couldn’t load this email." }));
    return () => {
      active = false;
    };
  }, [emailId]);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;
  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4 backdrop-blur-lg">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={email?.subject || "Email"}
        data-lenis-prevent
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[80svh] w-[min(52vw,48rem)] flex-col border border-white/20 bg-background text-foreground max-lg:w-[85%] max-md:w-full"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6 pr-20">
          {email ? (
            <div className="flex min-w-0 flex-col gap-1">
              <p className="type-body truncate">{email.subject || "No subject"}</p>
              <p className="type-small truncate text-foreground/80">
                {email.recipient_email} · {formatDate(email.sent_at)}
              </p>
            </div>
          ) : (
            <div className="flex w-[60%] flex-col gap-2 text-foreground">
              <Bar type="type-body" className="w-full" />
              <Bar type="type-small" className="w-[60%]" />
            </div>
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="group absolute top-5 right-5 grid size-10 cursor-pointer place-items-center border border-white/20 bg-white/10 text-foreground/80 transition-colors duration-500 hover:border-primary hover:bg-primary hover:text-foreground"
          >
            <span className="relative flex size-4 items-center justify-center transition-transform duration-500 ease-in-out group-hover:rotate-90">
              <span className="h-px w-4 rotate-45 bg-foreground" />
              <span className="absolute h-px w-4 -rotate-45 bg-foreground" />
            </span>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!email ? (
            <div className="flex flex-col gap-3 p-6 text-foreground">
              <Bar className="h-6 w-1/2" />
              <Bar className="h-4 w-full" />
              <Bar className="h-32 w-full" />
            </div>
          ) : email.html_content ? (
            <iframe srcDoc={email.html_content} sandbox="allow-popups" title="Email preview" className="block h-[70svh] w-full border-0 bg-foreground" />
          ) : (
            <pre className="type-small whitespace-pre-wrap p-6 font-mono text-foreground/80">{email.text_content || "No content."}</pre>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// The table's rows while they load: recipient, subject, type, status, sent, preview
function RowsSkeleton({ count }) {
  return Array.from({ length: Math.min(count, 8) }, (_, i) => (
    <tr key={i} className={ROW}>
      <td colSpan={6} className="py-3">
        <div className="flex items-center gap-4">
          <Bar type="type-body" className="w-[18%]" />
          <Bar type="type-body" className="w-[30%]" />
          <Bar type="type-small" className="w-[12%]" />
          <Bar type="type-small" className="w-[8%]" />
          <Bar type="type-small" className="w-[14%]" />
          <Bar className="ml-auto h-9.5 w-20" />
        </div>
      </td>
    </tr>
  ));
}

export default function AdminEmailsPage() {
  // Needs emails.view (lib/admin-permissions); the API checks it again
  const { path, can, accessLoaded } = useDashboard();
  const allowed = can("emails.view");
  const router = useRouter();
  useEffect(() => {
    if (accessLoaded && !allowed) router.replace(path("admin/users"));
  }, [accessLoaded, allowed, router, path]);
  const [emails, setEmails] = useState([]);
  // Counts across every email matching the filters, not just this page
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [pageSize, setPageSize] = useState(ADMIN_PER_PAGE);
  const [page, setPage] = useState(0);
  const [previewId, setPreviewId] = useState(null);
  const [error, setError] = useState(null);
  // Recipient search: what's typed, and what's searched for after a short pause
  const [search, setSearch] = useState("");
  const [recipient, setRecipient] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setRecipient(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Any filter change starts again from the first page
  const filter = (set) => (value) => {
    set(value);
    setPage(0);
  };

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: String(pageSize), offset: String(page * pageSize) });
      if (type !== "all") params.set("type", type);
      if (status !== "all") params.set("status", status);
      if (recipient) params.set("to", recipient);
      const res = await fetch(`/api/admin/emails?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn’t load the email log.");
      setEmails(json.emails || []);
      setCounts({ total: json.total || 0, delivered: json.successCount || 0, failed: json.failedCount || 0 });
    } catch (err) {
      setError(err.message);
      setEmails([]);
      setCounts((current) => current || { total: 0, delivered: 0, failed: 0 });
    } finally {
      setLoading(false);
    }
  }, [type, status, recipient, pageSize, page]);

  useEffect(() => {
    if (!allowed) return;
    // Fetches in response to filter / page changes - an external-system sync
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmails();
  }, [fetchEmails, allowed]);

  const total = counts?.total || 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
      {previewId && <EmailPreview emailId={previewId} onClose={() => setPreviewId(null)} />}

      {/* matching, sent, failed - for the filters below */}
      <div className="flex gap-[calc(var(--cvw)*0.8)] max-md:flex-col max-lg:gap-3">
        {[
          ["Emails", counts?.total, "Matching the filters"],
          ["Sent", counts?.delivered, "Accepted by Resend - bounces aren't tracked"],
          ["Failed", counts?.failed, "Not sent - see the reason on the row"],
        ].map(([label, value, note]) =>
          counts ? (
            <div key={label} className={`${CARD} ${CARD_PAD} flex-1 gap-(--cvw) max-lg:gap-3`}>
              <p className="type-label text-black/60">{label}</p>
              <p className={`type-h2 ${label === "Failed" && value ? "text-danger-strong" : ""}`}>{number(value)}</p>
              <p className="type-small text-black/60">{note}</p>
            </div>
          ) : (
            <SkeletonCard key={label} className="flex-1 gap-(--cvw) max-lg:gap-3">
              <Bar type="type-label" className="w-20" />
              <Bar type="type-h2" className="w-[35%]" />
              <Bar type="type-small" className="w-[60%]" />
            </SkeletonCard>
          ),
        )}
      </div>

      <section aria-labelledby="emails-h" className={`${CARD} ${CARD_PAD} gap-[calc(var(--cvw)*1.2)] max-lg:gap-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="emails-h" className="type-h3">
            Emails
          </h2>
          <div className={TOOLBAR}>
            <SearchField
              value={search}
              onChange={(next) => {
                setSearch(next);
                setPage(0);
              }}
              placeholder="Recipient email"
              label="Search by recipient"
            />
            <FilterMenu
              tone="light"
              variant="label"
              alignRight
              label="Email type"
              widthClassName={FILTER_WIDTH}
              panelClassName="left-auto! right-0 max-h-[20vw] max-md:max-h-[50vh] overflow-y-auto"
              options={Object.keys(TYPES)}
              categoryFilter={type}
              activeFilter={type === "all" ? null : type}
              getLabel={(id) => TYPES[id] || id}
              onSelect={filter(setType)}
            />
            <FilterMenu
              tone="light"
              variant="label"
              alignRight
              label="Status"
              widthClassName={FILTER_WIDTH}
              panelClassName="left-auto! right-0"
              options={Object.keys(STATUSES)}
              categoryFilter={status}
              activeFilter={status === "all" ? null : status}
              getLabel={(id) => STATUSES[id]}
              onSelect={filter(setStatus)}
            />
            <PerPageMenu value={pageSize} onChange={filter(setPageSize)} options={ADMIN_PER_PAGE_OPTIONS} />
          </div>
        </div>

        {error && <p className="type-small bg-danger-strong/10 px-4 py-3 text-danger-strong">{error}</p>}

        <TableScroll>
          <table className={TABLE}>
            <thead>
              <tr className={HEAD_ROW}>
                <th className={`${TH} ${STICKY_START}`}>Recipient</th>
                <th className={TH}>Subject</th>
                <th className={TH}>Type</th>
                <th className={TH}>Status</th>
                <th className={TH}>Sent</th>
                <th className={`${TH} ${STICKY_END} text-right`}>
                  <span className="sr-only">Preview</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <RowsSkeleton count={pageSize} />
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={6} className={EMPTY_CELL}>
                    No emails match these filters.
                  </td>
                </tr>
              ) : (
                emails.map((email) => {
                  const failed = email.status === "failed";
                  return (
                    <tr key={email.id} className={ROW}>
                      <td className={`type-small max-w-48 truncate ${TD} text-ink ${STICKY_START}`}>{email.recipient_email}</td>
                      <td className={`${TD}`}>
                        <span className="flex max-w-80 flex-col">
                          <span className="type-body truncate">{email.subject}</span>
                          {email.error_message && <span className="type-small truncate text-danger-strong">{email.error_message}</span>}
                        </span>
                      </td>
                      <td className={`type-small ${TD} text-black/60`}>{TYPES[email.email_type] || email.email_type}</td>
                      <td className={`${TD}`}>
                        <span className={`type-small inline-flex items-center gap-1.5 ${failed ? "text-danger-strong" : "text-ink"}`}>
                          <span aria-hidden="true" className={`size-1.5 rounded-full ${failed ? "bg-danger-strong" : "bg-success-strong"}`} />
                          {failed ? "Failed" : "Sent"}
                        </span>
                      </td>
                      <td className={`type-small whitespace-nowrap ${TD} text-black/60`}>{formatDate(email.sent_at)}</td>
                      <td className={`py-3 text-right ${STICKY_END}`}>
                        <button type="button" onClick={() => setPreviewId(email.id)} className={ACTION_LINE}>
                          <Eye aria-hidden="true" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </TableScroll>

        <Pager page={Math.min(page, pages - 1)} pages={pages} total={total} noun={total === 1 ? "email" : "emails"} onPage={setPage} />
      </section>
    </div>
  );
}
