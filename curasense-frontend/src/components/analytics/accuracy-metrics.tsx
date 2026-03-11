"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { springPresets } from "@/styles/tokens/animations";

interface AccuracyMetricsProps {
  metrics: {
    averageConfidence: number;
    highConfidenceCount: number;
    mediumConfidenceCount: number;
    lowConfidenceCount: number;
  };
  className?: string;
}

export function AccuracyMetrics({ metrics, className }: AccuracyMetricsProps) {
  const totalWithConfidence =
    metrics.highConfidenceCount +
    metrics.mediumConfidenceCount +
    metrics.lowConfidenceCount;

  const highPercentage =
    totalWithConfidence > 0
      ? (metrics.highConfidenceCount / totalWithConfidence) * 100
      : 0;
  const mediumPercentage =
    totalWithConfidence > 0
      ? (metrics.mediumConfidenceCount / totalWithConfidence) * 100
      : 0;
  const lowPercentage =
    totalWithConfidence > 0
      ? (metrics.lowConfidenceCount / totalWithConfidence) * 100
      : 0;

  const confidenceLevel =
    metrics.averageConfidence >= 0.8
      ? { label: "Excellent", color: "text-[hsl(var(--color-success))]", barColor: "bg-[hsl(var(--color-success))]" }
      : metrics.averageConfidence >= 0.6
      ? { label: "Good", color: "text-[hsl(var(--brand-primary))]", barColor: "bg-[hsl(var(--brand-primary))]" }
      : metrics.averageConfidence >= 0.4
      ? { label: "Moderate", color: "text-[hsl(var(--color-warning))]", barColor: "bg-[hsl(var(--color-warning))]" }
      : { label: "Needs Review", color: "text-[hsl(var(--color-error))]", barColor: "bg-[hsl(var(--color-error))]" };

  const distributions = [
    {
      label: "High Confidence",
      sublabel: "\u226580%",
      count: metrics.highConfidenceCount,
      percentage: highPercentage,
      color: "hsl(var(--color-success))",
      bgColor: "bg-[hsl(var(--color-success))]",
      icon: CheckCircle2,
      iconColor: "text-[hsl(var(--color-success))]",
    },
    {
      label: "Medium",
      sublabel: "50\u201379%",
      count: metrics.mediumConfidenceCount,
      percentage: mediumPercentage,
      color: "hsl(var(--color-warning))",
      bgColor: "bg-[hsl(var(--color-warning))]",
      icon: TrendingUp,
      iconColor: "text-[hsl(var(--color-warning))]",
    },
    {
      label: "Low",
      sublabel: "<50%",
      count: metrics.lowConfidenceCount,
      percentage: lowPercentage,
      color: "hsl(var(--color-error))",
      bgColor: "bg-[hsl(var(--color-error))]",
      icon: AlertTriangle,
      iconColor: "text-[hsl(var(--color-error))]",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.smooth}
      className={className}
    >
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[hsl(var(--brand-primary)/0.04)] to-transparent rounded-full -ml-12 -mt-12" />

        <div className="flex items-center gap-3 mb-6 relative">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary)/0.15)] to-[hsl(var(--brand-primary)/0.05)]">
            <Shield className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              Accuracy Metrics
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              AI confidence scores distribution
            </p>
          </div>
        </div>

        {/* Average Confidence - Hero Metric */}
        <div className="mb-6 p-4 rounded-xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border)/0.5)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Average Confidence
            </span>
            <span className={cn("text-sm font-semibold", confidenceLevel.color)}>
              {confidenceLevel.label}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 bg-[hsl(var(--muted)/0.5)] rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", confidenceLevel.barColor)}
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.averageConfidence * 100}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
            </div>
            <motion.span
              className="text-2xl font-bold tabular-nums text-[hsl(var(--foreground))] min-w-[4rem] text-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {(metrics.averageConfidence * 100).toFixed(1)}%
            </motion.span>
          </div>

          {/* Segmented bar showing distribution */}
          {totalWithConfidence > 0 && (
            <div className="flex h-1.5 rounded-full overflow-hidden mt-3 gap-0.5">
              {highPercentage > 0 && (
                <motion.div
                  className="bg-[hsl(var(--color-success))] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${highPercentage}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              )}
              {mediumPercentage > 0 && (
                <motion.div
                  className="bg-[hsl(var(--color-warning))] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${mediumPercentage}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              )}
              {lowPercentage > 0 && (
                <motion.div
                  className="bg-[hsl(var(--color-error))] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${lowPercentage}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              )}
            </div>
          )}
        </div>

        {/* Distribution List */}
        <div className="space-y-4">
          {distributions.map((dist, index) => {
            const DistIcon = dist.icon;
            return (
              <motion.div
                key={dist.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, ...springPresets.snappy }}
                className="flex items-center gap-3 group"
              >
                <div className="p-1.5 rounded-lg bg-[hsl(var(--muted)/0.5)] group-hover:bg-[hsl(var(--muted)/0.8)] transition-colors duration-200">
                  <DistIcon className={cn("h-4 w-4", dist.iconColor)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-[hsl(var(--foreground))]">
                        {dist.label}
                      </span>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {dist.sublabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums text-[hsl(var(--foreground))]">
                        {dist.count}
                      </span>
                      {totalWithConfidence > 0 && (
                        <span className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
                          ({dist.percentage.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-[hsl(var(--muted)/0.3)] rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", dist.bgColor)}
                      initial={{ width: 0 }}
                      animate={{ width: `${dist.percentage}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.5 + index * 0.1,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {totalWithConfidence === 0 && (
          <p className="mt-4 text-xs text-[hsl(var(--muted-foreground))] text-center">
            Analyze some reports to see confidence metrics.
          </p>
        )}
      </div>
    </motion.div>
  );
}
