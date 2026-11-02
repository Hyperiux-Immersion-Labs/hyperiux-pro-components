// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";
/* eslint-disable @next/next/no-img-element -- shipped outside Next.js too, so next/image isn't available */

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";

type CSSVars = CSSProperties & Record<`--${string}`, string | number | undefined>;

export type GlassFolderArtPreset = "vault" | "aurora" | "ember" | "dusk" | "glacier" | "verdant";

export interface GlassFolderFile {
  name: string;
  /** A short second line: a size, a date, a kind. */
  meta?: string;
  /** Makes the file a picture: a generated artwork… */
  art?: GlassFolderArtPreset | GlassFolderArtRecipe;
  /** …or an image of your own. Without either, the file is a sheet of paper. */
  image?: string;
  /** Rendered as a link when the folder is open. */
  href?: string;
}

export interface GlassFolderMenuItem {
  label: string;
  onSelect?: () => void;
  /** Drawn in red, for the one you would want to think twice about. */
  danger?: boolean;
}

export type GlassFolderSize = "sm" | "md" | "lg";

/** The width of each size preset, in px. */
export const GLASS_FOLDER_SIZES: Record<GlassFolderSize, number> = { sm: 260, md: 340, lg: 420 };

export interface GlassFolderProps {
  label?: string;
  /** The second line. Defaults to the number of files, which rolls as you add. */
  meta?: string;
  /** `dark` is smoked glass, `light` is milk glass. */
  tone?: "dark" | "light";
  /** What the back panel holds: a preset, your own recipe, or `none` for a plain frosted back. */
  art?: GlassFolderArt;
  /** A different arrangement of the same recipe. */
  seed?: number;
  /** Your own picture for the back panel, instead of generated art. */
  image?: string;
  /** The folder's contents. Read once; after that the folder owns the list. */
  files?: GlassFolderFile[];
  /** `add` drops new files in, `more` opens a menu, `both` shows the two keys side by side, `none` hides them. */
  action?: "add" | "more" | "both" | "none";
  /** What `add` puts in the folder. Return nothing for an "Untitled" sheet. */
  onAdd?: (files: GlassFolderFile[]) => GlassFolderFile | void;
  onFilesChange?: (files: GlassFolderFile[]) => void;
  /** Extra items for the `more` menu, after the built-in ones. An Open / Close item is always first. */
  menu?: GlassFolderMenuItem[];
  /** Adds a Customize item to the `more` menu: pick the artwork and the glass from inside the folder. */
  customizable?: boolean;
  /** Called with the new artwork after a Customize pick. */
  onArtChange?: (art: GlassFolderArt) => void;
  /** Called with the new glass after a Customize pick. */
  onToneChange?: (tone: "dark" | "light") => void;
  /** Corner radius of the folder's panels, 0–30. */
  radius?: number;
  /** Corner radius of the files inside, in px. */
  fileRadius?: number;
  /** Colour of the glass edge and the back panel's outline. Defaults to white. */
  rimColor?: string;
  /** Thickness of the glass edge, in px. 0 hides it. */
  rimWidth?: number;
  /** How frosted the glass is: the blur behind it, in px. */
  glassBlur?: number;
  /** The soft shadow under the folder. */
  shadow?: boolean;
  /** How far the folder leans toward the pointer, in degrees. 0 keeps it flat. */
  tilt?: number;
  /** Adds a Rename item to the `more` menu: the title turns into a field. Enter saves, Escape cancels. */
  renamable?: boolean;
  /** Called with the new name after a rename. */
  onRename?: (label: string) => void;
  /** Adds a Copy link item to the `more` menu that copies this URL; the meta line confirms it. */
  shareUrl?: string;
  /** Called after the link is copied. */
  onShare?: (url: string) => void;
  /** Adds a Delete folder item to the `more` menu. The folder falls away, then this is called. */
  onDelete?: () => void;
  /** Where the label sits on the front panel. */
  labelPlacement?: "bottom-left" | "top-left" | "top-right";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called when a file is chosen while the folder is open. */
  onFileSelect?: (file: GlassFolderFile, index: number) => void;
  /** Choosing a file (without an `href`) opens it in a modal you can swipe through. */
  preview?: boolean;
  /** Files get a remove button: on each file while the folder is open, and on the preview's thumbnails. */
  removable?: boolean;
  /** Called after a file is removed, with the file and where it was. */
  onFileRemove?: (file: GlassFolderFile, index: number) => void;
  /** How many files stand in the pocket at once. The rest are still in the preview's thumbnails. */
  maxVisible?: number;
  /** Shown on an empty pocket. */
  emptyText?: string;
  /** Preset sizes: 260, 340 or 420px wide. */
  size?: GlassFolderSize;
  /** Width in px, instead of a preset. Everything else scales with it. */
  width?: number;
  /** Focus rings, the add flash and the count when it changes. */
  accentColor?: string;
  /** Pace multiplier for every move. 1 is house timing; 2 is half speed. */
  duration?: number;
  /** Assemble itself the first time it scrolls into view. */
  appear?: boolean;
  /** Delay before that entrance, in ms — for staggering a row of folders. */
  appearDelay?: number;
  className?: string;
  style?: CSSProperties;
}

// Reduced motion

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getServerReducedMotionSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeToReducedMotion, prefersReducedMotion, getServerReducedMotionSnapshot);
}

// Art

export interface GlassFolderArtRecipe {
  /** `marble` folds the colours through each other; `streak` pulls them into a long exposure. */
  style: "marble" | "streak";
  /** Two or more colours, in the order they appear through the field. */
  colors: string[];
  /** Size of the forms. Lower is larger and calmer. */
  scale?: number;
  /** How hard the field folds into itself. */
  warp?: number;
  /** Direction of the flow, in radians. */
  angle?: number;
  /** Specular highlight on the liquid surface, 0–1. */
  gloss?: number;
  /** Dark veins along the folds, 0–1. */
  veins?: number;
}

export type GlassFolderArt = GlassFolderArtPreset | GlassFolderArtRecipe | "none";

export const GLASS_FOLDER_ART: Record<GlassFolderArtPreset, GlassFolderArtRecipe> = {
  // Vault orange folding through near-black, with a cream edge
  vault: {
    style: "marble",
    colors: ["#050505", "#1a0f09", "#4a2410", "#0b0807", "#c94600", "#ff5f00", "#ffc8a3"],
    scale: 0.66,
    warp: 3.3,
    angle: -0.4,
    gloss: 0.55,
    veins: 0.55,
  },
  // a long exposure: blush, oxblood and steel pulled across the frame
  aurora: {
    style: "streak",
    colors: ["#f4efe9", "#e9c2b8", "#c2433f", "#2a1e2a", "#22395e", "#6f97c2", "#e5edf4"],
    scale: 0.7,
    warp: 1.4,
    angle: -0.62,
    gloss: 0.18,
    veins: 0,
  },
  // red ink folding through teal-black water
  ember: {
    style: "marble",
    colors: ["#07090c", "#16252c", "#3d5f68", "#1a1416", "#a3201a", "#ef4a2b", "#ff8a5c"],
    scale: 0.62,
    warp: 3.2,
    angle: -0.5,
    gloss: 0.55,
    veins: 0.6,
  },
  // plum and rust, swirled
  dusk: {
    style: "marble",
    colors: ["#120c18", "#3e2850", "#8f6c9c", "#2b1a24", "#b3502f", "#eab08a", "#fbe7d2"],
    scale: 0.75,
    warp: 3.6,
    angle: 0.8,
    gloss: 0.5,
    veins: 0.5,
  },
  // cold, pale, nearly white
  glacier: {
    style: "streak",
    colors: ["#f7f8fa", "#d9e2ea", "#9fb4c7", "#e8edf2", "#bccbd8", "#ffffff"],
    scale: 0.7,
    warp: 1.6,
    angle: 0.35,
    gloss: 0.25,
    veins: 0,
  },
  // moss and brass
  verdant: {
    style: "marble",
    colors: ["#070b08", "#173024", "#4f7a5a", "#141812", "#a7843a", "#e9cf87", "#fbf3d6"],
    scale: 0.7,
    warp: 3.4,
    angle: 2.1,
    gloss: 0.5,
    veins: 0.5,
  },
};

/** `#rgb` or `#rrggbb` to a triple. Anything unreadable comes back mid-grey. */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = /^[0-9a-f]{6}$/i.test(h) ? parseInt(h, 16) : 0x808080;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** A small, fast, seedable PRNG (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable small integer for a string, so a file's art follows its name. */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Seeded gradient noise, summed into fractal octaves with a rotation between each. */
function makeFbm(seed: number): (x: number, y: number, octaves: number) => number {
  const r = rng(seed);
  const perm = new Uint8Array(512);
  const grad = new Float32Array(512);
  const p: number[] = [];
  for (let i = 0; i < 256; i++) p.push(i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = p[i];
    p[i] = p[j];
    p[j] = t;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  for (let i = 0; i < 256; i++) {
    const a = r() * Math.PI * 2;
    grad[i * 2] = Math.cos(a);
    grad[i * 2 + 1] = Math.sin(a);
  }
  const noise = (x: number, y: number): number => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const h00 = perm[X + perm[Y]] * 2;
    const h10 = perm[X + 1 + perm[Y]] * 2;
    const h01 = perm[X + perm[Y + 1]] * 2;
    const h11 = perm[X + 1 + perm[Y + 1]] * 2;
    const d00 = grad[h00] * xf + grad[h00 + 1] * yf;
    const d10 = grad[h10] * (xf - 1) + grad[h10 + 1] * yf;
    const d01 = grad[h01] * xf + grad[h01 + 1] * (yf - 1);
    const d11 = grad[h11] * (xf - 1) + grad[h11 + 1] * (yf - 1);
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    return d00 + u * (d10 - d00) + v * (d01 - d00 + u * (d11 - d01 - d10 + d00));
  };
  return (x, y, octaves) => {
    let sum = 0;
    let amp = 0.5;
    for (let i = 0; i < octaves; i++) {
      sum += amp * noise(x, y);
      const nx = 1.6 * x + 1.2 * y + 7.1;
      y = -1.2 * x + 1.6 * y + 3.3;
      x = nx;
      amp *= 0.5;
    }
    return sum;
  };
}

interface ArtJob {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  /** Paint up to `rows` more rows. Returns true once the picture is finished. */
  step: (rows: number) => boolean;
}

function createArtJob(width: number, height: number, recipe: GlassFolderArtRecipe, seed: number): ArtJob {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const colors = recipe.colors.length >= 2 ? recipe.colors : ["#111111", "#eeeeee"];
  const stops = colors.map((c, i) => ({ t: i / (colors.length - 1), c: hexToRgb(c) }));
  const scale = recipe.scale ?? 0.7;
  const warp = recipe.warp ?? 3;
  const gloss = recipe.gloss ?? 0.4;
  const veins = recipe.veins ?? 0;
  const streak = recipe.style === "streak";
  const fbm = makeFbm(seed * 977 + 13);
  const r = rng(seed + 1);
  const ox = r() * 50;
  const oy = r() * 50;
  const angle = (recipe.angle ?? 0) + (r() - 0.5) * 0.5;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const m = Math.min(w, h);
  // Sampled on a half-resolution grid (with a one-cell apron) and brought up
  // with Catmull-Rom, which keeps the slope continuous for the lighting.
  const gw = Math.ceil(w / 2) + 3;
  const gh = Math.ceil(h / 2) + 3;
  const G = new Float32Array(gw * gh);
  const GQ = new Float32Array(gw * gh);
  const F = new Float32Array(w * h);
  const Q = new Float32Array(w * h);
  const pixels = new Uint8ClampedArray(w * h * 4);
  let row = 0;

  const field = (gy: number) => {
    for (let gx = 0; gx < gw; gx++) {
      const u = ((gx - 1) * 2 - w / 2) / m;
      const v = ((gy - 1) * 2 - h / 2) / m;
      let px = (u * ca - v * sa) * scale;
      let py = (u * sa + v * ca) * scale;
      if (streak) {
        px *= 0.14;
        py *= 2.2;
      }
      px += ox;
      py += oy;
      const qx = fbm(px, py, 3);
      const qy = fbm(px + 5.2, py + 1.3, 3);
      const rx = fbm(px + warp * qx + 1.7, py + warp * qy + 9.2, 3);
      const ry = fbm(px + warp * qx + 8.3, py + warp * qy + 2.8, 3);
      G[gy * gw + gx] = fbm(px + warp * rx, py + warp * ry, 4);
      GQ[gy * gw + gx] = Math.sqrt(qx * qx + qy * qy);
    }
  };

  const upsample = () => {
    const cr = (a: number, b: number, c: number, d: number) => (-a + 9 * b + 9 * c - d) / 16;
    const T = new Float32Array(w * gh);
    for (let gy = 0; gy < gh; gy++) {
      const base = gy * gw;
      for (let x = 0; x < w; x++) {
        const c = (x >> 1) + 1;
        T[gy * w + x] = x & 1 ? cr(G[base + c - 1], G[base + c], G[base + c + 1], G[base + c + 2]) : G[base + c];
      }
    }
    for (let y = 0; y < h; y++) {
      const c = (y >> 1) + 1;
      for (let x = 0; x < w; x++) {
        F[y * w + x] =
          y & 1 ? cr(T[(c - 1) * w + x], T[c * w + x], T[(c + 1) * w + x], T[(c + 2) * w + x]) : T[c * w + x];
        const gx = (x >> 1) + 1;
        const q0 = GQ[c * gw + gx];
        const qx = x & 1 ? (q0 + GQ[c * gw + gx + 1]) / 2 : q0;
        const q1 = y & 1 ? (x & 1 ? (GQ[(c + 1) * gw + gx] + GQ[(c + 1) * gw + gx + 1]) / 2 : GQ[(c + 1) * gw + gx]) : qx;
        Q[y * w + x] = (qx + q1) / 2;
      }
    }
  };

  const colorize = () => {
    const sample: number[] = [];
    const stride = Math.max(1, Math.floor(F.length / 4096));
    for (let i = 0; i < F.length; i += stride) sample.push(F[i]);
    sample.sort((a, b) => a - b);
    const lo = sample[Math.floor(sample.length * 0.02)];
    const hi = sample[Math.floor(sample.length * 0.98)];
    const k = 1 / (hi - lo || 1);
    const lx = -0.55;
    const ly = -0.65;
    const lz = 0.52;
    const slope = k * m * 0.012;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        let t = (F[i] - lo) * k;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        let j = 1;
        while (j < stops.length - 1 && stops[j].t < t) j++;
        const a = stops[j - 1];
        const b = stops[j];
        let f = (t - a.t) / (b.t - a.t || 1);
        f = f < 0 ? 0 : f > 1 ? 1 : f;
        f = f * f * (3 - 2 * f);
        const gx = (F[x < w - 1 ? i + 1 : i] - F[x > 0 ? i - 1 : i]) * slope;
        const gy = (F[y < h - 1 ? i + w : i] - F[y > 0 ? i - w : i]) * slope;
        const nd = (-gx * lx - gy * ly + lz) / Math.sqrt(gx * gx + gy * gy + 1);
        const spec = Math.pow(nd > 0 ? nd : 0, 24) * gloss * 255;
        const silk = 1 + 0.035 * Math.sin(t * 150 + Q[i] * 24);
        const vein = veins * Math.max(0, 1 - Math.abs(Q[i] - 0.42) * 14) * 0.6;
        const lit = (0.82 + 0.28 * nd) * silk * (1 - vein);
        pixels[i * 4] = (a.c[0] + (b.c[0] - a.c[0]) * f) * lit + spec;
        pixels[i * 4 + 1] = (a.c[1] + (b.c[1] - a.c[1]) * f) * lit + spec;
        pixels[i * 4 + 2] = (a.c[2] + (b.c[2] - a.c[2]) * f) * lit + spec;
        pixels[i * 4 + 3] = 255;
      }
    }
  };

  const step = (rows: number): boolean => {
    if (row >= gh) return true;
    const end = Math.min(gh, row + Math.max(1, rows));
    while (row < end) field(row++);
    if (row < gh) return false;
    upsample();
    colorize();
    return true;
  };

  return { width: w, height: h, pixels, step };
}

const recipeOf = (art: GlassFolderArtPreset | GlassFolderArtRecipe): GlassFolderArtRecipe =>
  typeof art === "string" ? GLASS_FOLDER_ART[art] ?? GLASS_FOLDER_ART.vault : art;


const artCache = new Map<string, Promise<HTMLCanvasElement>>();
const queue: { job: ArtJob; priority: number; done: (c: HTMLCanvasElement) => void }[] = [];
let pumping = false;

function pump() {
  if (pumping) return;
  pumping = true;
  const tick = () => {
    const until = performance.now() + 7;
    while (queue.length && performance.now() < until) {
      const head = queue[0];
      if (head.job.step(4)) {
        queue.shift();
        const c = document.createElement("canvas");
        c.width = head.job.width;
        c.height = head.job.height;
        const ctx = c.getContext("2d");
        if (ctx) {
          const img = ctx.createImageData(c.width, c.height);
          img.data.set(head.job.pixels);
          ctx.putImageData(img, 0, 0);
        }
        head.done(c);
      }
    }
    if (queue.length) requestAnimationFrame(tick);
    else pumping = false;
  };
  requestAnimationFrame(tick);
}

/** Lower priority paints first: back panels (0) before the files tucked behind glass (1). */
function paint(recipe: GlassFolderArtRecipe, seed: number, w: number, h: number, priority: number) {
  const key = JSON.stringify([recipe, seed, w, h]);
  let p = artCache.get(key);
  if (!p) {
    p = new Promise<HTMLCanvasElement>((done) => {
      // never jump the job already in progress
      let at = queue.length;
      while (at > 1 && queue[at - 1].priority > priority) at--;
      queue.splice(at, 0, { job: createArtJob(w, h, recipe, seed), priority, done });
      pump();
    });
    artCache.set(key, p);
  }
  return p;
}

/** A generated artwork, painted off the main thread budget and faded in when ready. */
function ArtCanvas({
  art,
  seed,
  w,
  h,
  density,
  priority,
  className,
}: {
  art: GlassFolderArtPreset | GlassFolderArtRecipe;
  seed: number;
  w: number;
  h: number;
  density: number;
  priority: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const key = JSON.stringify(recipeOf(art));
  const pw = Math.round(w * density);
  const ph = Math.round(h * density);
  // Ready only for the artwork last painted, so a new recipe or size fades in again
  const job = `${key}|${seed}|${pw}|${ph}`;
  const [paintedJob, setPaintedJob] = useState<string | null>(null);
  const ready = paintedJob === job;

  useEffect(() => {
    let live = true;
    paint(JSON.parse(key) as GlassFolderArtRecipe, seed, pw, ph, priority).then((src) => {
      const c = ref.current;
      if (!live || !c) return;
      c.width = src.width;
      c.height = src.height;
      c.getContext("2d")?.drawImage(src, 0, 0);
      setPaintedJob(job);
    });
    return () => {
      live = false;
    };
  }, [key, seed, pw, ph, priority, job]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      data-ready={ready || undefined}
      style={{ width: w, height: h, maxWidth: "none" }}
    />
  );
}


const subscribeNever = () => () => {};
const readDpr = () => Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));

const W = 340;
const H = 272;
const HEADROOM = 54; 
const FRONT_TOP = 74;
const FRONT_H = H - FRONT_TOP;
const SHEET_W = 272;
const SHEET_H = 184;

const MAX_RADIUS = 30;

/** The back panel's outline, its tab on the right, with every corner at radius `r`. */
function backPath(r: number) {
  const a = `A${r} ${r} 0 0 1`;
  return `M0 ${34 + r}${a} ${r} 34L146 34C170 34 172 0 198 0L${W - r} 0${a} ${W} ${r}L${W} ${H - r}${a} ${W - r} ${H}L${r} ${H}${a} 0 ${H - r}Z`;
}

/** The front glass's outline, its tab on the left, with every corner at radius `r`. */
function frontPath(r: number) {
  const a = `A${r} ${r} 0 0 1`;
  return `M0 ${r}${a} ${r} 0L118 0C144 0 146 32 172 32L${W - r} 32${a} ${W} ${32 + r}L${W} ${FRONT_H - r}${a} ${W - r} ${FRONT_H}L${r} ${FRONT_H}${a} 0 ${FRONT_H - r}Z`;
}
const COPIED_MS = 1600;
const PILL_RELEASE_MS = 150;
const PAPER_LINES = ["86%", "92%", "64%", "88%", "42%"];

// House curves
const EO3 = "cubic-bezier(.33, 1, .68, 1)";
const EO4 = "cubic-bezier(.25, 1, .5, 1)";
const EI3 = "cubic-bezier(.32, 0, .67, 0)";
const EIO3 = "cubic-bezier(.65, 0, .35, 1)";
// easeOutQuint: a long, soft settle for the entrance and the fan-out
const EO5 = "cubic-bezier(.22, 1, .36, 1)";
const POP = "cubic-bezier(.34, 1.56, .64, 1)";

/**
 * Each state sets the timing used to *arrive* in it (a transition runs with the
 * new state's values), so files drop back on easeInCubic but fan out on easeOutQuart.
 *   rest  ← drop back in, reverse stagger 12ms
 *   hover ← easeOutQuart, 0.34s, stagger 20ms
 *   open  ← easeOutQuart fan-out, 0.42s, stagger 20ms; hinge on easeInOutQuart
 */
const MOTION_STATES = {
  rest: {
    "--gf-hinge": "0deg", "--gf-lift": "42px", "--gf-spread": "0px", "--gf-fan": "0deg", "--gf-stack": "15px",
    "--gf-move": ".26s", "--gf-move-ease": EI3, "--gf-sd": "0ms", "--gf-srd": "12ms", "--gf-hinge-t": ".38s", "--gf-hinge-ease": EIO3,
  },
  hover: {
    "--gf-hinge": "-11deg", "--gf-lift": "-34px", "--gf-spread": "8px", "--gf-fan": "1.4deg", "--gf-stack": "10px",
    "--gf-move": ".42s", "--gf-move-ease": EO5, "--gf-sd": "22ms", "--gf-srd": "0ms", "--gf-hinge-t": ".42s", "--gf-hinge-ease": EO5,
  },
  open: {
    "--gf-hinge": "-24deg", "--gf-lift": "-96px", "--gf-spread": "40px", "--gf-fan": "5deg", "--gf-stack": "30px",
    "--gf-move": ".56s", "--gf-move-ease": EO5, "--gf-sd": "32ms", "--gf-srd": "0ms", "--gf-hinge-t": ".5s", "--gf-hinge-ease": EIO3,
  },
} satisfies Record<string, CSSVars>;

// Class strings. `group-data-pending/gf` is the folder before its entrance.
const ENTER_BACK =
  "[transition:translate_calc(var(--gf-pace)*.66s)_var(--gf-eo5),opacity_calc(var(--gf-pace)*.4s)_var(--gf-eo5),filter_calc(var(--gf-pace)*.6s)_var(--gf-eo5)] group-data-pending/gf:[translate:0_18px] group-data-pending/gf:opacity-0 group-data-pending/gf:blur-[6px]";
const BACK_ART =
  "absolute -top-3 -left-3 max-w-none object-cover [transform:translate(calc(var(--gf-px)*-7px),calc(var(--gf-py)*-6px))_scale(1.02)] [transition:transform_calc(var(--gf-pace)*.8s)_var(--gf-eo3),opacity_calc(var(--gf-pace)*.5s)_var(--gf-eo4),filter_calc(var(--gf-pace)*.5s)_var(--gf-eo4)]";
// The sheet's place in the stack, from the folder state and its own slot. Open and
// hovered, it rises 18px and straightens (drops its jitter, eases its fan).
const SHEET_MOTION = [
  "[--gf-raise:0px] [--gf-jk:1] [--gf-fk:1]",
  "group-data-open/gf:hover:[--gf-raise:-18px] group-data-open/gf:hover:[--gf-jk:0] group-data-open/gf:hover:[--gf-fk:0.6] group-data-open/gf:hover:[--gf-move:.24s] group-data-open/gf:hover:[--gf-sd:0ms]",
  "group-data-open/gf:has-focus-visible:[--gf-raise:-18px] group-data-open/gf:has-focus-visible:[--gf-jk:0] group-data-open/gf:has-focus-visible:[--gf-fk:0.6]",
  "[transform:translate(calc(var(--gf-jx)_+_var(--gf-slot)*var(--gf-spread)),calc(var(--gf-lift)_-_var(--gf-depth)*var(--gf-stack)_+_var(--gf-raise)))_rotate(calc(var(--gf-jr)*var(--gf-jk)_+_var(--gf-slot)*var(--gf-fan)*var(--gf-fk)))]",
  "[transition:transform_calc(var(--gf-pace)*var(--gf-move))_var(--gf-move-ease)_calc(var(--gf-pace)*(var(--gf-depth)*var(--gf-sd)_+_var(--gf-rdepth)*var(--gf-srd))),box-shadow_calc(var(--gf-pace)*.24s)_var(--gf-eo3),translate_calc(var(--gf-pace)*.66s)_var(--gf-eo5)_calc(var(--gf-pace)*(.15s_+_var(--gf-depth)*60ms)),opacity_calc(var(--gf-pace)*.32s)_var(--gf-eo5)_calc(var(--gf-pace)*(.15s_+_var(--gf-depth)*60ms)),filter_calc(var(--gf-pace)*.56s)_var(--gf-eo5)_calc(var(--gf-pace)*(.15s_+_var(--gf-depth)*60ms))]",
  "group-data-open/gf:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_0.5px_rgba(0,0,0,0.1),0_22px_40px_-12px_rgba(10,8,6,0.45)]",
  "group-data-pending/gf:[translate:0_-88px] group-data-pending/gf:opacity-0 group-data-pending/gf:blur-[8px]",
].join(" ");
const SHEET_ACTION =
  "gf-sheet-action absolute inset-0 block cursor-pointer border-0 bg-transparent p-0 text-left outline-none";
const REMOVE_BUTTON =
  "z-2 grid size-7 cursor-pointer place-items-center rounded-full border border-white/25 bg-black/55 p-0 text-white backdrop-blur-sm transition-[opacity,background-color,border-color] duration-200 outline-none hover:border-[#e5484d] hover:bg-[#e5484d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gf-accent)";

/** The accent grows in from the key's centre on hover, and holds while its menu is open. */
function KeyFill() {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "pointer-events-none absolute inset-0 scale-50 rounded-[inherit] bg-(--gf-accent) opacity-0 group-hover/key:scale-100 group-hover/key:opacity-100 group-aria-expanded/key:scale-100 group-aria-expanded/key:opacity-100",
        KEY_MOVE,
      )}
    />
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
  );
}

const SHEET_DROP = "animate-[gf-drop_calc(var(--gf-pace)*.42s)_var(--gf-eo4)_both,gf-fade_calc(var(--gf-pace)*.1s)_linear_both]";
const SHEET_ART =
  "absolute top-0 left-0 h-[184px] w-[272px] max-w-none object-cover transition-[opacity,filter] duration-[calc(var(--gf-pace)*500ms)] ease-(--gf-eo4)";
const TITLE = "truncate text-[19px] leading-[1.1] font-medium tracking-[-0.035em]";
const META = "font-mono text-[11.5px] tracking-[0.02em] whitespace-nowrap opacity-55";
// the count rolls in from blur and holds the accent for a beat
const META_CHANGED =
  "animate-[gf-roll_calc(var(--gf-pace)*.3s)_var(--gf-eo4)_both] [&_.gf-count]:animate-[gf-count_calc(var(--gf-pace)*.9s)_linear_both]";
const KEY_MOTION =
  "[transition:transform_calc(var(--gf-pace)*.2s)_var(--gf-eo4),scale_calc(var(--gf-pace)*.13s)_var(--gf-eo3),color_calc(var(--gf-pace)*.3s)_var(--gf-eo4),box-shadow_calc(var(--gf-pace)*.6s)_var(--gf-eo4),translate_calc(var(--gf-pace)*.5s)_var(--gf-eo5)_calc(var(--gf-pace)*.45s),opacity_calc(var(--gf-pace)*.35s)_var(--gf-eo5)_calc(var(--gf-pace)*.45s),filter_calc(var(--gf-pace)*.45s)_var(--gf-eo5)_calc(var(--gf-pace)*.45s)] hover:[transform:translateY(-2px)] active:scale-90 group-data-pending/gf:[translate:0_10px] group-data-pending/gf:opacity-0 group-data-pending/gf:blur-[4px]";
// rises from blur, leaves accelerating into blur
const MENU_MOTION =
  "invisible scale-[0.97] opacity-0 data-[v=up]:[translate:0_18px] data-[v=down]:[translate:0_-18px] [transition:opacity_calc(var(--gf-pace)*.26s)_var(--gf-eio3),translate_calc(var(--gf-pace)*.32s)_var(--gf-eio3),scale_calc(var(--gf-pace)*.32s)_var(--gf-eio3),visibility_0s_calc(var(--gf-pace)*.32s),background-color_calc(var(--gf-pace)*.6s)_var(--gf-eo4),box-shadow_calc(var(--gf-pace)*.6s)_var(--gf-eo4)] data-open:visible data-open:scale-100 data-open:opacity-100 data-open:[translate:0_0]! data-open:[transition:opacity_calc(var(--gf-pace)*.3s)_var(--gf-eo4),translate_calc(var(--gf-pace)*.48s)_var(--gf-eo5),scale_calc(var(--gf-pace)*.48s)_var(--gf-eo5),visibility_0s,background-color_calc(var(--gf-pace)*.6s)_var(--gf-eo4),box-shadow_calc(var(--gf-pace)*.6s)_var(--gf-eo4)]";
// items follow the menu in from the same side, one after another
const MENU_ITEM_MOTION =
  "opacity-0 blur-[2px] group-data-[v=up]/menu:[translate:0_10px] group-data-[v=down]/menu:[translate:0_-10px] [transition:color_calc(var(--gf-pace)*.5s)_var(--gf-eo4),opacity_calc(var(--gf-pace)*.18s)_var(--gf-eio3),translate_calc(var(--gf-pace)*.24s)_var(--gf-eio3),filter_calc(var(--gf-pace)*.2s)_var(--gf-eio3)] group-data-open/menu:opacity-100 group-data-open/menu:blur-none group-data-open/menu:[translate:0_0]! group-data-open/menu:[transition:color_calc(var(--gf-pace)*.5s)_var(--gf-eo4),opacity_calc(var(--gf-pace)*.34s)_var(--gf-eo4)_var(--gf-delay),translate_calc(var(--gf-pace)*.46s)_var(--gf-eo5)_var(--gf-delay),filter_calc(var(--gf-pace)*.4s)_var(--gf-eo4)_var(--gf-delay)]";
const KEY =
  "group/key absolute bottom-[22px] z-12 box-border grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full border-0 p-0 outline-none hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--gf-accent) aria-expanded:text-white";
const KEY_MOVE = "transition-[scale,opacity,rotate] duration-[calc(var(--gf-pace)*400ms)] ease-(--gf-eo4)";
const BURGER_LINE = "transition-[translate,rotate,opacity] duration-[calc(var(--gf-pace)*300ms)] ease-(--gf-eo4) [transform-box:fill-box] origin-center";

const LABEL_PLACEMENT: Record<NonNullable<GlassFolderProps["labelPlacement"]>, string> = {
  "bottom-left": "bottom-8 left-7",
  "top-left": "top-[34px] left-7",
  "top-right": "top-[52px] right-8 items-start",
};

// Dark and light glass cross-fade instead of snapping: gradients swap by fading a
// second layer, flat colours transition directly
const TONE_FADE = "transition-opacity duration-[calc(var(--gf-pace)*600ms)] ease-(--gf-eo4)";
const TONE_COLOR = "transition-colors duration-[calc(var(--gf-pace)*600ms)] ease-(--gf-eo4)";

/** Two stacked backgrounds, the dark one fading in over the light one. */
function ToneLayers({ dark, light, night, className }: { dark: boolean; light: string; night: string; className?: string }) {
  return (
    <>
      <span aria-hidden="true" className={cx("pointer-events-none absolute inset-0 rounded-[inherit]", light, className)} />
      <span
        aria-hidden="true"
        className={cx("pointer-events-none absolute inset-0 rounded-[inherit]", night, TONE_FADE, dark ? "opacity-100" : "opacity-0", className)}
      />
    </>
  );
}

// Both keys are the same solid circle; the accent fills it on hover and while the menu is open
const KEY_SURFACE = {
  light: "bg-[radial-gradient(120%_90%_at_50%_0%,#34302c_0%,#0f0d0c_55%,#050505_100%)]",
  dark: "bg-[radial-gradient(120%_90%_at_50%_0%,#fffdfa_0%,#f3efe9_55%,#d9d2c7_100%)]",
};
const KEY_LOOK: Record<"dark" | "light", string> = {
  light:
    "text-[#f3efe9] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-3px_8px_rgba(0,0,0,0.7),0_0_0_1px_rgba(0,0,0,0.75),0_14px_22px_-8px_rgba(0,0,0,0.55)]",
  dark: "text-[#0b0b0b] shadow-[inset_0_1px_0_#fff,inset_0_-3px_8px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.4),0_14px_22px_-8px_rgba(0,0,0,0.7)]",
};

const DEFAULT_FILES: GlassFolderFile[] = [
  { name: "Launch reel", meta: "MP4, 38 MB", art: "aurora" },
  { name: "Moodboard", meta: "24 images", art: "dusk" },
  { name: "Motion spec.pdf", meta: "1.2 MB" },
];

const pad3 = (n: number) => String(n).padStart(3, "0");
const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

// Preview: a chosen file comes out of the folder into a modal at the centre of
// the screen. Arrows, swipes and the arrow keys move through the folder's files;
// Escape, the cross or a press on the backdrop puts it back.

const SWIPE_PX = 50;
const PREVIEW_W = 720;
const PREVIEW_H = Math.round((PREVIEW_W * SHEET_H) / SHEET_W);
const NAV_BUTTON =
  "absolute top-1/2 z-1 grid size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/25 bg-white/10 p-0 text-white backdrop-blur-md transition-colors duration-200 outline-none hover:border-(--gf-accent) hover:bg-(--gf-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gf-accent) max-md:size-10";
const SLIDE = "absolute inset-0";
// Caption cells share one grid cell, so the old and new text sit on top of each other
const CAPTION_CELL = "col-start-1 row-start-1 truncate";
const CAPTION_OUT = "animate-[gf-caption-out_calc(var(--gf-pace)*.2s)_var(--gf-ei3)_both]";
const CAPTION_IN = "animate-[gf-caption-in_calc(var(--gf-pace)*.3s)_var(--gf-eo4)_calc(var(--gf-pace)*.15s)_both]";
const ROLL = {
  inNext: "animate-[gf-roll-in-next_calc(var(--gf-pace)*.4s)_var(--gf-eo4)_both]",
  inPrev: "animate-[gf-roll-in-prev_calc(var(--gf-pace)*.4s)_var(--gf-eo4)_both]",
  outNext: "animate-[gf-roll-out-next_calc(var(--gf-pace)*.4s)_var(--gf-eo4)_both]",
  outPrev: "animate-[gf-roll-out-prev_calc(var(--gf-pace)*.4s)_var(--gf-eo4)_both]",
};

// written out in full so Tailwind can find them
const SLIDE_IN = {
  next: "animate-[gf-slide-in-next_calc(var(--gf-pace)*.5s)_var(--gf-eo4)_both]",
  prev: "animate-[gf-slide-in-prev_calc(var(--gf-pace)*.5s)_var(--gf-eo4)_both]",
};
const SLIDE_OUT = {
  next: "animate-[gf-slide-out-next_calc(var(--gf-pace)*.5s)_var(--gf-eo4)_both]",
  prev: "animate-[gf-slide-out-prev_calc(var(--gf-pace)*.5s)_var(--gf-eo4)_both]",
};

/** What a file looks like at full size: its picture, its artwork, or a sheet of paper. */
function PreviewFace({ file }: { file: GlassFolderFile }) {
  if (file.image) {
    return <img src={file.image} alt={file.name} draggable={false} className="absolute inset-0 size-full object-cover" />;
  }
  if (file.art) {
    return (
      <ArtCanvas
        className="absolute inset-0 size-full max-w-none opacity-0 transition-opacity duration-500 data-ready:opacity-100"
        art={file.art}
        seed={hashString(file.name) % 997}
        w={PREVIEW_W}
        h={PREVIEW_H}
        density={1}
        priority={0}
      />
    );
  }
  return (
    <span aria-hidden="true" className="absolute top-[14%] right-[6%] left-[6%] flex flex-col gap-[4%]">
      {PAPER_LINES.map((lineWidth, i) => (
        <i key={i} style={{ width: lineWidth }} className="block h-2.5 rounded-sm bg-[#f3efe9]/10 first:mb-2 first:h-4 first:bg-[#f3efe9]/20" />
      ))}
    </span>
  );
}

function FilePreview({
  files,
  index,
  onIndexChange,
  onClose,
  onRemove,
  reduced,
  style,
}: {
  files: GlassFolderFile[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Present when files can be removed from the thumbnails. */
  onRemove?: (index: number) => void;
  /** Reduced motion: files swap in place, with nothing sliding. */
  reduced: boolean;
  style: CSSVars;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  const swipeFrom = useRef<number | null>(null);
  // the file on its way out, and which way the strip is moving (1 = towards the next file)
  const [outgoing, setOutgoing] = useState<{ index: number; direction: number } | null>(null);
  // how far the current file follows the finger during a swipe, in px
  const [drag, setDrag] = useState(0);
  const file = files[index];
  const many = files.length > 1;

  const go = useCallback(
    (step: number) => {
      if (!many) return;
      if (!reduced) setOutgoing({ index, direction: step });
      onIndexChange((index + step + files.length) % files.length);
    },
    [many, index, files.length, onIndexChange, reduced],
  );

  // a thumbnail jumps straight there, sliding from whichever side it sits on
  const jump = (target: number) => {
    if (target === index) return;
    if (!reduced) setOutgoing({ index, direction: target > index ? 1 : -1 });
    onIndexChange(target);
  };

  const remove = (target: number) => {
    setOutgoing(null);
    onRemove?.(target);
  };

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // the page holds still behind the preview, and scrolls again once it closes
  useEffect(() => {
    lenis?.stop();
    return () => lenis?.start();
  }, [lenis]);

  // capture phase, so Escape closes the preview before the folder sees it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [go, onClose]);

  if (!file) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
      data-reduced={reduced || undefined}
      aria-label={`${file.name}, ${index + 1} of ${files.length}`}
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-[5vw] backdrop-blur-md animate-[gf-fade_calc(var(--gf-pace)*.3s)_var(--gf-eo4)_both] data-reduced:animate-none data-reduced:**:animate-none! data-reduced:**:transition-none!"
      style={style}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="group/close absolute top-6 right-6 grid size-11 cursor-pointer place-items-center rounded-full border border-white/25 bg-white/10 p-0 text-white backdrop-blur-md transition-colors duration-200 outline-none hover:border-(--gf-accent) hover:bg-(--gf-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gf-accent)"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] transition-[rotate] duration-[calc(var(--gf-pace)*400ms)] ease-(--gf-eo4) group-hover/close:rotate-90"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="relative flex w-full max-w-[720px] flex-col items-center gap-5">
        <div
          className="relative w-full touch-pan-y select-none"
          onPointerDown={(e) => {
            swipeFrom.current = e.clientX;
          }}
          onPointerMove={(e) => {
            if (swipeFrom.current !== null) setDrag(e.clientX - swipeFrom.current);
          }}
          onPointerUp={(e) => {
            if (swipeFrom.current === null) return;
            const dx = e.clientX - swipeFrom.current;
            swipeFrom.current = null;
            setDrag(0);
            if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
          }}
          onPointerCancel={() => {
            swipeFrom.current = null;
            setDrag(0);
          }}
        >
          {/* the strip: the old file slides out one side as the new one slides in from the other */}
          <div className="relative aspect-[272/184] w-full overflow-hidden rounded-md bg-linear-to-b from-[#24211f] to-[#141210] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] animate-[gf-come-out_calc(var(--gf-pace)*.5s)_var(--gf-eo4)_both]">
            {outgoing ? (
              <div
                key={`out-${outgoing.index}`}
                aria-hidden="true"
                className={cx(
                  SLIDE,
                  outgoing.direction > 0 ? SLIDE_OUT.next : SLIDE_OUT.prev,
                )}
                onAnimationEnd={() => setOutgoing(null)}
              >
                <PreviewFace file={files[outgoing.index]} />
              </div>
            ) : null}
            <div
              key={index}
              className={cx(
                SLIDE,
                drag === 0 && "transition-[translate] duration-300 ease-(--gf-eo4)",
                outgoing && (outgoing.direction > 0 ? SLIDE_IN.next : SLIDE_IN.prev),
              )}
              style={{ translate: `${drag}px 0` }}
            >
              <PreviewFace file={file} />
            </div>
          </div>

          {many ? (
            <>
              <button type="button" aria-label="Previous file" onClick={() => go(-1)} className={cx(NAV_BUTTON, "-left-6 max-md:left-2")}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button type="button" aria-label="Next file" onClick={() => go(1)} className={cx(NAV_BUTTON, "-right-6 max-md:right-2")}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : null}
        </div>

        {/* the caption: the name and meta cross-fade, the number rolls the way the strip moves */}
        <div className="flex w-full items-baseline justify-between gap-4 text-[#f3efe9]">
          <span className="grid min-w-0 text-base font-medium tracking-[-0.01em]">
            {outgoing ? (
              <span key={`out-${outgoing.index}`} aria-hidden="true" className={cx(CAPTION_CELL, CAPTION_OUT)}>
                {files[outgoing.index]?.name}
              </span>
            ) : null}
            <span key={index} className={cx(CAPTION_CELL, outgoing && CAPTION_IN)}>
              {file.name}
            </span>
          </span>
          <span className="flex flex-none items-baseline gap-1.5 font-mono text-xs tracking-[0.02em] text-[#f3efe9]/55">
            {file.meta ? (
              <span className="grid">
                {outgoing && files[outgoing.index]?.meta ? (
                  <span key={`out-${outgoing.index}`} aria-hidden="true" className={cx(CAPTION_CELL, CAPTION_OUT)}>
                    {files[outgoing.index].meta}
                  </span>
                ) : null}
                <span key={index} className={cx(CAPTION_CELL, outgoing && CAPTION_IN)}>
                  {file.meta}
                </span>
              </span>
            ) : null}
            {file.meta ? <span aria-hidden="true">·</span> : null}
            <span className="grid overflow-hidden tabular-nums">
              {outgoing ? (
                <span
                  key={`out-${outgoing.index}`}
                  aria-hidden="true"
                  className={cx(CAPTION_CELL, outgoing.direction > 0 ? ROLL.outNext : ROLL.outPrev)}
                >
                  {outgoing.index + 1}
                </span>
              ) : null}
              <span key={index} className={cx(CAPTION_CELL, outgoing && (outgoing.direction > 0 ? ROLL.inNext : ROLL.inPrev))}>
                {index + 1}
              </span>
            </span>
            <span>/ {files.length}</span>
          </span>
        </div>

        {many || onRemove ? (
          <div role="list" aria-label="All files" className="flex max-w-full gap-2 overflow-x-auto px-1 py-1.5 [scrollbar-width:none]">
            {files.map((thumb, i) => (
              <div key={`${thumb.name}-${i}`} role="listitem" className="group/thumb relative h-12 w-[71px] flex-none overflow-hidden rounded-sm">
                <button
                  type="button"
                  aria-label={`Show ${thumb.name}`}
                  aria-current={i === index || undefined}
                  onClick={() => jump(i)}
                  className={cx(
                    "absolute inset-0 cursor-pointer overflow-hidden rounded-sm border-0 bg-linear-to-b from-[#24211f] to-[#141210] p-0 outline-none transition-[opacity,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gf-accent)",
                    i === index ? "opacity-100 shadow-[inset_0_0_0_2px_var(--gf-accent)]" : "opacity-55 hover:opacity-100",
                  )}
                >
                  {thumb.image ? (
                    <img src={thumb.image} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
                  ) : thumb.art ? (
                    <ArtCanvas
                      className="absolute inset-0 size-full max-w-none"
                      art={thumb.art}
                      seed={hashString(thumb.name) % 997}
                      w={71}
                      h={48}
                      density={1.5}
                      priority={1}
                    />
                  ) : (
                    <span aria-hidden="true" className="absolute top-2 right-2 left-2 flex flex-col gap-1">
                      <i className="block h-1 w-4/5 rounded-full bg-[#f3efe9]/25" />
                      <i className="block h-1 w-3/5 rounded-full bg-[#f3efe9]/15" />
                    </span>
                  )}
                </button>
                {onRemove ? (
                  <>
                    {/* hover lays a backdrop over the thumbnail and brings up the delete */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-black/55 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover/thumb:opacity-100 group-has-focus-visible/thumb:opacity-100"
                    />
                    <button
                      type="button"
                      aria-label={`Delete ${thumb.name}`}
                      onClick={() => remove(i)}
                      className={cx(
                        REMOVE_BUTTON,
                        "absolute top-1/2 left-1/2 -translate-1/2 scale-75 opacity-0 group-hover/thumb:scale-100 group-hover/thumb:opacity-100 focus-visible:scale-100 focus-visible:opacity-100",
                      )}
                    >
                      <TrashIcon />
                    </button>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export default function GlassFolder({
  label = "Vault assets",
  meta,
  tone: toneProp = "dark",
  art: artProp = "vault",
  seed = 3,
  image,
  files: initialFiles = DEFAULT_FILES,
  action = "add",
  onAdd,
  onFilesChange,
  menu = [],
  renamable = false,
  customizable = false,
  onArtChange,
  onToneChange,
  tilt = 8,
  radius = 22,
  fileRadius = 6,
  rimColor,
  rimWidth = 2.4,
  glassBlur = 22,
  shadow = true,
  onRename,
  shareUrl,
  onShare,
  onDelete,
  labelPlacement = "bottom-left",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onFileSelect,
  preview = true,
  removable = false,
  onFileRemove,
  maxVisible = 4,
  emptyText = "No files yet",
  size = "md",
  width: widthProp,
  accentColor = "#ff5f00",
  duration = 1,
  appear = true,
  appearDelay = 0,
  className,
  style,
}: GlassFolderProps) {
  const uid = useId().replace(/:/g, "");
  const reduceMotion = usePrefersReducedMotion();
  const pace = Math.max(0.1, duration);

  const rootRef = useRef<HTMLDivElement>(null);
  const filesRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const keyRef = useRef<HTMLButtonElement>(null);
  const addKeyRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  // each file keeps a stable id, so a newly added file is the only one that animates in
  const [entries, setEntries] = useState(() => initialFiles.map((file, id) => ({ id, file })));
  const files = entries.map((entry) => entry.file);
  const nextId = useRef(initialFiles.length);
  const [dropped, setDropped] = useState<number | null>(null);
  const [bump, setBump] = useState(0);

  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [entered, setEntered] = useState(!appear);

  // the title follows `label`, but a rename can change it in between
  const [title, setTitle] = useState(label);
  // artwork and glass follow their props too, but Customize can change them in between
  const [art, setArt] = useState<GlassFolderArt>(artProp);
  const [tone, setTone] = useState(toneProp);
  const [syncedLook, setSyncedLook] = useState({ art: artProp, tone: toneProp });
  if (artProp !== syncedLook.art || toneProp !== syncedLook.tone) {
    setSyncedLook({ art: artProp, tone: toneProp });
    setArt(artProp);
    setTone(toneProp);
  }
  const [customizing, setCustomizing] = useState(false);
  // where the menu opens from its key: up or down, and growing left or right
  const [placement, setPlacement] = useState<{ v: "up" | "down"; h: "left" | "right" }>({ v: "up", h: "left" });
  const [syncedLabel, setSyncedLabel] = useState(label);
  if (label !== syncedLabel) {
    setSyncedLabel(label);
    setTitle(label);
  }
  const [renaming, setRenaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  // hover and focus-within, so the folder picks its motion state in one place
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // the menu's sliding pill: where it sits, and whether it glides there or fades in
  const [pill, setPill] = useState({ index: -1, top: 0, height: 0, on: false, glide: false });
  const pillRelease = useRef(0);

  const width = widthProp ?? GLASS_FOLDER_SIZES[size];
  const k = width / W;
  const dpr = useSyncExternalStore(subscribeNever, readDpr, () => 1);
  const density = dpr * k;

  // ---- entrance: assemble the first time the folder is on screen ----------
  useEffect(() => {
    if (!appear) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined" || reduceMotion) {
      setEntered(true);
      return;
    }
    let t = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        t = window.setTimeout(() => setEntered(true), appearDelay);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [appear, appearDelay, reduceMotion]);

  // ---- pointer: light and parallax follow the cursor, no re-renders -------
  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduceMotion) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    const write = () => {
      raf = 0;
      el.style.setProperty("--gf-px", px.toFixed(3));
      el.style.setProperty("--gf-py", py.toFixed(3));
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    };
    const leave = () => {
      px = 0;
      py = 0;
      if (!raf) raf = requestAnimationFrame(write);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  useEffect(() => {
    filesRef.current?.toggleAttribute("inert", !open);
  }, [open]);


  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === open) return;
    prevOpen.current = open;
    if (reduceMotion) return;
    const sheets = Array.from(filesRef.current?.querySelectorAll<HTMLElement>(".gf-sheet") ?? []);
    const n = sheets.length;
    sheets.forEach((el, v) => {
      const depth = n - 1 - v;
      el.animate(
        open
          ? [{ filter: "blur(0px)" }, { filter: "blur(3.5px)", offset: 0.18 }, { filter: "blur(0px)" }]
          : [{ filter: "blur(0px)" }, { filter: "blur(4px)", offset: 0.75 }, { filter: "blur(0px)" }],
        {
          duration: (open ? 530 : 340) * pace,
          delay: (open ? depth * 32 : v * 12) * pace,
          easing: "linear",
        },
      );
    });
  }, [open, reduceMotion, pace]);


  useEffect(() => {
    // the preview owns Escape and outside presses while it's up
    if ((!open && !menuOpen) || previewIndex !== null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuOpen) {
        setMenuOpen(false);
        keyRef.current?.focus();
      } else {
        setOpen(false);
        hitRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menuOpen && !menuRef.current?.contains(t) && !keyRef.current?.contains(t)) setMenuOpen(false);
      if (open && !menuOpen && !rootRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, menuOpen, setOpen, previewIndex]);

  // focus the first menu item when the menu opens
  useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector<HTMLElement>("[role^=menuitem]")?.focus();
  }, [menuOpen, customizing]);

  // the rename field takes focus with its text selected
  useEffect(() => {
    if (!renaming) return;
    renameRef.current?.focus();
    renameRef.current?.select();
  }, [renaming]);

  // "Link copied" holds for a beat, then the meta line comes back
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(t);
  }, [copied]);

  const addFile = () => {
    const made = onAdd?.(files);
    const file: GlassFolderFile = made || { name: `Untitled ${files.length + 1}`, meta: "Just now" };
    const next = [...files, file];
    const id = nextId.current++;
    setEntries((current) => [...current, { id, file }]);
    setDropped(id);
    setBump((b) => b + 1);
    onFilesChange?.(next);
  };

  const removeFile = (index: number) => {
    const removed = entries[index];
    if (!removed) return;
    const next = entries.filter((_, i) => i !== index);
    setEntries(next);
    // keep the preview on a sensible file, or close it once the folder is empty
    setPreviewIndex((current) => {
      if (current === null || next.length === 0) return null;
      return index < current ? current - 1 : Math.min(current, next.length - 1);
    });
    onFileRemove?.(removed.file, index);
    onFilesChange?.(next.map((entry) => entry.file));
  };

  const commitRename = (save: boolean) => {
    const input = renameRef.current;
    // Enter/Escape unmount the field, which can fire one more blur: ignore it
    if (!input || input.dataset.done) return;
    input.dataset.done = "true";
    const next = input.value.trim();
    setRenaming(false);
    hitRef.current?.focus();
    if (!save || !next || next === title) return;
    setTitle(next);
    onRename?.(next);
  };

  const onRenameKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== "Escape") return;
    e.preventDefault();
    // keep Escape from also closing the folder
    e.nativeEvent.stopImmediatePropagation();
    commitRename(e.key === "Enter");
  };

  const copyLink = (url: string) => {
    navigator.clipboard
      ?.writeText(url)
      .then(() => {
        setCopied(true);
        onShare?.(url);
      })
      .catch(() => {});
  };

  const deleteFolder = () => {
    if (reduceMotion) onDelete?.();
    else setLeaving(true);
  };

  // Prefer up and to the left; flip each axis only when the screen has no room that way
  const placeMenu = () => {
    const key = keyRef.current?.getBoundingClientRect();
    const menu = menuRef.current;
    if (!key || !menu) return;
    const gap = 8 * k;
    const h = menu.offsetHeight * k;
    const w = menu.offsetWidth * k;
    const roomUp = key.top - gap;
    const roomDown = window.innerHeight - key.bottom - gap;
    setPlacement({
      v: roomUp >= h || roomUp >= roomDown ? "up" : "down",
      h: key.right - w >= 0 || key.right >= window.innerWidth - key.left ? "left" : "right",
    });
  };

  const pickArt = (next: GlassFolderArt) => {
    setArt(next);
    onArtChange?.(next);
  };

  const pickTone = (next: "dark" | "light") => {
    setTone(next);
    onToneChange?.(next);
  };

  // `keepOpen` items swap the menu's contents instead of closing it
  const menuItems: (GlassFolderMenuItem & { keepOpen?: boolean })[] = [
    { label: open ? "Close folder" : "Open folder", onSelect: () => setOpen(!open) },
    ...(renamable ? [{ label: "Rename", onSelect: () => setRenaming(true) }] : []),
    ...(shareUrl ? [{ label: "Copy link", onSelect: () => copyLink(shareUrl) }] : []),
    ...menu,
    ...(customizable ? [{ label: "Customize", keepOpen: true, onSelect: () => setCustomizing(true) }] : []),
    ...(onDelete ? [{ label: "Delete folder", danger: true, onSelect: deleteFolder }] : []),
  ];

  const movePill = (item: HTMLElement, index: number) => {
    window.clearTimeout(pillRelease.current);
    setPill((current) => ({ index, top: item.offsetTop, height: item.offsetHeight, on: true, glide: current.on }));
  };

  // a short grace period, so crossing the gap between items doesn't drop the pill
  const releasePill = () => {
    window.clearTimeout(pillRelease.current);
    pillRelease.current = window.setTimeout(() => setPill((current) => ({ ...current, on: false })), PILL_RELEASE_MS);
  };

  useEffect(() => () => window.clearTimeout(pillRelease.current), []);

  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role^=menuitem]") ?? []);
    const at = items.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => {
      e.preventDefault();
      items[(i + items.length) % items.length]?.focus();
    };
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Tab") setMenuOpen(false);
  };

  // the newest files sit at the front of the stack, nearest the glass
  const shown = Math.max(1, Math.round(maxVisible));
  const start = Math.max(0, files.length - shown);
  const visible = entries.slice(start);
  const count = files.length;
  const noun = count === 1 ? " item" : " items";
  const dark = tone === "dark";
  const corner = Math.min(MAX_RADIUS, Math.max(0.01, radius));
  const BACK_PATH = backPath(corner);
  const FRONT_PATH = frontPath(corner);
  const hasAdd = action === "add" || action === "both";
  const hasMore = action === "more" || action === "both";
  const stageTransform = `translateY(${HEADROOM * k}px) scale(${k})`;

  const motionState = open ? "open" : hovered || focused ? "hover" : "rest";
  const rootStyle: CSSVars = {
    "--gf-eo3": EO3,
    "--gf-eo4": EO4,
    "--gf-ei3": EI3,
    "--gf-eio3": EIO3,
    "--gf-pop": POP,
    "--gf-eo5": EO5,
    "--gf-tilt": tilt,
    "--gf-file-radius": `${fileRadius}px`,
    "--gf-rim": rimWidth,
    "--gf-glass-blur": `${glassBlur}px`,
    ...MOTION_STATES[motionState],
    width,
    height: (H + HEADROOM) * k,
    "--gf-accent": accentColor,
    "--gf-pace": pace,
    ...style,
  };

  return (
    <div
      ref={rootRef}
      className={cx(
        "group/gf relative isolate z-0 inline-block data-raised:z-50 flex-none align-top antialiased [-webkit-tap-highlight-color:transparent] data-leaving:pointer-events-none data-reduced:**:animate-none! data-reduced:**:transition-none!",
        className,
      )}
      data-tone={tone}
      data-open={open || undefined}
      data-pending={!entered || undefined}
      data-leaving={leaving || undefined}
      // reduced motion, from the OS or a simulated matchMedia: every move becomes an instant state change
      data-reduced={reduceMotion || undefined}
      // an open menu or folder sits above its neighbours, so nothing cuts it off
      data-raised={menuOpen || open || undefined}
      style={rootStyle}
      onPointerEnter={(e) => e.pointerType !== "touch" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <style>{GF_KEYFRAMES}</style>
      <div className="absolute top-0 left-0 h-[272px] w-[340px] origin-top-left" style={{ transform: stageTransform }}>
        <div
          className="absolute inset-0 [transform:perspective(1400px)_rotateX(calc(var(--gf-py)*var(--gf-tilt)*-0.75deg))_rotateY(calc(var(--gf-px)*var(--gf-tilt)*1deg))] transition-transform duration-[calc(var(--gf-pace)*600ms)] ease-(--gf-eo3) group-data-leaving/gf:animate-[gf-leave_calc(var(--gf-pace)*.36s)_var(--gf-ei3)_forwards] group-data-reduced/gf:transform-none"
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget && e.animationName === "gf-leave") onDelete?.();
          }}
        >
          {shadow ? (
          <div
            aria-hidden="true"
            className={cx(
              "absolute right-[14px] -bottom-3 left-[14px] h-[64px] rounded-[40px] blur-[24px] [transform:translateX(calc(var(--gf-px)*-8px))] [transition:transform_calc(var(--gf-pace)*.6s)_var(--gf-eo3),opacity_calc(var(--gf-pace)*.66s)_var(--gf-eo5),background-color_calc(var(--gf-pace)*.6s)_var(--gf-eo4)] group-data-pending/gf:opacity-0",
              dark ? "bg-black/90" : "bg-[rgba(16,12,8,0.45)]",
            )}
          />
          ) : null}

          {/* back panel and its artwork */}
          <div
            aria-hidden="true"
            className={cx(
              "absolute inset-0 overflow-hidden",
              ENTER_BACK,
            )}
            style={{ clipPath: `path('${BACK_PATH}')` }}
          >
            <ToneLayers dark={dark} light="bg-linear-to-b from-[#f6f3ee] to-[#e6e0d6]" night="bg-linear-to-b from-[#1c1a18] to-[#050505]" />
            {image ? (
              <img className={BACK_ART} src={image} alt="" width={W + 24} height={H + 24} draggable={false} />
            ) : art !== "none" ? (
              <ArtCanvas
                className={cx(BACK_ART, "opacity-0 blur-[14px] data-ready:opacity-100 data-ready:blur-none")}
                art={art}
                seed={seed}
                w={W + 24}
                h={H + 24}
                density={density}
                priority={0}
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,transparent_22%),radial-gradient(120%_80%_at_80%_0%,rgba(255,255,255,0.14),transparent_60%)]" />
          </div>
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${W} ${H}`}
            className={cx(
              "pointer-events-none absolute top-0 left-0 h-[272px] w-[340px] max-w-none overflow-visible fill-none",
              ENTER_BACK,
              !rimColor && (dark ? "stroke-white/15" : "stroke-white/45"),
            )}
            style={rimColor ? { stroke: rimColor, strokeOpacity: dark ? 0.35 : 0.6 } : undefined}
          >
            <path d={BACK_PATH} style={{ strokeWidth: Math.min(1, rimWidth) }} />
          </svg>

          {/* the frosted front panel, hinged on its bottom edge */}
          <div
            key={bump}
            className={cx(
              "group/front absolute top-[74px] left-0 z-10 h-[198px] w-[340px] origin-bottom [-webkit-backdrop-filter:blur(var(--gf-glass-blur))_saturate(1.5)] [backdrop-filter:blur(var(--gf-glass-blur))_saturate(1.5)]",
              "[transform:perspective(760px)_rotateX(var(--gf-hinge))] [transition:transform_calc(var(--gf-pace)*var(--gf-hinge-t))_var(--gf-hinge-ease),translate_calc(var(--gf-pace)*.66s)_var(--gf-eo5)_calc(var(--gf-pace)*.04s),opacity_calc(var(--gf-pace)*.4s)_var(--gf-eo5)_calc(var(--gf-pace)*.04s)]",
              "group-data-pending/gf:[translate:0_36px] group-data-pending/gf:opacity-0",
              // the pocket gives under the file as it lands, then settles. No overshoot.
              bump > 0 && "animate-[gf-bump_calc(var(--gf-pace)*.34s)_var(--gf-eo3)_calc(var(--gf-pace)*.26s)_both]",
            )}
            style={{ clipPath: `path('${FRONT_PATH}')` }}
          >
            {/* the tint crossfades through clear glass rather than through both at once */}
            <span
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,253,250,0.16)_0%,rgba(250,247,242,0.5)_42%,rgba(243,239,233,0.94)_100%)]",
                TONE_FADE,
                dark ? "opacity-0" : "opacity-100",
              )}
            />
            <span
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0.16)_0%,rgba(10,9,8,0.6)_46%,rgba(5,5,5,0.95)_100%)]",
                TONE_FADE,
                dark ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-0 bg-[radial-gradient(260px_200px_at_calc(50%_+_var(--gf-px)*46%)_calc(30%_+_var(--gf-py)*40%),rgba(255,255,255,0.5),transparent_70%)]",
                dark ? "opacity-15 mix-blend-screen" : "opacity-90 mix-blend-soft-light",
              )}
            />
            <svg
              aria-hidden="true"
              viewBox={`0 0 ${W} ${FRONT_H}`}
              className={cx(
                "pointer-events-none absolute top-0 left-0 h-[198px] w-[340px] max-w-none overflow-visible fill-none",
                dark && "opacity-50",
              )}
            >
              <defs>
                <linearGradient id={`gf-rim-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={rimColor ?? "#fff"} stopOpacity="0.95" />
                  <stop offset="0.35" stopColor={rimColor ?? "#fff"} stopOpacity="0.35" />
                  <stop offset="1" stopColor={rimColor ?? "#fff"} stopOpacity="0.12" />
                </linearGradient>
              </defs>
              <path
                d={FRONT_PATH}
                stroke={`url(#gf-rim-${uid})`}
                className="[stroke-width:var(--gf-rim)] transition-[stroke-width] duration-200 group-has-[.gf-hit:focus-visible]/front:[stroke-width:max(5px,calc(var(--gf-rim)*2px))]"
              />
            </svg>
            <button
              ref={hitRef}
              type="button"
              className="gf-hit absolute inset-0 z-1 cursor-pointer border-0 bg-transparent p-0 outline-none"
              aria-expanded={open}
              aria-label={`${open ? "Close" : "Open"} ${title}, ${count}${noun}`}
              onClick={() => {
                setMenuOpen(false);
                setOpen(!open);
              }}
            />
            <div
              className={cx(
                "pointer-events-none absolute z-2 flex max-w-[200px] flex-col gap-[5px]",
                TONE_COLOR,
                dark ? "text-[#f3efe9]" : "text-[#0b0b0b]",
                LABEL_PLACEMENT[labelPlacement],
              )}
            >
              {renaming ? (
                <input
                  ref={renameRef}
                  className={cx(TITLE, "pointer-events-auto w-[200px] border-0 border-b-[1.5px] border-(--gf-accent) bg-transparent p-0 text-inherit caret-(--gf-accent) outline-none")}
                  defaultValue={title}
                  aria-label={`Rename ${title}`}
                  maxLength={60}
                  onKeyDown={onRenameKey}
                  onBlur={() => commitRename(true)}
                />
              ) : (
                <span
                  className={cx(
                    TITLE,
                    "decoration-(--gf-accent) decoration-2 underline-offset-[5px] group-has-[.gf-hit:focus-visible]/front:underline",
                  )}
                >
                  {title}
                </span>
              )}
              {copied ? (
                <span role="status" className={cx(META, META_CHANGED, "tracking-[-0.02em]")}>
                  Link copied
                </span>
              ) : meta ? (
                <span className={META}>{meta}</span>
              ) : (
                <span key={count} className={cx(META, bump > 0 && META_CHANGED)}>
                  <span className="gf-count">{pad3(count)}</span>
                  {noun}
                </span>
              )}
            </div>
          </div>

          {/* the contents: after the glass in tab order, beneath it on screen */}
          <div
            ref={filesRef}
            role="list"
            aria-label={`${title} contents`}
            className="pointer-events-none absolute inset-0 z-5 [clip-path:inset(-400px_-400px_10px_-400px)]"
          >
            {visible.length === 0 ? (
              // an empty pocket: a dashed outline where the first file will land
              <div
                role="listitem"
                className={cx(
                  "absolute top-24 left-[34px] grid h-[184px] w-[272px] place-items-center rounded-[var(--gf-file-radius)] border-[1.5px] border-dashed text-[13px] tracking-[-0.01em]",
                  dark ? "border-[#f3efe9]/30 bg-[#f3efe9]/5 text-[#f3efe9]/70" : "border-black/25 bg-white/40 text-black/55",
                  SHEET_MOTION,
                )}
                style={{ "--gf-slot": 0, "--gf-depth": 0, "--gf-rdepth": 0, "--gf-jx": "0px", "--gf-jr": "0deg" } as CSSVars}
              >
                <span className="-translate-y-6">{emptyText}</span>
              </div>
            ) : null}
            {visible.map(({ id, file }, v) => {
              const slot = visible.length <= 1 ? 0 : (v / (visible.length - 1)) * 2 - 1;
              const jitter = rng(hashString(file.name) + id);
              const picture = !!(file.art || file.image);
              const inkDark = dark || picture;
              const inner = (
                <>
                  {picture ? null : (
                    <span
                      aria-hidden="true"
                      className={cx("pointer-events-none absolute inset-0 bg-linear-to-b from-[#24211f] to-[#141210]", TONE_FADE, dark ? "opacity-100" : "opacity-0")}
                    />
                  )}
                  {file.image ? (
                    <img className={SHEET_ART} src={file.image} alt="" width={SHEET_W} height={SHEET_H} draggable={false} />
                  ) : file.art ? (
                    <ArtCanvas
                      className={cx(SHEET_ART, "opacity-0 blur-[10px] data-ready:opacity-100 data-ready:blur-none")}
                      art={file.art}
                      seed={hashString(file.name) % 997}
                      w={SHEET_W}
                      h={SHEET_H}
                      density={Math.min(density, 1.25)}
                      priority={1}
                    />
                  ) : (
                    <span aria-hidden="true" className="absolute top-10 right-3.5 left-3.5 flex flex-col gap-[9px]">
                      {PAPER_LINES.map((lineWidth, i) => (
                        <i
                          key={i}
                          style={{ width: lineWidth }}
                          className={cx(
                            "block h-[5px] rounded-[3px] first:mb-1 first:h-[9px]",
                            dark ? "bg-[#f3efe9]/8 first:bg-[#f3efe9]/16" : "bg-black/8 first:bg-black/14",
                          )}
                        />
                      ))}
                    </span>
                  )}
                  <span className="absolute top-[11px] right-3.5 left-3.5 z-1 flex items-baseline justify-between gap-2.5 whitespace-nowrap">
                    <span
                      className={cx(
                        "truncate text-[12.5px] font-medium tracking-[-0.01em]",
                        inkDark ? "text-[#f3efe9]" : "text-[#0b0b0b]",
                      )}
                    >
                      {file.name}
                    </span>
                    {file.meta ? (
                      <span className={cx("flex-none font-mono text-[10px] tracking-[0.02em]", inkDark ? "text-[#f3efe9]/65" : "text-black/50")}>
                        {file.meta}
                      </span>
                    ) : null}
                  </span>
                </>
              );
              const sheetStyle: CSSVars = {
                "--gf-slot": slot,
                "--gf-depth": visible.length - 1 - v,
                "--gf-rdepth": v,
                "--gf-jx": `${((jitter() - 0.5) * 10).toFixed(2)}px`,
                "--gf-jr": `${((jitter() - 0.5) * 3.2).toFixed(2)}deg`,
                zIndex: v + 1,
              };
              const common = {
                className: cx(
                  "gf-sheet group/sheet pointer-events-auto absolute top-24 left-[34px] box-border block h-[184px] w-[272px] origin-bottom overflow-hidden rounded-[var(--gf-file-radius)] has-[.gf-sheet-action:focus-visible]:outline-2 has-[.gf-sheet-action:focus-visible]:outline-offset-2 has-[.gf-sheet-action:focus-visible]:outline-(--gf-accent)",
                  picture
                    ? "bg-[#141210] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-linear-to-b after:from-black/45 after:to-transparent after:to-35% after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] after:content-['']"
                    : "bg-linear-to-b from-[#fdfcfa] to-[#f0ebe3]",
                  dark
                    ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_0.5px_rgba(255,255,255,0.08),0_12px_28px_-8px_rgba(0,0,0,0.75)]"
                    : "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_0.5px_rgba(0,0,0,0.1),0_10px_26px_-8px_rgba(10,8,6,0.3)]",
                  SHEET_MOTION,
                  id === dropped && SHEET_DROP,
                ),
                style: sheetStyle,
                onAnimationEnd:
                  id === dropped
                    ? (e: React.AnimationEvent) => {
                        if (e.animationName === "gf-drop") setDropped(null);
                      }
                    : undefined,
              };
              return (
                <div key={id} role="listitem" {...common}>
                  {file.href ? (
                    <a className={SHEET_ACTION} href={file.href} onClick={() => onFileSelect?.(file, start + v)}>
                      {inner}
                    </a>
                  ) : (
                    <button
                      type="button"
                      className={SHEET_ACTION}
                      onClick={() => {
                        onFileSelect?.(file, start + v);
                        if (preview) setPreviewIndex(start + v);
                      }}
                    >
                      {inner}
                    </button>
                  )}
                  {removable ? (
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => removeFile(start + v)}
                      className={cx(REMOVE_BUTTON, "absolute right-2.5 bottom-2.5 opacity-0 group-hover/sheet:opacity-100 focus-visible:opacity-100")}
                    >
                      <TrashIcon />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          {hasAdd ? (
            <button
              ref={addKeyRef}
              type="button"
              className={cx(KEY, KEY_LOOK[tone], KEY_MOTION, hasMore ? "right-[66px]" : "right-[22px]")}
              aria-label={`Add a file to ${title}`}
              onClick={addFile}
            >
              <ToneLayers dark={dark} light={KEY_SURFACE.light} night={KEY_SURFACE.dark} />
              <KeyFill />
              <svg
                key={bump}
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={cx(
                  "relative z-1 block size-[18px] max-w-none fill-none stroke-current stroke-[1.7] [stroke-linecap:round] group-hover/key:rotate-90",
                  KEY_MOVE,
                  // a new file pops the glyph: scale only, so it never fights the hover rotation
                  bump > 0 && "animate-[gf-pop_calc(var(--gf-pace)*.24s)_var(--gf-pop)_both]",
                )}
              >
                <path d="M12 4.5v15M4.5 12h15" />
              </svg>
            </button>
          ) : null}

          {hasMore ? (
            <button
              ref={keyRef}
              type="button"
              className={cx(KEY, KEY_LOOK[tone], KEY_MOTION, "right-[22px]")}
              aria-label={`More options for ${title}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={`gf-menu-${uid}`}
              onClick={() => {
                // each opening starts without a pill, so it fades in rather than gliding from last time
                setPill((current) => ({ ...current, on: false }));
                setCustomizing(false);
                if (menuOpen) return setMenuOpen(false);
                // settle the direction first, so the closed menu sits on the right side before it travels in
                placeMenu();
                requestAnimationFrame(() => requestAnimationFrame(() => setMenuOpen(true)));
              }}
            >
              <ToneLayers dark={dark} light={KEY_SURFACE.light} night={KEY_SURFACE.dark} />
              <KeyFill />
              {/* a hamburger that folds into a cross while the menu is open */}
              <svg viewBox="0 0 24 24" aria-hidden="true" className="relative z-1 block size-4 max-w-none fill-none stroke-current stroke-[1.8] [stroke-linecap:round]">
                <path d="M4.5 7h15" className={cx(BURGER_LINE, "group-aria-expanded/key:translate-y-[5px] group-aria-expanded/key:rotate-45")} />
                <path d="M4.5 12h15" className={cx(BURGER_LINE, "group-aria-expanded/key:opacity-0")} />
                <path d="M4.5 17h15" className={cx(BURGER_LINE, "group-aria-expanded/key:-translate-y-[5px] group-aria-expanded/key:-rotate-45")} />
              </svg>
            </button>
          ) : null}

          {hasMore ? (
            <div
              ref={menuRef}
              id={`gf-menu-${uid}`}
              role="menu"
              aria-label={`${title} options`}
              data-open={menuOpen || undefined}
              data-v={placement.v}
              data-h={placement.h}
              onKeyDown={onMenuKey}
              onPointerLeave={releasePill}
              className={cx(
                "group/menu absolute z-20 flex min-w-[176px] flex-col rounded-lg p-1.5 backdrop-blur-[24px] backdrop-saturate-[1.6]",
                // direction aware: opens above or below the key, and toward whichever side has room
                "data-[v=up]:bottom-[68px] data-[v=down]:top-[258px] data-[h=left]:right-[22px] data-[h=right]:left-[282px]",
                "data-[v=up]:data-[h=left]:origin-bottom-right data-[v=up]:data-[h=right]:origin-bottom-left data-[v=down]:data-[h=left]:origin-top-right data-[v=down]:data-[h=right]:origin-top-left",
                MENU_MOTION,
                dark
                  ? "bg-[rgba(24,22,20,0.74)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_0.5px_rgba(255,255,255,0.1),0_24px_48px_-16px_rgba(0,0,0,0.8)]"
                  : "bg-[rgba(250,247,242,0.74)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_0.5px_rgba(0,0,0,0.14),0_24px_48px_-16px_rgba(10,8,6,0.4)]",
              )}
            >
              {/* the pill glides between items, the same way as the Vault dropdown menu */}
              <span
                aria-hidden="true"
                className={cx(
                  "pointer-events-none absolute right-1.5 left-1.5 rounded-sm bg-(--gf-accent) duration-[calc(var(--gf-pace)*300ms)] ease-(--gf-eo4)",
                  pill.glide ? "transition-[top,height,opacity]" : "transition-opacity",
                )}
                style={{ top: pill.top, height: pill.height, opacity: pill.on && menuOpen ? 1 : 0 }}
              />
              {customizing ? (
                <div className="relative z-1 flex w-[212px] flex-col gap-3 px-1.5 pt-0.5 pb-2">
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => setCustomizing(false)}
                    className={cx(
                      "flex cursor-pointer items-center gap-1.5 rounded-sm border-0 bg-transparent px-1.5 py-1.5 text-left text-[13.5px] font-[450] outline-none focus-visible:outline-2 focus-visible:outline-(--gf-accent)",
                      dark ? "text-[#f3efe9]" : "text-[#0b0b0b]",
                    )}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]">
                      <path d="M15 5l-7 7 7 7" />
                    </svg>
                    Customize
                  </button>
                  <div role="group" aria-label="Artwork" className="flex flex-col gap-2">
                    <span className={cx("px-1.5 text-[12px] capitalize", TONE_COLOR, dark ? "text-[#f3efe9]/55" : "text-black/50")}>Artwork</span>
                    <div className="flex flex-wrap gap-2 px-1.5">
                      {[...(Object.keys(GLASS_FOLDER_ART) as GlassFolderArtPreset[]), "none" as const].map((option) => (
                        <button
                          key={option}
                          type="button"
                          role="menuitemradio"
                          tabIndex={-1}
                          title={option}
                          aria-label={option}
                          aria-checked={art === option}
                          onClick={() => pickArt(option)}
                          className="size-6 cursor-pointer rounded-full border-0 p-0 ring-1 ring-black/15 outline-none transition-[box-shadow] duration-200 ring-offset-0 aria-checked:ring-2 aria-checked:ring-(--gf-accent) focus-visible:ring-2 focus-visible:ring-(--gf-accent)"
                          style={{
                            background:
                              option === "none"
                                ? dark
                                  ? "linear-gradient(180deg, #1c1a18, #050505)"
                                  : "linear-gradient(180deg, #f6f3ee, #e6e0d6)"
                                : `linear-gradient(135deg, ${GLASS_FOLDER_ART[option].colors.join(", ")})`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div role="group" aria-label="Glass" className="flex flex-col gap-2">
                    <span className={cx("px-1.5 text-[12px] capitalize", TONE_COLOR, dark ? "text-[#f3efe9]/55" : "text-black/50")}>Glass</span>
                    <div
                      className={cx(
                        "relative mx-1.5 flex rounded-sm border p-0.5",
                        TONE_COLOR,
                        dark ? "border-white/15" : "border-black/15",
                      )}
                    >
                      {/* the accent pill slides to the chosen glass */}
                      <span
                        aria-hidden="true"
                        className={cx(
                          "pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-[3px] bg-(--gf-accent) transition-[translate] duration-[calc(var(--gf-pace)*450ms)] ease-(--gf-eo5)",
                          tone === "light" ? "translate-x-full" : "translate-x-0",
                        )}
                      />
                      {(["dark", "light"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          role="menuitemradio"
                          tabIndex={-1}
                          aria-checked={tone === option}
                          onClick={() => pickTone(option)}
                          className={cx(
                            "relative z-1 flex-1 cursor-pointer rounded-[3px] border-0 bg-transparent px-2 py-1.5 text-[12.5px] capitalize outline-none aria-checked:text-white focus-visible:outline-2 focus-visible:outline-(--gf-accent)",
                            TONE_COLOR,
                            dark ? "text-[#f3efe9]/70" : "text-black/60",
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : menuItems.map((item, i) => (
                <button
                  key={`${item.label}-${i}`}
                  type="button"
                  role="menuitem"
                  tabIndex={menuOpen ? -1 : undefined}
                  disabled={!menuOpen}
                  data-pill={(pill.on && pill.index === i) || undefined}
                  style={{ "--gf-delay": `${(110 + i * 40) * pace}ms` } as CSSVars}
                  className={cx(
                    "relative z-1 box-border cursor-pointer rounded-sm border-0 bg-transparent px-3 py-[9px] text-left text-[13.5px] font-[450] tracking-[-0.01em] outline-none data-pill:text-white",
                    MENU_ITEM_MOTION,
                    item.danger ? (dark ? "text-[#ff6b5e]" : "text-[#d92d20]") : dark ? "text-[#f3efe9]" : "text-[#0b0b0b]",
                  )}
                  onPointerEnter={(e) => movePill(e.currentTarget, i)}
                  onFocus={(e) => movePill(e.currentTarget, i)}
                  onClick={() => {
                    if (item.keepOpen) {
                      setPill((current) => ({ ...current, on: false }));
                      item.onSelect?.();
                      return;
                    }
                    setMenuOpen(false);
                    keyRef.current?.focus();
                    item.onSelect?.();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {previewIndex !== null ? (
        <FilePreview
          files={files}
          index={previewIndex}
          onIndexChange={setPreviewIndex}
          onRemove={removable ? removeFile : undefined}
          reduced={reduceMotion}
          onClose={() => {
            setPreviewIndex(null);
            hitRef.current?.focus();
          }}
          style={{ "--gf-accent": accentColor, "--gf-pace": pace, "--gf-eo4": EO4, "--gf-ei3": EI3 }}
        />
      ) : null}
    </div>
  );
}

// Keyframes: the one thing Tailwind classes can't declare from inside a component.
// Everything else is a class above; durations are multiplied by --gf-pace there.

const GF_KEYFRAMES = `
@keyframes gf-drop {
  from { translate: 0 -190px; rotate: -9deg; filter: blur(10px); }
  to { translate: 0 0; rotate: 0deg; filter: blur(0px); }
}
@keyframes gf-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes gf-bump {
  0% { scale: 1; }
  35% { scale: 1.014 .978; }
  100% { scale: 1; }
}
@keyframes gf-roll {
  from { opacity: 0; translate: 0 8px; filter: blur(4px); }
  to { opacity: 1; translate: 0 0; filter: blur(0px); }
}
@keyframes gf-count { 0%, 45% { color: var(--gf-accent); } }
@keyframes gf-pop { from { scale: .5; } to { scale: 1; } }
@keyframes gf-come-out {
  from { opacity: 0; translate: 0 60px; scale: .82; rotate: -3deg; filter: blur(12px); }
}
@keyframes gf-caption-out { to { opacity: 0; } }
@keyframes gf-caption-in { from { opacity: 0; } }
@keyframes gf-roll-in-next { from { translate: 0 100%; } }
@keyframes gf-roll-in-prev { from { translate: 0 -100%; } }
@keyframes gf-roll-out-next { to { translate: 0 -100%; } }
@keyframes gf-roll-out-prev { to { translate: 0 100%; } }
@keyframes gf-slide-in-next { from { translate: 100% 0; } }
@keyframes gf-slide-in-prev { from { translate: -100% 0; } }
@keyframes gf-slide-out-next { to { translate: -100% 0; } }
@keyframes gf-slide-out-prev { to { translate: 100% 0; } }
@keyframes gf-leave { to { opacity: 0; translate: 0 36px; scale: .94; filter: blur(12px); } }
`;
