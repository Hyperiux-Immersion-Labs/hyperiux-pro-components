// Template demos are standalone sites with their own loaders and page transitions.
// The Vault's own load cover (PageLoadOverlay) and pixel page transition
// (PixelPageTransition) stay off them, or the visitor gets both, one after the other.
const OWN_LOADER_PREFIXES = ["/template-demo"];

export function hasOwnLoader(pathname) {
  if (!pathname) return false;
  return OWN_LOADER_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
