"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, MouseEvent as ReactMouseEvent } from "react";
import { springPresets, animationVariants } from "@/styles/tokens/animations";

// ============================================
// GLOWING BORDER
// Use sparingly for emphasis
// ============================================
export function GlowingBorder({
  children,
  className,
  glowColor = "brand-primary",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: "brand-primary" | "success" | "warning" | "error" | "info";
}) {
  const colorMap = {
    "brand-primary": "from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-secondary))] to-[hsl(var(--brand-primary))]",
    success: "from-[hsl(var(--color-success))] via-[hsl(142_76%_50%)] to-[hsl(var(--color-success))]",
    warning: "from-[hsl(var(--color-warning))] via-[hsl(38_92%_60%)] to-[hsl(var(--color-warning))]",
    error: "from-[hsl(var(--color-error))] via-[hsl(0_84%_70%)] to-[hsl(var(--color-error))]",
    info: "from-[hsl(var(--color-info))] via-[hsl(201_96%_45%)] to-[hsl(var(--color-info))]",
  };

  return (
    <div className={cn("relative group", className)}>
      <div 
        className={cn(
          "absolute -inset-0.5 bg-gradient-to-r rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500",
          colorMap[glowColor]
        )}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

// ============================================
// SPOTLIGHT CARD
// Interactive card with mouse-following spotlight
// ============================================
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative overflow-hidden rounded-xl border border-[hsl(var(--border))]",
        "bg-[hsl(var(--card))] shadow-sm",
        "transition-shadow duration-300 hover:shadow-lg",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.smooth}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, hsl(var(--brand-primary) / 0.08), transparent 40%)`,
        }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

// ============================================
// 3D TILT CARD
// Card with 3D perspective tilt on hover
// ============================================
export function TiltCard({
  children,
  className,
  tiltAmount = 10,
}: {
  children: React.ReactNode;
  className?: string;
  tiltAmount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltAmount, -tiltAmount]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltAmount, tiltAmount]), {
    stiffness: 300,
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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
      }}
      className={cn(
        "relative rounded-xl border border-[hsl(var(--border))]",
        "bg-[hsl(var(--card))] shadow-md",
        "transition-shadow duration-300 hover:shadow-xl",
        className
      )}
    >
      <div style={{ transform: "translateZ(20px)" }}>{children}</div>
    </motion.div>
  );
}

// ============================================
// FLOATING ORB
// Animated background decoration - use 1-2 max per page
// ============================================
export function FloatingOrb({
  className,
  delay = 0,
  color = "brand-primary",
}: {
  className?: string;
  delay?: number;
  color?: "brand-primary" | "brand-secondary" | "success" | "info";
}) {
  const colorMap = {
    "brand-primary": "bg-[hsl(var(--brand-primary))]",
    "brand-secondary": "bg-[hsl(var(--brand-secondary))]",
    success: "bg-[hsl(var(--color-success))]",
    info: "bg-[hsl(var(--color-info))]",
  };

  return (
    <motion.div
      className={cn(
        "absolute rounded-full blur-3xl opacity-20 pointer-events-none",
        colorMap[color],
        className
      )}
      animate={{
        scale: [1, 1.1, 1],
        x: [0, 10, 0],
        y: [0, -10, 0],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

// ============================================
// GRID PATTERN
// Subtle background pattern
// ============================================
export function GridPattern({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:24px_24px]",
        "[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]",
        className
      )}
    />
  );
}

// ============================================
// PULSING DOT
// Status indicator with pulse animation
// ============================================
export function PulsingDot({ 
  className,
  color = "success",
}: { 
  className?: string;
  color?: "success" | "warning" | "error" | "info" | "brand";
}) {
  const colorMap = {
    success: "bg-[hsl(var(--color-success))]",
    warning: "bg-[hsl(var(--color-warning))]",
    error: "bg-[hsl(var(--color-error))]",
    info: "bg-[hsl(var(--color-info))]",
    brand: "bg-[hsl(var(--brand-primary))]",
  };

  const pingColorMap = {
    success: "bg-[hsl(142_76%_50%)]",
    warning: "bg-[hsl(38_92%_60%)]",
    error: "bg-[hsl(0_84%_70%)]",
    info: "bg-[hsl(201_96%_45%)]",
    brand: "bg-[hsl(168_84%_50%)]",
  };

  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      <span className={cn(
        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
        pingColorMap[color]
      )} />
      <span className={cn(
        "relative inline-flex rounded-full h-2.5 w-2.5",
        colorMap[color]
      )} />
    </span>
  );
}

// ============================================
// GRADIENT TEXT
// Use ONLY for hero headlines - max 1 per page
// ============================================
export function GradientText({
  children,
  className,
  variant = "brand",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "brand" | "success" | "cool";
}) {
  const variantMap = {
    brand: "from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-secondary))] to-[hsl(var(--brand-primary))]",
    success: "from-[hsl(var(--color-success))] to-[hsl(142_76%_50%)]",
    cool: "from-[hsl(var(--color-info))] via-[hsl(var(--brand-secondary))] to-[hsl(var(--brand-primary))]",
  };

  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ============================================
// SHIMMER BUTTON
// Premium CTA button with animated border
// ============================================
export function ShimmerButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      className={cn(
        "relative inline-flex h-12 overflow-hidden rounded-lg p-[2px]",
        "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary))] focus:ring-offset-2",
        className
      )}
      {...props}
    >
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,hsl(var(--brand-primary))_0%,hsl(var(--brand-secondary))_50%,hsl(var(--brand-primary))_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-[hsl(var(--background))] px-6 py-2 text-sm font-semibold text-[hsl(var(--foreground))] backdrop-blur-3xl gap-2 hover:bg-[hsl(var(--muted))] transition-colors">
        {children}
      </span>
    </button>
  );
}

// ============================================
// BORDER BEAM
// Animated border effect for cards
// ============================================
export function BorderBeam({ 
  className,
  duration = 4,
}: { 
  className?: string;
  duration?: number;
}) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden rounded-xl pointer-events-none", className)}>
      <div className="absolute inset-0">
        <div
          className="absolute h-[200%] w-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,hsl(var(--brand-primary))_360deg)]"
          style={{
            top: "-50%",
            left: "-50%",
            animation: `spin ${duration}s linear infinite`,
          }}
        />
      </div>
      <div className="absolute inset-[1px] rounded-xl bg-[hsl(var(--card))]" />
    </div>
  );
}

// ============================================
// MAGNETIC BUTTON
// Button that follows cursor within range
// ============================================
export function MagneticButton({
  children,
  className,
  strength = 0.3,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  const springY = useSpring(y, { stiffness: 400, damping: 25 });

  const handleMouseMove = (e: ReactMouseEvent<HTMLButtonElement>) => {
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
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      type={type}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// ============================================
// SKELETON LOADER
// Loading placeholder with shimmer effect
// ============================================
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton rounded-md", className)}
      {...props}
    />
  );
}

// ============================================
// ANIMATED CONTAINER
// Wrapper for consistent entry animations
// ============================================
export function AnimatedContainer({
  children,
  className,
  variant = "fadeUp",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof animationVariants;
  delay?: number;
}) {
  const variants = animationVariants[variant];
  
  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ ...springPresets.smooth, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAGGER CONTAINER
// Parent container for staggered children animations
// ============================================
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={springPresets.smooth}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ORGANIC BLOB SHAPE
// Soft, healthcare-friendly background decoration
// ============================================
export function OrganicBlob({
  className,
  color = "brand-primary",
  animate = true,
}: {
  className?: string;
  color?: "brand-primary" | "brand-secondary" | "success" | "info" | "warning";
  animate?: boolean;
}) {
  const colorMap = {
    "brand-primary": "fill-[hsl(var(--brand-primary)/0.1)]",
    "brand-secondary": "fill-[hsl(var(--brand-secondary)/0.1)]",
    success: "fill-[hsl(var(--color-success)/0.1)]",
    info: "fill-[hsl(var(--color-info)/0.1)]",
    warning: "fill-[hsl(var(--color-warning)/0.1)]",
  };

  return (
    <motion.svg
      viewBox="0 0 200 200"
      className={cn("absolute pointer-events-none", className)}
      animate={animate ? {
        scale: [1, 1.05, 1],
        rotate: [0, 5, 0],
      } : undefined}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path
        d="M47.7,-57.2C59.5,-47.3,65.4,-30.5,67.4,-13.6C69.4,3.3,67.4,20.2,59.4,33.8C51.4,47.4,37.3,57.6,21.5,63.3C5.7,69,-11.8,70.2,-27.4,64.9C-43,59.6,-56.7,47.7,-64.7,32.6C-72.7,17.5,-75,-.8,-70.4,-17.1C-65.8,-33.4,-54.3,-47.6,-40.6,-57.1C-26.9,-66.6,-11,-71.3,3.9,-76.1C18.9,-80.9,35.9,-67.1,47.7,-57.2Z"
        transform="translate(100 100)"
        className={colorMap[color]}
      />
    </motion.svg>
  );
}

// ============================================
// HEARTBEAT LINE DIVIDER
// Medical-themed section divider
// ============================================
export function HeartbeatDivider({
  className,
  color = "brand",
}: {
  className?: string;
  color?: "brand" | "success" | "muted";
}) {
  const colorMap = {
    brand: "stroke-[hsl(var(--brand-primary))]",
    success: "stroke-[hsl(var(--color-success))]",
    muted: "stroke-[hsl(var(--muted-foreground)/0.3)]",
  };

  return (
    <div className={cn("w-full flex items-center justify-center py-6", className)}>
      <svg
        viewBox="0 0 400 50"
        className="w-full max-w-md h-8"
        preserveAspectRatio="xMidYMid meet"
      >
        <motion.path
          d="M0,25 L120,25 L140,25 L150,10 L160,40 L170,5 L180,45 L190,25 L200,25 L220,25 L400,25"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={colorMap[color]}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

// ============================================
// DNA HELIX PATTERN
// Subtle background pattern for medical context
// ============================================
export function DNAPattern({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden opacity-5 pointer-events-none", className)}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="dna" x="0" y="0" width="20" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M10,0 Q20,10 10,20 Q0,30 10,40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-[hsl(var(--brand-primary))]"
            />
            <circle cx="10" cy="10" r="2" className="fill-[hsl(var(--brand-primary))]" />
            <circle cx="10" cy="30" r="2" className="fill-[hsl(var(--brand-secondary))]" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dna)" />
      </svg>
    </div>
  );
}

// ============================================
// MEDICAL CROSS ICON CONTAINER
// Shape storytelling for medical features
// ============================================
export function MedicalCrossContainer({
  children,
  className,
  size = "default",
  color = "brand",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "default" | "lg";
  color?: "brand" | "diagnosis" | "medicine" | "imaging";
}) {
  const sizeMap = {
    sm: "w-10 h-10",
    default: "w-14 h-14",
    lg: "w-20 h-20",
  };
  
  const colorMap = {
    brand: "from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]",
    diagnosis: "from-[hsl(var(--color-diagnosis))] to-[hsl(201_96%_45%)]",
    medicine: "from-[hsl(var(--color-medicine))] to-[hsl(142_76%_50%)]",
    imaging: "from-[hsl(var(--color-imaging))] to-[hsl(262_83%_70%)]",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeMap[size],
        className
      )}
    >
      {/* Cross shape background */}
      <div className="absolute inset-0">
        <div className={cn(
          "absolute inset-x-[30%] inset-y-0 rounded-sm bg-gradient-to-b shadow-lg",
          colorMap[color]
        )} />
        <div className={cn(
          "absolute inset-y-[30%] inset-x-0 rounded-sm bg-gradient-to-r shadow-lg",
          colorMap[color]
        )} />
      </div>
      <div className="relative z-10 text-white">{children}</div>
    </div>
  );
}

// ============================================
// CAPSULE SHAPE CONTAINER
// For medicine/pill related features
// ============================================
export function CapsuleContainer({
  children,
  className,
  color = "medicine",
}: {
  children: React.ReactNode;
  className?: string;
  color?: "medicine" | "brand" | "warning";
}) {
  const colorMap = {
    medicine: "from-[hsl(var(--color-medicine))] to-[hsl(142_76%_50%)]",
    brand: "from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]",
    warning: "from-[hsl(var(--color-warning))] to-[hsl(38_92%_60%)]",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r shadow-lg",
        colorMap[color],
        className
      )}
    >
      <div className="text-white">{children}</div>
    </div>
  );
}

// ============================================
// PRESS BUTTON
// Button with tactile press feedback
// ============================================
export function PressButton({
  children,
  className,
  onClick,
  disabled,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "success" | "warning" | "outline";
}) {
  const variantMap = {
    default: "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white shadow-lg shadow-[hsl(var(--brand-primary)/0.25)]",
    success: "bg-[hsl(var(--color-success))] text-white shadow-lg shadow-[hsl(var(--color-success)/0.25)]",
    warning: "bg-[hsl(var(--color-warning))] text-[hsl(var(--neutral-900))] shadow-lg shadow-[hsl(var(--color-warning)/0.25)]",
    outline: "bg-transparent border-2 border-[hsl(var(--brand-primary))] text-[hsl(var(--brand-primary))]",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary))] focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantMap[variant],
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97, y: disabled ? 0 : 2 }}
      transition={springPresets.snappy}
    >
      {children}
    </motion.button>
  );
}

// ============================================
// RIPPLE BUTTON
// Material-style ripple effect on click
// ============================================
export function RippleButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
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
      ref={buttonRef}
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold",
        "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white",
        "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary))] focus:ring-offset-2",
        className
      )}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
          animate={{ width: 300, height: 300, x: -150, y: -150, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

// ============================================
// FOCUS INPUT
// Input with animated focus states
// ============================================
export function FocusInput({
  className,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  label?: string;
  error?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className={cn("relative", className)}>
      {label && (
        <motion.label
          className={cn(
            "absolute left-3 transition-colors pointer-events-none",
            error ? "text-[hsl(var(--color-error))]" : isFocused ? "text-[hsl(var(--brand-primary))]" : "text-[hsl(var(--muted-foreground))]"
          )}
          animate={{
            y: isFocused || hasValue ? -24 : 12,
            scale: isFocused || hasValue ? 0.85 : 1,
            x: isFocused || hasValue ? -8 : 0,
          }}
          transition={springPresets.snappy}
        >
          {label}
        </motion.label>
      )}
      <input
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(!!e.target.value);
          props.onBlur?.(e);
        }}
        onChange={(e) => {
          setHasValue(!!e.target.value);
          props.onChange?.(e);
        }}
        className={cn(
          "w-full px-4 py-3 rounded-lg border-2 bg-[hsl(var(--background))] transition-all duration-200",
          "focus:outline-none",
          error
            ? "border-[hsl(var(--color-error))] focus:border-[hsl(var(--color-error))] focus:ring-2 focus:ring-[hsl(var(--color-error)/0.2)]"
            : "border-[hsl(var(--border))] focus:border-[hsl(var(--brand-primary))] focus:ring-2 focus:ring-[hsl(var(--brand-primary)/0.2)]"
        )}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-[hsl(var(--color-error))]"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ============================================
// SUCCESS CHECKMARK
// Animated success indicator
// ============================================
export function SuccessCheckmark({
  className,
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className={className}
    >
      <motion.circle
        cx="25"
        cy="25"
        r="23"
        fill="none"
        stroke="hsl(var(--color-success))"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.path
        d="M15 25 L22 32 L35 18"
        fill="none"
        stroke="hsl(var(--color-success))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

// ============================================
// ERROR CROSS
// Animated error indicator
// ============================================
export function ErrorCross({
  className,
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className={className}
    >
      <motion.circle
        cx="25"
        cy="25"
        r="23"
        fill="none"
        stroke="hsl(var(--color-error))"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.path
        d="M17 17 L33 33 M33 17 L17 33"
        fill="none"
        stroke="hsl(var(--color-error))"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

// ============================================
// EMPTY STATE
// Illustrated empty state component
// ============================================
export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-8",
        className
      )}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...springPresets.bouncy, delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-6"
        >
          <Icon className="w-10 h-10 text-[hsl(var(--muted-foreground))]" />
        </motion.div>
      )}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-[hsl(var(--muted-foreground))] max-w-sm mb-6"
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
