// Design Tokens: Color System
// Enterprise Healthcare Color Palette with Semantic Meaning

export const colors = {
  // Brand Colors - Use SPARINGLY for primary actions
  brand: {
    primary: {
      50: "hsl(168 84% 95%)",
      100: "hsl(168 84% 90%)",
      200: "hsl(168 84% 80%)",
      300: "hsl(168 84% 65%)",
      400: "hsl(168 84% 50%)",
      500: "hsl(168 84% 40%)",  // Main brand
      600: "hsl(168 84% 32%)",
      700: "hsl(168 84% 25%)",
      800: "hsl(168 84% 18%)",
      900: "hsl(168 84% 12%)",
    },
    secondary: {
      50: "hsl(262 83% 95%)",
      100: "hsl(262 83% 90%)",
      200: "hsl(262 83% 80%)",
      300: "hsl(262 83% 68%)",
      400: "hsl(262 83% 58%)",  // AI/Premium features
      500: "hsl(262 83% 48%)",
      600: "hsl(262 83% 40%)",
      700: "hsl(262 83% 32%)",
      800: "hsl(262 83% 24%)",
      900: "hsl(262 83% 16%)",
    },
  },

  // Semantic Colors - Healthcare Specific
  semantic: {
    success: {
      50: "hsl(142 76% 95%)",
      100: "hsl(142 76% 90%)",
      200: "hsl(142 76% 80%)",
      300: "hsl(142 76% 60%)",
      400: "hsl(142 76% 45%)",
      500: "hsl(142 76% 36%)",  // Healthy, normal, success
      600: "hsl(142 76% 29%)",
      700: "hsl(142 76% 22%)",
      800: "hsl(142 76% 15%)",
      900: "hsl(142 76% 10%)",
    },
    warning: {
      50: "hsl(38 92% 95%)",
      100: "hsl(38 92% 90%)",
      200: "hsl(38 92% 75%)",
      300: "hsl(38 92% 60%)",
      400: "hsl(38 92% 50%)",  // Caution, interactions
      500: "hsl(38 92% 42%)",
      600: "hsl(38 92% 34%)",
      700: "hsl(38 92% 26%)",
      800: "hsl(38 92% 18%)",
      900: "hsl(38 92% 12%)",
    },
    error: {
      50: "hsl(0 84% 95%)",
      100: "hsl(0 84% 90%)",
      200: "hsl(0 84% 80%)",
      300: "hsl(0 84% 70%)",
      400: "hsl(0 84% 60%)",  // Critical, urgent alerts
      500: "hsl(0 84% 50%)",
      600: "hsl(0 84% 42%)",
      700: "hsl(0 84% 34%)",
      800: "hsl(0 84% 26%)",
      900: "hsl(0 84% 18%)",
    },
    info: {
      50: "hsl(201 96% 95%)",
      100: "hsl(201 96% 90%)",
      200: "hsl(201 96% 78%)",
      300: "hsl(201 96% 60%)",
      400: "hsl(201 96% 45%)",
      500: "hsl(201 96% 32%)",  // Informational, neutral
      600: "hsl(201 96% 26%)",
      700: "hsl(201 96% 20%)",
      800: "hsl(201 96% 14%)",
      900: "hsl(201 96% 10%)",
    },
  },

  // Category Colors - Feature Identification
  category: {
    diagnosis: "hsl(201 96% 32%)",     // Blue - clinical, analytical
    imaging: "hsl(262 83% 58%)",       // Purple - technology, AI
    medicine: "hsl(142 76% 36%)",      // Green - pharmacy, treatment
    records: "hsl(38 92% 50%)",        // Amber - documents, history
  },

  // Neutral Scale
  neutral: {
    0: "hsl(0 0% 100%)",
    50: "hsl(210 40% 98%)",
    100: "hsl(210 40% 96%)",
    200: "hsl(214 32% 91%)",
    300: "hsl(213 27% 84%)",
    400: "hsl(215 20% 65%)",
    500: "hsl(215 16% 47%)",
    600: "hsl(215 19% 35%)",
    700: "hsl(215 25% 27%)",
    800: "hsl(217 33% 17%)",
    900: "hsl(222 47% 11%)",
    950: "hsl(229 84% 5%)",
  },
} as const;

// CSS Variable mapping for Tailwind
export const cssVariables = {
  light: {
    "--color-brand-primary": "168 84% 40%",
    "--color-brand-secondary": "262 83% 58%",
    "--color-success": "142 76% 36%",
    "--color-warning": "38 92% 50%",
    "--color-error": "0 84% 60%",
    "--color-info": "201 96% 32%",
    "--color-background": "210 40% 98%",
    "--color-foreground": "222 47% 11%",
    "--color-card": "0 0% 100%",
    "--color-card-foreground": "222 47% 11%",
    "--color-muted": "210 40% 96%",
    "--color-muted-foreground": "215 16% 47%",
    "--color-border": "214 32% 91%",
    "--color-input": "214 32% 91%",
    "--color-ring": "168 84% 40%",
  },
  dark: {
    "--color-brand-primary": "168 84% 45%",
    "--color-brand-secondary": "262 83% 65%",
    "--color-success": "142 71% 45%",
    "--color-warning": "38 92% 55%",
    "--color-error": "0 84% 60%",
    "--color-info": "199 89% 48%",
    "--color-background": "222 47% 6%",
    "--color-foreground": "210 40% 98%",
    "--color-card": "222 47% 9%",
    "--color-card-foreground": "210 40% 98%",
    "--color-muted": "217 33% 14%",
    "--color-muted-foreground": "215 20% 65%",
    "--color-border": "217 33% 17%",
    "--color-input": "217 33% 17%",
    "--color-ring": "168 84% 45%",
  },
} as const;

export type ColorToken = keyof typeof colors;
