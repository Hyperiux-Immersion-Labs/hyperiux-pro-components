"use client";

import { useSyncExternalStore } from "react";

/**
 * Runs `callback` once the page has loaded and the main thread is free, so work that
 * isn't needed for the first paint (search data, modals nobody has opened yet, the
 * tooltip layer) stays out of the way of loading and hydrating the page.
 * Returns { cancel }.
 */
export function whenIdle(callback, { timeout = 4000 } = {}) {
  let handle = 0;
  let timer = 0;
  const schedule = () => {
    if (window.requestIdleCallback) handle = window.requestIdleCallback(callback, { timeout });
    else timer = window.setTimeout(callback, 1500);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return {
    cancel() {
      window.removeEventListener("load", schedule);
      if (handle) window.cancelIdleCallback?.(handle);
      window.clearTimeout(timer);
    },
  };
}

// One flag for the whole page, so a page full of links doesn't schedule a callback each
let pageIdle = false;
const idleListeners = new Set();
let idleScheduled = false;

function subscribeIdle(listener) {
  idleListeners.add(listener);
  if (!idleScheduled) {
    idleScheduled = true;
    whenIdle(() => {
      pageIdle = true;
      idleListeners.forEach((fn) => fn());
    });
  }
  return () => idleListeners.delete(listener);
}

/** True once the page is idle after load (see whenIdle). False on the server. */
export function useIdle() {
  return useSyncExternalStore(subscribeIdle, () => pageIdle, () => false);
}
