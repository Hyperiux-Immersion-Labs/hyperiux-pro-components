// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, type RefObject } from "react";
import { theme } from "../content";
import { isMobile, prefersReducedMotion } from "./Animations/reducedMotion";

export type GlobeDriver = { form: number; spin: number; glow: number };

export const globeDriver = (form = 0): GlobeDriver => ({ form, spin: 0, glow: 0 });

type Props = {
  driver: RefObject<GlobeDriver>;
  density?: number;
  bounded?: boolean;
  className?: string;
};

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

const NEIGHBOURS = 3;
const PULSES = 6;

export default function ParticleGlobe({ driver, density = 1, bounded = false, className = "" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const mobile = isMobile();
    const reduced = prefersReducedMotion();
    const mint = rgb(theme.mint);
    const glowHex = rgb(theme.mintHighlight);
    const muted = rgb(theme.textOnDarkMuted);
    const raised = rgb(theme.raised);
    const surface = rgb(theme.surface);

    const count = Math.round((mobile ? 240 : 460) * density);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const px = new Float32Array(count);
    const py = new Float32Array(count);
    const pz = new Float32Array(count);
    const sx = new Float32Array(count);
    const sy = new Float32Array(count);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = golden * i;
      px[i] = Math.cos(a) * r;
      py[i] = y;
      pz[i] = Math.sin(a) * r;
      const k = 1.3 + Math.random() * 0.9;
      const u = Math.random() * Math.PI * 2;
      const v = Math.acos(Math.random() * 2 - 1);
      sx[i] = Math.sin(v) * Math.cos(u) * k;
      sy[i] = Math.sin(v) * Math.sin(u) * k;
      sz[i] = Math.cos(v) * k;
    }

    const seen = new Set<number>();
    const links: number[] = [];
    const adjacency: number[][] = Array.from({ length: count }, () => []);
    for (let i = 0; i < count; i++) {
      const best: [number, number][] = [];
      for (let j = 0; j < count; j++) {
        if (i === j) continue;
        const d = (px[i] - px[j]) ** 2 + (py[i] - py[j]) ** 2 + (pz[i] - pz[j]) ** 2;
        if (best.length < NEIGHBOURS) best.push([d, j]);
        else if (d < best[NEIGHBOURS - 1][0]) best[NEIGHBOURS - 1] = [d, j];
        else continue;
        best.sort((a, b) => a[0] - b[0]);
      }
      for (const [, j] of best) {
        const key = Math.min(i, j) * count + Math.max(i, j);
        if (seen.has(key)) continue;
        seen.add(key);
        links.push(i, j);
        adjacency[i].push(j);
        adjacency[j].push(i);
      }
    }

    const pulses = Array.from({ length: PULSES }, () => {
      const a = Math.floor(Math.random() * count);
      return { a, b: adjacency[a][0], t: Math.random(), speed: 0.9 + Math.random() * 0.8 };
    });

    const qx = new Float32Array(count);
    const qy = new Float32Array(count);
    const qd = new Float32Array(count);

    let dpr = 1;
    let w = 0;
    let h = 0;
    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
      w = canvas.width = Math.max(1, Math.round(wrap.offsetWidth * dpr));
      h = canvas.height = Math.max(1, Math.round(wrap.offsetHeight * dpr));
    };
    fit();

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, cx: -1e5, cy: -1e5 };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      pointer.cx = ((e.clientX - rect.left) / rect.width) * w;
      pointer.cy = ((e.clientY - rect.top) / rect.height) * h;
      pointer.tx = Math.max(-1, Math.min(1, (e.clientX - rect.left - rect.width / 2) / rect.width));
      pointer.ty = Math.max(-1, Math.min(1, (e.clientY - rect.top - rect.height / 2) / rect.height));
    };

    const draw = (time: number, dt: number) => {
      const state = driver.current ?? { form: 1, spin: 0, glow: 0 };
      const form = reduced ? 1 : Math.min(1, Math.max(0, state.form));
      const ef = 1 - Math.pow(1 - form, 3);
      const glow = state.glow;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * (bounded ? 0.31 : 0.42);
      ctx.clearRect(0, 0, w, h);
      if (form <= 0.001) return;

      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      const halo = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, Math.min(w, h) * 0.5);
      halo.addColorStop(0, `rgba(${mint},${(0.07 + glow * 0.05) * ef})`);
      halo.addColorStop(1, `rgba(${mint},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      const body = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.3, 0, cx, cy, R);
      body.addColorStop(0, `rgba(${raised},${0.75 * ef})`);
      body.addColorStop(0.8, `rgba(${surface},${0.45 * ef})`);
      body.addColorStop(1, `rgba(${mint},${0.1 * ef})`);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R * ef, 0, Math.PI * 2);
      ctx.fill();

      const ry = (reduced ? 0.6 : time * 0.05) + state.spin + pointer.x * 0.4;
      const rx = 0.35 + pointer.y * 0.25;
      const sinY = Math.sin(ry);
      const cosY = Math.cos(ry);
      const sinX = Math.sin(rx);
      const cosX = Math.cos(rx);
      const reach = R * 0.4;
      const pdx = pointer.cx;
      const pdy = pointer.cy;

      for (let i = 0; i < count; i++) {
        const x = (px[i] * ef + sx[i] * (1 - ef)) * R;
        const y = (py[i] * ef + sy[i] * (1 - ef)) * R;
        const z = (pz[i] * ef + sz[i] * (1 - ef)) * R;
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        let bx = cx + x1;
        let by = cy + y2;
        const dx = bx - pdx;
        const dy = by - pdy;
        const d2 = dx * dx + dy * dy;
        if (d2 < reach * reach) {
          const d = Math.sqrt(d2) || 1;
          const f = 1 - d / reach;
          bx += (dx / d) * f * f * 10 * dpr;
          by += (dy / d) * f * f * 10 * dpr;
        }
        qx[i] = bx;
        qy[i] = by;
        qd[i] = Math.min(1, Math.max(0, (z2 / R + 1) / 2));
      }

      ctx.lineWidth = 0.6 * dpr;
      const linkAlpha = [0.05, 0.11, 0.2];
      for (let bucket = 0; bucket < 3; bucket++) {
        ctx.strokeStyle = `rgba(${mint},${linkAlpha[bucket] * ef * ef * (1 + glow * 0.6)})`;
        ctx.beginPath();
        for (let k = 0; k < links.length; k += 2) {
          const a = links[k];
          const b = links[k + 1];
          const depth = (qd[a] + qd[b]) / 2;
          if (Math.min(2, Math.floor(depth * 3)) !== bucket) continue;
          ctx.moveTo(qx[a], qy[a]);
          ctx.lineTo(qx[b], qy[b]);
        }
        ctx.stroke();
      }

      const dotColor = [`rgba(${muted},${0.3 * ef})`, `rgba(${mint},${0.6 * ef})`, `rgba(${glowHex},${0.95 * ef})`];
      const dotSize = [0.9, 1.3, 1.8];
      for (let bucket = 0; bucket < 3; bucket++) {
        ctx.fillStyle = dotColor[bucket];
        ctx.beginPath();
        const s = dotSize[bucket] * dpr;
        for (let i = 0; i < count; i++) {
          if (Math.min(2, Math.floor(qd[i] * 3)) !== bucket) continue;
          ctx.moveTo(qx[i] + s, qy[i]);
          ctx.arc(qx[i], qy[i], s, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      if (form > 0.9 && !reduced) {
        for (const p of pulses) {
          p.t += dt * p.speed;
          if (p.t >= 1) {
            const next = adjacency[p.b];
            p.a = p.b;
            p.b = next[Math.floor(Math.random() * next.length)];
            p.t = 0;
          }
          const t0 = Math.max(0, p.t - 0.35);
          const ax = qx[p.a] + (qx[p.b] - qx[p.a]) * t0;
          const ay = qy[p.a] + (qy[p.b] - qy[p.a]) * t0;
          const hx = qx[p.a] + (qx[p.b] - qx[p.a]) * p.t;
          const hy = qy[p.a] + (qy[p.b] - qy[p.a]) * p.t;
          const depth = (qd[p.a] + qd[p.b]) / 2;
          const alpha = (0.25 + depth * 0.75) * (form - 0.9) * 10;
          ctx.strokeStyle = `rgba(${glowHex},${alpha * 0.8})`;
          ctx.lineWidth = 1.2 * dpr;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(hx, hy);
          ctx.stroke();
          ctx.fillStyle = `rgba(${glowHex},${alpha})`;
          ctx.beginPath();
          ctx.arc(hx, hy, 1.8 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (bounded) {
        const ring = R * 1.42;
        const sweep = Math.min(1, form * 1.15);
        ctx.strokeStyle = `rgba(${mint},0.4)`;
        ctx.lineWidth = dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, ring, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sweep);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${mint},0.12)`;
        ctx.beginPath();
        ctx.arc(cx, cy, ring * 1.08, 0, Math.PI * 2 * sweep);
        ctx.stroke();
        for (let n = 0; n < 4; n++) {
          const ang = -Math.PI / 2 + (n * Math.PI) / 2;
          if ((n / 4) > sweep) continue;
          const nx = cx + Math.cos(ang) * ring;
          const ny = cy + Math.sin(ang) * ring;
          ctx.fillStyle = `rgba(${mint},0.18)`;
          ctx.beginPath();
          ctx.arc(nx, ny, 6 * dpr, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(${glowHex},0.95)`;
          ctx.beginPath();
          ctx.arc(nx, ny, 2.6 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    let raf = 0;
    let last = performance.now();
    let onscreen = false;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(now / 1000, dt);
      if (onscreen && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (reduced || raf || !onscreen || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(() => {
      fit();
      draw(performance.now() / 1000, 0);
    });
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => {
      onscreen = entry.isIntersecting;
      if (onscreen) start();
    });
    io.observe(wrap);
    const onVisibility = () => start();
    document.addEventListener("visibilitychange", onVisibility);
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });
    draw(0, 0);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
    };
  }, [driver, density, bounded]);

  return (
    <div ref={wrapRef} aria-hidden className={`pointer-events-none relative aspect-square ${className}`.trim()}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
