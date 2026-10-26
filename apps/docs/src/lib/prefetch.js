import { useIdle } from "./when-idle";

/**
 * The `prefetch` value for a <Link> by where it points.
 *
 * Cached pages (ISR / static - effects listings, templates, pricing, blog posts,
 * docs, legal, the homepage) keep Next's default: prefetching them is a cheap
 * CDN hit that makes the click instant. Pages rendered per request cost a full
 * server render per prefetch, so they - and anything that isn't an in-app page -
 * are not prefetched.
 */
const SSR_ROUTES = [
  /^\/dashboard(\/|$)/,
  /^\/blog(\?|$)/, // the listing (?category / ?page); posts are cached
  /^\/effects\/[^/?#]+\/[^/?#]+/, // an effect's own page (per-user access check)
  /^\/(sign-in|sign-up|signup|cli-auth|sso-callback)(\/|$)/,
];

export function prefetchFor(href) {
  if (typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) return false;
  return SSR_ROUTES.some((re) => re.test(href)) ? false : undefined;
}

/**
 * prefetchFor(href), held back until the page is idle. Next prefetches every link that is
 * on screen as soon as the page hydrates; on first load that fetched other routes' code
 * (including the account pages' auth library) alongside the page's own, slowing it down.
 * After that it is the usual behaviour (null = Next's default prefetching).
 */
export function usePrefetchFor(href) {
  const idle = useIdle();
  if (!idle) return false;
  return prefetchFor(href) ?? null;
}
