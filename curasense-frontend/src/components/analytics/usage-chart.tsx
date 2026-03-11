"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { springPresets } from "@/styles/tokens/animations";
import { TrendingUp } from "lucide-react";

interface UsageChartProps {
  data: Array<{ date: string; count: number }>;
  className?: string;
}

// Custom tooltip component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: Record<string, any>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.95)] backdrop-blur-md p-3 shadow-xl">
      <p className="text-xs font-medium text-[hsl(var(--foreground))] mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[hsl(168,82%,42%)]" />
        <span className="text-sm font-bold text-[hsl(var(--foreground))]">
          {payload[0].value}
        </span>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">reports</span>
      </div>
    </div>
  );
}

export function UsageChart({ data, className }: UsageChartProps) {
  const safeData = useMemo(
    () => (data && Array.isArray(data) ? data : []),
    [data],
  );

  const formattedData = useMemo(() => {
    return safeData.map((item) => ({
      ...item,
      displayDate: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [safeData]);

  const total = useMemo(() => {
    return safeData.reduce((sum, item) => sum + item.count, 0);
  }, [safeData]);

  const maxCount = useMemo(() => Math.max(...safeData.map((d) => d.count), 1), [safeData]);

  if (safeData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.smooth}
        className={className}
      >
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Usage Over Time
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-[hsl(var(--muted-foreground))]">
              No usage data available yet
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
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[hsl(var(--brand-primary)/0.03)] to-transparent rounded-full -mr-16 -mt-16" />

        <div className="flex items-center justify-between mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary)/0.15)] to-[hsl(var(--brand-primary)/0.05)]">
              <TrendingUp className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Usage Over Time
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Reports analyzed in the selected period
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums text-[hsl(var(--foreground))]">
              {total}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Total Reports
            </p>
          </div>
        </div>

        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="usageAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(168, 82%, 42%)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="50%"
                    stopColor="hsl(168, 82%, 42%)"
                    stopOpacity={0.08}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(168, 82%, 42%)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="usageStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(168, 82%, 42%)" />
                  <stop offset="100%" stopColor="hsl(var(--brand-secondary))" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey="displayDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                allowDecimals={false}
                domain={[0, maxCount + 1]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="url(#usageStrokeGrad)"
                strokeWidth={2.5}
                fill="url(#usageAreaGrad)"
                animationDuration={1200}
                animationEasing="ease-out"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "hsl(168, 82%, 42%)",
                  stroke: "hsl(var(--card))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
