// Built using Hyperiux Vault: https://vault.hyperiux.com
// Every colour in the template. Change these and the whole site follows: CSS, Tailwind classes,
// the particle globe, the Arc Light shaders, the page transition and the data components.

export const THEME = {
  ink: "#05061a", // page background, dark sections
  carbon: "#0c0e2e", // raised dark surfaces
  graphite: "#1b1f54", // dimmed text on dark, borders
  stone: "#8589bb", // muted text on dark
  ash: "#c0c3ea", // body text on dark
  bone: "#ebecfb", // headings on dark, light section background
  paper: "#f0f1ff", // alternate light section background
  paperDeep: "#d6d8fb", // wordmark and slabs on light
  textMuted: "#4a4f85", // body text on light
  primary: "#4f4bff", // buttons, lines, active states
  primaryHover: "#6b68ff",
  primaryLight: "#9295ff", // highlights, numbers, glows
  primaryDeep: "#2a22d6", // accents on light sections
  onPrimary: "#f0f1ff", // text and marks on a primary fill
};

export type ThemeColor = keyof typeof THEME;

// "#4f4bff" -> "79,75,255", for canvas and rgba() strings
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
