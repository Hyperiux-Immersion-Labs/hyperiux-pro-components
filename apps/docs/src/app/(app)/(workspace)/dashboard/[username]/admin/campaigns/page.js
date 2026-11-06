"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, FlaskConical, LoaderCircle, Send } from "lucide-react";
import { ACTION_LINE, ACTION_PRIMARY, CARD, CARD_PAD, FIELD, FIELD_LABEL, TextButton } from "@/components/Dashboard/DashboardUI";
import { Bar, SkeletonCard } from "@/components/Dashboard/DashboardSkeletons";
import { useDashboard } from "@/components/Dashboard/DashboardContext";
import { buttonId } from "@/lib/button-id";

// One-off marketing emails (lib/emails/campaigns), owner only: preview one, test it on
// the internal team, then send it to every signed-up account that hasn't opted out. The
// real send runs as a series of requests from this page, one chunk each, and stops if
// the page is closed; sending again picks up where it stopped (no one gets it twice).

const number = (n) => new Intl.NumberFormat("en").format(n || 0);
const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : null;

async function post(body) {
  const res = await fetch("/api/admin/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "The request failed.");
  return json;
}

function Stat({ label, value, note, danger = false }) {
  return (
    <div className="flex flex-1 flex-col gap-1 bg-light px-4 py-3 ring-1 ring-inset ring-black/10">
      <p className="type-label text-black/60">{label}</p>
      <p className={`type-h3 tabular-nums ${danger ? "text-danger-strong" : ""}`}>{number(value)}</p>
      {note && <p className="type-small text-black/60">{note}</p>}
    </div>
  );
}

function Message({ tone = "info", children }) {
  const tones = { info: "bg-black/5 text-ink", success: "bg-success-strong/10 text-ink", error: "bg-danger-strong/10 text-danger-strong" };
  return <div className={`type-small px-4 py-3 ${tones[tone]}`}>{children}</div>;
}

function Preview({ campaignId }) {
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/campaigns?preview=${encodeURIComponent(campaignId)}`)
      .then((res) => res.json())
      .then((json) => active && (json.html ? setHtml(json.html) : setError(json.error || "Couldn’t render the email.")))
      .catch(() => active && setError("Couldn’t render the email."));
    return () => {
      active = false;
    };
  }, [campaignId]);

  if (error) return <Message tone="error">{error}</Message>;
  if (!html) return <Bar className="h-[60svh] w-full" />;
  return <iframe srcDoc={html} sandbox="allow-popups" title="Email preview" className="block h-[70svh] w-full border-0 bg-white ring-1 ring-inset ring-black/10" />;
}

function CampaignCard({ campaign, internal, onChanged }) {
  const [showPreview, setShowPreview] = useState(false);
  const [testList, setTestList] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [run, setRun] = useState(null);
  const stopRef = useRef(false);
  const sending = run?.state === "sending";
  const tested = campaign.tested > 0;
  const id = (action) => buttonId("admin-campaigns", campaign.id, action);

  async function sendTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const emails = testList.split(/[\s,;]+/).map((email) => email.trim()).filter(Boolean);
      const result = await post({ campaignId: campaign.id, mode: "test", ...(emails.length ? { emails } : {}) });
      setTestResult({ ok: result.failed.length === 0, sent: result.sent, failed: result.failed });
      onChanged();
    } catch (error) {
      setTestResult({ ok: false, error: error.message });
    } finally {
      setTesting(false);
    }
  }

  async function sendAll() {
    setConfirming(false);
    setConfirmText("");
    stopRef.current = false;
    const total = campaign.remaining;
    let sent = 0;
    const failures = new Map();
    setRun({ state: "sending", sent, total, failures: [] });

    try {
      for (let first = true; ; first = false) {
        if (stopRef.current) {
          setRun({ state: "stopped", sent, total, failures: [...failures.values()] });
          break;
        }
        const result = await post({ campaignId: campaign.id, mode: "send", confirm: campaign.id, first });
        sent += result.sent.length;
        for (const failure of result.failed) failures.set(failure.email, failure);
        for (const email of result.sent) failures.delete(email);
        const done = result.remaining === 0 || result.sent.length === 0 || result.logFailed;
        setRun({ state: done ? "done" : "sending", sent, total, failures: [...failures.values()], remaining: result.remaining, logFailed: result.logFailed });
        if (done) break;
      }
    } catch (error) {
      setRun({ state: "error", sent, total, failures: [...failures.values()], error: error.message });
    }
    onChanged();
  }

  return (
    <section aria-labelledby={`campaign-${campaign.id}`} className={`${CARD} ${CARD_PAD} gap-[calc(var(--cvw)*1.2)] max-lg:gap-5`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={`campaign-${campaign.id}`} className="type-h3">
            {campaign.name}
          </h2>
          <p className="type-body text-black/60">{campaign.subject}</p>
        </div>
        <button type="button" id={id("preview")} onClick={() => setShowPreview((v) => !v)} className={ACTION_LINE}>
          {showPreview ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {showPreview ? "Hide preview" : "Preview"}
        </button>
      </div>

      {showPreview && <Preview campaignId={campaign.id} />}

      <div className="flex gap-3 max-md:grid max-md:grid-cols-2">
        <Stat label="Signed-up accounts" value={campaign.accounts} />
        <Stat label="Opted out" value={campaign.optedOut} note="Product updates off" />
        <Stat label="Sent" value={campaign.sent} note={formatDate(campaign.lastSent) && `Last ${formatDate(campaign.lastSent)}`} />
        <Stat label="Still to send" value={campaign.remaining} />
      </div>
      {campaign.failed > 0 && <Message tone="error">{number(campaign.failed)} sends failed. They’re retried the next time you send; see the reasons in the Email Log.</Message>}

      <div className="h-px w-full bg-black/10" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="type-label text-ink">1. Test with the internal team</h3>
          <p className="type-small text-black/60">
            Sent with “[Test]” in the subject. Goes to the {number(internal.length)} internal team {internal.length === 1 ? "account" : "accounts"}
            {internal.length ? `: ${internal.join(", ")}` : ""}, or to the addresses below instead.
            {tested && ` Tested ${number(campaign.tested)} ${campaign.tested === 1 ? "time" : "times"}, last ${formatDate(campaign.lastTest)}.`}
          </p>
        </div>
        <label className={FIELD_LABEL}>
          Send the test to these addresses instead (optional)
          <textarea value={testList} onChange={(event) => setTestList(event.target.value)} rows={2} placeholder="name@hyperiux.com, other@hyperiux.com" className={`${FIELD} resize-y`} />
        </label>
        <button type="button" id={id("send-test")} onClick={sendTest} disabled={testing || sending} className={ACTION_LINE}>
          {testing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <FlaskConical aria-hidden="true" />}
          {testing ? "Sending test…" : "Send test"}
        </button>
        {testResult?.error && <Message tone="error">{testResult.error}</Message>}
        {testResult && !testResult.error && (
          <Message tone={testResult.ok ? "success" : "error"}>
            {testResult.sent.length > 0 && `Test sent to ${testResult.sent.join(", ")}. Check it in Gmail and Outlook, on desktop and phone, before sending to everyone.`}
            {testResult.failed.length > 0 && ` Failed: ${testResult.failed.map((f) => `${f.email} (${f.error})`).join(", ")}`}
          </Message>
        )}
      </div>

      <div className="h-px w-full bg-black/10" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="type-label text-ink">2. Send to all users</h3>
          <p className="type-small text-black/60">
            Every signed-up account except suspended ones and anyone with product updates turned off. Each email has an unsubscribe link. Anyone who already has it is skipped.
          </p>
        </div>

        {!tested ? (
          <Message>Send a test first. Sending to everyone unlocks once a test has gone out.</Message>
        ) : campaign.remaining === 0 && !run ? (
          <Message tone="success">Everyone has this email.</Message>
        ) : (
          !sending &&
          !confirming && (
            <button type="button" id={id("send-all")} onClick={() => setConfirming(true)} className={ACTION_PRIMARY}>
              <Send aria-hidden="true" />
              {campaign.sent > 0 ? `Send to the remaining ${number(campaign.remaining)}` : `Send to ${number(campaign.remaining)} users`}
            </button>
          )
        )}

        {confirming && (
          <div className="flex flex-col gap-3 bg-light p-4 ring-1 ring-inset ring-black/10">
            <p className="type-small text-ink">
              This emails “{campaign.subject}” to {number(campaign.remaining)} people. It can’t be undone. Type <strong className="font-mono">{campaign.id}</strong> to confirm.
            </p>
            <input value={confirmText} onChange={(event) => setConfirmText(event.target.value)} aria-label="Campaign id" autoComplete="off" className={FIELD} />
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" id={id("confirm-send-all")} onClick={sendAll} disabled={confirmText.trim() !== campaign.id} className={ACTION_PRIMARY}>
                <Send aria-hidden="true" />
                Send now
              </button>
              <TextButton id={id("cancel-send-all")} tone="light" onClick={() => setConfirming(false)}>
                Cancel
              </TextButton>
            </div>
          </div>
        )}

        {run && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <p className="type-small text-ink">
                {run.state === "sending" && `Sending… ${number(run.sent)} of ${number(run.total)}. Keep this page open.`}
                {run.state === "done" && `Done: sent to ${number(run.sent)}.`}
                {run.state === "stopped" && `Stopped after ${number(run.sent)}. Send again to continue.`}
                {run.state === "error" && `Stopped after ${number(run.sent)}: ${run.error}`}
              </p>
              {sending && (
                <TextButton id={id("stop")} tone="light" onClick={() => (stopRef.current = true)}>
                  Stop
                </TextButton>
              )}
            </div>
            <div className="h-1.5 w-full bg-black/10">
              <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${run.total ? Math.min(100, (run.sent / run.total) * 100) : 100}%` }} />
            </div>
            {run.logFailed && <Message tone="error">Emails went out but couldn’t be logged, so the send stopped to avoid sending twice. Check the Email Log before sending again.</Message>}
            {run.failures.length > 0 && (
              <Message tone="error">
                {number(run.failures.length)} couldn’t be sent: {run.failures.slice(0, 5).map((f) => `${f.email} (${f.error})`).join(", ")}
                {run.failures.length > 5 ? "…" : ""}
              </Message>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default function AdminCampaignsPage() {
  // Owner only; the API checks it again
  const { path, isSuperAdmin: owner, accessLoaded } = useDashboard();
  const router = useRouter();
  useEffect(() => {
    if (accessLoaded && !owner) router.replace(path("admin/users"));
  }, [accessLoaded, owner, router, path]);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/campaigns");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn’t load campaigns.");
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (!owner) return;
    // Loads from the API once access is known - an external-system sync
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [owner, load]);

  return (
    <div className="flex flex-col gap-[calc(var(--cvw)*0.8)] max-lg:gap-3">
      {error && <Message tone="error">{error}</Message>}
      {!data && !error ? (
        <SkeletonCard className="gap-4">
          <Bar type="type-h3" className="w-40" />
          <Bar type="type-body" className="w-[50%]" />
          <Bar className="h-20 w-full" />
          <Bar className="h-32 w-full" />
        </SkeletonCard>
      ) : (
        data?.campaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} internal={data.internal} onChanged={load} />)
      )}
    </div>
  );
}
