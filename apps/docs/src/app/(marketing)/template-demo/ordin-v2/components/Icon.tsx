// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { IconName } from "../content";

const PATHS: Record<IconName | "arrow" | "check" | "plus", string> = {
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5 20 20",
  analyze: "M5 19v-6M10 19V7M15 19v-9M20 19V4",
  report: "M7 3h7l5 5v13H7ZM14 3v5h5M10 13h6M10 17h6",
  doc: "M6 3h8l4 4v14H6ZM14 3v4h4M9 12h6M9 16h4",
  bolt: "M13 3 5 14h6l-1 7 8-11h-6Z",
  shield: "M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z",
  "check-circle": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12.5l2.7 2.7L16 9.8",
  trend: "M4 17l5-5 4 4 7-8M15 8h5v5",
  user: "M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5",
  pen: "M4 20l4-1 11-11-3-3L5 16ZM14 7l3 3",
  nodes: "M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM19 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 7v4l-6 6M12 11l6 6",
  layers: "M12 3 3 8l9 5 9-5ZM3 12.5l9 5 9-5M3 17l9 5 9-5",
  database: "M12 9c3.9 0 7-1.3 7-3s-3.1-3-7-3-7 1.3-7 3 3.1 3 7 3ZM5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3",
  cube: "M12 3l8 4.5v9L12 21l-8-4.5v-9ZM4 7.5l8 4.5 8-4.5M12 12v9",
  box: "M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5ZM3.5 7.5 12 12l8.5-4.5M12 12v9M7.8 5.2l8.5 4.6",
  building: "M5 21V4h9v17M14 9h5v12M3 21h18M8 8h3M8 12h3M8 16h3",
  arrow: "M7 17 17 7M8 7h9v9",
  check: "M5 12.5l4.5 4.5L19 7.5",
  plus: "M12 5v14M5 12h14",
};

type Props = { name: IconName | "arrow" | "check" | "plus"; className?: string };

export default function Icon({ name, className = "" }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={PATHS[name]} />
    </svg>
  );
}

const SOCIAL = {
  x: "M4 4l16 16M20 4 4 20",
  linkedin: "M6 9v10M6 5.5v.1M10 19v-6a3 3 0 0 1 6 0v6M10 9v10",
  github: "M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  youtube: "M3 8.5C3 6.5 4.5 5 6.5 5h11C19.5 5 21 6.5 21 8.5v7c0 2-1.5 3.5-3.5 3.5h-11C4.5 19 3 17.5 3 15.5ZM10 9.5v5l4.5-2.5Z",
};

export function SocialIcon({ name, className = "" }: { name: keyof typeof SOCIAL; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={SOCIAL[name]} />
    </svg>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path d="M3.5 20.5C4 11.5 10 5 20.5 3.5 19.5 13 13.5 19.5 3.5 20.5Z" fill="var(--orn-mint)" />
      <path d="M3.5 20.5 13 11" stroke="var(--orn-forest)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
