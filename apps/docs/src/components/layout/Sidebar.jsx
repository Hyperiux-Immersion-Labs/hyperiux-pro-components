"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronRight,
  FileText,
  Grid2X2,
  Home,
  PanelLeft,
  Puzzle,
} from "lucide-react";
import { effectCategories, getEffectCategoryHref, getEffectHref } from "@/lib/categories";
import { HyperiuxIcon, HyperiuxLogo } from "@/utils/Icons";

function categoryLabel(category) {
  return category.name
    .replace("Website ", "")
    .replace("Page ", "");
}

function NavIconLink({ href, label, icon: Icon, isExpanded, onClick }) {
  return (
    <Link
      href={href}
      title={label}
      onClick={onClick}
      className={`relative flex items-center gap-3 rounded-full px-4 py-2 text22 font-medium text-white/90 transition-colors duration-300 ease-out hover:text-white ${
        isExpanded ? "hover:bg-[#272727]" : "justify-center px-0"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.7} />
      {isExpanded && <span className="truncate">{label}</span>}
    </Link>
  );
}

function SectionButton({
  label,
  icon: Icon,
  isExpanded,
  isOpen,
  onClick,
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`relative flex w-full items-center gap-3 rounded-full text-left text22 font-medium text-white/90 transition-colors duration-300 ease-out hover:text-white ${
        isExpanded ? "px-4 py-2 hover:bg-[#272727]" : "justify-center px-0 py-3"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.7} />
      {isExpanded && (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0, x: isOpen ? 2 : 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.span>
        </>
      )}
    </button>
  );
}

export function Sidebar({
  effectCounts = {},
  effects = [],
  isExpanded: controlledExpanded,
  onToggle,
  onClose,
  activeCategory,
  topLinks = [],
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = activeCategory || searchParams.get("category") || "all";
  const [activeHash, setActiveHash] = useState("");
  const [fetchedEffects, setFetchedEffects] = useState([]);
  const [openSection, setOpenSection] = useState("components");
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false);
  const isExpanded =
    typeof controlledExpanded === "boolean" ? controlledExpanded : uncontrolledExpanded;
  const isDocsActive = pathname.startsWith("/docs") || topLinks.some((link) => {
    const [basePath, hash] = link.href.split("#");

    return pathname === basePath && (!hash || activeHash === `#${hash}`);
  });

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

  const sidebarEffects = effects.length ? effects : fetchedEffects;
  const sortedEffects = useMemo(
    () =>
      [...sidebarEffects].sort((a, b) =>
        (a.title || a.name).localeCompare(b.title || b.name)
      ),
    [sidebarEffects]
  );

  const freeEffects = sortedEffects.filter((effect) => effect.tier !== "pro");
  const proEffects = sortedEffects.filter((effect) => effect.tier === "pro");

  const toggleSection = (section) => {
    if (!isExpanded) {
      toggle();
      setOpenSection(section);
      return;
    }

    setOpenSection((current) => (current === section ? "" : section));
  };

  const toggle = () => {
    if (onToggle) return onToggle();
    setUncontrolledExpanded((value) => !value);
  };

  const close = () => {
    if (onClose) return onClose();
    setUncontrolledExpanded(false);
  };

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 text-white transition-[width] duration-300 ease-out ${
        isExpanded ? "w-[288px]" : "w-[72px]"
      }`}
    >
      <div
        className={`flex h-full flex-col border-r border-white/10 bg-[#060606] transition-all duration-300 ${
          isExpanded ? "px-3 py-3" : "items-center px-0 py-3"
        }`}
      >
        <div
          className={`mb-14 flex items-center overflow-hidden border-b border-white/10 bg-[#080808] ${
            isExpanded ? "h-16 w-full justify-start px-4" : "h-16 w-full justify-center"
          }`}
        >
          <Link
            href="/effects"
            className={`flex min-w-0 items-center ${
              isExpanded ? "gap-3" : "justify-center"
            }`}
            onClick={close}
          >
            <HyperiuxIcon className="!h-5 !w-5 shrink-0 text-primary [&_svg]:h-full [&_svg]:w-full" />
            {isExpanded && (
              <HyperiuxLogo className="h-auto w-32 text-primary" />
            )}
          </Link>
        </div>

        <button
          type="button"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          onClick={toggle}
          className={`absolute top-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-sm  bg-[#272727] text-white transition-[left,background-color,transform] duration-500 ease-out hover:bg-white/15 ${
            isExpanded ? "left-[288px]" : "left-[72px]"
          }`}
        >
          <motion.span
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <PanelLeft className="h-4 w-4" />
          </motion.span>
        </button>

        <nav
          data-lenis-prevent
          className={isExpanded ? "w-full flex-1 overflow-y-auto pr-1" : "flex w-full flex-col items-center gap-7"}
        >
          <NavIconLink
            href="/effects"
            label="Overview"
            icon={Home}
            isExpanded={isExpanded}
            onClick={close}
          />

          {isExpanded && (
            <div className="ml-[19px] mb-2 overflow-hidden border-l border-white/12 pl-7">
              <Link
                href="/effects"
                onClick={close}
                className={`flex items-center gap-2 rounded-full py-2 text-sm transition-colors ${
                  pathname === "/effects" && currentCategory === "all"
                    ? "text-white"
                    : "text-white/42 hover:text-white/75"
                }`}
              >
                {pathname === "/effects" && currentCategory === "all" && (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                )}
                <span>All Effects</span>
              </Link>
            </div>
          )}

          <SectionButton
            label="Categories"
            icon={Grid2X2}
            isExpanded={isExpanded}
            isOpen={openSection === "categories"}
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
              className="ml-[19px] mb-4 space-y-1 overflow-hidden border-l border-white/12 pl-7"
            >
              {effectCategories.slice(1).map((category) => {
                const count = effectCounts[category.id] || 0;
                const isActive = currentCategory === category.id;

                return (
                  <Link
                    key={category.id}
                    href={getEffectCategoryHref(category.id)}
                    onClick={close}
                    className={`flex items-center justify-between gap-3 rounded-full py-2 text-sm transition-colors ${
                      isActive ? "text-white" : "text-white/42 hover:text-white/75"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2 truncate">
                      {isActive && <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />}
                      <span className="truncate">{categoryLabel(category)}</span>
                    </span>
                    {count > 0 && (
                      <span className="shrink-0 rounded-full bg-[#272727] h-7 w-7 text-center flex items-center justify-center text-[0.8vw] text-white/75">
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
            label="Components"
            icon={Puzzle}
            isExpanded={isExpanded}
            isOpen={openSection === "components"}
            onClick={() => toggleSection("components")}
          />

          <AnimatePresence initial={false}>
          {isExpanded && openSection === "components" && (
            <motion.div
              key="components"
              initial={{ height: 0, opacity: 0, y: -6 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="ml-[19px] mb-4 max-h-[45vh] space-y-4 overflow-y-auto border-l border-white/12 pl-7 pr-1"
            >
              {[
                ["Free", freeEffects],
                ["Pro", proEffects],
              ].map(([label, items]) => (
                <div key={label} className="space-y-2">
                  <p className="text18 uppercase tracking-[0.18em] text-white/35">{label}</p>
                  {items.map((effect) => (
                    <Link
                      key={effect.name}
                      href={getEffectHref(effect)}
                      onClick={close}
                      className="block truncate rounded-full py-1.5 text-sm text-white/45 transition-colors hover:text-white"
                    >
                      {effect.title || effect.name}
                    </Link>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
          </AnimatePresence>

          <SectionButton
            label="Documentation"
            icon={FileText}
            isExpanded={isExpanded}
            isOpen={openSection === "docs"}
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
                const isActive = pathname === basePath && (!hash || activeHash === `#${hash}`);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className={`flex items-center gap-2 rounded-full py-2 text-sm transition-colors ${
                      isActive ? "text-white" : "text-white/42 hover:text-white/75"
                    }`}
                  >
                    {isActive && <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />}
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
