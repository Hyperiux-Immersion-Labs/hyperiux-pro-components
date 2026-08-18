'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** Bayer 8x8 ordered-dither matrix — drives the orange pixel edge only. */
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21,
];

function hashNoise(x, y) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/**
 * Stable per-cell threshold for the orange dissolve edge.
 * Deterministic + evenly spread so the pixel front thins as a density ramp
 * instead of blotching or boiling frame-to-frame.
 */
function cellThreshold(x, y) {
  const ordered = (BAYER[(y & 7) * 8 + (x & 7)] + 0.5) / 64;

  return ordered * 0.75 + hashNoise(x, y) * 0.25;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep01(t) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

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

/**
 * Scroll-driven text fill: each character floods along an axis.
 *
 * Soft ordered-dither density (Bayer dissolve): solid behind the crest,
 * thinning scatter into dim ahead of it. `primaryColor` is the dithered fill;
 * `textColor` settles in smoothly behind. `direction` picks the axis —
 * `"up"` (bottom→top) or `"right"` (left→right, reading order still line by line).
 */
export default function TextFillPixelV3({
  text = "Design systems should feel effortless, not like you're fighting your own components every time you build.",
  textColor = '#ffffff',
  primaryColor = '#ff5f00',
  dimColor = '#272727',
  className = 't64',
  wrapperClassName = 'w-[95%] sm:w-[88%] md:w-[90%]',
  containerClassName = '',
  id = 'text-fill-pixel-v3',
  start = '15% 75%',
  end = '85% 45%',
  pixelSize = 3,
  stagger = 12,
  /** Soft dither ramp as a fraction of the glyph along `direction`. */
  bandFraction = 0.65,
  /** How early textColor eases in behind the dither (0–1). */
  settleBlend = 0.45,
  /** Fill axis: `"up"` = bottom→top, `"right"` = left→right. */
  direction = 'up',
  as: Tag = 'p',
}) {
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);
  const textRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let frame = null;
    let disposed = false;
    let scrollTrigger = null;
    let progress = 0;
    let layout = null;

    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const textElement = textRef.current;

    const makeLayer = (width, height) => {
      const layer = document.createElement('canvas');

      layer.width = Math.max(1, Math.ceil(width));
      layer.height = Math.max(1, Math.ceil(height));

      return layer;
    };

    /** Rebuilds the wrap, the per-character boxes and the tinted layers. */
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
      const fontSize = parseFloat(styles.fontSize) || 16;
      const parsedLineHeight = parseFloat(styles.lineHeight);
      const lineHeight = Number.isFinite(parsedLineHeight)
        ? parsedLineHeight
        : fontSize * 1.18;
      const font = `${styles.fontStyle} ${styles.fontWeight} ${fontSize}px ${styles.fontFamily}`;
      const letterSpacing = styles.letterSpacing;
      const align = styles.textAlign;
      const hasLetterSpacing = letterSpacing && letterSpacing !== 'normal';

      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = font;

      if (hasLetterSpacing && 'letterSpacing' in ctx) {
        ctx.letterSpacing = letterSpacing;
      }

      const lines = wrapLines(ctx, text, width);
      const metrics = ctx.measureText('Hg');
      const ascent = metrics.fontBoundingBoxAscent || fontSize * 0.8;
      const descent = metrics.fontBoundingBoxDescent || fontSize * 0.2;
      const firstBaseline = (lineHeight - (ascent + descent)) / 2 + ascent;

      const lineGeometry = lines.map((line, index) => {
        const lineWidth = ctx.measureText(line).width;
        const x =
          align === 'right'
            ? width - lineWidth
            : align === 'left' || align === 'start'
              ? 0
              : (width - lineWidth) / 2;

        return { line, x, baseline: firstBaseline + index * lineHeight };
      });

      // Per-character boxes, measured once. Advances come from cumulative
      // prefix widths rather than per-glyph widths so kerning between the pair
      // is accounted for and the boxes stay flush with what fillText draws.
      const chars = [];

      for (const { line, x, baseline } of lineGeometry) {
        let previous = 0;

        for (let i = 0; i < line.length; i++) {
          const next = ctx.measureText(line.slice(0, i + 1)).width;
          const character = line[i];

          if (character.trim()) {
            const glyph = ctx.measureText(character);
            // Tight ink extents, not the font box: a lowercase letter should
            // finish filling at its own x-height instead of stalling through
            // the empty space an ascender would have occupied.
            const top =
              baseline - (glyph.actualBoundingBoxAscent || ascent * 0.72) - 1;
            const bottom =
              baseline + (glyph.actualBoundingBoxDescent || 0) + 1;

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

      const paint = (target, color) => {
        const tctx = target.getContext('2d');

        tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        tctx.clearRect(0, 0, width, height);
        tctx.font = font;
        tctx.textBaseline = 'alphabetic';
        tctx.fillStyle = color;

        if (hasLetterSpacing && 'letterSpacing' in tctx) {
          tctx.letterSpacing = letterSpacing;
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
      const ctx = canvas.getContext('2d');

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(layout.crispDim, 0, 0, width, height);

      const total = chars.length;

      if (!total) return;

      // Head runs past the last index by one stagger window so the final
      // character still gets a full fill instead of snapping at progress 1.
      const head = progress * (total + stagger);
      // Soft band must span enough cell rows/cols or the dither collapses to a line.
      const soft = Math.max(0.35, bandFraction);
      const settle = clamp01(settleBlend);
      const horizontal = direction === 'right';

      const dissolve = new Path2D();
      let hasDissolve = false;
      let hasWhite = false;

      const maskCanvas = layout.mask;
      const mctx = maskCanvas.getContext('2d');

      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.clearRect(0, 0, width, height);
      mctx.globalCompositeOperation = 'source-over';

      for (let i = 0; i < total; i++) {
        const local = (head - i) / stagger;

        if (local <= 0) continue;

        const char = chars[i];
        const axisSize = horizontal ? char.width : char.height;
        const invAxis = axisSize > 0 ? 1 / axisSize : 0;
        const right = char.x + char.width;

        // Primary crest (can run past 1 so the soft edge clears the far side).
        const front = Math.min(local, 1 + soft * 0.5);

        // White lags the dither, eases in smoothly, then clears past the glyph
        // so the letter finishes fully textColor.
        const whiteDelay = clamp01(0.22 + (1 - settle) * 0.28);
        const whiteT = smoothstep01(
          (local - whiteDelay) / Math.max(0.28, 1 - whiteDelay)
        );
        const fadePx = Math.max(axisSize * 0.42, soft * axisSize * 0.75);

        if (whiteT >= 0.999) {
          mctx.fillStyle = '#fff';
          mctx.fillRect(char.x, char.top, char.width, char.height);
          hasWhite = true;
        } else if (whiteT > 0.001) {
          if (horizontal) {
            // Crest travels left → right; fade clears past the right edge.
            const crestX =
              char.x + whiteT * (char.width + fadePx * 0.95);
            const gradLeft = crestX - fadePx;
            const gradRight = crestX + fadePx * 0.2;
            const grad = mctx.createLinearGradient(gradLeft, 0, gradRight, 0);

            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(0.65, 'rgba(255,255,255,0.4)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');

            mctx.fillStyle = grad;
            mctx.fillRect(char.x, char.top, char.width, char.height);
          } else {
            const crestY =
              char.bottom - whiteT * (char.height + fadePx * 0.95);
            const gradTop = crestY - fadePx * 0.2;
            const gradBottom = crestY + fadePx;
            const grad = mctx.createLinearGradient(0, gradTop, 0, gradBottom);

            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.35, 'rgba(255,255,255,0.4)');
            grad.addColorStop(1, 'rgba(255,255,255,1)');

            mctx.fillStyle = grad;
            mctx.fillRect(
              char.x,
              Math.max(char.top, gradTop),
              char.width,
              char.bottom - Math.max(char.top, gradTop)
            );
          }
          hasWhite = true;
        }

        const firstRow = Math.floor(char.top / pixelSize);
        const lastRow = Math.ceil(char.bottom / pixelSize);
        const firstCol = Math.floor(char.x / pixelSize);
        const lastCol = Math.ceil(right / pixelSize);

        for (let row = firstRow; row < lastRow; row++) {
          const y = row * pixelSize;
          const cy = y + pixelSize * 0.5;
          const top = Math.max(y, char.top);
          const cellHeight = Math.min(y + pixelSize, char.bottom) - top;

          if (cellHeight <= 0) continue;

          for (let col = firstCol; col < lastCol; col++) {
            const x = Math.max(col * pixelSize, char.x);
            const cellWidth = Math.min((col + 1) * pixelSize, right) - x;

            if (cellWidth <= 0) continue;

            const cx = x + cellWidth * 0.5;
            // 0 at the start of the fill axis, 1 at the far side.
            const fromStart = horizontal
              ? (cx - char.x) * invAxis
              : (char.bottom - cy) * invAxis;
            const coverage = clamp01((front + soft * 0.5 - fromStart) / soft);

            if (coverage <= 0.001) continue;
            if (coverage <= cellThreshold(col, row)) continue;

            dissolve.rect(x, top, cellWidth, cellHeight);
            hasDissolve = true;
          }
        }
      }

      const stampMasked = (source, maskSource) => {
        const sctx = layout.scratch.getContext('2d');

        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        sctx.globalCompositeOperation = 'source-over';
        sctx.clearRect(0, 0, width, height);
        sctx.drawImage(source, 0, 0, width, height);
        sctx.globalCompositeOperation = 'destination-in';
        sctx.drawImage(maskSource, 0, 0, width, height);
        sctx.globalCompositeOperation = 'source-over';

        ctx.drawImage(layout.scratch, 0, 0, width, height);
      };

      const stampPath = (source, path) => {
        const sctx = layout.scratch.getContext('2d');

        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        sctx.globalCompositeOperation = 'source-over';
        sctx.clearRect(0, 0, width, height);
        sctx.drawImage(source, 0, 0, width, height);
        sctx.globalCompositeOperation = 'destination-in';
        sctx.fill(path);
        sctx.globalCompositeOperation = 'source-over';

        ctx.drawImage(layout.scratch, 0, 0, width, height);
      };

      // Soft primary dither first; white eases over it with a long feather.
      if (hasDissolve) stampPath(layout.crispAccent, dissolve);
      if (hasWhite) stampMasked(layout.crispFill, maskCanvas);
    };

    const schedule = () => {
      if (frame !== null || disposed) return;
      frame = requestAnimationFrame(draw);
    };

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

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
    };

    // Measuring before the webfont resolves would wrap against the fallback
    // metrics and bake the wrong line breaks into every layer.
    if (document.fonts?.ready) {
      document.fonts.ready.then(init);
    } else {
      init();
    }

    const observer = new ResizeObserver(() => {
      build();
      schedule();
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
    className,
    dimColor,
    direction,
    end,
    pixelSize,
    primaryColor,
    settleBlend,
    stagger,
    start,
    text,
    textColor,
    wrapperClassName,
  ]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`relative w-full overflow-x-hidden ${containerClassName}`}
    >
      <div
        ref={wrapperRef}
        className={`relative z-10 mx-auto text-center ${wrapperClassName}`}
      >
        <Tag ref={textRef} className={`text-transparent ${className}`}>
          {text}
        </Tag>

        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      </div>
    </section>
  );
}
