"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Trash2, Database, Sparkles, Plus } from "lucide-react";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { AnalyticsHeader } from "@/components/analytics/analytics-header";
import { Button } from "@/components/ui/button";
import {
  useFilteredAnalytics,
  type TimeRange,
} from "@/lib/use-filtered-analytics";
import { useDemoDataGenerator } from "@/lib/use-analytics-tracking";
import { useAppStore } from "@/lib/store";
import { springPresets } from "@/styles/tokens/animations";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Main Analytics Page                                                */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  /* ---- state ---- */
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [isGenerating, setIsGenerating] = useState(false);
  const lastUpdatedRef = useRef(new Date());
  const [lastUpdated, setLastUpdated] = useState(new Date());

  /* ---- hooks ---- */
  const { generateDemoData, clearAllData } = useDemoDataGenerator();
  const reports = useAppStore((s) => s.reports);
  const analytics = useFilteredAnalytics(timeRange);

  /* ---- handlers ---- */
  const handleGenerateDemo = useCallback(
    async (count = 25) => {
      setIsGenerating(true);
      try {
        generateDemoData(count);
        toast.success(`Generated ${count} demo reports`);
        lastUpdatedRef.current = new Date();
        setLastUpdated(new Date());
      } catch {
        toast.error("Failed to generate demo data");
      } finally {
        setTimeout(() => setIsGenerating(false), 500);
      }
    },
    [generateDemoData],
  );

  const handleClearData = useCallback(() => {
    clearAllData();
    toast.success("All analytics data cleared");
    lastUpdatedRef.current = new Date();
    setLastUpdated(new Date());
  }, [clearAllData]);

  const handleRefresh = useCallback(() => {
    lastUpdatedRef.current = new Date();
    setLastUpdated(new Date());
    toast.success("Dashboard refreshed");
  }, []);

  const handleExport = useCallback(() => {
    /* Build a simple JSON export of the analytics snapshot */
    const blob = new Blob([JSON.stringify(analytics, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `curasense-analytics-${timeRange}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics exported");
  }, [analytics, timeRange]);

  /* ---- empty state ---- */
  const isEmpty = reports.length === 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
        {/* ---- Header (always visible) ---- */}
        <AnalyticsHeader
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onRefresh={handleRefresh}
          onExport={isEmpty ? undefined : handleExport}
          isRefreshing={isGenerating}
          lastUpdated={lastUpdated}
        />

        {/* ---- Empty State ---- */}
        <AnimatePresence mode="wait">
          {isEmpty && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={springPresets.smooth}
              className="relative overflow-hidden rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)] backdrop-blur-sm p-10 text-center"
            >
              {/* Decorative shapes */}
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[hsl(var(--brand-primary)/0.06)] blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-[hsl(var(--brand-secondary)/0.06)] blur-3xl" />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...springPresets.bouncy, delay: 0.15 }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--brand-primary)/0.15)] to-[hsl(var(--brand-secondary)/0.15)]"
              >
                <Database className="h-7 w-7 text-[hsl(var(--brand-primary))]" />
              </motion.div>

              <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
                No Analytics Data Yet
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mx-auto mb-6">
                Generate demo data to explore all the interactive charts,
                gauges, and real-time activity monitoring in this dashboard.
              </p>

              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={() => handleGenerateDemo(25)}
                  disabled={isGenerating}
                  size="lg"
                  className="gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Sparkles
                    className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                  />
                  Generate 25 Reports
                </Button>
                <Button
                  onClick={() => handleGenerateDemo(50)}
                  disabled={isGenerating}
                  variant="outline"
                  size="lg"
                  className="gap-2 rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                  Generate 50
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Data controls bar (compact, when data exists) ---- */}
        <AnimatePresence>
          {!isEmpty && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springPresets.smooth}
              className="flex items-center justify-end gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateDemo(10)}
                disabled={isGenerating}
                className="gap-1.5 rounded-lg text-xs"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isGenerating ? "animate-spin" : ""}`}
                />
                Add Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearData}
                className="gap-1.5 rounded-lg text-xs text-[hsl(var(--color-error))] hover:text-[hsl(var(--color-error))] hover:bg-[hsl(var(--color-error)/0.08)]"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Dashboard ---- */}
        {!isEmpty && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.smooth, delay: 0.1 }}
          >
            <AnalyticsDashboard analytics={analytics} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
