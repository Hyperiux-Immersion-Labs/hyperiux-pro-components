
'use client'
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getEffectRouteSlug } from "@/lib/effect-slugs";
import { getEffectCategoryBySlug } from "@/lib/categories";

const LIGHT_TEXT_COLORS = new Set(["#ffffff", "#fff", "white"]);

// The exact title/category only exist server-side (Sanity), but the slug in
// the URL already spells out the title in almost every case (e.g.
// "hero-banner-animated" -> "Hero Banner Animated") - guessing it from the
// slug renders instantly instead of leaving the label blank for the
// round-trip to /api/effects/list below.
function formatSlugAsTitle(slug = "") {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function HeaderLink({ href, children }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex flex-col text-sm leading-none"
    >
      <span className="transition-colors duration-300 ease-in-out group-hover:text-[#ff5f00]">
        {children}
      </span>
      {/* Always visible at rest (full width). On hover it undraws to the
          right then redraws from the left in one pass - see the
          demo-header-underline keyframes in globals.css. */}
      <span
        aria-hidden="true"
        className="absolute -bottom-1 left-0 h-px w-full bg-current group-hover:bg-[#ff5f00] group-hover:[animation:demo-header-underline_0.6s_ease-in-out]"
      />
    </Link>
  );
}

/**
 * @param {{
 *   text?: string,
 *   textColor?: string,
 *   href?: string,
 *   allEffectsHref?: string,
 *   logoColor?: string,
 *   showText?: boolean,
 * }} props
 */
export default function DemoHeader({
  text = "Home",
  textColor = "#1a1a1a",
  href = "/",
  allEffectsHref = "/effects",
  // logoColor/showText: unused now (no logo/buttons left to color or hide),
  // but ~150 call sites across /demo still pass them - accepted and ignored
  // so those call sites keep type-checking instead of needing a mass edit.
  logoColor,
  showText,
}) {
  const [isHidden, setIsHidden] = useState(false);
  const [readArticleHref, setReadArticleHref] = useState(href);
  const pathname = usePathname()?.replace(/\/$/, "") || "";
  // Multi-step demos (transitions with a "click to see the next page" flow)
  // nest a second route segment under the same effect, e.g.
  // /demo/aperture-transition/page2 - only the first segment is the actual
  // effect slug, so page2/page3/etc must never leak into the title lookup.
  const demoSlug = pathname.startsWith("/demo/") ? pathname.split("/")[2] || "" : "";

  const [effectTitle, setEffectTitle] = useState(() => formatSlugAsTitle(demoSlug));
  const [categoryName, setCategoryName] = useState("");
  const [prevDemoSlug, setPrevDemoSlug] = useState(demoSlug);
  const lastScrollRef = useRef(0);

  // Route changes (client-side nav between demo pages) don't remount this
  // component, so the guessed title has to be re-derived per-slug too, not
  // just on first mount. Adjusting state directly during render (React's
  // documented reset-on-prop-change pattern, tracked via state rather than a
  // ref) instead of in an effect avoids an extra commit-then-cascading-render
  // pass.
  if (demoSlug !== prevDemoSlug) {
    setPrevDemoSlug(demoSlug);
    setEffectTitle(formatSlugAsTitle(demoSlug));
    setCategoryName("");
  }

  const isDarkBackground = LIGHT_TEXT_COLORS.has(
    textColor?.toString().toLowerCase()
  );
  const textColorClass = isDarkBackground ? "text-white" : "text-black";

  useLenis((lenis) => {
    const currentScroll = lenis.scroll;
    const delta = currentScroll - lastScrollRef.current;

    if (Math.abs(delta) < 2) {
      return;
    }

    setIsHidden(delta > 0 && currentScroll > 24);
    lastScrollRef.current = currentScroll;
  });

  // No demo slug means there's nothing to resolve - readArticleHref should
  // just track href, derived purely from values already available during
  // render.
  if (!demoSlug && readArticleHref !== href) {
    setReadArticleHref(href);
  }

  useEffect(() => {
    if (!demoSlug) return;

    let isActive = true;

    async function resolveArticleHref() {
      try {
        const canonicalSlug = getEffectRouteSlug(demoSlug);

        // A single-slug lookup instead of the full search index (every
        // effect on the site) - much smaller payload, so the real title/
        // category swap in over the slug-derived guess a lot sooner.
        const response = await fetch(
          `/api/effects/list?slugs=${encodeURIComponent(canonicalSlug)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to load effect: ${response.status}`);
        }

        const data = await response.json();
        const effect = data.effects?.find(
          (entry) =>
            entry.effectSlug === canonicalSlug ||
            entry.slug === canonicalSlug ||
            entry.name === canonicalSlug
        ) || data.effects?.[0];

        if (!isActive) return;

        setReadArticleHref(
          effect?.categorySlug && effect?.effectSlug
            ? `/effects/${effect.categorySlug}/${effect.effectSlug}`
            : href
        );

        setEffectTitle(effect?.title || formatSlugAsTitle(demoSlug));

        const category = effect?.categorySlug
          ? getEffectCategoryBySlug(effect.categorySlug)
          : null;

        setCategoryName(category?.name || effect?.category || "");
      } catch {
        if (isActive) {
          setReadArticleHref(href);
        }
      }
    }

    resolveArticleHref();

    return () => {
      isActive = false;
    };
  }, [demoSlug, href]);

  const label = effectTitle
    ? categoryName
      ? `${effectTitle} - ${categoryName}`
      : effectTitle
    : "";

  return (
    <header
      className={`fixed left-0 top-0 z-300 w-full px-10 max-[1025px]:px-5 max-[1025px]:py-6 max-md:py-3 py-4 transition-transform duration-500 ease-out max-md:pt-4 max-[1025px]:pt-6 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      } ${textColorClass}`}
    >
      <div
        className="flex items-center gap-6 text-sm max-md:flex-col max-md:gap-2 max-md:items-start"
        style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)" }}
      >
        <span className="truncate font-semibold">{label}</span>

        <div className="flex shrink-0 items-center gap-4">
          <HeaderLink href={readArticleHref}>Read Article</HeaderLink>
          <HeaderLink href={allEffectsHref}>All Effects</HeaderLink>
        </div>
      </div>
    </header>
  );
}
