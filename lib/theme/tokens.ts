export const spacing = {
  4: "0.25rem",
  8: "0.5rem",
  12: "0.75rem",
  16: "1rem",
  20: "1.25rem",
  24: "1.5rem",
  32: "2rem",
  40: "2.5rem",
  48: "3rem",
  64: "4rem",
  80: "5rem",
  96: "6rem"
} as const;

export const radii = {
  small: "var(--radius-sm)",
  medium: "var(--radius-md)",
  large: "var(--radius-lg)",
  extraLarge: "var(--radius-xl)",
  full: "var(--radius-full)"
} as const;

export const shadows = {
  soft: "var(--shadow-soft)",
  medium: "var(--shadow-medium)",
  large: "var(--shadow-large)",
  glass: "var(--shadow-glass)",
  floatingPanel: "var(--shadow-floating-panel)"
} as const;

export const typography = {
  display: "text-display",
  heading1: "text-heading-1",
  heading2: "text-heading-2",
  heading3: "text-heading-3",
  heading4: "text-heading-4",
  bodyLarge: "text-body-large",
  body: "text-body",
  caption: "text-caption",
  code: "text-code",
  button: "text-button"
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radii;
export type ShadowToken = keyof typeof shadows;
export type TypographyToken = keyof typeof typography;
