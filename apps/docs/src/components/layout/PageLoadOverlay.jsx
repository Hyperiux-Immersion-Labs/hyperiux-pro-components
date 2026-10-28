"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { GridDots } from "@/components/grid-dots";
import { hasOwnLoader } from "./ownLoaderRoutes";

// Longest a vault page waits for its sidebar before the cover lifts anyway - generous,
// since a slow first load (a dev compile) can take a few seconds to hydrate
const SIDEBAR_WAIT_MS = 3000;

/**
 * A full-screen background-coloured cover on top of everything, server-rendered so it
 * is there from the first paint of every load / reload, and hidden (gsap.set, no
 * animation) once the page is ready - so nothing shows half-styled or half-initialised.
 * pointer-events: none, so it never blocks input. It lives in the root layout, which
 * stays mounted on client navigation, so it only ever covers a full page load.
 *
 * Styled inline, not with classes: the stylesheet can arrive after the first paint (dev
 * especially), and the cover has to be there before it.
 *
 * On vault pages (the sidebar is in the HTML) it waits for VaultLayout's
 * "vault:sidebar-ready" - the stored open / closed sidebar state applied - so the
 * layout never visibly shifts; anywhere else it lifts at hydration.
 */
export function PageLoadOverlay() {
  const ref = useRef(null);
  // "/index" too: Vercel regenerates the cached homepage (ISR) with that path, so
  // the server renders "/index" where the browser has "/" - treating only "/" as
  // home made the two disagree, failing hydration and re-rendering the whole page
  // (which also duplicated every JSON-LD script in <body>).
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/index";
  // Only the page a visit starts on is ever covered (the cover stays mounted across
  // client navigation), so a visit that starts on the homepage, or on a template demo
  // (/template-demo/*, which brings its own loader), never draws it
  const [noCover] = useState(isHome || hasOwnLoader(pathname));

  useLayoutEffect(() => {
    // A missing URL is served the prebuilt 404, rendered for Next's own not-found path
    // rather than the URL asked for - so on /template-demo/* the server draws the cover
    // while the client (noCover) renders nothing and never gets the ref. Lifting it
    // through the ref alone left that cover up for good: the grid on screen, the page
    // under it unseen. Find the server's copy too.
    const cover = ref.current ?? document.querySelector("[data-page-load-overlay]");
    if (!cover) return undefined;
    const hide = () => gsap.set(cover, { opacity: 0 });
    if (!document.querySelector("[data-vault-sidebar]") || window.__vaultSidebarReady) {
      hide();
      return undefined;
    }
    const fallback = setTimeout(hide, SIDEBAR_WAIT_MS);
    const onReady = () => {
      clearTimeout(fallback);
      hide();
    };
    window.addEventListener("vault:sidebar-ready", onReady, { once: true });
    return () => {
      clearTimeout(fallback);
      window.removeEventListener("vault:sidebar-ready", onReady);
    };
  }, []);

  // The homepage paints straight from the server HTML: its loader and hero intro decide
  // before the first paint what to hide (lib/intro-gate.js), so no cover waits for React
  if (noCover) return null;

  return (
    <>
      <div
        ref={ref}
        data-page-load-overlay
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2147483647,
          pointerEvents: "none",
          background: "var(--background, #111111)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <GridDots
          size={56}
          squareSize={8}
          color="var(--primary)"
          style={{
            display: "inline-grid",
            gap: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </div>
      {/* No JavaScript, no hydration: never leave the page covered */}
      <noscript>
        <style>{"[data-page-load-overlay]{display:none}"}</style>
      </noscript>
    </>
  );
}
