"use client";

import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Flower model: "Wood anemone" by Skuft (https://sketchfab.com/3d-models/wood-anemone-cec4f820ad70467899c661498564a780),
// licensed CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/). Only its petals and stamens are used;
// they are re-centred, reshaded and animated here.
const DEFAULT_MODEL = "/assets/flower-field/wood-anemone.glb";
const PETAL_MATERIAL = "CartoonFFF2BC";
const CENTRE_MATERIALS = ["CartoonE8D80C", "CartoonEBC7E4"];

// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Meadow

interface Stem {
  /** Where it leaves the ground, and where its head rests, in world units */
  root: THREE.Vector3;
  rest: THREE.Vector3;
  /** Head size: open flowers are larger than the buds dotted between them */
  size: number;
  flower: boolean;
  seed: number;
  /** Head offset from rest and its velocity: the spring the pointer and breeze push on */
  offset: THREE.Vector3;
  velocity: THREE.Vector3;
  /** How open the head is (0 = bud, 1 = open) and how fast it is opening */
  bloom: number;
  bloomV: number;
  /** When an open flower first unfurls, in seconds; buds open while the pointer is near */
  opensAt: number;
  hover: number;
  /** Side shoots grow from a point along another stem (its index, and how far along it); -1 for a main stem */
  parent: number;
  attach: number;
  /** How far the stem bows sideways */
  lateral: number;
  /** Where the stem is this frame: root, bend point and head */
  now: { root: THREE.Vector3; bend: THREE.Vector3; head: THREE.Vector3 };
}

// A point on a stem's curve: a quadratic from root, through the bend point, to the head
function onCurve(root: THREE.Vector3, bend: THREE.Vector3, head: THREE.Vector3, t: number, out: THREE.Vector3) {
  const s = 1 - t;
  return out.set(
    s * s * root.x + 2 * s * t * bend.x + t * t * head.x,
    s * s * root.y + 2 * s * t * bend.y + t * t * head.y,
    s * s * root.z + 2 * s * t * bend.z + t * t * head.z,
  );
}

// Main stems bow sideways through their middle; side shoots rise first, then arc out to their head
function bendPoint(stem: Pick<Stem, "parent" | "lateral">, root: THREE.Vector3, head: THREE.Vector3, sway: number, out: THREE.Vector3) {
  if (stem.parent < 0) return out.set((root.x + head.x) / 2 + stem.lateral + sway, (root.y + head.y) / 2, root.z);
  return out.set(root.x + (head.x - root.x) * 0.22 + stem.lateral, root.y + (head.y - root.y) * 0.8, root.z);
}

// Small deterministic random so the same screen grows the same meadow every time
function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Plants spread along the width: each has a curved main stem with a flower (or a bud) on top and a few
// side shoots carrying buds and the odd small flower, like the sprays in the reference. Most stand in
// the focused middle row; a few sit behind it and a few nearer the lens. Heads fill the lower half.
function grow(width: number, density: number): Stem[] {
  const rand = random(11);
  const stems: Stem[] = [];
  const plants = Math.max(6, Math.min(32, Math.round(width * 2.1 * density)));
  const base = () => ({
    seed: rand(),
    offset: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    bloom: 0,
    bloomV: 0,
    hover: 0,
    now: { root: new THREE.Vector3(), bend: new THREE.Vector3(), head: new THREE.Vector3() },
  });
  const scratch = new THREE.Vector3();
  let flowersSoFar = 0;
  for (let i = 0; i < plants; i++) {
    const x = -width / 2 + ((i + 0.15 + rand() * 0.7) / plants) * width;
    const row = rand();
    const z = row < 0.2 ? -1.4 - rand() * 1.2 : row > 0.88 ? 1.0 + rand() * 0.8 : (rand() - 0.5) * 1.2;
    const flower = rand() < 0.75;
    const main: Stem = {
      ...base(),
      root: new THREE.Vector3(x + (rand() - 0.5) * 0.4, -1.15, z),
      rest: new THREE.Vector3(x, 0.05 + rand() * 1.45, z),
      size: flower ? 0.24 + rand() * 0.12 : 0.07 + rand() * 0.04,
      flower,
      opensAt: flower ? 0.4 + flowersSoFar++ * 0.2 + rand() * 0.6 : Infinity,
      parent: -1,
      attach: 0,
      lateral: (rand() - 0.5) * 0.7,
    };
    const mainIndex = stems.length;
    stems.push(main);
    const mainBend = bendPoint(main, main.root, main.rest, 0, new THREE.Vector3());

    const shoots = 3 + Math.floor(rand() * 4);
    for (let k = 0; k < shoots; k++) {
      const attach = 0.4 + rand() * 0.45;
      const side = rand() < 0.5 ? -1 : 1;
      const root = onCurve(main.root, mainBend, main.rest, attach, new THREE.Vector3());
      const length = 0.18 + rand() * 0.42;
      scratch.set(side * (0.35 + rand() * 0.6), 0.6 + rand() * 0.6, 0).normalize().multiplyScalar(length);
      const small = rand() < 0.15;
      stems.push({
        ...base(),
        root,
        rest: root.clone().add(scratch),
        size: small ? 0.09 + rand() * 0.04 : 0.028 + rand() * 0.024,
        flower: small,
        opensAt: small ? 1.2 + rand() * 4 : Infinity,
        parent: mainIndex,
        attach,
        lateral: side * (0.04 + rand() * 0.1),
      });
    }
  }
  return stems;
}

// ---------------------------------------------------------------------------
// Cosmos petals

const PETALS = 8;

// Eight broad cosmos petals around +Y, reaching a radius of 1: each is narrow where it meets the
// centre, widest near the tip, and ends in a soft, three-notched edge. They spread almost flat, like
// a saucer, with the tips lifting a little and the edges curling up, leaving small gaps between them.
function cosmosPetals(): THREE.BufferGeometry {
  const along = 14;
  const across = 9;
  const positions: number[] = [];
  const indices: number[] = [];
  const base = 0.12;
  for (let p = 0; p < PETALS; p++) {
    const angle = (p / PETALS) * Math.PI * 2;
    const c = Math.cos(angle);
    const sn = Math.sin(angle);
    const start = positions.length / 3;
    for (let i = 0; i <= along; i++) {
      const u = i / along;
      // narrow base, widest about two thirds out, rounding off at the tip
      // broad and square-shouldered near the tip, so neighbouring petals just touch
      const half = 0.05 + 0.35 * Math.pow(Math.sin(Math.PI * Math.min(Math.pow(u, 0.62), 0.99)), 0.32);
      for (let j = 0; j <= across; j++) {
        const v = (j / across) * 2 - 1;
        // three soft notches along the tip
        const notch = 0.05 * Math.pow(u, 8) * (0.5 + 0.5 * Math.cos(v * Math.PI * 3));
        const radial = base + (1 - base) * u - notch;
        const side = v * half * (0.6 + 0.4 * u);
        // a shallow saucer, tips lifting a touch, edges curling up
        const y = 0.24 * u * u + 0.06 * v * v * u;
        positions.push(c * radial - sn * side, y, sn * radial + c * side);
      }
    }
    for (let i = 0; i < along; i++) {
      for (let j = 0; j < across; j++) {
        const a = start + i * (across + 1) + j;
        const b = a + across + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// ---------------------------------------------------------------------------
// Head geometry from the model

interface HeadGeometry {
  petals: THREE.BufferGeometry;
  centre: THREE.BufferGeometry;
}

// Takes the stamens from the model for the centre: moves the flower's middle to the origin, turns it
// so it opens toward +Y, and scales it so the model's own petals would reach a radius of 1. The
// petals themselves are drawn as cosmos petals instead.
function extractHead(scene: THREE.Object3D): HeadGeometry {
  scene.updateMatrixWorld(true);
  const petalParts: THREE.BufferGeometry[] = [];
  const centreParts: THREE.BufferGeometry[] = [];
  scene.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const name = (mesh.material as THREE.Material).name;
    const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    for (const key of Object.keys(geometry.attributes)) {
      if (key !== "position" && key !== "normal") geometry.deleteAttribute(key);
    }
    if (name === PETAL_MATERIAL) petalParts.push(geometry);
    else if (CENTRE_MATERIALS.includes(name)) centreParts.push(geometry);
  });
  const petals = mergeGeometries(petalParts)!;
  const centre = mergeGeometries(centreParts)!;

  centre.computeBoundingBox();
  const middle = centre.boundingBox!.getCenter(new THREE.Vector3());
  const pos = petals.attributes.position;
  const facing = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) facing.add(new THREE.Vector3().fromBufferAttribute(pos, i).sub(middle));
  facing.normalize();

  const turn = new THREE.Matrix4().makeRotationFromQuaternion(
    new THREE.Quaternion().setFromUnitVectors(facing, new THREE.Vector3(0, 1, 0)),
  );
  const toOrigin = new THREE.Matrix4().makeTranslation(-middle.x, -middle.y, -middle.z);
  for (const g of [petals, centre]) g.applyMatrix4(toOrigin).applyMatrix4(turn);

  let reach = 0;
  for (let i = 0; i < pos.count; i++) reach = Math.max(reach, Math.hypot(pos.getX(i), pos.getZ(i)));
  const unit = new THREE.Matrix4().makeScale(1 / reach, 1 / reach, 1 / reach);
  for (const g of [petals, centre]) {
    g.applyMatrix4(unit);
    g.computeVertexNormals();
  }

  petals.dispose();
  return { petals: cosmosPetals(), centre };
}

// ---------------------------------------------------------------------------
// Shaders

const SPECTRUM = `
vec3 spectrum(float t) {
  return 0.5 + 0.5 * cos(6.2832 * (t + vec3(0.0, 0.33, 0.67)));
}`;

// Colours in these shaders are picked in sRGB, like a colour picker; the renderer works in linear light
const LINEAR = `
vec3 linear(vec3 c) {
  return pow(max(c, 0.0), vec3(2.2));
}`;

// Petals fold up around the stem while closed, and unfurl outward as the head blooms
const PETAL_VS = `
attribute float aBloom;
attribute float aSeed;
uniform float uTime;
#define PETALS ${PETALS.toFixed(1)}
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vLocal;
varying float vSeed;
// how far above (positive) or below the middle of its head this point sits, in head radii
varying float vUp;

vec3 turn(vec3 v, vec3 k, float a) {
  return v * cos(a) + cross(k, v) * sin(a) + k * dot(k, v) * (1.0 - cos(a));
}

void main() {
  vec3 p = position;
  vec3 n = normal;
  vLocal = p;
  float reach = length(p.xz);

  // which petal this is, so each one opens in its own turn
  float k = floor(atan(p.z, p.x) / (6.2832 / PETALS) + 0.5);
  float r2 = reach;

  // petals open one after another, in an order of their own for each flower
  float order = fract(mod(k + PETALS, PETALS) * 0.618 + aSeed * 7.0);
  float b = clamp(aBloom, 0.0, 1.15);
  float pb = clamp((b - 0.2 - order * 0.3) / 0.5, 0.0, 1.15);

  vec3 radial = r2 > 1e-4 ? vec3(p.x, 0.0, p.z) / r2 : vec3(1.0, 0.0, 0.0);
  // each petal hinges where it meets the centre; closed, its tip folds up toward the stem's axis
  vec3 hinge = vec3(-radial.z, 0.0, radial.x);
  float fold = (1.0 - min(pb, 1.0)) * 1.45 * smoothstep(0.05, 0.7, r2);
  // the overshoot opens a petal just past flat, then it settles; open petals breathe, very slightly
  fold += (pb - min(pb, 1.0)) * -0.8 * smoothstep(0.05, 0.7, r2) - 0.035 * sin(uTime * 0.9 + aSeed * 30.0) * min(pb, 1.0);
  p = turn(p, hinge, fold);
  n = turn(n, hinge, fold);
  // petals emerge from inside the swelling bud, small, and grow as they unfold
  p *= mix(0.12, 1.0, smoothstep(0.0, 0.8, min(pb, 1.0)));

  vec4 world = modelMatrix * instanceMatrix * vec4(p, 1.0);
  vec4 middle = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vUp = (world.y - middle.y) / max(length((modelMatrix * instanceMatrix)[0].xyz), 1e-4);
  vPosW = world.xyz;
  vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * n);
  vSeed = aSeed;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

// Translucent white petals: cool lavender at the base, white through the middle, and an iridescent
// pink-to-orange rim that shifts with the viewing angle, bright enough for the bloom pass to catch
const PETAL_FS = `
uniform float uTime;
uniform float uGlow;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vLocal;
varying float vSeed;
varying float vUp;
${SPECTRUM}
${LINEAR}

void main() {
  vec3 view = normalize(cameraPosition - vPosW);
  vec3 n = normalize(vNormalW);
  float facing = abs(dot(n, view));
  float fres = pow(1.0 - facing, 2.0);
  float r = length(vLocal.xz);
  float a = atan(vLocal.z, vLocal.x);

  // crisp, cool white: a touch of blue at the base and on the lower petals
  vec3 col = mix(vec3(0.74, 0.8, 1.0), vec3(0.98, 0.98, 1.0), smoothstep(0.1, 0.6, r));
  col = mix(col, vec3(0.68, 0.76, 1.0), smoothstep(0.1, -0.7, vUp) * 0.4);
  // soft light from above and in front shapes each petal
  float lit = 0.8 + 0.2 * abs(dot(n, normalize(vec3(0.25, 0.85, 0.45))));
  col *= lit;
  col += vec3(0.12, 0.14, 0.25) * (1.0 - facing);
  col = mix(col, spectrum(fres * 1.3 + vSeed + uTime * 0.03), fres * 0.25);
  vec3 body = linear(col);

  // neon light along the upper rims: magenta on one side, orange to gold on the other
  float side = 0.5 + 0.5 * sin(a + vSeed * 6.2832 + uTime * 0.25);
  vec3 neon = mix(vec3(1.0, 0.18, 0.85), vec3(1.0, 0.5, 0.08), side);
  neon = mix(neon, vec3(1.0, 0.85, 0.25), smoothstep(0.75, 1.0, side) * 0.6);
  // the colour has to survive tone mapping, so the rim band is wider and only moderately bright
  float rim = smoothstep(0.58, 1.0, r) * smoothstep(-0.2, 0.55, vUp);
  vec3 lit2 = mix(body * 1.3, linear(neon) * 1.6, rim * 0.85);
  gl_FragColor = vec4(lit2 + linear(neon) * rim * 0.9 * uGlow, 1.0);
}`;

const CENTRE_VS = `
attribute float aBloom;
varying vec3 vLocal;
void main() {
  vLocal = position;
  // the centre sits a little larger than the model's, like the cosmos in the reference
  float g = mix(0.2, 1.0, smoothstep(0.25, 0.9, min(aBloom, 1.0))) * 3.0;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position * g, 1.0);
}`;

// A speckled blue centre with cyan and gold flecks
const CENTRE_FS = `
varying vec3 vLocal;
${LINEAR}
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
void main() {
  float h = hash(floor(vLocal * 120.0));
  vec3 col = mix(vec3(0.15, 0.3, 1.0), vec3(0.1, 0.15, 0.7), h);
  col = mix(col, vec3(0.4, 1.0, 0.95), step(0.7, h));
  col = mix(col, vec3(1.0, 0.85, 0.3), step(0.9, h));
  gl_FragColor = vec4(linear(col) * 1.6, 1.0);
}`;

// Glowing buds with a thin-film rainbow skin; they shrink away as the petals unfurl out of them
const BUD_VS = `
attribute float aSeed;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vLocalN;
varying float vSeed;
void main() {
  vLocalN = normal;
  // a little taller than wide, like a closed bud
  vec3 p = position * vec3(1.0, 1.15, 1.0);
  vec4 world = modelMatrix * instanceMatrix * vec4(p, 1.0);
  vPosW = world.xyz;
  vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
  vSeed = aSeed;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const BUD_FS = `
uniform float uTime;
// the warm neon of the reference's buds: orange, gold, magenta and pink
vec3 warmHue(float t) {
  t = fract(t) * 4.0;
  vec3 a = vec3(1.0, 0.42, 0.08);
  vec3 b = vec3(1.0, 0.82, 0.18);
  vec3 c = vec3(1.0, 0.18, 0.78);
  vec3 d = vec3(1.0, 0.4, 0.55);
  return t < 1.0 ? mix(a, b, t) : t < 2.0 ? mix(b, c, t - 1.0) : t < 3.0 ? mix(c, d, t - 2.0) : mix(d, a, t - 3.0);
}
uniform float uGlow;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vLocalN;
varying float vSeed;
${SPECTRUM}
${LINEAR}
void main() {
  vec3 view = normalize(cameraPosition - vPosW);
  float facing = abs(dot(normalize(vNormalW), view));
  // two saturated colours meet across each bud, like the split orange-and-magenta buds in the reference
  vec3 n = normalize(vNormalW);
  float a = vSeed * 6.2832;
  float split = smoothstep(-0.35, 0.35, dot(n, normalize(vec3(cos(a), 0.4, sin(a)))));
  vec3 c1 = warmHue(vSeed + uTime * 0.02);
  vec3 c2 = fract(vSeed * 7.3) < 0.3 ? vec3(0.35, 0.85, 1.0) : warmHue(vSeed + 0.4 + uTime * 0.02);
  vec3 col = mix(c1, c2, split) * 1.25;
  // a hot, pale core where it faces us
  col = mix(col, vec3(1.0, 0.95, 0.82), smoothstep(0.75, 1.0, facing) * 0.45);
  vec3 glowCol = linear(col) * (2.4 + uGlow * 1.4);
  // five green sepals cup the bud from below; they catch a little light but don't glow
  float lobes = 0.5 + 0.5 * cos(atan(vLocalN.z, vLocalN.x) * 5.0 + vSeed * 6.2832);
  float calyx = smoothstep(-0.05 - 0.3 * lobes, -0.35 - 0.3 * lobes, vLocalN.y);
  vec3 sepal = linear(vec3(0.3, 0.62, 0.42)) * (0.7 + 0.5 * facing);
  gl_FragColor = vec4(mix(glowCol, sepal, calyx), 1.0);
}`;

// Stems: a thin tube laid along a curve from the root, through a bend point, to the head
const STEM_VS = `
attribute vec3 aRoot;
attribute vec3 aBend;
attribute vec3 aHead;
attribute float aWidth;
varying float vAlong;
void main() {
  float t = position.y + 0.5;
  float s = 1.0 - t;
  vec3 c = s * s * aRoot + 2.0 * s * t * aBend + t * t * aHead;
  vec3 tangent = normalize(2.0 * s * (aBend - aRoot) + 2.0 * t * (aHead - aBend));
  vec3 side = normalize(cross(tangent, vec3(0.0, 0.0, 1.0)));
  vec3 up = cross(side, tangent);
  vec3 world = c + (side * position.x + up * position.z) * aWidth * (1.0 - t * 0.5);
  vAlong = t;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}`;

const STEM_FS = `
varying float vAlong;
${LINEAR}
void main() {
  vec3 col = mix(vec3(0.42, 0.68, 0.62), vec3(0.78, 0.93, 0.9), vAlong);
  gl_FragColor = vec4(linear(col) * 1.15, 1.0);
}`;

// Mist: soft rolling noise on a few big sheets along the ground
const MIST_VS = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const MIST_FS = `
uniform float uTime;
uniform float uMist;
uniform float uSeed;
varying vec2 vUv;
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
void main() {
  vec2 p = vUv * vec2(6.0, 2.0) + vec2(uTime * 0.04 + uSeed * 10.0, 0.0);
  float n = noise(p) * 0.6 + noise(p * 2.3 - vec2(uTime * 0.06, 0.0)) * 0.4;
  float shape = smoothstep(0.0, 0.3, vUv.y) * smoothstep(0.75, 0.3, vUv.y) * smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
  float a = shape * (0.3 + 0.7 * n) * 0.3 * uMist;
  gl_FragColor = vec4(pow(vec3(0.6, 0.74, 1.0), vec3(2.2)) * 1.6, a);
}`;

// Ground glow: the blue-white haze at the bottom of the frame, brightest in the corners
const GLOW_FS = `
uniform float uMist;
varying vec2 vUv;
void main() {
  // the sheet fills the view exactly, so its uv is the screen: bright white-blue along the bottom
  // edge, climbing higher up the left and right sides, clear in the middle of the frame
  float edge = abs(vUv.x - 0.5) * 2.0;
  float low = 1.0 - vUv.y;
  float a = pow(smoothstep(0.76, 1.0, low), 1.5) * (0.8 + 0.4 * edge);
  a += pow(smoothstep(0.6, 1.0, edge), 2.0) * pow(smoothstep(0.42, 1.0, low), 1.4) * 0.85;
  gl_FragColor = vec4(pow(vec3(0.72, 0.85, 1.0), vec3(2.2)) * 1.75, clamp(a * uMist, 0.0, 0.95));
}`;

// Night sky behind everything, lifting to deep blue near the horizon
const SKY_FS = `
varying vec2 vUv;
void main() {
  // deep navy, lifting toward blue behind the meadow
  vec3 col = mix(vec3(0.1, 0.19, 0.32), vec3(0.05, 0.11, 0.17), smoothstep(0.32, 0.72, vUv.y));
  gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
}`;

// ---------------------------------------------------------------------------
// Scene

interface Settings {
  density: number;
  follow: number;
  followRadius: number;
  bloomOnHover: boolean;
  speed: number;
  breeze: number;
  glow: number;
  mist: number;
  reducedMotion: boolean;
}

const CAMERA_POSITION = new THREE.Vector3(0, 1.45, 6.2);
const CAMERA_TARGET = new THREE.Vector3(0, 1.25, 0);
const UP = new THREE.Vector3(0, 1, 0);


function Meadow({ model, settings }: { model: string; settings: Settings }) {
  const { scene } = useGLTF(model);
  const head = useMemo(() => extractHead(scene.clone(true)), [scene]);
  const { camera, viewport, size, invalidate, gl } = useThree();
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  });

  // how wide the meadow has to be to fill the frame at the focus plane
  const width = viewport.getCurrentViewport(camera, CAMERA_TARGET).width * 1.15;
  // the buffers are sized from the layout; the frame loop grows its own copy of it to move
  const count = useMemo(() => grow(width, settings.density).length, [width, settings.density]);

  // everything the frame loop moves lives behind a ref: the springs, the pointer and scratch maths
  const simRef = useRef({
    stems: [] as Stem[],
    grownFor: "",
    clock: 0,
    pointer: { at: new THREE.Vector3(0, 1, 0), last: new THREE.Vector3(), velocity: new THREE.Vector3(), inside: false, fresh: true },
    matrix: new THREE.Matrix4(),
    quat: new THREE.Quaternion(),
    scale: new THREE.Vector3(),
    headAt: new THREE.Vector3(),
    face: new THREE.Vector3(),
    tmp: new THREE.Vector3(),
  });
  // the frame loop regrows its meadow when this changes
  const layoutKey = `${width.toFixed(3)}|${settings.density}|${settings.reducedMotion}`;
  const layoutKeyRef = useRef(layoutKey);
  useEffect(() => {
    layoutKeyRef.current = layoutKey;
    invalidate();
  }, [layoutKey, invalidate]);
  const petalRef = useRef<THREE.InstancedMesh>(null);
  const petalMaterial = useRef<THREE.ShaderMaterial>(null);
  const mistMaterials = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const centreRef = useRef<THREE.InstancedMesh>(null);
  const budRef = useRef<THREE.InstancedMesh>(null);
  const stemRef = useRef<THREE.InstancedMesh>(null);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uGlow: { value: 1 } }), []);
  const glowUniforms = useMemo(() => ({ uTime: { value: 0 }, uMist: { value: 1 } }), []);
  const mistUniforms = useMemo(() => [0, 1, 2].map((i) => ({ uTime: { value: 0 }, uMist: { value: 1 }, uSeed: { value: i } })), []);

  const buffers = useMemo(() => {
    const f = (n: number) => new THREE.InstancedBufferAttribute(new Float32Array(count * n), n);
    return { bloom: f(1), seed: f(1), root: f(3), bend: f(3), head: f(3), width: f(1) };
  }, [count]);

  const budGeometry = useMemo(() => new THREE.SphereGeometry(1, 20, 14), []);
  const stemGeometry = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 5, 16, true), []);
  const geometries = useMemo(() => {
    const petals = head.petals.clone();
    const centre = head.centre.clone();
    const bud = budGeometry.clone();
    const stem = stemGeometry.clone();
    petals.setAttribute("aBloom", buffers.bloom);
    petals.setAttribute("aSeed", buffers.seed);
    centre.setAttribute("aBloom", buffers.bloom);
    bud.setAttribute("aSeed", buffers.seed);
    for (const [k, v] of [["aRoot", buffers.root], ["aBend", buffers.bend], ["aHead", buffers.head], ["aWidth", buffers.width]] as const) {
      stem.setAttribute(k, v);
    }
    return { petals, centre, bud, stem };
  }, [head, budGeometry, stemGeometry, buffers]);

  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

  useEffect(() => {
    const el = document.documentElement;
    const onMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const pointer = simRef.current.pointer;
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const inside = x >= -1 && x <= 1 && y >= -1 && y <= 1;
      pointer.inside = inside;
      if (!inside) {
        pointer.fresh = true;
        return;
      }
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const hit = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
      if (hit) pointer.at.copy(hit);
    };
    const onLeave = () => {
      simRef.current.pointer.inside = false;
      simRef.current.pointer.fresh = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [camera, gl, raycaster, plane]);

  useFrame((_, delta) => {
    const regrow = () => {
      const sim = simRef.current;
      if (sim.grownFor === layoutKeyRef.current) return;
      sim.grownFor = layoutKeyRef.current;
      sim.stems = grow(width, settingsRef.current.density);
      // with reduced motion the meadow starts in full bloom
      if (settingsRef.current.reducedMotion) for (const s of sim.stems) s.bloom = s.flower ? 1 : 0;
    };

    const step = (dt: number) => {
      const cfg = settingsRef.current;
      const { pointer: p, headAt, tmp } = simRef.current;
      const r2 = cfg.followRadius * cfg.followRadius;
      for (const s of simRef.current.stems) {
        headAt.copy(s.now.head.lengthSq() > 0 ? s.now.head : s.rest);
        tmp.copy(p.at).sub(headAt);
        tmp.z = 0;
        const near = p.inside ? Math.exp(-tmp.lengthSq() / r2) : 0;
        // the middle row responds most; the rows in front and behind less, which reads as depth
        const reach = cfg.follow * near * (1 - Math.min(Math.abs(s.rest.z) * 0.25, 0.6));
        const lean = s.flower ? 0.3 : 0.42;
        const t = simRef.current.clock;
        const bx = cfg.breeze * (0.05 * Math.sin(t * 0.8 + s.seed * 20 + s.rest.x * 0.6) + 0.025 * Math.sin(t * 1.9 + s.seed * 7));
        const tx = tmp.x * lean * reach + bx;
        const ty = tmp.y * lean * 0.3 * reach;
        const stiff = (s.flower ? 22 : 32) * cfg.speed;
        const damp = (s.flower ? 4.8 : 6) * Math.sqrt(cfg.speed);
        s.velocity.set(
          s.velocity.x + ((tx - s.offset.x) * stiff - s.velocity.x * damp + p.velocity.x * reach * 0.5) * dt,
          s.velocity.y + ((ty - s.offset.y) * stiff - s.velocity.y * damp + p.velocity.y * reach * 0.2) * dt,
          0,
        );
        s.offset.addScaledVector(s.velocity, dt);

        // open flowers unfurl once, on a stagger; buds open while the pointer is close, then close
        if (!s.flower) s.hover = cfg.bloomOnHover && near > 0.6 ? 2.2 : Math.max(s.hover - dt, 0);
        const target = s.flower ? (t >= s.opensAt ? 1 : 0) : s.hover > 0 ? 1 : 0;
        // a lightly damped spring, so petals overshoot a touch as they open
        s.bloomV += ((target - s.bloom) * 3.2 * cfg.speed - s.bloomV * 2.4 * Math.sqrt(cfg.speed)) * dt;
        s.bloom = Math.max(0, s.bloom + s.bloomV * dt);
      }
    };

    const pack = () => {
      const petals = petalRef.current;
      const centre = centreRef.current;
      const buds = budRef.current;
      const { stems, matrix, quat, scale, headAt, face } = simRef.current;
      // the layout and the buffers sized for it swap on the same commit; skip the frame in between
      if (!petals || !centre || !buds || stems.length !== count) return;
      const bloom = buffers.bloom.array as Float32Array;
      const seed = buffers.seed.array as Float32Array;
      const root = buffers.root.array as Float32Array;
      const bend = buffers.bend.array as Float32Array;
      const headArr = buffers.head.array as Float32Array;
      const widthArr = buffers.width.array as Float32Array;

      stems.forEach((s, i) => {
        const { now } = s;
        if (s.parent < 0) {
          now.root.copy(s.root);
          now.head.copy(s.rest).add(s.offset);
          bendPoint(s, now.root, now.head, s.offset.x * 0.6, now.bend);
        } else {
          // parents come first in the list, so their curve for this frame is ready
          const parent = stems[s.parent].now;
          onCurve(parent.root, parent.bend, parent.head, s.attach, now.root);
          now.head.copy(s.rest).sub(s.root).add(now.root).add(s.offset);
          bendPoint(s, now.root, now.head, 0, now.bend);
        }
        headAt.copy(now.head);
        // heads look up and toward the camera, and tip the way their stem is bent
        // a three-quarter view: half toward the camera, half up, so the far petals rise behind the centre
      face.copy(CAMERA_POSITION).sub(headAt).normalize().multiplyScalar(1.05).add(UP).normalize();
        face.x += s.offset.x * 1.4 + (s.seed - 0.5) * 0.5;
        face.normalize();
        quat.setFromUnitVectors(UP, face);
        // petals and centre are scaled by the head size; the bud by its own size, shrinking as it opens
        const open = Math.min(s.bloom, 1);
        scale.setScalar(s.flower ? s.size : s.size * 2.6);
        matrix.compose(headAt, quat, scale);
        petals.setMatrixAt(i, matrix);
        centre.setMatrixAt(i, matrix);
        // the bud swells first, then shrinks away as the petals push out of it
        const swell = 1 + 0.45 * THREE.MathUtils.smoothstep(open, 0, 0.25);
        const budSize = (s.flower ? s.size * 0.3 : s.size) * swell * (1 - THREE.MathUtils.smoothstep(open, 0.3, 0.75));
        scale.setScalar(Math.max(budSize, 1e-4));
        matrix.compose(headAt, quat, scale);
        buds.setMatrixAt(i, matrix);

        bloom[i] = s.bloom;
        seed[i] = s.seed;
        root.set([now.root.x, now.root.y, now.root.z], i * 3);
        bend.set([now.bend.x, now.bend.y, now.bend.z], i * 3);
        headArr.set([headAt.x, headAt.y - (s.flower ? s.size * 0.08 : s.size * 0.6), headAt.z], i * 3);
        widthArr[i] = s.parent >= 0 ? 0.0035 : s.flower ? 0.0065 : 0.005;
      });
      for (const mesh of [petals, centre, buds]) mesh.instanceMatrix.needsUpdate = true;
      for (const attr of Object.values(buffers)) attr.needsUpdate = true;
    };

    regrow();
    const cfg = settingsRef.current;
    const shared = petalMaterial.current?.uniforms;
    if (shared) shared.uGlow.value = cfg.glow;
    for (const m of mistMaterials.current) if (m) m.uniforms.uMist.value = cfg.mist;
    if (!cfg.reducedMotion) {
      const elapsed = Math.min(delta, 0.25);
      // pointer velocity over the whole frame, smoothed so one jerky event doesn't fling the field
      const { pointer: p, tmp } = simRef.current;
      if (p.inside && !p.fresh) {
        tmp.copy(p.at).sub(p.last).divideScalar(Math.max(elapsed, 1e-3));
        p.velocity.lerp(tmp, Math.min(elapsed * 12, 1));
      } else p.velocity.multiplyScalar(0.8);
      p.fresh = !p.inside;
      p.last.copy(p.at);
      // springs run in small fixed steps, so a slow frame keeps real-time pace without flinging stems
      const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)));
      for (let k = 0; k < steps; k++) {
        simRef.current.clock += elapsed / steps;
        step(elapsed / steps);
      }
      if (shared) shared.uTime.value = simRef.current.clock;
      for (const m of mistMaterials.current) if (m) m.uniforms.uTime.value = simRef.current.clock;
    }
    pack();
  });

  const aspect = size.width / Math.max(size.height, 1);
  // a sheet just in front of the camera, sized to fill its view, for the screen-space ground glow
  const glowSheet = useMemo(() => {
    const distance = 1.2;
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 34;
    const height = 2 * distance * Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const forward = CAMERA_TARGET.clone().sub(CAMERA_POSITION).normalize();
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(CAMERA_POSITION, CAMERA_TARGET, UP),
    );
    return {
      position: CAMERA_POSITION.clone().addScaledVector(forward, distance),
      quaternion,
      scale: new THREE.Vector3(height * aspect, height, 1),
    };
  }, [camera, aspect]);

  return (
    <>
      <mesh position={[0, 3, -9]} scale={[60 * Math.max(aspect, 1), 30, 1]}>
        <planeGeometry />
        <shaderMaterial vertexShader={MIST_VS} fragmentShader={SKY_FS} depthWrite={false} />
      </mesh>
      {/* instanced bounds change every frame, so these skip culling instead of recomputing them */}
      <instancedMesh ref={stemRef} frustumCulled={false} args={[geometries.stem, undefined, count]}>
        <shaderMaterial vertexShader={STEM_VS} fragmentShader={STEM_FS} />
      </instancedMesh>
      <instancedMesh ref={petalRef} frustumCulled={false} args={[geometries.petals, undefined, count]}>
        <shaderMaterial ref={petalMaterial} vertexShader={PETAL_VS} fragmentShader={PETAL_FS} uniforms={uniforms} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={centreRef} frustumCulled={false} args={[geometries.centre, undefined, count]}>
        <shaderMaterial vertexShader={CENTRE_VS} fragmentShader={CENTRE_FS} />
      </instancedMesh>
      <instancedMesh ref={budRef} frustumCulled={false} args={[geometries.bud, undefined, count]}>
        <shaderMaterial vertexShader={BUD_VS} fragmentShader={BUD_FS} uniforms={uniforms} />
      </instancedMesh>
      <mesh position={glowSheet.position} quaternion={glowSheet.quaternion} scale={glowSheet.scale} renderOrder={10}>
        <planeGeometry />
        <shaderMaterial
          ref={(m) => {
            mistMaterials.current[3] = m;
          }}
          vertexShader={MIST_VS}
          fragmentShader={GLOW_FS}
          uniforms={glowUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      {mistUniforms.map((u, i) => (
        <mesh key={i} position={[0, -0.75 + i * 0.1, 1.6 - i * 1.2]} scale={[width * 1.6, 1.4, 1]}>
          <planeGeometry />
          <shaderMaterial
            ref={(m) => {
              mistMaterials.current[i] = m;
            }}
            vertexShader={MIST_VS}
            fragmentShader={MIST_FS}
            uniforms={u}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}

function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(CAMERA_TARGET);
  }, [camera]);
  return null;
}

// ---------------------------------------------------------------------------
// Component

export interface FlowerFieldProps {
  /** The flower model the heads are made from. Its petals and stamens are used. */
  model?: string;
  /** How many flowers and buds grow across the frame. 1 is the reference meadow. */
  density?: number;
  /** How hard the flowers lean toward the pointer and get carried by it. 0 leaves them be. */
  follow?: number;
  /** Reach of the pointer, in world units. */
  followRadius?: number;
  /** Open buds as the pointer passes over them. */
  bloomOnHover?: boolean;
  /** How quickly the flowers open, and how springy their stems are. */
  speed?: number;
  /** How much the breeze sways the flowers. 0 holds them still. */
  breeze?: number;
  /** Strength of the glow around the flowers. */
  glow?: number;
  /** Strength of the mist along the ground. */
  mist?: number;
  /** How blurred the flowers in front of and behind the focus are. 0 keeps everything sharp. */
  depthOfField?: number;
  /** Film grain strength. 0 turns it off. */
  grain?: number;
  /** Content laid over the background. */
  children?: ReactNode;
  className?: string;
}

export default function FlowerField({
  model = DEFAULT_MODEL,
  density = 1,
  follow = 1,
  followRadius = 1.3,
  bloomOnHover = true,
  speed = 1,
  breeze = 1,
  glow = 1,
  mist = 1,
  depthOfField = 1,
  grain = 0.05,
  children,
  className = "",
}: FlowerFieldProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(true);

  // pause when the field is offscreen or the tab is hidden
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    let onscreen = true;
    const sync = () => setActive(onscreen && !document.hidden);
    const io = new IntersectionObserver((entries) => {
      onscreen = entries.some((entry) => entry.isIntersecting);
      sync();
    }, { rootMargin: "128px" });
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const settings: Settings = { density, follow, followRadius, bloomOnHover, speed, breeze, glow, mist, reducedMotion };
  const fringe = useMemo(() => new THREE.Vector2(0.0011, 0.0007), []);

  return (
    <div ref={rootRef} className={`relative h-full w-full overflow-hidden bg-[#050812] ${className}`.trim()}>
      <Canvas
        aria-hidden="true"
        style={{ position: "absolute", inset: 0 }}
        dpr={[1, 1.5]}
        frameloop={reducedMotion ? "demand" : active ? "always" : "never"}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 34, near: 0.1, far: 40, position: CAMERA_POSITION.toArray() }}
      >
        <CameraRig />
        <Suspense fallback={null}>
          <Meadow model={model} settings={settings} />
        </Suspense>
        <EffectComposer multisampling={0}>
          <DepthOfField worldFocusDistance={CAMERA_POSITION.z} worldFocusRange={3.4} bokehScale={1.6 * depthOfField} />
          <Bloom intensity={1.1 * glow} luminanceThreshold={0.8} luminanceSmoothing={0.3} mipmapBlur radius={0.55} />
          <ToneMapping mode={ToneMappingMode.NEUTRAL} />
          <ChromaticAberration offset={fringe} radialModulation modulationOffset={0.25} />
          <Noise opacity={grain} blendFunction={BlendFunction.SOFT_LIGHT} />
          <Vignette offset={0.25} darkness={0.55} />
        </EffectComposer>
      </Canvas>
      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
}

useGLTF.preload(DEFAULT_MODEL);
