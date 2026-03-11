// ============================================
// CURASENSE DESIGN SYSTEM V2.0
// Premium Healthcare Design Language
// ============================================

// Golden Ratio for visual harmony
export const PHI = 1.618;
export const PHI_INVERSE = 0.618;

// ============================================
// SPACING SCALE - Based on 4px grid with phi ratios
// ============================================
export const spacing = {
  0: "0",
  px: "1px",
  0.5: "0.125rem",   // 2px
  1: "0.25rem",      // 4px - base unit
  1.5: "0.375rem",   // 6px
  2: "0.5rem",       // 8px
  2.5: "0.625rem",   // 10px
  3: "0.75rem",      // 12px
  4: "1rem",         // 16px
  5: "1.25rem",      // 20px
  6: "1.5rem",       // 24px
  7: "1.75rem",      // 28px
  8: "2rem",         // 32px
  10: "2.5rem",      // 40px
  12: "3rem",        // 48px
  14: "3.5rem",      // 56px
  16: "4rem",        // 64px
  20: "5rem",        // 80px
  24: "6rem",        // 96px
  28: "7rem",        // 112px
  32: "8rem",        // 128px
  36: "9rem",        // 144px
  40: "10rem",       // 160px
  44: "11rem",       // 176px
  48: "12rem",       // 192px
  52: "13rem",       // 208px
  56: "14rem",       // 224px
  60: "15rem",       // 240px
  64: "16rem",       // 256px
  72: "18rem",       // 288px
  80: "20rem",       // 320px
  96: "24rem",       // 384px
} as const;

// ============================================
// ENHANCED RADIUS SCALE - Organic shapes
// ============================================
export const radius = {
  none: "0",
  xs: "0.125rem",      // 2px - subtle
  sm: "0.25rem",       // 4px - inputs
  md: "0.5rem",        // 8px - buttons
  lg: "0.75rem",       // 12px - cards
  xl: "1rem",          // 16px - larger cards
  "2xl": "1.25rem",    // 20px - modals
  "3xl": "1.5rem",     // 24px - feature cards
  "4xl": "2rem",       // 32px - hero elements
  "5xl": "2.5rem",     // 40px - large containers
  full: "9999px",      // Pills, avatars
  // Asymmetric shapes for visual interest
  "blob-1": "30% 70% 70% 30% / 30% 30% 70% 70%",
  "blob-2": "60% 40% 30% 70% / 60% 30% 70% 40%",
  "blob-3": "40% 60% 60% 40% / 70% 30% 30% 70%",
  // Squircle approximation
  squircle: "25%",
} as const;

// ============================================
// FLUID TYPOGRAPHY SCALE
// Uses clamp() for smooth scaling
// ============================================
export const fluidType = {
  // Display sizes
  "display-hero": "clamp(2.5rem, 5vw + 1rem, 5rem)",       // 40-80px
  "display-xl": "clamp(2.25rem, 4vw + 1rem, 4rem)",        // 36-64px
  "display-lg": "clamp(2rem, 3vw + 1rem, 3rem)",           // 32-48px
  "display-md": "clamp(1.75rem, 2.5vw + 1rem, 2.5rem)",    // 28-40px
  // Heading sizes
  "heading-xl": "clamp(1.5rem, 2vw + 0.75rem, 2rem)",      // 24-32px
  "heading-lg": "clamp(1.25rem, 1.5vw + 0.75rem, 1.75rem)", // 20-28px
  "heading-md": "clamp(1.125rem, 1vw + 0.75rem, 1.5rem)",  // 18-24px
  "heading-sm": "clamp(1rem, 0.5vw + 0.75rem, 1.25rem)",   // 16-20px
  // Body sizes
  "body-xl": "clamp(1.125rem, 0.5vw + 0.875rem, 1.25rem)", // 18-20px
  "body-lg": "clamp(1rem, 0.25vw + 0.875rem, 1.125rem)",   // 16-18px
  "body-md": "1rem",                                         // 16px
  "body-sm": "0.875rem",                                     // 14px
  "body-xs": "0.75rem",                                      // 12px
  // Label sizes
  "label-lg": "0.875rem",
  "label-md": "0.8125rem",                                   // 13px
  "label-sm": "0.75rem",
  "label-xs": "0.6875rem",                                   // 11px
} as const;

// ============================================
// GLASS MORPHISM EFFECTS
// ============================================
export const glass = {
  // Light mode glass
  light: {
    subtle: "bg-white/40 backdrop-blur-sm border border-white/20",
    default: "bg-white/60 backdrop-blur-md border border-white/30",
    strong: "bg-white/80 backdrop-blur-lg border border-white/40",
    solid: "bg-white/95 backdrop-blur-xl border border-white/50",
  },
  // Dark mode glass
  dark: {
    subtle: "bg-neutral-900/40 backdrop-blur-sm border border-white/5",
    default: "bg-neutral-900/60 backdrop-blur-md border border-white/10",
    strong: "bg-neutral-900/80 backdrop-blur-lg border border-white/15",
    solid: "bg-neutral-950/95 backdrop-blur-xl border border-white/10",
  },
} as const;

// ============================================
// ENHANCED SHADOW SYSTEM
// Layered shadows for depth
// ============================================
export const shadows = {
  // Elevation shadows
  "elevation-0": "none",
  "elevation-1": "0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
  "elevation-2": "0 2px 4px -1px rgb(0 0 0 / 0.04), 0 4px 6px -1px rgb(0 0 0 / 0.08)",
  "elevation-3": "0 4px 8px -2px rgb(0 0 0 / 0.05), 0 10px 20px -3px rgb(0 0 0 / 0.1)",
  "elevation-4": "0 8px 16px -4px rgb(0 0 0 / 0.06), 0 20px 40px -6px rgb(0 0 0 / 0.12)",
  "elevation-5": "0 12px 24px -6px rgb(0 0 0 / 0.08), 0 32px 64px -12px rgb(0 0 0 / 0.14)",
  // Soft shadows for cards
  "soft-xs": "0 2px 8px -2px rgb(0 0 0 / 0.08)",
  "soft-sm": "0 4px 12px -2px rgb(0 0 0 / 0.1)",
  "soft-md": "0 8px 24px -4px rgb(0 0 0 / 0.12)",
  "soft-lg": "0 16px 40px -8px rgb(0 0 0 / 0.14)",
  "soft-xl": "0 24px 56px -12px rgb(0 0 0 / 0.16)",
  // Glow shadows (brand colored)
  "glow-primary-sm": "0 0 20px -5px hsl(var(--brand-primary) / 0.25)",
  "glow-primary-md": "0 0 40px -10px hsl(var(--brand-primary) / 0.3)",
  "glow-primary-lg": "0 0 60px -15px hsl(var(--brand-primary) / 0.35)",
  "glow-secondary-sm": "0 0 20px -5px hsl(var(--brand-secondary) / 0.25)",
  "glow-secondary-md": "0 0 40px -10px hsl(var(--brand-secondary) / 0.3)",
  // Inner shadows
  "inner-sm": "inset 0 1px 2px 0 rgb(0 0 0 / 0.05)",
  "inner-md": "inset 0 2px 4px 0 rgb(0 0 0 / 0.08)",
  "inner-highlight": "inset 0 1px 0 0 rgb(255 255 255 / 0.1)",
} as const;

// ============================================
// ANIMATION TIMING TOKENS
// ============================================
export const timing = {
  // Duration scale
  duration: {
    instant: 0,
    "ultra-fast": 50,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 400,
    slowest: 500,
    "extra-slow": 700,
    dramatic: 1000,
  },
  // Easing functions
  easing: {
    // Standard
    linear: "linear",
    ease: "ease",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    // Premium curves
    smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
    snappy: "cubic-bezier(0.2, 0, 0, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    elastic: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    // Apple-inspired
    appleSmooth: "cubic-bezier(0.42, 0, 0.58, 1)",
    appleBounce: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
} as const;

// ============================================
// Z-INDEX SCALE
// ============================================
export const zIndex = {
  behind: -1,
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
  max: 9999,
} as const;

// ============================================
// BREAKPOINTS (Mobile First)
// ============================================
export const breakpoints = {
  xs: "320px",
  sm: "480px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  "3xl": "1920px",
} as const;

// ============================================
// GRID SYSTEM
// ============================================
export const grid = {
  // Container max widths
  container: {
    xs: "100%",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1400px",
    full: "100%",
  },
  // Gutter sizes
  gutter: {
    xs: spacing[3],    // 12px
    sm: spacing[4],    // 16px
    md: spacing[6],    // 24px
    lg: spacing[8],    // 32px
    xl: spacing[12],   // 48px
  },
} as const;

// ============================================
// ICON SIZES
// ============================================
export const iconSizes = {
  xs: "0.75rem",    // 12px
  sm: "1rem",       // 16px
  md: "1.25rem",    // 20px
  lg: "1.5rem",     // 24px
  xl: "2rem",       // 32px
  "2xl": "2.5rem",  // 40px
  "3xl": "3rem",    // 48px
  "4xl": "4rem",    // 64px
} as const;

// ============================================
// COMPONENT TOKENS
// ============================================
export const components = {
  // Button sizes
  button: {
    xs: { height: "1.75rem", padding: "0 0.5rem", fontSize: fluidType["label-sm"] },
    sm: { height: "2rem", padding: "0 0.75rem", fontSize: fluidType["label-md"] },
    md: { height: "2.5rem", padding: "0 1rem", fontSize: fluidType["body-sm"] },
    lg: { height: "3rem", padding: "0 1.5rem", fontSize: fluidType["body-md"] },
    xl: { height: "3.5rem", padding: "0 2rem", fontSize: fluidType["body-lg"] },
  },
  // Input sizes
  input: {
    sm: { height: "2rem", padding: "0 0.75rem", fontSize: fluidType["body-sm"] },
    md: { height: "2.5rem", padding: "0 1rem", fontSize: fluidType["body-md"] },
    lg: { height: "3rem", padding: "0 1.25rem", fontSize: fluidType["body-md"] },
  },
  // Card variants
  card: {
    flat: { shadow: shadows["elevation-0"], radius: radius.xl },
    raised: { shadow: shadows["soft-sm"], radius: radius.xl },
    elevated: { shadow: shadows["soft-md"], radius: radius["2xl"] },
    floating: { shadow: shadows["soft-lg"], radius: radius["3xl"] },
  },
  // Avatar sizes
  avatar: {
    xs: "1.5rem",    // 24px
    sm: "2rem",      // 32px
    md: "2.5rem",    // 40px
    lg: "3rem",      // 48px
    xl: "4rem",      // 64px
    "2xl": "5rem",   // 80px
    "3xl": "6rem",   // 96px
  },
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadows;
export type Breakpoint = keyof typeof breakpoints;
