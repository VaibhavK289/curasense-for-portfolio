// Design Tokens: Shadows & Elevation
// Layered shadow system for depth hierarchy

export const shadows = {
  none: "none",
  
  // Subtle shadows - for cards, containers
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  
  // Inner shadow
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  
  // Colored shadows - use sparingly for emphasis
  "brand-sm": "0 4px 14px 0 hsl(168 84% 40% / 0.15)",
  "brand-md": "0 8px 24px 0 hsl(168 84% 40% / 0.2)",
  "brand-lg": "0 12px 32px 0 hsl(168 84% 40% / 0.25)",
  
  "success-sm": "0 4px 14px 0 hsl(142 76% 36% / 0.15)",
  "success-md": "0 8px 24px 0 hsl(142 76% 36% / 0.2)",
  
  "warning-sm": "0 4px 14px 0 hsl(38 92% 50% / 0.15)",
  "warning-md": "0 8px 24px 0 hsl(38 92% 50% / 0.2)",
  
  "error-sm": "0 4px 14px 0 hsl(0 84% 60% / 0.15)",
  "error-md": "0 8px 24px 0 hsl(0 84% 60% / 0.2)",
  
  "info-sm": "0 4px 14px 0 hsl(201 96% 32% / 0.15)",
  "info-md": "0 8px 24px 0 hsl(201 96% 32% / 0.2)",
} as const;

// Elevation levels for consistent layering
export const elevation = {
  0: { shadow: shadows.none, zIndex: 0 },       // Base level
  1: { shadow: shadows.xs, zIndex: 10 },        // Raised cards
  2: { shadow: shadows.sm, zIndex: 20 },        // Dropdowns
  3: { shadow: shadows.md, zIndex: 30 },        // Modals backdrop
  4: { shadow: shadows.lg, zIndex: 40 },        // Sidebars, drawers
  5: { shadow: shadows.xl, zIndex: 50 },        // Modals, dialogs
  6: { shadow: shadows["2xl"], zIndex: 60 },    // Tooltips, popovers
} as const;

export type ShadowToken = keyof typeof shadows;
export type ElevationLevel = keyof typeof elevation;
