// Built using Hyperiux Vault: https://vault.hyperiux.com
// Every colour in the template. Change these and the whole site follows: CSS, Tailwind classes,
// the particle globe, the Arc Light shaders, the page transition and the data components.

export const THEME = {
  ink: "#05090c", // page background, dark sections
  carbon: "#0a1216", // raised dark surfaces
  graphite: "#16242a", // dimmed text on dark, borders
  stone: "#7d8f8a", // muted text on dark
  ash: "#b3c2bc", // body text on dark
  bone: "#e6ece4", // headings on dark, light section background
  paper: "#eef2ec", // alternate light section background
  paperDeep: "#d3ddd3", // wordmark and slabs on light
  textMuted: "#4d5f5a", // body text on light
  primary: "#34e8a6", // buttons, lines, active states
  primaryHover: "#5cf0bd",
  primaryLight: "#5effc6", // highlights, numbers, glows
  primaryDeep: "#0a7a62", // accents on light sections
  onPrimary: "#05090c", // text and marks on a primary fill
};

export type ThemeColor = keyof typeof THEME;

// "#34e8a6" -> "52,232,166", for canvas and rgba() strings
export const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

export const alpha = (hex: string, a: number) => `rgba(${rgb(hex)},${a})`;

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// Injected once by layout.tsx as --ord-* custom properties
export const themeCss = `:root:has(.ord-page){${Object.entries(THEME)
  .map(([k, v]) => `--ord-${kebab(k)}:${v};--ord-${kebab(k)}-rgb:${rgb(v)};`)
  .join("")}}`;
