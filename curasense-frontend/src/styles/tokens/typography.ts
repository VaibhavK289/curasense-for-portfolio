// Design Tokens: Typography System
// Consistent type scale with proper line heights and letter spacing

export const fontFamily = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Menlo', 'monospace'],
  display: ['Inter', 'system-ui', 'sans-serif'], // Can be changed to display font
} as const;

// Improved font size scale with better rhythm
// Based on 1.25 ratio (Major Third) for harmonic progression
export const fontSize = {
  xs: ["0.75rem", { lineHeight: "1.125rem", letterSpacing: "0.02em" }],      // 12px - labels, badges
  sm: ["0.875rem", { lineHeight: "1.375rem", letterSpacing: "0.01em" }],     // 14px - captions, meta
  base: ["1rem", { lineHeight: "1.625rem", letterSpacing: "0" }],            // 16px - body text
  lg: ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "-0.005em" }],    // 18px - lead text
  xl: ["1.25rem", { lineHeight: "1.875rem", letterSpacing: "-0.01em" }],     // 20px - subheadings
  "2xl": ["1.5rem", { lineHeight: "2.125rem", letterSpacing: "-0.015em" }],  // 24px - h4
  "3xl": ["1.875rem", { lineHeight: "2.375rem", letterSpacing: "-0.02em" }], // 30px - h3
  "4xl": ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.025em" }],  // 36px - h2
  "5xl": ["3rem", { lineHeight: "3.25rem", letterSpacing: "-0.03em" }],      // 48px - h1
  "6xl": ["3.75rem", { lineHeight: "4rem", letterSpacing: "-0.035em" }],     // 60px - display
  "7xl": ["4.5rem", { lineHeight: "4.75rem", letterSpacing: "-0.04em" }],    // 72px - hero
  "8xl": ["6rem", { lineHeight: "1", letterSpacing: "-0.04em" }],            // 96px - giant display
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

// Letter spacing scale for hierarchy WITHOUT bold
export const letterSpacing = {
  tighter: "-0.04em",  // Display text
  tight: "-0.02em",    // Headings
  normal: "0",         // Body
  wide: "0.02em",      // Labels
  wider: "0.04em",     // Overlines
  widest: "0.08em",    // All caps labels
} as const;

// Line height scale optimized for readability
// Medical content needs generous line heights
export const lineHeight = {
  none: "1",           // Display only
  tight: "1.2",        // Headings
  snug: "1.375",       // Subheadings
  normal: "1.5",       // Short body
  relaxed: "1.625",    // Default body - optimal for medical content
  loose: "1.75",       // Long-form reading
  spacious: "2",       // Legal/medical disclaimers
} as const;

// Semantic typography presets
export const typography = {
  // Display - Hero sections, major headings
  "display-2xl": {
    fontSize: "6rem",
    lineHeight: "1",
    letterSpacing: "-0.04em",
    fontWeight: "800",
  },
  "display-xl": {
    fontSize: "4.5rem",
    lineHeight: "1.1",
    letterSpacing: "-0.035em",
    fontWeight: "800",
  },
  "display-lg": {
    fontSize: "3.75rem",
    lineHeight: "1.1",
    letterSpacing: "-0.03em",
    fontWeight: "700",
  },
  "display-md": {
    fontSize: "3rem",
    lineHeight: "1.15",
    letterSpacing: "-0.025em",
    fontWeight: "700",
  },
  
  // Headings - with proper gaps in the scale
  "heading-2xl": {
    fontSize: "2.25rem",
    lineHeight: "2.75rem",
    letterSpacing: "-0.025em",
    fontWeight: "700",
  },
  "heading-xl": {
    fontSize: "1.875rem",
    lineHeight: "2.375rem",
    letterSpacing: "-0.02em",
    fontWeight: "600",
  },
  "heading-lg": {
    fontSize: "1.5rem",
    lineHeight: "2.125rem",
    letterSpacing: "-0.015em",
    fontWeight: "600",
  },
  "heading-md": {
    fontSize: "1.25rem",
    lineHeight: "1.875rem",
    letterSpacing: "-0.01em",
    fontWeight: "600",
  },
  "heading-sm": {
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    letterSpacing: "-0.005em",
    fontWeight: "600",
  },
  "heading-xs": {
    fontSize: "1rem",
    lineHeight: "1.5rem",
    letterSpacing: "0",
    fontWeight: "600",
  },
  
  // Body text - optimized for medical content readability
  "body-xl": {
    fontSize: "1.25rem",
    lineHeight: "2rem",          // Extra generous for medical content
    letterSpacing: "-0.005em",
    fontWeight: "400",
  },
  "body-lg": {
    fontSize: "1.125rem",
    lineHeight: "1.875rem",
    letterSpacing: "0",
    fontWeight: "400",
  },
  "body-md": {
    fontSize: "1rem",
    lineHeight: "1.75rem",       // 28px line height for 16px - very readable
    letterSpacing: "0",
    fontWeight: "400",
  },
  "body-sm": {
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    letterSpacing: "0.01em",
    fontWeight: "400",
  },
  
  // Lead paragraph - for introductions
  lead: {
    fontSize: "1.25rem",
    lineHeight: "1.875rem",
    letterSpacing: "-0.01em",
    fontWeight: "400",
  },
  
  // Labels - using letter-spacing for hierarchy instead of just bold
  "label-lg": {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    letterSpacing: "0.02em",
    fontWeight: "500",
  },
  "label-md": {
    fontSize: "0.75rem",
    lineHeight: "1.125rem",
    letterSpacing: "0.03em",
    fontWeight: "500",
  },
  "label-sm": {
    fontSize: "0.6875rem",
    lineHeight: "1rem",
    letterSpacing: "0.06em",
    fontWeight: "500",
    textTransform: "uppercase" as const,
  },
  
  // Overline - uppercase labels
  overline: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    letterSpacing: "0.08em",
    fontWeight: "600",
    textTransform: "uppercase" as const,
  },
  
  // Caption - small supporting text
  caption: {
    fontSize: "0.75rem",
    lineHeight: "1.125rem",
    letterSpacing: "0.02em",
    fontWeight: "400",
  },
  
  // Code - monospace
  code: {
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    letterSpacing: "-0.01em",
    fontWeight: "400",
    fontFamily: "JetBrains Mono, Menlo, monospace",
  },
  
  // Medical-specific - for disclaimers, notices
  disclaimer: {
    fontSize: "0.75rem",
    lineHeight: "1.25rem",       // Extra line height for legal text
    letterSpacing: "0.01em",
    fontWeight: "400",
  },
} as const;

// Prose configuration for long-form medical content
export const proseConfig = {
  // Optimal reading width
  maxWidth: "65ch",
  
  // Paragraph spacing
  paragraphSpacing: "1.5em",
  
  // List item spacing
  listSpacing: "0.5em",
  
  // Heading margins
  headingMarginTop: "2em",
  headingMarginBottom: "0.75em",
} as const;

export type TypographyToken = keyof typeof typography;
export type FontSizeToken = keyof typeof fontSize;
export type LetterSpacingToken = keyof typeof letterSpacing;
export type LineHeightToken = keyof typeof lineHeight;
