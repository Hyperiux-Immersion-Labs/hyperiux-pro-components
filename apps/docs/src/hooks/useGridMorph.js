"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const DURATION = 500;
// CARD_LAYOUT_TRANSITION's curve (EffectCard)
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * A card grid's switch between 2 and 3 columns, animated with the cards' real width
 * instead of a scale: the padding, text and previews keep their true size the whole way,
 * with no shrink-then-snap at either end.
 *
 * The grid's children (the wrappers, keyed by `data-morph-key`) jump straight to their new
 * slots; the card inside each one (its first child) starts at its old size and spot and
 * eases to fill the new slot - `width` from the old pixel width to 100%, and `translate`
 * (which leaves the card's own hover transform alone) from the old offset to none.
 *
 * Call `capture()` right before changing the column count. While `morphing`, turn the
 * wrappers' Framer `layout` off so the two animations don't stack.
 */
export function useGridMorph(gridRef) {
  const snapshot = useRef(null);
  const animations = useRef([]);
  const [morphing, setMorphing] = useState(false);

  const capture = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) return;
    const rects = new Map();
    for (const wrapper of grid.children) {
      const card = wrapper.firstElementChild;
      if (!card || !wrapper.dataset.morphKey) continue;
      const { left, top, width } = card.getBoundingClientRect();
      rects.set(wrapper.dataset.morphKey, { left, top, width });
    }
    snapshot.current = rects;
    setMorphing(true);
  }, [gridRef]);

  useLayoutEffect(() => {
    if (!morphing) return;
    const grid = gridRef.current;
    const rects = snapshot.current;
    snapshot.current = null;
    if (!grid || !rects) {
      setMorphing(false);
      return;
    }

    const items = [...grid.children]
      .map((wrapper) => ({ card: wrapper.firstElementChild, from: rects.get(wrapper.dataset.morphKey) }))
      .filter((item) => item.card && item.from);

    // The new slots with every card still at its old width - the rows as they stand on the
    // first frame - so each offset puts its card exactly where it was
    for (const { card, from } of items) card.style.width = `${from.width}px`;
    const offsets = items.map(({ card, from }) => {
      const { left, top } = card.getBoundingClientRect();
      return `${from.left - left}px ${from.top - top}px`;
    });
    for (const { card } of items) card.style.width = "";

    animations.current = items.map(({ card, from }, i) =>
      card.animate(
        [
          { width: `${from.width}px`, translate: offsets[i] },
          { width: "100%", translate: "0px 0px" },
        ],
        { duration: DURATION, easing: EASING },
      ),
    );

    let active = true;
    Promise.all(animations.current.map((animation) => animation.finished))
      .catch(() => {})
      .then(() => {
        animations.current = [];
        if (active) setMorphing(false);
      });
    return () => {
      active = false;
    };
  }, [morphing, gridRef]);

  // Leaving mid-switch: drop the running animations
  useEffect(
    () => () => {
      for (const animation of animations.current) animation.cancel();
    },
    [],
  );

  return { capture, morphing };
}
