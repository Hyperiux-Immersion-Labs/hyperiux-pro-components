"use client";

import { useEffect, useState } from "react";
import { DetailRows } from "@/components/Dashboard/DashboardUI";
import { Confirm, LINE_BUTTON, PANEL_CARD, timeAgo } from "@/components/admin/drawerUI";
import { FilterMenu } from "@/app/(app)/(workspace)/effects/FilterMenu";
import { TEMPLATES } from "@/lib/mock-templates";
import { getDashboardPreview, sampleAdminSupport } from "@/lib/dev/dashboardPreview";

// The Manage drawer's Support section (super admins): template credits, giving a template,
// extra installs for today, and private notes on the account. Every change asks first and
// lands in the admin audit log (History); notes live there too.

const FIELD = "type-body bg-foreground/5 px-3 py-2 text-foreground ring-1 ring-inset ring-foreground/20 outline-none placeholder:text-foreground/40 focus:ring-primary";
const TEMPLATE_TITLES = Object.fromEntries(TEMPLATES.map((template) => [template.slug, template.title]));

/** `post(url, body)` posts as the drawer does (throws the API's error); `onChanged()` refreshes History. */
export function SupportSection({ user, post, onChanged, onBusyChange }) {
  const [data, setData] = useState(null);
  const [notes, setNotes] = useState(null);
  const [reload, setReload] = useState(0);
  // null | "credits" | "template" | "installs"
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [creditDelta, setCreditDelta] = useState("1");
  const [creditReason, setCreditReason] = useState("");
  const [templateSlug, setTemplateSlug] = useState("");
  const [templateReason, setTemplateReason] = useState("");
  const [extra, setExtra] = useState("3");
  const [note, setNote] = useState("");

  useEffect(() => {
    let active = true;
    if (getDashboardPreview()) {
      const sample = sampleAdminSupport();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(sample.support);
      setNotes(sample.notes);
      return undefined;
    }
    const get = (url) => fetch(url, { cache: "no-store" }).then((res) => (res.ok ? res.json() : Promise.reject(new Error("load"))));
    Promise.all([
      get(`/api/admin/users/support?clerkUserId=${encodeURIComponent(user.id)}`),
      get(`/api/admin/audit?userId=${encodeURIComponent(user.id)}&action=note.add&limit=10`),
    ])
      .then(([support, log]) => {
        if (!active) return;
        setData(support);
        setNotes(log.entries || []);
      })
      .catch(() => active && setError("Couldn’t load support details."));
    return () => {
      active = false;
    };
  }, [user.id, reload]);

  // The drawer stays open while a change is in flight
  useEffect(() => {
    onBusyChange?.(busy !== null);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);

  async function run(kind, work) {
    setBusy(kind);
    setError("");
    setNotice("");
    try {
      setNotice(await work());
      setPending(null);
      setReload((n) => n + 1);
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  const delta = parseInt(creditDelta, 10);
  const deltaValid = Number.isInteger(delta) && delta !== 0 && Math.abs(delta) <= 20 && (data ? data.credits + delta >= 0 : false);
  const extraCount = parseInt(extra, 10);
  // Added to any extra already given today; the route stores the day's total (at most 20)
  const extraTotal = (data?.extraToday || 0) + extraCount;
  const extraValid = Number.isInteger(extraCount) && extraCount >= 1 && extraTotal <= 20;
  const giveable = TEMPLATES.filter((template) => !data?.templates.includes(template.slug));
  // The picked template, or the first one they don't own yet
  const chosen = giveable.some((template) => template.slug === templateSlug) ? templateSlug : giveable[0]?.slug || "";
  const name = user.name || user.email;

  return (
    <section aria-labelledby="manage-support-h" className={`${PANEL_CARD} gap-(--cvw) max-lg:gap-4`}>
      <h3 id="manage-support-h" className="type-h3">
        Support
      </h3>

      {error && (
        <p role="alert" className="type-small bg-danger/15 px-4 py-3 text-danger">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="type-small bg-primary/15 px-4 py-3 text-foreground">
          {notice}
        </p>
      )}

      {!data ? (
        <p className="type-small text-foreground/80">Loading…</p>
      ) : (
        <>
          <DetailRows
            tone="dark"
            rows={[
              ["Template credits", data.credits],
              ["Templates owned", data.templates.length ? data.templates.map((slug) => TEMPLATE_TITLES[slug] || slug).join(", ") : "None"],
              [
                "Installs today",
                data.limit == null ? `${data.installsToday} (not limited)` : `${data.installsToday} of ${data.limit}${data.extraToday ? ` (${data.extraToday} extra today)` : ""}`,
              ],
            ]}
          />

          {/* credits */}
          <div className="flex flex-col gap-3">
            <p className="type-label text-foreground/80">Template credits</p>
            {pending === "credits" ? (
              <Confirm
                lines={[{ text: `${delta > 0 ? `Add ${delta}` : `Remove ${-delta}`} credit${Math.abs(delta) === 1 ? "" : "s"}: ${name} will have ${data.credits + delta}.` }, { text: `Reason (logged): ${creditReason.trim()}` }]}
                busy={busy === "credits"}
                onCancel={() => setPending(null)}
                onConfirm={() =>
                  run("credits", async () => {
                    const json = await post("/api/admin/users/credits", { clerkUserId: user.id, delta, reason: creditReason });
                    setCreditReason("");
                    return `Done. They have ${json.credits} credit${json.credits === 1 ? "" : "s"} now.`;
                  })
                }
              />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <input type="number" step="1" min="-20" max="20" value={creditDelta} onChange={(event) => setCreditDelta(event.target.value)} aria-label="Credits to add (negative to remove)" className={`${FIELD} w-24`} />
                <input value={creditReason} onChange={(event) => setCreditReason(event.target.value)} placeholder="Reason" aria-label="Reason for the credit change" className={`${FIELD} min-w-0 flex-1`} />
                <button type="button" disabled={!deltaValid || !creditReason.trim()} onClick={() => setPending("credits")} className={LINE_BUTTON}>
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* give a template */}
          <div className="flex flex-col gap-3">
            <p className="type-label text-foreground/80">Give a template</p>
            {giveable.length === 0 ? (
              <p className="type-small text-foreground/80">They own every template.</p>
            ) : pending === "template" ? (
              <Confirm
                lines={[{ text: `Give ${name} ${TEMPLATE_TITLES[chosen]}, free: the source and Figma file unlock now.` }, { text: `Reason (logged): ${templateReason.trim()}` }]}
                busy={busy === "template"}
                onCancel={() => setPending(null)}
                onConfirm={() =>
                  run("template", async () => {
                    await post("/api/admin/users/give-template", { clerkUserId: user.id, templateSlug: chosen, reason: templateReason });
                    setTemplateReason("");
                    const given = TEMPLATE_TITLES[chosen];
                    setTemplateSlug("");
                    return `${given} is theirs now.`;
                  })
                }
              />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <FilterMenu
                  variant="label"
                  label="Template"
                  options={giveable.map((template) => template.slug)}
                  categoryFilter={chosen}
                  activeFilter={null}
                  getLabel={(slug) => TEMPLATE_TITLES[slug]}
                  onSelect={setTemplateSlug}
                />
                <input value={templateReason} onChange={(event) => setTemplateReason(event.target.value)} placeholder="Reason" aria-label="Reason for giving the template" className={`${FIELD} min-w-0 flex-1`} />
                <button type="button" disabled={!chosen || !templateReason.trim()} onClick={() => setPending("template")} className={LINE_BUTTON}>
                  Give
                </button>
              </div>
            )}
          </div>

          {/* extra installs today */}
          {data.limit != null && (
            <div className="flex flex-col gap-3">
              <p className="type-label text-foreground/80">Extra installs today</p>
              {pending === "installs" ? (
                <Confirm
                  lines={[{ text: `Allow ${name} ${extraCount} more install${extraCount === 1 ? "" : "s"} today${data.extraToday ? ` (${extraTotal} extra in all)` : ""}, until midnight UTC. Their history doesn’t change.` }]}
                  busy={busy === "installs"}
                  onCancel={() => setPending(null)}
                  onConfirm={() =>
                    run("installs", async () => {
                      await post("/api/admin/users/install-bonus", { clerkUserId: user.id, extra: extraTotal });
                      return `Done: ${extraTotal} extra today.`;
                    })
                  }
                />
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <input type="number" step="1" min="1" max={20 - (data.extraToday || 0)} value={extra} onChange={(event) => setExtra(event.target.value)} aria-label="Extra installs for today" className={`${FIELD} w-24`} />
                  <button type="button" disabled={!extraValid} onClick={() => setPending("installs")} className={LINE_BUTTON}>
                    Allow
                  </button>
                  {data.extraToday > 0 && (
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() =>
                        run("installs", async () => {
                          await post("/api/admin/users/install-bonus", { clerkUserId: user.id, extra: 0 });
                          return "Today’s extra installs removed.";
                        })
                      }
                      className="type-small cursor-pointer text-foreground/80 underline underline-offset-3 hover:text-primary"
                    >
                      Remove today’s extra
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* notes */}
          <div className="flex flex-col gap-3">
            <p className="type-label text-foreground/80">Notes (team only)</p>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Anything the team should know about this account" aria-label="New note" className={`${FIELD} resize-y`} />
            <button
              type="button"
              disabled={!note.trim() || busy !== null}
              onClick={() =>
                run("note", async () => {
                  await post("/api/admin/users/notes", { clerkUserId: user.id, body: note });
                  setNote("");
                  return "Note saved.";
                })
              }
              className={LINE_BUTTON}
            >
              Save note
            </button>
            {notes?.length > 0 && (
              <ul className="flex flex-col">
                {notes.map((entry) => (
                  <li key={entry.id} className="flex flex-col gap-0.5 border-t border-foreground/10 py-2.5 first:border-t-0">
                    <p className="type-body whitespace-pre-wrap">{entry.details?.body}</p>
                    <p className="type-small text-foreground/60">
                      {entry.actorEmail || "An admin"} · {timeAgo(entry.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
