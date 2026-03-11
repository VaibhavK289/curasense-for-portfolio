"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { springPresets } from "@/styles/tokens/animations";
import { Sparkline } from "./sparkline";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "brand" | "success" | "warning" | "error" | "info" | "secondary";
  className?: string;
  sparklineData?: number[];
  delay?: number;
}

const colorMap = {
  brand: {
    bg: "bg-[hsl(var(--brand-primary)/0.1)]",
    icon: "text-[hsl(var(--brand-primary))]",
    border: "border-[hsl(var(--brand-primary)/0.15)]",
    glow: "hsl(168, 82%, 42%)",
    gradient: "from-[hsl(var(--brand-primary)/0.15)] to-[hsl(var(--brand-primary)/0.05)]",
  },
  secondary: {
    bg: "bg-[hsl(var(--brand-secondary)/0.1)]",
    icon: "text-[hsl(var(--brand-secondary))]",
    border: "border-[hsl(var(--brand-secondary)/0.15)]",
    glow: "hsl(262, 83%, 62%)",
    gradient: "from-[hsl(var(--brand-secondary)/0.15)] to-[hsl(var(--brand-secondary)/0.05)]",
  },
  success: {
    bg: "bg-[hsl(var(--color-success)/0.1)]",
    icon: "text-[hsl(var(--color-success))]",
    border: "border-[hsl(var(--color-success)/0.15)]",
    glow: "hsl(152, 69%, 40%)",
    gradient: "from-[hsl(var(--color-success)/0.15)] to-[hsl(var(--color-success)/0.05)]",
  },
  warning: {
    bg: "bg-[hsl(var(--color-warning)/0.1)]",
    icon: "text-[hsl(var(--color-warning))]",
    border: "border-[hsl(var(--color-warning)/0.15)]",
    glow: "hsl(38, 92%, 50%)",
    gradient: "from-[hsl(var(--color-warning)/0.15)] to-[hsl(var(--color-warning)/0.05)]",
  },
  error: {
    bg: "bg-[hsl(var(--color-error)/0.1)]",
    icon: "text-[hsl(var(--color-error))]",
    border: "border-[hsl(var(--color-error)/0.15)]",
    glow: "hsl(0, 84%, 60%)",
    gradient: "from-[hsl(var(--color-error)/0.15)] to-[hsl(var(--color-error)/0.05)]",
  },
  info: {
    bg: "bg-[hsl(var(--color-info)/0.1)]",
    icon: "text-[hsl(var(--color-info))]",
    border: "border-[hsl(var(--color-info)/0.15)]",
    glow: "hsl(210, 92%, 55%)",
    gradient: "from-[hsl(var(--color-info)/0.15)] to-[hsl(var(--color-info)/0.05)]",
  },
};

// Animated counter component
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (hasAnimated.current) {
      // For subsequent updates, animate directly without delay
      const duration = 400;
      const startTime = performance.now();
      const startVal = displayValue;
      const endVal = valueRef.current;
      let frameId: number;
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(startVal + (endVal - startVal) * eased));
        if (progress < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frameId);
    }
    const timer = setTimeout(() => {
      hasAnimated.current = true;
      const duration = 1200;
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(value * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return <>{displayValue}</>;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "brand",
  className,
  sparklineData,
  delay = 0,
}: StatsCardProps) {
  const colors = colorMap[color];
  const isNumeric = typeof value === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springPresets.smooth, delay: delay * 0.08 }}
      whileHover={{
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-[hsl(var(--card))] p-5",
        "backdrop-blur-sm",
        colors.border,
        "hover:shadow-lg hover:shadow-[hsl(var(--brand-primary)/0.05)]",
        "transition-shadow duration-300",
        className
      )}
    >
      {/* Decorative gradient blob */}
      <div
        className={cn(
          "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
          `bg-gradient-to-br ${colors.gradient}`
        )}
      />

      {/* Subtle corner accent shape */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03]">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <circle cx="100" cy="0" r="60" fill="currentColor" />
        </svg>
      </div>

      <div className="relative">
        {/* Top row: Icon + Sparkline */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className={cn(
              "p-2.5 rounded-xl bg-gradient-to-br",
              colors.gradient
            )}
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={springPresets.snappy}
          >
            <Icon className={cn("h-5 w-5", colors.icon)} />
          </motion.div>

          {/* Sparkline */}
          {sparklineData && sparklineData.length >= 2 && (
            <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkline
                data={sparklineData}
                width={64}
                height={28}
                color={colors.glow}
              />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-1">
          <p className="text-3xl font-bold text-[hsl(var(--foreground))] tabular-nums tracking-tight">
            {isNumeric ? (
              <AnimatedNumber value={value as number} delay={delay * 80 + 200} />
            ) : (
              value
            )}
          </p>
          {trend && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + delay * 0.08 }}
              className={cn(
                "flex items-center gap-0.5 text-sm font-semibold rounded-full px-1.5 py-0.5",
                trend.isPositive
                  ? "text-[hsl(var(--color-success))] bg-[hsl(var(--color-success)/0.1)]"
                  : "text-[hsl(var(--color-error))] bg-[hsl(var(--color-error)/0.1)]"
              )}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className={cn(!trend.isPositive && "rotate-180")}
              >
                <path
                  d="M5 2L8 6H2L5 2Z"
                  fill="currentColor"
                />
              </svg>
              {Math.abs(trend.value)}%
            </motion.span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          {title}
        </p>

        {/* Description */}
        {description && (
          <p className="text-xs text-[hsl(var(--muted-foreground)/0.7)] mt-1">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
