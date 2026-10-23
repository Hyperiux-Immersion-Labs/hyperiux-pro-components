"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { Mail } from "lucide-react";
import Turnstile from "@/components/WebsiteComps/Turnstile";
import { buttonClassName, ButtonChrome } from "@/homepage/components/Button";
import { FREE_LABEL } from "@/lib/library-counts";
import { isLoaderWaiting } from "@/homepage/components/loader-state";
import { useCachedClerkSession } from "@/lib/clerkSessionCache";

// Site-wide exit-intent capture (except the auth flows, /dashboard, the demos
// and signed-in visitors - see isEligible below): motion/react with the MODAL_TRANSITION curve and a
// Lenis scroll-lock, opened by local useState - it's triggered by cursor
// behavior, not a link anyone needs to deep-link to or share.
//
// Mounted globally from the root layout rather than per-route, so the
// pathname check below is what keeps it off the excluded routes, not where
// it's rendered from.
//
// Submitting creates a real Clerk invitation and emails it via the existing
// waitlist-invite-email template (see api/exit-intent-invite/route.js) -
// accepting it lets the visitor set a password and land signed in, same
// flow as an admin-sent waitlist invite.

const SESSION_KEY = "hyperiux_exit_intent_shown";
// A visitor who bounces early hasn't actually engaged with the site yet -
// showing an invite popup to them reads as an ambush, not an offer. It arms
// only after 60s of actually exploring: the count pauses when the tab is
// hidden, the window loses focus or the cursor leaves the page, and resumes on
// their next scroll, click, key or mouse move. It also holds while the
// homepage loader is up, so on a first visit it starts at "Enter the Vault".
// The time so far is kept for the session, so a reload or a stop on an
// excluded route carries on from there. Once armed, a genuine exit attempt
// triggers instantly.
const ARM_AFTER_MS = 60000;
const ELAPSED_KEY = "hyperiux_exit_intent_elapsed";
const TICK_MS = 1000;
const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart"];
// Leaving is a `mouseout` with no relatedTarget (the cursor left the page,
// not one element for another). It's `mouseout` on document rather than
// `mouseleave`, which browsers don't reliably send to document itself.
// The cursor is sampled, not continuous, so a quick flick to the tab bar
// can last register well below the top: rather than a fixed margin, it
// counts as leaving through the top when the top is the nearest edge, within
// the top quarter of the window.
const TOP_EXIT_MAX_SHARE = 0.25;
// Entering an iframe (effect stages, previews) also looks like leaving the
// page - ignored within this distance of one.
const IFRAME_MARGIN_PX = 24;

function isTopExit(event) {
  if (event.relatedTarget) return false;
  const { clientX: x, clientY: y } = event;
  const nearestOther = Math.min(x, window.innerWidth - x, window.innerHeight - y);
  if (y > nearestOther || y > window.innerHeight * TOP_EXIT_MAX_SHARE) return false;
  return ![...document.querySelectorAll("iframe")].some((frame) => {
    const r = frame.getBoundingClientRect();
    return (
      x >= r.left - IFRAME_MARGIN_PX && x <= r.right + IFRAME_MARGIN_PX &&
      y >= r.top - IFRAME_MARGIN_PX && y <= r.bottom + IFRAME_MARGIN_PX
    );
  });
}

const MODAL_TRANSITION = {
  duration: 0.5,
  ease: [0.76, 0, 0.24, 1],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sign-in / sign-up and the CLI's auth hand-off (an invite-to-sign-up popup
// is redundant mid-auth-flow), the signed-in /dashboard app, and the
// full-screen demos. Each also covers everything under it.
const EXCLUDED_ROUTES = ["/sign-in", "/sign-up", "/signup", "/cli-auth", "/dashboard", "/template-demo", "/demo"];

function isExcludedRoute(pathname) {
  return EXCLUDED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

// What Tab can land on inside the dialog
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

const TURNSTILE_FAILED =
  "We couldn't confirm you're human. If you use an ad or tracker blocker, allow challenges.cloudflare.com, then reload and try again.";

// Storage is guarded: Safari private mode and hardened privacy settings throw
function readSession(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage unavailable - the count just starts over on the next load
  }
}

export function ExitIntentInviteModal() {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | verifying | submitting | success
  const [error, setError] = useState("");
  // The email already has an account - the error gets a sign-in link
  const [existingAccount, setExistingAccount] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);
  const shownRef = useRef(false);
  const panelRef = useRef(null);
  const emailRef = useRef(null);
  // Cloudflare Turnstile token for the bot check (see components/WebsiteComps/Turnstile.jsx)
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [turnstileFailed, setTurnstileFailed] = useState(false);
  const lenis = useLenis();
  const pathname = usePathname();
  // No ClerkProvider on marketing pages, so a signed-in browser is read from
  // Clerk's session cookie - they already have the account this invite is for
  const signedIn = useCachedClerkSession();
  const isEligible = !isExcludedRoute(pathname) && !signedIn;

  // Arms after 60s of exploring (ARM_AFTER_MS, see the note above) and only
  // once per tab session - sessionStorage, not localStorage, so it's fair game
  // again on a fresh visit later, just not spammed across repeated mouse-out
  // flicks in one visit. Mounted globally (see the note above), so this also
  // has to bail out on excluded routes and signed-in visitors - re-checked on
  // every pathname change since the component no longer unmounts on navigation.
  useEffect(() => {
    if (!isEligible || armed) return;
    if (readSession(SESSION_KEY) === "1") return;

    let elapsed = Number(readSession(ELAPSED_KEY)) || 0;
    const isHere = () => document.visibilityState === "visible" && document.hasFocus();
    let active = isHere();

    const pause = () => { active = false; };
    // Coming back alone doesn't resume it - the visitor has to do something
    const resume = () => { if (isHere()) active = true; };
    const onVisibility = () => { if (document.visibilityState !== "visible") pause(); };
    // No relatedTarget: the cursor left the page, not just one element for another
    const onMouseOut = (event) => { if (!event.relatedTarget) pause(); };

    const tick = window.setInterval(() => {
      // The homepage loader is still up, waiting on "Enter the Vault"
      if (!active || isLoaderWaiting()) return;
      elapsed += TICK_MS;
      writeSession(ELAPSED_KEY, String(elapsed));
      if (elapsed >= ARM_AFTER_MS) setArmed(true);
    }, TICK_MS);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", pause);
    document.addEventListener("mouseout", onMouseOut);
    ACTIVITY_EVENTS.forEach((type) => window.addEventListener(type, resume, { capture: true, passive: true }));
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", pause);
      document.removeEventListener("mouseout", onMouseOut);
      ACTIVITY_EVENTS.forEach((type) => window.removeEventListener(type, resume, { capture: true }));
    };
  }, [isEligible, armed]);

  useEffect(() => {
    if (!armed) return;
    if (!isEligible) return;

    function handleMouseOut(event) {
      if (shownRef.current) return;
      // Only the top edge - a cursor leaving toward the browser's tab bar
      // or URL bar is a real "about to leave" signal; leaving the sides or
      // bottom of the viewport is normal scrolling/window-resizing noise.
      if (!isTopExit(event)) return;

      shownRef.current = true;
      writeSession(SESSION_KEY, "1");
      setOpen(true);
    }

    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, [armed, isEligible]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop?.();

    // Straight into the email field, and back to wherever focus was on close
    const returnFocusTo = document.activeElement;
    const focusFrame = window.requestAnimationFrame(() => emailRef.current?.focus({ preventScroll: true }));

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      // Tab cycles inside the dialog instead of reaching the page behind it
      const focusables = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.getClientRects().length > 0
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const inside = panelRef.current.contains(document.activeElement);

      if (event.shiftKey && (!inside || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!inside || document.activeElement === last)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      lenis?.start?.();
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      returnFocusTo?.focus?.({ preventScroll: true });
    };
  }, [open, lenis]);

  const close = () => setOpen(false);

  useEffect(() => {
    if (open) return;
    const id = window.setTimeout(() => {
      setEmail("");
      setAgreed(true);
      setStatus("idle");
      setError("");
      setExistingAccount(false);
    }, 500);
    return () => window.clearTimeout(id);
  }, [open]);

  const send = async (token) => {
    setStatus("submitting");

    try {
      const res = await fetch("/api/exit-intent-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), turnstileToken: token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("idle");
        // Tokens are single-use: dropping it makes the widget fetch a fresh one
        setTurnstileToken(null);
        setError(data?.error || "Something went wrong. Please try again.");
        setExistingAccount(Boolean(data?.existingAccount));
        return;
      }

      setStatus("success");
      window.setTimeout(close, 2000);
    } catch {
      setStatus("idle");
      setTurnstileToken(null);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setExistingAccount(false);

    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the privacy policy first.");
      return;
    }
    if (turnstileFailed) {
      setError(TURNSTILE_FAILED);
      return;
    }

    // Clicked before the bot check finished: it sends itself once it has
    // (see the Turnstile callbacks below), no second click needed
    if (!turnstileToken) {
      setStatus("verifying");
      return;
    }

    send(turnstileToken);
  };

  const handleTurnstileChange = (verified, token) => {
    setTurnstileToken(verified ? token : null);
    if (!verified) return;
    setTurnstileFailed(false);
    if (status === "verifying") send(token);
  };

  const handleTurnstileError = () => {
    setTurnstileFailed(true);
    if (status !== "verifying") return;
    setStatus("idle");
    setError(TURNSTILE_FAILED);
  };

  const isSubmitting = status === "submitting" || status === "verifying";
  const isSuccess = status === "success";

  // Safety net alongside the effect guards above: covers the moment a
  // client-side navigation fires while the modal happens to already be open.
  if (!isEligible) return null;

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
            // Click-outside only - Tab skips it (the panel's own close button is in reach)
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={MODAL_TRANSITION}
          />

          <motion.div
            ref={panelRef}
            className="relative z-10 w-[36vw] max-md:w-full max-lg:w-[70%] border border-white/20 bg-background p-10 max-md:p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={MODAL_TRANSITION}
          >
            <button
              id="exit-intent-invite-modal-close"
              type="button"
              aria-label="Close"
              onClick={close}
              className="group absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-white/20 bg-white/10 text-white/70 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white"
            >
              <div className="relative flex h-4 w-4 items-center justify-center duration-500 ease-in-out group-hover:rotate-90">
                <span className="h-px w-4 rotate-45 bg-white" />
                <span className="absolute h-px w-4 -rotate-45 bg-white" />
              </div>
            </button>

            {isSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <Mail className="h-10 w-10 text-primary" strokeWidth={1.2} />
                <h3 className="text-xl font-bold text-white">Invite sent.</h3>
                <p className="max-w-sm text-sm leading-relaxed text-white/60">
                  Check your inbox for your Hyperiux Vault invite - accept it to set a
                  password and you&apos;re in.
                </p>
              </div>
            ) : (
              <>
                <span className="inline-block bg-primary/15 px-3 py-1 text-xs font-medium tracking-wide text-primary">
                  Before You Go
                </span>

                <h3
                  id="exit-intent-title"
                  className="mt-6 text-2xl font-bold leading-tight text-white max-md:text-xl"
                >
                  Get instant access to {FREE_LABEL} free effects.
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  Source-first scroll effects, cursor systems, and page transitions for
                  React and Next.js. We&apos;ll email you an invite to set up your free
                  account - no credit card, ever.
                </p>

                <form onSubmit={handleSubmit} noValidate className="mt-14 space-y-8">
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    // globals.css's base input:-webkit-autofill rule fakes a
                    // background override via an inset box-shadow (Chrome's
                    // own autofill fill can't be styled directly), falling
                    // back to a light fill meant for light-surface inputs -
                    // transparent here means that fake fill paints nothing,
                    // so this field's own transparent background just shows
                    // through either way. -webkit-text-fill-color still
                    // needs the explicit white override: browsers force
                    // autofilled text to a fixed dark color otherwise.
                    style={{
                      "--input-autofill-bg": "transparent",
                      "--input-autofill-text": "var(--foreground)",
                    }}
                    className="w-full border-b border-white bg-transparent pb-4 text-sm text-white placeholder:text-white/60 outline-none focus:border-primary"
                  />

                  <label className="flex cursor-pointer items-start gap-2.5 text-sm text-white/60">
                    {/* accent-color styles the browser's native checkbox
                        widget, which keeps its own rounded corners baked in
                        by the platform - border-radius/rounded-none can't
                        override that. Drawing the box as a plain span (with
                        the real input visually hidden but still driving
                        state/keyboard/a11y) keeps it a genuine square. */}
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => {
                        setAgreed(e.target.checked);
                        setError("");
                      }}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black ${
                        agreed ? "border-primary bg-primary" : "border-white/30 bg-transparent"
                      }`}
                    >
                      {agreed && (
                        <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5 text-white">
                          {/* pathLength (a Motion-specific SVG prop) animates
                              the stroke as if it were being drawn, rather
                              than just appearing - remounts (and so
                              replays) every time the checkbox goes from
                              unchecked to checked, including the initial
                              checked-by-default state on open. */}
                          <motion.path
                            d="M2 6l2.5 2.5L10 3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          />
                        </svg>
                      )}
                    </span>
                    <span>
                      I agree to the{" "}
                      <Link
                        href="/legal/privacy-policy"
                        target="_blank"
                        className="text-white/80 underline underline-offset-2 hover:text-white"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  {/* Invisible unless Cloudflare needs the visitor to click */}
                  <Turnstile
                    action="exit_intent_invite"
                    appearance="interaction-only"
                    checked={Boolean(turnstileToken)}
                    onChange={handleTurnstileChange}
                    onError={handleTurnstileError}
                  />

                  {error && (
                    <p className="text-xs text-red-400">
                      {error}
                      {existingAccount && (
                        <>
                          {" "}
                          <Link href="/sign-in" className="text-white underline underline-offset-2 hover:text-primary">
                            Sign in instead
                          </Link>
                        </>
                      )}
                    </p>
                  )}

                  {/* Same buttonClassName + ButtonChrome pair
                      TemplatePaywallModal's RazorpayButtonV3 uses - this is
                      a real form-submitting <button>, not a navigation
                      <Link>, so it can't just render <Button> itself, but
                      these two give it the exact same look (scramble label,
                      square/arrow chrome) as every other Button on the
                      site. */}
                  <div
                    className="contents"
                    onPointerEnter={() => setSendHovered(true)}
                    onPointerLeave={() => setSendHovered(false)}
                  >
                    <button
                      id="exit-intent-invite-modal-send"
                      type="submit"
                      disabled={isSubmitting}
                      data-sound-kind="primary"
                      className={buttonClassName({
                        className: "w-fit disabled:pointer-events-none disabled:opacity-60",
                      })}
                    >
                      <ButtonChrome
                        label={status === "verifying" ? "Verifying…" : status === "submitting" ? "Sending…" : "Send it to me"}
                        hovered={sendHovered}
                      />
                    </button>
                  </div>
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
