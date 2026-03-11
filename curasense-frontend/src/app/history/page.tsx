"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ImageIcon,
  Pill,
  Calendar,
  Clock,
  Search,
  Trash2,
  Eye,
  SortAsc,
  SortDesc,
  FileX,
  ChevronRight,
  Download,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Archive,
  RefreshCw,
  X,
  ArrowLeft,
} from "lucide-react";
import { useAppStore, Report } from "@/lib/store";
import { ReportViewer } from "@/components/report-viewer";
import { cn } from "@/lib/utils";
import { springPresets } from "@/styles/tokens/animations";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types & Config                                                     */
/* ------------------------------------------------------------------ */

type SortOrder = "newest" | "oldest";
type FilterType = "all" | "prescription" | "xray" | "text" | "medicine";
type StatusFilter = "all" | "completed" | "pending" | "error";

const TYPE_CONFIG = {
  prescription: {
    icon: FileText,
    label: "Prescription",
    color: "hsl(var(--brand-primary))",
    bg: "bg-[hsl(var(--brand-primary)/0.1)]",
    border: "border-[hsl(var(--brand-primary)/0.2)]",
    gradient: "from-[hsl(var(--brand-primary)/0.15)] to-[hsl(var(--brand-primary)/0.05)]",
  },
  text: {
    icon: FileText,
    label: "Text Analysis",
    color: "hsl(var(--color-info))",
    bg: "bg-[hsl(var(--color-info)/0.1)]",
    border: "border-[hsl(var(--color-info)/0.2)]",
    gradient: "from-[hsl(var(--color-info)/0.15)] to-[hsl(var(--color-info)/0.05)]",
  },
  xray: {
    icon: ImageIcon,
    label: "X-Ray Analysis",
    color: "hsl(var(--brand-secondary))",
    bg: "bg-[hsl(var(--brand-secondary)/0.1)]",
    border: "border-[hsl(var(--brand-secondary)/0.2)]",
    gradient: "from-[hsl(var(--brand-secondary)/0.15)] to-[hsl(var(--brand-secondary)/0.05)]",
  },
  medicine: {
    icon: Pill,
    label: "Medicine Info",
    color: "hsl(var(--color-success))",
    bg: "bg-[hsl(var(--color-success)/0.1)]",
    border: "border-[hsl(var(--color-success)/0.2)]",
    gradient: "from-[hsl(var(--color-success)/0.15)] to-[hsl(var(--color-success)/0.05)]",
  },
} as const;

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, label: "Completed", color: "text-[hsl(var(--color-success))]", bg: "bg-[hsl(var(--color-success)/0.1)]" },
  pending: { icon: Loader2, label: "Pending", color: "text-[hsl(var(--color-warning))]", bg: "bg-[hsl(var(--color-warning)/0.1)]" },
  error: { icon: AlertCircle, label: "Failed", color: "text-[hsl(var(--color-error))]", bg: "bg-[hsl(var(--color-error)/0.1)]" },
} as const;

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "prescription", label: "Prescriptions" },
  { value: "xray", label: "X-Ray" },
  { value: "text", label: "Text" },
  { value: "medicine", label: "Medicine" },
];

/* ------------------------------------------------------------------ */
/*  Header Component                                                   */
/* ------------------------------------------------------------------ */

function HistoryHeader({ totalCount }: { totalCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.smooth}
      className="relative overflow-hidden"
    >
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[hsl(var(--brand-primary)/0.06)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[hsl(var(--brand-secondary)/0.06)] blur-3xl" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--brand-primary)/0.15)] to-[hsl(var(--brand-secondary)/0.15)]">
              <Archive className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] bg-clip-text text-transparent">
                  Report History
                </span>
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                View and manage your past diagnoses, analyses & lookups
              </p>
            </div>
          </div>

          {/* Total badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...springPresets.bouncy, delay: 0.2 }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm"
          >
            <BarChart3 className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{totalCount}</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">reports</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats Row                                                          */
/* ------------------------------------------------------------------ */

function StatsRow({ reports }: { reports: Report[] }) {
  const stats = useMemo(() => {
    const completed = reports.filter((r) => r.status === "completed");
    const avgTime = completed.filter((r) => r.processingTimeMs).reduce((sum, r) => sum + (r.processingTimeMs || 0), 0) / (completed.filter((r) => r.processingTimeMs).length || 1);
    const avgConf = completed.filter((r) => r.confidenceScore).reduce((sum, r) => sum + (r.confidenceScore || 0), 0) / (completed.filter((r) => r.confidenceScore).length || 1);

    return [
      {
        label: "Total",
        value: reports.length,
        suffix: "",
        icon: FileText,
        color: "brand-primary",
        gradient: "from-[hsl(var(--brand-primary)/0.12)] to-[hsl(var(--brand-primary)/0.04)]",
      },
      {
        label: "Completed",
        value: completed.length,
        suffix: "",
        icon: CheckCircle2,
        color: "color-success",
        gradient: "from-[hsl(var(--color-success)/0.12)] to-[hsl(var(--color-success)/0.04)]",
      },
      {
        label: "Avg. Time",
        value: avgTime > 0 ? (avgTime / 1000).toFixed(1) : "—",
        suffix: avgTime > 0 ? "s" : "",
        icon: Zap,
        color: "color-info",
        gradient: "from-[hsl(var(--color-info)/0.12)] to-[hsl(var(--color-info)/0.04)]",
      },
      {
        label: "Confidence",
        value: avgConf > 0 ? Math.round(avgConf * 100) : "—",
        suffix: avgConf > 0 ? "%" : "",
        icon: Shield,
        color: "brand-secondary",
        gradient: "from-[hsl(var(--brand-secondary)/0.12)] to-[hsl(var(--brand-secondary)/0.04)]",
      },
    ];
  }, [reports]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springPresets.smooth, delay: 0.1 + i * 0.05 }}
          className={cn(
            "relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-gradient-to-br p-4",
            stat.gradient,
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={cn("h-4 w-4", `text-[hsl(var(--${stat.color}))]`)} />
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{stat.label}</span>
          </div>
          <p className={cn("text-2xl font-bold", `text-[hsl(var(--${stat.color}))]`)}>
            {stat.value}<span className="text-sm font-normal">{stat.suffix}</span>
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter Bar                                                         */
/* ------------------------------------------------------------------ */

function FilterBar({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  statusFilter,
  onStatusChange,
  sortOrder,
  onSortToggle,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  filterType: FilterType;
  onFilterChange: (v: FilterType) => void;
  statusFilter: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  sortOrder: SortOrder;
  onSortToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springPresets.smooth, delay: 0.15 }}
      className="space-y-3"
    >
      {/* Search + Sort row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search reports by title, summary, or content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm",
              "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
              "text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary)/0.3)] focus:border-[hsl(var(--brand-primary)/0.3)]",
              "transition-all duration-200",
            )}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className={cn(
            "px-3 py-2.5 rounded-xl text-sm",
            "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
            "text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary)/0.3)]",
          )}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="error">Failed</option>
        </select>

        {/* Sort */}
        <motion.button
          onClick={onSortToggle}
          whileTap={{ scale: 0.96 }}
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm",
            "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
            "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors",
          )}
        >
          {sortOrder === "newest" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
          <span className="hidden sm:inline">{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
        </motion.button>
      </div>

      {/* Type tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border)/0.5)] w-fit">
        {FILTER_TABS.map((tab) => (
          <motion.button
            key={tab.value}
            onClick={() => onFilterChange(tab.value)}
            className={cn(
              "relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200",
              filterType === tab.value
                ? "text-[hsl(var(--foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
            )}
            whileTap={{ scale: 0.96 }}
          >
            {filterType === tab.value && (
              <motion.div
                layoutId="history-filter-pill"
                className="absolute inset-0 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Report Card                                                        */
/* ------------------------------------------------------------------ */

function ReportCard({
  report,
  onView,
  onDelete,
  index,
}: {
  report: Report;
  onView: () => void;
  onDelete: () => void;
  index: number;
}) {
  const config = TYPE_CONFIG[report.type] || TYPE_CONFIG.text;
  const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  const StatusIcon = statusCfg.icon;
  const rawDate = new Date(report.createdAt as string | number | Date);
  const date = isNaN(rawDate.getTime()) ? new Date(0) : rawDate;

  const confidencePercent = report.confidenceScore
    ? Math.round(report.confidenceScore * 100)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ ...springPresets.smooth, delay: index * 0.03 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-all duration-300",
        "bg-[hsl(var(--card))]",
        "border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary)/0.3)]",
        "hover:shadow-lg hover:shadow-[hsl(var(--brand-primary)/0.06)]",
      )}
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, ${config.color}, transparent)`,
          opacity: 0.5,
        }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br",
              config.gradient,
              config.border,
            )}
          >
            <Icon className="h-5 w-5" style={{ color: config.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[hsl(var(--foreground))] truncate text-[15px] leading-snug">
              {report.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium" style={{ color: config.color }}>
                {config.label}
              </span>
              <span className="text-[hsl(var(--border))]">·</span>
              <span className={cn("flex items-center gap-1 text-xs", statusCfg.color)}>
                <StatusIcon className="h-3 w-3" />
                {statusCfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3 leading-relaxed">
          {report.summary || "No summary available for this report."}
        </p>

        {/* Metrics row */}
        <div className="flex items-center gap-3 mb-3">
          {report.processingTimeMs && (
            <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.4)] px-2 py-1 rounded-md">
              <Zap className="h-3 w-3 text-[hsl(var(--color-info))]" />
              {(report.processingTimeMs / 1000).toFixed(1)}s
            </span>
          )}
          {confidencePercent !== null && (
            <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.4)] px-2 py-1 rounded-md">
              <Shield className="h-3 w-3 text-[hsl(var(--brand-secondary))]" />
              {confidencePercent}%
            </span>
          )}
          {report.findings && report.findings.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.4)] px-2 py-1 rounded-md">
              <Sparkles className="h-3 w-3 text-[hsl(var(--color-success))]" />
              {report.findings.length} findings
            </span>
          )}
        </div>

        {/* Date row */}
        <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))] mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
          </span>
        </div>

        {/* Confidence bar */}
        {confidencePercent !== null && (
          <div className="mb-4">
            <div className="h-1.5 w-full rounded-full bg-[hsl(var(--muted)/0.5)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidencePercent}%` }}
                transition={{ duration: 0.8, delay: index * 0.03 + 0.3, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  confidencePercent >= 80
                    ? "bg-[hsl(var(--color-success))]"
                    : confidencePercent >= 50
                      ? "bg-[hsl(var(--color-warning))]"
                      : "bg-[hsl(var(--color-error))]",
                )}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--border)/0.5)]">
          <motion.button
            onClick={onView}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium",
              "bg-[hsl(var(--brand-primary)/0.08)] text-[hsl(var(--brand-primary))]",
              "hover:bg-[hsl(var(--brand-primary)/0.15)] transition-colors",
            )}
          >
            <Eye className="h-4 w-4" />
            View Report
          </motion.button>
          <motion.button
            onClick={onDelete}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "p-2 rounded-lg",
              "bg-[hsl(var(--color-error)/0.06)] text-[hsl(var(--color-error))]",
              "hover:bg-[hsl(var(--color-error)/0.15)] transition-colors",
            )}
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={springPresets.smooth}
      className="relative overflow-hidden rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)] backdrop-blur-sm p-12 text-center"
    >
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[hsl(var(--brand-primary)/0.06)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-[hsl(var(--brand-secondary)/0.06)] blur-3xl" />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ ...springPresets.bouncy, delay: 0.15 }}
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--muted)/0.5)]"
      >
        <FileX className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
      </motion.div>

      <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
        {hasFilters ? "No Matching Reports" : "No Reports Yet"}
      </h3>
      <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mx-auto mb-6">
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Your diagnosis reports, X-ray analyses, and medicine lookups will appear here. Start by analyzing a prescription or X-ray image."}
      </p>

      {!hasFilters && (
        <div className="flex items-center justify-center gap-3">
          <a
            href="/diagnosis/prescription"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white font-medium text-sm shadow-lg hover:shadow-xl transition-shadow"
          >
            <FileText className="h-4 w-4" />
            Analyze Prescription
          </a>
          <a
            href="/diagnosis/xray"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-medium text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
          >
            <ImageIcon className="h-4 w-4" />
            Analyze X-Ray
          </a>
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function HistoryPage() {
  const router = useRouter();
  const { reports, removeReport, setCurrentReport } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [viewingReport, setViewingReport] = useState<Report | null>(null);

  const hasFilters = searchQuery.trim() !== "" || filterType !== "all" || statusFilter !== "all";

  const filteredReports = useMemo(() => {
    let result = [...reports];

    // Filter by type
    if (filterType !== "all") {
      result = result.filter((r) => r.type === filterType);
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.summary?.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q) ||
          r.findings?.some((f) => f.toLowerCase().includes(q)),
      );
    }

    // Sort
    result.sort((a, b) => {
      const dA = new Date(a.createdAt as string | number | Date);
      const dB = new Date(b.createdAt as string | number | Date);
      const dateA = isNaN(dA.getTime()) ? 0 : dA.getTime();
      const dateB = isNaN(dB.getTime()) ? 0 : dB.getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [reports, filterType, statusFilter, searchQuery, sortOrder]);

  const handleViewReport = useCallback(
    (report: Report) => {
      setViewingReport(report);
    },
    [],
  );

  const handleDeleteReport = useCallback(
    (id: string) => {
      removeReport(id);
      toast.success("Report deleted");
    },
    [removeReport],
  );

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `curasense-reports-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Reports exported");
  }, [reports]);

  const handleClearAll = useCallback(() => {
    if (confirm("Are you sure you want to delete all reports? This cannot be undone.")) {
      useAppStore.getState().clearReports();
      toast.success("All reports cleared");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
        {/* Header */}
        <HistoryHeader totalCount={reports.length} />

        {/* Stats Row (only when data exists) */}
        <AnimatePresence>
          {reports.length > 0 && <StatsRow reports={reports} />}
        </AnimatePresence>

        {/* Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onFilterChange={setFilterType}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortOrder={sortOrder}
          onSortToggle={() => setSortOrder((s) => (s === "newest" ? "oldest" : "newest"))}
        />

        {/* Actions bar */}
        <AnimatePresence>
          {reports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springPresets.smooth}
              className="flex items-center justify-between"
            >
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Showing <span className="font-medium text-[hsl(var(--foreground))]">{filteredReports.length}</span> of{" "}
                <span className="font-medium text-[hsl(var(--foreground))]">{reports.length}</span> reports
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleExport}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] border border-transparent hover:border-[hsl(var(--border)/0.5)] transition-all"
                >
                  <Download className="h-3 w-3" />
                  Export
                </motion.button>
                <motion.button
                  onClick={handleClearAll}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[hsl(var(--color-error))] hover:bg-[hsl(var(--color-error)/0.08)] border border-transparent hover:border-[hsl(var(--color-error)/0.2)] transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear All
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Grid */}
        {filteredReports.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report, i) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  index={i}
                  onView={() => handleViewReport(report)}
                  onDelete={() => handleDeleteReport(report.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Report Viewer Overlay ── */}
        <AnimatePresence>
          {viewingReport && (
            <motion.div
              key="report-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 sm:p-8"
              onClick={(e) => {
                if (e.target === e.currentTarget) setViewingReport(null);
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={springPresets.smooth}
                className="relative w-full max-w-4xl my-4"
              >
                {/* Floating header bar */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <motion.button
                    onClick={() => setViewingReport(null)}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors shadow-lg"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to History
                  </motion.button>

                  <div className="flex items-center gap-2">
                    {(() => {
                      const cfg = TYPE_CONFIG[viewingReport.type] || TYPE_CONFIG.text;
                      return (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm",
                            cfg.bg,
                            cfg.border,
                          )}
                          style={{ color: cfg.color }}
                        >
                          <cfg.icon className="h-3.5 w-3.5" />
                          {cfg.label}
                        </span>
                      );
                    })()}
                    <motion.button
                      onClick={() => setViewingReport(null)}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Report viewer card */}
                <ReportViewer
                  content={viewingReport.content}
                  title={viewingReport.title}
                  type={
                    viewingReport.type === "text"
                      ? "prescription"
                      : (viewingReport.type as "prescription" | "xray" | "medicine")
                  }
                  reportId={viewingReport.id}
                />

                {/* Report metadata footer */}
                <div className="mt-4 flex flex-wrap items-center gap-3 px-1">
                  {viewingReport.processingTimeMs && (
                    <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-3 py-1.5 rounded-lg shadow-sm">
                      <Zap className="h-3.5 w-3.5 text-[hsl(var(--color-info))]" />
                      Processed in {(viewingReport.processingTimeMs / 1000).toFixed(1)}s
                    </span>
                  )}
                  {viewingReport.confidenceScore && (
                    <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-3 py-1.5 rounded-lg shadow-sm">
                      <Shield className="h-3.5 w-3.5 text-[hsl(var(--brand-secondary))]" />
                      {Math.round(viewingReport.confidenceScore * 100)}% confidence
                    </span>
                  )}
                  {viewingReport.findings && viewingReport.findings.length > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-3 py-1.5 rounded-lg shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--color-success))]" />
                      {viewingReport.findings.length} findings
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-3 py-1.5 rounded-lg shadow-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {(() => {
                      const d = new Date(viewingReport.createdAt as string | number | Date);
                      return isNaN(d.getTime())
                        ? "Unknown date"
                        : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
                    })()}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
