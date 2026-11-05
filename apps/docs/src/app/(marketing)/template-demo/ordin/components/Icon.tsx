// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

export type IconName =
  | "search"
  | "analyze"
  | "report"
  | "doc"
  | "bolt"
  | "shield"
  | "check-circle"
  | "trend"
  | "layers"
  | "box"
  | "building"
  | "arrow"
  | "check"
  | "plus";

const PATHS: Record<IconName, string> = {
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5 20 20",
  analyze: "M5 19v-6M10 19V7M15 19v-9M20 19V4",
  report: "M7 3h7l5 5v13H7ZM14 3v5h5M10 13h6M10 17h6",
  doc: "M6 3h8l4 4v14H6ZM14 3v4h4M9 12h6M9 16h4",
  bolt: "M13 3 5 14h6l-1 7 8-11h-6Z",
  shield: "M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z",
  "check-circle": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12.5l2.7 2.7L16 9.8",
  trend: "M4 17l5-5 4 4 7-8M15 8h5v5",
  layers: "M12 3 3 8l9 5 9-5ZM3 12.5l9 5 9-5M3 17l9 5 9-5",
  box: "M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5ZM3.5 7.5 12 12l8.5-4.5M12 12v9M7.8 5.2l8.5 4.6",
  building: "M5 21V4h9v17M14 9h5v12M3 21h18M8 8h3M8 12h3M8 16h3",
  arrow: "M7 17 17 7M8 7h9v9",
  check: "M5 12.5l4.5 4.5L19 7.5",
  plus: "M12 5v14M5 12h14",
};

type Props = { name: IconName; className?: string };

// Draw time follows the stroke's real length, so every icon draws at the same speed
const timeDrawn = (path: SVGPathElement | null) => {
  if (!path) return;
  const seconds = Math.min(Math.max(path.getTotalLength() / 55, 0.45), 1.4);
  path.style.setProperty("--ord-draw-time", `${seconds.toFixed(2)}s`);
};

export default function Icon({ name, className = "" }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`ord-icon ${className}`}>
      <path ref={timeDrawn} d={PATHS[name]} pathLength={1} />
    </svg>
  );
}
