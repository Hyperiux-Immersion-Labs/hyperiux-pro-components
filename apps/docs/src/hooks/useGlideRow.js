"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A free, smooth horizontal card row (the effects listing's "Trending this Week"):
 * drag with the mouse (with a throw on release), horizontal wheel / trackpad swipes,
 * and one card per arrow click - all eased towards a target instead of jumping.
 * Touch keeps native scrolling.
 *
 *   const row = useGlideRow([items]);
 *   <div ref={row.ref} {...row.handlers} data-cursor-drag className="flex cursor-grab overflow-x-hidden ...">
 *   <SliderArrowButton disabled={row.edges.start} onClick={() => row.step(-1)} />
 */
export function useGlideRow(deps = []) {
  const ref = useRef(null);
  const motion = useRef({ target: 0, current: 0, raf: 0, drag: null });
  const [edges, setEdges] = useState({ start: true, end: false });

  // Only re-render when an end is actually reached or left (this runs every scroll frame).
  const updateEdges = useCallback(() => {
    const row = ref.current;
    if (!row) return;
    const start = row.scrollLeft < 8;
    const end = row.scrollLeft > row.scrollWidth - row.clientWidth - 8;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  const setTarget = useCallback((left) => {
    const row = ref.current;
    const m = motion.current;
    if (!row) return;
    m.target = Math.max(0, Math.min(row.scrollWidth - row.clientWidth, left));
    if (m.raf) return;
    m.current = row.scrollLeft;
    let last = performance.now();
    const tick = (now) => {
      // 14% of the way per 60fps frame, scaled so 120Hz screens glide at the same speed.
      m.current += (m.target - m.current) * (1 - Math.pow(0.86, Math.min(4, (now - last) / 16.67)));
      last = now;
      if (Math.abs(m.target - m.current) < 0.5) m.current = m.target;
      row.scrollLeft = m.current;
      m.raf = m.current === m.target ? 0 : requestAnimationFrame(tick);
    };
    m.raf = requestAnimationFrame(tick);
  }, []);

  // Where a new input starts from: the running target while gliding, else the row.
  const base = () => (motion.current.raf ? motion.current.target : ref.current?.scrollLeft || 0);

  // One card (plus the row gap) per arrow click.
  const step = (dir) => {
    const row = ref.current;
    const card = row?.firstElementChild;
    if (!card) return;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    setTarget(base() + dir * (card.getBoundingClientRect().width + gap));
  };

  // Horizontal wheel / trackpad swipes scroll the row (vertical wheel still scrolls the page).
  useEffect(() => {
    const row = ref.current;
    const m = motion.current;
    if (!row) return undefined;
    const onWheel = (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      setTarget(base() + event.deltaX);
    };
    row.addEventListener("wheel", onWheel, { passive: false });
    updateEdges();
    return () => {
      row.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(m.raf);
      m.raf = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTarget, updateEdges, ...deps]);

  const onPointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    motion.current.drag = { x: event.clientX, left: base(), moved: false, id: event.pointerId, lastX: event.clientX, lastT: performance.now(), vel: 0 };
  };
  const onPointerMove = (event) => {
    const drag = motion.current.drag;
    const row = ref.current;
    if (!drag || !row) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 5) return;
      drag.moved = true;
      row.setPointerCapture(drag.id);
      row.style.cursor = "grabbing";
    }
    // Pointer speed (px/ms), smoothed, for the throw on release.
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastT);
    drag.vel = drag.vel * 0.6 + ((event.clientX - drag.lastX) / dt) * 0.4;
    drag.lastX = event.clientX;
    drag.lastT = now;
    setTarget(drag.left - dx);
  };
  // The click that ends a drag doesn't open the card under the cursor.
  const endDrag = () => {
    const m = motion.current;
    const drag = m.drag;
    const row = ref.current;
    m.drag = null;
    if (!drag?.moved || !row) return;
    row.style.cursor = "";
    // Throw: keep going with the release speed (ignored if the pointer had stopped).
    if (performance.now() - drag.lastT < 80) setTarget(m.target - drag.vel * 320);
    const swallow = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };
    window.addEventListener("click", swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
  };

  return {
    ref,
    edges,
    step,
    handlers: {
      onScroll: updateEdges,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onDragStart: (event) => event.preventDefault(),
    },
  };
}
