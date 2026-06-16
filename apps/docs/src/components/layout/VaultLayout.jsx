"use client";

import { Suspense, useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import Image from "next/image";
import { Sidebar } from "./Sidebar";

const SIDEBAR_EXPANDED_STORAGE_KEY = "hyperiux-sidebar-expanded";

const DOCS_TOP_LINKS = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/cli", label: "CLI" },
  { href: "/docs/dependencies", label: "Dependencies" },
  { href: "/docs/license", label: "License" },
];

function getStoredSidebarExpanded() {
  if (typeof window === "undefined") return false;

  return window.localStorage.getItem(SIDEBAR_EXPANDED_STORAGE_KEY) === "true";
}

function setStoredSidebarExpanded(value) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    SIDEBAR_EXPANDED_STORAGE_KEY,
    value ? "true" : "false"
  );
}

function SidebarFallback({ isExpanded }) {
  return (
    <aside
      className={`sticky bottom-0 left-0 top-0 h-screen border-r border-white/10 bg-[#060606] text-foreground max-md:hidden ${
        isExpanded ? "w-[288px]" : "w-22"
      }`}
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
  onOverviewNavigate,
  onCategoryNavigate,
  onDocumentationNavigate,
}) {
  const totalEffects =
    propTotalEffects !== undefined ? propTotalEffects : effects.length;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarReady, setIsSidebarReady] = useState(false);
  const [allowSidebarTransition, setAllowSidebarTransition] = useState(false);

  const lenis = useLenis();

  useEffect(() => {
    let frameTwo;
    let frameThree;

    const frameOne = requestAnimationFrame(() => {
      setIsSidebarOpen(getStoredSidebarExpanded());
      setIsSidebarReady(true);

      frameTwo = requestAnimationFrame(() => {
        frameThree = requestAnimationFrame(() => {
          setAllowSidebarTransition(true);
        });
      });
    });

    return () => {
      cancelAnimationFrame(frameOne);
      cancelAnimationFrame(frameTwo);
      cancelAnimationFrame(frameThree);
    };
  }, []);

  useEffect(() => {
    if (!isSidebarReady) return;

    setStoredSidebarExpanded(isSidebarOpen);
  }, [isSidebarOpen, isSidebarReady]);

  useEffect(() => {
    if (!isSidebarReady) return;

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
  }, [isSidebarOpen, isSidebarReady, lenis]);

  const toggleSidebar = (nextValue) => {
    setIsSidebarOpen((currentValue) =>
      typeof nextValue === "boolean" ? nextValue : !currentValue
    );
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const renderedChildren =
    typeof children === "function" ? children({ isSidebarOpen }) : children;

  return (
    <div className="relative min-h-screen text-foreground">
    

      <div className="relative z-10 flex min-h-screen items-start">
        <Suspense
          fallback={<SidebarFallback isExpanded={isSidebarOpen} />}
        >
          <Sidebar
            effects={effects}
            effectCounts={effectCounts}
            totalEffects={totalEffects}
            isExpanded={isSidebarOpen}
            onToggle={toggleSidebar}
            onClose={closeSidebar}
            activeCategory={activeCategory}
            topLinks={DOCS_TOP_LINKS}
            onOverviewNavigate={onOverviewNavigate}
            onCategoryNavigate={onCategoryNavigate}
            onDocumentationNavigate={onDocumentationNavigate}
            disableInitialTransition={!allowSidebarTransition}
          />

          {isSidebarOpen && (
            <button
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-30 cursor-default bg-black/45 md:hidden"
              onClick={closeSidebar}
            />
          )}
        </Suspense>

        <main className="relative min-w-0 flex-1">{renderedChildren}</main>
      </div>
    </div>
  );
}
