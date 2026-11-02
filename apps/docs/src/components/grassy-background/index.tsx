"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import {
  Fn,
  cameraPosition,
  cameraProjectionMatrix,
  cameraViewMatrix,
  clamp,
  dot,
  exp,
  float,
  floor,
  hash,
  instanceIndex,
  length,
  max,
  min,
  mix,
  mx_noise_float,
  normalize,
  positionGeometry,
  pow,
  screenUV,
  sin,
  smoothstep,
  texture,
  uniform,
  varying,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

export interface GrassyBackgroundProps {
  speed?: number;
  wind?: number;
  hills?: number;
  terrainScale?: number;
  horizon?: number;
  density?: number;
  bladeHeight?: number;
  bladeWidth?: number;
  mouseInteractive?: boolean;
  mouseStrength?: number;
  mouseSize?: number;
  backgroundColor?: string;
  shadowColor?: string;
  grassColor?: string;
  highlightColor?: string;
  className?: string;
}

type GrassUniforms = ReturnType<typeof createUniforms>;
type TextureSampler = ReturnType<typeof texture>;

interface GrassSettings {
  speed: number;
  wind: number;
  hills: number;
  terrainScale: number;
  horizon: number;
  density: number;
  bladeHeight: number;
  bladeWidth: number;
  mouseInteractive: boolean;
  mouseStrength: number;
  mouseSize: number;
  backgroundColor: string;
  shadowColor: string;
  grassColor: string;
  highlightColor: string;
  reduce: boolean;
}

const FOV = 38;
const CAMERA_HEIGHT = 2.4;
const NEAR_ROW = 2.2;
const FAR_ROW = 30;
const TERRAIN_WIDTH = 512;
const TERRAIN_HEIGHT = 384;
const WAKE_SCALE = 0.25;
const MAX_BLADES = 200000;

function createUniforms() {
  return {
    time: uniform(0),
    drift: uniform(0),
    aspect: uniform(1),
    spread: uniform(1),
    near: uniform(NEAR_ROW),
    far: uniform(FAR_ROW),
    cols: uniform(1),
    rows: uniform(1),
    hills: uniform(1),
    terrainScale: uniform(1),
    bladeHeight: uniform(0.2),
    bladeWidth: uniform(0.012),
    wind: uniform(0.6),
    mouseStrength: uniform(1),
    mouseRadius: uniform(0.08),
    wakeFrom: uniform(new THREE.Vector2()),
    wakeTo: uniform(new THREE.Vector2()),
    wakeAmount: uniform(0),
    wakeFade: uniform(1),
    wakeTexel: uniform(new THREE.Vector2(1, 1)),
    shadow: uniform(new THREE.Color()),
    grass: uniform(new THREE.Color()),
    highlight: uniform(new THREE.Color()),
  };
}

function rowToWorld(u: GrassUniforms, coord: THREE.Node<"vec2">) {
  const z = u.near.mul(pow(u.far.div(u.near), coord.y)).negate();
  const halfWidth = z.negate().mul(u.spread).add(0.6);
  return vec2(coord.x.sub(0.5).mul(halfWidth).mul(2), z);
}

function buildTerrainNode(u: GrassUniforms) {
  const ridge = Fn(([seed]: [THREE.Node<"vec3">]) => {
    const p = vec3(seed).toVar();
    const total = float(0).toVar();
    let amplitude = 0.6;
    for (let i = 0; i < 4; i++) {
      total.addAssign(mx_noise_float(p).mul(amplitude));
      p.assign(p.mul(2.03).add(vec3(3.1, 7.7, 1.3)));
      amplitude *= 0.45;
    }
    return total;
  }).setLayout({
    name: "grassyRidge",
    type: "float",
    inputs: [{ name: "seed", type: "vec3" }],
  });

  return Fn(() => {
    const world = rowToWorld(u, screenUV);
    const frequency = u.terrainScale.mul(0.13);
    const heightAt = (offset: THREE.Node<"vec2">) =>
      ridge(vec3(world.add(offset).mul(frequency), u.drift)).mul(u.hills).mul(3.6);
    const e = 0.06;
    const h = heightAt(vec2(0, 0));
    const hx = heightAt(vec2(e, 0));
    const hz = heightAt(vec2(0, e));
    const clump = mx_noise_float(vec3(world.mul(2.6), u.drift.mul(2.0)));
    return vec4(h, hx.sub(h).div(e), hz.sub(h).div(e), clump);
  })();
}

function buildWakeNode(u: GrassUniforms, wakeMap: TextureSampler) {
  return Fn(() => {
    const field = vec2(screenUV.x.sub(0.5).mul(u.aspect), float(0.5).sub(screenUV.y));
    const spread = u.wakeTexel;
    const around = wakeMap
      .sample(screenUV.add(vec2(spread.x, 0)))
      .add(wakeMap.sample(screenUV.sub(vec2(spread.x, 0))))
      .add(wakeMap.sample(screenUV.add(vec2(0, spread.y))))
      .add(wakeMap.sample(screenUV.sub(vec2(0, spread.y))))
      .mul(0.25);
    const previous = mix(wakeMap.sample(screenUV), around, 0.3).mul(u.wakeFade);

    const along = field.sub(u.wakeFrom);
    const stroke = u.wakeTo.sub(u.wakeFrom);
    const travel = length(stroke);
    const h = clamp(dot(along, stroke).div(dot(stroke, stroke).add(0.00001)), 0, 1);
    const gap = length(along.sub(stroke.mul(h)));
    const spreadRadius = u.mouseRadius.mul(1.2);
    const shape = exp(gap.mul(gap).div(spreadRadius.mul(spreadRadius)).negate());
    const splat = shape.mul(u.wakeAmount);
    const direction = stroke.div(travel.add(0.00001));

    const turnToStroke = smoothstep(0, 0.15, splat);
    const redirected = mix(previous.rg, direction.mul(length(previous.rg)), turnToStroke);
    const push = redirected.add(direction.mul(splat));
    const pushLength = length(push);
    const limited = push.mul(min(pushLength, 1.2).div(pushLength.add(0.00001)));
    return vec4(limited, min(previous.b.add(splat), 1), 1);
  })();
}

function buildGrassNodes(u: GrassUniforms, terrainMap: TextureSampler, wakeMap: TextureSampler) {
  const blade = float(instanceIndex);
  const row = floor(blade.add(0.5).div(u.cols));
  const col = blade.sub(row.mul(u.cols));
  const seedA = hash(blade.mul(4).add(1));
  const seedB = hash(blade.mul(4).add(2));
  const seedC = hash(blade.mul(4).add(3));
  const seedD = hash(blade.mul(4).add(4));

  const coord = vec2(col.add(seedA).div(u.cols), row.add(seedB).div(u.rows));
  const ground = (terrainMap.sample(coord) as TextureSampler).level(float(0)) as THREE.Node<"vec4">;
  const world = rowToWorld(u, coord);
  const base = vec3(world.x, ground.r, world.y);
  const depth = length(cameraPosition.sub(base));

  const clip = cameraProjectionMatrix.mul(cameraViewMatrix).mul(vec4(base, 1));
  const ndc = clip.xy.div(clip.w);
  const screen = vec2(ndc.x.mul(0.5).add(0.5), float(0.5).sub(ndc.y.mul(0.5)));
  const scatter = vec2(seedA.sub(0.5).div(u.aspect), seedD.sub(0.5)).mul(u.mouseRadius.mul(0.8));
  const wake = (wakeMap.sample(screen.add(scatter)) as TextureSampler).level(float(0)) as THREE.Node<"vec4">;
  const gustStrength = length(wake.rg);
  const join = smoothstep(seedB.mul(0.3), seedB.mul(0.3).add(0.25), gustStrength);
  const turn = seedC.sub(0.5).mul(0.9);
  const turned = vec2(
    wake.r.mul(sin(turn.add(1.57))).sub(wake.g.mul(sin(turn))),
    wake.r.mul(sin(turn)).add(wake.g.mul(sin(turn.add(1.57)))),
  );
  const rock = sin(u.time.mul(seedD.mul(1.4).add(2.2)).add(seedA.mul(6.3)).sub(depth.mul(0.6))).mul(0.5).add(0.6);
  const push = turned.mul(join).mul(seedC.mul(0.8).add(0.5)).mul(rock).mul(1.3).mul(u.mouseStrength);

  const wave = world.x.mul(0.55).add(world.y.mul(0.2)).sub(u.time.mul(1.8));
  const gust = sin(wave.add(sin(world.y.mul(0.45).add(u.time.mul(0.35))).mul(1.6)))
    .mul(0.5)
    .add(0.5);
  const flutter = sin(u.time.mul(4).add(seedC.mul(6.3))).mul(0.15);
  const sway = vec2(gust.mul(gust).mul(1.1).add(flutter).add(0.15), flutter.mul(0.6)).mul(u.wind);
  const gustPush = push.mul(depth.mul(0.12));
  const gustLength = length(gustPush);
  const lean = sway.add(gustPush.mul(min(gustLength, 1.1).div(gustLength.add(0.0001))));
  const curl = vec2(seedD.sub(0.5), seedA.sub(0.5)).mul(0.5);
  const bend = lean.add(curl);
  const bendLength = min(length(bend), 1.8);

  const t = positionGeometry.y.add(0.5);
  const keep = smoothstep(-0.45, -0.15, ground.a.add(seedA.mul(0.3)));
  const height = u.bladeHeight.mul(seedB.mul(0.9).add(0.55)).mul(mix(0.25, 1, keep));
  const width = max(u.bladeWidth.mul(seedC.mul(0.6).add(0.7)), depth.mul(0.0018)).mul(float(1).sub(t.mul(0.9)));
  const angle = seedD.sub(0.5).mul(1.4);
  const side = vec3(sin(angle.add(1.57)), 0, sin(angle)).mul(positionGeometry.x).mul(width);
  const arc = vec3(bend.x, 0, bend.y.negate()).mul(height).mul(t.mul(t));
  const rise = height.mul(t).mul(float(1).sub(bendLength.mul(0.28).mul(t)));
  const position = base.add(side).add(arc).add(vec3(0, rise, 0));

  const normal = normalize(vec3(ground.g.negate(), 1, ground.b.negate()));
  const light = clamp(dot(normal, normalize(vec3(-0.45, 0.7, 0.75))), 0, 1);
  const lit = smoothstep(0.35, 0.78, light);
  const glow = smoothstep(0.74, 0.97, light);
  const nearness = smoothstep(u.far, u.near.mul(2), depth);

  const sheen = gust.mul(u.wind).mul(t).mul(0.45);
  const tint = mix(mix(mix(u.shadow, u.grass, lit), u.highlight, glow), u.highlight, clamp(sheen, 0, 0.8));
  const shade = pow(t, float(1.4))
    .mul(0.9)
    .add(0.04)
    .mul(seedC.mul(0.5).add(0.75))
    .mul(mix(0.65, 1, nearness));
  const color = varying(tint.mul(shade), "grassyTint");

  return { position, color };
}

function applySettings(u: GrassUniforms, s: GrassSettings) {
  u.hills.value = s.hills;
  u.terrainScale.value = s.terrainScale;
  u.bladeHeight.value = 0.2 * s.bladeHeight;
  u.bladeWidth.value = 0.012 * s.bladeWidth;
  u.wind.value = s.reduce ? 0 : s.wind;
  u.mouseStrength.value = s.mouseStrength;
  u.mouseRadius.value = 0.08 * s.mouseSize;
  u.shadow.value.set(s.shadowColor);
  u.grass.value.set(s.grassColor);
  u.highlight.value.set(s.highlightColor);
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduce(mq.matches);
    read();
    mq.addEventListener?.("change", read);
    return () => mq.removeEventListener?.("change", read);
  }, []);
  return reduce;
}

export default function GrassyBackground({
  speed = 1,
  wind = 0.6,
  hills = 1,
  terrainScale = 1,
  horizon = 0.5,
  density = 1,
  bladeHeight = 1,
  bladeWidth = 1,
  mouseInteractive = true,
  mouseStrength = 1,
  mouseSize = 1,
  backgroundColor = "#000000",
  shadowColor = "#16260f",
  grassColor = "#446f22",
  highlightColor = "#b4ec5a",
  className = "",
}: GrassyBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const refreshRef = useRef<(() => void) | null>(null);
  const reduce = usePrefersReducedMotion();
  const settingsRef = useRef<GrassSettings>({
    speed,
    wind,
    hills,
    terrainScale,
    horizon,
    density,
    bladeHeight,
    bladeWidth,
    mouseInteractive,
    mouseStrength,
    mouseSize,
    backgroundColor,
    shadowColor,
    grassColor,
    highlightColor,
    reduce,
  });

  useEffect(() => {
    settingsRef.current = {
      speed,
      wind,
      hills,
      terrainScale,
      horizon,
      density,
      bladeHeight,
      bladeWidth,
      mouseInteractive,
      mouseStrength,
      mouseSize,
      backgroundColor,
      shadowColor,
      grassColor,
      highlightColor,
      reduce,
    };
    refreshRef.current?.();
  }, [
    speed,
    wind,
    hills,
    terrainScale,
    horizon,
    density,
    bladeHeight,
    bladeWidth,
    mouseInteractive,
    mouseStrength,
    mouseSize,
    backgroundColor,
    shadowColor,
    grassColor,
    highlightColor,
    reduce,
  ]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 block h-full w-full";
    canvas.setAttribute("aria-hidden", "true");
    root.appendChild(canvas);

    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: true,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!context) {
      canvas.remove();
      return;
    }

    let disposed = false;
    let ready = false;
    let onscreen = true;
    let tabVisible = !document.hidden;
    let raf = 0;
    let last = 0;
    let wakeIdle = Infinity;
    let hovering = false;
    let emitterLive = false;
    let rect = root.getBoundingClientRect();
    const pointer = new THREE.Vector2();
    const emitter = new THREE.Vector2();

    const u = createUniforms();
    const targetOptions = {
      type: THREE.HalfFloatType,
      depthBuffer: false,
    };
    const terrainTarget = new THREE.RenderTarget(TERRAIN_WIDTH, TERRAIN_HEIGHT, targetOptions);
    let wakeRead = new THREE.RenderTarget(1, 1, targetOptions);
    let wakeWrite = new THREE.RenderTarget(1, 1, targetOptions);
    const terrainMap = texture(terrainTarget.texture);
    const wakeMap = texture(wakeRead.texture);
    const wakeView = texture(wakeRead.texture);

    const quad = new THREE.PlaneGeometry(2, 2);
    const flatCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
    camera.position.set(0, CAMERA_HEIGHT, 0);

    const makePass = (node: THREE.Node<"vec4">) => {
      const passMaterial = new THREE.MeshBasicNodeMaterial();
      passMaterial.colorNode = node;
      passMaterial.transparent = true;
      passMaterial.blending = THREE.NoBlending;
      passMaterial.depthTest = false;
      passMaterial.depthWrite = false;
      const passScene = new THREE.Scene();
      passScene.add(new THREE.Mesh(quad, passMaterial));
      return { material: passMaterial, scene: passScene };
    };

    const terrainPass = makePass(buildTerrainNode(u));
    const wakePass = makePass(buildWakeNode(u, wakeMap));

    const grassNodes = buildGrassNodes(u, terrainMap, wakeView);
    const grassMaterial = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide });
    grassMaterial.positionNode = grassNodes.position;
    grassMaterial.colorNode = grassNodes.color;
    const bladeShape = new THREE.PlaneGeometry(1, 1, 1, 4);
    const bladeGeometry = new THREE.InstancedBufferGeometry();
    bladeGeometry.setIndex(bladeShape.getIndex());
    bladeGeometry.setAttribute("position", bladeShape.getAttribute("position"));
    bladeGeometry.instanceCount = 0;
    const grass = new THREE.Mesh(bladeGeometry, grassMaterial);
    grass.frustumCulled = false;
    const grassScene = new THREE.Scene();
    grassScene.add(grass);

    const renderer = new THREE.WebGPURenderer({
      canvas,
      context,
      antialias: false,
      forceWebGL: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    const renderInto = (target: THREE.RenderTarget | null, scene: THREE.Scene, view: THREE.Camera) => {
      renderer.setRenderTarget(target);
      renderer.render(scene, view);
    };

    const draw = () => {
      if (!ready || disposed) return;
      renderInto(terrainTarget, terrainPass.scene, flatCamera);
      renderInto(null, grassScene, camera);
    };

    const stepWake = (delta: number) => {
      const settings = settingsRef.current;
      let amount = 0;

      if (settings.mouseInteractive && hovering) {
        if (!emitterLive) {
          emitter.copy(pointer);
          emitterLive = true;
        }
        u.wakeFrom.value.copy(emitter);
        emitter.lerp(pointer, 1 - Math.exp(-10 * delta));
        u.wakeTo.value.copy(emitter);
        amount = Math.min(u.wakeFrom.value.distanceTo(emitter) * 20, 0.35);
      } else {
        emitterLive = false;
      }

      if (amount > 0.001) wakeIdle = 0;
      else wakeIdle += delta;
      if (wakeIdle > 8) return;

      u.wakeAmount.value = amount;
      u.wakeFade.value = Math.exp(-delta / 1.6);
      wakeMap.value = wakeRead.texture;
      renderInto(wakeWrite, wakePass.scene, flatCamera);
      wakeView.value = wakeWrite.texture;
      [wakeRead, wakeWrite] = [wakeWrite, wakeRead];
    };

    const shouldRun = () => ready && onscreen && tabVisible && !settingsRef.current.reduce;

    const tick = (now: number) => {
      raf = 0;
      if (!shouldRun()) return;
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      const speedNow = settingsRef.current.speed;
      u.time.value += delta * speedNow;
      u.drift.value += delta * speedNow * 0.02;
      if (delta > 0) stepWake(delta);
      draw();
      raf = requestAnimationFrame(tick);
    };

    const sync = () => {
      if (shouldRun()) {
        if (!raf) raf = requestAnimationFrame(tick);
        return;
      }
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };

    const layout = () => {
      const width = root.clientWidth;
      const height = root.clientHeight;
      if (!width || !height) return;
      const settings = settingsRef.current;
      const aspect = width / height;
      camera.aspect = aspect;
      camera.rotation.set(-THREE.MathUtils.degToRad(settings.horizon * 14 - 2), 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      u.aspect.value = aspect;
      u.spread.value = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * aspect * 1.25;

      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const amount = settings.density * (coarse ? 0.7 : 1);
      let cols = Math.max(40, Math.round(Math.min(width, 2400) * 0.3 * amount));
      let rows = Math.max(30, Math.round(Math.min(height, 1400) * 0.34 * amount));
      const blades = cols * rows;
      if (blades > MAX_BLADES) {
        const shrink = Math.sqrt(MAX_BLADES / blades);
        cols = Math.round(cols * shrink);
        rows = Math.round(rows * shrink);
      }
      u.cols.value = cols;
      u.rows.value = rows;
      bladeGeometry.instanceCount = cols * rows;
    };

    const resize = () => {
      rect = root.getBoundingClientRect();
      const width = root.clientWidth;
      const height = root.clientHeight;
      if (!ready || !width || !height) return;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1 : 1.5));
      renderer.setSize(width, height, false);

      const wakeWidth = Math.max(1, Math.round(width * WAKE_SCALE));
      const wakeHeight = Math.max(1, Math.round(height * WAKE_SCALE));
      wakeRead.setSize(wakeWidth, wakeHeight);
      wakeWrite.setSize(wakeWidth, wakeHeight);
      u.wakeTexel.value.set(1 / wakeWidth, 1 / wakeHeight);

      layout();
      draw();
    };

    const refresh = () => {
      const settings = settingsRef.current;
      applySettings(u, settings);
      renderer.setClearColor(new THREE.Color(settings.backgroundColor), 1);
      layout();
      sync();
      if (!raf) draw();
    };

    refreshRef.current = refresh;
    applySettings(u, settingsRef.current);

    const onPointerMove = (event: PointerEvent) => {
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      hovering = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      if (!hovering) return;
      pointer.set((x - 0.5) * (rect.width / rect.height), 0.5 - y);
    };

    const onPointerLeave = () => {
      hovering = false;
    };

    const onScroll = () => {
      rect = root.getBoundingClientRect();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        onscreen = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "128px" },
    );
    intersectionObserver.observe(root);

    const onVisibility = () => {
      tabVisible = !document.hidden;
      sync();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    renderer
      .init()
      .then(() => {
        if (disposed) return;
        ready = true;
        renderer.setClearColor(new THREE.Color(settingsRef.current.backgroundColor), 1);
        resize();
        sync();
      })
      .catch((error: unknown) => console.warn("GrassyBackground: WebGL init failed", error));

    return () => {
      disposed = true;
      refreshRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      quad.dispose();
      bladeGeometry.dispose();
      bladeShape.dispose();
      terrainPass.material.dispose();
      wakePass.material.dispose();
      grassMaterial.dispose();
      terrainTarget.dispose();
      wakeRead.dispose();
      wakeWrite.dispose();
      renderer.onDeviceLost = () => {};
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={rootRef} className={`relative h-full w-full overflow-hidden ${className}`} />;
}
