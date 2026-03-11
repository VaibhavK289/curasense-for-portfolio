"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  RefreshCw,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type TimeRange } from "@/lib/use-filtered-analytics";
import { springPresets } from "@/styles/tokens/animations";

interface AnalyticsHeaderProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  isRefreshing?: boolean;
  lastUpdated: Date;
}

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "all", label: "All" },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="tabular-nums text-xs text-[hsl(var(--muted-foreground))]">
      {time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
  );
}

export function AnalyticsHeader({
  timeRange,
  onTimeRangeChange,
  onRefresh,
  onExport,
  isRefreshing = false,
  lastUpdated,
}: AnalyticsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.smooth}
      className="relative mb-8 overflow-hidden"
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[hsl(var(--brand-primary)/0.06)] blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[hsl(var(--brand-secondary)/0.05)] blur-3xl" />
        {/* Subtle grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" aria-hidden="true">
          <defs>
            <pattern id="analytics-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#analytics-grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Top Row: Title + Live Status */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            {/* Animated Icon */}
            <motion.div
              className="relative p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--brand-primary)/0.15)] to-[hsl(var(--brand-secondary)/0.1)] border border-[hsl(var(--brand-primary)/0.2)]"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={springPresets.snappy}
            >
              <BarChart3 className="h-7 w-7 text-[hsl(var(--brand-primary))]" />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-[hsl(var(--brand-primary)/0.1)] blur-xl opacity-60" />
            </motion.div>

            <div>
              {/* Gradient title */}
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[hsl(var(--foreground))] via-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Real-time insights into your diagnostic workflow
              </p>
            </div>
          </div>

          {/* Live Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--color-success)/0.08)] border border-[hsl(var(--color-success)/0.2)]">
              <motion.div
                className="w-2 h-2 rounded-full bg-[hsl(var(--color-success))]"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <Wifi className="h-3 w-3 text-[hsl(var(--color-success))]" />
              <span className="text-xs font-medium text-[hsl(var(--color-success))]">Live</span>
            </div>
            <LiveClock />
          </div>
          <span className="text-[10px] text-[hsl(var(--muted-foreground)/0.6)] hidden sm:inline">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        </div>

        {/* Bottom Row: Time Range + Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Time Range Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border)/0.5)]">
            {TIME_RANGE_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => onTimeRangeChange(option.value)}
                className={cn(
                  "relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200",
                  timeRange === option.value
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                )}
                whileTap={{ scale: 0.96 }}
              >
                {timeRange === option.value && (
                  <motion.div
                    layoutId="time-range-pill"
                    className="absolute inset-0 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{option.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] border border-transparent hover:border-[hsl(var(--border)/0.5)] transition-all duration-200"
              whileTap={{ scale: 0.96 }}
              aria-label="Refresh analytics"
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>

            <motion.button
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] border border-transparent hover:border-[hsl(var(--border)/0.5)] transition-all duration-200"
              whileTap={{ scale: 0.96 }}
              aria-label="Export analytics"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
