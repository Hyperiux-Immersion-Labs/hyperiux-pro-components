"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { usePathname, useSearchParams } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

function RouteChangeWatcher({ isSidebarReady, onRouteChange }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isSidebarReady) return;

    onRouteChange();
  }, [pathname, searchParams, isSidebarReady, onRouteChange]);

  return null;
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
  const refreshTimeoutsRef = useRef([]);

  const clearRefreshTimeouts = useCallback(() => {
    refreshTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });

    refreshTimeoutsRef.current = [];
  }, []);

  const refreshScrollTrigger = useCallback(
    (includeSidebarDelay = false) => {
      if (typeof window === "undefined") return;

      clearRefreshTimeouts();

      const runRefresh = () => {
        ScrollTrigger.refresh(true);
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          runRefresh();

          refreshTimeoutsRef.current.push(
            window.setTimeout(runRefresh, 80),
            window.setTimeout(runRefresh, 180),
            window.setTimeout(runRefresh, 360)
          );

          if (includeSidebarDelay) {
            refreshTimeoutsRef.current.push(
              window.setTimeout(runRefresh, 520)
            );
          }
        });
      });
    },
    [clearRefreshTimeouts]
  );

  useEffect(() => {
    let frameTwo;
    let frameThree;

    const frameOne = requestAnimationFrame(() => {
      setIsSidebarOpen(getStoredSidebarExpanded());
      setIsSidebarReady(true);

      frameTwo = requestAnimationFrame(() => {
        frameThree = requestAnimationFrame(() => {
          setAllowSidebarTransition(true);
          refreshScrollTrigger(true);
        });
      });
    });

    return () => {
      cancelAnimationFrame(frameOne);
      cancelAnimationFrame(frameTwo);
      cancelAnimationFrame(frameThree);
    };
  }, [refreshScrollTrigger]);

  useEffect(() => {
    return () => {
      clearRefreshTimeouts();
    };
  }, [clearRefreshTimeouts]);

  useEffect(() => {
    if (!isSidebarReady) return;

    setStoredSidebarExpanded(isSidebarOpen);
  }, [isSidebarOpen, isSidebarReady]);

  useEffect(() => {
    if (!isSidebarReady) return;

    refreshScrollTrigger(true);
  }, [isSidebarOpen, isSidebarReady, refreshScrollTrigger]);

  useEffect(() => {
    if (!isSidebarReady) return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const syncLenis = () => {
      if (isSidebarOpen && mediaQuery.matches) {
        lenis?.stop();
      } else {
        lenis?.start();
      }

      refreshScrollTrigger();
    };

    syncLenis();
    mediaQuery.addEventListener("change", syncLenis);

    return () => {
      mediaQuery.removeEventListener("change", syncLenis);
      lenis?.start();
    };
  }, [isSidebarOpen, isSidebarReady, lenis, refreshScrollTrigger]);

  const toggleSidebar = (nextValue) => {
    setIsSidebarOpen((currentValue) =>
      typeof nextValue === "boolean" ? nextValue : !currentValue
    );

    refreshScrollTrigger(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    refreshScrollTrigger(true);
  };

  const handleOverviewNavigate = () => {
    onOverviewNavigate?.();
    refreshScrollTrigger();
  };

  const handleCategoryNavigate = (categoryId) => {
    onCategoryNavigate?.(categoryId);
    refreshScrollTrigger();
  };

  const handleDocumentationNavigate = (href) => {
    onDocumentationNavigate?.(href);
    refreshScrollTrigger();
  };

  const renderedChildren =
    typeof children === "function" ? children({ isSidebarOpen }) : children;

  return (
    <div className="relative min-h-screen text-foreground">
      <Suspense fallback={null}>
        <RouteChangeWatcher
          isSidebarReady={isSidebarReady}
          onRouteChange={refreshScrollTrigger}
        />
      </Suspense>

      <div className="relative z-300 flex min-h-screen items-start">
        <Suspense fallback={<SidebarFallback isExpanded={isSidebarOpen} />}>
          <Sidebar
            effects={effects}
            effectCounts={effectCounts}
            totalEffects={totalEffects}
            isExpanded={isSidebarOpen}
            onToggle={toggleSidebar}
            onClose={closeSidebar}
            activeCategory={activeCategory}
            topLinks={DOCS_TOP_LINKS}
            onOverviewNavigate={handleOverviewNavigate}
            onCategoryNavigate={handleCategoryNavigate}
            onDocumentationNavigate={handleDocumentationNavigate}
            disableInitialTransition={!allowSidebarTransition}
          />

          
        </Suspense>

        <main className="relative min-w-0 flex-1">{renderedChildren}</main>
      </div>
    </div>
  );
}