"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { anchorFor, clearTooltip, getTooltipServerSnapshot, getTooltipSnapshot, subscribeTooltip } from "./Tooltip";

// Draws the one shared tooltip that <Tooltip> triggers report to (see ./Tooltip). Mounted
// once, after the page is idle (DeferredGlobals): nothing shows a tooltip before then.
export default function TooltipHost() {
  const tip = useSyncExternalStore(subscribeTooltip, getTooltipSnapshot, getTooltipServerSnapshot);
  const pathname = usePathname();

  // A page change always clears the tooltip (its trigger belonged to the old page).
  useEffect(() => {
    clearTooltip();
  }, [pathname]);
  const mounted = typeof document !== "undefined";

  // Dismiss on resize: the stored rect would be stale.
  useEffect(() => {
    if (!tip) return undefined;
    const hide = () => clearTooltip();
    window.addEventListener("resize", hide);
    return () => window.removeEventListener("resize", hide);
  }, [tip]);

  if (!mounted) return null;

  let anchor = null;
  if (tip) {
    anchor = anchorFor(tip.rect, tip.position);
  }
  const fromBelow = tip?.position === "bottom" ? -6 : 6;

  return createPortal(
    <AnimatePresence>
      {tip && anchor && (
        <motion.div
          key="tooltip-host"
          // Position glides between triggers; only the very first open pops in at the spot.
          initial={{ x: anchor.x, y: anchor.y }}
          animate={{ x: anchor.x, y: anchor.y }}
          transition={{ type: "spring", stiffness: 500, damping: 36, mass: 0.7 }}
          className="pointer-events-none fixed left-0 top-0 z-9999 max-md:hidden max-lg:hidden"
        >
          <div style={{ transform: anchor.shift }}>
            <motion.div
              role="tooltip"
              initial={{ opacity: 0, scale: 0.85, y: fromBelow }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: fromBelow / 2, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 400, damping: 26, mass: 0.6 }}
              style={{ transformOrigin: anchor.origin }}
              // w-max: size to the label, not to the space left before the viewport edge; max-w still wraps long ones.
              className="relative w-max max-w-[20vw] max-h-30 overflow-hidden bg-grey px-3 py-1.5 text-center text-xs font-medium text-white shadow-lg"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={`${tip.id}`}
                  initial={{ opacity: 0, [tip.vertical ? "y" : "x"]: tip.dir * 16 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, [tip.vertical ? "y" : "x"]: tip.dir * -16 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {/* Same trigger, new label (Copy -> Copied): roll vertically instead. */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={typeof tip.label === "string" ? tip.label : "label"}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      {tip.label}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
