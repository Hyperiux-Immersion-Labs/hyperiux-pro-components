"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";
import { GridDots } from "@/components/grid-dots";
import { holdPageScroll, releasePageScroll } from "@/lib/scroll-hold";

/**
 * The page-change loading screen (the orange dot grid) - used by every place
 * that shows it: the workspace and effect loading.js files, and VaultLayout
 * while a sidebar link is navigating. The page can't scroll while it shows,
 * so a wheel or touch during the change doesn't carry into the new page;
 * scrolling comes back once no loader is left on screen.
 *
 * The page is held with lib/scroll-hold.js (its scrollbar stays put, so nothing
 * shifts when the loader leaves) and the (workspace-wide) Lenis is stopped.
 * Two loaders can overlap during one change (VaultLayout's, then
 * loading.js's), so the lock is counted: it goes on with the first loader and
 * comes off with the last, rather than each one restoring what it saw.
 */
let activeLoaders = 0;

/**
 * True while a page-change loader is on screen. Code that force-starts Lenis
 * on a route change (VaultLayout, SearchBar) checks this and leaves it stopped;
 * the last loader to go starts it again.
 */
export const isRouteLoading = () => activeLoaders > 0;

export function RouteLoading({ className = "sticky top-0 flex h-screen w-full items-center justify-center" }) {
  const lenis = useLenis();

  useEffect(() => {
    activeLoaders += 1;
    holdPageScroll();
    lenis?.stop();
    return () => {
      activeLoaders -= 1;
      // Lenis first: its stopped state clips the page's overflow, which would drop the
      // scrollbar for a frame between the release and the start
      if (activeLoaders === 0) lenis?.start();
      releasePageScroll();
    };
  }, [lenis]);

  return (
    <div className={className}>
      <GridDots size={56} squareSize={8} className="text-primary" />
    </div>
  );
}
