// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef } from "react";

type RafRoot = Element | null;

function createSuspendedRaf({ onFrame, root }: { onFrame: (time: number) => void; root: RafRoot }) {
  let rafId: number | null = null;
  let running = false;
  let destroyed = false;
  let tabVisible = !document.hidden;
  let onscreen = true;

  const active = () => !destroyed && running && tabVisible && onscreen;

  const tick = (time: number) => {
    rafId = null;
    if (!active()) return;
    onFrame(time);
    if (active()) rafId = requestAnimationFrame(tick);
  };

  const sync = () => {
    if (active()) {
      if (rafId == null) rafId = requestAnimationFrame(tick);
    } else if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const onVisibility = () => {
    tabVisible = !document.hidden;
    sync();
  };
  document.addEventListener("visibilitychange", onVisibility);

  const observer = root
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) onscreen = entry.isIntersecting;
          sync();
        },
        { rootMargin: "128px" },
      )
    : null;
  if (root) observer?.observe(root);

  return {
    start() {
      running = true;
      sync();
    },
    stop() {
      running = false;
      sync();
    },
    destroy() {
      destroyed = true;
      running = false;
      if (rafId != null) cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    },
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (e0: number, e1: number, v: number) => {
  const t = clamp01((v - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

type Dot = { x: number; y: number; mouse: number; trail: number };

type DottedGridProps = {
  spacing?: number;
  baseRadius?: number;
  mouseRadius?: number;
  trailLength?: number;
  trailRadius?: number;
  trailFadeMs?: number;
  dotColor?: [number, number, number];
  glowColor?: [number, number, number];
  className?: string;
};

export default function DottedGrid({
  spacing = 30,
  baseRadius = 1.1,
  mouseRadius = 160,
  trailLength = 24,
  trailRadius = 120,
  trailFadeMs = 1100,
  dotColor = [21, 25, 39],
  glowColor = [32, 43, 74],
  className = "",
}: DottedGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const interactive = finePointer && !reduce;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false, trail: [] as { x: number; y: number; t: number }[] };

    const createDots = () => {
      dots = [];
      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          dots.push({ x, y, mouse: 0, trail: 0 });
        }
      }
    };

    const drawBase = (skip?: Set<Dot>) => {
      const [r, g, b] = dotColor;
      ctx.fillStyle = `rgba(${r},${g},${b},0.12)`;
      ctx.beginPath();
      for (const dot of dots) {
        if (skip?.has(dot)) continue;
        ctx.moveTo(dot.x + baseRadius, dot.y);
        ctx.arc(dot.x, dot.y, baseRadius, 0, Math.PI * 2);
      }
      ctx.fill();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      drawBase();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createDots();
      drawStatic();
    };

    resize();
    window.addEventListener("resize", resize);
    if (!interactive) return () => window.removeEventListener("resize", resize);

    let lastMove = 0;
    const glowing = new Set<Dot>();
    const reach = Math.max(mouseRadius, trailRadius);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= -reach && y >= -reach && x <= rect.width + reach && y <= rect.height + reach;
      mouse.active = inside;
      if (!inside) return;
      if (!lastMove) {
        mouse.x = x;
        mouse.y = y;
      }
      mouse.tx = x;
      mouse.ty = y;
      lastMove = performance.now();
      mouse.trail.push({ x, y, t: lastMove });
      if (mouse.trail.length > trailLength) mouse.trail.shift();
      loop.start();
    };

    const loop = createSuspendedRaf({
      root: canvas,
      onFrame: () => {
        const now = performance.now();
        mouse.x = lerp(mouse.x, mouse.tx, 0.14);
        mouse.y = lerp(mouse.y, mouse.ty, 0.14);
        mouse.trail = mouse.trail.filter((pt) => now - pt.t < trailFadeMs);

        let minX = mouse.active ? mouse.x : Infinity;
        let maxX = mouse.active ? mouse.x : -Infinity;
        let minY = mouse.active ? mouse.y : Infinity;
        let maxY = mouse.active ? mouse.y : -Infinity;
        for (const pt of mouse.trail) {
          minX = Math.min(minX, pt.x);
          maxX = Math.max(maxX, pt.x);
          minY = Math.min(minY, pt.y);
          maxY = Math.max(maxY, pt.y);
        }

        for (const dot of dots) {
          const near = dot.x > minX - reach && dot.x < maxX + reach && dot.y > minY - reach && dot.y < maxY + reach;
          if (!near && !glowing.has(dot)) continue;
          let targetMouse = 0;
          if (mouse.active) {
            const d = Math.hypot(dot.x - mouse.x, dot.y - mouse.y);
            if (d < mouseRadius) targetMouse = (1 - d / mouseRadius) ** 3;
          }
          dot.mouse = lerp(dot.mouse, targetMouse, 0.12);
          let targetTrail = 0;
          if (near) {
            for (let i = 0; i < mouse.trail.length; i++) {
              const pt = mouse.trail[i];
              const d = Math.hypot(dot.x - pt.x, dot.y - pt.y);
              if (d >= trailRadius) continue;
              const fade = (1 - (now - pt.t) / trailFadeMs) ** 3 * ((i + 1) / mouse.trail.length);
              targetTrail = Math.max(targetTrail, (1 - smoothstep(0, 1, d / trailRadius)) ** 3 * fade);
            }
          }
          dot.trail = lerp(dot.trail, targetTrail, 0.08);
          if (Math.max(dot.mouse, dot.trail) > 0.01) glowing.add(dot);
          else {
            dot.mouse = 0;
            dot.trail = 0;
            glowing.delete(dot);
          }
        }

        ctx.clearRect(0, 0, width, height);
        drawBase(glowing);
        const [r, g, b] = glowColor;
        for (const dot of glowing) {
          const glow = Math.max(dot.mouse, dot.trail);
          ctx.fillStyle = `rgba(${r},${g},${b},${clamp01(0.12 + glow * 0.55)})`;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, baseRadius * (1 + glow * 1.1), 0, Math.PI * 2);
          ctx.fill();
        }

        if (!glowing.size && !mouse.trail.length && now - lastMove > 200) loop.stop();
      },
    });

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      loop.destroy();
    };
  }, [baseRadius, dotColor, glowColor, mouseRadius, spacing, trailFadeMs, trailLength, trailRadius]);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none block h-full w-full ${className}`} />;
}
