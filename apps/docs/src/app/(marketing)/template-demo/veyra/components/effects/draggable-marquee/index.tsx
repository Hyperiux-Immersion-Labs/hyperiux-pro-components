// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import gsap from "gsap";
import Draggable from "gsap/Draggable";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";

gsap.registerPlugin(Draggable);

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function createVisibilityGate(root: Element, onChange: (active: boolean) => void) {
  let tabVisible = !document.hidden;
  let onscreen = true;
  let destroyed = false;
  const isActive = () => !destroyed && tabVisible && onscreen;
  let lastActive = isActive();

  const emit = () => {
    if (destroyed) return;
    const next = isActive();
    if (next === lastActive) return;
    lastActive = next;
    onChange(next);
  };

  const onVisibilityChange = () => {
    tabVisible = !document.hidden;
    emit();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) onscreen = entry.isIntersecting;
      emit();
    },
    { rootMargin: "256px" },
  );
  observer.observe(root);

  return {
    get isActive() {
      return isActive();
    },
    destroy() {
      destroyed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
    },
  };
}

type DraggableMarqueeProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey: (item: T) => string;
  speed?: number;
  repeatCount?: number;
  gapClassName?: string;
  className?: string;
  itemClassName?: string;
  pauseOnHover?: boolean;
  throwMultiplier?: number;
  throwFriction?: number;
  maxThrowVelocity?: number;
};

export default function DraggableMarquee<T>({
  items,
  renderItem,
  getKey,
  speed = 0.6,
  repeatCount = 3,
  gapClassName = "gap-6",
  className = "",
  itemClassName = "",
  pauseOnHover = true,
  throwMultiplier = 2.8,
  throwFriction = 0.975,
  maxThrowVelocity = 60,
}: DraggableMarqueeProps<T>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const configRef = useRef({ speed, pauseOnHover, throwMultiplier, throwFriction, maxThrowVelocity });

  useLayoutEffect(() => {
    configRef.current = { speed, pauseOnHover, throwMultiplier, throwFriction, maxThrowVelocity };
  });

  const duplicated = useMemo(() => Array.from({ length: repeatCount }).flatMap(() => items), [items, repeatCount]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || !items.length) return;

    let setWidth = 0;
    let x = 0;
    let throwVelocity = 0;
    let isPointerOver = false;
    let isDragging = false;
    let lastDragX = 0;
    let lastDragTime = 0;
    let wrapValue: (value: number) => number = (value) => value;
    let resizeRaf: number | null = null;
    const reducedMotion = prefersReducedMotion();
    const setX = gsap.quickSetter(track, "x", "px");

    const measure = () => {
      const children = Array.from(track.children).slice(0, items.length);
      if (!children.length) return;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(String(styles.columnGap || styles.gap || 0));
      const prev = setWidth ? (x / -setWidth) % 1 : 0;
      setWidth = children.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0) + gap * children.length;
      wrapValue = gsap.utils.wrap(-setWidth, 0);
      x = wrapValue(-setWidth * prev);
      setX(x);
    };

    const scheduleMeasure = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(measure);
    };

    const update = () => {
      if (!isDragging) {
        const config = configRef.current;
        if (!reducedMotion && !(config.pauseOnHover && isPointerOver)) x -= config.speed;
        x += throwVelocity;
        throwVelocity *= config.throwFriction;
        if (Math.abs(throwVelocity) < 0.01) throwVelocity = 0;
      }
      x = wrapValue(x);
      setX(x);
    };

    measure();

    const drag = Draggable.create(track, {
      type: "x",
      allowContextMenu: true,
      dragClickables: true,
      onPress() {
        isDragging = true;
        throwVelocity = 0;
        this.x = x;
        lastDragX = this.x;
        lastDragTime = performance.now();
      },
      onDrag() {
        const now = performance.now();
        const dx = this.x - lastDragX;
        const dt = now - lastDragTime;
        x = wrapValue(this.x);
        setX(x);
        this.x = x;
        if (dt > 0) {
          const config = configRef.current;
          throwVelocity = reducedMotion
            ? 0
            : gsap.utils.clamp(-config.maxThrowVelocity, config.maxThrowVelocity, (dx / dt) * 36.67 * config.throwMultiplier);
        }
        lastDragX = this.x;
        lastDragTime = now;
      },
      onRelease() {
        isDragging = false;
      },
    })[0];

    const onEnter = () => (isPointerOver = true);
    const onLeave = () => (isPointerOver = false);
    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", scheduleMeasure);
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(track);

    let attached = false;
    const setAttached = (active: boolean) => {
      if (active === attached) return;
      attached = active;
      if (active) gsap.ticker.add(update);
      else gsap.ticker.remove(update);
    };
    const gate = createVisibilityGate(root, setAttached);
    setAttached(gate.isActive);

    return () => {
      gate.destroy();
      gsap.ticker.remove(update);
      window.removeEventListener("resize", scheduleMeasure);
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      observer.disconnect();
      drag.kill();
    };
  }, [items, repeatCount]);

  if (!items.length) return null;

  return (
    <div ref={rootRef} className={`relative w-full cursor-grab overflow-hidden active:cursor-grabbing ${className}`}>
      <div ref={trackRef} className={`flex w-max items-center ${gapClassName}`}>
        {duplicated.map((item, index) => (
          <div
            key={`${getKey(item)}-${index}`}
            aria-hidden={index >= items.length || undefined}
            className={`shrink-0 select-none ${itemClassName}`}
          >
            {renderItem(item, index % items.length)}
          </div>
        ))}
      </div>
    </div>
  );
}
