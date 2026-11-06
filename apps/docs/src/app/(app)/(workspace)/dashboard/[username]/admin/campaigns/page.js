"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Eye, EyeOff, FlaskConical, LoaderCircle, Send, Users } from "lucide-react";
import { ACTION_LINE, ACTION_PRIMARY, CARD, CARD_PAD, FIELD, FIELD_LABEL, TextButton } from "@/components/Dashboard/DashboardUI";
import { Bar, SkeletonCard } from "@/components/Dashboard/DashboardSkeletons";
import { useDashboard } from "@/components/Dashboard/DashboardContext";
import { buttonId } from "@/lib/button-id";

// One-off marketing emails (lib/emails/campaigns), owner only. Every signed-up account
// is synced into the Resend "Product Updates" segment; a campaign is tested on the
// internal team, then sent once as a Resend Broadcast to that segment, which skips
// anyone who turned product updates off (app/api/admin/campaigns).

const number = (n) => new Intl.NumberFormat("en").format(n || 0);
const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : null;

async function post(body) {
  const res = await fetch("/api/admin/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "The request failed.");
  return json;
}

function Stat({ label, value, note }) {
  return (
    <div className="flex flex-1 flex-col gap-1 bg-light px-4 py-3 ring-1 ring-inset ring-black/10">
      <p className="type-label text-black/60">{label}</p>
      <p className="type-h3 tabular-nums">{number(value)}</p>
      {note && <p className="type-small text-black/60">{note}</p>}
    </div>
  );
}

function Message({ tone = "info", children }) {
  const tones = { info: "bg-black/5 text-ink", success: "bg-success-strong/10 text-ink", error: "bg-danger-strong/10 text-danger-strong" };
  return <div className={`type-small px-4 py-3 ${tones[tone]}`}>{children}</div>;
}

function Step({ title, note, children }) {
  return (
    <>
      <div className="h-px w-full bg-black/10" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="type-label text-ink">{title}</h3>
          <p className="type-small text-black/60">{note}</p>
        </div>
        {children}
      </div>
    </>
  );
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

// Product Updates against the signed-up accounts, and the sync that fills it
function SegmentCard({ segment, onChanged }) {
  const [run, setRun] = useState(null);
  const stopRef = useRef(false);
  const syncing = run?.state === "syncing";

  async function sync() {
    stopRef.current = false;
    const total = segment.pending;
    let pending = total;
    setRun({ state: "syncing", pending, total, failed: [] });
    try {
      for (;;) {
        if (stopRef.current) {
          setRun({ state: "stopped", pending, total, failed: [] });
          break;
        }
        const result = await post({ mode: "sync" });
        const stuck = result.failed.length > 0 && result.pending >= pending;
        pending = result.pending;
        const done = pending === 0 || stuck;
        setRun({ state: done ? (stuck ? "stuck" : "done") : "syncing", pending, total, failed: result.failed });
        if (done) break;
      }
    } catch (error) {
      setRun({ state: "error", pending, total, failed: [], error: error.message });
    }
    onChanged();
  }

  return (
    <section aria-labelledby="campaigns-segment" className={`${CARD} ${CARD_PAD} gap-[calc(var(--cvw)*1.2)] max-lg:gap-5`}>
      <div className="flex flex-col gap-1">
        <h2 id="campaigns-segment" className="type-h3">
          Product Updates segment
        </h2>
        <p className="type-body text-black/60">Campaigns go to this Resend segment. Every signed-up account belongs in it, internal team included.</p>
      </div>
      <div className="flex gap-3 max-md:grid max-md:grid-cols-2">
        <Stat label="Signed-up accounts" value={segment.accounts} note="Not suspended" />
        <Stat label="In Product Updates" value={segment.accountsInSegment} />
        <Stat label="Opted out" value={segment.optedOut} note="Product updates off" />
        <Stat label="A campaign reaches" value={segment.reach} note="Subscribed in the segment" />
      </div>

      {segment.pending === 0 && !run ? (
        <Message tone="success">Every signed-up account is in Product Updates.</Message>
      ) : (
        !syncing &&
        segment.pending > 0 && (
          <button type="button" id="admin-campaigns-sync-segment" onClick={sync} className={ACTION_PRIMARY}>
            <Users aria-hidden="true" />
            Add {number(segment.pending)} {segment.pending === 1 ? "account" : "accounts"} to Product Updates
          </button>
        )
      )}

      {run && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <p className="type-small text-ink">
              {run.state === "syncing" && `Adding… ${number(run.total - run.pending)} of ${number(run.total)}. About a second each, at Resend’s rate limit. Keep this page open.`}
              {run.state === "done" && `Done: ${number(run.total)} added.`}
              {run.state === "stopped" && `Stopped with ${number(run.pending)} left. Add again to continue.`}
              {run.state === "stuck" && `${number(run.pending)} couldn’t be added.`}
              {run.state === "error" && `Stopped with ${number(run.pending)} left: ${run.error}`}
            </p>
            {syncing && (
              <TextButton id="admin-campaigns-stop-sync" tone="light" onClick={() => (stopRef.current = true)}>
                Stop
              </TextButton>
            )}
          </div>
          <div className="h-1.5 w-full bg-black/10">
            <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${run.total ? ((run.total - run.pending) / run.total) * 100 : 100}%` }} />
          </div>
          {run.failed.length > 0 && (
            <Message tone="error">
              {run.failed.slice(0, 5).map((f) => `${f.email} (${f.error})`).join(", ")}
              {run.failed.length > 5 ? "…" : ""}
            </Message>
          )}
        </div>
      )}
    </section>
  );
}

function CampaignCard({ campaign, internal, segment, onChanged }) {
  const [showPreview, setShowPreview] = useState(false);
  const [testList, setTestList] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const tested = campaign.tested > 0;
  const broadcast = campaign.broadcast && campaign.broadcast.status !== "draft" ? campaign.broadcast : null;
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

  async function send() {
    setSending(true);
    setSendError(null);
    try {
      await post({ campaignId: campaign.id, mode: "send", confirm: campaign.id });
      setConfirming(false);
      setConfirmText("");
      onChanged();
    } catch (error) {
      setSendError(error.message);
    } finally {
      setSending(false);
    }
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

      <Step
        title="1. Test with the internal team"
        note={`Sent with “[Test]” in the subject, to the ${number(internal.length)} internal team ${internal.length === 1 ? "account" : "accounts"}${internal.length ? ` (${internal.join(", ")})` : ""} or to the addresses below. Tests count toward Resend’s 100 emails a day.${tested ? ` Tested ${number(campaign.tested)} ${campaign.tested === 1 ? "time" : "times"}, last ${formatDate(campaign.lastTest)}.` : ""}`}
      >
        <label className={FIELD_LABEL}>
          Send the test to these addresses instead (optional)
          <textarea value={testList} onChange={(event) => setTestList(event.target.value)} rows={2} placeholder="name@hyperiux.com, other@hyperiux.com" className={`${FIELD} resize-y`} />
        </label>
        <button type="button" id={id("send-test")} onClick={sendTest} disabled={testing} className={ACTION_LINE}>
          {testing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <FlaskConical aria-hidden="true" />}
          {testing ? "Sending test…" : "Send test"}
        </button>
        {testResult?.error && <Message tone="error">{testResult.error}</Message>}
        {testResult && !testResult.error && (
          <Message tone={testResult.ok ? "success" : "error"}>
            {testResult.sent.length > 0 && `Test sent to ${testResult.sent.join(", ")}. Check it on desktop and phone before sending to everyone.`}
            {testResult.failed.length > 0 && ` Failed: ${testResult.failed.map((f) => `${f.email} (${f.error})`).join(", ")}`}
          </Message>
        )}
      </Step>

      <Step
        title="2. Send to everyone in Product Updates"
        note="One Resend Broadcast to the segment: outside the 100 a day, and Resend skips anyone who has unsubscribed. Each email has Resend’s unsubscribe link and greets people by first name."
      >
        {broadcast ? (
          <Message tone="success">
            {broadcast.status === "queued" ? "Queued in Resend" : "Sent"}
            {formatDate(broadcast.sent_at || broadcast.created_at) ? ` ${formatDate(broadcast.sent_at || broadcast.created_at)}` : ""}.{" "}
            <a href={`https://resend.com/broadcasts/${broadcast.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
              Delivery and opens in Resend
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </Message>
        ) : !tested ? (
          <Message>Send a test first. Sending to everyone unlocks once a test has gone out.</Message>
        ) : segment.pending > 0 ? (
          <Message>Add the {number(segment.pending)} remaining accounts to Product Updates (above) first, so no one is left out.</Message>
        ) : (
          !confirming && (
            <button type="button" id={id("send-all")} onClick={() => setConfirming(true)} className={ACTION_PRIMARY}>
              <Send aria-hidden="true" />
              Send to {number(segment.reach)} people
            </button>
          )
        )}

        {confirming && !broadcast && (
          <div className="flex flex-col gap-3 bg-light p-4 ring-1 ring-inset ring-black/10">
            <p className="type-small text-ink">
              This emails “{campaign.subject}” to {number(segment.reach)} people, once. It can’t be undone. Type <strong className="font-mono">{campaign.id}</strong> to confirm.
            </p>
            <input value={confirmText} onChange={(event) => setConfirmText(event.target.value)} aria-label="Campaign id" autoComplete="off" className={FIELD} />
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" id={id("confirm-send-all")} onClick={send} disabled={sending || confirmText.trim() !== campaign.id} className={ACTION_PRIMARY}>
                {sending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
                {sending ? "Sending…" : "Send now"}
              </button>
              <TextButton id={id("cancel-send-all")} tone="light" onClick={() => setConfirming(false)} disabled={sending}>
                Cancel
              </TextButton>
            </div>
          </div>
        )}
        {sendError && <Message tone="error">{sendError}</Message>}
      </Step>
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
        data && (
          <>
            <SegmentCard segment={data.segment} onChanged={load} />
            {data.campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} internal={data.internal} segment={data.segment} onChanged={load} />
            ))}
          </>
        )
      )}
    </div>
  );
}
