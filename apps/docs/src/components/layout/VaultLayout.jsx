"use client";

import { Suspense, useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import Image from "next/image";
import { Sidebar } from "./Sidebar";


const DOCS_TOP_LINKS = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/cli", label: "CLI" },
  { href: "/docs/dependencies", label: "Dependencies" },
  { href: "/docs/license", label: "License" },
];

function SidebarFallback({ totalEffects }) {
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 w-18 border-r border-white/10 bg-[#060606] text-foreground"
    >
      <div className="flex h-full items-start justify-center px-2 py-3">
        <div className="h-29.5 w-full border-b border-white/10 bg-[#080808]" />
      </div>
    </aside>
  );
}

export function VaultLayout({
  children,
  effectCounts = {},
  effects = [],
  totalEffects: propTotalEffects,
  bgImageSrc = "",
  activeCategory,
}) {
  const totalEffects = propTotalEffects !== undefined ? propTotalEffects : effects.length;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const lenis = useLenis();
  const resolvedBgImageSrc = bgImageSrc || "";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const syncLenis = () => {
      if (isSidebarOpen && mediaQuery.matches) {
        lenis?.stop();
      } else {
        lenis?.start();
      }
    };

    syncLenis();
    mediaQuery.addEventListener("change", syncLenis);

    return () => {
      mediaQuery.removeEventListener("change", syncLenis);
      lenis?.start();
    };
  }, [isSidebarOpen, lenis]);

  const renderedChildren =
    typeof children === "function"
      ? children({ isSidebarOpen })
      : children;

  return (
    <div className="min-h-screen text-foreground relative">
      {bgImageSrc ? (
        <div className="pointer-events-none fixed inset-0 z-0 h-screen w-screen">
          <Image
            src={bgImageSrc}
            alt="vault background"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      ) : null}

      <Suspense fallback={<SidebarFallback totalEffects={totalEffects} />}>
        <Sidebar
          effects={effects}
          effectCounts={effectCounts}
          totalEffects={totalEffects}
          isExpanded={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((v) => !v)}
          onClose={() => setIsSidebarOpen(false)}
          activeCategory={activeCategory}
          topLinks={DOCS_TOP_LINKS}
        />
        {isSidebarOpen && (
          <button
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-30 cursor-default bg-black/45 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </Suspense>

      <main
        className={`relative z-10 transition-[margin-left] duration-300 ease-out ${
          isSidebarOpen ? "md:ml-[288px]" : "md:ml-[72px]"
        }`}
      >
        {renderedChildren}
      </main>
    </div>
  );
}
