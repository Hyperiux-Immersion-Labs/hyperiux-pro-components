"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useCopyLimit } from "./useCopyLimit";

// Shown instead of the Get Code dropdown (and any other copy action) while
// the visitor is signed out. Must render inside CopyLimitProvider - it reads
// the auth state and shares that provider's toast slot.
//
// Logging in happens on the /sign-in page, so the "you're logged in" nudge can't be fired from
// here directly. A sessionStorage flag set on the way out is picked up once
// the visitor is back on the effect page and signed in.

const SIGN_IN_NUDGE_KEY = "hyperiux-sign-in-nudge";

function markSignInNudge() {
  try {
    window.sessionStorage.setItem(SIGN_IN_NUDGE_KEY, "1");
  } catch {
    // Storage blocked - they just won't see the nudge.
  }
}

function takeSignInNudge() {
  try {
    const pending = window.sessionStorage.getItem(SIGN_IN_NUDGE_KEY) === "1";
    window.sessionStorage.removeItem(SIGN_IN_NUDGE_KEY);
    return pending;
  } catch {
    return false;
  }
}

export default function SignInToCopyModal({ open, onClose, returnPath }) {
  const { isLoaded, isSignedIn, showToast } = useCopyLimit();
  const [mounted, setMounted] = useState(false);

  // SSR-safe mounted flag - gates the createPortal() below.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Back from sign-in (or signed in from another tab while this was open):
  // close the modal and confirm with a nudge.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const pending = takeSignInNudge();
    if (!pending && !open) return;
    if (open) onClose();
    showToast({ title: "You're logged in", description: "You can copy code from the vault now." });
  }, [isLoaded, isSignedIn, open, onClose, showToast]);

  if (!mounted) return null;

  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(returnPath)}`;

  return createPortal(
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-in-to-copy-title"
        className={`flex w-[35vw] max-md:w-full max-[1025px]:w-[70%] flex-col gap-6 items-center  border border-white/20 bg-[#0e0e0e] p-10 max-[1025px]:p-6 shadow-2xl transition-transform duration-300 relative ${open ? "scale-100" : "scale-95"}`}
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

        <h2 id="sign-in-to-copy-title" className="text-xl font-medium text-white">
          Log in first
        </h2>
        <p className="text-sm text-white/60 text-center">
          Create a free account or log in to copy code and install commands from the vault.
        </p>

        <div className="flex w-full max-w-80 flex-col items-stretch">
          <Link
            href={signInHref}
            className="inline-flex items-center justify-center gap-1.5 bg-[#ff5f00] px-4 py-3 text-sm font-medium text-white hover:bg-[#e05500] transition-colors"
            onClick={() => {
              markSignInNudge();
              onClose();
            }}
          >
            Log in
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
