"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { InteractionResponse } from "@/lib/medicine-types";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { springPresets } from "@/styles/tokens/animations";

// ─── Risk Configuration ──────────────────────────────────────────────────────

const RISK_CONFIG = {
  Low: {
    icon: ShieldCheck,
    gradient: "from-[hsl(var(--color-success))] to-[hsl(152_70%_30%)]",
    bg: "bg-[hsl(var(--color-success)/0.06)]",
    border: "border-[hsl(var(--color-success)/0.2)]",
    text: "text-[hsl(var(--color-success))]",
    badge: "bg-[hsl(var(--color-success)/0.12)] text-[hsl(var(--color-success))] border-[hsl(var(--color-success)/0.2)]",
    bar: "bg-[hsl(var(--color-success))]",
    barWidth: "25%",
    label: "Low Risk",
    description: "These medicines are generally safe to use together.",
  },
  Moderate: {
    icon: ShieldAlert,
    gradient: "from-[hsl(var(--color-warning))] to-[hsl(38_80%_40%)]",
    bg: "bg-[hsl(var(--color-warning)/0.06)]",
    border: "border-[hsl(var(--color-warning)/0.2)]",
    text: "text-[hsl(var(--color-warning))]",
    badge: "bg-[hsl(var(--color-warning)/0.12)] text-[hsl(var(--color-warning))] border-[hsl(var(--color-warning)/0.2)]",
    bar: "bg-[hsl(var(--color-warning))]",
    barWidth: "55%",
    label: "Moderate Risk",
    description: "Use with caution. Consult a healthcare professional.",
  },
  High: {
    icon: ShieldX,
    gradient: "from-[hsl(var(--color-error))] to-[hsl(0_70%_35%)]",
    bg: "bg-[hsl(var(--color-error)/0.06)]",
    border: "border-[hsl(var(--color-error)/0.2)]",
    text: "text-[hsl(var(--color-error))]",
    badge: "bg-[hsl(var(--color-error)/0.12)] text-[hsl(var(--color-error))] border-[hsl(var(--color-error)/0.2)]",
    bar: "bg-[hsl(var(--color-error))]",
    barWidth: "100%",
    label: "High Risk",
    description: "Potentially dangerous combination. Seek medical advice immediately.",
  },
};

function getRisk(level: string) {
  const key = Object.keys(RISK_CONFIG).find((k) =>
    level?.toLowerCase().includes(k.toLowerCase())
  ) as keyof typeof RISK_CONFIG | undefined;
  return RISK_CONFIG[key ?? "Moderate"];
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface InteractionResultProps {
  result: InteractionResponse;
  className?: string;
}

export default function InteractionResult({
  result,
  className,
}: InteractionResultProps) {
  const risk = getRisk(result.risk_level);
  const RiskIcon = risk.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={springPresets.smooth}
      className={cn(
        "rounded-2xl border overflow-hidden",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        "shadow-sm",
        className
      )}
    >
      {/* ─── Risk Level Header ───────────────────────────────────── */}
      <div className={cn("relative px-6 py-5 overflow-hidden", risk.bg)}>
        {/* Subtle gradient overlay */}
        <div
          className={cn(
            "absolute inset-0 opacity-[0.04] bg-gradient-to-r",
            risk.gradient
          )}
        />

        <div className="relative z-10">
          {/* Risk badge + icon */}
          <div className="flex items-center justify-between mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-2.5"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  risk.bg,
                  "border",
                  risk.border
                )}
              >
                <RiskIcon size={20} className={risk.text} />
              </div>
              <div>
                <h3 className={cn("text-base font-bold", risk.text)}>
                  {risk.label}
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                  {risk.description}
                </p>
              </div>
            </motion.div>

            <span
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-full border",
                risk.badge
              )}
            >
              {result.risk_level}
            </span>
          </div>

          {/* Risk progress bar */}
          <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: risk.barWidth }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className={cn("h-full rounded-full", risk.bar)}
            />
          </div>
        </div>
      </div>

      {/* ─── Medicine Names ──────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] px-3.5 py-1.5 rounded-full">
            {result.medicine1}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-px w-4 bg-[hsl(var(--border))]" />
            <AlertTriangle size={14} className={risk.text} />
            <div className="h-px w-4 bg-[hsl(var(--border))]" />
          </div>
          <span className="text-sm font-semibold text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] px-3.5 py-1.5 rounded-full">
            {result.medicine2}
          </span>
        </div>
      </div>

      {/* ─── Explanation ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-6 py-5"
      >
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">
          Analysis
        </h4>
        <p className="text-sm text-[hsl(var(--foreground)/0.85)] leading-relaxed whitespace-pre-line">
          {result.explanation}
        </p>

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div className="mt-5 p-4 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border)/0.5)]">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-[hsl(var(--brand-primary))]" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Recommendations
              </h4>
            </div>
            <ul className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="text-sm text-[hsl(var(--foreground)/0.8)] flex items-start gap-2"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-primary))] shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function InteractionResultSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden animate-pulse",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        className
      )}
    >
      <div className="px-6 py-5 bg-[hsl(var(--muted)/0.3)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-[hsl(var(--muted))]" />
          <div className="space-y-1.5">
            <div className="h-4 bg-[hsl(var(--muted))] rounded w-24" />
            <div className="h-3 bg-[hsl(var(--muted))] rounded w-40" />
          </div>
        </div>
        <div className="h-2 bg-[hsl(var(--muted))] rounded-full" />
      </div>
      <div className="px-6 py-4 border-b border-[hsl(var(--border))]">
        <div className="flex gap-3">
          <div className="h-8 bg-[hsl(var(--muted))] rounded-full w-24" />
          <div className="h-8 bg-[hsl(var(--muted))] rounded-full w-24" />
        </div>
      </div>
      <div className="px-6 py-5 space-y-3">
        <div className="h-3 bg-[hsl(var(--muted))] rounded w-full" />
        <div className="h-3 bg-[hsl(var(--muted))] rounded w-5/6" />
        <div className="h-3 bg-[hsl(var(--muted))] rounded w-4/6" />
        <div className="h-3 bg-[hsl(var(--muted))] rounded w-3/4" />
      </div>
    </div>
  );
}
