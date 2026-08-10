import { CHAR_SETS } from "./char-sets";

/**
 * The loader's ASCII field.
 *
 * Same glyph vocabulary as the hero's ASCII cube (the letters of the wordmark),
 * so the loader reads as the same system rather than a generic spinner. Two
 * layers share one grid:
 *
 *   static  — churning random glyphs, thinned out by a hash as progress rises.
 *   reveal  — the logo, turned on cell by cell through an 8x8 ordered (Bayer)
 *             dither of its own coverage mask, so it materialises as a
 *             dithered image instead of wiping in.
 *
 * Deliberately 2D canvas, not WebGL: the hero's ASCII effect is compiling its
 * shaders and decoding its video while this is on screen, and a second GL
 * context competing for that is exactly what the loader is meant to hide.
 */

const GLYPHS = CHAR_SETS.hyperiux.filter((character) => character !== " ");

/**
 * The wordmark is 8:1, so below ~768px it can only be a few cells tall — far
 * too coarse to resolve. The monogram is near-square and stays legible in the
 * same number of columns, so narrow viewports switch to it.
 */
const MARKS = {
  wordmark: {
    src: "/hyperiux-wordmark.svg",
    ratio: 43 / 351,
    widthFactor: 0.78,
    maxWidth: 1500,
  },
  monogram: {
    src: "/hyperiux.svg",
    ratio: 65 / 58,
    widthFactor: 0.34,
    maxWidth: 260,
  },
};

const MONOGRAM_BREAKPOINT = 768;

const STATIC_COLOR = "#242424";
const REVEAL_COLOR = "#ff5f00";
/** Cells that crossed the dither threshold this pass, before they settle. */
const FLASH_COLOR = "#ffffff";

const CHURN_MS = 90;
const FRAME_MS = 1000 / 30;
const STATIC_DENSITY = 0.22;
const FLASH_BAND = 0.06;
/** How far the reveal lags across the mark, so it writes left to right. */
const SWEEP = 0.4;
/** Static is faded out of this bottom strip so the readout sits on clean space. */
const READOUT_CLEARANCE = 130;
const READOUT_FADE = 70;

// Standard 8x8 ordered-dither matrix, same family as the Bayer helpers in
// CurvedGradientShader — the threshold pattern is what gives the reveal its
// halftone grain.
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
  const value = Math.sin(x * 127.1 + y * 311.7 + t * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function monoFamily() {
  const variable = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-geist-mono")
    .trim();

  return variable
    ? `${variable}, ui-monospace, monospace`
    : "ui-monospace, monospace";
}

/** White mark at pixel size, from the SVG when it loaded and text if not. */
function drawMarkSource(width, height, image) {
  const source = document.createElement("canvas");

  source.width = Math.max(1, Math.round(width));
  source.height = Math.max(1, Math.round(height));

  const ctx = source.getContext("2d");

  if (image) {
    ctx.drawImage(image, 0, 0, source.width, source.height);
    return source;
  }

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${source.height * 0.9}px ui-monospace, monospace`;
  ctx.fillText("H", source.width / 2, source.height / 2);

  return source;
}

/**
 * @param canvas the element to paint into
 * @param state  mutated from outside (by GSAP): `progress` and `exit`, both 0..1
 */
export function createAsciiLoaderField(canvas, state) {
  const ctx = canvas.getContext("2d", { alpha: true });

  let cols = 0;
  let rows = 0;
  let cellWidth = 0;
  let cellHeight = 0;
  let fontSize = 0;

  let coverage = null;
  let kinds = null;
  let glyphs = null;

  const images = {};
  let frame = 0;
  let lastPaint = 0;

  const buildCoverage = () => {
    const total = cols * rows;

    coverage = new Float32Array(total);
    kinds = new Uint8Array(total);
    glyphs = new Uint8Array(total);

    if (!cols || !rows) return;

    const width = canvas.clientWidth;
    const mark =
      width < MONOGRAM_BREAKPOINT ? MARKS.monogram : MARKS.wordmark;

    const targetWidth = Math.min(width * mark.widthFactor, mark.maxWidth);
    const targetHeight = targetWidth * mark.ratio;

    const source = drawMarkSource(targetWidth, targetHeight, images[mark.src]);

    // Downscale into grid space: one pixel per cell, so the SVG's antialiasing
    // becomes the per-cell coverage the dither thresholds against.
    const grid = document.createElement("canvas");

    grid.width = cols;
    grid.height = rows;

    const gridCtx = grid.getContext("2d", { willReadFrequently: true });
    const widthInCells = targetWidth / cellWidth;
    const heightInCells = targetHeight / cellHeight;

    gridCtx.drawImage(
      source,
      (cols - widthInCells) / 2,
      (rows - heightInCells) / 2,
      widthInCells,
      heightInCells
    );

    const { data } = gridCtx.getImageData(0, 0, cols, rows);

    for (let i = 0; i < total; i++) {
      coverage[i] = data[i * 4 + 3] / 255;
    }
  };

  const measure = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (!width || !height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);

    // Small cells on purpose: the mark needs ~10 rows of vertical resolution
    // before the dithered edge reads as a letterform rather than a blob.
    fontSize = width < MONOGRAM_BREAKPOINT ? 10 : width < 1280 ? 11 : 12;
    cellWidth = fontSize * 0.62;
    cellHeight = fontSize * 1.06;

    cols = Math.ceil(width / cellWidth);
    rows = Math.ceil(height / cellHeight);

    // Resizing the backing store clears context state, so styling comes after.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${fontSize}px ${monoFamily()}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    buildCoverage();
  };

  const paintPass = (kind, color) => {
    ctx.fillStyle = color;

    for (let row = 0; row < rows; row++) {
      const y = row * cellHeight + cellHeight / 2;

      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;

        if (kinds[index] !== kind) continue;

        ctx.fillText(GLYPHS[glyphs[index]], col * cellWidth + cellWidth / 2, y);
      }
    }
  };

  const paint = (now) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    // Overshoots 1 so the last, faintest coverage cells still land; `exit`
    // drags it back down hard, dissolving the mark the way it arrived.
    const reveal = state.progress * (1 + SWEEP) * 1.12 - state.exit * 1.8;
    const density = STATIC_DENSITY * (1 - state.progress) * (1 - state.exit);
    const bucket = Math.floor(now / CHURN_MS);
    const clearFrom = height - READOUT_CLEARANCE;

    for (let row = 0; row < rows; row++) {
      const y = row * cellHeight;
      const rowFade =
        y < clearFrom
          ? 1
          : Math.max(0, 1 - (y - clearFrom) / READOUT_FADE);

      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        const threshold = BAYER_8[(row % 8) * 8 + (col % 8)] / 64;
        // The column lag is what turns an even fade-up into something being
        // written across the screen.
        const ink = coverage[index] * (reveal - (col / cols) * SWEEP * 1.12);

        if (ink > threshold) {
          kinds[index] =
            state.exit === 0 && ink - threshold < FLASH_BAND
              ? KIND_FLASH
              : KIND_REVEAL;
          // Woven, stable letters inside the mark — no churn once it's lit.
          glyphs[index] = (col + row) % GLYPHS.length;
          continue;
        }

        // Static thins out where the mark is about to land, so it resolves
        // into clean space instead of fighting the noise.
        const local = density * rowFade * (1 - coverage[index] * 0.9);

        if (local > 0.001 && hash(col, row, bucket) < local) {
          kinds[index] = KIND_STATIC;
          glyphs[index] = Math.floor(
            hash(col + 17, row + 5, bucket) * GLYPHS.length
          );
          continue;
        }

        kinds[index] = KIND_EMPTY;
      }
    }

    paintPass(KIND_STATIC, STATIC_COLOR);
    paintPass(KIND_REVEAL, REVEAL_COLOR);
    paintPass(KIND_FLASH, FLASH_COLOR);
  };

  // 30fps: the glyph churn reads as digital rather than smooth, and it halves
  // the fill cost while the page is still loading behind this.
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

  measure();
  frame = requestAnimationFrame(tick);
  window.addEventListener("resize", onResize);

  const loaded = Object.values(MARKS).map(({ src }) => {
    const image = new Image();

    image.onload = () => {
      images[src] = image;
      buildCoverage();
    };
    image.src = src;

    return image;
  });

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", onResize);
    loaded.forEach((image) => {
      image.onload = null;
    });
  };
}
