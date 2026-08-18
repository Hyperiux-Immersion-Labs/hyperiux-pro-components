"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";

export default function ProfileDropdown({
  savedCount = 0,
  usage = null,
  plan = "free",
}) {
  const { user } = useUser();
  const { signOut } = useClerk();

  const isAdmin = user?.publicMetadata?.role === "admin";

  const usageLabel = !usage
    ? "…"
    : usage.isAdmin
      ? "Unlimited"
      : `${usage.count ?? 0}/${usage.limit ?? 0}`;

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  if (!user) return null;

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-fit h-fit relative"
      >
        <Image
          src={user.imageUrl}
          alt={user.fullName || "User"}
          width={40}
          height={40}
          className="size-[3.4vw] border border-white/10 object-cover"
        />

        {plan === "pro" && (
          <span className="px-2 py-1 text-[0.5vw] bg-white text-black font-medium absolute -top-1 -right-3">
            PRO
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 w-72  bg-[#272727] backdrop-blur-xl overflow-hidden z-50">
          <div className="p-5 border-b border-white/10">
            <p className="text-white font-medium">
              {user.fullName}
            </p>

            <p className="text-white/50 text-sm truncate">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/dashboard"
              className="group relative isolate block px-4 py-3 transition"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 origin-top scale-y-0 bg-[#0e0e0e] transition-transform duration-300 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
              />
              Dashboard
            </Link>

            <Link
              href="/dashboard/saved"
              className="group relative isolate flex items-center justify-between px-4 py-3 transition"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 origin-top scale-y-0 bg-[#0e0e0e] transition-transform duration-300 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
              />
              <span>Saved Effects</span>

              <span className="text-white/50">
                {savedCount}
              </span>
            </Link>

            {!isAdmin && (
              <Link
                href="/dashboard/usage"
                className="group relative isolate flex items-center justify-between px-4 py-3 transition"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 origin-top scale-y-0 bg-[#0e0e0e] transition-transform duration-300 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
                />
                <span>Usage</span>

                <span className="text-white/50">
                  {usageLabel}
                </span>
              </Link>
            )}

            <Link
              href="/dashboard/settings"
              className="group relative isolate block px-4 py-3 transition"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 origin-top scale-y-0 bg-[#0e0e0e] transition-transform duration-300 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
              />
              Settings
            </Link>

            <div className="my-2 border-t border-white/10 w-[110%] translate-x-[-5%]" />

            <button
              onClick={() => signOut(() => {
                window.location.href = "/effects";
              })}
              className="group relative isolate w-full text-left px-4 py-3 transition text-red-400"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 origin-top scale-y-0 bg-[#0e0e0e] transition-transform duration-300 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
              />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}