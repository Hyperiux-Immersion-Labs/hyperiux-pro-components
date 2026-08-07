"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const CopyLimitContext = createContext(null);

// Shared across every code/install block on one effect page so hitting the
// limit on one block immediately locks the rest too, instead of each block
// tracking its own stale copy of the daily count. The limit is per distinct
// effect copied today, not per click - once this effect has consumed a slot
// (or the user copies from it again), every block on the page stays unlocked.
export function CopyLimitProvider({ children, onRequireSignIn, effectSlug }) {
  const { isSignedIn, isLoaded } = useUser();
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;

    fetch("/api/copy-usage")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUsage(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  const effectAlreadyUnlocked = Boolean(usage?.effectSlugs?.includes(effectSlug));

  const requestCopy = useCallback(async () => {
    if (!isLoaded) return false;

    if (!isSignedIn) {
      onRequireSignIn?.();
      return false;
    }

    if (usage?.isAdmin) return true;
    // Already used a slot on this effect today - copy freely, no need to
    // round-trip to the server.
    if (effectAlreadyUnlocked) return true;
    if (usage && usage.remaining <= 0) return false;

    try {
      const res = await fetch("/api/copy-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ effectSlug }),
      });
      const data = await res.json();

      setUsage(data);

      return Boolean(data.allowed);
    } catch {
      return false;
    }
  }, [isLoaded, isSignedIn, usage, effectAlreadyUnlocked, effectSlug, onRequireSignIn]);

  const isLocked = Boolean(
    isLoaded &&
      isSignedIn &&
      usage &&
      !usage.isAdmin &&
      !effectAlreadyUnlocked &&
      usage.remaining <= 0
  );

  // Selection/clipboard is only blocked once we're sure the visitor is
  // signed out - default to selectable while auth is still loading so the
  // code doesn't flash locked-then-unlocked for signed-in users.
  const selectable = !isLoaded || isSignedIn;

  const value = {
    isLoaded,
    isSignedIn,
    usage,
    requestCopy,
    isLocked,
    selectable,
    lockedCtaHref: usage?.plan === "pro" || usage?.isAdmin ? null : "/pricing",
  };

  return (
    <CopyLimitContext.Provider value={value}>
      {children}
    </CopyLimitContext.Provider>
  );
}

export function useCopyLimit() {
  const ctx = useContext(CopyLimitContext);

  if (!ctx) {
    throw new Error("useCopyLimit must be used within a CopyLimitProvider");
  }

  return ctx;
}
