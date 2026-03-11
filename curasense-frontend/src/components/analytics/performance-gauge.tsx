"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { springPresets } from "@/styles/tokens/animations";

interface PerformanceGaugeProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  sublabel?: string;
}

export function PerformanceGauge({
  score,
  size = 180,
  strokeWidth = 12,
  className,
  label = "Health Score",
  sublabel,
}: PerformanceGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const center = size / 2;

  // Color stops based on score
  const getColor = (s: number) => {
    if (s >= 80) return "hsl(var(--color-success))";
    if (s >= 60) return "hsl(var(--brand-primary))";
    if (s >= 40) return "hsl(var(--color-warning))";
    return "hsl(var(--color-error))";
  };

  const getGrade = (s: number) => {
    if (s >= 90) return "Excellent";
    if (s >= 75) return "Great";
    if (s >= 60) return "Good";
    if (s >= 40) return "Fair";
    return "Needs Work";
  };

  const color = getColor(animatedScore);
  const grade = getGrade(animatedScore);

  // Generate tick marks
  const ticks = Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const isMajor = i % 10 === 0;
    const innerR = radius - (isMajor ? 8 : 4);
    const outerR = radius + 2;
    return {
      x1: center + innerR * Math.cos(rad),
      y1: center + innerR * Math.sin(rad),
      x2: center + outerR * Math.cos(rad),
      y2: center + outerR * Math.sin(rad),
      isMajor,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPresets.smooth}
      className={cn("flex flex-col items-center", className)}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--brand-primary))" />
              <stop offset="50%" stopColor="hsl(var(--color-success))" />
              <stop offset="100%" stopColor="hsl(var(--brand-secondary))" />
            </linearGradient>
            <filter id="gaugeShadow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.3}
          />

          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={tick.isMajor ? 1.5 : 0.5}
              opacity={tick.isMajor ? 0.3 : 0.15}
              className="transform rotate-90"
              style={{ transformOrigin: `${center}px ${center}px` }}
            />
          ))}

          {/* Progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            filter="url(#gaugeShadow)"
          />

          {/* End dot */}
          {animatedScore > 0 && (
            <motion.circle
              cx={
                center +
                radius *
                  Math.cos(
                    ((animatedScore / 100) * 360 - 90) * (Math.PI / 180)
                  )
              }
              cy={
                center +
                radius *
                  Math.sin(
                    ((animatedScore / 100) * 360 - 90) * (Math.PI / 180)
                  )
              }
              r={strokeWidth / 2 + 2}
              fill={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.8, type: "spring", stiffness: 300 }}
              filter="url(#gaugeShadow)"
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="text-4xl font-bold tabular-nums"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, ...springPresets.bouncy }}
          >
            {animatedScore}
          </motion.div>
          <motion.div
            className="text-xs font-medium text-[hsl(var(--muted-foreground))] mt-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {grade}
          </motion.div>
        </div>
      </div>

      {/* Label */}
      <motion.div
        className="text-center mt-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ...springPresets.smooth }}
      >
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</p>
        {sublabel && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{sublabel}</p>
        )}
      </motion.div>
    </motion.div>
  );
}
