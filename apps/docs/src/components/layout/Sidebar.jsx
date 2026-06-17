"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  FileText,
  Grid2X2,
  Home,
  PanelLeft,
} from "lucide-react";
import { effectCategories, getEffectCategoryHref } from "@/lib/categories";

function categoryLabel(category) {
  return category.name.replace("Website ", "").replace("Page ", "");
}

function NavIconLink({ label, icon: Icon, isExpanded, isActive, onClick }) {
  return (
    <button
      type="button"
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
    </button>
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
        className={`shrink-0 `}
      >
        <ChevronRight className="h-4 w-4" />
      </motion.span>
    </button>
  );
}

export function Sidebar({
  effects = [],
  effectCounts = {},
  totalEffects,
  isExpanded = false,
  onToggle,
  onClose,
  activeCategory,
  topLinks = [],
  onOverviewNavigate,
  onCategoryNavigate,
  onDocumentationNavigate,
  disableInitialTransition = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pathSegments = pathname.split("/").filter(Boolean);
  const lastPathSegment = pathSegments[pathSegments.length - 1] || "";

  const [activeHash, setActiveHash] = useState("");
  const [fetchedEffects, setFetchedEffects] = useState([]);

  const isDocsActive =
    pathname.startsWith("/docs") ||
    topLinks.some((link) => {
      const [basePath, hash] = link.href.split("#");

      return pathname === basePath && (!hash || activeHash === `#${hash}`);
    });
  const currentCategory = isDocsActive
    ? ""
    : activeCategory || searchParams.get("category") || "";

  useEffect(() => {
    const onHash = () => setActiveHash(window.location.hash || "");

    onHash();
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

    for (const link of topLinks) {
      router.prefetch?.(link.href);
    }

    for (const category of effectCategories) {
      router.prefetch?.(getEffectCategoryHref(category.id));
    }
  }, [router, topLinks]);

  const sidebarEffects = effects.length ? effects : fetchedEffects;

  useMemo(
    () =>
      [...sidebarEffects].sort((a, b) =>
        (a.title || a.name).localeCompare(b.title || b.name)
      ),
    [sidebarEffects]
  );

  const categoryRouteSlugs = effectCategories.map((category) =>
    getEffectCategoryHref(category.id).split("/").filter(Boolean).pop()
  );

  const isCategoryRoute =
    Boolean(lastPathSegment) && categoryRouteSlugs.includes(lastPathSegment);

  const isOverviewActive =
    pathname === "/effects" && (!currentCategory || currentCategory === "all");
  const isCategoriesActive =
    !isDocsActive &&
    (isCategoryRoute ||
      (pathname === "/effects" &&
        Boolean(currentCategory) &&
        currentCategory !== "all"));
  const isDocumentationActive = isDocsActive;
  const [openSection, setOpenSection] = useState("");

  const navigateOverview = () => {
    setOpenSection("");

    if (onOverviewNavigate) {
      onOverviewNavigate();
      return;
    }

    router.push("/effects", { scroll: false });
  };

  const navigateCategory = (categoryId) => {
    if (onCategoryNavigate) {
      onCategoryNavigate(categoryId);
      return;
    }

    router.push(getEffectCategoryHref(categoryId), { scroll: false });
  };

  const navigateDocumentation = (href) => {
    setOpenSection("docs");

    if (onDocumentationNavigate) {
      onDocumentationNavigate(href);
      return;
    }

    router.push(href, { scroll: false });
  };

  const toggle = () => {
    const nextValue = !isExpanded;

    if (!nextValue) {
      setOpenSection("");
    }

    onToggle?.(nextValue);
  };

  const toggleSection = (section) => {
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

      <div className="flex h-full flex-col items-start overflow-hidden rounded-tr-md border-r border-white/10 py-3 pl-3 pr-1 transition-all duration-300">
        <div className="mb-10 flex h-16 w-full items-center justify-start overflow-hidden border-b border-white/10 px-4">
          <button
            type="button"
            className="flex min-w-0 items-center gap-3"
            onClick={navigateOverview}
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
              className={`h-auto w-32 ${
                isExpanded
                  ? "delay-100 opacity-100 duration-200"
                  : "opacity-0"
              }`}
            />
          </button>
        </div>

        <nav data-lenis-prevent className="space-y-4">
          <NavIconLink
            label="Overview"
            icon={Home}
            isExpanded={isExpanded}
            isActive={isOverviewActive}
            onClick={navigateOverview}
          />

          <SectionButton
            label="Categories"
            icon={Grid2X2}
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
                className="ml-[19px] mb-4 max-h-[45vh] space-y-1 overflow-y-auto border-l border-white/12 pl-7 pr-3"
              >
                {effectCategories.map((category) => {
                  const count = effectCounts[category.id] || 0;
                  const isActive = currentCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => navigateCategory(category.id)}
                      className={`relative flex w-full items-center justify-between gap-3 rounded-full py-1 text-left text-sm transition-colors ${
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
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#272727] text-center text-[0.8vw] text-white/75">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <SectionButton
            label="Documentation"
            icon={FileText}
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
                {topLinks.map((link) => {
                  const [basePath, hash] = link.href.split("#");

                  const isActive =
                    pathname === basePath &&
                    (!hash || activeHash === `#${hash}`);

                  return (
                    <button
                      key={link.href}
                      type="button"
                      onClick={() => navigateDocumentation(link.href)}
                      className={`relative flex w-full items-center rounded-full py-2 text-left text-sm transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-white/42 hover:text-white/75"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute -left-5 h-2 w-2 animate-pulse rounded-full bg-primary" />
                      )}

                      {link.label}
                    </button>
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
