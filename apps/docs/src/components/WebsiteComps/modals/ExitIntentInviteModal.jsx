"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { useReCaptcha } from "next-recaptcha-v3";
import { Mail } from "lucide-react";
import { armRecaptcha } from "@/lib/recaptchaEvents";

// Homepage-only exit-intent capture, mirroring WorkWithHyperiuxModal.jsx's
// technical conventions (motion/react, same MODAL_TRANSITION curve, Lenis
// scroll-lock) but with local useState instead of a query-param-driven open
// state - this modal is triggered by cursor behavior, not a link anyone
// needs to deep-link to or share.
//
// Mounted globally from the root layout (inside LazyRecaptchaProvider, so
// executeRecaptcha() below actually has a provider to talk to - see
// lib/recaptchaEvents.js) rather than from the homepage route itself, so the
// pathname check below is what keeps this homepage-only, not where it's
// rendered from.
//
// Submitting creates a real Clerk invitation and emails it via the existing
// waitlist-invite-email template (see api/exit-intent-invite/route.js) -
// accepting it lets the visitor set a password and land signed in, same
// flow as an admin-sent waitlist invite.

const SESSION_KEY = "hyperiux_exit_intent_shown";
const ARM_DELAY_MS = 4000;
const TOP_EDGE_TRIGGER_PX = 0;

const MODAL_TRANSITION = {
  duration: 0.5,
  ease: [0.76, 0, 0.24, 1],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ExitIntentInviteModal() {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const [error, setError] = useState("");
  const shownRef = useRef(false);
  const { executeRecaptcha } = useReCaptcha();
  const lenis = useLenis();
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // Arms after a short delay (so a visitor who bounces in the first few
  // seconds doesn't get ambushed instantly) and only once per tab session -
  // sessionStorage, not localStorage, so it's fair game again on a fresh
  // visit later, just not spammed across repeated mouse-out flicks in one visit.
  // Now mounted globally (see the note above), so this also has to bail out
  // on every route except "/" itself - re-checked on every pathname change
  // since the component no longer unmounts on navigation.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isHomepage) return;
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;

    const armTimer = window.setTimeout(() => {
      setArmed(true);
      // Asks LazyRecaptchaProvider to mount <ReCaptchaProvider> now, not on
      // submit - this modal opens on a mouseleave, not a query param, so it
      // wouldn't otherwise be picked up (see lib/recaptchaEvents.js) and
      // executeRecaptcha() would throw "Recaptcha has not been loaded".
      armRecaptcha();
    }, ARM_DELAY_MS);
    return () => window.clearTimeout(armTimer);
  }, [isHomepage]);

  useEffect(() => {
    if (!armed) return;
    if (!isHomepage) return;

    function handleMouseLeave(event) {
      if (shownRef.current) return;
      // Only the top edge - a cursor leaving toward the browser's tab bar
      // or URL bar is a real "about to leave" signal; leaving the sides or
      // bottom of the viewport is normal scrolling/window-resizing noise.
      if (event.clientY > TOP_EDGE_TRIGGER_PX) return;

      shownRef.current = true;
      window.sessionStorage.setItem(SESSION_KEY, "1");
      setOpen(true);
    }

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [armed, isHomepage]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop?.();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      lenis?.start?.();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, lenis]);

  const close = () => setOpen(false);

  useEffect(() => {
    if (open) return;
    const id = window.setTimeout(() => {
      setEmail("");
      setAgreed(false);
      setStatus("idle");
      setError("");
    }, 500);
    return () => window.clearTimeout(id);
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the privacy policy first.");
      return;
    }

    setStatus("submitting");

    try {
      const recaptchaToken = await executeRecaptcha("exit_intent_invite");
      const res = await fetch("/api/exit-intent-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), recaptchaToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("idle");
        setError(data?.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      window.setTimeout(close, 2000);
    } catch {
      setStatus("idle");
      setError("Something went wrong. Please try again.");
    }
  };

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  // Safety net alongside the effect guards above: covers the moment a
  // client-side navigation fires while the modal happens to already be open.
  if (!isHomepage) return null;

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="exit-intent-modal"
          className="fixed inset-0 z-9999 flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-intent-title"
        >
          <motion.button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={MODAL_TRANSITION}
          />

          <motion.div
            className="relative z-10 w-[36vw] max-md:w-full max-[1025px]:w-[70%] border border-white/20 bg-[#0e0e0e] p-10 max-md:p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={MODAL_TRANSITION}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="group absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-white/20 bg-white/10 text-white/70 transition-all duration-300 hover:border-[#ff5f00] hover:bg-[#ff5f00] hover:text-white"
            >
              <div className="relative flex h-4 w-4 items-center justify-center duration-500 ease-in-out group-hover:rotate-90">
                <span className="h-px w-4 rotate-45 bg-white" />
                <span className="absolute h-px w-4 -rotate-45 bg-white" />
              </div>
            </button>

            {isSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <Mail className="h-10 w-10 text-[#ff5f00]" strokeWidth={1.2} />
                <h3 className="text-xl font-bold text-white">Invite sent.</h3>
                <p className="max-w-sm text-sm leading-relaxed text-white/60">
                  Check your inbox for your Hyperiux Vault invite - accept it to set a
                  password and you&apos;re in.
                </p>
              </div>
            ) : (
              <>
                <span className="inline-block bg-[#ff5f00]/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#ff5f00]">
                  Before you go
                </span>

                <h3
                  id="exit-intent-title"
                  className="mt-4 text-2xl font-bold leading-tight text-white max-md:text-xl"
                >
                  Get instant access to 40+ free effects.
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  Source-first scroll effects, cursor systems, and page transitions for
                  React and Next.js. We&apos;ll email you an invite to set up your free
                  account - no credit card, ever.
                </p>

                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full border-b border-white/20 bg-transparent pb-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#ff5f00]"
                  />

                  <label className="flex cursor-pointer items-start gap-2.5 text-xs text-white/50">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => {
                        setAgreed(e.target.checked);
                        setError("");
                      }}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer border-white/30 bg-transparent accent-[#ff5f00]"
                    />
                    <span>
                      I agree to the{" "}
                      <Link
                        href="/legal/privacy-policy"
                        target="_blank"
                        className="text-white/70 underline underline-offset-2 hover:text-white"
                      >
                        privacy policy
                      </Link>
                    </span>
                  </label>

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cursor-pointer bg-[#ff5f00] px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#e0540a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending…" : "Send it to me"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ExitIntentInviteModal;
