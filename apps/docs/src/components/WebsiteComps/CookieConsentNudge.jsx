"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePrefetchFor } from "@/lib/prefetch";
import { usePathname } from "next/navigation";
import { isLoaderWaiting } from "@/homepage/components/loader-state";
const STORAGE_KEY = "hyperiux_cookie_notice_acknowledged";
// How far the visitor has to scroll before the notice comes up
const REVEAL_SCROLL_PX = 40;

export function CookieConsentNudge() {
  const [visible, setVisible] = useState(false);
  // Held back until the visitor starts scrolling, so it never sits on top of the loader
  const [revealed, setRevealed] = useState(false);
  const policyPrefetch = usePrefetchFor("/legal/privacy-policy");
  const pathname = usePathname();
  const isExcludedRoute =
    pathname.startsWith("/demo") || pathname.startsWith("/template-demo");

  // Intentional: localStorage only exists client-side, so this can't be the initial state without a hydration mismatch
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isExcludedRoute) return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      
      setVisible(true);
    }
  }, [isExcludedRoute]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!visible || revealed) return;
    // The homepage loader locks scroll and keeps the page at the top, so this
    // can't fire while it is up; the loader checks are belt and braces
    const onScroll = () => {
      if (window.scrollY < REVEAL_SCROLL_PX) return;
      if (isLoaderWaiting() || document.querySelector("[data-hx-loader-root]")) return;
      setRevealed(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visible, revealed]);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      
    }
  };

  if (isExcludedRoute) return null;
  if (!visible) return null;

  // One row, centred at the bottom: the notice and its "Learn more" link, then OK.
  // Rendered hidden from the start so the reveal is a plain CSS fade-up.
  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      aria-hidden={!revealed}
      className={`${revealed ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-[1.5vw] opacity-0 max-md:translate-y-[5vw]"} transition-[opacity,translate,visibility] duration-1000 ease-out motion-reduce:transition-none fixed bottom-[1.5vw] left-1/2 z-9000 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-[1.5vw] border border-white/10 bg-background p-[0.5vw] font-avenir shadow-float max-lg:bottom-[3vw] max-lg:gap-[4vw] max-lg:py-[2vw] max-lg:pr-[2vw] max-lg:pl-[2.4vw] max-md:bottom-[4vw] max-md:w-[calc(100vw-8vw)] max-md:gap-[5vw] max-md:py-[4vw] max-md:pr-[4vw] max-md:pl-[5vw]`}
    >
      <p className="text-[1vw] leading-snug text-white/75 max-lg:text-[1.9vw] max-md:text-[3.6vw]">
        This website uses cookies.{" "}
        <Link
          href="/legal/privacy-policy"
          prefetch={policyPrefetch}
          className="text-white underline underline-offset-2 transition-colors hover:text-primary"
        >
          {/* Says where it goes: "Learn More" fails the SEO descriptive-link-text check */}
          Learn More
        </Link>
      </p>

      <button
        // no id on the admin dashboard (no admin click tracking)
        id={/^\/dashboard\/[^/]+\/admin(\/|$)/.test(pathname || "") ? undefined : "cookie-consent-nudge-ok"}
        type="button"
        onClick={dismiss}
        className="shrink-0 cursor-pointer bg-black px-[0.8vw] py-[0.4vw] text-[0.9vw] text-white/75 border border-white/25 duration-300 transition-colors hover:bg-primary max-lg:px-[2.6vw] max-lg:py-[1.2vw] max-lg:text-[1.7vw] max-md:px-[5vw] max-md:py-[2.4vw] max-md:text-[3.4vw]"
      >
        OK
      </button>
    </div>
  );
}

export default CookieConsentNudge;
