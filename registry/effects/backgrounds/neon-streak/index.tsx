// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

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

// Shape

type Rgb = [number, number, number];

// Everything is measured in canvas heights, origin at the centre, y up.
// A new trail point is laid down each time the pen travels this far
const SPACING = 0.006;
const MAX_POINTS = 1200;
// How quickly the pen catches up with the pointer, per second. Lower draws rounder curves
const PEN_FOLLOW = 16;
const SUBSTEPS = 4;
// Strands: how far each one weaves off the path, how often they cross (per canvas height of trail),
// how fast they twist, and how bright each is
const STRANDS = [
  { amp: 1.0, freq: 4.6, spin: 0.9, phase: 0.0, gain: 1.0 },
  { amp: 0.85, freq: 5.3, spin: -0.7, phase: 2.2, gain: 0.85 },
  { amp: 1.15, freq: 3.9, spin: 0.55, phase: 4.1, gain: 0.55 },
];
const STRAND_COUNT = STRANDS.length;
const WEAVE = 0.014;
// Half-widths of the three light layers drawn for every strand, in canvas heights, each three
// standard deviations of its Gaussian. The core is a ribbon; the glow and halo are too wide to
// survive a tight curl as ribbons (they fold into spikes), so they're laid down as round soft dots
const CORE_W = 0.005;
const GLOW_W = 0.03;
const HALO_W = 0.12;
// Light each layer adds, sampled from the references: a pink-white core that blooms to white
// where strands overlap, a violet glow, and a wide purple wash that tints the smoke behind it
const CORE_FRESH: Rgb = [2.2, 1.35, 2.2];
const CORE_OLD: Rgb = [1.9, 0.08, 1.9];
const GLOW_FRESH: Rgb = [0.5, 0.16, 1.05];
const GLOW_OLD: Rgb = [0.7, 0.04, 1.0];
const HALO: Rgb = [0.13, 0.04, 0.26];
const MAX_DPR = 1.75;
const FLOATS_PER_VERTEX = 9;
const FLOATS_PER_SPLAT = 4;
// The halo is broad enough that every fifth point of one strand blends into a smooth band
const HALO_STRIDE = 5;

// Shaders

const QUAD_VS = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// The core ribbon is expanded from the path on the GPU, so its thickness is just a uniform
const RIBBON_VS = `#version 300 es
in vec2 aCenter;
in vec2 aNormal;
in float aSide;
in float aWidth;
in float aEnergy;
in float aAge;
in float aEnds;
uniform float uHalfWidth;
uniform float uAspect;
out float vAcross;
out float vEnergy;
out float vAge;
void main() {
  vec2 p = aCenter + aNormal * aSide * uHalfWidth * aWidth;
  vAcross = aSide;
  // a wide layer would end in a hard square cap, so it fades in over its own width from the pen tip
  vEnergy = aEnergy * smoothstep(0.0, uHalfWidth * 1.2, aEnds);
  vAge = aAge;
  gl_Position = vec4(p.x * 2.0 / uAspect, p.y * 2.0, 0.0, 1.0);
}`;

const RIBBON_FS = `#version 300 es
precision highp float;
in float vAcross;
in float vEnergy;
in float vAge;
uniform vec3 uFresh;
uniform vec3 uOld;
out vec4 outColor;
void main() {
  // the ribbon spans 3 sigma each side, so this is a Gaussian cross-section
  float a = vAcross * 3.0;
  float profile = exp(-0.5 * a * a);
  vec3 col = mix(uFresh, uOld, smoothstep(0.25, 1.0, vAge));
  outColor = vec4(col * profile * vEnergy, 1.0);
}`;

const SPLAT_VS = `#version 300 es
in vec2 aCenter;
in float aEnergy;
in float aAge;
uniform float uSigma;
uniform float uAspect;
out vec2 vLocal;
out float vEnergy;
out float vAge;
const vec2 corners[4] = vec2[4](vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0), vec2(1.0, 1.0));
void main() {
  vec2 c = corners[gl_VertexID];
  vLocal = c * 3.0;
  vEnergy = aEnergy;
  vAge = aAge;
  vec2 p = aCenter + c * uSigma * 3.0;
  gl_Position = vec4(p.x * 2.0 / uAspect, p.y * 2.0, 0.0, 1.0);
}`;

const SPLAT_FS = `#version 300 es
precision highp float;
in vec2 vLocal;
in float vEnergy;
in float vAge;
uniform vec3 uFresh;
uniform vec3 uOld;
out vec4 outColor;
void main() {
  float profile = exp(-0.5 * dot(vLocal, vLocal));
  vec3 col = mix(uFresh, uOld, smoothstep(0.25, 1.0, vAge));
  outColor = vec4(col * profile * vEnergy, 1.0);
}`;

const COMPOSITE_FS = `#version 300 es
precision highp float;
uniform sampler2D uLight;
uniform vec2 uRes;
uniform float uAspect;
uniform float uTime;
uniform float uSmoke;
uniform vec3 uBg;
uniform float uGrain;
uniform float uSeed;
uniform float uHue;
uniform float uSaturation;
out vec4 outColor;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    a *= 0.5;
  }
  return v;
}

// hue turn and saturation in YIQ, which keeps brightness where it was
vec3 grade(vec3 c) {
  vec3 yiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312) * c;
  float cs = cos(uHue);
  float sn = sin(uHue);
  yiq.yz = mat2(cs, sn, -sn, cs) * yiq.yz * uSaturation;
  return mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703) * yiq;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 light = texture(uLight, uv).rgb;

  // slow folds of grey smoke: warped noise, thresholded into soft-edged sheets
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5) * 1.6;
  float t = uTime * 0.045;
  vec2 warp = vec2(fbm(p * 0.9 + vec2(t, -t * 0.7)), fbm(p * 0.9 + vec2(5.2 - t * 0.6, 1.3 + t)));
  float sheet = fbm(p * 1.1 + warp * 1.8 + vec2(-t * 0.5, t * 0.3));
  float smoke = smoothstep(0.5, 0.82, sheet) * 0.2 + smoothstep(0.62, 0.92, sheet) * 0.1;
  smoke *= uSmoke;

  // the halo lights up the smoke it passes through, then the strands add on top
  vec3 lit = uBg + smoke * (vec3(0.82, 0.81, 0.8) + light * 1.2);
  vec3 col = 1.0 - (1.0 - lit) * exp(-light);
  col = grade(col);

  float n = hash(gl_FragCoord.xy + uSeed * 91.7) + hash(gl_FragCoord.xy * 1.37 - uSeed * 47.3) - 1.0;
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col += n * uGrain * (0.35 + lum * (1.0 - lum) * 2.6);
  outColor = vec4(col, 1.0);
}`;

// Helpers

function hexToRgb(hex: string): Rgb {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`NeonStreak shader: ${log}`);
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vsSource: string, fsSource: string, attributes: string[]) {
  const program = gl.createProgram()!;
  const vs = compile(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  attributes.forEach((name, i) => gl.bindAttribLocation(program, i, name));
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`NeonStreak program: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

// The idle loop the autopilot traces: a ring that wobbles out of round, as in the reference
function loopPoint(angle: number, time: number, radius: number, out: { x: number; y: number }) {
  const r = radius * (1 + 0.035 * Math.sin(2 * angle + time * 0.5) + 0.02 * Math.sin(3 * angle - time * 0.37 + 1.3));
  out.x = Math.cos(angle) * r * 1.03 + 0.012 * Math.sin(time * 0.21);
  out.y = Math.sin(angle) * r + 0.01 * Math.cos(time * 0.17);
}

// Component

export interface NeonStreakProps {
  /** Canvas colour behind the smoke. */
  backgroundColor?: string;
  /** Turns every colour around the colour wheel, in degrees. 0 is the reference violet. */
  hue?: number;
  /** Colour strength. 0 is greyscale, 1 matches the reference. */
  saturation?: number;
  /** Overall brightness of the light. */
  intensity?: number;
  /** How wide the glow spreads around each strand. */
  glow?: number;
  /** How thick the bright strands are. */
  thickness?: number;
  /** How far the strands weave apart and cross. 0 draws one line. */
  weave?: number;
  /** Seconds a streak stays lit before it fades out. */
  trailLength?: number;
  /** How much grey smoke drifts behind the light. 0 leaves the background flat. */
  smoke?: number;
  /** How fast the smoke drifts and the strands twist. 0 holds them still. */
  speed?: number;
  /** Film grain strength. 0 turns it off. */
  grain?: number;
  /** Let the pointer draw streaks of light. */
  interactive?: boolean;
  /** Draw the ring on its own when nobody is moving the pointer. */
  autoplay?: boolean;
  /** Seconds after the pointer stops before the ring starts drawing itself again. */
  idleDelay?: number;
  /** Radius of the self-drawn ring, in canvas heights. */
  ringSize?: number;
  /** Content laid over the background. */
  children?: ReactNode;
  className?: string;
}

export default function NeonStreak({
  backgroundColor = "#0b0b0b",
  hue = 0,
  saturation = 1,
  intensity = 1,
  glow = 1,
  thickness = 1,
  weave = 1,
  trailLength = 2.6,
  smoke = 1,
  speed = 1,
  grain = 0.04,
  interactive = true,
  autoplay = true,
  idleDelay = 1.2,
  ringSize = 0.32,
  children,
  className = "",
}: NeonStreakProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const configRef = useRef({
    backgroundColor,
    hue,
    saturation,
    intensity,
    glow,
    thickness,
    weave,
    trailLength,
    smoke,
    speed,
    grain,
    interactive,
    autoplay,
    idleDelay,
    ringSize,
    reducedMotion,
  });
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    configRef.current = {
      backgroundColor,
      hue,
      saturation,
      intensity,
      glow,
      thickness,
      weave,
      trailLength,
      smoke,
      speed,
      grain,
      interactive,
      autoplay,
      idleDelay,
      ringSize,
      reducedMotion,
    };
    // a held frame (reduced motion, offscreen) still picks up new settings
    redrawRef.current();
  }, [
    backgroundColor,
    hue,
    saturation,
    intensity,
    glow,
    thickness,
    weave,
    trailLength,
    smoke,
    speed,
    grain,
    interactive,
    autoplay,
    idleDelay,
    ringSize,
    reducedMotion,
  ]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl) return undefined;
    // overlapping strands add past 1 and bloom to white; without float targets they just clip
    const floatTargets = !!gl.getExtension("EXT_color_buffer_float");

    let ribbonProgram: WebGLProgram;
    let splatProgram: WebGLProgram;
    let compositeProgram: WebGLProgram;
    try {
      splatProgram = link(gl, SPLAT_VS, SPLAT_FS, ["aCenter", "aEnergy", "aAge"]);
      ribbonProgram = link(gl, RIBBON_VS, RIBBON_FS, ["aCenter", "aNormal", "aSide", "aWidth", "aEnergy", "aAge", "aEnds"]);
      compositeProgram = link(gl, QUAD_VS, COMPOSITE_FS, ["aPos"]);
    } catch (error) {
      console.error(error);
      return undefined;
    }

    const quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Each trail point becomes two vertices per strand: centre, normal, side, width, energy, age, distance to the nearer end
    const vertices = new Float32Array(MAX_POINTS * 2 * STRAND_COUNT * FLOATS_PER_VERTEX);
    const ribbonVao = gl.createVertexArray();
    gl.bindVertexArray(ribbonVao);
    const ribbonBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ribbonBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices.byteLength, gl.DYNAMIC_DRAW);
    const stride = FLOATS_PER_VERTEX * 4;
    [2, 2, 1, 1, 1, 1, 1].reduce((offset, size, i) => {
      gl.enableVertexAttribArray(i);
      gl.vertexAttribPointer(i, size, gl.FLOAT, false, stride, offset * 4);
      return offset + size;
    }, 0);

    // Dots for the glow (every point of every strand) then the halo, one instance each
    const splats = new Float32Array(MAX_POINTS * (STRAND_COUNT + 1) * FLOATS_PER_SPLAT);
    const splatVao = gl.createVertexArray();
    gl.bindVertexArray(splatVao);
    const splatBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, splatBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, splats.byteLength, gl.DYNAMIC_DRAW);
    [2, 1, 1].reduce((offset, size, i) => {
      gl.enableVertexAttribArray(i);
      gl.vertexAttribPointer(i, size, gl.FLOAT, false, FLOATS_PER_SPLAT * 4, offset * 4);
      gl.vertexAttribDivisor(i, 1);
      return offset + size;
    }, 0);
    gl.bindVertexArray(null);
    let glowSplats = 0;
    let haloSplats = 0;

    const lightTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, lightTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const lightFbo = gl.createFramebuffer();

    const u = (program: WebGLProgram, name: string) => gl.getUniformLocation(program, name);
    const ribbonU = {
      halfWidth: u(ribbonProgram, "uHalfWidth"),
      aspect: u(ribbonProgram, "uAspect"),
      fresh: u(ribbonProgram, "uFresh"),
      old: u(ribbonProgram, "uOld"),
    };
    const splatU = {
      sigma: u(splatProgram, "uSigma"),
      aspect: u(splatProgram, "uAspect"),
      fresh: u(splatProgram, "uFresh"),
      old: u(splatProgram, "uOld"),
    };
    const compositeU = {
      light: u(compositeProgram, "uLight"),
      res: u(compositeProgram, "uRes"),
      aspect: u(compositeProgram, "uAspect"),
      time: u(compositeProgram, "uTime"),
      smoke: u(compositeProgram, "uSmoke"),
      bg: u(compositeProgram, "uBg"),
      grain: u(compositeProgram, "uGrain"),
      seed: u(compositeProgram, "uSeed"),
      hue: u(compositeProgram, "uHue"),
      saturation: u(compositeProgram, "uSaturation"),
    };

    let width = 1;
    let height = 1;
    let aspect = 1;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      aspect = width / height;
      gl.bindTexture(gl.TEXTURE_2D, lightTex);
      if (floatTargets) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, lightFbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, lightTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    // The trail, oldest first, as parallel arrays: position, the time it was laid down, and how far
    // the pen had travelled by then (so the strands' weave stays pinned to the path it was drawn on)
    const px = new Float32Array(MAX_POINTS);
    const py = new Float32Array(MAX_POINTS);
    const born = new Float32Array(MAX_POINTS);
    const odo = new Float32Array(MAX_POINTS);
    let count = 0;
    let odometer = 0;

    const pen = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0, inside: false, lastMove: -Infinity };
    // the autopilot's angle round the ring, and whether it has the pen
    let loopAngle = 0;
    let piloting = true;
    let now = 0;
    let clock = 0;
    let last = 0;

    const push = (x: number, y: number, time: number) => {
      if (count === MAX_POINTS) {
        px.copyWithin(0, 1);
        py.copyWithin(0, 1);
        born.copyWithin(0, 1);
        odo.copyWithin(0, 1);
        count--;
      }
      if (count > 0) odometer += Math.hypot(x - px[count - 1], y - py[count - 1]);
      px[count] = x;
      py[count] = y;
      born[count] = time;
      odo[count] = odometer;
      count++;
    };

    // Lays a finished ring down at once, its points already staggered in age, so the first frame
    // (and the reduced-motion still) shows the reference rather than an empty canvas
    const seedRing = () => {
      const cfg = configRef.current;
      const life = Math.max(cfg.trailLength, 0.3);
      const period = life / 1.12;
      const step = SPACING / Math.max(cfg.ringSize, 0.05);
      const sweep = (Math.PI * 2 * life) / period;
      const steps = Math.min(Math.floor(sweep / step), MAX_POINTS - 1);
      count = 0;
      odometer = 0;
      const p = { x: 0, y: 0 };
      // the ring is drawn anticlockwise, so its newest point sits at the top-right
      const end = Math.PI * 0.3;
      for (let i = 0; i <= steps; i++) {
        const angle = end - sweep + i * step;
        const time = now - ((steps - i) / steps) * life * 0.98;
        loopPoint(angle, clock, cfg.ringSize, p);
        push(p.x, p.y, time);
      }
      loopAngle = end;
      pen.x = p.x;
      pen.y = p.y;
      piloting = true;
    };

    const advance = (dt: number) => {
      const cfg = configRef.current;
      const life = Math.max(cfg.trailLength, 0.3);
      const followPointer = cfg.interactive && pointer.inside && now - pointer.lastMove < cfg.idleDelay;
      const pilot = cfg.autoplay && !followPointer && now - pointer.lastMove >= cfg.idleDelay;

      if (followPointer) {
        target.x = pointer.x;
        target.y = pointer.y;
        piloting = false;
      } else if (pilot) {
        // pick the loop up from wherever the pen is, so the hand-over draws one continuous line
        if (!piloting) {
          loopAngle = Math.atan2(pen.y, pen.x / 1.03);
          piloting = true;
        }
        loopAngle += ((Math.PI * 2 * 1.12) / life) * dt;
        loopPoint(loopAngle, clock, cfg.ringSize, target);
      } else {
        // between the pointer stopping and the autopilot taking over, the pen rests where it is
        target.x = pen.x;
        target.y = pen.y;
      }

      const h = dt / SUBSTEPS;
      const k = 1 - Math.exp(-PEN_FOLLOW * h * (pilot ? 2.5 : 1));
      for (let s = 0; s < SUBSTEPS; s++) {
        pen.x += (target.x - pen.x) * k;
        pen.y += (target.y - pen.y) * k;
        if (!count) {
          push(pen.x, pen.y, now);
          continue;
        }
        const lastX = px[count - 1];
        const lastY = py[count - 1];
        const gap = Math.hypot(pen.x - lastX, pen.y - lastY);
        if (gap >= SPACING) {
          // a fast flick covers several spacings in one substep; fill them in so the ribbon stays smooth
          const fill = Math.min(Math.floor(gap / SPACING), 16);
          for (let f = 1; f <= fill; f++) {
            const a = f / fill;
            push(lastX + (pen.x - lastX) * a, lastY + (pen.y - lastY) * a, now - h * (SUBSTEPS - 1 - s) - h * (1 - a));
          }
        }
      }

      // drop points that have burnt out
      let drop = 0;
      while (drop < count && now - born[drop] > life) drop++;
      if (drop) {
        px.copyWithin(0, drop, count);
        py.copyWithin(0, drop, count);
        born.copyWithin(0, drop, count);
        odo.copyWithin(0, drop, count);
        count -= drop;
      }
    };

    // Smoothed copy of the trail used for drawing, so hand-drawn wobble reads as a sweeping curve
    const sx = new Float32Array(MAX_POINTS);
    const sy = new Float32Array(MAX_POINTS);

    const build = () => {
      const cfg = configRef.current;
      const life = Math.max(cfg.trailLength, 0.3);
      const n = count;
      if (n < 2) return 0;
      for (let i = 0; i < n; i++) {
        let ax = 0;
        let ay = 0;
        let w = 0;
        for (let j = -3; j <= 3; j++) {
          const q = Math.min(Math.max(i + j, 0), n - 1);
          const wj = 4 - Math.abs(j);
          ax += px[q] * wj;
          ay += py[q] * wj;
          w += wj;
        }
        sx[i] = ax / w;
        sy[i] = ay / w;
      }
      // the newest point is the pen tip itself
      sx[n - 1] = px[n - 1];
      sy[n - 1] = py[n - 1];

      const headOdo = odo[n - 1];
      const weaveAmp = WEAVE * cfg.weave;
      const glowScale = Math.max(cfg.glow, 0.1);
      // a row of dots sums to a line about sigma * sqrt(2 pi) / spacing times as bright as one dot;
      // scaling each dot back by that keeps the glow as bright as a ribbon would have been
      const glowNorm = SPACING / ((GLOW_W * glowScale) / 3 * 2.5066);
      const haloNorm = (SPACING * HALO_STRIDE) / ((HALO_W * glowScale) / 3 * 2.5066);
      const gainSum = STRANDS.reduce((sum, strand) => sum + strand.gain, 0);
      let v = 0;
      let g = 0;
      let h = n * STRAND_COUNT * FLOATS_PER_SPLAT;
      for (let s = 0; s < STRAND_COUNT; s++) {
        const strand = STRANDS[s];
        for (let i = 0; i < n; i++) {
          const prev = Math.max(i - 1, 0);
          const next = Math.min(i + 1, n - 1);
          let tx = sx[next] - sx[prev];
          let ty = sy[next] - sy[prev];
          const tl = Math.hypot(tx, ty) || 1;
          tx /= tl;
          ty /= tl;
          const nx = -ty;
          const ny = tx;

          const age = Math.min(Math.max((now - born[i]) / life, 0), 1);
          const fromHead = headOdo - odo[i];
          // strands gather to a point at the pen tip, like light leaving a nib, and weave apart behind it
          const open = smoothstep(0, 0.09, fromHead);
          const offset = weaveAmp * strand.amp * open * Math.sin(odo[i] * strand.freq * Math.PI * 2 * 0.25 + clock * strand.spin + strand.phase);
          const cx = sx[i] + nx * offset;
          const cy = sy[i] + ny * offset;
          // the tail burns out and thins; the very tip eases in so it doesn't start as a hard cap
          const fade = (1 - smoothstep(0.55, 1, age)) * smoothstep(0, 0.012, fromHead + 0.002);
          const widthScale = 1 - 0.45 * age;
          const energy = fade * strand.gain * cfg.intensity;
          const ends = Math.min(fromHead, odo[i] - odo[0]) + 0.002;

          splats[g++] = cx;
          splats[g++] = cy;
          splats[g++] = energy * glowNorm;
          splats[g++] = age;
          if (s === 0 && i % HALO_STRIDE === 0) {
            splats[h++] = sx[i];
            splats[h++] = sy[i];
            splats[h++] = (energy / strand.gain) * gainSum * haloNorm;
            splats[h++] = age;
          }

          for (let side = -1; side <= 1; side += 2) {
            vertices[v++] = cx;
            vertices[v++] = cy;
            vertices[v++] = nx;
            vertices[v++] = ny;
            vertices[v++] = side;
            vertices[v++] = widthScale;
            vertices[v++] = energy;
            vertices[v++] = age;
            vertices[v++] = ends;
          }
        }
      }
      glowSplats = n * STRAND_COUNT;
      haloSplats = (h - n * STRAND_COUNT * FLOATS_PER_SPLAT) / FLOATS_PER_SPLAT;
      return n;
    };

    const draw = () => {
      const cfg = configRef.current;
      const n = build();

      gl.bindFramebuffer(gl.FRAMEBUFFER, lightFbo);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (n >= 2) {
        gl.bindVertexArray(ribbonVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, ribbonBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices, 0, n * 2 * STRAND_COUNT * FLOATS_PER_VERTEX);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.useProgram(ribbonProgram);
        gl.uniform1f(ribbonU.aspect, aspect);
        gl.uniform1f(ribbonU.halfWidth, CORE_W * Math.max(cfg.thickness, 0.2));
        gl.uniform3fv(ribbonU.fresh, CORE_FRESH);
        gl.uniform3fv(ribbonU.old, CORE_OLD);
        for (let s = 0; s < STRAND_COUNT; s++) gl.drawArrays(gl.TRIANGLE_STRIP, s * n * 2, n * 2);

        gl.bindVertexArray(splatVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, splatBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, splats, 0, (glowSplats + haloSplats) * FLOATS_PER_SPLAT);
        gl.useProgram(splatProgram);
        gl.uniform1f(splatU.aspect, aspect);
        const glowScale = Math.max(cfg.glow, 0.1);
        gl.uniform1f(splatU.sigma, (GLOW_W * glowScale) / 3);
        gl.uniform3fv(splatU.fresh, GLOW_FRESH);
        gl.uniform3fv(splatU.old, GLOW_OLD);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, glowSplats);
        if (haloSplats) {
          // the halo's instances start after the glow's, so its attributes are pointed further in
          const offset = glowSplats * FLOATS_PER_SPLAT * 4;
          [2, 1, 1].reduce((at, size, i) => {
            gl.vertexAttribPointer(i, size, gl.FLOAT, false, FLOATS_PER_SPLAT * 4, offset + at * 4);
            return at + size;
          }, 0);
          gl.uniform1f(splatU.sigma, (HALO_W * glowScale) / 3);
          gl.uniform3fv(splatU.fresh, HALO);
          gl.uniform3fv(splatU.old, HALO);
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, haloSplats);
          [2, 1, 1].reduce((at, size, i) => {
            gl.vertexAttribPointer(i, size, gl.FLOAT, false, FLOATS_PER_SPLAT * 4, at * 4);
            return at + size;
          }, 0);
        }
        gl.disable(gl.BLEND);
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.bindVertexArray(quadVao);
      gl.useProgram(compositeProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, lightTex);
      gl.uniform1i(compositeU.light, 0);
      gl.uniform2f(compositeU.res, width, height);
      gl.uniform1f(compositeU.aspect, aspect);
      gl.uniform1f(compositeU.time, clock);
      gl.uniform1f(compositeU.smoke, cfg.smoke);
      gl.uniform3fv(compositeU.bg, hexToRgb(cfg.backgroundColor));
      gl.uniform1f(compositeU.grain, cfg.grain);
      gl.uniform1f(compositeU.hue, (cfg.hue * Math.PI) / 180);
      gl.uniform1f(compositeU.saturation, cfg.saturation);
      // grain steps at film rate rather than every frame
      gl.uniform1f(compositeU.seed, cfg.reducedMotion ? 0 : Math.floor(now * 24) % 97);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    let raf = 0;
    let visible = true;
    let onscreen = true;

    const frame = (stamp: number) => {
      raf = 0;
      const cfg = configRef.current;
      const dt = last ? Math.min((stamp - last) / 1000, 0.05) : 1 / 60;
      last = stamp;
      now += dt;
      clock += dt * cfg.speed;
      advance(dt);
      draw();
      schedule();
    };

    const schedule = () => {
      if (raf || !visible || !onscreen || configRef.current.reducedMotion) return;
      raf = requestAnimationFrame(frame);
    };

    let seededFor = "";
    const redraw = () => {
      const cfg = configRef.current;
      // a still frame is the finished ring; re-lay it whenever its size or length changes
      const key = `${cfg.trailLength}|${cfg.ringSize}`;
      if (cfg.reducedMotion && seededFor !== key) {
        seedRing();
        seededFor = key;
      }
      if (cfg.reducedMotion) {
        draw();
        return;
      }
      seededFor = "";
      if (!raf) draw();
      last = 0;
      schedule();
    };
    redrawRef.current = redraw;

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const ux = (event.clientX - rect.left) / rect.width;
      const uy = 1 - (event.clientY - rect.top) / rect.height;
      pointer.inside = ux >= 0 && ux <= 1 && uy >= 0 && uy <= 1;
      if (!pointer.inside) return;
      pointer.x = (ux - 0.5) * aspect;
      pointer.y = uy - 0.5;
      pointer.lastMove = now;
    };
    const onPointerLeave = () => {
      pointer.inside = false;
    };

    const onVisibility = () => {
      visible = !document.hidden;
      last = 0;
      schedule();
    };

    const io = new IntersectionObserver(
      (entries) => {
        onscreen = entries.some((entry) => entry.isIntersecting);
        last = 0;
        schedule();
      },
      { rootMargin: "128px" },
    );
    io.observe(root);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(root);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    seedRing();
    seededFor = `${configRef.current.trailLength}|${configRef.current.ringSize}`;
    draw();
    schedule();

    return () => {
      redrawRef.current = () => {};
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(ribbonProgram);
      gl.deleteProgram(splatProgram);
      gl.deleteProgram(compositeProgram);
      gl.deleteBuffer(quad);
      gl.deleteBuffer(ribbonBuffer);
      gl.deleteBuffer(splatBuffer);
      gl.deleteVertexArray(splatVao);
      gl.deleteVertexArray(quadVao);
      gl.deleteVertexArray(ribbonVao);
      gl.deleteTexture(lightTex);
      gl.deleteFramebuffer(lightFbo);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative h-full w-full overflow-hidden ${className}`.trim()}
      style={{ backgroundColor }}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
}
