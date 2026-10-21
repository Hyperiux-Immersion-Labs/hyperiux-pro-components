"use client";

import { useEffect, useLayoutEffect } from "react";
import { useLenis } from "lenis/react";

// Holding the page still behind a modal or drawer, the way the effects' preview drawer
// always has - shared so every modal does it the same way:
//   - The page's scrollbar keeps its place, only its thumb turns invisible
//     (html[data-v4-drawer-open], globals.css). Hiding the scrollbar outright - overflow:
//     hidden on <body>, or Lenis's own overflow: clip on <html> when it stops - takes its
//     width away, and the whole page jumps sideways on open and back on close.
//   - The thumb stays invisible for as long as the modal is on screen (`onScreen`),
//     including its close animation, so the page's scrollbar never shows next to the
//     modal's own while it slides away.
//   - While the modal is open, Lenis is stopped and wheel / touch scrolling outside the
//     modal's own scrolling panels (marked data-lenis-prevent) is cancelled, so the page
//     can't move - on pages without Lenis (reduced motion) too.
// Modals opened on top of each other share the hold: the page moves again only when the
// last one closes (a sign-in prompt over a drawer).
let holds = 0;
let shows = 0;

const insideModalScroll = (target) => target instanceof Element && Boolean(target.closest("[data-lenis-prevent]"));
const blockPageScroll = (event) => {
  if (!insideModalScroll(event.target)) event.preventDefault();
};

/**
 * `open` - the modal is open: the page can't scroll.
 * `onScreen` - the modal is still visible (defaults to `open`; pass the "still animating
 * out" state when the modal keeps it): the page scrollbar stays hidden.
 * `closeMs` - for a modal that fades out after `open` turns false without saying when it's
 * gone (a CSS transition, an exit animation): how long the scrollbar stays hidden after.
 */
export function useLenisLock(open, { onScreen = open, closeMs = 0 } = {}) {
  const lenis = useLenis();

  // Before paint, and before Lenis stops (the effect below), so the scrollbar's width is
  // held from the first frame
  useLayoutEffect(() => {
    if (!onScreen) return undefined;
    const root = document.documentElement;
    shows += 1;
    root.setAttribute("data-v4-drawer-open", "");
    const release = () => {
      shows = Math.max(0, shows - 1);
      if (shows === 0) root.removeAttribute("data-v4-drawer-open");
    };
    return () => {
      if (closeMs > 0) setTimeout(release, closeMs);
      else release();
    };
  }, [onScreen, closeMs]);

  useEffect(() => {
    if (!open) return undefined;
    holds += 1;
    lenis?.stop();
    if (holds === 1) {
      document.addEventListener("wheel", blockPageScroll, { passive: false });
      document.addEventListener("touchmove", blockPageScroll, { passive: false });
    }
    return () => {
      holds = Math.max(0, holds - 1);
      if (holds === 0) {
        document.removeEventListener("wheel", blockPageScroll);
        document.removeEventListener("touchmove", blockPageScroll);
        lenis?.start();
      }
    };
  }, [open, lenis]);
}
