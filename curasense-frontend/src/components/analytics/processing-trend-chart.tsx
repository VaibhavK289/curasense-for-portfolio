"use client";

import { useMemo } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";
import { springPresets } from "@/styles/tokens/animations";
import { Clock } from "lucide-react";

interface ProcessingTrendChartProps {
  data: Array<{ date: string; avgTime: number; count: number }>;
  className?: string;
}

export function ProcessingTrendChart({
  data,
  className,
}: ProcessingTrendChartProps) {
  const formattedData = useMemo(() => {
    return data
      .filter((d) => d.count > 0)
      .map((item) => ({
        ...item,
        avgTimeSeconds: item.avgTime / 1000,
        displayDate: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));
  }, [data]);

  const avgTime = useMemo(() => {
    const withData = formattedData.filter((d) => d.avgTimeSeconds > 0);
    if (withData.length === 0) return 0;
    return (
      withData.reduce((s, d) => s + d.avgTimeSeconds, 0) / withData.length
    );
  }, [formattedData]);

  if (formattedData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.smooth}
        className={className}
      >
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[hsl(var(--color-info)/0.1)]">
              <Clock className="h-5 w-5 text-[hsl(var(--color-info))]" />
            </div>
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              Processing Trend
            </h3>
          </div>
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              No processing data available yet
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
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--color-info)/0.1)]">
              <Clock className="h-5 w-5 text-[hsl(var(--color-info))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Processing Trend
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Average response time over period
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums text-[hsl(var(--foreground))]">
              {avgTime.toFixed(1)}s
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Avg. Time
            </p>
          </div>
        </div>

        <div className="h-[250px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={formattedData}
              margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="processingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(262, 83%, 62%)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(262, 83%, 62%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="displayDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={(v) => `${v.toFixed(1)}s`}
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                allowDecimals={false}
                hide
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "10px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number | undefined, name?: string) => {
                  if (value == null) return [``, name];
                  if (name === "avgTimeSeconds")
                    return [`${value.toFixed(2)}s`, "Avg. Time"];
                  return [`${value} reports`, "Volume"];
                }}
              />
              <Bar
                yAxisId="count"
                dataKey="count"
                fill="hsl(var(--brand-primary))"
                fillOpacity={0.1}
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
              <Area
                yAxisId="time"
                type="monotone"
                dataKey="avgTimeSeconds"
                fill="url(#processingGrad)"
                stroke="hsl(262, 83%, 62%)"
                strokeWidth={2}
                animationDuration={1000}
              />
              <Line
                yAxisId="time"
                type="monotone"
                dataKey="avgTimeSeconds"
                stroke="hsl(262, 83%, 62%)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(262, 83%, 62%)", stroke: "hsl(var(--card))", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "hsl(262, 83%, 62%)", stroke: "hsl(var(--card))", strokeWidth: 2 }}
                animationDuration={1200}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
