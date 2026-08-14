"use client";

import Image from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Glyph ramp, lightest ink → heaviest. Binary, like the icons themselves: a
 * blank cell, a thin 1 on the falloff, a solid 0 inside the shape.
 */
const RAMP = [" ", "1", "0"];

/** Cells across the box. Rows follow from the box aspect so cells stay square. */
const COLUMNS = 26;

/**
 * Input levels for the source art. Cells are averages of the icon's own thin
 * orange glyphs, so a cell sitting squarely inside the shape only reaches
 * ~0.16 luminance — the band has to be stretched to that or the whole icon
 * lands on the blank ramp slots.
 */
const LEVELS_LOW = 0.02;
const LEVELS_HIGH = 0.16;

/** Curve on the ramp index. Above 1 pushes mid-tones down, keeping the edge
 *  falloff from smearing the shape into a solid block. */
const RAMP_CURVE = 1.3;

/**
 * How far the dissolve is allowed to spread past the shape, and how much
 * quieter each ring out is. This is what keeps the morph on the icon's own
 * curvature: noise is weighted by this field, so it eats the silhouette and
 * sprays a little way off its edges instead of filling the box.
 */
const HALO_RINGS = 3;
const HALO_DECAY = 0.5;

/** The step actually shown: walks back past any icon whose file failed to load,
 *  so a missing asset falls back to the previous one instead of an empty box. */
function resolveStep(state, step) {
  for (let i = step; i >= 0; i -= 1) {
    if (!state.failed[i]) return i;
  }
  return 0;
}

/**
 * Weight per cell for how much dissolve it may take: 1 on the shape, decaying
 * outwards ring by ring, 0 beyond the halo. Repeated max-dilation of the
 * occupied cells, so the falloff follows the icon's own contour.
 */
function buildField(grid, cols, rows) {
  let field = new Float32Array(grid.length);
  for (let i = 0; i < grid.length; i += 1) field[i] = grid[i] > 0 ? 1 : 0;

  for (let ring = 0; ring < HALO_RINGS; ring += 1) {
    const next = Float32Array.from(field);

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const i = y * cols + x;
        let max = field[i];
        if (x > 0) max = Math.max(max, field[i - 1] * HALO_DECAY);
        if (x < cols - 1) max = Math.max(max, field[i + 1] * HALO_DECAY);
        if (y > 0) max = Math.max(max, field[i - cols] * HALO_DECAY);
        if (y < rows - 1) max = Math.max(max, field[i + cols] * HALO_DECAY);
        next[i] = max;
      }
    }

    field = next;
  }

  return field;
}

/** Pseudo-random 0..1 from a cell + seed. Deterministic, so scrubbing back
 *  through the morph replays the same noise instead of re-rolling it. */
function hash(x, y, seed) {
  let h =
    Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/**
 * The travelling Preview icon: a crisp image at rest that dissolves into an
 * ASCII rendering of itself while it moves, and comes back as the next icon in
 * `sources`.
 *
 * Exposes imperative `setStep()` / `setMorph()` so a scrubbed GSAP timeline can
 * drive it without re-rendering React on every scroll tick.
 */
const AsciiMorphIcon = forwardRef(function AsciiMorphIcon(
  { sources, className = "" },
  ref,
) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const stateRef = useRef({
    ctx: null,
    draw: null,
    grids: [],
    fields: [],
    failed: [],
    step: 0,
    morph: 0,
    cols: 0,
    rows: 0,
    cell: 0,
    cssWidth: 0,
    cssHeight: 0,
    color: "#ff5f00",
  });

  const srcKey = sources.join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = stateRef.current;
    const list = srcKey.split("|");
    state.grids = list.map(() => null);
    state.fields = list.map(() => null);
    state.failed = list.map(() => false);

    let disposed = false;

    /** Samples one source into a cols×rows ramp grid, framed like object-cover. */
    const buildGrid = (image, index) => {
      const { cols, rows } = state;
      if (!cols || !rows || !image.complete || !image.naturalWidth) return;

      const probe = document.createElement("canvas");
      probe.width = cols;
      probe.height = rows;
      const probeCtx = probe.getContext("2d", { willReadFrequently: true });

      const scale = Math.max(cols / image.naturalWidth, rows / image.naturalHeight);
      const dw = image.naturalWidth * scale;
      const dh = image.naturalHeight * scale;
      probeCtx.drawImage(image, (cols - dw) / 2, (rows - dh) / 2, dw, dh);

      let pixels;
      try {
        pixels = probeCtx.getImageData(0, 0, cols, rows).data;
      } catch {
        // Tainted canvas: leave this grid null and the plain image stays put.
        state.grids[index] = null;
        state.fields[index] = null;
        return;
      }

      const grid = new Uint8Array(cols * rows);
      const span = LEVELS_HIGH - LEVELS_LOW;

      for (let i = 0; i < grid.length; i += 1) {
        const p = i * 4;
        // Alpha folds into luminance rather than multiplying the level: on
        // transparent art it is the coverage that carries the tone, and
        // applying it twice erases the icon.
        const lum =
          ((pixels[p] * 0.3 + pixels[p + 1] * 0.59 + pixels[p + 2] * 0.11) / 255) *
          (pixels[p + 3] / 255);
        const level = Math.min(Math.max((lum - LEVELS_LOW) / span, 0), 1);
        grid[i] = Math.round(level ** RAMP_CURVE * (RAMP.length - 1));
      }

      state.grids[index] = grid;
      state.fields[index] = buildField(grid, cols, rows);
    };

    const probes = list.map((src, index) => {
      const image = new window.Image();
      image.onload = () => {
        if (disposed) return;
        buildGrid(image, index);
        if (index === state.step) state.draw?.();
      };
      image.onerror = () => {
        if (!disposed) state.failed[index] = true;
      };
      image.src = src;
      return image;
    });

    const buildAllGrids = () => probes.forEach(buildGrid);

    const draw = () => {
      const { ctx, grids, fields, cols, rows, cell, morph, color, cssWidth, cssHeight } =
        state;
      const active = resolveStep(state, state.step);
      const grid = grids[active];
      const field = fields[active];
      if (!ctx || !grid || !field) return;

      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.fillStyle = color;

      // Advances with the scrub so glyphs churn while the morph is open.
      const seed = Math.floor(morph * 48);

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x;
          let index = grid[i];
          let alpha = 1;

          // The field caps the dissolve per cell, so it works the silhouette
          // and its immediate surround and never squares off the box.
          const reach = morph * field[i];

          if (reach > 0 && hash(x, y, seed) < reach) {
            // Any ramp slot but the blank one, so a scrambled cell always inks.
            index = 1 + Math.floor(hash(x + 7, y + 13, seed + 1) * (RAMP.length - 1));
            alpha = (0.35 + hash(x + 3, y + 5, seed + 2) * 0.65) * field[i];
          }

          const char = RAMP[index];
          if (char === " ") continue;

          ctx.globalAlpha = alpha;
          ctx.fillText(char, (x + 0.5) * cell, (y + 0.5) * cell);
        }
      }

      ctx.globalAlpha = 1;
    };

    state.draw = draw;

    const measure = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cell = width / COLUMNS;

      state.cols = COLUMNS;
      state.rows = Math.max(1, Math.ceil(height / cell));
      state.cell = cell;
      state.cssWidth = width;
      state.cssHeight = height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${cell * 1.35}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      state.ctx = ctx;
      state.color = window.getComputedStyle(canvas).color || state.color;

      buildAllGrids();
      draw();
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(canvas);

    return () => {
      disposed = true;
      observer.disconnect();
      probes.forEach((image) => {
        image.onload = null;
      });
    };
  }, [srcKey]);

  useImperativeHandle(ref, () => {
    /** Keeps the stacked images in sync with the active step and morph. */
    const paint = () => {
      const state = stateRef.current;
      const canvas = canvasRef.current;
      const active = resolveStep(state, state.step);
      const usable = state.grids[active] ? state.morph : 0;

      if (canvas) canvas.style.opacity = `${usable}`;
      imagesRef.current.forEach((image, index) => {
        if (image) {
          image.style.opacity = index === active ? `${1 - usable}` : "0";
        }
      });

      if (usable > 0) state.draw?.();
    };

    return {
      setStep(index) {
        const state = stateRef.current;
        const next = Math.min(Math.max(index, 0), state.grids.length - 1);
        if (next === state.step) return;
        state.step = next;
        paint();
      },
      setMorph(value) {
        const state = stateRef.current;
        const morph = Math.min(Math.max(value, 0), 1);
        if (Math.abs(morph - state.morph) < 0.001) return;
        state.morph = morph;
        paint();
      },
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {sources.map((src, index) => (
        <Image
          key={src}
          ref={(node) => {
            imagesRef.current[index] = node;
          }}
          src={src}
          alt=""
          aria-hidden="true"
          width={1000}
          height={1000}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: index === 0 ? 1 : 0 }}
        />
      ))}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-primary opacity-0"
      />
    </div>
  );
});

export default AsciiMorphIcon;
