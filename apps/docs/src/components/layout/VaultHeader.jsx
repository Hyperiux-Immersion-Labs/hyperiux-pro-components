"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlobalSearch } from "./SearchBar";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Dynamic so ProfileDropDown's Clerk imports never load on marketing routes -
// it only renders when isSignedIn, which is always false there.
const ProfileDropdown = dynamic(() => import("./ProfileDropDown"), {
  ssr: false,
});
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { effectCategories, getEffectCategoryHref } from "@/lib/categories";
import { WISHLIST_CHANGED_EVENT } from "@/lib/wishlistEvents";
import { prefersReducedMotion } from "@/lib/motion";
import { markScrollToPricingCards } from "@/lib/pricingScrollIntent";
import ButtonV3 from "@/homepage-v3/components/ButtonV3";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// Matches NavbarMobileV3's own overlay-reveal mechanism exactly - a
// clip-path wipe from the bottom up, rather than a translate/slide.
const CLOSED_CLIP = "inset(0% 0% 100% 0%)";
const OPEN_CLIP = "inset(0% 0% 0% 0%)";

const DOCS_TOP_LINKS = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/cli", label: "CLI" },
  { href: "/docs/dependencies", label: "Dependencies" },
  { href: "/docs/license", label: "License" },
];

const MOBILE_SECONDARY_LINKS = [
  {
    href: "https://github.com/Hyperiux-Immersion-Labs/hyperiux-components",
    label: "Github",
    external: true,
  },
  {
    href: "https://www.npmjs.com/package/hyperiux",
    label: "NPM",
    external: true,
  },
  { href: "/docs/mcp", label: "MCP Doc" },
];

function categoryLabel(category) {
  return category.name.replace("Website ", "").replace("Page ", "");
}

// Copied from NavbarMobileV3's Accordion verbatim - animates to the
// measured height (then releases it to "auto" once open, so the panel can
// still reflow on orientation change/font swap) rather than a fixed guess.
function MobileNavAccordion({ open, children }) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useIsoLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    gsap.killTweensOf(wrapper);

    const duration = prefersReducedMotion() ? 0 : open ? 0.4 : 0.3;

    gsap.to(wrapper, {
      height: open ? content.scrollHeight : 0,
      opacity: open ? 1 : 0,
      duration,
      ease: open ? "power3.out" : "power2.inOut",
      onComplete: () => {
        if (open) gsap.set(wrapper, { height: "auto" });
      },
    });

    return () => gsap.killTweensOf(wrapper);
  }, [open]);

  return (
    <div ref={wrapperRef} className="h-0 overflow-hidden opacity-0">
      <div ref={contentRef} className="pb-[6vw] md:pb-[3.5vw]">
        {children}
      </div>
    </div>
  );
}

// Clerk-free by design: auth state arrives via props (anonymous defaults) so
// marketing routes (docs/legal/tech) render this without ClerkProvider. App
// routes use AppVaultHeader, which supplies live useUser() state.
//
// Mobile/tablet (<=1025px) is built to match NavbarMobileV3's bar + overlay
// exactly (translucent blurred bar, custom two-span hamburger, full-screen
// clip-path reveal, GSAP-height accordions) - see MobileNavAccordion above
// and the effect below driving the overlay's own open/close timeline. The
// desktop header (>1025px) is untouched.
export function VaultHeader({
  effectName,
  showSearch = false,
  effects = [],
  isLoaded = true,
  isSignedIn = false,
  user = null,
  // Dashboard renders its own desktop nav (back button + tabs in
  // DashboardShell) - it only needs this component for the mobile/tablet
  // bar + hamburger overlay, so it opts out of the >1025px header bar here
  // rather than showing a second, redundant one.
  mobileOnly = false,
}) {
  const [openTrigger, setOpenTrigger] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [usage, setUsage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const [open, setOpen] = useState(false);
  const [section, setSection] = useState(null);
  const overlayRef = useRef(null);
  const timelineRef = useRef(null);
  const openedRef = useRef(false);
  const desktopHeaderRef = useRef(null);
  const mobileBarRef = useRef(null);
  const lenis = useLenis();

  const pathname = usePathname();
  const [routeShown, setRouteShown] = useState(pathname);

  const hideFoundingAccess =
    pathname?.startsWith("/docs") || pathname?.startsWith("/legal");

  // Hide the "Browse Free Effects" / Sign In prompt on the effect category
  // page (/effects/[slug]) only. Still show on the individual effect page
  // (/effects/[slug]/[effectSlug]) and everywhere else.
  const effectsSegments = pathname?.split("/").filter(Boolean) ?? [];
  const isEffectCategoryPage =
    effectsSegments[0] === "effects" && effectsSegments.length === 2;

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
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 40);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Both fixed bars (desktop header, mobile/tablet bar) slide fully out of
  // view once the page's footer (FooterV3, id="footer") starts entering the
  // viewport, instead of staying pinned on top of it - reverses the moment
  // the user scrolls back up past that point. Pages that don't render a
  // #footer (e.g. /tech) just never trigger this, nothing to guard beyond
  // the null check.
  useEffect(() => {
    const footer = document.getElementById("footer");
    const targets = [desktopHeaderRef.current, mobileBarRef.current].filter(Boolean);

    if (!footer || !targets.length) return;

    const hide = () =>
      gsap.to(targets, { yPercent: -100, duration: 0.4, ease: "power2.out" });
    const show = () =>
      gsap.to(targets, { yPercent: 0, duration: 0.4, ease: "power2.out" });

    const trigger = ScrollTrigger.create({
      trigger: footer,
      start: "top bottom",
      onEnter: hide,
      onLeaveBack: show,
    });

    return () => {
      trigger.kill();
      gsap.killTweensOf(targets);
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setSection(null);
  }, []);

  // A tapped link navigates under the open overlay, so the route landing is
  // what dismisses it. Adjusted during render (not from an effect) so the
  // overlay never paints once over the page it just left - same technique
  // as NavbarMobileV3.
  if (pathname !== routeShown) {
    setRouteShown(pathname);
    setOpen(false);
    setSection(null);
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop?.();

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start?.();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, lenis, close]);

  useIsoLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const rows = overlay.querySelectorAll("[data-mobile-row]");
    const targets = [overlay, ...rows];

    timelineRef.current?.kill();
    gsap.killTweensOf(targets);

    const cleanup = () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf(targets);
    };

    // Nothing to play back on the first render - the overlay just needs to
    // start out of the way.
    if (!open && !openedRef.current) {
      gsap.set(overlay, { autoAlpha: 0, clipPath: CLOSED_CLIP });
      return cleanup;
    }

    const reduce = prefersReducedMotion();
    const timeline = gsap.timeline();
    timelineRef.current = timeline;

    if (open) {
      openedRef.current = true;

      gsap.set(overlay, { autoAlpha: 1 });

      if (reduce) {
        timeline
          .set(overlay, { clipPath: OPEN_CLIP })
          .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2 })
          .set(rows, { opacity: 1, y: 0 });

        return cleanup;
      }

      timeline
        .fromTo(
          overlay,
          { clipPath: CLOSED_CLIP },
          { clipPath: OPEN_CLIP, duration: 0.5, ease: "power3.inOut" },
          0
        )
        .fromTo(
          rows,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.05,
            clearProps: "opacity,transform",
          },
          0.18
        );

      return cleanup;
    }

    if (reduce) {
      timeline.to(overlay, { autoAlpha: 0, duration: 0.15 });

      return cleanup;
    }

    timeline
      .to(
        rows,
        {
          opacity: 0,
          y: 12,
          duration: 0.2,
          ease: "power2.in",
          stagger: { each: 0.02, from: "end" },
        },
        0
      )
      .to(
        overlay,
        { clipPath: CLOSED_CLIP, duration: 0.38, ease: "power3.inOut" },
        0.06
      )
      .set(overlay, { autoAlpha: 0 });

    return cleanup;
  }, [open]);

  const openSearch = () => {
    setOpenTrigger((value) => value + 1);
  };

  const handleSearch = useCallback(() => {
    close();
    setOpenTrigger((value) => value + 1);
  }, [close]);

  const toggleSection = (key) => {
    setSection((current) => (current === key ? null : key));
  };

  return (
    <>
      {/* Desktop header - untouched, >1025px only (or never, when mobileOnly). */}
      <header
        ref={desktopHeaderRef}
        className={`fixed left-0 right-0 top-(--announcement-offset) transition-[top] duration-300 ease-out z-50 px-[2vw] py-5 ${mobileOnly ? "hidden" : "max-[1025px]:hidden"} ${isScrolled ? "bg-black/20 shadow-md backdrop-blur-sm" : ""
          }`}
      >
        <div className="flex h-full items-center justify-end gap-3">
          <div className="flex items-center gap-3">
            {showSearch && (
              <button
                type="button"
                onClick={openSearch}
                className="group flex  py-[0.9vw] cursor-pointer items-center gap-4 bg-[#161616] px-3 text-xs text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/10 hover:border-[#ff5f00] hover:text-forground max-md:hidden max-md:gap-3"
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
                <kbd className="space-x-2 rounded bg-foreground/20 px-1.5 py-0.5 text-sm text-current max-[1025px]:hidden">
                  ⌘ K
                </kbd>
              </button>
            )}

            {isLoaded && !hideFoundingAccess && user?.publicMetadata?.plan !== "pro" && (
              <div className="block max-[1025px]:hidden">
                <ButtonV3
                  text="Upgrade to Pro"
                  id={"upgrade-to-pro-navbar"}
                  href="/pricing#pricing-cards"
                  onClick={markScrollToPricingCards}
                  className="border-white/50!"
                  variant="outline"
                />
              </div>
            )}

            {isLoaded && (!isSignedIn ? (
              !isEffectCategoryPage && (
                <div className="block max-[1025px]:hidden">
                  <ButtonV3
                    text="Sign In"
                    id={"sign-in-navbar"}
                    href="/sign-in"
                    variant="outline2"
                  />
                </div>
              )
            ) : (
              <div className="max-[1025px]:hidden">
                <ProfileDropdown savedCount={wishlistCount} usage={usage} plan={user?.publicMetadata?.plan || "free"} />
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile/tablet bar - <=1025px only, matches NavbarMobileV3. */}
      <div
        ref={mobileBarRef}
        className="fixed top-0 left-0 z-950 hidden max-[1025px]:flex w-full items-center justify-between border-b border-white/8 bg-background/60 px-[6vw] py-[5vw] backdrop-blur-xl md:px-[3.5vw] md:py-[2.5vw]"
      >
        <Link
          href="/effects"
          onClick={close}
          aria-label="Hyperiux Vault home"
          className="flex items-center gap-[2.5vw] md:gap-[1.2vw]"
        >
          <Image
            src="/hyperiux.svg"
            alt="Hyperiux"
            width={28}
            height={28}
            className="h-[7vw] w-[7vw] shrink-0 md:h-[3.4vw] md:w-[3.4vw]"
          />
          <Image
            src="/hyperiux-wordmark.svg"
            alt="Hyperiux"
            width={128}
            height={37}
            className="h-auto w-[26vw] md:w-[11vw]"
          />
        </Link>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          className="relative flex size-[10vw] shrink-0 items-center justify-center bg-[#161616] text-primary md:size-[5vw]"
        >
          <span
            aria-hidden="true"
            className={`absolute h-px w-[4.5vw] bg-current transition-transform duration-300 ease-out motion-reduce:transition-none md:w-[2.4vw] ${open ? "rotate-45" : "-translate-y-[1.2vw] md:translate-y-[-0.6vw]"
              }`}
          />
          <span
            aria-hidden="true"
            className={`absolute h-px w-[4.5vw] bg-current transition-transform duration-300 ease-out motion-reduce:transition-none md:w-[2.4vw] ${open ? "-rotate-45" : "translate-y-[1.2vw] md:translate-y-[0.6vw]"
              }`}
          />
        </button>
      </div>

      {/* Mobile/tablet overlay - full-screen clip-path reveal. */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-940 hidden bg-background max-[1025px]:block"
        style={{ visibility: "hidden", opacity: 0 }}
      >
        <div
          data-lenis-prevent
          className="mobile-nav-scroll absolute inset-0 overflow-y-auto px-[6vw] pt-[22vw] pb-[12vw] md:px-[3.5vw] md:pt-[11vw] md:pb-[7vw]"
        >
          {isSignedIn && (
            <Link
              data-mobile-row
              href="/dashboard"
              onClick={close}
              className="flex w-full my-[5vw] items-center justify-between border border-white/10 bg-[#121212] px-[4vw] py-[3.5vw] text-left text-white/90 md:my-[3vw] md:px-[2.3vw] md:py-[2vw]"
            >
              <span className="text-[4vw] md:text-[2.2vw]">Account</span>
              <ChevronRight className="size-[4.5vw] shrink-0 md:size-[2.6vw]" />
            </Link>
          )}

          {showSearch && (
            <button
              data-mobile-row
              type="button"
              onClick={handleSearch}
              className="flex w-full my-[5vw] items-center justify-between border border-white/10 bg-[#121212] px-[4vw] py-[3.5vw] text-left text-white/70 md:my-[3vw] md:px-[2.3vw] md:py-[2vw]"
            >
              <span className="text-[4vw] md:text-[2.2vw]">Search</span>
              <span className="flex items-center gap-[3vw] md:gap-[1.8vw]">
                <svg
                  className="size-[4.5vw] shrink-0 md:size-[2.6vw]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </button>
          )}

          <div className="mt-[2vw] md:mt-[1.2vw]">
            <Link
              data-mobile-row
              href="/effects"
              onClick={close}
              className="flex border-t border-white/10 py-[4.5vw] max-md:text-[5.5vw] max-[1025px]:text-[3.2vw] text-white/90 md:py-[2.6vw] "
            >
              All Effects
            </Link>

            <div data-mobile-row className="border-t border-white/10">
              <button
                type="button"
                onClick={() => toggleSection("categories")}
                aria-label={`${section === "categories" ? "Collapse" : "Expand"} Categories`}
                aria-expanded={section === "categories"}
                className="flex w-full items-center justify-between py-[4.5vw] text-left max-md:text-[5.5vw]! max-[1025px]:text-[3.2vw]! text-white/90 md:py-[2.6vw] "
              >
                <span>Categories</span>
                <div className="relative flex size-[8vw] shrink-0 items-center justify-center bg-[#161616] text-primary md:size-[4.6vw]">
                  <span aria-hidden="true" className="absolute h-px w-[3.5vw] bg-current md:w-[2vw]" />
                  <span
                    aria-hidden="true"
                    className={`absolute h-px w-[3.5vw] bg-current md:w-[2vw] transition-transform duration-300 ease-out motion-reduce:transition-none ${section === "categories" ? "rotate-180" : "rotate-90"
                      }`}
                  />
                </div>
              </button>

              <MobileNavAccordion open={section === "categories"}>
                <div className="flex flex-col">
                  {effectCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={getEffectCategoryHref(category.id)}
                      onClick={close}
                      className="flex items-center py-[2.6vw] text-[4vw] text-white/75 active:text-primary md:py-[1.5vw] md:text-[2.2vw]"
                    >
                      {categoryLabel(category)}
                    </Link>
                  ))}
                </div>
              </MobileNavAccordion>
            </div>

            <div data-mobile-row className="border-t border-white/10">
              <button
                type="button"
                onClick={() => toggleSection("documentation")}
                aria-label={`${section === "documentation" ? "Collapse" : "Expand"} Documentation`}
                aria-expanded={section === "documentation"}
                className="flex w-full items-center justify-between py-[4.5vw] text-left max-md:text-[5.5vw]! max-[1025px]:text-[3.2vw]! text-white/90 md:py-[2.6vw]"
              >
                <span>Documentation</span>
                <div className="relative flex size-[8vw] shrink-0 items-center justify-center bg-[#161616] text-primary md:size-[4.6vw]">
                  <span aria-hidden="true" className="absolute h-px w-[3.5vw] bg-current md:w-[2vw]" />
                  <span
                    aria-hidden="true"
                    className={`absolute h-px w-[3.5vw] bg-current md:w-[2vw] transition-transform duration-300 ease-out motion-reduce:transition-none ${section === "documentation" ? "rotate-180" : "rotate-90"
                      }`}
                  />
                </div>
              </button>

              <MobileNavAccordion open={section === "documentation"}>
                <div className="flex flex-col">
                  {DOCS_TOP_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className="flex items-center py-[2.6vw] text-[4vw] text-white/75 active:text-primary md:py-[1.5vw] md:text-[2.2vw]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </MobileNavAccordion>
            </div>

            {MOBILE_SECONDARY_LINKS.map((link) => (
              <Link
                key={link.href}
                data-mobile-row
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={close}
                className="flex border-t border-white/10 py-[4.5vw] text-[5.5vw] text-white/90 md:py-[2.6vw] md:text-[3.2vw]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {isLoaded && (
            <div data-mobile-row className="mt-[8vw] flex flex-col gap-[3vw] md:mt-[4.6vw] md:gap-[1.5vw]">
              {!hideFoundingAccess && user?.publicMetadata?.plan !== "pro" && (
                <ButtonV3
                  text="Upgrade to Pro"
                  href="/pricing#pricing-cards"
                  onClick={() => {
                    close();
                    markScrollToPricingCards();
                  }}
                  variant="outline"
                  className="w-full border-white/50! md:py-[1.5vw] md:text-[2vw] md:[--btn-pad:2.4vw] md:[--btn-gap:1vw] md:[--btn-square:1.4vw] md:[--btn-arrow:2vw]"
                />
              )}

              {!isSignedIn && !isEffectCategoryPage && (
                <ButtonV3
                  text="Sign In"
                  href="/sign-in"
                  onClick={close}
                  className="w-full md:py-[1.5vw] md:text-[2vw] md:[--btn-pad:2.4vw] md:[--btn-gap:1vw] md:[--btn-square:1.4vw] md:[--btn-arrow:2vw]"
                />
              )}
            </div>
          )}
        </div>
      </div>

      <GlobalSearch effects={effects} externalOpen={openTrigger} />
    </>
  );
}
