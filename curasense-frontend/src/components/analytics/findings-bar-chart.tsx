"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { springPresets, staggerConfig } from "@/styles/tokens/animations";
// import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface FindingsBarChartProps {
  data: Record<string, number>;
  maxItems?: number;
  className?: string;
}

// Color palette for finding bars - gradient from teal to purple
const BAR_COLORS = [
  { bar: "hsl(168, 82%, 42%)", bg: "hsl(168, 82%, 42%)" },
  { bar: "hsl(174, 80%, 40%)", bg: "hsl(174, 80%, 40%)" },
  { bar: "hsl(186, 78%, 42%)", bg: "hsl(186, 78%, 42%)" },
  { bar: "hsl(198, 76%, 46%)", bg: "hsl(198, 76%, 46%)" },
  { bar: "hsl(210, 80%, 50%)", bg: "hsl(210, 80%, 50%)" },
  { bar: "hsl(224, 76%, 54%)", bg: "hsl(224, 76%, 54%)" },
  { bar: "hsl(238, 70%, 56%)", bg: "hsl(238, 70%, 56%)" },
  { bar: "hsl(250, 76%, 58%)", bg: "hsl(250, 76%, 58%)" },
  { bar: "hsl(256, 80%, 60%)", bg: "hsl(256, 80%, 60%)" },
  { bar: "hsl(262, 83%, 62%)", bg: "hsl(262, 83%, 62%)" },
];

export function FindingsBarChart({
  data,
  maxItems = 10,
  className,
}: FindingsBarChartProps) {
  const chartData = useMemo(() => {
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxItems)
      .map(([finding, count]) => ({
        finding,
        displayName:
          finding.length > 28 ? finding.slice(0, 25) + "..." : finding,
        count,
      }));
  }, [data, maxItems]);

  const maxCount = useMemo(() => {
    return chartData.length > 0
      ? Math.max(...chartData.map((d) => d.count))
      : 1;
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.smooth}
        className={className}
      >
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
            Most Common Findings
          </h3>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              No findings data available yet
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.smooth}
      className={className}
    >
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 relative overflow-hidden">
        {/* Decorative shape */}
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-gradient-to-tl from-[hsl(var(--brand-secondary)/0.04)] to-transparent rounded-full" />

        <div className="flex items-center gap-3 mb-6 relative">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary)/0.15)] to-[hsl(var(--brand-secondary)/0.1)]">
            <Activity className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              Most Common Findings
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Top {chartData.length} frequently identified conditions
            </p>
          </div>
        </div>

        <motion.div
          className="space-y-3 relative"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: staggerConfig.fast },
          }}
        >
          {chartData.map((item, index) => {
            const percentage = (item.count / maxCount) * 100;
            const color = BAR_COLORS[index % BAR_COLORS.length];

            return (
              <motion.div
                key={item.finding}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="group"
              >
                <div className="flex items-center gap-3">
                  {/* Rank number */}
                  <span className="w-5 text-xs tabular-nums font-medium text-[hsl(var(--muted-foreground))] text-right">
                    {index + 1}
                  </span>

                  {/* Bar container */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-sm text-[hsl(var(--foreground))] truncate"
                        title={item.finding}
                      >
                        {item.displayName}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-[hsl(var(--foreground))] ml-3 flex-shrink-0">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 bg-[hsl(var(--muted)/0.3)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full relative"
                        style={{ backgroundColor: color.bar }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: 0.8,
                          delay: 0.2 + index * 0.06,
                          ease: "easeOut",
                        }}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_ease-in-out] transition-opacity duration-300" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
