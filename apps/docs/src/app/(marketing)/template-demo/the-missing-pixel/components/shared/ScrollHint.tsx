// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState } from "react";

type ScrollHintProps = {
  className?: string;
};

// A slim progress track for a sideways-scrolling row, so it's clear there is more to
// swipe to. It follows the element right before it (no ref to wire up, so it works
// next to server components): the thumb is as wide as the share of the row in view
// and moves with the scroll. It hides itself while the row doesn't overflow.
const ScrollHint = ({ className = "" }: ScrollHintProps) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const row = trackRef.current?.previousElementSibling as HTMLElement | null;
    const thumb = thumbRef.current;
    if (!row || !thumb) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const { scrollLeft, scrollWidth, clientWidth } = row;
      const range = scrollWidth - clientWidth;
      setOverflows(range > 1);
      if (range <= 1) return;
      const share = clientWidth / scrollWidth;
      thumb.style.width = `${share * 100}%`;
      thumb.style.transform = `translateX(${(scrollLeft / range) * (1 / share - 1) * 100}%)`;
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    row.addEventListener("scroll", queue, { passive: true });
    const observer = new ResizeObserver(queue);
    observer.observe(row);
    return () => {
      cancelAnimationFrame(frame);
      row.removeEventListener("scroll", queue);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={trackRef}
      aria-hidden
      className={`h-0.5 overflow-hidden rounded-full bg-(--mpx-ink)/10 ${overflows ? "" : "hidden"} ${className}`.trim()}
    >
      <span ref={thumbRef} className="block h-full rounded-full bg-(--mpx-ink)" />
    </div>
  );
};

export default ScrollHint;
