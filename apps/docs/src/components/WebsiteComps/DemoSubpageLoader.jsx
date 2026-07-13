"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ShimmerText from "@/components/WebsiteComps/ShimmerText";

const MIN_VISIBLE_MS = 500;
const MAX_WAIT_MS = 4000;
const POLL_INTERVAL_MS = 100;
const FADE_MS = 500;

function formatLabel(pathname) {
  const slug = pathname.split("/").filter(Boolean).pop() || "effect";

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isPageReady() {
  if (document.fonts && document.fonts.status !== "loaded") return false;

  return Array.from(document.images || []).every((img) => img.complete);
}

// Keyed by pathname in the parent so each navigation remounts this (and
// resets visible/fadingOut) instead of the effect setting state synchronously.
function DemoSubpageOverlay({ pathname }) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();
    let cancelled = false;
    let pollId;

    const finish = () => {
      if (cancelled) return;

      const remaining = Math.max(MIN_VISIBLE_MS - (Date.now() - startedAt), 0);

      window.setTimeout(() => {
        if (cancelled) return;

        setFadingOut(true);

        window.setTimeout(() => {
          if (!cancelled) setVisible(false);
        }, FADE_MS);
      }, remaining);
    };

    const check = () => {
      if (cancelled) return;

      if (isPageReady() || Date.now() - startedAt > MAX_WAIT_MS) {
        finish();
        return;
      }

      pollId = window.setTimeout(check, POLL_INTERVAL_MS);
    };

    // Two rAFs so the new page has actually painted before we start checking.
    requestAnimationFrame(() => requestAnimationFrame(check));

    return () => {
      cancelled = true;
      window.clearTimeout(pollId);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#0e0e0e] transition-opacity duration-500 ease-out ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <ShimmerText
        as="p"
        baseColor="#939393" shimmerColor="#ffffff"
        className="text-[1.4vw] font-medium tracking-tight max-md:text-[4.5vw] text-[#939393]"
      >
        Loading {formatLabel(pathname)}
      </ShimmerText>
    </div>
  );
}

export default function DemoSubpageLoader({ children }) {
  const pathname = usePathname();

  return (
    <>
      {children}
      <DemoSubpageOverlay key={pathname} pathname={pathname} />
    </>
  );
}
