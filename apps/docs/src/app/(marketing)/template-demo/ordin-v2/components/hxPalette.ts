// Built using Hyperiux Vault: https://vault.hyperiux.com

import { THEME } from "../theme";

// The Ordin palette in the token names the Hyperiux shadcn-style components read (as --hx-*)
export const HX_DARK: Record<string, string> = {
  background: THEME.ink,
  foreground: THEME.bone,
  border: `color-mix(in srgb, ${THEME.bone} 14%, ${THEME.ink})`,
  input: THEME.graphite,
  ring: THEME.primaryLight,
  muted: THEME.carbon,
  "muted-foreground": THEME.stone,
  primary: THEME.primary,
  "primary-foreground": THEME.ink,
  secondary: `color-mix(in srgb, ${THEME.bone} 6%, ${THEME.ink})`,
  "secondary-foreground": THEME.bone,
  "accent-foreground": THEME.bone,
  success: THEME.primaryLight,
  warning: THEME.ash,
  destructive: THEME.stone,
};

// The same tokens for light sections
export const HX_LIGHT: Record<string, string> = {
  background: THEME.paper,
  foreground: THEME.ink,
  border: `color-mix(in srgb, ${THEME.ink} 12%, ${THEME.paper})`,
  input: `color-mix(in srgb, ${THEME.ink} 10%, ${THEME.paper})`,
  ring: THEME.primaryDeep,
  muted: `color-mix(in srgb, ${THEME.ink} 5%, ${THEME.paper})`,
  "muted-foreground": THEME.textMuted,
  primary: THEME.primaryDeep,
  "primary-foreground": THEME.paper,
  secondary: `color-mix(in srgb, ${THEME.ink} 6%, ${THEME.paper})`,
  "secondary-foreground": THEME.ink,
  "accent-foreground": THEME.ink,
  success: THEME.primaryDeep,
  warning: THEME.textMuted,
  destructive: THEME.textMuted,
};

// Light tables whose hovered row fills with the brand primary
export const HX_LIGHT_PRIMARY: Record<string, string> = { ...HX_LIGHT, primary: THEME.primary, "primary-foreground": THEME.onPrimary };
