/**
 * Central palette used by both Tailwind (via CSS vars in globals.css) and
 * Three.js materials/lights, which need raw hex values, not CSS vars.
 * Keep in sync with app/globals.css :root.
 */
export const PALETTE = {
  background: "#080d1c",
  backgroundElevated: "#0c1226",
  surface: "#101935",
  border: "#26315a",
  foreground: "#efe9d6",
  muted: "#aab1ca",
  primary: "#d4b266",
  secondary: "#a3b1ff",
  accent: "#82d9d4",
  success: "#72d39f",
  warning: "#eab34d",
  error: "#ff8294",
} as const;

export const AXIS_COLORS = {
  x: "#ff5c72",
  y: "#35d488",
  z: "#4c7cff",
} as const;

export type AccentName = "primary" | "secondary" | "accent" | "success" | "warning";

export const ACCENT_HEX: Record<AccentName, string> = {
  primary: PALETTE.primary,
  secondary: PALETTE.secondary,
  accent: PALETTE.accent,
  success: PALETTE.success,
  warning: PALETTE.warning,
};
