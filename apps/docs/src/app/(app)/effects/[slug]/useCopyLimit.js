"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const CopyLimitContext = createContext(null);

// Shared across every code/install block on one effect page so hitting the
// limit on one block immediately locks the rest too, instead of each block
// tracking its own stale copy of the daily count.
export function CopyLimitProvider({ children, onRequireSignIn }) {
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

  const requestCopy = useCallback(async () => {
    if (!isLoaded) return false;

    if (!isSignedIn) {
      onRequireSignIn?.();
      return false;
    }

    if (usage?.isAdmin) return true;
    if (usage && usage.remaining <= 0) return false;

    try {
      const res = await fetch("/api/copy-usage", { method: "POST" });
      const data = await res.json();

      setUsage(data);

      return Boolean(data.allowed);
    } catch {
      return false;
    }
  }, [isLoaded, isSignedIn, usage, onRequireSignIn]);

  const isLocked = Boolean(
    isLoaded && isSignedIn && usage && !usage.isAdmin && usage.remaining <= 0
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
