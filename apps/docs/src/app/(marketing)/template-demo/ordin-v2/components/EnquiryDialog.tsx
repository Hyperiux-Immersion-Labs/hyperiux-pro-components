// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { HX_DARK } from "./hxPalette";
import Icon from "./Icon";
import { Dialog, DialogContent, DialogDescription, DialogTheme, DialogTitle } from "./effects/animated-dialog";

gsap.registerPlugin(useGSAP);

const TOPICS = [
  { id: "demo", label: "Book a demo" },
  { id: "sales", label: "Pricing and plans" },
  { id: "security", label: "Security review" },
  { id: "other", label: "Something else" },
];

const SIZES = ["1-10", "11-50", "51-200", "201-1,000", "1,000+"];

const FIELD =
  "w-full border-b border-(--ord-bone)/20 bg-transparent py-[1.2vh] text-24 text-ord-bone outline-none transition-colors duration-300 placeholder:text-ord-stone/60 focus:border-(--ord-primary-light)";

// The enquiry form, in the Hyperiux Animated Dialog. Any link to #enquire, #enquire-sales or
// #enquire-security opens it, growing out of the link that was clicked, on the matching topic.
// It has no backend: replace the setTimeout in onSubmit with a fetch to your CRM or email service.
const EnquiryDialog = () => {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<{ x: number; y: number } | null>(null);
  const [topic, setTopic] = useState("demo");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const body = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  // Rendered inside the page root so the template's scoped type and colours apply
  const host = useSyncExternalStore(
    () => () => {},
    () => document.querySelector<HTMLElement>(".ord-page"),
    () => null,
  );

  // Capture phase, so the page transition never treats the link as a navigation
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#enquire"]');
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();
      const r = link.getBoundingClientRect();
      setFrom({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      setTopic(link.getAttribute("href")?.split("-")[1] ?? "demo");
      setState("idle");
      setErrors({});
      setOpen(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  useGSAP(
    () => {
      if (state !== "sent" || prefersReducedMotion()) return;
      gsap.from("[data-eq-done] > *", { opacity: 0, y: 16, duration: 0.8, stagger: 0.07, ease: "expo.out" });
    },
    { scope: body, dependencies: [state] },
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!String(data.get("name") ?? "").trim()) next.name = "Tell us your name.";
    if (!/^\S+@\S+\.\S+$/.test(String(data.get("email") ?? ""))) next.email = "Use a work email we can reply to.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("sending");
    window.setTimeout(() => setState("sent"), 1400);
  };

  return (
    <DialogTheme palette={HX_DARK}>
      <Dialog open={open} onOpenChange={setOpen} openFrom={from} rounded="none" backdrop="blur" rollingText>
        <DialogContent
          container={host}
          className="z-[70] max-h-[90svh] w-[44vw] max-w-none! gap-0! overflow-y-auto border border-(--ord-bone)/12 bg-(--ord-ink)! p-0! ring-0! max-lg:w-[80vw] max-md:w-[92vw]"
        >
          <div ref={body} className="flex flex-col gap-[3.2vh] px-[2.4vw] py-[4vh] max-lg:px-[4vw] max-md:px-[5vw]">
            {state === "sent" ? (
              <div data-eq-done aria-live="polite" className="flex flex-col items-start gap-5 py-[4vh]">
                <span className="flex h-[5vh] aspect-square items-center justify-center bg-(--ord-primary) text-ord-ink">
                  <Icon name="check" className="h-[60%] aspect-square" />
                </span>
                <DialogTitle className="text-64 font-normal">Message settled.</DialogTitle>
                <DialogDescription className="text-24 text-ord-ash">
                  An engineer will reply within one business day. Your request is on the record as run 0001.
                </DialogDescription>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="border-b border-(--ord-primary-light)/40 pb-1 ord-label text-14 uppercase text-ord-primary-light hover:border-(--ord-primary-light)"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 pr-[3vw]">
                  <DialogTitle className="text-40 font-normal">
                    Hand us the <span className="text-ord-primary-light">hardest job first.</span>
                  </DialogTitle>
                  <DialogDescription className="text-24 text-ord-ash">
                    An engineer, not a sales script, replies within one business day.
                  </DialogDescription>
                </div>
                <form noValidate onSubmit={onSubmit} className="flex flex-col gap-[3vh]">
                  <fieldset className="flex flex-wrap gap-2">
                    <legend className="sr-only">What can we help with?</legend>
                    {TOPICS.map((t) => (
                      <label key={t.id} className="cursor-pointer">
                        <input type="radio" name="topic" value={t.id} checked={topic === t.id} onChange={() => setTopic(t.id)} className="peer sr-only" />
                        <span className="block rounded-xs border border-(--ord-bone)/20 px-[0.9vw] py-[0.8vh] text-22 text-ord-ash transition-colors duration-300 peer-checked:border-(--ord-primary-light) peer-checked:bg-(--ord-primary)/15 peer-checked:text-ord-bone peer-focus-visible:outline-2 peer-focus-visible:outline-(--ord-primary-light) max-lg:px-[2.4vw] max-md:px-[4vw]">
                          {t.label}
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="grid grid-cols-2 gap-x-[2vw] gap-y-[3vh] max-md:grid-cols-1">
                    {[
                      { id: "name", label: "Name", type: "text", auto: "name", placeholder: "Priya Raman" },
                      { id: "email", label: "Work email", type: "email", auto: "email", placeholder: "priya@company.com" },
                      { id: "company", label: "Company", type: "text", auto: "organization", placeholder: "Kestrel" },
                    ].map((f) => (
                      <label key={f.id} className="flex flex-col gap-1">
                        <span className="ord-label text-14 uppercase text-ord-stone">{f.label}</span>
                        <input
                          name={f.id}
                          type={f.type}
                          autoComplete={f.auto}
                          placeholder={f.placeholder}
                          aria-invalid={errors[f.id] ? true : undefined}
                          aria-describedby={errors[f.id] ? `eq-${f.id}-error` : undefined}
                          className={FIELD}
                        />
                        {errors[f.id] && (
                          <span id={`eq-${f.id}-error`} className="text-22 text-ord-primary-light">
                            {errors[f.id]}
                          </span>
                        )}
                      </label>
                    ))}
                    <label className="flex flex-col gap-1">
                      <span className="ord-label text-14 uppercase text-ord-stone">Team size</span>
                      <select name="size" defaultValue={SIZES[1]} className={`${FIELD} cursor-pointer appearance-none [&>option]:bg-(--ord-ink)`}>
                        {SIZES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="ord-label text-14 uppercase text-ord-stone">What would you hand to an agent first?</span>
                    <textarea name="message" rows={2} placeholder="Reconcile invoices, triage support, chase renewals..." className={`${FIELD} resize-none`} />
                  </label>
                  <div className="flex items-center justify-between gap-6 max-md:flex-col max-md:items-start">
                    <span className="text-22 text-ord-stone">No newsletter unless you ask.</span>
                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className="group inline-flex h-[5.6vh] items-center gap-6 rounded-xs bg-(--ord-primary) px-[1.4vw] text-22 text-ord-ink transition-colors duration-500 hover:bg-(--ord-primary-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--ord-primary-light) disabled:opacity-70 max-lg:h-[4.2vh] max-lg:px-[2.6vw] max-md:h-[6vh] max-md:px-[5vw]"
                    >
                      {state === "sending" ? "Sending..." : "Send message"}
                      <Icon name="arrow" className="h-[1.4vh] aspect-square transition-transform duration-500 group-hover:translate-x-[0.2vw]" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DialogTheme>
  );
};

export default EnquiryDialog;
