"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, PanelLeft } from "lucide-react";
import { effectCategories, getEffectCategoryHref } from "@/lib/categories";
import { getFeaturedEffects } from "@/lib/featured-effects";
import { Overview, Documentation, Category } from "../WebsiteComps/Icons";
import Link from "next/link";

const DEFAULT_DOCS_TOP_LINKS = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/cli", label: "CLI" },
  { href: "/docs/dependencies", label: "Dependencies" },
  { href: "/docs/license", label: "License" },
];

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

function NavIconLink({ label, href, icon: Icon, isExpanded, isActive, onClick }) {
  return (
    <Link
      href={href}
      scroll={false}
      title={label}
      onClick={onClick}
      className={`relative flex h-10 w-[18vw] items-center gap-3 rounded-full px-4 py-1 text22 font-medium text-white/90 transition-colors duration-300 ease-out hover:text-white ${
        isExpanded
          ? `hover:bg-[#272727] ${isActive ? "bg-[#272727] text-white" : ""}`
          : `px-0 ${isActive ? "text-white" : ""}`
      }`}
    >
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
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`relative flex h-10 w-[18vw] cursor-pointer items-center gap-3 rounded-full px-4 text-left text22 font-medium text-white/90 transition-colors duration-300 ease-out hover:text-white ${
        isExpanded
          ? `py-1 hover:bg-[#272727] ${
              isActive ? "bg-[#272727] text-white" : ""
            }`
          : `justify-center px-0 py-3 ${isActive ? "text-white" : ""}`
      }`}
    >
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
  disableInitialTransition = false,
  onOverviewNavigate,
  onCategoryNavigate,
  onDocumentationNavigate,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const resolvedTopLinks = topLinks?.length ? topLinks : DEFAULT_DOCS_TOP_LINKS;

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

  const initialOpenSection = pathname.startsWith("/docs")
    ? "docs"
    : isCategoryRoute
      ? "categories"
      : "";

  const [activeHash, setActiveHash] = useState("");
  const [fetchedEffects, setFetchedEffects] = useState([]);
  const [openSection, setOpenSection] = useState(initialOpenSection);

  const previousRouteSectionRef = useRef(initialOpenSection);
  const categoryNavigationInProgressRef = useRef(false);

  const isDocsActive =
    pathname.startsWith("/docs") ||
    resolvedTopLinks.some((link) => {
      const [basePath, hash] = link.href.split("#");

      return pathname === basePath && (!hash || activeHash === `#${hash}`);
    });

  const currentCategory = isDocsActive
    ? ""
    : activeCategory || searchParams.get("category") || "";

  const isOverviewActive =
    pathname === "/effects" && (!currentCategory || currentCategory === "all");

  const isCategoriesActive =
    !isDocsActive &&
    (isCategoryRoute ||
      (pathname === "/effects" &&
        Boolean(currentCategory) &&
        currentCategory !== "all"));

  const isDocumentationActive = isDocsActive;

  const routeOpenSection = isDocumentationActive
    ? "docs"
    : isCategoriesActive
      ? "categories"
      : "";

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

    for (const category of effectCategories) {
      router.prefetch?.(getEffectCategoryHref(category.id));
    }
  }, [router, resolvedTopLinks]);

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
      className={`sticky bottom-0 left-0 top-0 z-51 h-screen bg-[#0E0E0E] text-white max-md:hidden ${
        disableInitialTransition
          ? "transition-none"
          : "transition-[width] duration-300 ease-out"
      } ${isExpanded ? "w-[288px]" : "w-22"}`}
    >
      <button
        type="button"
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        onClick={toggle}
        className={`absolute top-6 z-50 hidden size-8 cursor-pointer items-center justify-center rounded-sm text-white transition-[left,background-color,transform] duration-300 ease-out hover:bg-white/15 sm:flex ${
          isExpanded ? "left-75" : "left-25"
        }`}
      >
        <div className={isExpanded ? "" : "-scale-x-100"}>
          <PanelLeft className="h-5 w-5" />
        </div>
      </button>

      <div className="flex h-full flex-col items-start overflow-hidden border-r border-b border-white/10 py-3 pl-3 pr-1 transition-all duration-300">
        <div className="mb-10 flex h-16 w-full items-center justify-start overflow-hidden border-b border-white/10 px-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
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

        <nav data-lenis-prevent className="space-y-4">
          <NavIconLink
            label="Overview"
            href="/effects"
            icon={Overview}
            isExpanded={isExpanded}
            isActive={isOverviewActive}
            onClick={navigateOverview}
          />

          <SectionButton
            label="Categories"
            icon={Category}
            isExpanded={isExpanded}
            isOpen={openSection === "categories"}
            isActive={isCategoriesActive}
            onClick={() => toggleSection("categories")}
          />

          <AnimatePresence initial={false}>
            {isExpanded && openSection === "categories" && (
              <motion.div
                key="categories"
                initial={{ height: 0, opacity: 0, y: -6 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -6 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="ml-[19px] mb-4 max-h-[45vh] space-y-3 overflow-y-auto border-l border-white/12 pl-7 pr-3 sidebar-link-content"
              >
                {effectCategories.map((category) => {
                  const count =
                    effectCounts[category.id] ??
                    (category.id === "featured" ? featuredCount : 0);

                  const isActive = currentCategory === category.id;
                  const href = getEffectCategoryHref(category.id);

                  return (
                    <Link
                      key={category.id}
                      href={href}
                      scroll={false}
                      onClick={(event) => navigateCategory(event, category.id)}
                      className={`relative flex w-full items-center justify-between gap-3 rounded-full py-1 text-left text-sm transition-colors cursor-pointer ${
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
          />

          <AnimatePresence initial={false}>
            {isExpanded && openSection === "docs" && (
              <motion.div
                key="docs"
                initial={{ height: 0, opacity: 0, y: -6 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -6 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="ml-[19px] space-y-1 overflow-hidden border-l border-white/12 pl-7"
              >
                {resolvedTopLinks.map((link) => {
                  const [basePath, hash] = link.href.split("#");

                  const isActive =
                    pathname === basePath &&
                    (!hash || activeHash === `#${hash}`);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      scroll={false}
                      onClick={(event) =>
                        navigateDocumentation(event, link.href)
                      }
                      className={`relative flex w-full items-center rounded-full py-2 text-left text-sm transition-colors cursor-pointer ${
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
        </nav>
      </div>
    </aside>
  );
}