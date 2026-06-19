"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import { getEffectHref } from "@/lib/categories";
import { navCategoryColumns, navDocsItems } from "@/utils/Links";

const HOME_ICON_SRC = "/svgs/menu/home.svg";

const FALLBACK_CATEGORY_ICON = "/svgs/menu/Featured.svg";
const FALLBACK_DOC_ICON = "/svgs/menu/Introduction.svg";

const FLAT_CATEGORY_ITEMS = navCategoryColumns.flat();

const DOC_ICON_BY_HREF = Object.fromEntries(
  navDocsItems.map((item) => [item.href, item.icon])
);

const CATEGORY_ICON_BY_HREF = Object.fromEntries(
  FLAT_CATEGORY_ITEMS.map((item) => [item.href, item.icon])
);

const CATEGORY_ICON_BY_LABEL = Object.fromEntries(
  FLAT_CATEGORY_ITEMS.map((item) => [
    normalizeIconKey(item.label),
    item.icon,
  ])
);

const CATEGORY_ICON_BY_SLUG = Object.fromEntries(
  FLAT_CATEGORY_ITEMS.map((item) => {
    const slug = item.href.split("/").filter(Boolean).at(-1);
    return [normalizeIconKey(slug), item.icon];
  })
);

const CATEGORY_ICON_ALIASES = {
  featured: "/svgs/menu/Featured.svg",

  text: "/svgs/menu/Text.svg",
  "text-animation": "/svgs/menu/Text.svg",
  "text-animations": "/svgs/menu/Text.svg",

  background: "/svgs/menu/Background.svg",
  backgrounds: "/svgs/menu/Background.svg",

  button: "/svgs/menu/Button.svg",
  buttons: "/svgs/menu/Button.svg",

  carousel: "/svgs/menu/carousel.svg",
  carousels: "/svgs/menu/carousel.svg",

  scroll: "/svgs/menu/Scroll.svg",
  "scroll-effect": "/svgs/menu/Scroll.svg",
  "scroll-effects": "/svgs/menu/Scroll.svg",

  component: "/svgs/menu/Component.svg",
  components: "/svgs/menu/Component.svg",

  nav: "/svgs/menu/Navigation.svg",
  navigation: "/svgs/menu/Navigation.svg",

  cursor: "/svgs/menu/Cursor.svg",
  cursors: "/svgs/menu/Cursor.svg",
  "cursor-effect": "/svgs/menu/Cursor.svg",
  "cursor-effects": "/svgs/menu/Cursor.svg",

  transition: "/svgs/menu/Transtion.svg",
  transitions: "/svgs/menu/Transtion.svg",
  "page-transition": "/svgs/menu/Transtion.svg",
  "page-transitions": "/svgs/menu/Transtion.svg",

  loader: "/svgs/menu/loader.svg",
  loaders: "/svgs/menu/loader.svg",

  webgl: "/svgs/menu/webGL.svg",
  "webgl-effect": "/svgs/menu/webGL.svg",
  "webgl-effects": "/svgs/menu/webGL.svg",

  other: "/svgs/menu/Featured.svg",
  others: "/svgs/menu/Featured.svg",
};

const DOC_SEARCH_ITEMS = [
  {
    href: "/",
    title: "Home",
    icon: HOME_ICON_SRC,
    description: "Return to the Hyperiux Vault landing page.",
    keywords: ["home", "landing", "index", "main"],
  },
  {
    href: "/docs",
    title: "Introduction",
    icon: DOC_ICON_BY_HREF["/docs"] || FALLBACK_DOC_ICON,
    description:
      "Overview of Hyperiux Vault, effects, categories, and workflow.",
    keywords: ["docs", "documentation", "intro", "overview", "vault"],
  },
  {
    href: "/docs/installation",
    title: "Installation Guide",
    icon: DOC_ICON_BY_HREF["/docs/installation"] || FALLBACK_DOC_ICON,
    description:
      "Install Hyperiux effects, initialize the CLI, and configure your project.",
    keywords: ["install", "installation", "setup", "init", "configuration"],
  },
  {
    href: "/docs/cli",
    title: "Hyperiux Vault CLI",
    icon: DOC_ICON_BY_HREF["/docs/cli"] || FALLBACK_DOC_ICON,
    description:
      "CLI commands for adding, upgrading, uninstalling, and managing effects.",
    keywords: ["cli", "command", "add", "upgrade", "doctor"],
  },
  {
    href: "/docs/dependencies",
    title: "Dependencies",
    icon: DOC_ICON_BY_HREF["/docs/dependencies"] || FALLBACK_DOC_ICON,
    description:
      "Dependency guidance for GSAP, Motion, Three.js, and generated effects.",
    keywords: ["dependencies", "gsap", "motion", "three", "packages"],
  },
  {
    href: "/docs/license",
    title: "License",
    icon: DOC_ICON_BY_HREF["/docs/license"] || FALLBACK_DOC_ICON,
    description: "Usage rights for Free Core and Vault Pro effects.",
    keywords: ["license", "licensing", "commercial", "pro", "free"],
  },
];

function normalizeIconKey(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll("&", "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getEffectPrimaryCategory(effect) {
  const categories = effect.categories?.length
    ? effect.categories
    : [effect.category];

  return normalizeIconKey(categories.filter(Boolean)[0] || "featured");
}

function getEffectCategoryIcon(effect) {
  const primaryCategory = getEffectPrimaryCategory(effect);

  return (
    CATEGORY_ICON_ALIASES[primaryCategory] ||
    CATEGORY_ICON_BY_SLUG[primaryCategory] ||
    CATEGORY_ICON_BY_LABEL[primaryCategory] ||
    CATEGORY_ICON_BY_HREF[`/effects/${primaryCategory}`] ||
    FALLBACK_CATEGORY_ICON
  );
}

function getEffectCategoryLabel(effect) {
  const categories = effect.categories?.length
    ? effect.categories
    : [effect.category];

  return categories.filter(Boolean).join(", ");
}

function SearchResultIcon({ src, alt = "" }) {
  return (
    <div className="w-10 h-10 bg-neutral-900 border border-neutral-800/60 text-neutral-800 rounded-md flex items-center justify-center group-hover:border-neutral-600 transition-colors">
      <Image
        src={src || FALLBACK_CATEGORY_ICON}
        alt={alt}
        width={24}
        height={24}
        className="h-5 w-5 object-contain opacity-70 transition-opacity group-hover:opacity-100"
      />
    </div>
  );
}

export function SearchBar({
  value = "",
  onChange,
  placeholder = "Search effects...",
  totalCount = 0,
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3.5 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
      />

      {totalCount > 0 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
          {totalCount} effects
        </div>
      )}
    </div>
  );
}

export function GlobalSearch({ effects = [], externalOpen = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const inputRef = useRef(null);
  const router = useRouter();
  const lenis = useLenis();

  useEffect(() => {
    if (isOpen) {
      lenis?.stop?.();
    } else {
      lenis?.start?.();
    }
  }, [isOpen, lenis]);

  useEffect(() => {
    if (externalOpen) {
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    }
  }, [externalOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }

      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredEffects = effects.filter((effect) => {
    if (!normalizedQuery) return true;

    const cats = effect.categories?.length
      ? effect.categories
      : [effect.category];

    return (
      effect.name?.toLowerCase().includes(normalizedQuery) ||
      effect.title?.toLowerCase().includes(normalizedQuery) ||
      effect.description?.toLowerCase().includes(normalizedQuery) ||
      cats.some((category) =>
        category?.toLowerCase().includes(normalizedQuery)
      )
    );
  });

  const filteredDocs = DOC_SEARCH_ITEMS.filter((item) => {
    if (!normalizedQuery) return true;

    return (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery) ||
      item.keywords.some((keyword) => keyword.includes(normalizedQuery))
    );
  });

  const results = [
    ...filteredDocs.map((item) => ({ ...item, type: "docs" })),
    ...filteredEffects.map((effect) => ({
      ...effect,
      type: "effect",
      href: getEffectHref(effect),
    })),
  ];

  const forceStartLenis = () => {
    if (typeof document !== "undefined") {
      document.body.style.removeProperty("overflow");
    }

    lenis?.start?.();

    requestAnimationFrame(() => {
      lenis?.start?.();
    });

    window.setTimeout(() => {
      lenis?.start?.();
    }, 80);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery("");
    forceStartLenis();
  };

  const handleSelect = (item) => {
    router.push(item.href);
    closeSearch();
  };

  const handleEffectSelect = (effect) => {
    router.push(getEffectHref(effect));
    closeSearch();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeSearch}
      />

      <div className="relative w-full max-w-xl mx-4 bg-neutral-950/90 backdrop-blur-xl rounded-lg overflow-hidden border border-neutral-800/60 flex flex-col h-113 max-md:h-140 max-sm:h-113 ring-1 ring-white/5">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-800/50 bg-black/20">
          <svg
            className="w-5 h-5 text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search effects..."
            className="flex-1 bg-transparent text-white placeholder:text-neutral-500 text-base sm:text-lg focus:outline-none"
          />

          <kbd className="hidden sm:inline-flex px-2 h-8 justify-center items-center bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-400 font-medium">
            ESC
          </kbd>

          <button
            type="button"
            aria-label="Close search"
            onClick={closeSearch}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded border border-neutral-800 bg-neutral-900 text-neutral-400 transition-colors hover:border-neutral-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" data-lenis-prevent="true">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 px-4">
              <svg
                className="w-12 h-12 mb-4 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <p>
                No results found for &quot;
                <span className="text-neutral-300">{query}</span>&quot;
              </p>

              <p className="text-sm mt-1 text-neutral-600">
                Try searching with a different term.
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredDocs.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleSelect({ ...item, type: "docs" })}
                  className="w-full flex items-center cursor-pointer gap-4 px-3 py-3 rounded-md hover:bg-neutral-800/50 text-left transition-all duration-200 group"
                >
                  <SearchResultIcon src={item.icon} alt={item.title} />

                  <div className="flex-1">
                    <div className="font-medium text-neutral-200 group-hover:text-white transition-colors">
                      {item.title}
                    </div>

                    <div className="text-xs text-neutral-500 mt-0.5 group-hover:text-neutral-400 transition-colors">
                      Docs · {item.description}
                    </div>
                  </div>

                  <svg
                    className="w-5 h-5 text-neutral-600 opacity-0 group-hover:opacity-100 group-hover:text-neutral-400 transition-all transform -translate-x-2 group-hover:translate-x-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}

              {filteredEffects.map((effect) => {
                const categoryIcon = getEffectCategoryIcon(effect);
                const categoryLabel = getEffectCategoryLabel(effect);

                return (
                  <button
                    key={effect.name}
                    onClick={() => handleEffectSelect(effect)}
                    className="w-full flex items-center cursor-pointer gap-4 px-3 py-3 rounded-md hover:bg-neutral-800/50 text-left transition-all duration-200 group"
                  >
                    <SearchResultIcon
                      src={categoryIcon}
                      alt={categoryLabel || effect.title}
                    />

                    <div className="flex-1">
                      <div className="font-medium text-neutral-200 group-hover:text-white transition-colors">
                        {effect.title}
                      </div>

                      <div className="text-xs text-neutral-500 capitalize mt-0.5 group-hover:text-neutral-400 transition-colors">
                        {categoryLabel}
                      </div>
                    </div>

                    <svg
                      className="w-5 h-5 text-neutral-600 opacity-0 group-hover:opacity-100 group-hover:text-neutral-400 transition-all transform -translate-x-2 group-hover:translate-x-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}