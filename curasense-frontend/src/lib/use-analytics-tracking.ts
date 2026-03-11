"use client";

import { useCallback } from "react";
import { useAppStore, Report } from "@/lib/store";

// Common medical findings for demo data
const SAMPLE_FINDINGS = [
  "Hypertension",
  "Type 2 Diabetes",
  "Hyperlipidemia",
  "Upper Respiratory Infection",
  "Vitamin D Deficiency",
  "Iron Deficiency Anemia",
  "Thyroid Dysfunction",
  "Gastritis",
  "Allergic Rhinitis",
  "Migraine",
  "Lower Back Pain",
  "Anxiety Disorder",
  "Insomnia",
  "GERD",
  "Osteoarthritis",
];

// Generate random confidence score (weighted towards higher confidence)
function randomConfidence(): number {
  const rand = Math.random();
  if (rand > 0.3) return 0.75 + Math.random() * 0.25; // 70% chance of high
  if (rand > 0.1) return 0.5 + Math.random() * 0.25;  // 20% chance of medium
  return 0.3 + Math.random() * 0.2;                    // 10% chance of low
}

// Generate random processing time (500ms - 5000ms)
function randomProcessingTime(): number {
  return 500 + Math.random() * 4500;
}

// Pick random findings (1-4)
function randomFindings(): string[] {
  const count = 1 + Math.floor(Math.random() * 4);
  const shuffled = [...SAMPLE_FINDINGS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Hook to track analytics when creating reports
 * Wraps addReport to automatically add analytics metadata
 */
export function useAnalyticsTracking() {
  const addReport = useAppStore((state) => state.addReport);

  const addReportWithAnalytics = useCallback(
    (
      report: Omit<Report, "id" | "createdAt">,
      options?: {
        processingTimeMs?: number;
        findings?: string[];
        confidenceScore?: number;
      }
    ) => {
      addReport({
        ...report,
        processingTimeMs: options?.processingTimeMs ?? randomProcessingTime(),
        findings: options?.findings ?? (report.status === "completed" ? randomFindings() : undefined),
        confidenceScore: options?.confidenceScore ?? (report.status === "completed" ? randomConfidence() : undefined),
      });
    },
    [addReport]
  );

  return { addReportWithAnalytics };
}

/**
 * Generate demo data for testing the analytics dashboard
 */
export function useDemoDataGenerator() {
  const addReport = useAppStore((state) => state.addReport);

  const generateDemoData = useCallback(
    (count: number = 30) => {
      const types: Array<"prescription" | "xray" | "text" | "medicine"> = [
        "prescription",
        "xray",
        "text",
        "medicine",
      ];
      const statuses: Array<"pending" | "completed" | "error"> = [
        "completed",
        "completed",
        "completed",
        "completed",
        "completed", // 80% completed
        "pending",
        "error",
      ];

      const now = new Date();

      for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        const reportData = {
          type,
          title: `Demo ${type.charAt(0).toUpperCase() + type.slice(1)} Report #${i + 1}`,
          summary: `This is a demo ${type} report for testing analytics.`,
          content: `## Demo Report\n\nThis report was generated for analytics testing purposes.`,
          status,
          processingTimeMs: status === "completed" ? randomProcessingTime() : undefined,
          findings: status === "completed" ? randomFindings() : undefined,
          confidenceScore: status === "completed" ? randomConfidence() : undefined,
        };

        // We need to manually set createdAt, so we'll use a workaround
        // The store's addReport will set createdAt to now, but we override after
        setTimeout(() => {
          const state = useAppStore.getState();
          const reports = state.reports;
          if (reports.length > 0) {
            const updatedReports = reports.map((r, idx) => {
              if (idx === 0 && r.title === reportData.title) {
                return { ...r, createdAt };
              }
              return r;
            });
            useAppStore.setState({ reports: updatedReports });
          }
        }, 10 * i);

        addReport(reportData as Omit<Report, "id" | "createdAt">);
      }
    },
    [addReport]
  );

  const clearAllData = useCallback(() => {
    useAppStore.getState().clearReports();
  }, []);

  return { generateDemoData, clearAllData };
}
