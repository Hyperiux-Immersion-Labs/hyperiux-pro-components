// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMobile, prefersReducedMotion } from "./Animations/reducedMotion";
import { useElementHeightKey, useResizeKey } from "./Animations/useResizeKey";
import { intro } from "./Animations/intro";
import { THEME, alpha, rgb } from "../theme";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type OrbPose = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  spread: number;
  energy: number;
};

type OrbStage = { enter: OrbPose; hold?: Partial<OrbPose> };

const pose = (p: Partial<OrbPose>): OrbPose => ({
  x: 0,
  y: 0,
  scale: 1,
  opacity: 1,
  spread: 0,
  energy: 0.25,
  ...p,
});

const DESKTOP: Record<string, OrbStage> = {
  hero: { enter: pose({ x: 24, y: 0, scale: 1.2 }) },
  tokens: { enter: pose({ y: 20, scale: 0.9, energy: 0.3 }), hold: { energy: 1 } },
  swarm: { enter: pose({ y: 10, scale: 0.6, energy: 0.6 }), hold: { spread: 0.5, energy: 0.9 } },
  guard: { enter: pose({ x: -24, y: 4, scale: 0.8, energy: 0.4 }), hold: { energy: 0.8 } },
  statement: { enter: pose({ scale: 0.2, opacity: 0 }) },
  metrics: { enter: pose({ x: 24, y: 4, scale: 0.6, opacity: 0, energy: 0.5 }) },
  pricing: { enter: pose({ scale: 0.6, opacity: 0, energy: 0.4 }) },
  social: { enter: pose({ scale: 0.7, opacity: 0, energy: 0.5 }) },
  faq: { enter: pose({ scale: 0.8, opacity: 0, energy: 0.6 }) },
  cta: { enter: pose({ scale: 1.5, energy: 1 }) },
  footer: { enter: pose({ scale: 1.1, opacity: 0, energy: 1 }) },
};

const MOBILE: Record<string, OrbStage> = {
  hero: { enter: pose({ x: 0, y: -18, scale: 0.9 }) },
  tokens: { enter: pose({ y: 16, scale: 0.5, energy: 0.3 }), hold: { energy: 1 } },
  swarm: { enter: pose({ y: -14, scale: 0.34, energy: 0.6 }), hold: { spread: 0.7, energy: 0.9 } },
  guard: { enter: pose({ y: -14, scale: 0.5, energy: 0.4 }), hold: { energy: 0.8 } },
  statement: { enter: pose({ scale: 0.2, opacity: 0 }) },
  metrics: { enter: pose({ y: -14, scale: 0.4, opacity: 0, energy: 0.5 }) },
  pricing: { enter: pose({ scale: 0.4, opacity: 0 }) },
  social: { enter: pose({ scale: 0.5, opacity: 0 }) },
  faq: { enter: pose({ scale: 0.6, opacity: 0 }) },
  cta: { enter: pose({ scale: 1.2, energy: 1 }) },
  footer: { enter: pose({ scale: 0.9, opacity: 0, energy: 1 }) },
};

const MIST = rgb(THEME.bone).split(",").map(Number);
const PRIMARY = rgb(THEME.primaryLight).split(",").map(Number);
const mix = (t: number) => MIST.map((v, i) => Math.round(PRIMARY[i] + (v - PRIMARY[i]) * t)).join(",");

export function heroPose() {
  const p = (isMobile() ? MOBILE : DESKTOP).hero.enter;
  return { x: (p.x * window.innerWidth) / 100, y: (p.y * window.innerHeight) / 100, scale: p.scale };
}

// Inner pages keep the globe hidden until their closing call to action
export const CTA_ONLY: { desktop: Record<string, OrbStage>; mobile: Record<string, OrbStage> } = {
  desktop: {
    hero: { enter: pose({ scale: 0.6, opacity: 0 }) },
    cta: { enter: pose({ scale: 1.5, energy: 1 }) },
    footer: { enter: pose({ scale: 1.1, opacity: 0, energy: 1 }) },
  },
  mobile: {
    hero: { enter: pose({ scale: 0.5, opacity: 0 }) },
    cta: { enter: pose({ scale: 1.2, energy: 1 }) },
    footer: { enter: pose({ scale: 0.9, opacity: 0, energy: 1 }) },
  },
};

type SignalOrbProps = { poses?: { desktop: Record<string, OrbStage>; mobile: Record<string, OrbStage> } };

const SignalOrb = ({ poses }: SignalOrbProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({ spread: 0, energy: 0.25 });
  const resizeKey = useResizeKey();
  const footerKey = useElementHeightKey("#ord-footer");

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const count = isMobile() ? 700 : 1100;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pts = Array.from({ length: count }, (_, i) => {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = golden * i;
      const u = Math.random() * Math.PI * 2;
      const v = Math.acos(Math.random() * 2 - 1);
      const k = 0.04 + Math.random() * 0.16;
      return {
        x: Math.cos(a) * r,
        y,
        z: Math.sin(a) * r,
        s: Math.random(),
        sx: Math.sin(v) * Math.cos(u) * k,
        sy: Math.sin(v) * Math.sin(u) * k,
        sz: Math.cos(v) * k,
      };
    });

    // Soft mint halo, drawn once and stamped behind every dot for the glow
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext("2d");
    if (sctx) {
      const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, alpha(THEME.primaryLight, 1));
      g.addColorStop(0.35, alpha(THEME.primaryLight, 0.35));
      g.addColorStop(1, alpha(THEME.primaryLight, 0));
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 64, 64);
    }
    const halos: number[] = [];

    let dpr = 1;
    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = wrap.offsetWidth * dpr;
      canvas.height = wrap.offsetHeight * dpr;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    const ox = new Float32Array(count);
    const oy = new Float32Array(count);
    const vx = new Float32Array(count);
    const vy = new Float32Array(count);
    const pointer = { cx: 0, cy: 0, x: -1e5, y: -1e5, vx: 0, vy: 0, active: false };

    const onMove = (e: PointerEvent) => {
      if (pointer.active) {
        const rect = canvas.getBoundingClientRect();
        const k = rect.width ? canvas.width / rect.width : 1;
        pointer.vx = pointer.vx * 0.5 + (e.clientX - pointer.cx) * k * 0.5;
        pointer.vy = pointer.vy * 0.5 + (e.clientY - pointer.cy) * k * 0.5;
      }
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = -1e5;
      pointer.y = -1e5;
    };

    const draw = (time: number) => {
      if (Number(gsap.getProperty(wrap, "opacity")) < 0.02) return;
      const { spread, energy } = state.current;
      const a = intro.done ? 1 : intro.assemble;
      const ea = a >= 1 ? 1 : 1 - Math.pow(1 - a, 3);
      const fade = 0.1 + ea * 0.9;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const R = w * 0.3;
      ctx.clearRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.5);
      glow.addColorStop(0, `rgba(${rgb(THEME.primary)},${0.14 + energy * 0.1})`);
      glow.addColorStop(0.5, alpha(THEME.primary, 0.03));
      glow.addColorStop(1, alpha(THEME.primary, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const radius = R * 0.6;
      const radius2 = radius * radius;
      const push = 2.4 * dpr;
      const links: number[] = [];
      pointer.vx *= 0.86;
      pointer.vy *= 0.86;
      if (pointer.active) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((pointer.cx - rect.left) / rect.width) * w;
        pointer.y = ((pointer.cy - rect.top) / rect.height) * h;
      }

      const spin = (window.scrollY / window.innerHeight) * 0.9;
      const ry = time * 0.14 - (1 - ea) * 2.4 + spin;
      const sinY = Math.sin(ry);
      const cosY = Math.cos(ry);
      const sinX = Math.sin(0.42);
      const cosX = Math.cos(0.42);
      const edge = (px: number, py: number) => {
        const d = Math.hypot(px - cx, py - cy);
        return Math.min(1, Math.max(0, (w * 0.49 - d) / (w * 0.12)));
      };

      // Each orbit is a real 3D circle on its own tumbling axis, so it sweeps over and behind the globe
      const rings: number[][] = [];
      const SEG = 96;
      for (let k = 0; k < 3; k++) {
        const dir = k % 2 ? -1 : 1;
        // tilt turns a full 360 degrees so the ring flips over the top and under the globe
        const tilt = time * (0.32 + k * 0.1) * dir + k * 1.05 + spin * 0.8;
        const yaw = time * (0.14 + k * 0.05) * -dir + k * 2.1;
        const roll = k * 0.7 + time * 0.05;
        const ringR = R * (1.1 + k * 0.12) * (0.6 + ea * 0.4);
        const sT = Math.sin(tilt), cT = Math.cos(tilt);
        const sW = Math.sin(yaw), cW = Math.cos(yaw);
        const sR = Math.sin(roll), cR = Math.cos(roll);
        const pts2: number[] = [];
        for (let j = 0; j <= SEG; j++) {
          const t = (j / SEG) * Math.PI * 2;
          let x = Math.cos(t) * ringR;
          let y = Math.sin(t) * ringR;
          let z = 0;
          // tilt around X
          const y1 = y * cT - z * sT;
          z = y * sT + z * cT;
          y = y1;
          // roll around Z
          const x1 = x * cR - y * sR;
          y = x * sR + y * cR;
          x = x1;
          // yaw around Y
          const x2 = x * cW + z * sW;
          z = -x * sW + z * cW;
          x = x2;
          // the globe's pitch
          const y2 = y * cosX - z * sinX;
          z = y * sinX + z * cosX;
          const persp = 1 + z / (R * 6);
          pts2.push(cx + x2 * persp, cy + y2 * persp, z / ringR);
        }
        rings.push(pts2);
      }
      const ringReach = R * 0.9;
      const drawRings = (front: boolean) => {
        for (const pts2 of rings) {
          // A blurred shadow on the line itself gives a glow that hugs the orbit instead of a band around it
          ctx.beginPath();
          for (let j = 0; j < SEG; j++) {
            const o = j * 3;
            const z = (pts2[o + 2] + pts2[o + 5]) / 2;
            if (front !== z > 0 || edge(pts2[o], pts2[o + 1]) < 0.3) continue;
            ctx.moveTo(pts2[o], pts2[o + 1]);
            ctx.lineTo(pts2[o + 3], pts2[o + 4]);
          }
          ctx.shadowColor = alpha(THEME.primaryLight, 0.9);
          ctx.shadowBlur = (front ? 10 : 6) * dpr;
          ctx.lineWidth = dpr;
          ctx.strokeStyle = `rgba(${rgb(THEME.primaryLight)},${(front ? 0.2 : 0.1) * ea * ea})`;
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";

          for (let j = 0; j < SEG; j++) {
            const o = j * 3;
            const z = (pts2[o + 2] + pts2[o + 5]) / 2;
            if (front !== z > 0) continue;
            // Segments near the cursor brighten
            let boost = 0;
            if (pointer.active) {
              const d = Math.hypot(pts2[o] - pointer.x, pts2[o + 1] - pointer.y);
              if (d < ringReach) boost = 1 - d / ringReach;
            }
            const alpha = Math.min(1, (0.08 + (z + 1) * 0.14 + energy * 0.06 + boost * 0.6) * ea * ea * edge(pts2[o], pts2[o + 1]));
            if (alpha < 0.01) continue;
            ctx.beginPath();
            ctx.moveTo(pts2[o], pts2[o + 1]);
            ctx.lineTo(pts2[o + 3], pts2[o + 4]);
            ctx.lineWidth = dpr * (1 + boost * 1.2);
            ctx.strokeStyle = `rgba(${rgb(THEME.primaryLight)},${alpha})`;
            ctx.stroke();
          }
        }
      };
      drawRings(false);

      for (let i = 0; i < count; i++) {
        const p = pts[i];
        // Two drifting layers of smooth noise keep the surface rippling all the time
        const n1 = Math.sin(p.x * 3.1 + time * 0.9) * Math.sin(p.y * 2.7 - time * 0.7) * Math.sin(p.z * 3.4 + time * 1.1);
        const n2 = Math.sin(p.x * 7.3 - time * 1.6 + p.z * 2) * Math.sin(p.y * 6.1 + time * 1.3);
        const wob = 1 + (n1 * 0.07 + n2 * 0.025) * (0.6 + energy) + Math.sin(time * 1.2 + p.s * 12) * 0.015;
        const r = R * wob * (1 + spread * p.s * 1.8);
        const x = (p.x * ea + p.sx * (1 - ea)) * r;
        const y = (p.y * ea + p.sy * (1 - ea)) * r;
        const z = (p.z * ea + p.sz * (1 - ea)) * r;
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        const depth = Math.min(1, Math.max(0, (z2 / R + 1) / 2));
        const persp = 1.8 / (1.8 - z2 / (R * 2.2));
        const bx = cx + x1 * persp;
        const by = cy + y2 * persp;

        let heat = 0;
        if (pointer.active) {
          const dx = bx + ox[i] - pointer.x;
          const dy = by + oy[i] - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius2) {
            const d = Math.sqrt(d2) || 1;
            const f = 1 - d / radius;
            const force = f * f * push * (0.4 + depth);
            vx[i] += (dx / d) * force + pointer.vx * f * 0.08;
            vy[i] += (dy / d) * force + pointer.vy * f * 0.08;
            heat = f;
            if (f > 0.45 && depth > 0.5 && links.length < 96) links.push(bx + ox[i], by + oy[i], f);
          }
        }
        vx[i] = (vx[i] - ox[i] * 0.04) * 0.9;
        vy[i] = (vy[i] - oy[i] * 0.04) * 0.9;
        ox[i] += vx[i];
        oy[i] += vy[i];

        const px = bx + ox[i];
        const py = by + oy[i];
        const e = edge(px, py);
        if (e <= 0) continue;
        const size = (0.9 + depth * 1.5 + heat * 1.6) * dpr;
        const glowA = (0.06 + depth * 0.16) * fade * e + heat * 0.75;
        if (glowA > 0.03) halos.push(px, py, size * (3.4 + heat * 4), Math.min(1, glowA));
        ctx.fillStyle = heat > 0.05
          ? `rgba(${rgb(THEME.primaryLight)},${Math.min(1, 0.3 + depth * 0.6 + heat) * e})`
          : `rgba(${mix(depth * depth)},${Math.min(1, 0.32 + depth * 0.68) * fade * e})`;
        ctx.beginPath();
        ctx.arc(px, py, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Halos are added light, so overlapping dots bloom where they bunch up under the cursor
      ctx.globalCompositeOperation = "lighter";
      for (let j = 0; j < halos.length; j += 4) {
        const gs = halos[j + 2];
        ctx.globalAlpha = halos[j + 3];
        ctx.drawImage(sprite, halos[j] - gs / 2, halos[j + 1] - gs / 2, gs, gs);
      }
      if (pointer.active) {
        const d = Math.hypot(pointer.x - cx, pointer.y - cy);
        const near = Math.max(0, 1 - d / (R * 1.5));
        if (near > 0) {
          const gs = R * 1.1;
          ctx.globalAlpha = near * 0.22;
          ctx.drawImage(sprite, pointer.x - gs / 2, pointer.y - gs / 2, gs, gs);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      halos.length = 0;

      drawRings(true);

      if (links.length) {
        ctx.lineWidth = dpr * 0.6;
        for (let j = 0; j < links.length; j += 3) {
          ctx.strokeStyle = `rgba(${rgb(THEME.primaryLight)},${links[j + 2] * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(links[j], links[j + 1]);
          ctx.stroke();
        }
      }
    };

    if (prefersReducedMotion()) {
      draw(0);
      return () => ro.disconnect();
    }

    const tick = () => draw(performance.now() / 1000);
    gsap.ticker.add(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const stages = poses ? (isMobile() ? poses.mobile : poses.desktop) : isMobile() ? MOBILE : DESKTOP;
      const vw = window.innerWidth / 100;
      const vh = window.innerHeight / 100;
      const place = (p: OrbPose) => ({ x: p.x * vw, y: p.y * vh, scale: p.scale, opacity: p.opacity });
      const inner = (p: Partial<OrbPose>) => {
        const out: Partial<OrbPose> = {};
        if (p.spread !== undefined) out.spread = p.spread;
        if (p.energy !== undefined) out.energy = p.energy;
        return out;
      };

      gsap.set(wrap, { xPercent: -50, yPercent: -50, ...place(stages.hero.enter) });
      Object.assign(state.current, inner(stages.hero.enter));

      if (prefersReducedMotion()) {
        gsap.set(wrap, { position: "absolute", top: window.innerHeight / 2 });
        return;
      }

      const total = document.documentElement.scrollHeight - window.innerHeight;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { start: 0, end: "max", scrub: 0.8 },
      });

      gsap.utils.toArray<HTMLElement>("[data-ord-orb]").forEach((el) => {
        const stage = stages[el.dataset.ordOrb ?? ""];
        if (!stage) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const height = el.offsetHeight;
        if (top > 0) {
          const lead = el.dataset.ordOrb === "footer" ? 0.7 : 1;
          const start = Math.max(0, top - window.innerHeight * lead);
          const span = top - start;
          tl.to(wrap, { ...place(stage.enter), ease: "power1.inOut", duration: span }, start);
          tl.to(state.current, { ...inner(stage.enter), duration: span }, start);
        }
        if (stage.hold && height > window.innerHeight) {
          tl.to(state.current, { ...stage.hold, duration: height - window.innerHeight }, top);
        }
      });

      tl.set({}, {}, Math.max(total, tl.duration()));

    },
    { dependencies: [resizeKey, footerKey], revertOnUpdate: true },
  );

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed left-1/2 top-1/2 z-0 h-[64vh] aspect-square max-md:h-[52vh]"
    >
      <div data-ord-orb-intro className="h-full w-full">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  );
};

export default SignalOrb;

// The globe for inner pages: hidden until the closing call to action, where it grows behind the headline
export function CtaOrb() {
  return <SignalOrb poses={CTA_ONLY} />;
}
