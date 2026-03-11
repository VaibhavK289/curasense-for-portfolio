"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Medicine } from "@/lib/medicine-types";
import MedicineCard from "./MedicineCard";
import { springPresets, staggerConfig } from "@/styles/tokens/animations";

// ─── Main Component ──────────────────────────────────────────────────────────

interface RecommendationViewProps {
  medicines: Medicine[];
  className?: string;
}

export default function RecommendationView({
  medicines,
  className,
}: RecommendationViewProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: staggerConfig.normal,
      }}
      className={cn("space-y-5", className)}
    >
      {/* Count label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"
      >
        {medicines.length} Recommendation{medicines.length !== 1 ? "s" : ""}
      </motion.p>

      {/* Medicine cards with rank badges */}
      {medicines.map((med, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.1, ...springPresets.smooth }}
          className="relative"
        >
          {/* Rank badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3 + i * 0.1,
              type: "spring",
              stiffness: 500,
              damping: 20,
            }}
            className={cn(
              "absolute -top-2.5 -left-2.5 z-10",
              "flex h-8 w-8 items-center justify-center rounded-full",
              "text-xs font-bold text-white shadow-lg",
              i === 0
                ? "bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--color-medicine))] shadow-[hsl(var(--brand-primary)/0.3)]"
                : i === 1
                  ? "bg-gradient-to-br from-[hsl(var(--brand-secondary))] to-[hsl(var(--brand-primary))] shadow-[hsl(var(--brand-secondary)/0.3)]"
                  : "bg-gradient-to-br from-[hsl(var(--muted-foreground))] to-[hsl(var(--foreground)/0.6)]"
            )}
          >
            {i + 1}
          </motion.div>

          <MedicineCard medicine={med} index={0} />
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function RecommendationViewSkeleton({
  className,
  count = 2,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <div className={cn("space-y-5 animate-pulse", className)}>
      <div className="h-3 bg-[hsl(var(--muted))] rounded w-32" />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border overflow-hidden bg-[hsl(var(--card))] border-[hsl(var(--border))]"
        >
          <div className="h-[88px] bg-gradient-to-r from-[hsl(var(--color-medicine)/0.3)] to-[hsl(var(--brand-primary)/0.3)]" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-[hsl(var(--muted))] rounded w-3/4" />
            <div className="h-3 bg-[hsl(var(--muted))] rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-6 bg-[hsl(var(--muted))] rounded-full w-16" />
              <div className="h-6 bg-[hsl(var(--muted))] rounded-full w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
