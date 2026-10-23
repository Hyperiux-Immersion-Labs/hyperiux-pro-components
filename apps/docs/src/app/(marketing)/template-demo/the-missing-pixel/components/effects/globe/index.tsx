// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef, useState } from "react";

type GlobeProps = {
  mapColor?: string;
  activeIndex?: number;
  className?: string;
};

type Studio = {
  city: string;
  zone: string;
  lat: number;
  lon: number;
};

const N = 16000;
const LAND = "AAAAAAAAACAgJASEhIAAEJJCBkLICggpIWEhZAQElYABMncABkLAgRkZAAdm7MjMmJEhM3MEZs3MpZl1EvN24tvce4tve+lt/v2dt733dv/+ytv/+zt/e+3t/e+1tfv/Vv7+ytv5/ztr/+2t/P2Vt/P2Vtbu31t5eytv9++trN23t/L3Vs7u30l5Oysr5e+kzJybk3J3Vn7OzGmZOyMv5+6k7JyR03N3Rn7O3cnZOSMn5+bE/Jyb13NzQn7PzOn5OTM35+bk/Zyb03NzWm7Pzen5OTW37+bk3J6b03Nzam7Ozem5OTUn5+bUnJybk3Nyam7Ozek5OTW35+bUnJyb03Nyam7Ozak5OTW35+bUnJyfU3Nzak7Ozei5OT2j5+bUnJybU3NzakbOyak5OTOj5uTEjJyT0XNyakbNycg5PSOj5uTEjJqRkXNqakbNyYgZNScn5+TEjJqRE3NqTk7Myak5NSMnZtSEnJqTE3NqRkzPqQk5NSMmZtSEmJiTE3JqRkzM6Qk5NSMmZtSUnJyTU3JqRk7NiAk5PSOm5sSEiJ6RUzJyRkzNqQk5PSOnZPSMmJoREzJqRkzJ6AkZNSOmZNSEmJrREzJqRkzJqAk5NaOmZNSEmJJRUzJqTkzJqAkxJaem5NSEmJJTU3JqSk3JqSkxJaem5NSUmJJTUHJKTknJKSkxJaek9NSUkpJTUGJKSknJKSk1JaekxNSckpJTUGJKSknJKSklJaekxFSUkpJTUGpKSkmJKCglJaek1BSckoJTUEoKSknJKCklBaek1BSckgJTUkoKSkmpKCklBaaklBSUkoJTU0oqSEmpqCklBaaklBSQmkJTUkqKSEmpqSA1BYaklFSQmkJBUkoKTEmpqSA1BYaElBSQkkJBQGqqDAkpKSA1hYak1FQQkkJBQWoKDAmpKSAlhYaA1BQQklJBQGoKCwGpKSAkhYKA1BQQglJRQEgKCQGpKSAUhYCA0BQWglJCQGgKCQGpKSAUhYCAUBQWAlJCQCgKCQGpKCAEpYCAUBQSAlJAQCgKCQEhKCwEpYCAUBQSAlJQQAgKCQEhISwEpICCUBQWAkJCQQgoCQUhoSwEpKSCUFQSAkJCQQhICQUhoCQEhKSCUFASCkJCQQhICQUhoCwUpISCUFASCkJAUQgICQUhoCQUhISiEFASikJAUQhISQUhoCQUhICCEFASikJAQSgoQQUBoCQVlYCCEFAQCgJAQSgqQAUBoCAVFYCCQFAACgJQQSgqQAUBoCAVFICCQFSACgJAQSgqAAWBqAAVBICiUFSACgJQASgqAAWBqAAVBYACUFQAigJRASooAAWhqAAVBKICUFQACgJRESooAEWgqAgVFaIiUFAACgJRESoqBAWgoAAVFKICVFQECkhRASooRAWgoAgVEKIiUFQEikhRESooBgWkoAgUEIICUFQMCkhBESogBgWkqAgUEIICUFQMCshBESggBgWkoAgUEIICcFAMCkhBESogBAWkoAgVEIICUECMCkhBESogBAWgqBgVkKICUEQMCkhRESggRAWgqBAUkKICcEAMCkBBASggBAWggBAUkIICUEAICkBBASggBQWggBAUgIIiUEAICkBBASgCBQWggBAUgYIiUEQKCkABISgKBQWggBAUgIICUAQKCkARISgKBUWgiBQUgKICUBQKCkARISgCBUWgKBQUgCICUBQKikBRKSgCRUSgKBQUgCIDUASKikBRCSgCRUagKBQUgSICUASKiEBRCCgCRQSgCBQRgaISUASKiEBRKCACRUSgCBQRgaIQVASKiEARKCICRQWoCBQRgaIRVASKiEARKCICRQGoCBQRgSJQRASKglARKCICRQGoCBQBoSJQRASKglARKAICRaCoCBQBoSJQBASKglARKAICRaCICBQBoSJQBASKgBERKAJCRaAICBQBoSJQBASKwBERKAJCRaAICBQBISJQBASKQBEQKAJCRaAICBQBIyJQBISKQBEQKAJCRKAICBQBIiBQBISIQBEQKAJGRKAICBQBIiBQAISIQBEQKABEQKAACBGBIiBQAIyAQAEQIABEQKAACAGBAiBAAIiAAAEQIAAEQIAAGAEAAiAAAAiEAAEQAAAEQIAAEAAAAiAAAAiEAAEwAAAEQIAAEAABAiAAAAiEAAEgAAAEQAAAEAAAAAAAAAgEAAAgAAAEAAAAEAAAAEAAAAiAAAAgEAAAQAAAEAAAAEAAAAiAAAAgAAAAAAAAEAAAAEAgAAAAAAAgAAAAgEAAAAAAAEAAAAAAgQAAAAAAgAAAAAAAAUAAAAAAAQAAAAAAgAAAAAACAEAAAAAAAQAAAAAAgAAAAAACAAAAAAAAAQAAAAQAAAAAAAACAAAAAAAAAQAAAAQAAAAAAAACAAAAAAAAAAAAAAQAAAAAABACAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
const B = 6;
const TILT = (18 * Math.PI) / 180;
const SPIN = -(5 * Math.PI) / 180;
const GA = Math.PI * (3 - Math.sqrt(5));
const rad = (d: number) => (d * Math.PI) / 180;
const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const inOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const band = (v: number) => Math.max(0, Math.min(B - 1, (v * B) | 0));
const formatTime = (zone: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: zone }).format(new Date());
const formatCoord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? pos : neg}`;

const GROUPS = [
  { col: "#FFFFFF", k: 0.7, a: (v: number) => 0.025 + 0.07 * v },
  { col: "#FFFFFF", k: 0.7, a: (v: number) => 0.04 + 0.09 * v },
  { col: "#FFFFFF", k: 0.9, a: (v: number) => 0.05 + 0.42 * v ** 2.5 },
  { col: "land", k: 1.2, a: (v: number) => 0.42 + 0.58 * v },
  { col: "#ff5f00", k: 1.5, a: (v: number) => v },
];

const Globe = ({ mapColor = "#ff5f00", activeIndex = 0, className = "" }: GlobeProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<Array<HTMLDivElement | null>>([]);
  const selectRef = useRef<(index: number) => void>(() => {});
  const [active, setActive] = useState(activeIndex);
  const [times, setTimes] = useState<string[]>(STUDIOS.map(() => ""));

  useEffect(() => {
    const tick = () => setTimes(STUDIOS.map((studio) => formatTime(studio.zone)));
    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !root || !ctx) return;

    const bits = Uint8Array.from(atob(LAND), (c) => c.charCodeAt(0));
    const P = new Float32Array(N * 3);
    const isLand = new Uint8Array(N);
    const phase = new Float32Array(N);
    const spark = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const y = 1 - ((i + 0.5) / N) * 2;
      const r = Math.sqrt(1 - y * y);
      const lon = ((i * GA) % (Math.PI * 2)) - Math.PI;
      P[i * 3] = r * Math.sin(lon);
      P[i * 3 + 1] = y;
      P[i * 3 + 2] = r * Math.cos(lon);
      isLand[i] = (bits[i >> 3] >> (i & 7)) & 1;
      const hsh = Math.sin(i * 12.9898) * 43758.5453;
      const rnd = hsh - Math.floor(hsh);
      phase[i] = rnd * Math.PI * 2;
      spark[i] = rnd < 0.045 ? 1 : 0;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const studios = STUDIOS.map((studio) => {
      const lat = rad(studio.lat);
      const lon = rad(studio.lon);
      return { ...studio, rlat: lat, rlon: lon, v: [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)] };
    });

    let viewLon = studios[0].rlon;
    let viewLat = TILT;
    let targetLon = studios[0].rlon;
    let targetLat = TILT;
    let current = 0;
    let size = 0;
    let dpr = 1;
    let raf = 0;
    let now = 0;
    let arcIn = reduceMotion ? 1 : 0;
    let last = 0;
    let vel = SPIN;
    let mode: "spin" | "drag" | "goto" = "spin";
    let holdUntil = 0;
    let visible = false;
    let dragLon = 0;
    let dragX: number | null = null;
    let tween: { t0: number; lon0: number; lat0: number; dl: number; dlat: number; dur: number } | null = null;

    const buckets: number[][][] = GROUPS.map(() => Array.from({ length: B }, () => [] as number[]));
    const lightLen = Math.hypot(-0.45, 0.55, 0.7);
    const L = [-0.45 / lightLen, 0.55 / lightLen, 0.7 / lightLen];

    const project = (x: number, y: number, z: number) => {
      const sl = Math.sin(viewLon);
      const cl = Math.cos(viewLon);
      const sp = Math.sin(viewLat);
      const cp = Math.cos(viewLat);
      const x1 = x * cl - z * sl;
      const z1 = x * sl + z * cl;
      return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const R = Math.min(w, h) * 0.38;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(cx, cy + R * 0.12, R * 0.85, cx, cy + R * 0.12, R * 1.6);
      g.addColorStop(0, "rgba(255,95,0,0.2)");
      g.addColorStop(0.35, "rgba(255,95,0,0.06)");
      g.addColorStop(1, "rgba(255,95,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const body = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, 0, cx, cy, R);
      body.addColorStop(0, "#0a0a0a");
      body.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      const d = Math.max(0.9 * dpr, R / 175);
      const sl = Math.sin(viewLon);
      const cl = Math.cos(viewLon);
      const sp = Math.sin(viewLat);
      const cp = Math.cos(viewLat);
      const t = now / 1000;
      for (const gr of buckets) for (const b of gr) b.length = 0;
      for (let i = 0, j = 0; i < N; i++, j += 3) {
        const x = P[j];
        const y = P[j + 1];
        const z0 = P[j + 2];
        const x1 = x * cl - z0 * sl;
        const z1 = x * sl + z0 * cl;
        const y2 = y * cp - z1 * sp;
        const z2 = y * sp + z1 * cp;
        const sx = cx + x1 * R;
        const sy = cy - y2 * R;
        const ld = isLand[i];
        if (z2 <= 0) {
          buckets[ld][band(1 + z2)].push(sx, sy);
          continue;
        }
        if (ld) buckets[3][band(Math.max(0, x1 * L[0] + y2 * L[1] + z2 * L[2]) * 0.8 + 0.2 * z2)].push(sx, sy);
        else buckets[2][band(1 - z2)].push(sx, sy);
        if (spark[i] && !reduceMotion) {
          const s = Math.sin(t * 1.6 + phase[i] * 3) * 0.5 + 0.5;
          const v = s ** 14;
          if (v > 0.08) buckets[4][band(v)].push(sx, sy);
        }
      }
      GROUPS.forEach((gr, n) => {
        const s = d * gr.k;
        const hs = s / 2;
        ctx.fillStyle = gr.col === "land" ? mapColor : gr.col;
        buckets[n].forEach((pts, b) => {
          if (!pts.length) return;
          ctx.globalAlpha = gr.a((b + 0.5) / B);
          ctx.beginPath();
          for (let k = 0; k < pts.length; k += 2) ctx.rect(pts[k] - hs, pts[k + 1] - hs, s, s);
          ctx.fill();
        });
      });

      if (arcIn > 0.01) {
        const a = studios[current].v;
        ctx.fillStyle = mapColor;
        studios.forEach((s, n) => {
          if (n === current) return;
          const b = s.v;
          const om = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
          const lift = 0.06 + (0.22 * om) / Math.PI;
          const steps = Math.max(36, Math.round(om * 72));
          const so = Math.sin(om);
          const pt = (u: number): [number, number, boolean] => {
            const ka = Math.sin((1 - u) * om) / so;
            const kb = Math.sin(u * om) / so;
            const hh = 1 + lift * Math.sin(Math.PI * u);
            const [x, y, z] = project((a[0] * ka + b[0] * kb) * hh, (a[1] * ka + b[1] * kb) * hh, (a[2] * ka + b[2] * kb) * hh);
            return [cx + x * R, cy - y * R, z > 0 || x * x + y * y > 1];
          };
          const shown = Math.min(1, arcIn * 1.4 - n * 0.08);
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          for (let k = 1; k < steps; k++) {
            const u = k / steps;
            if (u > shown) break;
            const [px, py, vis] = pt(u);
            if (vis) ctx.rect(px - d / 2, py - d / 2, d, d);
          }
          ctx.fill();
          if (!reduceMotion && shown >= 1) {
            const u0 = (t * 0.32 + n * 0.29) % 1;
            for (let k = 0; k < 4; k++) {
              const u = u0 - k * 0.018;
              if (u <= 0) break;
              const [px, py, vis] = pt(u);
              if (!vis) continue;
              const ps = d * (1.9 - k * 0.3);
              ctx.globalAlpha = 1 - k * 0.24;
              ctx.fillStyle = k ? mapColor : "#ff5f00";
              ctx.fillRect(px - ps / 2, py - ps / 2, ps, ps);
            }
            ctx.fillStyle = mapColor;
          }
        });
      }
      ctx.globalAlpha = 1;

      studios.forEach((s, i) => {
        const pin = pinRefs.current[i];
        if (!pin) return;
        const [x, y, z] = project(s.v[0], s.v[1], s.v[2]);
        const px = (cx + x * R) / dpr;
        const py = (cy - y * R) / dpr;
        pin.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
        pin.style.opacity = String(z > 0.12 ? 1 : Math.max(0, z / 0.12));
      });
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = r.width;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      draw();
    };

    const loop = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
      last = t;
      now = t;
      arcIn += (1 - arcIn) * ease(1.6, dt);
      if (mode === "drag") {
        const step = wrap(dragLon - viewLon) * ease(22, dt);
        viewLon += step;
        vel += (step / dt - vel) * ease(12, dt);
        viewLat += (TILT - viewLat) * ease(3, dt);
      } else if (mode === "goto") {
        if (!tween) {
          const dl = wrap(targetLon - viewLon);
          tween = { t0: t, lon0: viewLon, lat0: viewLat, dl, dlat: targetLat - viewLat, dur: 900 + Math.abs(dl) * 600 };
        }
        const k = inOut(Math.min(1, (t - tween.t0) / tween.dur));
        viewLon = tween.lon0 + tween.dl * k;
        viewLat = tween.lat0 + tween.dlat * k;
        vel = 0;
        if (k === 1 && t > holdUntil) {
          mode = "spin";
          tween = null;
        }
      } else {
        vel += (SPIN - vel) * ease(0.9, dt);
        viewLon += vel * dt;
        viewLat += (TILT - viewLat) * ease(0.6, dt);
      }
      draw();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const go = () => {
      if (!raf && visible) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    const select = (i: number, hold = 4500) => {
      const prev = current;
      current = (i + studios.length) % studios.length;
      const s = studios[current];
      if (current !== prev) arcIn = 0;
      targetLon = s.rlon;
      targetLat = Math.min(rad(40), Math.max(rad(5), s.rlat * 0.6));
      setActive(current);
      if (reduceMotion) {
        viewLon = targetLon;
        viewLat = targetLat;
        arcIn = 1;
        draw();
        return;
      }
      tween = null;
      mode = "goto";
      holdUntil = performance.now() + hold;
      go();
    };
    selectRef.current = select;

    const onDown = (e: PointerEvent) => {
      dragX = e.clientX;
      dragLon = viewLon;
      tween = null;
      mode = "drag";
      canvas.setPointerCapture(e.pointerId);
      go();
    };
    const onMove = (e: PointerEvent) => {
      if (dragX === null) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs.length ? evs : [e]) {
        dragLon -= ((ev.clientX - dragX) / size) * Math.PI;
        dragX = ev.clientX;
      }
      if (reduceMotion) {
        viewLon = dragLon;
        draw();
      }
    };
    const release = () => {
      if (dragX === null) return;
      dragX = null;
      vel = Math.max(-rad(240), Math.min(rad(240), vel));
      mode = "spin";
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    viewLon = studios[0].rlon;
    viewLat = TILT;
    select(0);
    mode = "spin";
    arcIn = reduceMotion ? 1 : 0;
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduceMotion) go();
      else draw();
    });
    intersection.observe(root);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", release);
      canvas.removeEventListener("pointercancel", release);
    };
  }, [mapColor]);

  useEffect(() => {
    selectRef.current(activeIndex);
  }, [activeIndex]);

  const studio = STUDIOS[active];

  return (
    <div ref={rootRef} className={`relative h-full w-full overflow-hidden bg-(--mpx-ink) text-(color:--mpx-white) ${className}`.trim()}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A globe with pins on our studios in Delhi, London, Dubai and New York"
        className="block h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STUDIOS.map((item, index) => {
          const isActive = index === active;
          return (
            <div
              key={item.city}
              ref={(node) => {
                pinRefs.current[index] = node;
              }}
              className={`absolute top-0 left-0 transition-opacity duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive ? "z-3" : "z-1"}`}
            >
              <span
                className={`absolute bottom-3.5 left-0 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-1.5 text-14 leading-none whitespace-nowrap backdrop-blur-md transition-[background-color,color,border-color,opacity] duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  isActive
                    ? "border-(--mpx-white) bg-(--mpx-white) text-(color:--mpx-ink)"
                    : "border-(--mpx-white)/15 bg-[rgb(10_10_10/0.72)] text-(color:--mpx-white)/70 max-md:opacity-0"
                }`}
              >
                <span>{item.city}</span>
                <span className="tabular-nums opacity-70">{times[index]}</span>
              </span>
              <span className="absolute top-0 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-[0.1vw] bg-(--mpx-white) shadow-[0_0_0_0.2vw_rgb(10_10_10/0.8)]">
                <span
                  className={`absolute -inset-1 rounded-[0.2vw] border border-(--mpx-accent) opacity-0 ${
                    isActive ? "animate-[mpx-globe-ping_2.4s_cubic-bezier(0.25,1,0.5,1)_infinite] motion-reduce:scale-150 motion-reduce:animate-none motion-reduce:opacity-80" : ""
                  }`}
                />
              </span>
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between gap-4 px-5 py-4 text-14 whitespace-pre text-(color:--mpx-white)/50 tabular-nums">
        <span className="text-(color:--mpx-white)/80">
          {`${studio.city}  ${formatCoord(studio.lat, "N", "S")}  ${formatCoord(studio.lon, "E", "W")}`}
        </span>
        <span>Drag to turn</span>
      </div>
    </div>
  );
};

export default Globe;

const STUDIOS: Studio[] = [
  { city: "Delhi", zone: "Asia/Kolkata", lat: 28.55, lon: 77.2 },
  { city: "London", zone: "Europe/London", lat: 51.524, lon: -0.074 },
  { city: "Dubai", zone: "Asia/Dubai", lat: 25.14, lon: 55.22 },
  { city: "New York", zone: "America/New_York", lat: 40.718, lon: -74.003 },
];
