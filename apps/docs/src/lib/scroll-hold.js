// Holding the page still while a loader is on screen (the page-change loader,
// RouteLoading; the homepage's intro loader, homepage/components/scroll-lock.js):
//   - The page's scrollbar keeps its place, only its thumb turns invisible
//     (html[data-scroll-held], globals.css). Locking with overflow: hidden - or Lenis's
//     own overflow: clip when it stops - took the scrollbar's 8px away, and the whole
//     page jumped sideways as the loader left.
//   - So the overflow stays open, and wheel / touch / scroll keys are cancelled here
//     instead. Lenis is stopped by the callers, which hold their own instance.
// Holds can overlap (two loaders during one page change): the page moves again only when
// the last one lets go.
let holds = 0;

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);
const BLOCK_OPTS = { capture: true, passive: false };

const blockPointer = (event) => event.preventDefault();
const blockKeys = (event) => {
  if (!SCROLL_KEYS.has(event.key) || event.target.closest?.("input,textarea,select,[contenteditable]")) return;
  event.preventDefault();
};

export function holdPageScroll() {
  if (typeof document === "undefined") return;
  holds += 1;
  if (holds > 1) return;
  document.documentElement.setAttribute("data-scroll-held", "");
  addEventListener("wheel", blockPointer, BLOCK_OPTS);
  addEventListener("touchmove", blockPointer, BLOCK_OPTS);
  addEventListener("keydown", blockKeys, BLOCK_OPTS);
}

export function releasePageScroll() {
  if (typeof document === "undefined" || holds === 0) return;
  holds -= 1;
  if (holds > 0) return;
  document.documentElement.removeAttribute("data-scroll-held");
  removeEventListener("wheel", blockPointer, BLOCK_OPTS);
  removeEventListener("touchmove", blockPointer, BLOCK_OPTS);
  removeEventListener("keydown", blockKeys, BLOCK_OPTS);
}
