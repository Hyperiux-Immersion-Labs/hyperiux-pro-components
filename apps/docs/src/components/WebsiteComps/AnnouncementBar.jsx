"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Visible at the top of the page; slides away once the user scrolls down and
// returns when they scroll back to the top. The fixed navbars follow along:
// they read --announcement-offset for their `top`, which flips to 0 via the
// `announcement-hidden` class on <html> (see globals.css).
export default function AnnouncementBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let isHidden = false;

    const update = () => {
      const shouldHide = window.scrollY > 50;
      if (shouldHide === isHidden) return;
      isHidden = shouldHide;
      setHidden(shouldHide);
      document.documentElement.classList.toggle("announcement-hidden", shouldHide);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-500 flex h-(--announcement-h) items-center justify-center gap-4 bg-primary px-4 text-white transition-transform duration-300 ease-out max-sm:gap-2.5 max-sm:px-3 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <p className="truncate text-sm max-md:text-sm max-sm:text-xs">
        <span className="">
          Free Core is open now. Pro opens next week through Founding Access.
        </span>
      </p>
      <Link
        href="/waitlist"
        className="shrink-0 max-md:hidden whitespace-nowrap rounded-full bg-black px-3.5 py-1 text-[12px] font-medium text-white transition-colors duration-300 hover:bg-white hover:text-black max-sm:px-3 max-sm:text-[11px]"
      >
        Join Waitlist
      </Link>
    </div>
  );
}
