// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, type RefObject } from "react";
import { prefersReducedMotion } from "../Animations/reducedMotion";

type WordmarkPixelsProps = {
  innerRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<number>;
};

type Cell = {
  x: number;
  y: number;
  coverage: number;
  column: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
};

type Ring = {
  x: number;
  y: number;
  time: number;
};

const BASE = [245, 245, 245];
const WARM = [255, 95, 0];
const SPRING = 0.07;
const DAMPING = 0.84;
const PUSH = 1.6;
const RING_SPEED = 520;
const RING_WIDTH = 70;
const RING_FORCE = 2.4;
const MAX_RINGS = 3;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const WordmarkPixels = ({ innerRef, progressRef }: WordmarkPixelsProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const inner = innerRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !inner || !host || !context) return;

    const reduce = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const start = performance.now();
    let cells: Cell[] = [];
    let width = 0;
    let height = 0;
    let cell = 8;
    let radius = 120;
    let running = false;
    let frameId = 0;
    let buildTimer = 0;
    let rings: Ring[] = [];
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      width = inner.clientWidth;
      height = inner.clientHeight;
      if (!width || !height) return;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const style = getComputedStyle(inner);
      const fontSize = parseFloat(style.fontSize);
      cell = Math.max(4, Math.round(fontSize / 34));
      radius = fontSize * 0.7;

      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const mask = offscreen.getContext("2d", { willReadFrequently: true });
      if (!mask) return;

      mask.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      mask.fillStyle = "#ffffff";
      mask.textBaseline = "alphabetic";

      const letters = Array.from(inner.children) as HTMLElement[];
      const sample = letters.find((letter) => letter.textContent?.trim());
      if (!sample) return;
      const probe = document.createElement("i");
      probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      sample.append(probe);
      const baselineOffset = probe.getBoundingClientRect().bottom - sample.getBoundingClientRect().top;
      probe.remove();
      const box = inner.getBoundingClientRect();

      letters.forEach((letter) => {
        const text = letter.textContent?.trim();
        if (!text) return;
        const rect = letter.getBoundingClientRect();
        const shift = new DOMMatrix(getComputedStyle(letter).transform);
        mask.fillText(text, rect.left - shift.m41 - box.left, rect.top - shift.m42 - box.top + baselineOffset);
      });

      const data = mask.getImageData(0, 0, width, height).data;
      const alphaAt = (px: number, py: number) =>
        data[(Math.min(height - 1, Math.floor(py)) * width + Math.min(width - 1, Math.floor(px))) * 4 + 3] / 255;

      const next: Cell[] = [];
      const quarter = cell / 4;
      for (let y = 0; y + cell <= height; y += cell) {
        for (let x = 0; x + cell <= width; x += cell) {
          const coverage =
            (alphaAt(x + quarter, y + quarter) +
              alphaAt(x + cell - quarter, y + quarter) +
              alphaAt(x + quarter, y + cell - quarter) +
              alphaAt(x + cell - quarter, y + cell - quarter)) /
            4;
          if (coverage > 0.1) {
            next.push({ x: x + cell / 2, y: y + cell / 2, coverage, column: x / width, ox: 0, oy: 0, vx: 0, vy: 0 });
          }
        }
      }
      cells = next;
    };

    const frame = () => {
      if (!running) return;
      const now = (performance.now() - start) / 1000;
      const progress = reduce ? 1 : clamp((progressRef.current - 0.5) / 0.5);

      rings = rings.filter((ring) => now - ring.time < 2.4);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      context.fillStyle = `rgb(${BASE[0]}, ${BASE[1]}, ${BASE[2]})`;
      context.beginPath();
      const warmCells: { cell: Cell; size: number; warm: number }[] = [];

      for (const item of cells) {
        if (!reduce) {
          const dx = item.x + item.ox - mouse.x;
          const dy = item.y + item.oy - mouse.y;
          const distance = Math.hypot(dx, dy);
          if (distance < radius && distance > 0.01) {
            const push = (1 - distance / radius) ** 2 * PUSH;
            item.vx += (dx / distance) * push;
            item.vy += (dy / distance) * push;
          }

          for (const ring of rings) {
            const rx = item.x - ring.x;
            const ry = item.y - ring.y;
            const ringDistance = Math.hypot(rx, ry);
            const offset = (ringDistance - (now - ring.time) * RING_SPEED) / RING_WIDTH;
            const force = Math.exp(-offset * offset) * Math.exp(-(now - ring.time) * 1.4) * RING_FORCE;
            if (force > 0.01 && ringDistance > 0.01) {
              item.vx += (rx / ringDistance) * force;
              item.vy += (ry / ringDistance) * force;
            }
          }

          item.vx = (item.vx - item.ox * SPRING) * DAMPING;
          item.vy = (item.vy - item.oy * SPRING) * DAMPING;
          item.ox += item.vx;
          item.oy += item.vy;
        }

        const reveal = clamp(progress * 1.4 - item.column * 0.4);
        if (reveal <= 0) continue;

        const warm = clamp(Math.hypot(item.ox, item.oy) / (cell * 2.5));
        const size = cell * (0.3 + 0.62 * item.coverage) * reveal * (1 + warm * 0.25);
        if (warm > 0.04) {
          warmCells.push({ cell: item, size, warm });
          continue;
        }
        const lift = (1 - reveal) * cell * 6;
        context.rect(item.x + item.ox - size / 2, item.y + item.oy - size / 2 + lift, size, size);
      }
      context.fill();

      for (const { cell: item, size, warm } of warmCells) {
        const red = BASE[0] + (WARM[0] - BASE[0]) * warm;
        const green = BASE[1] + (WARM[1] - BASE[1]) * warm;
        const blue = BASE[2] + (WARM[2] - BASE[2]) * warm;
        context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        context.fillRect(item.x + item.ox - size / 2, item.y + item.oy - size / 2, size, size);
      }

      frameId = requestAnimationFrame(frame);
    };

    const local = (event: PointerEvent) => {
      const rect = inner.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const handleMove = (event: PointerEvent) => {
      const point = local(event);
      mouse.x = point.x;
      mouse.y = point.y;
    };

    const handleLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleDown = (event: PointerEvent) => {
      const point = local(event);
      rings = [...rings.slice(-(MAX_RINGS - 1)), { x: point.x, y: point.y, time: (performance.now() - start) / 1000 }];
    };

    const rebuild = () => {
      window.clearTimeout(buildTimer);
      buildTimer = window.setTimeout(build, 150);
    };

    build();
    document.fonts?.ready.then(build);
    const resizeObserver = new ResizeObserver(rebuild);
    resizeObserver.observe(inner);

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        frameId = requestAnimationFrame(frame);
      } else if (!entry.isIntersecting) {
        running = false;
        cancelAnimationFrame(frameId);
      }
    });
    visibility.observe(host);

    if (!reduce) {
      host.addEventListener("pointermove", handleMove);
      host.addEventListener("pointerleave", handleLeave);
      host.addEventListener("pointerdown", handleDown);
    }

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.clearTimeout(buildTimer);
      resizeObserver.disconnect();
      visibility.disconnect();
      host.removeEventListener("pointermove", handleMove);
      host.removeEventListener("pointerleave", handleLeave);
      host.removeEventListener("pointerdown", handleDown);
    };
  }, [innerRef, progressRef]);

  return <canvas ref={canvasRef} aria-hidden className="absolute left-0 top-0 h-full w-full" />;
};

export default WordmarkPixels;
