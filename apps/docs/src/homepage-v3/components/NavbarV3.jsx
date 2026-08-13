"use client";
import { HyperiuxLogo } from "@/utils/Icons";
import React, { useRef, useState, useCallback, useEffect } from "react";
import ButtonV3 from "./ButtonV3";
import HoverLinkV3 from "./HoverLinkV3";
import { PlusIcon } from "lucide-react";
import { useLenis } from "lenis/react";
import { GlobalSearch } from "@/components/layout/SearchBar";
import { useLoaderV3Complete } from "./loader-v3-state";

// The loader announces itself as its field *starts* bursting apart, so the bar
// has to wait that out — otherwise it slides in behind a panel that is still
// opaque. It also sits behind the hero's ASCII field arriving, which is the
// beat before this one: field, then bar, then hero copy. Kept a little ahead of
// Hero's own AT_HEADING so the 500ms slide has landed before the copy moves.
const INTRO_DELAY_MS = 1200;

/**
 * @param {boolean} introOnLoader — hold the bar off-screen until the loader has
 *   cleared, then drop it in ahead of the hero copy. Only the v3 homepage mounts
 *   a loader; everywhere else the bar is in place from the first paint.
 */
export default function NavbarV3({ effects = [], introOnLoader = false }) {
  const navRef = useRef(null);
  const [reveal, setReveal] = useState(true);
  const [introReady, setIntroReady] = useState(!introOnLoader);
  const [openTrigger, setOpenTrigger] = useState(0);
  const openSearch = useCallback(() => {
    setOpenTrigger((value) => value + 1);
  }, []);

  // Ignored unless this page opted in, so the bar never waits on a loader that
  // isn't there.
  const loaderComplete = useLoaderV3Complete();

  useEffect(() => {
    if (introReady || !loaderComplete) return;

    const timer = window.setTimeout(() => setIntroReady(true), INTRO_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [introReady, loaderComplete]);

  useLenis(({ scroll, velocity }) => {
    if (scroll < 100) {
      setReveal(true);
      return;
    }
    if (velocity > 0.1) {
      setReveal(false);
    } else if (velocity < -0.2) {
      setReveal(true);
    }
  });

  return (
    <>
      <nav
        ref={navRef}
        className={`py-[2vw] flex max-md:hidden items-center justify-between w-full fixed z-900 top-0 left-0 px-[3vw] transition-transform duration-500 ease-out motion-reduce:transition-none ${reveal && introReady ? "translate-y-0" : "translate-y-[-120%]"}`}
        style={{ willChange: "transform" }}
      >
        <div className="w-[10vw]  h-auto ">
          <HyperiuxLogo className="text-primary size-full " />
        </div>

        <div className="flex bg-[#121212] t20 px-[1.5vw] py-[1.4vw] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center gap-[2.5vw]">
          <HoverLinkV3 href="/" text="Categories" className="group">
            <div className="size-[1.65vw] flex items-center justify-center bg-grey p-1 text-primary">
              <div className="group-hover:rotate-180 transition-all duration-300">
                <PlusIcon className="size-full" />
              </div>
            </div>
          </HoverLinkV3>
          <HoverLinkV3 href="/" text="Docs" className="group">
            <div className="size-[1.65vw] flex items-center justify-center bg-grey p-1 text-primary">
              <div className="group-hover:rotate-180 size-full transition-all duration-300">
                <PlusIcon className="size-full" />
              </div>
            </div>
          </HoverLinkV3>
          <HoverLinkV3 href="/pricing" text="Pricing" />
          <HoverLinkV3
            href="https://github.com/hyperiux"
            target_blank
            text="Github"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openSearch}
            className="group flex py-[.8vw] cursor-pointer items-center gap-4  bg-background! px-3 text-xs text-white/70 backdrop-blur-md transition-colors duration-300 hover:bg-white/10 hover:border-[#ff5f00] hover:text-forground max-md:hidden max-md:gap-3"
            aria-label="Search effects"
          >
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0 text-current"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-sm text-white/70 max-md:hidden">Search</span>
            </div>

            <kbd className="space-x-2 rounded bg-foreground/20 px-1.5 py-0.5 text-sm text-current opacity-50 max-[1025px]:hidden">
              ⌘K
            </kbd>
          </button>
          <ButtonV3 text="Login" />
        </div>
      </nav>

      <GlobalSearch effects={effects} externalOpen={openTrigger} />
    </>
  );
}
