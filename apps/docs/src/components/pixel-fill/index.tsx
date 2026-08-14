"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type FillDirection = "up" | "right";
type TextAlign = "left" | "center" | "right";

type PixelFillProps = {
  text?: string;
  textColor?: string;
  primaryColor?: string;
  dimColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  textAlign?: TextAlign;
  maxWidth?: number;
  sectionHeight?: number;
  pixelSize?: number;
  stagger?: number;
  bandFraction?: number;
  settleBlend?: number;
  direction?: FillDirection;
  start?: string;
  end?: string;
  id?: string;
  className?: string;
};

type Segment = {
  x: number;
  width: number;
  top: number;
  bottom: number;
  height: number;
};

type PixelFillLayout = {
  width: number;
  height: number;
  dpr: number;
  chars: Segment[];
  crispDim: HTMLCanvasElement;
  crispFill: HTMLCanvasElement;
  crispAccent: HTMLCanvasElement;
  scratch: HTMLCanvasElement;
  mask: HTMLCanvasElement;
};

const DEFAULT_TEXT =
  "Design systems should feel effortless, not like you're fighting your own components every time you build. Every motion detail should guide the eye, carry the story, and make complex interfaces feel calm, deliberate, and alive.";

const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21,
];

function hashNoise(x: number, y: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function cellThreshold(x: number, y: number) {
  const ordered = (BAYER[(y & 7) * 8 + (x & 7)] + 0.5) / 64;
  return ordered * 0.75 + hashNoise(x, y) * 0.25;
}

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function smoothstep01(value: number) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

export default function PixelFill({
  text = DEFAULT_TEXT,
  textColor = "#ffffff",
  primaryColor = "#79da01",
  dimColor = "#272727",
  backgroundColor = "#101113",
  fontSize = 4,
  fontWeight = 500,
  lineHeight = 1.18,
  textAlign = "center",
  maxWidth = 92,
  sectionHeight = 180,
  pixelSize = 3,
  stagger = 12,
  bandFraction = 0.65,
  settleBlend = 0.45,
  direction = "up",
  start = "top 85%",
  end = "bottom 85%",
  id = "pixel-fill",
  className = "",
}: PixelFillProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let frame: number | null = null;
    let disposed = false;
    let scrollTrigger: ScrollTrigger | null = null;
    let progress = 0;
    let layout: PixelFillLayout | null = null;

    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const textElement = textRef.current;

    const makeLayer = (width: number, height: number) => {
      const layer = document.createElement("canvas");
      layer.width = Math.max(1, Math.ceil(width));
      layer.height = Math.max(1, Math.ceil(height));
      return layer;
    };

    const build = () => {
      if (!canvas || !wrapper || !textElement) return;

      const rect = wrapper.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width < 1 || height < 1) {
        layout = null;
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const styles = window.getComputedStyle(textElement);
      const parsedFontSize = Number.parseFloat(styles.fontSize) || 16;
      const parsedLineHeight = Number.parseFloat(styles.lineHeight);
      const computedLineHeight = Number.isFinite(parsedLineHeight)
        ? parsedLineHeight
        : parsedFontSize * lineHeight;
      const font = `${styles.fontStyle} ${styles.fontWeight} ${parsedFontSize}px ${styles.fontFamily}`;
      const letterSpacing = styles.letterSpacing;
      const align = styles.textAlign;
      const hasLetterSpacing = letterSpacing && letterSpacing !== "normal";

      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = font;

      if (hasLetterSpacing && "letterSpacing" in ctx) {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = letterSpacing;
      }

      const lines = wrapLines(ctx, text, width);
      const metrics = ctx.measureText("Hg");
      const ascent = metrics.fontBoundingBoxAscent || parsedFontSize * 0.8;
      const descent = metrics.fontBoundingBoxDescent || parsedFontSize * 0.2;
      const firstBaseline = (computedLineHeight - (ascent + descent)) / 2 + ascent;

      const lineGeometry = lines.map((line, index) => {
        const lineWidth = ctx.measureText(line).width;
        const x =
          align === "right"
            ? width - lineWidth
            : align === "left" || align === "start"
              ? 0
              : (width - lineWidth) / 2;

        return { line, x, baseline: firstBaseline + index * computedLineHeight };
      });

      const chars: Segment[] = [];

      for (const { line, x, baseline } of lineGeometry) {
        let previous = 0;

        for (let index = 0; index < line.length; index += 1) {
          const next = ctx.measureText(line.slice(0, index + 1)).width;
          const character = line[index];

          if (character.trim()) {
            const glyph = ctx.measureText(character);
            const top = baseline - (glyph.actualBoundingBoxAscent || ascent * 0.72) - 1;
            const bottom = baseline + (glyph.actualBoundingBoxDescent || 0) + 1;

            chars.push({
              x: x + previous,
              width: next - previous,
              top,
              bottom,
              height: bottom - top,
            });
          }

          previous = next;
        }
      }

      const paint = (target: HTMLCanvasElement, color: string) => {
        const tctx = target.getContext("2d");
        if (!tctx) return;

        tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        tctx.clearRect(0, 0, width, height);
        tctx.font = font;
        tctx.textBaseline = "alphabetic";
        tctx.fillStyle = color;

        if (hasLetterSpacing && "letterSpacing" in tctx) {
          (tctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = letterSpacing;
        }

        for (const { line, x, baseline } of lineGeometry) {
          tctx.fillText(line, x, baseline);
        }
      };

      const crispDim = makeLayer(width * dpr, height * dpr);
      const crispFill = makeLayer(width * dpr, height * dpr);
      const crispAccent = makeLayer(width * dpr, height * dpr);
      const scratch = makeLayer(width * dpr, height * dpr);
      const mask = makeLayer(width * dpr, height * dpr);

      paint(crispDim, dimColor);
      paint(crispFill, textColor);
      paint(crispAccent, primaryColor);

      layout = {
        width,
        height,
        dpr,
        chars,
        crispDim,
        crispFill,
        crispAccent,
        scratch,
        mask,
      };
    };

    const draw = () => {
      frame = null;
      if (!layout || !canvas) return;

      const { width, height, dpr, chars } = layout;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(layout.crispDim, 0, 0, width, height);

      const total = chars.length;
      if (!total) return;

      const head = progress * (total + stagger);
      const soft = Math.max(0.35, bandFraction);
      const settle = clamp01(settleBlend);
      const horizontal = direction === "right";
      const dissolve = new Path2D();
      let hasDissolve = false;
      let hasFillMask = false;
      const maskCanvas = layout.mask;
      const mctx = maskCanvas.getContext("2d");
      if (!mctx) return;

      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.clearRect(0, 0, width, height);
      mctx.globalCompositeOperation = "source-over";

      for (let index = 0; index < total; index += 1) {
        const local = (head - index) / stagger;
        if (local <= 0) continue;

        const char = chars[index];
        const axisSize = horizontal ? char.width : char.height;
        const invAxis = axisSize > 0 ? 1 / axisSize : 0;
        const right = char.x + char.width;
        const front = Math.min(local, 1 + soft * 0.5);
        const fillDelay = clamp01(0.22 + (1 - settle) * 0.28);
        const fillT = smoothstep01((local - fillDelay) / Math.max(0.28, 1 - fillDelay));
        const fadePx = Math.max(axisSize * 0.42, soft * axisSize * 0.75);

        if (fillT >= 0.999) {
          mctx.fillStyle = "#fff";
          mctx.fillRect(char.x, char.top, char.width, char.height);
          hasFillMask = true;
        } else if (fillT > 0.001) {
          if (horizontal) {
            const crestX = char.x + fillT * (char.width + fadePx * 0.95);
            const grad = mctx.createLinearGradient(crestX - fadePx, 0, crestX + fadePx * 0.2, 0);

            grad.addColorStop(0, "rgba(255,255,255,1)");
            grad.addColorStop(0.65, "rgba(255,255,255,0.4)");
            grad.addColorStop(1, "rgba(255,255,255,0)");

            mctx.fillStyle = grad;
            mctx.fillRect(char.x, char.top, char.width, char.height);
          } else {
            const crestY = char.bottom - fillT * (char.height + fadePx * 0.95);
            const gradTop = crestY - fadePx * 0.2;
            const grad = mctx.createLinearGradient(0, gradTop, 0, crestY + fadePx);

            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(0.35, "rgba(255,255,255,0.4)");
            grad.addColorStop(1, "rgba(255,255,255,1)");

            mctx.fillStyle = grad;
            mctx.fillRect(char.x, Math.max(char.top, gradTop), char.width, char.bottom - Math.max(char.top, gradTop));
          }

          hasFillMask = true;
        }

        const firstRow = Math.floor(char.top / pixelSize);
        const lastRow = Math.ceil(char.bottom / pixelSize);
        const firstCol = Math.floor(char.x / pixelSize);
        const lastCol = Math.ceil(right / pixelSize);

        for (let row = firstRow; row < lastRow; row += 1) {
          const y = row * pixelSize;
          const cy = y + pixelSize * 0.5;
          const top = Math.max(y, char.top);
          const cellHeight = Math.min(y + pixelSize, char.bottom) - top;

          if (cellHeight <= 0) continue;

          for (let col = firstCol; col < lastCol; col += 1) {
            const x = Math.max(col * pixelSize, char.x);
            const cellWidth = Math.min((col + 1) * pixelSize, right) - x;

            if (cellWidth <= 0) continue;

            const cx = x + cellWidth * 0.5;
            const fromStart = horizontal ? (cx - char.x) * invAxis : (char.bottom - cy) * invAxis;
            const coverage = clamp01((front + soft * 0.5 - fromStart) / soft);

            if (coverage <= 0.001) continue;
            if (coverage <= cellThreshold(col, row)) continue;

            dissolve.rect(x, top, cellWidth, cellHeight);
            hasDissolve = true;
          }
        }
      }

      const stampMasked = (source: HTMLCanvasElement, maskSource: HTMLCanvasElement) => {
        const sctx = layout?.scratch.getContext("2d");
        if (!layout || !sctx) return;

        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        sctx.globalCompositeOperation = "source-over";
        sctx.clearRect(0, 0, width, height);
        sctx.drawImage(source, 0, 0, width, height);
        sctx.globalCompositeOperation = "destination-in";
        sctx.drawImage(maskSource, 0, 0, width, height);
        sctx.globalCompositeOperation = "source-over";
        ctx.drawImage(layout.scratch, 0, 0, width, height);
      };

      const stampPath = (source: HTMLCanvasElement, path: Path2D) => {
        const sctx = layout?.scratch.getContext("2d");
        if (!layout || !sctx) return;

        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        sctx.globalCompositeOperation = "source-over";
        sctx.clearRect(0, 0, width, height);
        sctx.drawImage(source, 0, 0, width, height);
        sctx.globalCompositeOperation = "destination-in";
        sctx.fill(path);
        sctx.globalCompositeOperation = "source-over";
        ctx.drawImage(layout.scratch, 0, 0, width, height);
      };

      if (hasDissolve) stampPath(layout.crispAccent, dissolve);
      if (hasFillMask) stampMasked(layout.crispFill, maskCanvas);
    };

    const schedule = () => {
      if (frame !== null || disposed) return;
      frame = requestAnimationFrame(draw);
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const init = () => {
      if (disposed) return;

      build();

      if (prefersReducedMotion) {
        progress = 1;
        draw();
        return;
      }

      scrollTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start,
        end,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress = self.progress;
          schedule();
        },
        onRefresh: (self) => {
          progress = self.progress;
          schedule();
        },
      });

      schedule();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(init);
    } else {
      init();
    }

    const observer = new ResizeObserver(() => {
      build();
      schedule();
      ScrollTrigger.refresh();
    });

    if (wrapper) observer.observe(wrapper);

    return () => {
      disposed = true;
      observer.disconnect();
      scrollTrigger?.kill();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [
    bandFraction,
    dimColor,
    direction,
    end,
    lineHeight,
    pixelSize,
    primaryColor,
    settleBlend,
    stagger,
    start,
    text,
    textColor,
  ]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`relative flex w-full items-center overflow-hidden px-5 py-24 ${className}`}
      style={{
        backgroundColor,
        minHeight: `${sectionHeight}vh`,
      }}
    >
      <div
        ref={wrapperRef}
        className="relative z-10 mx-auto"
        style={{
          maxWidth: `${maxWidth}vw`,
          width: "100%",
        }}
      >
        <p
          ref={textRef}
          className="m-0 text-transparent"
          style={{
            fontSize: `clamp(2.5rem, ${fontSize}vw, 8rem)`,
            fontWeight,
            lineHeight,
            textAlign,
          }}
        >
          {text}
        </p>

        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      </div>
    </section>
  );
}
