import { CHAR_SETS } from "./char-sets";

/**
 * Full-screen dithered-text loader field.
 *
 * The wordmark SVG (/hyperiux-wordmark.svg) is loaded and rasterised into a
 * coverage buffer. Each letter's x-range is known from the SVG geometry, so
 * every cell knows which character it belongs to. During exit, each character
 * dissolves independently — the `exits` array (one float per letter, 0→1)
 * drives the per-character reverse-dither.
 *
 * Two layers share one grid:
 *   static  — churning random glyphs, thinned by a hash as progress rises.
 *   reveal  — the wordmark shape, dithered in by the Bayer threshold.
 *
 * Deliberately 2D canvas, not WebGL: the hero's ASCII effect is compiling its
 * shaders and decoding its video while this is on screen.
 */

const CHAR_COUNT = 8; // H-Y-P-E-R-I-U-X
const GLYPHS = CHAR_SETS.hyperiux.filter((c) => c !== " ");

// ── Colours ──────────────────────────────────────────────────────────────────
const STATIC_COLOR = "#1a1a1a";
const REVEAL_COLOR = "#ff5f00";
const FLASH_COLOR = "#ffffff";
const COUNTER_COLOR = "#333333";

// ── Timing / density ────────────────────────────────────────────────────────
const CHURN_MS = 80;
const FRAME_MS = 1000 / 30;
const STATIC_DENSITY = 0.18;
const FLASH_BAND = 0.07;
const SWEEP = 0.35;

// ── SVG wordmark source ─────────────────────────────────────────────────────
const WORDMARK_SRC = "/hyperiux-wordmark.svg";
const SVG_WIDTH = 351;
const SVG_HEIGHT = 43;
const SVG_RATIO = SVG_HEIGHT / SVG_WIDTH;

// ── Layout ──────────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;
const WORD_WIDTH_FACTOR = 0.82;
const WORD_MAX_WIDTH = 1600;

/**
 * Per-character x-ranges within the 351-wide SVG viewBox.
 * Derived from the path coordinates in hyperiux-wordmark.svg.
 */
const CHAR_RANGES = [
  { start: 0, end: 42.14 },       // H
  { start: 48.76, end: 90.9 },    // Y
  { start: 97.52, end: 139.66 },  // P
  { start: 146.28, end: 188.42 }, // E
  { start: 195.04, end: 237.18 }, // R
  { start: 244.41, end: 251.03 }, // I
  { start: 258.25, end: 300.39 }, // U
  { start: 306.86, end: 350.06 }, // X
];

// 8×8 Bayer ordered-dither matrix
const BAYER_8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21,
];

const KIND_EMPTY = 0;
const KIND_STATIC = 1;
const KIND_REVEAL = 2;
const KIND_FLASH = 3;

function hash(x, y, t) {
  const v = Math.sin(x * 127.1 + y * 311.7 + t * 74.7) * 43758.5453;
  return v - Math.floor(v);
}

function monoFamily() {
  const variable = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-geist-mono")
    .trim();
  return variable
    ? `${variable}, ui-monospace, monospace`
    : "ui-monospace, monospace";
}

/**
 * Given an SVG-space x coordinate, return which character index (0–7) it
 * belongs to, or -1 if it falls in a gap between letters.
 */
function charIndexFromSvgX(svgX) {
  for (let i = 0; i < CHAR_RANGES.length; i++) {
    if (svgX >= CHAR_RANGES[i].start && svgX <= CHAR_RANGES[i].end) return i;
  }
  return -1;
}

/**
 * Rasterise the wordmark into a coverage buffer at grid resolution, and tag
 * each cell with its character index.
 */
function buildCoverage(cols, rows, cellW, cellH, viewW, viewH, image) {
  const total = cols * rows;
  const coverage = new Float32Array(total);
  const charIdx = new Int8Array(total).fill(-1);

  if (!cols || !rows) return { coverage, charIdx };

  // Compute the wordmark's pixel-space position (centered in the viewport)
  const targetW = Math.min(viewW * WORD_WIDTH_FACTOR, WORD_MAX_WIDTH);
  const targetH = targetW * SVG_RATIO;
  const offsetX = (viewW - targetW) / 2;
  const offsetY = (viewH - targetH) / 2;

  // Draw the SVG into a temporary canvas at grid resolution
  const source = document.createElement("canvas");
  const srcW = Math.max(1, Math.round(targetW));
  const srcH = Math.max(1, Math.round(targetH));
  source.width = srcW;
  source.height = srcH;

  const sctx = source.getContext("2d", { willReadFrequently: true });

  if (image) {
    sctx.drawImage(image, 0, 0, srcW, srcH);
  } else {
    // Fallback: draw "HYPERIUX" as text if the SVG hasn't loaded yet
    sctx.fillStyle = "#ffffff";
    sctx.textAlign = "center";
    sctx.textBaseline = "middle";
    sctx.font = `700 ${srcH * 0.9}px ui-monospace, monospace`;
    sctx.fillText("HYPERIUX", srcW / 2, srcH / 2);
  }

  const { data } = sctx.getImageData(0, 0, srcW, srcH);

  // Sample into the grid
  const colStart = Math.max(0, Math.floor(offsetX / cellW));
  const colEnd = Math.min(cols - 1, Math.ceil((offsetX + targetW) / cellW));
  const rowStart = Math.max(0, Math.floor(offsetY / cellH));
  const rowEnd = Math.min(rows - 1, Math.ceil((offsetY + targetH) / cellH));

  for (let row = rowStart; row <= rowEnd; row++) {
    // Map grid cell centre to source pixel coordinates
    const srcPxY = ((row * cellH + cellH / 2 - offsetY) / targetH) * srcH;
    const sy = Math.floor(srcPxY);
    if (sy < 0 || sy >= srcH) continue;

    for (let col = colStart; col <= colEnd; col++) {
      const srcPxX = ((col * cellW + cellW / 2 - offsetX) / targetW) * srcW;
      const sx = Math.floor(srcPxX);
      if (sx < 0 || sx >= srcW) continue;

      const alpha = data[(sy * srcW + sx) * 4 + 3] / 255;
      if (alpha > 0.01) {
        const idx = row * cols + col;
        coverage[idx] = alpha;

        // Map the source pixel x back to SVG viewBox space to find the char
        const svgX = (srcPxX / srcW) * SVG_WIDTH;
        charIdx[idx] = charIndexFromSvgX(svgX);
      }
    }
  }

  return { coverage, charIdx };
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} state — mutated from outside:
 *   `progress` 0→1, `exits` Float32Array(8), `globalExit` 0→1
 */
export function createAsciiLoaderField(canvas, state) {
  const ctx = canvas.getContext("2d", { alpha: true });

  let cols = 0;
  let rows = 0;
  let cellW = 0;
  let cellH = 0;
  let fontSize = 0;
  let fontFamily = "";

  let coverage = null;
  let charIndex = null;
  let kinds = null;
  let glyphs = null;

  let svgImage = null;
  let frame = 0;
  let lastPaint = 0;

  const rebuild = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!cols || !rows || !w || !h) return;

    const result = buildCoverage(cols, rows, cellW, cellH, w, h, svgImage);
    coverage = result.coverage;
    charIndex = result.charIdx;
    kinds = new Uint8Array(cols * rows);
    glyphs = new Uint8Array(cols * rows);
  };

  const measure = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(w * dpr);
    canvas.height = Math.ceil(h * dpr);

    fontSize = w < MOBILE_BREAKPOINT ? 9 : w < 1280 ? 11 : 12;
    cellW = fontSize * 0.62;
    cellH = fontSize * 1.06;
    cols = Math.ceil(w / cellW);
    rows = Math.ceil(h / cellH);

    fontFamily = monoFamily();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    rebuild();
  };

  const paintPass = (kind, color) => {
    ctx.fillStyle = color;
    for (let row = 0; row < rows; row++) {
      const y = row * cellH + cellH / 2;
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        if (kinds[idx] !== kind) continue;
        ctx.fillText(GLYPHS[glyphs[idx]], col * cellW + cellW / 2, y);
      }
    }
  };

  const paintCounter = (w, h) => {
    const pct = String(Math.round(state.progress * 100)).padStart(3, "0");
    const counterSize = w < MOBILE_BREAKPOINT ? 12 : 14;
    ctx.save();
    ctx.font = `${counterSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = COUNTER_COLOR;
    ctx.fillText(pct, w / 2, h - 30);
    ctx.restore();
    // Reset main font
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  };

  const paint = (now) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!coverage || !kinds) return;

    ctx.clearRect(0, 0, w, h);

    const reveal = state.progress * (1 + SWEEP) * 1.12;
    const bucket = Math.floor(now / CHURN_MS);
    // Static density pulses slightly with progress for a "signal lock" feel
    const progressPulse = 1 + 0.15 * Math.sin(state.progress * Math.PI * 3);
    const baseDensity =
      STATIC_DENSITY * (1 - state.progress * 0.7) * progressPulse;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const ci = charIndex[idx];
        const threshold = BAYER_8[(row % 8) * 8 + (col % 8)] / 64;

        if (ci >= 0 && coverage[idx] > 0.01) {
          // This cell belongs to a character in the wordmark
          const charExit = state.exits[ci] || 0;
          // Per-character ink: sweep travels left→right across the mark
          const ink =
            coverage[idx] * (reveal - (col / cols) * SWEEP * 1.12) -
            charExit * 1.6;

          if (ink > threshold) {
            kinds[idx] =
              charExit === 0 && ink - threshold < FLASH_BAND
                ? KIND_FLASH
                : KIND_REVEAL;
            // Stable woven glyphs inside the letter
            glyphs[idx] = (col + row) % GLYPHS.length;
            continue;
          }

          // Dissolving into noise — scattered static where the letter used to be
          if (charExit > 0.1 && charExit < 0.95) {
            const dissolveNoise = hash(col, row, bucket) * charExit * 0.4;
            if (dissolveNoise > threshold * 0.8) {
              kinds[idx] = KIND_STATIC;
              glyphs[idx] = Math.floor(
                hash(col + 17, row + 5, bucket) * GLYPHS.length
              );
              continue;
            }
          }
        }

        // Background static noise — thin out near revealed characters
        const nearChar = ci >= 0 ? coverage[idx] * 0.85 : 0;
        const localDensity =
          baseDensity * (1 - nearChar) * (1 - (state.globalExit || 0));

        if (localDensity > 0.001 && hash(col, row, bucket) < localDensity) {
          kinds[idx] = KIND_STATIC;
          glyphs[idx] = Math.floor(
            hash(col + 17, row + 5, bucket) * GLYPHS.length
          );
          continue;
        }

        kinds[idx] = KIND_EMPTY;
      }
    }

    paintPass(KIND_STATIC, STATIC_COLOR);
    paintPass(KIND_REVEAL, REVEAL_COLOR);
    paintPass(KIND_FLASH, FLASH_COLOR);

    // Subtle progress counter at the bottom
    if (state.progress < 1 || (state.globalExit || 0) < 0.5) {
      paintCounter(w, h);
    }
  };

  const tick = (now) => {
    frame = requestAnimationFrame(tick);
    if (now - lastPaint < FRAME_MS) return;
    lastPaint = now;
    paint(now);
  };

  const onResize = () => {
    measure();
    paint(performance.now());
  };

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  measure();
  frame = requestAnimationFrame(tick);
  window.addEventListener("resize", onResize);

  // Load the wordmark SVG — rebuild coverage once it arrives.
  const image = new Image();
  image.onload = () => {
    svgImage = image;
    rebuild();
  };
  image.src = WORDMARK_SRC;

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", onResize);
    image.onload = null;
  };
}
