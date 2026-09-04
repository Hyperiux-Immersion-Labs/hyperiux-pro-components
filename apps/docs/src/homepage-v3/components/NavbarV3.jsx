"use client";
import { HyperiuxLogo } from "@/utils/Icons";
import React, { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import ButtonV3 from "./ButtonV3";
import HoverLinkV3 from "./HoverLinkV3";
import { PlusIcon } from "lucide-react";
import { useLenis } from "lenis/react";
import { GlobalSearch } from "@/components/layout/SearchBar";
import { WISHLIST_CHANGED_EVENT } from "@/lib/wishlistEvents";
import { useLoaderV3Complete, useLoaderV3Handoff } from "./loader-v3-state";
import NavDropdownV3 from "./NavDropdownV3";
import NavbarMobileV3 from "./NavbarMobileV3";
import Link from "next/link";

// Dynamic so ProfileDropDown's Clerk imports never load on marketing routes -
// it only renders when isSignedIn, which is always false there (same
// reasoning as VaultHeader.jsx, which this mirrors).
const ProfileDropdown = dynamic(
  () => import("@/components/layout/ProfileDropDown"),
  { ssr: false }
);

// Fallback only. The loader normally lands its mark on the logo and says so,
// and the bar comes in on that beat — this is what covers an exit that never
// gets there (the burst, or the loader bailing out early).
const INTRO_DELAY_MS = 2400;

// isSignedIn/user default to signed-out (not Clerk-aware by itself) since
// this component is also rendered on marketing routes with no ClerkProvider
// in the tree (see Homepage.jsx) - callers on (app)-group pages that DO have
// Clerk available (e.g. VaultShell, used by the pricing page) should read
// useUser() themselves and pass the live values down, same pattern as
// AppVaultHeader supplying VaultHeader with real auth state.
export default function NavbarV3({
  effects = [],
  introOnLoader = false,
  isSignedIn = false,
  user = null,
}) {
  const navRef = useRef(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [usage, setUsage] = useState(null);
  const [reveal, setReveal] = useState(true);
  const [introTimedOut, setIntroTimedOut] = useState(!introOnLoader);
  const [openTrigger, setOpenTrigger] = useState(0);
  const [openPanel, setOpenPanel] = useState(null);
  // Touch (and pen) on a desktop-width bar still fires hover then click in one
  // tap: pointerenter opens, the click toggle closes, then a compatibility
  // mouseleave closes again. Hover is mouse-only; a tap toggles and stays.
  const pointerTypeRef = useRef("mouse");
  const openSearch = useCallback(() => {
    setOpenTrigger((value) => value + 1);
  }, []);
  const closePanel = useCallback(() => setOpenPanel(null), []);
  const markPointer = useCallback((event) => {
    pointerTypeRef.current = event.pointerType || "mouse";
  }, []);
  const openOnHover = useCallback((key) => (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    pointerTypeRef.current = "mouse";
    setOpenPanel(key);
  }, []);
  const closeOnHover = useCallback(() => {
    if (pointerTypeRef.current !== "mouse") return;
    setOpenPanel(null);
  }, []);
  const openOnFocus = useCallback((key) => (event) => {
    // A tap focuses the link; opening here races the click and shuts the panel.
    if (!event.target.matches(":focus-visible")) return;
    pointerTypeRef.current = "mouse";
    setOpenPanel(key);
  }, []);
  const togglePanel = useCallback((event, key) => {
    event.preventDefault();
    setOpenPanel((current) => (current === key ? null : key));
  }, []);
  const loaderComplete = useLoaderV3Complete();
  const loaderHandoff = useLoaderV3Handoff();
  // The handoff is the real cue: the loader's mark has come to rest on the logo
  // and the bar fades up around it, in place. It must not slide in on this —
  // the logo is already where it belongs and moving it would undo the merge.
  const introReady = introTimedOut || loaderHandoff;

  useEffect(() => {
    if (introTimedOut || !loaderComplete) return;

    const timer = window.setTimeout(() => setIntroTimedOut(true), INTRO_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [introTimedOut, loaderComplete]);

  // Feeds ProfileDropdown's "Saved Effects"/"Usage" rows - same fetches
  // VaultHeader.jsx runs for the (app)-group header, so the dropdown shows
  // real data here too instead of just the avatar shell.
  useEffect(() => {
    if (!isSignedIn) return;

    async function loadWishlistCount() {
      try {
        const res = await fetch("/api/wishlist");

        if (!res.ok) return;

        const data = await res.json();

        setWishlistCount(data.length);
      } catch (err) {
        console.error(err);
      }
    }

    loadWishlistCount();
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;

    async function loadUsage() {
      try {
        const res = await fetch("/api/copy-usage");

        if (!res.ok) return;

        const data = await res.json();

        setUsage(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadUsage();
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;

    const handleWishlistChanged = (e) => {
      setWishlistCount((count) =>
        e.detail?.saved ? count + 1 : Math.max(0, count - 1)
      );
    };

    window.addEventListener(WISHLIST_CHANGED_EVENT, handleWishlistChanged);

    return () => {
      window.removeEventListener(WISHLIST_CHANGED_EVENT, handleWishlistChanged);
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (!openPanel) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpenPanel(null);
    };

    const onPointerDownOutside = (event) => {
      if (navRef.current?.contains(event.target)) return;
      setOpenPanel(null);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDownOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDownOutside);
    };
  }, [openPanel]);

  useLenis(({ scroll, velocity }) => {
    if (scroll < 100) {
      setReveal(true);
      return;
    }
    if (velocity > 0.1) {
      setReveal(false);
      setOpenPanel(null);
    } else if (velocity < -0.2) {
      setReveal(true);
    }
  });

  return (
    <>
      <nav
        ref={navRef}
        // The intro is a fade in place — the loader's mark lands on the logo
        // where it already sits, so the bar can only appear around it. Sliding
        // is reserved for the scroll reveal, once the bar is its own again.
        // `translate` is listed alongside `transform`: the translate-y utilities
        // set the `translate` property, so leaving it out snaps the slide and
        // only the opacity reads.
        className={`py-[2vw] flex max-[1025px]:hidden items-center justify-between w-full fixed z-900 top-0 left-0 px-[3vw] transition-[transform,translate,opacity] duration-500 ease-out motion-reduce:transition-none ${!introReady
          ? "translate-y-0 opacity-0 pointer-events-none"
          : reveal
            ? "translate-y-0 opacity-100"
            : "translate-y-[-120%] opacity-100"
          }`}
        style={{ willChange: "transform" }}
        onPointerDownCapture={markPointer}
        onMouseLeave={closeOnHover}
      >
        {/* `data-nav-logo` is what the loader measures to find where to dock. */}
        <Link
          href="/"
          data-nav-logo
          aria-label="Hyperiux Vault home"
          className="w-[10vw]  h-auto "
        >
          <HyperiuxLogo className="text-primary size-full " />
        </Link>

        {/* Everything that isn't the logo trails it, so the mark reads as
            having been there first and the bar as assembling around it. */}
        <div
          className={`flex bg-[#121212] t20 px-[1.5vw] py-[1vw] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center gap-[2.5vw] transition-opacity duration-500 delay-200 ease-out motion-reduce:transition-none ${introReady ? "opacity-100" : "opacity-0"}`}
        >
          <div
            className="flex"
            onPointerEnter={openOnHover("categories")}
            onFocusCapture={openOnFocus("categories")}
          >
            <HoverLinkV3
              href="/effects"
              text="Effects"
              className="group"
              onClick={(event) => togglePanel(event, "categories")}
            >
              <div className="size-[1.65vw] flex items-center justify-center bg-grey p-1 text-primary">
                <div
                  className={`group-hover:rotate-180 transition-all duration-300 ${openPanel === "categories" ? "rotate-180" : ""}`}
                >
                  <PlusIcon className="size-full" />
                </div>
              </div>
            </HoverLinkV3>
          </div>
          <div
            className="flex"
            onPointerEnter={openOnHover("docs")}
            onFocusCapture={openOnFocus("docs")}
          >
            <HoverLinkV3
              href="/docs"
              text="Docs"
              className="group"
              onClick={(event) => togglePanel(event, "docs")}
            >
              <div className="size-[1.65vw] flex items-center justify-center bg-grey p-1 text-primary">
                <div
                  className={`group-hover:rotate-180 size-full transition-all duration-300 ${openPanel === "docs" ? "rotate-180" : ""}`}
                >
                  <PlusIcon className="size-full" />
                </div>
              </div>
            </HoverLinkV3>
          </div>
          <div
            className="flex"
            onPointerEnter={closeOnHover}
            onFocusCapture={closeOnHover}
          >
            <HoverLinkV3 href="/pricing" text="Pricing" />
          </div>
          <div
            className="flex"
            onPointerEnter={closeOnHover}
            onFocusCapture={closeOnHover}
          >
            <HoverLinkV3
              href="https://github.com/hyperiux"
              target_blank
              text="Github"
            />
          </div>
        </div>
        <div
          className={`flex items-center gap-2 transition-opacity duration-500 delay-200 ease-out motion-reduce:transition-none ${introReady ? "opacity-100" : "opacity-0"}`}
        >
          <button
            type="button"
            onClick={openSearch}
            className="group flex py-[.86vw] cursor-pointer items-center gap-4  bg-[#121212]! px-3 text-xs text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/10 hover:border-[#ff5f00] hover:text-forground max-md:hidden max-md:gap-3"
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
            </div>

            <kbd className="space-x-2 rounded bg-foreground/20 px-1.5 py-0.5 text-sm text-current max-md:hidden">
              ⌘ K
            </kbd>
          </button>
          {isSignedIn ? (
            <ProfileDropdown
              savedCount={wishlistCount}
              usage={usage}
              plan={user?.publicMetadata?.plan || "free"}
            />
          ) : (
            <ButtonV3 href="/sign-in" text="Sign In" />
          )}
        </div>

        <NavDropdownV3 panel={openPanel} onNavigate={closePanel} />
      </nav>

      <NavbarMobileV3
        visible={reveal}
        intro={introReady}
        onSearch={openSearch}
      />

      <GlobalSearch effects={effects} externalOpen={openTrigger} />
    </>
  );
}
