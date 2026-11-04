// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { AppName, IconName } from "../content";

const PATHS: Record<IconName, string> = {
  spark: "M12 3c.6 4.6 3.4 7.4 9 9-5.6 1.6-8.4 4.4-9 9-.6-4.6-3.4-7.4-9-9 5.6-1.6 8.4-4.4 9-9Z",
  agent: "M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Zm6 11l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14Z",
  flow: "M4 6h6v4H4zM14 14h6v4h-6zM7 10v2a2 2 0 0 0 2 2h5M17 14v-2a2 2 0 0 0-2-2h-1",
  book: "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm0 13a3 3 0 0 1 3-3h10M9 8h5",
  team: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6m2 3a6 6 0 0 1 3 6",
  layers: "M12 3l9 5-9 5-9-5 9-5Zm-9 9l9 5 9-5M3 16l9 5 9-5",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8Z",
  database: "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Zm-8 3v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3Zm-3.5 9 2.5 2.5 4.5-5",
  plug: "M9 3v5m6-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4",
  chart: "M4 20V4m0 16h16M8 16v-4m4 4V8m4 8v-6",
  doc: "M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6m-6 4h4",
  mail: "M3 6h18v12H3V6Zm0 0 9 7 9-7",
  chat: "M4 5h16v11H9l-5 4V5Zm4 5h8m-8 3h5",
  calendar: "M4 6h16v14H4V6Zm0 4h16M8 3v5m8-5v5",
  check: "M5 12.5 10 17l9-10",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5",
  home: "M4 11l8-7 8 7v9h-5v-6H9v6H4v-9Z",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4.9a7.6 7.6 0 0 0-2.2-1.3L14.3 3h-4.6l-.4 2.3c-.8.3-1.5.7-2.2 1.3l-2.4-.9-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-.9c.7.6 1.4 1 2.2 1.3l.4 2.3h4.6l.4-2.3c.8-.3 1.5-.7 2.2-1.3l2.4.9 2-3.4-2-1.6c.1-.4.1-.9.1-1.3Z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
};

type IconProps = { name: IconName; className?: string; strokeWidth?: number };

export function Icon({ name, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export function AppGlyph({ app, className = "" }: { app: AppName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  switch (app) {
    case "notion":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M9 16V8l6 8V8" />
        </svg>
      );
    case "slack":
      return (
        <svg {...common}>
          <path d="M9.5 4v10M14.5 10v10M4 14.5h10M10 9.5h10" />
        </svg>
      );
    case "drive":
      return (
        <svg {...common}>
          <path d="M8.5 4h7l5 9-3.5 6h-10L3.5 13l5-9Zm0 0 5 9m-10 0h17M7 19l5-9" />
        </svg>
      );
    case "github":
      return (
        <svg {...common}>
          <circle cx="7" cy="6" r="2" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="9" r="2" />
          <path d="M7 8v8m10-5c0 3-3 3-6 4l-3 1.3" />
        </svg>
      );
    case "linear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M5.5 14.5l4 4M4.5 10.5l9 9M6.5 6.5l11 11" />
        </svg>
      );
    case "figma":
      return (
        <svg {...common}>
          <path d="M9 3h3v6H9a3 3 0 0 1 0-6Zm3 0h3a3 3 0 0 1 0 6h-3V3ZM9 9h3v6H9a3 3 0 0 1 0-6Zm3 3a3 3 0 1 0 6 0 3 3 0 0 0-6 0ZM9 15h3v3a3 3 0 1 1-3-3Z" />
        </svg>
      );
  }
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2c.7 5.4 3.6 8.3 10 10-6.4 1.7-9.3 4.6-10 10-.7-5.4-3.6-8.3-10-10 6.4-1.7 9.3-4.6 10-10Z" />
    </svg>
  );
}
