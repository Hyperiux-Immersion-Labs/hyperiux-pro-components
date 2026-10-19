"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/components/Dashboard/DashboardContext";
import { ACTION_LINE, ACTION_PRIMARY, CARD, CARD_PAD, DetailRows, TextButton } from "@/components/Dashboard/DashboardUI";
import { Bar, SkeletonCard } from "@/components/Dashboard/DashboardSkeletons";
import { useAdminRole } from "@/lib/useAdminRole";
import { getDashboardPreview } from "@/lib/dev/dashboardPreview";

// The admin Settings tab (super admins): what used to need a code change or a redeploy.
//   Install limits   - applied, or only recorded; the daily limits themselves stay in
//                      lib/plans.js, since the pricing page and plan copy quote them
//   Internal accounts - team / test emails and domains kept out of the customer numbers
// Every save is logged in the admin audit log (Log tab).

const PREVIEW = {
  installLimit: { enforced: false, source: "environment", limits: { free: 3, pro: 5, pro_plus: 10 } },
  internal: { builtInEmails: [], builtInDomains: ["weareenigma.com"], emails: ["qa@example.com"], domains: [] },
};
const FIELD = "type-body min-h-28 w-full resize-y bg-black/3 px-3 py-2 text-ink ring-1 ring-inset ring-black/10 outline-none placeholder:text-black/40 focus:ring-primary";
const lines = (text) => text.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);

export default function AdminSettingsPage() {
  const { path, isSuperAdmin } = useDashboard();
  const role = useAdminRole();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null); // { tone: "ok" | "error", text }
  const [emails, setEmails] = useState("");
  const [domains, setDomains] = useState("");

  useEffect(() => {
    if (!role.loading && !isSuperAdmin) router.replace(path("admin/users"));
  }, [role.loading, isSuperAdmin, router, path]);

  useEffect(() => {
    if (!isSuperAdmin) return undefined;
    let active = true;
    const apply = (json) => {
      if (!active) return;
      setData(json);
      setEmails(json.internal.emails.join("\n"));
      setDomains(json.internal.domains.join("\n"));
    };
    if (getDashboardPreview()) {
      requestAnimationFrame(() => apply(PREVIEW));
      return () => {
        active = false;
      };
    }
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`settings ${res.status}`))))
      .then(apply)
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [isSuperAdmin]);

  async function save(key, value, done) {
    setBusy(key);
    setMessage(null);
    try {
      if (getDashboardPreview()) throw new Error("Not saved in the preview.");
      const res = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Couldn’t save.");
      done(json.value);
      setMessage({ tone: "ok", text: "Saved. Every server picks it up within 30 seconds." });
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setBusy(null);
    }
  }

  if (failed) {
    return (
      <div className={`${CARD} ${CARD_PAD} items-start gap-4`}>
        <p className="type-h3">We couldn’t load the settings.</p>
        <p className="type-body text-black/60">Check your connection and reload the page.</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
        {[0, 1].map((i) => (
          <SkeletonCard key={i} className="gap-3">
            <Bar type="type-h3" className="w-40" />
            <Bar type="type-body" className="w-[70%]" />
            <Bar type="type-body" className="w-[50%]" />
          </SkeletonCard>
        ))}
      </div>
    );
  }

  const { installLimit, internal } = data;
  const notice = message && (
    <p role="status" className={`type-small px-4 py-3 ring-1 ring-inset ${message.tone === "ok" ? "bg-primary/10 text-ink ring-primary/30" : "bg-danger-strong/10 text-danger-strong ring-danger-strong/30"}`}>
      {message.text}
    </p>
  );

  return (
    <div className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
      {notice}

      {/* install limits */}
      <section aria-labelledby="limits-h" className={`${CARD} ${CARD_PAD} gap-[calc(var(--cvw)*1.2)] max-lg:gap-4`}>
        <div className="flex flex-col gap-1">
          <h2 id="limits-h" className="type-h3">
            Install Limits
          </h2>
          <p className="type-small text-black/60">
            {installLimit.enforced
              ? "Applied: once someone uses today’s installs, the website, CLI and MCP refuse more until midnight UTC."
              : "Recording only: every install is counted against the limits, but nobody is refused."}{" "}
            {installLimit.source === "environment" ? "Set by the INSTALL_LIMIT_ENFORCE environment variable until you save it here." : "Set here."}
          </p>
        </div>

        <DetailRows
          rows={[
            ["Free", `${installLimit.limits.free} a day`],
            ["Pro", `${installLimit.limits.pro} a day`],
            ["Pro+", `${installLimit.limits.pro_plus} a day`],
          ]}
        />
        <p className="type-small text-black/60">The daily limits live in the plan settings in code (lib/plans.js): the pricing page and plan copy quote the same numbers, so they change together.</p>

        {asking ? (
          <div className="flex flex-col gap-3 bg-black/3 p-4 ring-1 ring-inset ring-black/10">
            <p className="type-small text-ink">
              {installLimit.enforced
                ? "Stop enforcing: installs are still counted, but nobody is refused."
                : "Start enforcing: anyone over today’s limit is refused on the website, the CLI and MCP until midnight UTC."}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() =>
                  save("install_limit_enforced", !installLimit.enforced, (value) => {
                    setData((current) => ({ ...current, installLimit: { ...current.installLimit, enforced: value, source: "setting" } }));
                    setAsking(false);
                  })
                }
                className={ACTION_PRIMARY}
              >
                {busy === "install_limit_enforced" ? "Saving…" : "Confirm"}
              </button>
              <TextButton tone="light" onClick={() => setAsking(false)}>
                Cancel
              </TextButton>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setAsking(true)} className={`${ACTION_LINE} w-fit`}>
            {installLimit.enforced ? "Stop Enforcing" : "Start Enforcing"}
          </button>
        )}
      </section>

      {/* internal accounts */}
      <section aria-labelledby="internal-h" className={`${CARD} ${CARD_PAD} gap-[calc(var(--cvw)*1.2)] max-lg:gap-4`}>
        <div className="flex flex-col gap-1">
          <h2 id="internal-h" className="type-h3">
            Internal Accounts
          </h2>
          <p className="type-small text-black/60">
            Team and test accounts, kept out of the customer numbers and shown under Internal. Admins, and accounts marked internal in their Manage drawer, count too.
          </p>
        </div>

        <DetailRows
          rows={[
            ["Always internal (in code)", [...internal.builtInDomains.map((domain) => `@${domain}`), ...internal.builtInEmails].join(", ") || "—"],
          ]}
        />

        <div className="grid grid-cols-2 gap-[calc(var(--cvw)*1.6)] max-lg:grid-cols-1 max-lg:gap-6">
          <label className="flex flex-col gap-2">
            <span className="type-label text-black/60">Emails, one per line</span>
            <textarea value={emails} onChange={(event) => setEmails(event.target.value)} placeholder="tester@example.com" className={FIELD} />
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => save("internal_emails", lines(emails), (value) => setEmails(value.join("\n")))}
              className={`${ACTION_LINE} w-fit`}
            >
              {busy === "internal_emails" ? "Saving…" : "Save Emails"}
            </button>
          </label>
          <label className="flex flex-col gap-2">
            <span className="type-label text-black/60">Domains, one per line</span>
            <textarea value={domains} onChange={(event) => setDomains(event.target.value)} placeholder="example.com" className={FIELD} />
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => save("internal_domains", lines(domains), (value) => setDomains(value.join("\n")))}
              className={`${ACTION_LINE} w-fit`}
            >
              {busy === "internal_domains" ? "Saving…" : "Save Domains"}
            </button>
          </label>
        </div>
      </section>
    </div>
  );
}
