"use client";

import Link from "next/link";
import { GlobalSearch } from "./SearchBar";
import { useState } from "react";
import ProfileDropdown from "./ProfileDropDown";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Button from "@/components/Reusable/Button";


export function VaultHeader({
  showSearch = true,
  effects = [],
}) {
  const { isSignedIn } = useUser();

  const [openTrigger, setOpenTrigger] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

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

  const githubLink = (
    <Link
      href="https://github.com/hyperiux"
      target="_blank"
      rel="noreferrer"
      className=""
      aria-label="Open Hyperiux on GitHub"
    >
      <Image src='/icons/github.svg' height={200} width={200} className="h-9 w-9" />
    </Link>
  );

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm  px-10 py-5"
      >
        <div className="flex h-full items-center justify-end gap-3">

            {showSearch && (
              <button
                onClick={() => setOpenTrigger((n) => n + 1)}
                className="group flex h-10 cursor-pointer  items-center gap-10 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/70 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:text-white max-sm:h-9 max-sm:w-9 max-sm:justify-center max-sm:px-0"
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

                <span className="max-sm:hidden text-sm">
                  Search
                </span>
                </div>

                <kbd className="rounded bg-black/40 px-1 py-0.5 text-sm text-current opacity-50 max-lg:hidden space-x-2">
                  ⌘K
                </kbd>
              </button>
            )}
            {!isSignedIn ? (
              <>
                <div className="max-sm:hidden block">
                  <Button
                    text="Sign In"
                    href="/sign-in"
                    variant="orange"
                    showArrow={false}
                    innerClassName="group-hover:!translate-x-0"
                    pillClassName="px-4 py-2 text-xs leading-none"
                  />
                </div>

               
                {githubLink}
              </>
            ) : (
              <>
                {githubLink}

                <ProfileDropdown
                  savedCount={wishlistCount}
                  plan="free"
                />
              </>
            )}
        </div>
      </header>

      {/* Global Search Modal — fully self-contained, Ctrl+K works natively */}
      <GlobalSearch
        effects={effects}
        externalOpen={openTrigger}
      />
    </>
  );
}
