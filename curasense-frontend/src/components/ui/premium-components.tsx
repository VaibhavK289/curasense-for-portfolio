"use client";

// ============================================
// CURASENSE PREMIUM UI COMPONENTS V2.0
// Beautiful, Accessible, Performant
// ============================================

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, Variants } from "framer-motion";
import { useRef, useState, useEffect, MouseEvent as ReactMouseEvent, ReactNode, forwardRef } from "react";

// ============================================
// ANIMATION PRESETS
// ============================================
export const springConfigs = {
  gentle: { type: "spring" as const, stiffness: 100, damping: 20, mass: 1 },
  smooth: { type: "spring" as const, stiffness: 150, damping: 25, mass: 0.8 },
  snappy: { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.5 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 15, mass: 0.6 },
  stiff: { type: "spring" as const, stiffness: 500, damping: 35, mass: 0.4 },
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

// ============================================
// PREMIUM GLASS CARD
// Frosted glass effect with depth
// ============================================
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "subtle" | "default" | "strong" | "solid";
  hover?: boolean;
  glow?: boolean;
  glowColor?: "primary" | "secondary" | "success" | "warning";
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  className,
  variant = "default",
  hover = true,
  glow = false,
  glowColor = "primary",
}, ref) => {
  const glassStyles = {
    subtle: "bg-white/30 dark:bg-neutral-900/30 backdrop-blur-sm border-white/20 dark:border-white/5",
    default: "bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border-white/30 dark:border-white/10",
    strong: "bg-white/70 dark:bg-neutral-900/70 backdrop-blur-lg border-white/40 dark:border-white/15",
    solid: "bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-white/50 dark:border-white/10",
  };

  const glowStyles = {
    primary: "shadow-[0_0_60px_-15px_hsl(var(--brand-primary)/0.25)]",
    secondary: "shadow-[0_0_60px_-15px_hsl(var(--brand-secondary)/0.25)]",
    success: "shadow-[0_0_60px_-15px_hsl(var(--color-success)/0.25)]",
    warning: "shadow-[0_0_60px_-15px_hsl(var(--color-warning)/0.25)]",
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative rounded-2xl border transition-all duration-300",
        glassStyles[variant],
        hover && "hover:bg-white/60 dark:hover:bg-neutral-900/60 hover:border-white/40 dark:hover:border-white/15",
        hover && "hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]",
        glow && glowStyles[glowColor],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.smooth}
    >
      {/* Inner highlight */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </motion.div>
  );
});
GlassCard.displayName = "GlassCard";

// ============================================
// MAGNETIC BUTTON
// Follows cursor within magnetic field
// ============================================
interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({ children, className, strength = 0.3 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  const springY = useSpring(y, { stiffness: 400, damping: 25 });

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// AURORA BACKGROUND
// Beautiful gradient animation
// ============================================
interface AuroraBackgroundProps {
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
}

export function AuroraBackground({ className, intensity = "medium" }: AuroraBackgroundProps) {
  const opacities = {
    subtle: "opacity-20",
    medium: "opacity-30",
    strong: "opacity-40",
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Primary aurora */}
      <motion.div
        className={cn(
          "absolute -top-1/2 -left-1/2 w-full h-full",
          "bg-gradient-to-br from-[hsl(var(--brand-primary)/0.5)] via-transparent to-[hsl(var(--brand-secondary)/0.3)]",
          "blur-3xl rounded-full",
          opacities[intensity]
        )}
        animate={{
          x: ["0%", "20%", "0%"],
          y: ["0%", "15%", "0%"],
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Secondary aurora */}
      <motion.div
        className={cn(
          "absolute -bottom-1/2 -right-1/2 w-full h-full",
          "bg-gradient-to-tl from-[hsl(var(--brand-secondary)/0.4)] via-transparent to-[hsl(var(--color-success)/0.2)]",
          "blur-3xl rounded-full",
          opacities[intensity]
        )}
        animate={{
          x: ["0%", "-15%", "0%"],
          y: ["0%", "-20%", "0%"],
          scale: [1, 1.15, 1],
          rotate: [0, -8, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      {/* Accent aurora */}
      <motion.div
        className={cn(
          "absolute top-1/4 left-1/3 w-2/3 h-2/3",
          "bg-gradient-to-r from-[hsl(var(--color-info)/0.3)] to-transparent",
          "blur-3xl rounded-full",
          "opacity-20"
        )}
        animate={{
          x: ["-10%", "10%", "-10%"],
          y: ["5%", "-5%", "5%"],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />
    </div>
  );
}

// ============================================
// GLOW ORB
// Floating decorative element
// ============================================
interface GlowOrbProps {
  className?: string;
  color?: "primary" | "secondary" | "success" | "info" | "warning";
  size?: "sm" | "md" | "lg" | "xl";
  delay?: number;
  blur?: "sm" | "md" | "lg" | "xl";
}

export function GlowOrb({ 
  className, 
  color = "primary", 
  size = "md",
  delay = 0,
  blur = "lg"
}: GlowOrbProps) {
  const colorStyles = {
    primary: "bg-[hsl(var(--brand-primary))]",
    secondary: "bg-[hsl(var(--brand-secondary))]",
    success: "bg-[hsl(var(--color-success))]",
    info: "bg-[hsl(var(--color-info))]",
    warning: "bg-[hsl(var(--color-warning))]",
  };

  const sizeStyles = {
    sm: "w-24 h-24 md:w-32 md:h-32",
    md: "w-40 h-40 md:w-56 md:h-56",
    lg: "w-64 h-64 md:w-80 md:h-80",
    xl: "w-80 h-80 md:w-[28rem] md:h-[28rem]",
  };

  const blurStyles = {
    sm: "blur-2xl",
    md: "blur-3xl",
    lg: "blur-[80px]",
    xl: "blur-[120px]",
  };

  return (
    <motion.div
      className={cn(
        "absolute rounded-full pointer-events-none",
        colorStyles[color],
        sizeStyles[size],
        blurStyles[blur],
        "opacity-20 dark:opacity-15",
        className
      )}
      animate={{
        scale: [1, 1.15, 1],
        x: [0, 15, 0],
        y: [0, -15, 0],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 12 + Math.random() * 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

// ============================================
// SPOTLIGHT CARD V2
// Enhanced mouse-following spotlight
// ============================================
interface SpotlightCardV2Props {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  borderGlow?: boolean;
}

export function SpotlightCardV2({
  children,
  className,
  spotlightColor = "hsl(var(--brand-primary))",
  borderGlow = false,
}: SpotlightCardV2Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
        "transition-shadow duration-500",
        "hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12)]",
        "dark:hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)]",
        borderGlow && "hover:border-[hsl(var(--brand-primary)/0.3)]",
        className
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={springConfigs.smooth}
    >
      {/* Spotlight gradient */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor} / 0.06, transparent 40%)`,
        }}
      />
      {/* Border glow effect */}
      {borderGlow && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500"
          style={{
            opacity: opacity * 0.5,
            background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor} / 0.15, transparent 50%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ============================================
// GRADIENT TEXT V2
// Enhanced animated gradient text
// ============================================
interface GradientTextV2Props {
  children: ReactNode;
  className?: string;
  variant?: "brand" | "sunset" | "ocean" | "forest" | "aurora";
  animate?: boolean;
}

export function GradientTextV2({
  children,
  className,
  variant = "brand",
  animate = false,
}: GradientTextV2Props) {
  const gradients = {
    brand: "from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-secondary))] to-[hsl(var(--brand-primary))]",
    sunset: "from-amber-500 via-rose-500 to-purple-600",
    ocean: "from-cyan-400 via-blue-500 to-indigo-600",
    forest: "from-emerald-400 via-teal-500 to-cyan-600",
    aurora: "from-violet-400 via-fuchsia-500 to-pink-500",
  };

  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        gradients[variant],
        animate && "bg-[length:200%_auto] animate-gradient",
        className
      )}
    >
      {children}
    </span>
  );
}

// ============================================
// PARALLAX CONTAINER
// 3D parallax effect container
// ============================================
interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function ParallaxContainer({
  children,
  className,
  intensity = 15,
}: ParallaxContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 200,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 200,
    damping: 30,
  });

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1200,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAGGER ANIMATION CONTAINER
// Animate children in sequence
// ============================================
interface StaggerContainerV2Props {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export function StaggerContainerV2({
  children,
  className,
  staggerDelay = 0.08,
  initialDelay = 0,
}: StaggerContainerV2Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ staggerChildren: staggerDelay, delayChildren: initialDelay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItemV2({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={slideUpVariants}
      transition={springConfigs.smooth}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATED COUNTER
// Smooth number animation
// ============================================
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  className,
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(eased * value));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

// ============================================
// RIPPLE BUTTON
// Material-style ripple effect
// ============================================
interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function RippleButton({
  children,
  className,
  onClick,
  disabled = false,
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
    onClick?.();
  };

  return (
    <button
      className={cn(
        "relative overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{ width: 400, height: 400, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}

// ============================================
// MORPHING BLOB
// Organic animated shape
// ============================================
interface MorphingBlobProps {
  className?: string;
  color?: "primary" | "secondary" | "gradient";
}

export function MorphingBlob({ className, color = "gradient" }: MorphingBlobProps) {
  const colorStyles = {
    primary: "bg-[hsl(var(--brand-primary))]",
    secondary: "bg-[hsl(var(--brand-secondary))]",
    gradient: "bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]",
  };

  return (
    <motion.div
      className={cn(
        "absolute pointer-events-none blur-3xl opacity-30",
        colorStyles[color],
        className
      )}
      animate={{
        borderRadius: [
          "30% 70% 70% 30% / 30% 30% 70% 70%",
          "60% 40% 30% 70% / 60% 30% 70% 40%",
          "40% 60% 60% 40% / 70% 30% 30% 70%",
          "30% 70% 70% 30% / 30% 30% 70% 70%",
        ],
        scale: [1, 1.05, 0.95, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// ============================================
// SHIMMER SKELETON
// Loading placeholder
// ============================================
interface ShimmerProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Shimmer({ className, rounded = "md" }: ShimmerProps) {
  const roundedStyles = {
    sm: "rounded",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[hsl(var(--muted))]",
        roundedStyles[rounded],
        className
      )}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ============================================
// FLOATING ACTION INDICATOR
// Pulsing dot for status
// ============================================
interface PulsingIndicatorProps {
  color?: "success" | "warning" | "error" | "info" | "primary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulsingIndicator({
  color = "success",
  size = "sm",
  className,
}: PulsingIndicatorProps) {
  const colorStyles = {
    success: "bg-[hsl(var(--color-success))]",
    warning: "bg-[hsl(var(--color-warning))]",
    error: "bg-[hsl(var(--color-error))]",
    info: "bg-[hsl(var(--color-info))]",
    primary: "bg-[hsl(var(--brand-primary))]",
  };

  const sizeStyles = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const ringColors = {
    success: "ring-[hsl(var(--color-success)/0.4)]",
    warning: "ring-[hsl(var(--color-warning)/0.4)]",
    error: "ring-[hsl(var(--color-error)/0.4)]",
    info: "ring-[hsl(var(--color-info)/0.4)]",
    primary: "ring-[hsl(var(--brand-primary)/0.4)]",
  };

  return (
    <span className={cn("relative inline-flex", className)}>
      <span className={cn("rounded-full", colorStyles[color], sizeStyles[size])} />
      <motion.span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full ring-2 ring-offset-0",
          colorStyles[color],
          ringColors[color]
        )}
        animate={{ scale: [1, 1.75], opacity: [0.75, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
      />
    </span>
  );
}

// ============================================
// ANIMATED DIVIDER
// Decorative section separator
// ============================================
interface AnimatedDividerProps {
  variant?: "line" | "dots" | "wave" | "gradient";
  className?: string;
}

export function AnimatedDivider({ variant = "gradient", className }: AnimatedDividerProps) {
  if (variant === "dots") {
    return (
      <div className={cn("flex justify-center items-center gap-2 py-6", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--muted-foreground)/0.3)]"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className={cn("flex justify-center py-6", className)}>
        <svg viewBox="0 0 200 20" className="w-32 h-5">
          <motion.path
            d="M0,10 Q25,0 50,10 T100,10 T150,10 T200,10"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
            strokeOpacity="0.3"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <motion.div
        className={cn("h-px my-8", className)}
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--border)), transparent)",
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    );
  }

  return (
    <motion.div
      className={cn("h-px bg-[hsl(var(--border))] my-8", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  );
}

// ============================================
// FEATURE ICON
// Icon with decorative background
// ============================================
interface FeatureIconProps {
  icon: React.ComponentType<{ className?: string }>;
  color?: "primary" | "secondary" | "success" | "warning" | "info" | "error";
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "solid" | "gradient" | "glass" | "outline";
  className?: string;
}

export function FeatureIcon({
  icon: Icon,
  color = "primary",
  size = "md",
  variant = "gradient",
  className,
}: FeatureIconProps) {
  const sizeStyles = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
    xl: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
    xl: "w-8 h-8",
  };

  const colorMap = {
    primary: "var(--brand-primary)",
    secondary: "var(--brand-secondary)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
    error: "var(--color-error)",
  };

  const baseStyles = cn(
    "flex items-center justify-center rounded-xl",
    sizeStyles[size],
    className
  );

  if (variant === "solid") {
    return (
      <div className={cn(baseStyles, `bg-[hsl(${colorMap[color]})]`)}>
        <Icon className={cn(iconSizes[size], "text-white")} />
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div
        className={cn(baseStyles, "bg-gradient-to-br shadow-lg")}
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(${colorMap[color]}), hsl(${colorMap[color]} / 0.7))`,
          boxShadow: `0 8px 24px -8px hsl(${colorMap[color]} / 0.4)`,
        }}
      >
        <Icon className={cn(iconSizes[size], "text-white")} />
      </div>
    );
  }

  if (variant === "glass") {
    return (
      <div
        className={cn(
          baseStyles,
          "bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20"
        )}
      >
        <Icon className={cn(iconSizes[size], `text-[hsl(${colorMap[color]})]`)} />
      </div>
    );
  }

  // Outline variant
  return (
    <div
      className={cn(baseStyles, "border-2")}
      style={{ borderColor: `hsl(${colorMap[color]} / 0.3)` }}
    >
      <Icon className={cn(iconSizes[size], `text-[hsl(${colorMap[color]})]`)} />
    </div>
  );
}
