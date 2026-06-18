"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import gsap from "gsap";

import { HyperiuxLogo } from "@/utils/Icons";
import Button from "./Button";
import { navCategoryColumns, navDocsItems, vaultLinks } from "@/utils/Links";
import { HamburgerIcon } from "./Icons";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const NAVBAR_INTRO_DELAY = 0.15;

const categoryLinks = navCategoryColumns.flat();

const DROPDOWN_DATA = {
  categories: categoryLinks,
  docs: navDocsItems,
};

function cleanPath(path = "") {
  if (!path || path === "#") return "#";

  const withoutHash = path.split("#")[0];
  const withoutQuery = withoutHash.split("?")[0];

  if (withoutQuery.length > 1) {
    return withoutQuery.replace(/\/$/, "");
  }

  return withoutQuery || "/";
}

function isExternalHref(href = "") {
  return href.startsWith("http");
}

function isLoaderActive() {
  if (typeof window === "undefined") return false;

  return (
    document.body.classList.contains("loader-active") ||
    window.__HYPERIUX_LOADER_RUNNING__ === true ||
    Boolean(document.querySelector("#site-loader"))
  );
}

function isEffectsCategoryRoute(pathname) {
  const path = cleanPath(pathname);

  return path.startsWith("/effects/");
}

function isDocsRoute(pathname) {
  const path = cleanPath(pathname);

  return path === "/docs" || path.startsWith("/docs/");
}

function isCategoryItemActive(pathname, href) {
  if (!href || href === "#" || isExternalHref(href)) return false;

  const path = cleanPath(pathname);
  const itemPath = cleanPath(href);

  if (!itemPath.startsWith("/effects/")) return false;

  return path === itemPath || path.startsWith(`${itemPath}/`);
}

function isDocsItemActive(pathname, href) {
  if (!href || href === "#" || isExternalHref(href)) return false;

  const path = cleanPath(pathname);
  const itemPath = cleanPath(href);

  if (itemPath === "/docs") {
    return path === "/docs";
  }

  return path === itemPath || path.startsWith(`${itemPath}/`);
}

function isPlainLinkActive(pathname, href) {
  if (!href || href === "#" || isExternalHref(href)) return false;

  const path = cleanPath(pathname);
  const itemPath = cleanPath(href);

  if (itemPath === "/") {
    return path === "/";
  }

  if (itemPath === "/effects") {
    return path === "/effects";
  }

  if (itemPath === "/docs") {
    return path === "/docs";
  }

  return path === itemPath || path.startsWith(`${itemPath}/`);
}

function isTopNavItemActive(pathname, item) {
  const path = cleanPath(pathname);

  if (item.dropdown === "categories") {
    return isEffectsCategoryRoute(path);
  }

  if (item.dropdown === "docs") {
    return isDocsRoute(path);
  }

  if (item.href === "/effects") {
    return path === "/effects";
  }

  return isPlainLinkActive(path, item.href);
}

function MobileDropdownItem({ label, href, icon, dropdownType, onClose }) {
  const pathname = usePathname();

  const isActive =
    dropdownType === "categories"
      ? isCategoryItemActive(pathname, href)
      : dropdownType === "docs"
        ? isDocsItemActive(pathname, href)
        : isPlainLinkActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-white/70 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon && (
        <span className="flex max-sm:size-5 max-md:size-[4vw] shrink-0 items-center justify-center">
          <Image
            src={icon}
            alt="icon"
            width={28}
            height={28}
            className="size-full object-contain"
          />
        </span>
      )}

      <span className="max-sm:text-[4vw] max-md:text-[3vw] font-medium">
        {label}
      </span>
    </Link>
  );
}

function MobileDropdown({
  label,
  items,
  dropdownType,
  isOpen,
  isActive,
  onToggle,
  onClose,
}) {
  const contentRef = useRef(null);
  const wrapperRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    if (!contentRef.current || !wrapperRef.current) return;

    gsap.killTweensOf(wrapperRef.current);

    if (isOpen) {
      const height = contentRef.current.scrollHeight;

      gsap.to(wrapperRef.current, {
        height,
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      });
    } else {
      gsap.to(wrapperRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.inOut",
      });
    }
  }, [isOpen]);

  return (
    <div className="border-b border-white/5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span
          className={`max-sm:text-[5vw] max-md:text-[4vw] font-medium transition-colors duration-200 ${
            isActive ? "text-primary" : "text-white/90"
          }`}
        >
          {label}
        </span>

        <ChevronDown
          className={`size-5 transition-transform duration-300 max-md:size-[4vw] ${
            isOpen || isActive ? "text-primary" : "text-white/50"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div ref={wrapperRef} className="h-0 overflow-hidden opacity-0">
        <div ref={contentRef} className="flex flex-col gap-1 pb-4">
          {items.map((item) => (
            <MobileDropdownItem
              key={`${dropdownType}-${item.label}`}
              {...item}
              dropdownType={dropdownType}
              onClose={onClose}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NavbarMobile() {
  const navbarRef = useRef(null);
  const menuRef = useRef(null);
  const linksRef = useRef(null);

  const hidden = useRef(false);
  const introPlayed = useRef(false);
  const introTween = useRef(null);

  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (id) => {
    setOpenDropdown((current) => (current === id ? null : id));
  };

  const playNavbarIntro = () => {
    const navbar = navbarRef.current;

    if (!navbar) return;
    if (introPlayed.current) return;

    introPlayed.current = true;
    hidden.current = false;

    introTween.current?.kill();
    gsap.killTweensOf(navbar);

    introTween.current = gsap.delayedCall(NAVBAR_INTRO_DELAY, () => {
      gsap.fromTo(
        navbar,
        {
          autoAlpha: 0,
          y: -18,
          yPercent: 0,
        },
        {
          autoAlpha: 1,
          y: 0,
          yPercent: 0,
          duration: 0.75,
          ease: "power3.out",
        }
      );
    });
  };

  const toggleNavbar = (hide) => {
    if (!navbarRef.current) return;
    if (!introPlayed.current) return;
    if (hidden.current === hide) return;

    hidden.current = hide;

    gsap.killTweensOf(navbarRef.current);

    gsap.to(navbarRef.current, {
      yPercent: hide ? -100 : 0,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  useLenis(({ scroll, velocity }) => {
    if (isMenuOpen) return;

    if (scroll < 80) {
      toggleNavbar(false);
      return;
    }

    if (velocity > 0.1) {
      toggleNavbar(true);
    } else if (velocity < -0.15) {
      toggleNavbar(false);
    }
  });

  useIsomorphicLayoutEffect(() => {
    const navbar = navbarRef.current;

    if (!navbar) return;

    gsap.set(navbar, {
      autoAlpha: 0,
      y: -18,
      yPercent: 0,
    });
  }, []);

  useEffect(() => {
    let poll;
    let fallbackTimeout;

    const tryPlayIntro = () => {
      if (!isLoaderActive()) {
        if (poll) {
          window.clearInterval(poll);
          poll = null;
        }

        playNavbarIntro();
      }
    };

    window.addEventListener("loaderComplete", tryPlayIntro, {
      once: true,
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(tryPlayIntro);
    });

    poll = window.setInterval(tryPlayIntro, 80);

    fallbackTimeout = window.setTimeout(() => {
      /*
        This is the important fallback for pages that do not have a loader at all.
        If there is no loader running, the navbar becomes visible normally.
      */
      tryPlayIntro();
    }, 500);

    return () => {
      window.removeEventListener("loaderComplete", tryPlayIntro);

      if (poll) {
        window.clearInterval(poll);
      }

      if (fallbackTimeout) {
        window.clearTimeout(fallbackTimeout);
      }

      introTween.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      toggleNavbar(false);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handlePopState = () => {
      setIsMenuOpen(false);
      setOpenDropdown(null);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useIsomorphicLayoutEffect(() => {
    if (!menuRef.current || !linksRef.current) return;

    gsap.killTweensOf([menuRef.current, linksRef.current]);

    if (isMenuOpen) {
      gsap.set(menuRef.current, {
        display: "flex",
        pointerEvents: "auto",
      });

      gsap.fromTo(
        menuRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        }
      );

      const items = linksRef.current.children;

      gsap.fromTo(
        items,
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.06,
          delay: 0.1,
        }
      );
    } else {
      gsap.to(menuRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.inOut",
        onComplete: () => {
          if (menuRef.current) {
            gsap.set(menuRef.current, {
              display: "none",
              pointerEvents: "none",
            });
          }
        },
      });
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const navbar = navbarRef.current;
    const menu = menuRef.current;
    const links = linksRef.current;

    return () => {
      gsap.killTweensOf([navbar, menu, links]);
    };
  }, []);

  return (
    <>
      <nav
        id="mobile-navigation"
        ref={navbarRef}
        style={{
          opacity: 0,
          visibility: "hidden",
          transform: "translate3d(0, -18px, 0)",
        }}
        className="fixed left-0 top-0 z-1000 hidden w-full items-center justify-between border-b border-white/5 bg-black/90 px-6 py-4 backdrop-blur-xl max-md:flex"
      >
        <Link href="/" onClick={closeMenu}>
          <HyperiuxLogo className="h-auto max-sm:w-[40vw] text-primary max-md:w-[25vw]" />
        </Link>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="relative flex max-sm:size-[11vw] max-md:size-[8vw] items-center justify-center rounded-full text-white transition-colors"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="max-sm:size-[7vw] max-md:size-[4vw]" />
          ) : (
            <HamburgerIcon className="max-sm:size-[7vw] max-md:size-[4vw]" />
          )}
        </button>
      </nav>

      <div
        ref={menuRef}
        className="fixed inset-0 z-999 hidden bg-black opacity-0 pointer-events-none max-md:flex"
      >
        <div
          data-lenis-prevent
          className="absolute inset-0 overflow-y-auto px-[8vw] pt-24 pb-8"
        >
          <div ref={linksRef} className="flex flex-1 flex-col">
            {vaultLinks.map(({ label, href, dropdown }) => {
              const isExternal = href?.startsWith("http");
              const isActive = isTopNavItemActive(pathname, {
                label,
                href,
                dropdown,
              });

              if (dropdown) {
                return (
                  <MobileDropdown
                    key={label}
                    label={label}
                    dropdownType={dropdown}
                    items={DROPDOWN_DATA[dropdown] || []}
                    isOpen={openDropdown === dropdown}
                    isActive={isActive}
                    onToggle={() => toggleDropdown(dropdown)}
                    onClose={closeMenu}
                  />
                );
              }

              return (
                <Link
                  key={label}
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  onClick={closeMenu}
                  className={`border-b border-white/5 py-5 max-sm:text-[5vw] max-md:text-[4vw] font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-primary"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 border-t border-white/10 pt-8">
            <div className="flex w-full justify-center" onClick={closeMenu}>
              <Button text="Install CLI" href="/docs/installation" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}