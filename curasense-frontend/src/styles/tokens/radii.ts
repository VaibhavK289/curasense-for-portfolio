// Design Tokens: Border Radius
// Consistent radius scale for shape hierarchy

export const radii = {
  none: "0",
  xs: "0.125rem",    // 2px - subtle rounding
  sm: "0.25rem",     // 4px - inputs, small elements
  md: "0.375rem",    // 6px - buttons, tags
  lg: "0.5rem",      // 8px - cards
  xl: "0.75rem",     // 12px - larger cards
  "2xl": "1rem",     // 16px - modals, panels
  "3xl": "1.5rem",   // 24px - large containers
  full: "9999px",    // Pills, avatars, circles
} as const;

// Semantic radius aliases
export const radiusAliases = {
  // Component-specific
  button: radii.lg,
  "button-sm": radii.md,
  "button-lg": radii.xl,
  
  input: radii.lg,
  
  card: radii.xl,
  "card-sm": radii.lg,
  "card-lg": radii["2xl"],
  
  modal: radii["2xl"],
  
  badge: radii.full,
  avatar: radii.full,
  
  tooltip: radii.md,
  
  // Icon containers
  "icon-button": radii.lg,
  "icon-container": radii.xl,
} as const;

export type RadiusToken = keyof typeof radii;
