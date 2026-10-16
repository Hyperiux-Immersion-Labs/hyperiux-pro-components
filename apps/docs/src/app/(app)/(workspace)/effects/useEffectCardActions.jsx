"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useUser } from "@clerk/nextjs";
import { Modal, SignInRequiredModal } from "@/components/ui/SignInRequiredModal";
import { useToastQueue, ToastViewport } from "@/components/ui/Toast";
import { emitWishlistChanged } from "@/lib/wishlistEvents";
import { refreshDashboard } from "@/components/Dashboard/useDashboardData";
import { installCommand } from "./EffectCard";
import { getLimitNudge } from "@/lib/limitNudge";
import { mergeCopyUsage, subscribeCopyUsage } from "@/lib/copyUsageEvents";


const subscribeNever = () => () => {};

// Saved effects are cached per account - in memory across client navigations and in
// localStorage across visits - so hearts show the right state straight away; the
// /api/wishlist fetch then refreshes the cache in the background.
const WISHLIST_CACHE_KEY = (userId) => `hx-wishlist:${userId}`;
const memoryWishlist = new Map();

function readCachedWishlist(userId) {
  if (memoryWishlist.has(userId)) return memoryWishlist.get(userId);
  try {
    const stored = JSON.parse(window.localStorage.getItem(WISHLIST_CACHE_KEY(userId)) || "null");
    return Array.isArray(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeCachedWishlist(userId, list) {
  memoryWishlist.set(userId, list);
  try {
    window.localStorage.setItem(WISHLIST_CACHE_KEY(userId), JSON.stringify(list));
  } catch {
    // Storage blocked - the in-memory copy still covers this visit.
  }
}

/**
 * Everything an EffectCard's actions need - saved effects, copy install command,
 * the Pro lock - shared by the effects listing and the effect page's related effects
 * so both behave the same. Render `overlays` once on the page: it holds the toast
 * and the "sign in to save" prompt.
 */
export function useEffectCardActions({ userPlan = "free", signInRedirect = "/effects" } = {}) {
  const { isSignedIn, user } = useUser();
  const userId = user?.id;
  const isProUser = userPlan === "pro";
  const { toast, showToast, dismissToast } = useToastQueue();
  const [wishlist, setWishlist] = useState([]);
  // false, or the reason to show ("save effects", "install effects with the CLI")
  const [signInPrompt, setSignInPrompt] = useState(false);
  // Portals need <body>; false on the server and during hydration.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);

  // Cached list first (before paint, so no hearts flicker), then the server's.
  useLayoutEffect(() => {
    if (!isSignedIn || !userId) return;
    const cached = readCachedWishlist(userId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cached) setWishlist(cached);
  }, [isSignedIn, userId]);

  useEffect(() => {
    if (!isSignedIn || !userId) return undefined;
    let cancelled = false;
    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const list = data.map((item) => item.effect_slug || item.name || item);
        setWishlist(list);
        writeCachedWishlist(userId, list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, userId]);

  // Latest list for click handlers (a click reads it before any re-render).
  const wishlistRef = useRef(wishlist);
  useLayoutEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  // Copying the install command counts nothing: it's only a command, and the install is
  // claimed and logged when the CLI actually fetches the effect (/api/cli/effects). `usage`
  // (today's count) is only read, to warn when today's limit is already used up.
  const [usage, setUsage] = useState(null);
  // Kept in step with the effect page's code blocks and Get code menu
  useEffect(
    () => subscribeCopyUsage((next) => setUsage((previous) => mergeCopyUsage(previous, next))),
    []
  );
  useEffect(() => {
    if (!isSignedIn || !userId) return undefined;
    let cancelled = false;
    fetch("/api/copy-usage")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setUsage(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, userId]);

  // Resolves true once the command is on the clipboard (the card and drawer show
  // "Copied" only then). Signed out: the sign-in prompt instead.
  const copyInstall = useCallback(
    async (effect) => {
      if (!isSignedIn) {
        setSignInPrompt("install effects with the CLI");
        return false;
      }
      const command = installCommand(effect);

      let copied = false;
      try {
        await navigator.clipboard.writeText(command);
        copied = true;
      } catch {
        copied = false;
      }

      // Over today's limit (and not an effect already taken today): the install this
      // command makes won't go through, so say so instead of "Copied"
      const overLimit =
        usage && !usage.isAdmin && typeof usage.limit === "number" && usage.remaining <= 0 && !usage.effectSlugs?.includes(effect.name);
      if (!copied) showToast({ title: "Copy This Command", description: command });
      else showToast(overLimit ? getLimitNudge(usage) : { title: "Install Command Copied", description: command });
      return copied;
    },
    [isSignedIn, usage, showToast],
  );

  // Optimistic: the heart, toast and dashboard count update on click; the request
  // confirms in the background and the heart goes back if it fails.
  const setSaved = useCallback(
    (name, saved) => {
      setWishlist((prev) => {
        const next = saved ? [...new Set([...prev, name])] : prev.filter((item) => item !== name);
        if (userId) writeCachedWishlist(userId, next);
        return next;
      });
    },
    [userId],
  );

  const toggleWishlist = useCallback(
    async (effect) => {
      if (!isSignedIn) {
        setSignInPrompt("save effects");
        return;
      }
      const willSave = !wishlistRef.current.includes(effect.name);
      setSaved(effect.name, willSave);
      showToast({
        title: `${effect.title} ${willSave ? "saved" : "removed"}`,
        description: willSave ? "You'll find it in your dashboard's Saved Effects." : "It's no longer in your dashboard's Saved Effects.",
      });
      emitWishlistChanged(willSave, effect.name);

      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ effect }),
        });
        if (!res.ok) throw new Error(`wishlist ${res.status}`);
        const data = await res.json();
        // Stored: dashboard tabs on screen (counts, recently saved) refetch now
        refreshDashboard();
        // The server has the final say (e.g. after a double click).
        if (typeof data.saved === "boolean" && data.saved !== willSave) {
          setSaved(effect.name, data.saved);
          emitWishlistChanged(data.saved, effect.name);
        }
      } catch (error) {
        console.error(error);
        setSaved(effect.name, !willSave);
        emitWishlistChanged(!willSave, effect.name);
        showToast({ title: "Couldn't update Saved Effects", description: "Please try again in a moment." });
      }
    },
    [isSignedIn, showToast, setSaved],
  );

  const canInstall = useCallback((effect) => effect.tier !== "pro" || isProUser, [isProUser]);
  const isWishlisted = useCallback((effect) => wishlistSet.has(effect.name), [wishlistSet]);

  // Spread onto an EffectCard: <EffectCard effect={e} {...cardActions(e)} />
  const cardActions = (effect) => ({
    isWishlisted: isWishlisted(effect),
    canInstall: canInstall(effect),
    onToggleWishlist: toggleWishlist,
    onCopyInstall: copyInstall,
  });

  const overlays = (
    <>
      <ToastViewport toast={toast} onDismiss={dismissToast} />
      <SignInRequiredModal open={Boolean(signInPrompt)} onClose={() => setSignInPrompt(false)} redirect={signInRedirect} action={signInPrompt || "save effects"} />
    </>
  );

  return { isProUser, mounted, canInstall, isWishlisted, copyInstall, toggleWishlist, cardActions, overlays };
}

// Modal lives in components/ui now; re-exported for existing imports (EffectsListing).
export { Modal };
