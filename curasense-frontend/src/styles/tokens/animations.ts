// Design Tokens: Animation & Motion
// Consistent animation timing and easing functions

export const duration = {
  instant: "0ms",
  fastest: "50ms",
  faster: "100ms",
  fast: "150ms",
  normal: "200ms",
  slow: "300ms",
  slower: "400ms",
  slowest: "500ms",
  
  // Specific use cases
  "fade-in": "150ms",
  "fade-out": "100ms",
  "slide-in": "250ms",
  "slide-out": "200ms",
  "scale-in": "200ms",
  "scale-out": "150ms",
  "modal-in": "300ms",
  "modal-out": "200ms",
} as const;

export const easing = {
  // Standard curves
  linear: "linear",
  ease: "ease",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  
  // Custom curves for specific effects
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",  // Bounce effect
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",   // More pronounced bounce
  smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",         // Apple-like smooth
  snappy: "cubic-bezier(0.2, 0, 0, 1)",               // Quick and responsive
} as const;

// Framer Motion spring presets
export const springPresets = {
  // Snappy - for buttons, small UI elements
  snappy: { type: "spring", stiffness: 400, damping: 25, mass: 0.5 },
  
  // Smooth - for cards, medium elements
  smooth: { type: "spring", stiffness: 200, damping: 30, mass: 1 },
  
  // Bouncy - for playful interactions
  bouncy: { type: "spring", stiffness: 300, damping: 15, mass: 0.8 },
  
  // Heavy - for large panels, modals
  heavy: { type: "spring", stiffness: 100, damping: 20, mass: 1.5 },
  
  // Gentle - for subtle movements
  gentle: { type: "spring", stiffness: 120, damping: 25, mass: 1 },
} as const;

// Animation variants for Framer Motion
export const animationVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  fadeDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  fadeLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
  },
  fadeRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  },
  
  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.9, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 5 },
  },
  
  // Blur animations
  blurIn: {
    initial: { opacity: 0, filter: "blur(8px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(4px)" },
  },
  
  // Slide animations
  slideInRight: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
  slideInLeft: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
  },
  slideInUp: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
  },
  slideInDown: {
    initial: { y: "-100%" },
    animate: { y: 0 },
    exit: { y: "-100%" },
  },
} as const;

// Stagger configurations
export const staggerConfig = {
  fast: { staggerChildren: 0.05 },
  normal: { staggerChildren: 0.1 },
  slow: { staggerChildren: 0.15 },
  delayed: { staggerChildren: 0.1, delayChildren: 0.2 },
} as const;

// Element-specific spring physics (heavier elements feel heavier)
export const elementSprings = {
  // Light elements - very snappy
  button: { type: "spring", stiffness: 500, damping: 25, mass: 0.4 },
  icon: { type: "spring", stiffness: 600, damping: 20, mass: 0.3 },
  badge: { type: "spring", stiffness: 550, damping: 22, mass: 0.35 },
  
  // Medium elements
  card: { type: "spring", stiffness: 250, damping: 30, mass: 0.8 },
  dropdown: { type: "spring", stiffness: 350, damping: 28, mass: 0.6 },
  tooltip: { type: "spring", stiffness: 400, damping: 25, mass: 0.5 },
  
  // Heavy elements - slower, more deliberate
  modal: { type: "spring", stiffness: 150, damping: 25, mass: 1.2 },
  sidebar: { type: "spring", stiffness: 180, damping: 28, mass: 1.0 },
  page: { type: "spring", stiffness: 120, damping: 22, mass: 1.4 },
  panel: { type: "spring", stiffness: 140, damping: 26, mass: 1.1 },
} as const;

// Gesture-based animation configs
export const gestureConfig = {
  // Drag constraints and elastic
  drag: {
    bounceStiffness: 400,
    bounceDamping: 40,
  },
  
  // Hover effects
  hoverScale: {
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  hoverLift: {
    y: -4,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  
  // Tap/Press effects
  tapScale: {
    scale: 0.97,
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },
  tapPush: {
    scale: 0.98,
    y: 2,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
} as const;

// Page transition variants
export const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { type: "spring", stiffness: 250, damping: 25 },
  },
  blur: {
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(5px)" },
    transition: { duration: 0.3 },
  },
} as const;

// Micro-interaction presets
export const microInteractions = {
  // Button press effect
  buttonPress: {
    scale: 0.97,
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },
  
  // Input focus glow
  inputFocus: {
    boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.2)",
    transition: { duration: 0.15 },
  },
  
  // Success feedback
  successState: {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.2, 1], 
      opacity: 1,
    },
    transition: { duration: 0.4, times: [0, 0.6, 1] },
  },
  
  // Error shake
  errorShake: {
    animate: { 
      x: [0, -8, 8, -6, 6, -4, 4, 0],
    },
    transition: { duration: 0.5 },
  },
  
  // Card hover lift
  cardHover: {
    y: -4,
    boxShadow: "0 12px 30px -8px rgba(0, 0, 0, 0.15)",
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  
  // Toggle switch
  toggleSwitch: {
    type: "spring",
    stiffness: 500,
    damping: 30,
  },
  
  // Menu open
  menuOpen: {
    initial: { opacity: 0, scale: 0.95, y: -5 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -5 },
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  
  // Tooltip show
  tooltipShow: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.15 },
  },
  
  // Attention pulse
  attention: {
    animate: { 
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 0 rgba(20, 184, 166, 0)",
        "0 0 0 8px rgba(20, 184, 166, 0.3)",
        "0 0 0 0 rgba(20, 184, 166, 0)",
      ],
    },
    transition: { duration: 1.5, repeat: Infinity },
  },
  
  // Loading bounce
  loadingBounce: {
    animate: { y: [0, -8, 0] },
    transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.1 },
  },
} as const;

export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;
export type SpringPreset = keyof typeof springPresets;
export type AnimationVariant = keyof typeof animationVariants;
export type ElementSpring = keyof typeof elementSprings;
export type PageTransition = keyof typeof pageTransitions;
