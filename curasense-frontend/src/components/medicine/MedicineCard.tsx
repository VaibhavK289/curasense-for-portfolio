"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Medicine } from "@/lib/medicine-types";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  DollarSign,
  FlaskConical,
  Pill,
  ShieldAlert,
  Package,
} from "lucide-react";
import { springPresets } from "@/styles/tokens/animations";

// ─── Sub-components ──────────────────────────────────────────────────────────

function Tag({
  text,
  variant = "default",
}: {
  text: string;
  variant?: "blue" | "amber" | "red" | "green" | "purple" | "slate" | "default";
}) {
  const styles: Record<string, string> = {
    blue: "bg-[hsl(var(--color-info)/0.1)] text-[hsl(var(--color-info))] border-[hsl(var(--color-info)/0.2)]",
    amber: "bg-[hsl(var(--color-warning)/0.1)] text-[hsl(var(--color-warning))] border-[hsl(var(--color-warning)/0.2)]",
    red: "bg-[hsl(var(--color-error)/0.1)] text-[hsl(var(--color-error))] border-[hsl(var(--color-error)/0.2)]",
    green: "bg-[hsl(var(--color-success)/0.1)] text-[hsl(var(--color-success))] border-[hsl(var(--color-success)/0.2)]",
    purple: "bg-[hsl(var(--brand-secondary)/0.1)] text-[hsl(var(--brand-secondary))] border-[hsl(var(--brand-secondary)/0.2)]",
    slate: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]",
    default: "bg-[hsl(var(--color-medicine)/0.1)] text-[hsl(var(--color-medicine))] border-[hsl(var(--color-medicine)/0.2)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border",
        "transition-colors duration-200",
        styles[variant]
      )}
    >
      {text}
    </span>
  );
}

function Section({
  icon,
  title,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ...springPresets.gentle }}
      className="mb-5 last:mb-0"
    >
      <div className="flex items-center gap-2 mb-2.5">
        {icon}
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {title}
        </h4>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface MedicineCardProps {
  medicine: Medicine;
  variant?: "default" | "compact";
  className?: string;
  index?: number; // for stagger animation
}

export default function MedicineCard({
  medicine,
  variant = "default",
  className,
  index = 0,
}: MedicineCardProps) {
  const {
    name,
    composition,
    dosage_mg,
    price,
    estimated_cost_inr,
    uses,
    side_effects,
    warnings,
    contraindications,
    manufacturer,
    pros,
    cons,
    similar_medicines,
  } = medicine;

  const sectionDelay = 0.05;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, ...springPresets.smooth }}
      whileHover={variant === "default" ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        // Glassmorphism card
        "relative rounded-2xl border overflow-hidden",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        "shadow-sm hover:shadow-lg transition-shadow duration-300",
        // Dark mode glass effect
        "dark:bg-[hsl(var(--card)/0.8)] dark:backdrop-blur-sm",
        className
      )}
    >
      {/* ─── Header Gradient ─────────────────────────────────────── */}
      <div className="relative px-5 py-4 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--color-medicine))] to-[hsl(var(--brand-primary))]" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        {/* Inner highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Pill className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-white truncate">
                  {name ?? "Unknown"}
                </h3>
                {manufacturer && (
                  <p className="text-white/70 text-xs mt-0.5 truncate">
                    {manufacturer}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mt-3">
            {dosage_mg && (
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {dosage_mg} mg
              </span>
            )}
            {(price || estimated_cost_inr) && (
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                <DollarSign size={10} />
                {estimated_cost_inr ?? price}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Body ────────────────────────────────────────────────── */}
      <div className="p-5">
        {/* Composition */}
        {composition && (
          <Section
            icon={<FlaskConical size={14} className="text-[hsl(var(--brand-secondary))]" />}
            title="Composition"
            delay={sectionDelay}
          >
            <p className="text-sm text-[hsl(var(--foreground)/0.8)] leading-relaxed">
              {composition}
            </p>
          </Section>
        )}

        {/* Uses */}
        {uses && uses.length > 0 && (
          <Section
            icon={<Info size={14} className="text-[hsl(var(--color-info))]" />}
            title="Uses"
            delay={sectionDelay * 2}
          >
            <div className="flex flex-wrap gap-1.5">
              {uses.map((u, i) => (
                <Tag key={i} text={u} variant="blue" />
              ))}
            </div>
          </Section>
        )}

        {/* Pros / Cons — only in default variant */}
        {(pros?.length || cons?.length) && variant === "default" ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionDelay * 3, ...springPresets.gentle }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 p-4 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border)/0.5)]"
          >
            {pros && pros.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle size={13} className="text-[hsl(var(--color-success))]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--color-success))]">
                    Pros
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {pros.map((p, i) => (
                    <li
                      key={i}
                      className="text-xs text-[hsl(var(--foreground)/0.7)] flex items-start gap-1.5"
                    >
                      <span className="mt-0.5 text-[hsl(var(--color-success))] shrink-0">
                        +
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cons && cons.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <XCircle size={13} className="text-[hsl(var(--color-error))]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--color-error))]">
                    Cons
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {cons.map((c, i) => (
                    <li
                      key={i}
                      className="text-xs text-[hsl(var(--foreground)/0.7)] flex items-start gap-1.5"
                    >
                      <span className="mt-0.5 text-[hsl(var(--color-error))] shrink-0">
                        -
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ) : null}

        {/* Side Effects */}
        {side_effects && side_effects.length > 0 && (
          <Section
            icon={<AlertTriangle size={14} className="text-[hsl(var(--color-warning))]" />}
            title="Side Effects"
            delay={sectionDelay * 4}
          >
            <div className="flex flex-wrap gap-1.5">
              {side_effects.map((s, i) => (
                <Tag key={i} text={s} variant="amber" />
              ))}
            </div>
          </Section>
        )}

        {/* Warnings — only in default variant */}
        {warnings && warnings.length > 0 && variant === "default" && (
          <Section
            icon={<ShieldAlert size={14} className="text-[hsl(var(--color-error))]" />}
            title="Warnings"
            delay={sectionDelay * 5}
          >
            <ul className="space-y-1.5">
              {warnings.map((w, i) => (
                <li
                  key={i}
                  className="text-xs text-[hsl(var(--foreground)/0.7)] flex items-start gap-2"
                >
                  <AlertTriangle
                    size={11}
                    className="mt-0.5 text-[hsl(var(--color-error)/0.7)] shrink-0"
                  />
                  {w}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Contraindications — only in default variant */}
        {contraindications && contraindications.length > 0 && variant === "default" && (
          <Section
            icon={<XCircle size={14} className="text-[hsl(var(--color-error))]" />}
            title="Contraindications"
            delay={sectionDelay * 6}
          >
            <div className="flex flex-wrap gap-1.5">
              {contraindications.map((c, i) => (
                <Tag key={i} text={c} variant="red" />
              ))}
            </div>
          </Section>
        )}

        {/* Similar Medicines — only in default variant */}
        {similar_medicines && similar_medicines.length > 0 && variant === "default" && (
          <Section
            icon={<Package size={14} className="text-[hsl(var(--muted-foreground))]" />}
            title="Similar Medicines"
            delay={sectionDelay * 7}
          >
            <div className="flex flex-wrap gap-1.5">
              {similar_medicines.map((s, i) => (
                <Tag key={i} text={s} variant="slate" />
              ))}
            </div>
          </Section>
        )}
      </div>
    </motion.div>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

export function MedicineCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden animate-pulse",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        className
      )}
    >
      <div className="h-[88px] bg-gradient-to-r from-[hsl(var(--color-medicine)/0.3)] to-[hsl(var(--brand-primary)/0.3)]" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-3 bg-[hsl(var(--muted))] rounded w-3/4" />
          <div className="h-3 bg-[hsl(var(--muted))] rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-[hsl(var(--muted))] rounded-full w-16" />
          <div className="h-6 bg-[hsl(var(--muted))] rounded-full w-20" />
          <div className="h-6 bg-[hsl(var(--muted))] rounded-full w-14" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-[hsl(var(--muted))] rounded w-full" />
          <div className="h-3 bg-[hsl(var(--muted))] rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
