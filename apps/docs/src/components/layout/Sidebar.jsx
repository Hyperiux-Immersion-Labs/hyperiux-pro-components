"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, PanelLeft } from "lucide-react";
import { effectCategories, getEffectCategoryHref } from "@/lib/categories";
import { getFeaturedEffects } from "@/lib/featured-effects";
import { Overview, Documentation, Category, Legal, Github, Pricing, Npm } from "../WebsiteComps/Icons";
import Link from "next/link";

const DEFAULT_DOCS_TOP_LINKS = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/cli", label: "CLI" },
  { href: "/docs/mcp", label: "MCP" },
  { href: "/docs/dependencies", label: "Dependencies" },
  { href: "/docs/license", label: "License" },
];

const DEFAULT_LEGAL_LINKS = [
  { href: "/legal/license-agreement", label: "License Agreement" },
  { href: "/legal/privacy-policy", label: "Privacy Policy" },
  { href: "/legal/refund-policy", label: "Refund Policy" },
  { href: "/legal/terms-of-service", label: "Terms of Service" },
];

const MAIN_SIDEBAR_PILL_ID = "sidebar-pill-main";

function categoryLabel(category) {
  return category.name.replace("Website ", "").replace("Page ", "");
}

function getPathSegments(pathname = "") {
  return pathname.split("/").filter(Boolean);
}

function getLastPathSegment(pathname = "") {
  const segments = getPathSegments(pathname);
  return segments[segments.length - 1] || "";
}

function NavIconLink({
  label,
  href,
  icon: Icon,
  isExpanded,
  isActive,
  onClick,
  external,
  onMouseEnter,
  onMouseLeave,
  shouldHighlight,
  reduceMotion,
  pillId,
}) {
  return (
    <Link
      href={href}
      scroll={false}
      title={label}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`relative flex h-10 items-center gap-3 rounded-md px-4 py-[1.5vw] text22 font-medium text-white/90 transition-[width,color] duration-300 ease-out hover:text-white ${
        isExpanded ? "w-[18.5vw]" : "w-[3.8vw]"
      }`}
    >
      {shouldHighlight && (
        <motion.span
          layoutId={reduceMotion ? undefined : pillId}
          className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-[#272727]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0.2, ease: "easeOut" }
              : { stiffness: 0, damping: 20 }
          }
        />
      )}

      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.7} />

      <span
        className={`truncate ${
          isExpanded ? "delay-100 opacity-100 duration-200" : "opacity-0"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

function SectionButton({
  label,
  icon: Icon,
  isExpanded,
  isOpen,
  isActive,
  onClick,
  onMouseEnter,
  onMouseLeave,
  shouldHighlight,
  reduceMotion,
  pillId,
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative flex h-10 cursor-pointer items-center gap-3 rounded-md px-4 py-[1.5vw] text-left text22 font-medium text-white/90 transition-[width,color] duration-300 ease-out hover:text-white ${
        isExpanded ? "w-[18.5vw]" : "w-[3.8vw]"
      }`}
    >
      {shouldHighlight && (
        <motion.span
          layoutId={reduceMotion ? undefined : pillId}
          className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-[#272727]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0.2, ease: "easeOut" }
              : { stiffness: 0, damping: 20 }
          }
        />
      )}

      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.7} />

      <span
        className={`min-w-0 flex-1 truncate ${
          isExpanded ? "delay-100 opacity-100 duration-200" : "opacity-0"
        }`}
      >
        {label}
      </span>

      <motion.span
        animate={{ rotate: isOpen ? 90 : 0, x: isOpen ? 2 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="shrink-0"
      >
        <ChevronRight className="h-4 w-4" />
      </motion.span>
    </button>
  );
}

export function Sidebar({
  effects = [],
  effectCounts = {},
  isExpanded = false,
  onToggle,
  activeCategory,
  topLinks = DEFAULT_DOCS_TOP_LINKS,
  legalLinks = DEFAULT_LEGAL_LINKS,
  disableInitialTransition = false,
  onOverviewNavigate,
  onCategoryNavigate,
  onDocumentationNavigate,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();

  const resolvedTopLinks = topLinks?.length ? topLinks : DEFAULT_DOCS_TOP_LINKS;
  const resolvedLegalLinks = legalLinks?.length
    ? legalLinks
    : DEFAULT_LEGAL_LINKS;

  const lastPathSegment = getLastPathSegment(pathname);

  const categoryRouteSlugs = useMemo(
    () =>
      effectCategories.map((category) =>
        getEffectCategoryHref(category.id).split("/").filter(Boolean).pop()
      ),
    []
  );

  const isCategoryRoute =
    Boolean(lastPathSegment) && categoryRouteSlugs.includes(lastPathSegment);

  const isLegalRoute = resolvedLegalLinks.some((link) => {
    const [basePath] = link.href.split("#");

    return pathname === basePath;
  });

  const initialOpenSection = isLegalRoute
    ? "legal"
    : pathname.startsWith("/docs")
      ? "docs"
      : isCategoryRoute
        ? "categories"
        : "";

  const [activeHash, setActiveHash] = useState("");
  const [fetchedEffects, setFetchedEffects] = useState([]);
  const [openSection, setOpenSection] = useState(initialOpenSection);
  const [hoveredSidebarKey, setHoveredSidebarKey] = useState("");

  const previousRouteSectionRef = useRef(initialOpenSection);
  const categoryNavigationInProgressRef = useRef(false);

  const isLegalActive = resolvedLegalLinks.some((link) => {
    const [basePath, hash] = link.href.split("#");

    return pathname === basePath && (!hash || activeHash === `#${hash}`);
  });

  const isDocsActive =
    !isLegalActive &&
    (pathname.startsWith("/docs") ||
      resolvedTopLinks.some((link) => {
        const [basePath, hash] = link.href.split("#");

        return pathname === basePath && (!hash || activeHash === `#${hash}`);
      }));

  const currentCategory = isDocsActive || isLegalActive
    ? ""
    : activeCategory || searchParams.get("category") || "";

  const isOverviewActive =
    pathname === "/effects" && (!currentCategory || currentCategory === "all");

  const isCategoriesActive =
    !isDocsActive &&
    !isLegalActive &&
    (isCategoryRoute ||
      (pathname === "/effects" &&
        Boolean(currentCategory) &&
        currentCategory !== "all"));

  const isDocumentationActive = isDocsActive;

  const routeOpenSection = isLegalActive
    ? "legal"
    : isDocumentationActive
      ? "docs"
      : isCategoriesActive
        ? "categories"
        : "";

  const activeSidebarKey = useMemo(() => {
    if (isOverviewActive) return "overview";
    if (isCategoriesActive) return "categories";
    if (isDocumentationActive) return "docs";
    if (isLegalActive) return "legal";
    if (pathname === "/pricing") return "pricing";
    if (pathname === "/") return "overview";

    return routeOpenSection || "";
  }, [
    isCategoriesActive,
    isDocumentationActive,
    isLegalActive,
    isOverviewActive,
    pathname,
    routeOpenSection,
  ]);

  const highlightedSidebarKey = hoveredSidebarKey || activeSidebarKey;

  useEffect(() => {
    const onHash = () => setActiveHash(window.location.hash || "");

    queueMicrotask(() => {
      onHash();
    });
    window.addEventListener("hashchange", onHash);

    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (effects.length) return;

    let isMounted = true;

    fetch("/r/index.json")
      .then((response) => (response.ok ? response.json() : null))
      .then((registry) => {
        if (!isMounted || !registry?.items) return;

        setFetchedEffects(registry.items);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [effects]);

  useEffect(() => {
    router.prefetch?.("/effects");

    for (const link of resolvedTopLinks) {
      router.prefetch?.(link.href);
    }

    for (const link of resolvedLegalLinks) {
      router.prefetch?.(link.href);
    }

    for (const category of effectCategories) {
      router.prefetch?.(getEffectCategoryHref(category.id));
    }
  }, [router, resolvedTopLinks, resolvedLegalLinks]);

  /*
    Important:
    Only auto-sync when the route section changes:
    overview -> categories
    categories -> docs
    docs -> categories

    Do NOT sync on every category slug change:
    /effects/text-animations -> /effects/webgl-effects

    That prevents the dropdown from closing and reopening during category navigation.
  */
  useEffect(() => {
    const previousRouteSection = previousRouteSectionRef.current;

    if (previousRouteSection !== routeOpenSection) {
      queueMicrotask(() => {
        setOpenSection(routeOpenSection);
      });
      previousRouteSectionRef.current = routeOpenSection;
    }
  }, [routeOpenSection]);

  /*
    If the user clicks a category inside the already-open dropdown, keep it open
    during the fade-out, route push, and route fade-in.
  */
  useEffect(() => {
    if (!categoryNavigationInProgressRef.current) return;

    if (isCategoriesActive) {
      queueMicrotask(() => {
        setOpenSection("categories");
      });
      categoryNavigationInProgressRef.current = false;
    }
  }, [pathname, isCategoriesActive]);

  const sidebarEffects = effects.length ? effects : fetchedEffects;

  const featuredCount = useMemo(
    () => getFeaturedEffects(sidebarEffects).length,
    [sidebarEffects]
  );

  // Fallback for routes (e.g. /dashboard) that mount Sidebar without ever
  // computing/passing `effectCounts` from the server.
  const computedCategoryCounts = useMemo(() => {
    const counts = {};

    for (const effect of sidebarEffects) {
      const cats = effect.categories?.length
        ? effect.categories
        : [effect.category].filter(Boolean);

      for (const cat of cats) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }

    return counts;
  }, [sidebarEffects]);

  const navigateOverview = (event) => {
    event?.preventDefault();

    categoryNavigationInProgressRef.current = false;
    setOpenSection("");

    const wasHandled = onOverviewNavigate?.();

    if (wasHandled === true) return;

    router.push("/effects", { scroll: false });
  };

  const navigateCategory = (event, categoryId) => {
    event?.preventDefault();

    categoryNavigationInProgressRef.current = true;
    setOpenSection("categories");

    const wasHandled = onCategoryNavigate?.(categoryId);

    if (wasHandled === true) return;

    router.push(getEffectCategoryHref(categoryId), { scroll: false });
  };

  const navigateDocumentation = (event, href) => {
  event?.preventDefault();

  categoryNavigationInProgressRef.current = false;
  setOpenSection("docs");

  if (typeof window !== "undefined") {
    const docsRouteEvent = new CustomEvent("hyperiux:docs-route-request", {
      cancelable: true,
      detail: { href },
    });

    const wasHandledByDocsBody = !window.dispatchEvent(docsRouteEvent);

    if (wasHandledByDocsBody) return;
  }

  const wasHandled = onDocumentationNavigate?.(href);

  if (wasHandled === true) return;

  router.push(href, { scroll: false });
};

const navigateLegal = (event, href) => {
  event?.preventDefault();

  categoryNavigationInProgressRef.current = false;
  setOpenSection("legal");

  const wasHandled = onDocumentationNavigate?.(href);

  if (wasHandled === true) return;

  router.push(href, { scroll: false });
};

  const toggle = () => {
    const nextValue = !isExpanded;

    if (!nextValue) {
      setOpenSection("");
    } else if (routeOpenSection) {
      setOpenSection(routeOpenSection);
    }

    onToggle?.(nextValue);
  };

  const toggleSection = (section) => {
    categoryNavigationInProgressRef.current = false;

    if (!isExpanded) {
      setOpenSection(section);
      onToggle?.(true);
      return;
    }

    setOpenSection((currentSection) =>
      currentSection === section ? "" : section
    );
  };

  return (
    <aside
      className={`sticky bottom-0 left-0 top-0 z-51 h-screen bg-[#0E0E0E] text-white max-[1025px]:hidden ${
        disableInitialTransition
          ? "transition-none"
          : "transition-[width] duration-300 ease-out"
      } ${isExpanded ? "w-[20vw]" : "w-[5.5vw]"}`}
    >
      <button
        type="button"
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        onClick={toggle}
        className={`absolute top-6 z-50 hidden size-8 cursor-pointer items-center justify-center rounded-sm text-white transition-[left,background-color,transform] duration-300 ease-out hover:bg-white/15 sm:flex ${
          isExpanded ? "left-[20.8vw]" : "left-[6.2vw]"
        }`}
      >
        <div className={isExpanded ? "" : "-scale-x-100"}>
          <PanelLeft className="h-5 w-5" />
        </div>
      </button>

      <div className="flex h-full flex-col items-start overflow-hidden border-r border-b border-white/10 py-3 pl-3 pr-1 transition-all duration-300">
        <div className="mb-10 flex h-16 w-full items-center justify-start overflow-hidden border-b border-white/10 px-4">
          <Link prefetch={false} href="/" className="flex min-w-0 items-center gap-3">
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
              className={`h-auto w-32 ${
                isExpanded
                  ? "delay-100 opacity-100 duration-200"
                  : "opacity-0"
              }`}
            />
          </Link>
        </div>

        <nav
          data-lenis-prevent
          className="w-full flex-1 min-h-0  overflow-y-auto overflow-x-hidden pb-4 pr-1 sidebar-link-content"
          onMouseLeave={() => setHoveredSidebarKey("")}
        >
          <LayoutGroup id="sidebar-pill">
            <NavIconLink
              label="Overview"
              href="/effects"
              icon={Overview}
              isExpanded={isExpanded}
              isActive={isOverviewActive}
              onClick={navigateOverview}
              onMouseEnter={() => setHoveredSidebarKey("overview")}
              shouldHighlight={highlightedSidebarKey === "overview"}
              reduceMotion={reduceMotion}
              pillId={MAIN_SIDEBAR_PILL_ID}
            />

            <SectionButton
              label="Categories"
              icon={Category}
              isExpanded={isExpanded}
              isOpen={openSection === "categories"}
              isActive={isCategoriesActive}
              onClick={() => toggleSection("categories")}
              onMouseEnter={() => setHoveredSidebarKey("categories")}
              shouldHighlight={highlightedSidebarKey === "categories"}
              reduceMotion={reduceMotion}
              pillId={MAIN_SIDEBAR_PILL_ID}
            />

            <AnimatePresence initial={false}>
              {isExpanded && openSection === "categories" && (
                <motion.div
                  key="categories"
                  initial={{ height: 0, opacity: 0, y: -6 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="ml-7 max-h-[42vh] space-y-3 overflow-y-auto border-l border-white/12 pl-7 pr-3 sidebar-link-content"
                >
                  {effectCategories.map((category,id) => {
                    const count =
                      effectCounts[category.id] ??
                      computedCategoryCounts[category.id] ??
                      (category.id === "featured" ? featuredCount : 0);

                    const isActive = currentCategory === category.id;
                    const itemKey = `categories:${category.id}`;
                    const href = getEffectCategoryHref(category.id);

                    return (
                      <Link
                        key={category.id}
                        href={href}
                        scroll={false}
                        onClick={(event) => navigateCategory(event, category.id)}
                        onMouseEnter={() => setHoveredSidebarKey("categories")}
                        className={`relative flex w-full items-center justify-between gap-3 rounded-full py-1 text-left text-sm transition-colors cursor-pointer ${
                          id === 0 ? "mt-[0.7vw]" : ""
                        } ${
                          id === effectCategories.length - 1 ? "mb-[0.7vw]" : ""
                        } ${
                          isActive
                            ? "text-white"
                            : "text-white/42 hover:text-white/75"
                        }`}
                      >
                        {isActive && (
                          <span className="absolute -left-5 h-2 w-2 animate-pulse rounded-full bg-primary" />
                        )}

                        <span className="flex min-w-0 items-center truncate">
                          <span className="truncate">
                            {categoryLabel(category)}
                          </span>
                        </span>

                        {count > 0 && (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#272727] text-center text-[0.65vw] text-white/75">
                            {count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <SectionButton
              label="Documentation"
              icon={Documentation}
              isExpanded={isExpanded}
              isOpen={openSection === "docs"}
              isActive={isDocumentationActive}
              onClick={() => toggleSection("docs")}
              onMouseEnter={() => setHoveredSidebarKey("docs")}
              shouldHighlight={highlightedSidebarKey === "docs"}
              reduceMotion={reduceMotion}
              pillId={MAIN_SIDEBAR_PILL_ID}
            />

            <AnimatePresence initial={false}>
              {isExpanded && openSection === "docs" && (
                <motion.div
                  key="docs"
                  initial={{ height: 0, opacity: 0, y: -6 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="ml-7 space-y-1 overflow-hidden border-l border-white/12 pl-7"
                >
                  {resolvedTopLinks.map((link, index) => {
                    const [basePath, hash] = link.href.split("#");

                    const isActive =
                      pathname === basePath &&
                      (!hash || activeHash === `#${hash}`);
                    const itemKey = `docs:${link.href}`;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        scroll={false}
                        onClick={(event) =>
                          navigateDocumentation(event, link.href)
                        }
                        onMouseEnter={() => setHoveredSidebarKey("docs")}
                        className={`relative flex w-full items-center rounded-full py-2 text-left text-sm transition-colors cursor-pointer ${
                          index === 0 ? "mt-[0.7vw]" : ""
                        } ${
                          index === resolvedTopLinks.length - 1 ? "mb-[0.7vw]" : ""
                        } ${
                          isActive
                            ? "text-white"
                            : "text-white/42 hover:text-white/75"
                        }`}
                      >
                        {isActive && (
                          <span className="absolute -left-5 h-2 w-2 animate-pulse rounded-full bg-primary" />
                        )}

                        {link.label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <SectionButton
              label="Legal"
              icon={Legal}
              isExpanded={isExpanded}
              isOpen={openSection === "legal"}
              isActive={isLegalActive}
              onClick={() => toggleSection("legal")}
              onMouseEnter={() => setHoveredSidebarKey("legal")}
              shouldHighlight={highlightedSidebarKey === "legal"}
              reduceMotion={reduceMotion}
              pillId={MAIN_SIDEBAR_PILL_ID}
            />

            <AnimatePresence initial={false}>
              {isExpanded && openSection === "legal" && (
                <motion.div
                  key="legal"
                  initial={{ height: 0, opacity: 0, y: -6 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="ml-7 space-y-1 overflow-hidden border-l border-white/12 pl-7"
                >
                  {resolvedLegalLinks.map((link, index) => {
                    const [basePath, hash] = link.href.split("#");

                    const isActive =
                      pathname === basePath &&
                      (!hash || activeHash === `#${hash}`);
                    const itemKey = `legal:${link.href}`;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        scroll={false}
                        onClick={(event) => navigateLegal(event, link.href)}
                        onMouseEnter={() => setHoveredSidebarKey("legal")}
                        className={`relative flex w-full items-center rounded-full py-2 text-left text-sm transition-colors cursor-pointer ${
                          index === 0 ? "mt-[0.7vw]" : ""
                        } ${
                          index === resolvedLegalLinks.length - 1 ? "mb-[0.7vw]" : ""
                        } ${
                          isActive
                            ? "text-white"
                            : "text-white/42 hover:text-white/75"
                        }`}
                      >
                        {isActive && (
                          <span className="absolute -left-5 h-2 w-2 animate-pulse rounded-full bg-primary" />
                        )}

                        {link.label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <NavIconLink
              label="Pricing"
              href="/pricing"
              icon={Pricing}
              isExpanded={isExpanded}
              isActive={pathname === "/pricing"}
              onMouseEnter={() => setHoveredSidebarKey("pricing")}
              shouldHighlight={highlightedSidebarKey === "pricing"}
              reduceMotion={reduceMotion}
              pillId={MAIN_SIDEBAR_PILL_ID}
            />

            <NavIconLink
              label="Github"
              href="https://github.com/Hyperiux-Immersion-Labs/hyperiux-components"
              icon={Github}
              isExpanded={isExpanded}
              external
              onMouseEnter={() => setHoveredSidebarKey("github")}
              shouldHighlight={highlightedSidebarKey === "github"}
              reduceMotion={reduceMotion}
              pillId={MAIN_SIDEBAR_PILL_ID}
            />

            <NavIconLink
              label="NPM"
              href="https://www.npmjs.com/package/hyperiux"
              icon={Npm}
              isExpanded={isExpanded}
              external
              onMouseEnter={() => setHoveredSidebarKey("npm")}
              shouldHighlight={highlightedSidebarKey === "npm"}
              reduceMotion={reduceMotion}
              pillId={MAIN_SIDEBAR_PILL_ID}
            />
          </LayoutGroup>
        </nav>
      </div>
    </aside>
  );
}