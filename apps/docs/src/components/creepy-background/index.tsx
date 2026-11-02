"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import {
  Fn,
  clamp,
  cos,
  dot,
  exp,
  float,
  fract,
  length,
  min,
  mix,
  mx_noise_float,
  screenCoordinate,
  screenUV,
  sin,
  smoothstep,
  texture,
  uniform,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

export interface CreepyBackgroundProps {
  speed?: number;
  scale?: number;
  warp?: number;
  heat?: number;
  grain?: number;
  voidSize?: number;
  mouseInteractive?: boolean;
  mouseStrength?: number;
  mouseSize?: number;
  trailLength?: number;
  cursorOnly?: boolean;
  backgroundColor?: string;
  coolColor?: string;
  midColor?: string;
  warmColor?: string;
  hotColor?: string;
  className?: string;
}

type CreepyUniforms = ReturnType<typeof createUniforms>;
type TextureSampler = ReturnType<typeof texture>;

interface CreepySettings {
  speed: number;
  scale: number;
  warp: number;
  heat: number;
  grain: number;
  voidSize: number;
  mouseInteractive: boolean;
  mouseStrength: number;
  mouseSize: number;
  trailLength: number;
  cursorOnly: boolean;
  backgroundColor: string;
  coolColor: string;
  midColor: string;
  warmColor: string;
  hotColor: string;
  reduce: boolean;
}

const FIELD_SCALE = 0.5;
const INK_SCALE = 0.4;
const GRAIN_FPS = 24;

function createUniforms() {
  return {
    time: uniform(0),
    seed: uniform(0),
    aspect: uniform(1),
    scale: uniform(0.8),
    warp: uniform(2.5),
    heat: uniform(2.2),
    grain: uniform(0.5),
    voidSize: uniform(0.5),
    inkFrom: uniform(new THREE.Vector2()),
    inkTo: uniform(new THREE.Vector2()),
    inkAmount: uniform(0),
    inkRadius: uniform(0.06),
    inkFade: uniform(1),
    inkStep: uniform(1),
    inkSettle: uniform(1),
    inkWake: uniform(1),
    clock: uniform(0),
    clouds: uniform(1),
    inkTexel: uniform(new THREE.Vector2(1, 1)),
    background: uniform(new THREE.Color()),
    cool: uniform(new THREE.Color()),
    mid: uniform(new THREE.Color()),
    warm: uniform(new THREE.Color()),
    hot: uniform(new THREE.Color()),
  };
}

function screenField(u: CreepyUniforms) {
  return vec2(screenUV.x.sub(0.5).mul(u.aspect), float(0.5).sub(screenUV.y)).div(
    min(u.aspect, 1),
  );
}

function buildFieldNode(u: CreepyUniforms, inkField: TextureSampler) {
  const fbm = Fn(([seed]: [THREE.Node<"vec3">]) => {
    const p = vec3(seed).toVar();
    const total = float(0).toVar();
    let amplitude = 0.5;
    for (let i = 0; i < 5; i++) {
      total.addAssign(mx_noise_float(p).mul(amplitude));
      p.assign(p.mul(2.0).add(vec3(1.7, 9.2, 0.0)));
      amplitude *= 0.47;
    }
    return total;
  }).setLayout({
    name: "creepyFbm",
    type: "float",
    inputs: [{ name: "seed", type: "vec3" }],
  });

  return Fn(() => {
    const t = u.time;
    const stir = inkField.sample(screenUV);
    const twist = stir.r.mul(1.5);
    const shove = vec2(
      stir.b.sub(stir.a.mul(twist)),
      stir.a.add(stir.b.mul(twist)),
    ).mul(35.0);
    const centered = screenField(u).sub(shove);
    const p = centered.mul(u.scale);

    const q = vec2(
      fbm(vec3(p, t.mul(0.2))),
      fbm(vec3(p.add(vec2(5.2, 1.3)), t.mul(0.2))),
    );
    const warped = p.add(q.mul(u.warp));
    const r = vec2(
      fbm(vec3(warped.add(vec2(1.7, 9.2)), t.mul(0.35))),
      fbm(vec3(warped.add(vec2(8.3, 2.8)), t.mul(0.35))),
    );
    const f = fbm(vec3(p.add(r.mul(u.warp)), t.mul(0.15)));

    const drift = vec2(sin(t.mul(0.07)), cos(t.mul(0.06))).mul(0.12);
    const hole = smoothstep(
      u.voidSize.mul(0.3),
      u.voidSize.mul(1.1),
      length(centered.sub(drift)),
    );
    const body = f.mul(u.heat).add(length(q).mul(0.6));
    const density = smoothstep(-0.15, 0.9, body).mul(hole);

    return vec4(density, f, 0, 1);
  })();
}

function buildInkNode(u: CreepyUniforms, inkMap: TextureSampler) {
  const curlAt = Fn(([point]: [THREE.Node<"vec3">]) => {
    const e = 0.03;
    const dx = mx_noise_float(point.add(vec3(e, 0, 0))).sub(
      mx_noise_float(point.sub(vec3(e, 0, 0))),
    );
    const dy = mx_noise_float(point.add(vec3(0, e, 0))).sub(
      mx_noise_float(point.sub(vec3(0, e, 0))),
    );
    return vec2(dy, dx.negate()).div(e * 2);
  }).setLayout({
    name: "creepyCurl",
    type: "vec2",
    inputs: [{ name: "point", type: "vec3" }],
  });

  return Fn(() => {
    const field = screenField(u);
    const fit = min(u.aspect, 1);
    const previous = inkMap.sample(screenUV);
    const fresh = smoothstep(0.0, 0.6, previous.g);
    const swirl = curlAt(vec3(field.mul(5.0), u.time.mul(0.6)))
      .mul(0.6)
      .add(curlAt(vec3(field.mul(11.0).add(4.3), u.time.mul(0.9))).mul(0.35));
    const velocity = previous.ba.add(swirl.mul(0.0012).mul(fresh.mul(2.5).add(1.0))).mul(u.inkStep);
    const source = screenUV.sub(
      vec2(velocity.x.mul(fit).div(u.aspect), velocity.y.negate().mul(fit)),
    );

    const spread = u.inkTexel;
    const center = inkMap.sample(source);
    const around = inkMap
      .sample(source.add(vec2(spread.x, 0)))
      .add(inkMap.sample(source.sub(vec2(spread.x, 0))))
      .add(inkMap.sample(source.add(vec2(0, spread.y))))
      .add(inkMap.sample(source.sub(vec2(0, spread.y))))
      .mul(0.25);
    const age = float(1).sub(fresh);
    const blurred = mix(
      center,
      around,
      clamp(u.inkStep.mul(0.08).mul(age.mul(1.5).add(1.0)), 0, 1),
    );

    const local = field.sub(u.inkTo);
    const flicker = vec3(local.mul(7.0), u.clock.mul(2.0));
    const bend = vec2(
      mx_noise_float(flicker),
      mx_noise_float(flicker.add(vec3(19.1, 7.3, 0))),
    ).mul(u.inkRadius.mul(1.6));
    const along = field.add(bend).sub(u.inkFrom);
    const stroke = u.inkTo.sub(u.inkFrom);
    const h = clamp(dot(along, stroke).div(dot(stroke, stroke).add(0.00001)), 0, 1);
    const offset = along.sub(stroke.mul(h));
    const gap = length(offset);
    const shape = exp(gap.mul(gap).div(u.inkRadius.mul(u.inkRadius)).negate());
    const streak = mx_noise_float(vec3(local.mul(14.0), u.clock.mul(3.0)))
      .mul(0.6)
      .add(0.7);
    const splat = shape.mul(u.inkAmount).mul(streak);
    const push = offset.div(u.inkRadius).mul(0.004);
    const wake = mix(
      blurred.ba.mul(u.inkWake),
      push,
      shape.mul(clamp(u.inkAmount.mul(8.0), 0, 1)),
    );

    return vec4(
      min(blurred.r.mul(u.inkFade).add(splat), 1.2),
      min(blurred.g.mul(u.inkSettle).add(splat.mul(3.0)), 1),
      wake,
    );
  })();
}

function buildColorNode(u: CreepyUniforms, fieldView: TextureSampler, inkView: TextureSampler) {
  const grainHash = Fn(([coord]: [THREE.Node<"vec2">]) => {
    const p3 = fract(vec3(coord.x, coord.y, coord.x).mul(0.1031)).toVar();
    p3.addAssign(dot(p3, p3.yzx.add(33.33)));
    return fract(p3.x.add(p3.y).mul(p3.z));
  }).setLayout({
    name: "creepyGrain",
    type: "float",
    inputs: [{ name: "coord", type: "vec2" }],
  });

  return Fn(() => {
    const cloud = fieldView.sample(screenUV);
    const ink = inkView.sample(screenUV).r.mul(1.7);
    const density = clamp(cloud.r.mul(u.clouds).add(ink), 0, 1);

    const noise = grainHash(
      screenCoordinate.xy.add(vec2(u.seed.mul(37.0), u.seed.mul(91.0))),
    );
    const d = clamp(
      density.add(
        noise
          .sub(0.5)
          .mul(u.grain)
          .mul(smoothstep(0.0, 0.25, density).mul(0.55)),
      ),
      0,
      1,
    );

    const color = mix(
      u.background,
      u.cool.mul(0.4),
      smoothstep(0.16, 0.3, d),
    ).toVar();
    color.assign(mix(color, u.cool, smoothstep(0.26, 0.4, d)));
    color.assign(mix(color, u.mid, smoothstep(0.34, 0.5, d)));
    color.assign(mix(color, u.warm, smoothstep(0.54, 0.7, d)));
    color.assign(mix(color, u.hot, smoothstep(0.78, 0.95, d)));
    return color;
  })();
}

function applySettings(u: CreepyUniforms, s: CreepySettings) {
  u.scale.value = s.scale;
  u.warp.value = s.warp;
  u.heat.value = s.heat;
  u.grain.value = s.grain;
  u.voidSize.value = s.voidSize;
  u.inkRadius.value = 0.04 * s.mouseSize;
  u.clouds.value = s.cursorOnly ? 0 : 1;
  u.background.value.set(s.backgroundColor);
  u.cool.value.set(s.coolColor);
  u.mid.value.set(s.midColor);
  u.warm.value.set(s.warmColor);
  u.hot.value.set(s.hotColor);
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

export default function CreepyBackground({
  speed = 0.15,
  scale = 1.1,
  warp = 2.5,
  heat = 2.2,
  grain = 0.5,
  voidSize = 0.5,
  mouseInteractive = true,
  mouseStrength = 1,
  mouseSize = 1,
  trailLength = 2,
  cursorOnly = false,
  backgroundColor = "#000000",
  coolColor = "#2a1aff",
  midColor = "#e04cff",
  warmColor = "#ffa01e",
  hotColor = "#d0101a",
  className = "",
}: CreepyBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const refreshRef = useRef<(() => void) | null>(null);
  const reduce = usePrefersReducedMotion();
  const settingsRef = useRef<CreepySettings>({
    speed,
    scale,
    warp,
    heat,
    grain,
    voidSize,
    mouseInteractive,
    mouseStrength,
    mouseSize,
    trailLength,
    cursorOnly,
    backgroundColor,
    coolColor,
    midColor,
    warmColor,
    hotColor,
    reduce,
  });

  useEffect(() => {
    settingsRef.current = {
      speed,
      scale,
      warp,
      heat,
      grain,
      voidSize,
      mouseInteractive,
      mouseStrength,
      mouseSize,
      trailLength,
      cursorOnly,
      backgroundColor,
      coolColor,
      midColor,
      warmColor,
      hotColor,
      reduce,
    };
    refreshRef.current?.();
  }, [
    speed,
    scale,
    warp,
    heat,
    grain,
    voidSize,
    mouseInteractive,
    mouseStrength,
    mouseSize,
    trailLength,
    cursorOnly,
    backgroundColor,
    coolColor,
    midColor,
    warmColor,
    hotColor,
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
      depth: false,
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
    let grainClock = 0;
    let inkIdle = Infinity;
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
    const fieldTarget = new THREE.RenderTarget(1, 1, targetOptions);
    let inkRead = new THREE.RenderTarget(1, 1, targetOptions);
    let inkWrite = new THREE.RenderTarget(1, 1, targetOptions);
    const fieldView = texture(fieldTarget.texture);
    const inkMap = texture(inkRead.texture);
    const inkView = texture(inkRead.texture);
    const inkField = texture(inkRead.texture);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const makePass = (node: THREE.Node<"vec3"> | THREE.Node<"vec4">) => {
      const passMaterial = new THREE.MeshBasicNodeMaterial();
      passMaterial.colorNode = node;
      const passScene = new THREE.Scene();
      passScene.add(new THREE.Mesh(geometry, passMaterial));
      return { material: passMaterial, scene: passScene };
    };

    const fieldPass = makePass(buildFieldNode(u, inkField));
    const inkPass = makePass(buildInkNode(u, inkMap));
    inkPass.material.transparent = true;
    inkPass.material.blending = THREE.NoBlending;
    const colorPass = makePass(buildColorNode(u, fieldView, inkView));

    const renderer = new THREE.WebGPURenderer({
      canvas,
      context,
      antialias: false,
      depth: false,
      forceWebGL: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    const renderInto = (
      target: THREE.RenderTarget | null,
      pass: { scene: THREE.Scene },
    ) => {
      renderer.setRenderTarget(target);
      renderer.render(pass.scene, camera);
    };

    const draw = () => {
      if (!ready || disposed) return;
      if (!settingsRef.current.cursorOnly) renderInto(fieldTarget, fieldPass);
      renderInto(null, colorPass);
    };

    const stepInk = (delta: number) => {
      const settings = settingsRef.current;
      let amount = 0;

      if (settings.mouseInteractive && hovering) {
        if (!emitterLive) {
          emitter.copy(pointer);
          emitterLive = true;
        }
        u.inkFrom.value.copy(emitter);
        emitter.lerp(pointer, 1 - Math.exp(-14 * delta));
        u.inkTo.value.copy(emitter);
        const travel = u.inkFrom.value.distanceTo(emitter);
        amount = Math.min(travel * 6, 0.35) * settings.mouseStrength;
      } else {
        emitterLive = false;
      }

      if (amount > 0.001) inkIdle = 0;
      else inkIdle += delta;
      if (inkIdle > settings.trailLength * 6 + 1) return;

      u.inkAmount.value = amount;
      u.inkFade.value = Math.exp(-delta / Math.max(settings.trailLength, 0.1));
      u.inkStep.value = delta * 60;
      u.inkSettle.value = Math.exp(-delta / 0.35);
      u.inkWake.value = Math.exp(-delta / 0.8);
      inkMap.value = inkRead.texture;
      renderInto(inkWrite, inkPass);
      inkView.value = inkWrite.texture;
      inkField.value = inkWrite.texture;
      [inkRead, inkWrite] = [inkWrite, inkRead];
    };

    const shouldRun = () =>
      ready && onscreen && tabVisible && !settingsRef.current.reduce;

    const tick = (now: number) => {
      raf = 0;
      if (!shouldRun()) return;
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      u.time.value += delta * settingsRef.current.speed;
      u.clock.value += delta;
      grainClock += delta;
      if (grainClock >= 1 / GRAIN_FPS) {
        grainClock = 0;
        u.seed.value = (u.seed.value + 1) % 100;
      }
      if (delta > 0) stepInk(delta);
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

    const resize = () => {
      rect = root.getBoundingClientRect();
      const width = root.clientWidth;
      const height = root.clientHeight;
      if (!ready || !width || !height) return;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1 : 1.5));
      renderer.setSize(width, height, false);

      const fieldWidth = Math.max(1, Math.round(width * FIELD_SCALE));
      const fieldHeight = Math.max(1, Math.round(height * FIELD_SCALE));
      fieldTarget.setSize(fieldWidth, fieldHeight);

      const inkWidth = Math.max(1, Math.round(width * INK_SCALE));
      const inkHeight = Math.max(1, Math.round(height * INK_SCALE));
      inkRead.setSize(inkWidth, inkHeight);
      inkWrite.setSize(inkWidth, inkHeight);
      u.inkTexel.value.set(1 / inkWidth, 1 / inkHeight);

      u.aspect.value = width / height;
      draw();
    };

    refreshRef.current = () => {
      applySettings(u, settingsRef.current);
      sync();
      if (!raf) draw();
    };
    applySettings(u, settingsRef.current);

    const onPointerMove = (event: PointerEvent) => {
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      hovering = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      if (!hovering) return;
      const aspect = rect.width / rect.height;
      const fit = Math.min(aspect, 1);
      pointer.set(((x - 0.5) * aspect) / fit, (0.5 - y) / fit);
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
        resize();
        sync();
      })
      .catch((error: unknown) => console.warn("CreepyBackground: WebGL init failed", error));

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
      geometry.dispose();
      fieldPass.material.dispose();
      inkPass.material.dispose();
      colorPass.material.dispose();
      fieldTarget.dispose();
      inkRead.dispose();
      inkWrite.dispose();
      renderer.onDeviceLost = () => {};
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
    />
  );
}
