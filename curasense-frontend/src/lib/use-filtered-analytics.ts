"use client";

import { useMemo } from "react";
import { useAppStore, Report } from "@/lib/store";

export type TimeRange = "24h" | "7d" | "30d" | "90d" | "all";

const TIME_MS: Record<TimeRange, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "90d": 90 * 24 * 60 * 60 * 1000,
  all: Infinity,
};

export interface SparklinePoint {
  value: number;
  date: string;
}

export interface ActivityEvent {
  id: string;
  type: "report_completed" | "report_error" | "report_created";
  title: string;
  description: string;
  timestamp: Date;
  reportType?: string;
  confidenceScore?: number;
}

export interface EnhancedAnalytics {
  totalReportsAnalyzed: number;
  reportsByType: Record<string, number>;
  reportsByStatus: Record<string, number>;
  averageProcessingTime: number;
  findingsFrequency: Record<string, number>;
  dailyUsage: Array<{ date: string; count: number }>;
  accuracyMetrics: {
    averageConfidence: number;
    highConfidenceCount: number;
    mediumConfidenceCount: number;
    lowConfidenceCount: number;
  };
  lastUpdated: Date;
  sparklines: {
    reports: SparklinePoint[];
    processingTime: SparklinePoint[];
    confidence: SparklinePoint[];
    findings: SparklinePoint[];
  };
  recentActivity: ActivityEvent[];
  processingTimeTrend: Array<{ date: string; avgTime: number; count: number }>;
  healthScore: number;
  statusBreakdown: {
    completed: number;
    pending: number;
    error: number;
    total: number;
  };
}

function getEmptyAnalytics(): EnhancedAnalytics {
  return {
    totalReportsAnalyzed: 0,
    reportsByType: {},
    reportsByStatus: {},
    averageProcessingTime: 0,
    findingsFrequency: {},
    dailyUsage: [],
    accuracyMetrics: {
      averageConfidence: 0,
      highConfidenceCount: 0,
      mediumConfidenceCount: 0,
      lowConfidenceCount: 0,
    },
    lastUpdated: new Date(),
    sparklines: {
      reports: [],
      processingTime: [],
      confidence: [],
      findings: [],
    },
    recentActivity: [],
    processingTimeTrend: [],
    healthScore: 0,
    statusBreakdown: { completed: 0, pending: 0, error: 0, total: 0 },
  };
}

function generateDailyUsage(reports: Report[], days: number) {
  const buckets: Array<{ date: string; count: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    buckets.push({
      date: key,
      count: reports.filter(
        (r) => new Date(r.createdAt).toISOString().split("T")[0] === key
      ).length,
    });
  }
  return buckets;
}

function generateSparklines(reports: Report[], days: number) {
  const points = Math.min(days, 7);
  const bucketSize = Math.max(1, Math.ceil(days / points));

  const reportSparkline: SparklinePoint[] = [];
  const processingSparkline: SparklinePoint[] = [];
  const confidenceSparkline: SparklinePoint[] = [];
  const findingsSparkline: SparklinePoint[] = [];

  for (let i = points - 1; i >= 0; i--) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - i * bucketSize);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - bucketSize);
    const dateKey = endDate.toISOString().split("T")[0];

    const bucket = reports.filter((r) => {
      const d = new Date(r.createdAt);
      return d > startDate && d <= endDate;
    });

    const completed = bucket.filter((r) => r.status === "completed");
    const times = completed
      .filter((r) => r.processingTimeMs)
      .map((r) => r.processingTimeMs!);
    const scores = completed
      .filter((r) => r.confidenceScore)
      .map((r) => r.confidenceScore!);
    const findingCount = completed.reduce(
      (sum, r) => sum + (r.findings?.length || 0),
      0
    );

    reportSparkline.push({ date: dateKey, value: bucket.length });
    processingSparkline.push({
      date: dateKey,
      value:
        times.length > 0
          ? times.reduce((a, b) => a + b, 0) / times.length
          : 0,
    });
    confidenceSparkline.push({
      date: dateKey,
      value:
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0,
    });
    findingsSparkline.push({ date: dateKey, value: findingCount });
  }

  return {
    reports: reportSparkline,
    processingTime: processingSparkline,
    confidence: confidenceSparkline,
    findings: findingsSparkline,
  };
}

function generateActivityFeed(reports: Report[]): ActivityEvent[] {
  return reports
    .slice(0, 20)
    .map((r) => ({
      id: r.id,
      type: (r.status === "completed"
        ? "report_completed"
        : r.status === "error"
        ? "report_error"
        : "report_created") as ActivityEvent["type"],
      title: r.title,
      description: `${r.type.charAt(0).toUpperCase() + r.type.slice(1)} analysis ${r.status}`,
      timestamp: new Date(r.createdAt),
      reportType: r.type,
      confidenceScore: r.confidenceScore,
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function generateProcessingTrend(
  completed: Report[],
  days: number
): Array<{ date: string; avgTime: number; count: number }> {
  const trend: Array<{ date: string; avgTime: number; count: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    const dayReports = completed.filter(
      (r) =>
        new Date(r.createdAt).toISOString().split("T")[0] === key &&
        r.processingTimeMs
    );
    trend.push({
      date: key,
      avgTime:
        dayReports.length > 0
          ? dayReports.reduce((s, r) => s + (r.processingTimeMs || 0), 0) /
            dayReports.length
          : 0,
      count: dayReports.length,
    });
  }
  return trend;
}

function calculateHealthScore(
  avgConfidence: number,
  avgProcessingTime: number,
  completedCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;
  const confidenceScore = avgConfidence * 40;
  const completionRate = (completedCount / totalCount) * 30;
  const speedScore = Math.max(0, 30 - (avgProcessingTime / 5000) * 30);
  return Math.min(100, Math.round(confidenceScore + completionRate + speedScore));
}

export function useFilteredAnalytics(timeRange: TimeRange): EnhancedAnalytics {
  const reports = useAppStore((state) => state.reports);

  const analytics = useMemo<EnhancedAnalytics>(() => {
    if (!reports || reports.length === 0) return getEmptyAnalytics();

    const now = new Date();
    const cutoffMs = TIME_MS[timeRange];
    const cutoff =
      cutoffMs === Infinity ? null : new Date(now.getTime() - cutoffMs);

    const filtered = cutoff
      ? reports.filter((r) => new Date(r.createdAt) >= cutoff)
      : reports;

    const completed = filtered.filter((r) => r.status === "completed");

    const reportsByType: Record<string, number> = {};
    filtered.forEach((r) => {
      reportsByType[r.type] = (reportsByType[r.type] || 0) + 1;
    });

    const reportsByStatus: Record<string, number> = {};
    filtered.forEach((r) => {
      reportsByStatus[r.status] = (reportsByStatus[r.status] || 0) + 1;
    });

    const processingTimes = completed
      .filter((r) => r.processingTimeMs)
      .map((r) => r.processingTimeMs!);
    const averageProcessingTime =
      processingTimes.length > 0
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        : 0;

    const findingsFrequency: Record<string, number> = {};
    completed.forEach((r) => {
      r.findings?.forEach((finding) => {
        findingsFrequency[finding] = (findingsFrequency[finding] || 0) + 1;
      });
    });

    const days =
      timeRange === "24h"
        ? 1
        : timeRange === "7d"
        ? 7
        : timeRange === "90d"
        ? 90
        : 30;
    const dailyUsage = generateDailyUsage(filtered, days);

    const confidenceScores = completed
      .filter((r) => r.confidenceScore !== undefined)
      .map((r) => r.confidenceScore!);
    const averageConfidence =
      confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0;

    const sparklines = generateSparklines(filtered, days);
    const recentActivity = generateActivityFeed(filtered);
    const processingTimeTrend = generateProcessingTrend(completed, days);
    const healthScore = calculateHealthScore(
      averageConfidence,
      averageProcessingTime,
      completed.length,
      filtered.length
    );

    return {
      totalReportsAnalyzed: completed.length,
      reportsByType,
      reportsByStatus,
      averageProcessingTime,
      findingsFrequency,
      dailyUsage,
      accuracyMetrics: {
        averageConfidence,
        highConfidenceCount: confidenceScores.filter((s) => s >= 0.8).length,
        mediumConfidenceCount: confidenceScores.filter(
          (s) => s >= 0.5 && s < 0.8
        ).length,
        lowConfidenceCount: confidenceScores.filter((s) => s < 0.5).length,
      },
      lastUpdated: new Date(),
      sparklines,
      recentActivity,
      processingTimeTrend,
      healthScore,
      statusBreakdown: {
        completed: completed.length,
        pending: filtered.filter((r) => r.status === "pending").length,
        error: filtered.filter((r) => r.status === "error").length,
        total: filtered.length,
      },
    };
  }, [reports, timeRange]);

  return analytics;
}
