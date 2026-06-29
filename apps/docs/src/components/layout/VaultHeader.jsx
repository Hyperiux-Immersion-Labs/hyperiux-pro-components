"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { GlobalSearch } from "./SearchBar";
import { useEffect, useState } from "react";
import ProfileDropdown from "./ProfileDropDown";
import { useUser } from "@clerk/nextjs";
import Button from "@/components/WebsiteComps/Button";
import Image from "next/image";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { effectCategories, getEffectCategoryHref } from "@/lib/categories";
import { useWaitlistModal } from "../WebsiteComps/modals/AccessRequestModal";
import { Suspense } from "react";

function RequestAccessButton() {
  const { openWaitlist } = useWaitlistModal();
  return (
    <Button
      text="Request Access"
      href="#"
      preventDefault
      variant="orange"
      onClick={openWaitlist}
    />
  );
}

const DOCS_TOP_LINKS = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/cli", label: "CLI" },
  { href: "/docs/dependencies", label: "Dependencies" },
  { href: "/docs/license", label: "License" },
];

function categoryLabel(category) {
  return category.name.replace("Website ", "").replace("Page ", "");
}

export function VaultHeader({ effectName, showSearch = false, effects = [] }) {
  const { isSignedIn } = useUser();

  const [openTrigger, setOpenTrigger] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 150);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const closeMobileDropdowns = () => {
    setIsCategoriesOpen(false);
    setIsDocumentationOpen(false);
  };

  const openSearch = () => {
    setOpenTrigger((value) => value + 1);
  };

  const openSearchFromMobile = () => {
    openSearch();
    closeMobileMenu();
    closeMobileDropdowns();
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 px-10 py-5 pr-[3.6vw] max-md:z-600 max-md:hidden max-md:px-6 max-sm:px-4 ${
          isScrolled ? "bg-black/20 shadow-md backdrop-blur-sm" : ""
        }`}
      >
        <div className="flex h-full items-center justify-end gap-3">
          <Link
            href="/effects"
            className="hidden items-center gap-3 max-md:flex"
            onClick={closeMobileMenu}
          >
            <Image
              src="/hyperiux.svg"
              alt="Hyperiux"
              width={28}
              height={28}
              className="h-7 w-7 shrink-0"
            />
            <Image
              src="/hyperiux-wordmark.svg"
              alt="Hyperiux"
              width={128}
              height={37}
              className="h-auto w-28"
            />
          </Link>

          <div className="hidden items-center gap-2 max-md:ml-auto max-md:flex">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen((value) => !value);
                closeMobileDropdowns();
              }}
              className="flex h-10 w-10 items-center justify-center text-white transition hover:text-white/80"
              aria-label={
                isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5 max-md:h-10 max-md:w-10 max-sm:h-7 max-sm:w-7" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {showSearch && (
              <button
                type="button"
                onClick={openSearch}
                className="group flex h-12 cursor-pointer items-center gap-10 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/70 backdrop-blur-md transition-colors duration-300 hover:bg-white/10 hover:text-white max-md:hidden max-md:gap-3"
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

                  <span className="text-sm max-md:hidden">Search</span>
                </div>

                <kbd className="space-x-2 rounded bg-black/40 px-1 py-0.5 text-sm text-current opacity-50 max-lg:hidden">
                  ⌘K
                </kbd>
              </button>
            )}

            {!isSignedIn ? (
              <div className="block max-md:hidden">
                <Suspense fallback={null}>
                  <RequestAccessButton />
                </Suspense>
              </div>
            ) : (
              <div className="max-md:hidden">
                <ProfileDropdown savedCount={wishlistCount} plan="free" />
              </div>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close mobile menu overlay"
              className="fixed inset-0 z-600 bg-black/60 max-md:block"
              onClick={() => {
                closeMobileMenu();
                closeMobileDropdowns();
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            />

            <motion.div
              className="fixed right-0 top-0 z-600 h-screen max-w-90 overflow-y-auto border-l border-white/10 bg-[#060606] px-4 py-5 text-white shadow-2xl max-md:block max-md:w-180 max-sm:w-[88vw]"
              initial={{ x: "100%", opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.9 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <Link
                  href="/effects"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/hyperiux.svg"
                    alt="Hyperiux"
                    width={28}
                    height={28}
                    className="h-7 w-7"
                  />
                  <Image
                    src="/hyperiux-wordmark.svg"
                    alt="Hyperiux"
                    width={128}
                    height={37}
                    className="h-auto w-28 max-md:w-40 max-sm:w-28"
                  />
                </Link>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="flex h-10 w-10 items-center justify-center text-white transition hover:text-white/80"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {!isSignedIn ? (
                  <div onClick={closeMobileMenu}>
                    <Button
                      text="Sign In"
                      href="/sign-in"
                      variant="orange"
                      showArrow={false}
                      pillClassName="w-full px-4 py-3 text-center text-sm leading-none"
                      className="block w-full"
                      innerClassName="w-full group-hover:!translate-x-0"
                    />
                  </div>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10"
                  >
                    <span>Account</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}

                {showSearch && (
                  <button
                    type="button"
                    onClick={openSearchFromMobile}
                    className="group flex h-12 w-full cursor-pointer items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 text-xs text-white/70 backdrop-blur-md transition-colors duration-300 hover:bg-white/10 hover:text-white max-sm:h-14"
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
                      <span className="text-sm max-sm:text-lg">Search</span>
                    </div>
                    <kbd className="space-x-2 rounded bg-black/40 px-1 py-0.5 text-sm text-current opacity-50">
                      ⌘K
                    </kbd>
                  </button>
                )}
              </div>

              <div className="my-5 h-px bg-white/10" />

              <nav className="space-y-6">
                <div className="space-y-2">
                  <Link
                    href="/effects"
                    onClick={closeMobileMenu}
                    className="flex w-full items-center rounded-2xl px-1 py-2 text-left text-xs uppercase tracking-[0.2em] text-white/35 max-md:text-lg max-sm:text-xs"
                  >
                    Overview
                  </Link>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoriesOpen((value) => !value);
                      setIsDocumentationOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl px-1 py-2 text-left text-xs uppercase tracking-[0.2em] text-white/35 max-md:text-lg max-sm:text-xs"
                    aria-expanded={isCategoriesOpen}
                  >
                    <span>Categories</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isCategoriesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isCategoriesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 overflow-y-auto pr-1 max-md:max-h-130 max-sm:max-h-72">
                          {effectCategories.map((category) => (
                            <Link
                              key={category.id}
                              href={getEffectCategoryHref(category.id)}
                              onClick={() => {
                                closeMobileMenu();
                                closeMobileDropdowns();
                              }}
                              className="block rounded-2xl px-4 py-3 text-sm text-white/75 transition hover:bg-white/5 hover:text-white max-md:text-xl max-sm:text-sm"
                            >
                              {categoryLabel(category)}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDocumentationOpen((value) => !value);
                      setIsCategoriesOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl px-1 py-2 text-left text-xs uppercase tracking-[0.2em] text-white/35 max-md:text-lg max-sm:text-xs"
                    aria-expanded={isDocumentationOpen}
                  >
                    <span>Documentation</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isDocumentationOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isDocumentationOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                          {DOCS_TOP_LINKS.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => {
                                closeMobileMenu();
                                closeMobileDropdowns();
                              }}
                              className="block rounded-2xl px-4 py-3 text-sm text-white/75 transition hover:bg-white/5 hover:text-white max-md:text-xl max-sm:text-sm"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GlobalSearch effects={effects} externalOpen={openTrigger} />
    </>
  );
}