"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Activity,
  TrendingUp,
  Zap,
} from "lucide-react";
import { StatsCard } from "./stats-card";
import { UsageChart } from "./usage-chart";
import { ReportTypePieChart } from "./report-type-pie-chart";
import { FindingsBarChart } from "./findings-bar-chart";
import { AccuracyMetrics } from "./accuracy-metrics";
import { PerformanceGauge } from "./performance-gauge";
import { ActivityFeed } from "./activity-feed";
import { ProcessingTrendChart } from "./processing-trend-chart";
import { type EnhancedAnalytics } from "@/lib/use-filtered-analytics";
import { springPresets, staggerConfig } from "@/styles/tokens/animations";

interface AnalyticsDashboardProps {
  analytics: EnhancedAnalytics;
  className?: string;
}

export function AnalyticsDashboard({
  analytics,
  className,
}: AnalyticsDashboardProps) {
  // Calculate week-over-week trend
  const weekTrend = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = analytics.dailyUsage
      .filter((d) => {
        const date = new Date(d.date);
        return date >= oneWeekAgo && date <= now;
      })
      .reduce((sum, d) => sum + d.count, 0);

    const lastWeek = analytics.dailyUsage
      .filter((d) => {
        const date = new Date(d.date);
        return date >= twoWeeksAgo && date < oneWeekAgo;
      })
      .reduce((sum, d) => sum + d.count, 0);

    if (lastWeek === 0) return null;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  }, [analytics.dailyUsage]);

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className={className}>
      {/* ============================================ */}
      {/* ROW 1: Stats Cards + Performance Gauge       */}
      {/* ============================================ */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: staggerConfig.fast },
        }}
      >
        {/* Stats Cards - 4 cols each on lg, 2 cols on sm */}
        <div className="sm:col-span-1 lg:col-span-3">
          <StatsCard
            title="Total Reports"
            value={analytics.totalReportsAnalyzed}
            description="Completed analyses"
            icon={FileText}
            trend={
              weekTrend !== null
                ? { value: weekTrend, isPositive: weekTrend >= 0 }
                : undefined
            }
            color="brand"
            sparklineData={analytics.sparklines.reports.map((p) => p.value)}
            delay={0}
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-3">
          <StatsCard
            title="Avg. Processing"
            value={formatProcessingTime(analytics.averageProcessingTime)}
            description="Time per report"
            icon={Clock}
            color="info"
            sparklineData={analytics.sparklines.processingTime.map(
              (p) => p.value
            )}
            delay={1}
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-3">
          <StatsCard
            title="Unique Findings"
            value={Object.keys(analytics.findingsFrequency).length}
            description="Conditions identified"
            icon={Activity}
            color="success"
            sparklineData={analytics.sparklines.findings.map((p) => p.value)}
            delay={2}
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-3">
          <StatsCard
            title="AI Confidence"
            value={`${(analytics.accuracyMetrics.averageConfidence * 100).toFixed(0)}%`}
            description="Avg. confidence score"
            icon={
              analytics.accuracyMetrics.averageConfidence >= 0.7
                ? TrendingUp
                : Zap
            }
            color={
              analytics.accuracyMetrics.averageConfidence >= 0.7
                ? "success"
                : "warning"
            }
            sparklineData={analytics.sparklines.confidence.map(
              (p) => p.value * 100
            )}
            delay={3}
          />
        </div>
      </motion.div>

      {/* ============================================ */}
      {/* ROW 2: Performance Gauge + Usage Chart       */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Performance Gauge - compact on desktop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, ...springPresets.smooth }}
          className="lg:col-span-3"
        >
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 h-full flex items-center justify-center relative overflow-hidden">
            {/* Decorative ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[200px] h-[200px] rounded-full border border-[hsl(var(--border)/0.2)]" />
            </div>
            <PerformanceGauge
              score={analytics.healthScore}
              size={160}
              strokeWidth={10}
              label="System Health"
              sublabel={`${analytics.statusBreakdown.completed}/${analytics.statusBreakdown.total} completed`}
            />
          </div>
        </motion.div>

        {/* Usage Over Time - takes remaining space */}
        <div className="lg:col-span-9">
          <UsageChart data={analytics.dailyUsage} />
        </div>
      </div>

      {/* ============================================ */}
      {/* ROW 3: Donut Chart + Accuracy + Activity     */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <ReportTypePieChart data={analytics.reportsByType} />
        <AccuracyMetrics metrics={analytics.accuracyMetrics} />
        <ActivityFeed events={analytics.recentActivity} maxItems={6} />
      </div>

      {/* ============================================ */}
      {/* ROW 4: Processing Trend + Findings           */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProcessingTrendChart data={analytics.processingTimeTrend} />
        <FindingsBarChart
          data={analytics.findingsFrequency}
          maxItems={8}
        />
      </div>

      {/* ============================================ */}
      {/* Status Bar - Footer                          */}
      {/* ============================================ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4 px-2"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {["completed", "pending", "error"].map((status) => (
                <div
                  key={status}
                  className="flex items-center gap-1"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      status === "completed"
                        ? "bg-[hsl(var(--color-success))]"
                        : status === "pending"
                        ? "bg-[hsl(var(--color-warning))]"
                        : "bg-[hsl(var(--color-error))]"
                    }`}
                  />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] capitalize">
                    {status}:{" "}
                    {analytics.statusBreakdown[
                      status as keyof typeof analytics.statusBreakdown
                    ] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] tabular-nums">
          Last updated: {analytics.lastUpdated.toLocaleString()}
        </p>
      </motion.div>
    </div>
  );
}
