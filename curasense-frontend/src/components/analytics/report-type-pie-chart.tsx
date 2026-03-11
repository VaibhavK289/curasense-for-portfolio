"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { springPresets, staggerConfig } from "@/styles/tokens/animations";
// import { cn } from "@/lib/utils";

interface ReportTypePieChartProps {
  data: Record<string, number>;
  className?: string;
}

const TYPE_CONFIG = {
  prescription: {
    label: "Prescriptions",
    color: "hsl(201, 96%, 32%)",
    lightColor: "hsl(201, 96%, 32%)",
  },
  xray: {
    label: "X-Ray / CT Scans",
    color: "hsl(262, 83%, 58%)",
    lightColor: "hsl(262, 83%, 58%)",
  },
  text: {
    label: "Text Analysis",
    color: "hsl(168, 82%, 42%)",
    lightColor: "hsl(168, 82%, 42%)",
  },
  medicine: {
    label: "Medicine Comparison",
    color: "hsl(142, 76%, 36%)",
    lightColor: "hsl(142, 76%, 36%)",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: Record<string, any>) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.95)] backdrop-blur-md p-3 shadow-xl">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: entry.payload.fill }}
        />
        <span className="text-sm font-medium text-[hsl(var(--foreground))]">
          {entry.name}
        </span>
      </div>
      <p className="text-lg font-bold text-[hsl(var(--foreground))] mt-1">
        {entry.value}{" "}
        <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">
          reports
        </span>
      </p>
    </div>
  );
}

export function ReportTypePieChart({
  data,
  className,
}: ReportTypePieChartProps) {
  const chartData = useMemo(() => {
    return Object.entries(data).map(([type, count]) => ({
      name:
        TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]?.label || type,
      value: count,
      type,
      fill:
        TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]?.color ||
        "hsl(var(--muted))",
    }));
  }, [data]);

  const total = useMemo(() => {
    return Object.values(data).reduce((sum, count) => sum + count, 0);
  }, [data]);

  if (total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.smooth}
        className={className}
      >
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
            Reports by Type
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-[hsl(var(--muted-foreground))]">
              No data available yet
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
        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
          Reports by Type
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative w-[180px] h-[180px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={200}
                  stroke="transparent"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.type} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.p
                className="text-3xl font-bold text-[hsl(var(--foreground))] tabular-nums"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, ...springPresets.bouncy }}
              >
                {total}
              </motion.p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-medium">
                Total
              </p>
            </div>
          </div>

          {/* Legend with percentage bars */}
          <motion.div
            className="flex-1 space-y-3 w-full"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: staggerConfig.normal },
            }}
          >
            {chartData
              .sort((a, b) => b.value - a.value)
              .map((entry) => {
                const percentage = ((entry.value / total) * 100).toFixed(1);
                return (
                  <motion.div
                    key={entry.type}
                    variants={{
                      hidden: { opacity: 0, x: 12 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-125"
                          style={{ backgroundColor: entry.fill }}
                        />
                        <span className="text-sm text-[hsl(var(--foreground))]">
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
                          {entry.value}
                        </span>
                        <span className="text-xs tabular-nums font-medium text-[hsl(var(--foreground))]">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[hsl(var(--muted)/0.4)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: entry.fill }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: 0.8,
                          delay: 0.6,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
