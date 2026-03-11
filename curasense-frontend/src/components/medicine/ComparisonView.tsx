"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { CompareResponse, Medicine, MedicineDetail } from "@/lib/medicine-types";
import { flattenMedicine } from "@/lib/medicine-types";
import MedicineCard from "./MedicineCard";
import {
  GitCompare,
  ArrowLeftRight,
  ShieldCheck,
  FlaskConical,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { springPresets } from "@/styles/tokens/animations";

// ─── Comparison Row Helpers ──────────────────────────────────────────────────

function ComparisonRow({
  label,
  icon,
  val1,
  val2,
}: {
  label: string;
  icon?: React.ReactNode;
  val1?: string | null;
  val2?: string | null;
}) {
  if (!val1 && !val2) return null;
  return (
    <div className="py-3.5 border-b border-[hsl(var(--border)/0.5)] last:border-0">
      {/* Mobile: stacked layout */}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <p className="text-sm text-[hsl(var(--foreground)/0.8)] leading-relaxed">
            {val1 ?? "\u2014"}
          </p>
          <p className="text-sm text-[hsl(var(--foreground)/0.8)] leading-relaxed text-right">
            {val2 ?? "\u2014"}
          </p>
        </div>
      </div>
      {/* Desktop: 3-column layout */}
      <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
        <p className="text-sm text-[hsl(var(--foreground)/0.8)] leading-relaxed">
          {val1 ?? "\u2014"}
        </p>
        <div className="flex flex-col items-center justify-start pt-0.5 gap-1.5">
          {icon}
          <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider whitespace-nowrap">
            {label}
          </span>
        </div>
        <p className="text-sm text-[hsl(var(--foreground)/0.8)] leading-relaxed text-right">
          {val2 ?? "\u2014"}
        </p>
      </div>
    </div>
  );
}

function ListRow({
  label,
  icon,
  items1,
  items2,
}: {
  label: string;
  icon?: React.ReactNode;
  items1?: string[];
  items2?: string[];
}) {
  if (!items1?.length && !items2?.length) return null;
  return (
    <div className="py-3.5 border-b border-[hsl(var(--border)/0.5)] last:border-0">
      {/* Mobile: stacked layout */}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-wrap gap-1">
            {items1?.length
              ? items1.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[hsl(var(--muted))] text-[hsl(var(--foreground)/0.7)] px-2 py-0.5 rounded-full"
                  >
                    {item}
                  </span>
                ))
              : <span className="text-sm text-[hsl(var(--muted-foreground))]">{"\u2014"}</span>}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {items2?.length
              ? items2.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[hsl(var(--muted))] text-[hsl(var(--foreground)/0.7)] px-2 py-0.5 rounded-full"
                  >
                    {item}
                  </span>
                ))
              : <span className="text-sm text-[hsl(var(--muted-foreground))]">{"\u2014"}</span>}
          </div>
        </div>
      </div>
      {/* Desktop: 3-column layout */}
      <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
        <div className="flex flex-wrap gap-1">
          {items1?.length
            ? items1.map((item, i) => (
                <span
                  key={i}
                  className="text-xs bg-[hsl(var(--muted))] text-[hsl(var(--foreground)/0.7)] px-2 py-0.5 rounded-full"
                >
                  {item}
                </span>
              ))
            : <span className="text-sm text-[hsl(var(--muted-foreground))]">{"\u2014"}</span>}
        </div>
        <div className="flex flex-col items-center justify-start pt-0.5 gap-1.5">
          {icon}
          <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider whitespace-nowrap">
            {label}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {items2?.length
            ? items2.map((item, i) => (
                <span
                  key={i}
                  className="text-xs bg-[hsl(var(--muted))] text-[hsl(var(--foreground)/0.7)] px-2 py-0.5 rounded-full"
                >
                  {item}
                </span>
              ))
            : <span className="text-sm text-[hsl(var(--muted-foreground))]">{"\u2014"}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface ComparisonViewProps {
  result: CompareResponse;
  className?: string;
}

export default function ComparisonView({
  result,
  className,
}: ComparisonViewProps) {
  const flat1: Medicine = flattenMedicine(result.medicine_1 as MedicineDetail);
  const flat2: Medicine = flattenMedicine(result.medicine_2 as MedicineDetail);
  const summary = result.comparison_summary;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={springPresets.smooth}
      className={cn("space-y-6", className)}
    >
      {/* ─── Side-by-Side Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <MedicineCard medicine={flat1} variant="compact" index={0} />
        <MedicineCard medicine={flat2} variant="compact" index={1} />
      </div>

      {/* ─── Detailed Comparison Table ───────────────────────────── */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, ...springPresets.smooth }}
          className={cn(
            "rounded-2xl border overflow-hidden",
            "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
            "shadow-sm"
          )}
        >
          {/* Table header */}
          <div className="px-5 py-3.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--color-error)/0.1)]">
              <GitCompare size={14} className="text-[hsl(var(--color-error))]" />
            </div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Detailed Comparison
            </h3>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-2 sm:grid-cols-[1fr_auto_1fr] gap-3 px-5 py-3 bg-[hsl(var(--muted)/0.15)] border-b border-[hsl(var(--border)/0.5)]">
            <p className="text-xs font-bold text-[hsl(var(--brand-primary))]">
              {flat1.name}
            </p>
            <div className="hidden sm:block w-20" />
            <p className="text-xs font-bold text-[hsl(var(--brand-secondary))] text-right">
              {flat2.name}
            </p>
          </div>

          {/* Comparison rows */}
          <div className="px-5">
            <ListRow
              label="Unique"
              icon={<FlaskConical size={11} className="text-[hsl(var(--muted-foreground))]" />}
              items1={summary.unique_to_med1}
              items2={summary.unique_to_med2}
            />
            <ListRow
              label="Common"
              icon={<ArrowLeftRight size={11} className="text-[hsl(var(--muted-foreground))]" />}
              items1={summary.common_ingredients}
              items2={summary.common_ingredients}
            />
            <ListRow
              label="Uses"
              icon={<Activity size={11} className="text-[hsl(var(--muted-foreground))]" />}
              items1={summary.common_uses}
              items2={summary.common_uses}
            />
            <ComparisonRow
              label="Warnings"
              icon={<AlertTriangle size={11} className="text-[hsl(var(--muted-foreground))]" />}
              val1={
                summary.more_warnings === flat1.name
                  ? "More warnings"
                  : "Fewer warnings"
              }
              val2={
                summary.more_warnings === flat2.name
                  ? "More warnings"
                  : "Fewer warnings"
              }
            />
            <ComparisonRow
              label="Side Effects"
              icon={<AlertTriangle size={11} className="text-[hsl(var(--muted-foreground))]" />}
              val1={
                summary.higher_side_effect_count === flat1.name
                  ? "More side effects"
                  : summary.higher_side_effect_count === "Equal"
                    ? "Equal"
                    : "Fewer side effects"
              }
              val2={
                summary.higher_side_effect_count === flat2.name
                  ? "More side effects"
                  : summary.higher_side_effect_count === "Equal"
                    ? "Equal"
                    : "Fewer side effects"
              }
            />
          </div>

          {/* Safer option footer */}
          {summary.safer_option && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="px-5 py-3.5 border-t border-[hsl(var(--border))] bg-[hsl(var(--color-success)/0.06)]"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={15}
                  className="text-[hsl(var(--color-success))]"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--color-success))]">
                  Safer option:
                </span>
                <span className="text-sm font-bold text-[hsl(var(--color-success))]">
                  {summary.safer_option}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function ComparisonViewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 animate-pulse", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl border overflow-hidden bg-[hsl(var(--card))] border-[hsl(var(--border))]"
          >
            <div className="h-[88px] bg-gradient-to-r from-[hsl(var(--color-medicine)/0.3)] to-[hsl(var(--brand-primary)/0.3)]" />
            <div className="p-5 space-y-3">
              <div className="h-3 bg-[hsl(var(--muted))] rounded w-3/4" />
              <div className="h-3 bg-[hsl(var(--muted))] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border overflow-hidden bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <div className="h-12 bg-[hsl(var(--muted)/0.3)]" />
        <div className="p-5 space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-[hsl(var(--muted))] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
