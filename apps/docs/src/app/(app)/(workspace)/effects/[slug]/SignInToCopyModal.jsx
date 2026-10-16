"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useCopyLimit } from "./useCopyLimit";

// Shown instead of the Get Code dropdown (and any other copy action) while
// the visitor is signed out. Must render inside CopyLimitProvider - it reads
// the auth state and shares that provider's toast slot.
//
// Signing in and creating an account both happen right here (the same
// SignInForm / SignUpForm as the /sign-in and /sign-up pages), so the visitor
// never leaves the effect. "Create an account" / "Sign in" switch the modal
// between the two.
//
// While open, the URL carries ?auth=sign-in or ?auth=sign-up (replaceState,
// so no extra Back-button entry) and an `auth_modal_view` dataLayer event is
// pushed - both for analytics (GTM's History Change trigger / GA4 page views).

export const AUTH_MODAL_PARAM = "auth";
export const AUTH_MODAL_MODES = ["sign-in", "sign-up"];

function syncAuthUrl(mode) {
  const url = new URL(window.location.href);
  if ((url.searchParams.get(AUTH_MODAL_PARAM) || null) === mode) return;

  if (mode) url.searchParams.set(AUTH_MODAL_PARAM, mode);
  else url.searchParams.delete(AUTH_MODAL_PARAM);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);

  if (mode) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "auth_modal_view",
      auth_modal: mode,
      page_path: `${url.pathname}${url.search}`,
    });
  }
}

/**
 * @param {{
 *   mode: "sign-in" | "sign-up" | null;  // null = closed
 *   onModeChange: (mode: "sign-in" | "sign-up") => void;
 *   onClose: () => void;
 *   returnPath: string;
 * }} props
 */
export default function SignInToCopyModal({ mode, onModeChange, onClose, returnPath }) {
  const { isLoaded, isSignedIn, showToast } = useCopyLimit();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const open = mode !== null;

  // What's on screen. It keeps the last mode while the modal fades out, so the
  // form doesn't vanish mid-fade (that collapsed the box to its padding).
  const [shownMode, setShownMode] = useState(mode ?? "sign-in");
  // Bumped on every open so each visit starts with a fresh, empty form.
  const [formKey, setFormKey] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open && mode !== shownMode) setShownMode(mode);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setFormKey((key) => key + 1);
  }

  // SSR-safe mounted flag - gates the createPortal() below.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Only clears a ?auth= this modal set (or was opened from) - otherwise the
  // first run, while still closed, would wipe a deep link before the page
  // gets to open the modal from it.
  const urlSyncedRef = useRef(false);
  useEffect(() => {
    if (mode) urlSyncedRef.current = true;
    else if (!urlSyncedRef.current) return;
    syncAuthUrl(mode);
  }, [mode]);

  // Set once a form in this modal actually completes, so the "logged in"
  // nudge isn't shown to someone who was already signed in.
  const authCompletedRef = useRef(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Signed in while this was open (either form, or another tab) - or opened
  // from an ?auth= link by someone already signed in: close the modal, and
  // confirm with a nudge when the sign-in happened here.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !open) return;
    onClose();
    if (authCompletedRef.current) {
      authCompletedRef.current = false;
      showToast({ title: "You're logged in", description: "You can copy code from the vault now." });
    }
  }, [isLoaded, isSignedIn, open, onClose, showToast]);

  if (!mounted) return null;

  const switchTo = (nextMode) => () => onModeChange(nextMode);
  // Server components re-render with the new session (e.g. a Pro account's
  // Pro effect unlocks); the isSignedIn effect above closes the modal.
  const onAuthComplete = () => {
    authCompletedRef.current = true;
    router.refresh();
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={shownMode === "sign-up" ? "Create a Hyperiux Vault account" : "Sign in to Hyperiux Vault"}
        className={`flex w-[35vw] max-md:w-full max-[1025px]:w-[70%] flex-col gap-6 items-stretch max-h-[90vh] overflow-y-auto  border border-white/20 bg-[#0e0e0e] p-10 max-[1025px]:p-6 shadow-2xl transition-transform duration-300 relative ${open ? "scale-100" : "scale-95"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="max-[1025px]:hidden group absolute right-5 top-5 flex h-10 w-10 items-center justify-center  border border-white/20 bg-white/10 text-xl leading-none text-white/70 transition-all duration-500 ease-in-out hover:border-[#ff5f00] hover:bg-[#ff5f00] hover:text-white "
        >
          <div className="relative flex h-4 w-4 items-center justify-center duration-500 ease-in-out group-hover:rotate-90">
            <span className="h-px w-4 rotate-45 bg-white" />
            <span className="absolute h-px w-4 -rotate-45 bg-white" />
          </div>
        </button>

        <div className="w-full">
          {shownMode === "sign-up" ? (
            <SignUpForm
              key={`sign-up-${formKey}`}
              compact
              redirectUrl={returnPath}
              onSignInClick={switchTo("sign-in")}
              onComplete={onAuthComplete}
            />
          ) : (
            <SignInForm
              key={`sign-in-${formKey}`}
              compact
              redirectUrl={returnPath}
              onSignUpClick={switchTo("sign-up")}
              onComplete={onAuthComplete}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
