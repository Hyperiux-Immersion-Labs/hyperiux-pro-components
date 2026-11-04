// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

const HUES = [
  { color: "rgb(174, 184, 232)", pos: "12% 1%", size: "130px 65px" },
  { color: "rgb(232, 234, 245)", pos: "33% 0%", size: "150px 75px" },
  { color: "rgb(174, 184, 232)", pos: "2.1% 68.3%", size: "46px 130px" },
  { color: "rgb(32, 43, 74)", pos: "2.1% 68.3%", size: "24px 68px" },
  { color: "rgb(174, 184, 232)", pos: "74.4% 100%", size: "280px 56px" },
  { color: "rgb(232, 234, 245)", pos: "55% 100%", size: "150px 50px" },
  { color: "rgb(174, 184, 232)", pos: "93.9% 1%", size: "150px 82px" },
  { color: "rgb(245, 246, 250)", pos: "100% 27.1%", size: "30px 80px" },
  { color: "rgb(174, 184, 232)", pos: "100% 27.1%", size: "56px 92px" },
];

const FINISH = {
  dark: { strokeOpacity: 0.7, innerOpacity: 0.42, glint: "245, 246, 250" },
  light: { strokeOpacity: 0.9, innerOpacity: 0.5, glint: "32, 43, 74" },
};

const edgeLayer = () => HUES.map((c) => `radial-gradient(ellipse ${c.size} at ${c.pos}, ${c.color}, transparent)`).join(",\n    ");

const coreLayer = () =>
  HUES.map((c) => {
    const rgba = c.color.replace("rgb(", "rgba(").replace(")", ", 0.45)");
    const smaller = c.size
      .split(" ")
      .map((s) => `${Math.round(parseInt(s) * 0.9)}px`)
      .join(" ");
    return `radial-gradient(ellipse ${smaller} at ${c.pos}, ${rgba}, transparent)`;
  }).join(",\n    ");

const BEAM_MASK = (id: string) => `conic-gradient(
      from var(--rim-angle-${id}),
      transparent 0%, transparent 30%,
      rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0.35) 44%,
      white 52%, white 80%,
      rgba(255, 255, 255, 0.35) 86%, rgba(255, 255, 255, 0.1) 92%,
      transparent 95%, transparent 100%
    )`;

function rimCSS(id: string, radius: number, width: number, duration: number, theme: "dark" | "light") {
  const f = FINISH[theme];
  const inner = Math.max(0, radius - width);
  const glint = `conic-gradient(
        from var(--rim-angle-${id}),
        transparent 0%, transparent 54%,
        rgba(${f.glint}, 0.1) 57%,
        rgba(${f.glint}, 0.3) 60%,
        rgba(${f.glint}, 0.6) 63%,
        rgba(${f.glint}, 0.75) 66%,
        rgba(${f.glint}, 0.6) 69%,
        rgba(${f.glint}, 0.3) 72%,
        rgba(${f.glint}, 0.1) 75%,
        transparent 78%, transparent 100%
      )`;

  return `
@property --rim-angle-${id} {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: true;
}

@property --rim-opacity-${id} {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}

[data-rim="${id}"] {
  position: relative;
  border-radius: ${radius}px;
}

[data-rim="${id}"][data-active] {
  animation:
    rim-spin-${id} ${duration}s linear infinite,
    rim-fade-in-${id} 0.6s ease forwards;
}

[data-rim="${id}"][data-paused] {
  animation-play-state: paused;
}

[data-rim="${id}"][data-active]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: ${inner}px;
  padding: ${width}px;
  clip-path: inset(0 round ${radius}px);
  background: ${glint},${edgeLayer()};
  -webkit-mask: ${BEAM_MASK(id)}, linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: source-in, xor;
  mask: ${BEAM_MASK(id)}, linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: intersect, exclude;
  pointer-events: none;
  z-index: 2;
  opacity: calc(var(--rim-opacity-${id}) * ${f.strokeOpacity});
  filter: blur(0.4px);
}

[data-rim="${id}"][data-active]::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: ${radius}px;
  background: ${coreLayer()};
  -webkit-mask-image: ${BEAM_MASK(id)},
    linear-gradient(white, transparent 160px, transparent calc(100% - 160px), white),
    linear-gradient(to right, white, transparent 160px, transparent calc(100% - 160px), white);
  -webkit-mask-composite: source-in, source-over;
  mask-image: ${BEAM_MASK(id)},
    linear-gradient(white, transparent 160px, transparent calc(100% - 160px), white),
    linear-gradient(to right, white, transparent 160px, transparent calc(100% - 160px), white);
  mask-composite: intersect, add;
  pointer-events: none;
  z-index: 1;
  opacity: calc(var(--rim-opacity-${id}) * ${f.innerOpacity});
  clip-path: inset(0 round ${radius}px);
}

@keyframes rim-spin-${id} {
  to { --rim-angle-${id}: 360deg; }
}

@keyframes rim-fade-in-${id} {
  to { --rim-opacity-${id}: 1; }
}

@media (prefers-reduced-motion: reduce) {
  [data-rim="${id}"][data-active] {
    --rim-angle-${id}: 210deg;
    animation: rim-fade-in-${id} 0.01s ease forwards;
  }
}
`;
}

type BorderBeamProps = {
  children: ReactNode;
  theme?: "dark" | "light";
  duration?: number;
  beamWidth?: number;
  className?: string;
  style?: CSSProperties;
};

export default function BorderBeam({ children, theme = "dark", duration = 6, beamWidth = 1.5, className = "", style }: BorderBeamProps) {
  const id = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [radius, setRadius] = useState(24);
  const [onScreen, setOnScreen] = useState(true);

  useLayoutEffect(() => {
    const child = hostRef.current?.firstElementChild;
    if (!child) return;
    const measure = () => {
      const raw = parseFloat(getComputedStyle(child).borderTopLeftRadius);
      if (!isNaN(raw) && raw > 0) setRadius(raw);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(child);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: "256px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const css = useMemo(() => rimCSS(id, radius, beamWidth, duration, theme), [id, radius, beamWidth, duration, theme]);

  return (
    <>
      <style>{css}</style>
      <div
        ref={hostRef}
        data-rim={id}
        data-active=""
        data-paused={onScreen ? undefined : ""}
        className={`relative ${className}`}
        style={style}
      >
        {children}
      </div>
    </>
  );
}
