// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef, useState } from "react";

const BASE_SPEED = 0.35;

const REVEAL_MASK =
  "linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.12) 34%, rgba(0,0,0,1) 34%, rgba(0,0,0,1) 66%, rgba(0,0,0,0.12) 66%, rgba(0,0,0,0.12) 100%)";

type TextStreamProps = {
  items: string[];
  speed?: number;
  runOnScroll?: boolean;
  className?: string;
  itemClassName?: string;
};

export default function TextStream({ items, speed = 1, runOnScroll = true, className = "", itemClassName = "" }: TextStreamProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [copyCount, setCopyCount] = useState(2);
  const metricsRef = useRef({ currentY: 0, distance: 0, currentVelocity: BASE_SPEED, targetVelocity: BASE_SPEED, direction: -1 });

  useLayoutEffect(() => {
    const track = trackRef.current;
    const content = contentRef.current;
    const container = containerRef.current;
    if (!track || !content || !container) return undefined;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const idleSpeed = reduce ? 0 : BASE_SPEED * Math.max(0, speed);
    const m = metricsRef.current;
    m.currentVelocity = -idleSpeed;
    m.targetVelocity = -idleSpeed;
    let timeout = 0;
    let visible = true;

    const ctx = gsap.context(() => {
      let lastScrollY = window.scrollY;

      const measure = () => {
        const distance = content.offsetHeight;
        const height = container.offsetHeight;
        if (!distance || !height) return;
        const next = Math.max(2, Math.ceil(height / distance) + 2);
        setCopyCount((c) => (c === next ? c : next));
        m.distance = distance;
        gsap.set(track, { y: m.currentY });
      };

      const tick = (_: number, deltaTime: number) => {
        if (!m.distance || !visible) return;
        const frame = deltaTime / (1000 / 60);
        m.currentVelocity = gsap.utils.interpolate(m.currentVelocity, m.targetVelocity, 0.12);
        m.currentY += m.currentVelocity * frame;
        if (m.currentY <= -m.distance) m.currentY += m.distance;
        else if (m.currentY > 0) m.currentY -= m.distance;
        gsap.set(track, { y: m.currentY });
      };

      const onScroll = () => {
        const y = window.scrollY;
        const delta = y - lastScrollY;
        lastScrollY = y;
        if (!delta || reduce || !runOnScroll) return;
        const dir = delta > 0 ? -1 : 1;
        m.direction = dir;
        m.targetVelocity = dir * Math.min(9, idleSpeed + Math.pow(Math.abs(delta), 1.1) * 0.06);
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          m.targetVelocity = m.direction * idleSpeed;
        }, 140);
      };

      measure();
      gsap.ticker.add(tick);
      const ro = new ResizeObserver(measure);
      ro.observe(content);
      ro.observe(container);
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(container);
      window.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        ro.disconnect();
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.clearTimeout(timeout);
        gsap.ticker.remove(tick);
      };
    });

    return () => ctx.revert();
  }, [runOnScroll, speed]);

  if (!items.length) return null;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ maskImage: REVEAL_MASK, WebkitMaskImage: REVEAL_MASK }}
    >
      <ul className="sr-only">
        {items.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      <div ref={trackRef} aria-hidden className="absolute inset-x-0 top-0 flex flex-col">
        {Array.from({ length: copyCount }, (_, copyIndex) => (
          <div key={copyIndex} ref={copyIndex === 0 ? contentRef : null} className="flex flex-col">
            {items.map((text, i) => (
              <span key={`${copyIndex}-${i}`} className={`block whitespace-nowrap ${itemClassName}`}>
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
