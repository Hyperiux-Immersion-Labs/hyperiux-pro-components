// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, type RefObject } from "react";
import { prefersReducedMotion, viewportTier } from "./Animations/reducedMotion";

export type FieldState = { order: number; intensity: number };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  t: number;
  lane: number;
  speed: number;
};

const COUNTS = { desktop: 72, tablet: 46, mobile: 26 };

type ParticleFieldProps = { state: RefObject<FieldState>; className?: string };

export default function ParticleField({ state, className = "" }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999 };

    const home = (p: Particle) => {
      const t = p.t;
      const x = t * w;
      const y = h * (1.02 - p.lane * 0.07) - Math.pow(t, 2.1) * h * 0.82;
      return [x, y];
    };

    const seed = () => {
      const count = COUNTS[viewportTier()];
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: 0.5 + Math.random() * 1.1,
        a: 0.25 + Math.random() * 0.5,
        t: Math.random(),
        lane: i % 4,
        speed: 0.00025 + Math.random() * 0.0004,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const linkDist = () => Math.min(120, w * 0.09);

    const frame = () => {
      const { order, intensity } = state.current ?? { order: 0, intensity: 1 };
      ctx.clearRect(0, 0, w, h);
      if (intensity <= 0.001) return;
      const L = linkDist();
      const L2 = L * L;
      const R = 150;

      for (const p of particles) {
        if (!reduce) {
          p.t = (p.t + p.speed * (0.4 + order)) % 1;
          const [hx, hy] = home(p);
          p.vx += (hx - p.x) * 0.0009 * order + (Math.random() - 0.5) * 0.02;
          p.vy += (hy - p.y) * 0.0009 * order + (Math.random() - 0.5) * 0.02;
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * 0.35;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;
        }
      }

      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < L2) {
            ctx.strokeStyle = `rgba(174,184,232,${(1 - Math.sqrt(d2) / L) * 0.14 * intensity})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const mx = a.x - mouse.x;
        const my = a.y - mouse.y;
        const md = Math.sqrt(mx * mx + my * my);
        if (md < R) {
          ctx.strokeStyle = `rgba(232,234,245,${(1 - md / R) * 0.18 * intensity})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      for (const p of particles) {
        ctx.fillStyle = `rgba(232,234,245,${p.a * intensity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      frame();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();

    if (reduce) {
      for (const p of particles) {
        const [hx, hy] = home(p);
        p.x += (hx - p.x) * 0.35;
        p.y += (hy - p.y) * 0.35;
      }
      frame();
      const onResize = () => {
        resize();
        frame();
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    let width = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === width && viewportTier() !== "desktop") return;
      width = window.innerWidth;
      resize();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [state]);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
