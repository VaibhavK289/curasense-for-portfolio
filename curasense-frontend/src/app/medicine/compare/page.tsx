"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { GradientText, AnimatedContainer } from "@/components/ui/aceternity";
import { springPresets, animationVariants } from "@/styles/tokens/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compareMedicines } from "@/lib/api";
import type { CompareResponse } from "@/lib/medicine-types";
import ComparisonView, {
  ComparisonViewSkeleton,
} from "@/components/medicine/ComparisonView";
import { saveReport } from "@/lib/save-report";
import { useAuth } from "@/lib/auth-context";
import { getCabinet, addActivity, type CabinetMedicine } from "@/lib/medicine-cabinet";
import Link from "next/link";
import {
  ArrowLeft,
  GitCompare,
  Loader2,
  Info,
  Pill,
} from "lucide-react";

// ─── Example Pairs ───────────────────────────────────────────────────────────

const COMPARE_EXAMPLES: [string, string][] = [
  ["Paracetamol", "Ibuprofen"],
  ["Metformin", "Glipizide"],
  ["Amoxicillin", "Azithromycin"],
];

// ─── Error Banner ────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[hsl(var(--color-error)/0.08)] border border-[hsl(var(--color-error)/0.2)] text-[hsl(var(--color-error))] text-sm px-4 py-3 rounded-xl"
    >
      {message}
    </motion.div>
  );
}

// ─── Example Pill Button ─────────────────────────────────────────────────────

function ExamplePill({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        "text-[hsl(var(--muted-foreground))]",
        "hover:border-[hsl(var(--brand-secondary)/0.4)]",
        "hover:text-[hsl(var(--brand-secondary))]",
        "hover:bg-[hsl(var(--brand-secondary)/0.05)]"
      )}
    >
      {label}
    </button>
  );
}

// ─── Cabinet Pill ────────────────────────────────────────────────────────────

function CabinetPill({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
        "bg-[hsl(var(--brand-secondary)/0.05)] border-[hsl(var(--brand-secondary)/0.2)]",
        "text-[hsl(var(--brand-secondary))]",
        "hover:border-[hsl(var(--brand-secondary)/0.4)]",
        "hover:text-[hsl(var(--brand-secondary))]",
        "hover:bg-[hsl(var(--brand-secondary)/0.1)]"
      )}
    >
      <span className="flex items-center gap-1">
        <Pill size={10} />
        {name}
      </span>
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ComparePage() {
  const [med1, setMed1] = useState("");
  const [med2, setMed2] = useState("");
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cabinet, setCabinet] = useState<CabinetMedicine[]>([]);
  const { accessToken } = useAuth();

  // Load cabinet from localStorage on mount
  useEffect(() => {
    setCabinet(getCabinet());
  }, []);

  // Auto-fill from URL query params (?m1=...&m2=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m1 = params.get("m1");
    const m2 = params.get("m2");

    if (m1 && m2) {
      setMed1(m1);
      setMed2(m2);

      // Auto-trigger comparison
      (async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
          const data = await compareMedicines(m1.trim(), m2.trim());
          setResult(data);

          // Track activity
          addActivity("compare", `${m1} vs ${m2}`);

          saveReport(
            {
              type: "medicine",
              title: `Compare: ${m1} vs ${m2}`,
              summary: `Compared ${m1} and ${m2}`,
              content: JSON.stringify(data),
              status: "completed",
            },
            accessToken
          );
        } catch (e: unknown) {
          setError(
            (e as Error).message || "Failed to compare medicines."
          );
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Compare Handler ────────────────────────────────────────

  async function compare() {
    if (!med1.trim() || !med2.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await compareMedicines(med1.trim(), med2.trim());
      setResult(data);

      // Track activity
      addActivity("compare", `${med1} vs ${med2}`);

      saveReport(
        {
          type: "medicine",
          title: `Compare: ${med1} vs ${med2}`,
          summary: `Compared ${med1} and ${med2}`,
          content: JSON.stringify(data),
          status: "completed",
        },
        accessToken
      );
    } catch (e: unknown) {
      setError(
        (e as Error).message || "Failed to compare medicines."
      );
    } finally {
      setLoading(false);
    }
  }

  // ─── Cabinet Fill Logic ─────────────────────────────────────

  function fillFromCabinet(name: string) {
    if (!med1.trim()) {
      setMed1(name);
    } else if (!med2.trim()) {
      setMed2(name);
    }
  }

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[hsl(var(--brand-secondary)/0.05)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-[hsl(var(--brand-primary)/0.05)] blur-3xl" />

      <AnimatedContainer
        variant="fadeUp"
        className="relative z-10 container max-w-5xl mx-auto py-6 px-4 sm:px-6"
      >
        {/* ─── Back Navigation ──────────────────────────────────── */}
        <Link
          href="/medicine"
          className={cn(
            "inline-flex items-center gap-1.5 text-sm mb-6",
            "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
            "transition-colors duration-200"
          )}
        >
          <ArrowLeft size={14} />
          Medicine Hub
        </Link>

        {/* ─── Page Header ──────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--brand-secondary)/0.1)]"
            >
              <GitCompare className="h-7 w-7 text-[hsl(var(--brand-secondary))]" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                <GradientText>Compare Medicines</GradientText>
              </h1>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mt-0.5">
                Side-by-side comparison of composition, dosage, price, safety,
                and more
              </p>
            </div>
          </div>
        </div>

        {/* ─── Select from Cabinet ──────────────────────────────── */}
        {cabinet.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ...springPresets.smooth }}
            className="mb-6"
          >
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 block">
              Quick fill from your cabinet:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {cabinet.map((med) => (
                <CabinetPill
                  key={med.name}
                  name={med.name}
                  onClick={() => fillFromCabinet(med.name)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Input Card ───────────────────────────────────────── */}
        <div
          className={cn(
            "rounded-2xl border p-6 mb-4",
            "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
            "shadow-sm"
          )}
        >
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end mb-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">
                Medicine 1
              </label>
              <Input
                value={med1}
                onChange={(e) => setMed1(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && compare()}
                placeholder="e.g. Paracetamol"
              />
            </div>
            <div className="flex items-center justify-center sm:pb-2">
              <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                vs
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">
                Medicine 2
              </label>
              <Input
                value={med2}
                onChange={(e) => setMed2(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && compare()}
                placeholder="e.g. Ibuprofen"
              />
            </div>
          </div>
          <Button
            onClick={compare}
            disabled={!med1.trim() || !med2.trim() || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GitCompare className="h-4 w-4" />
            )}
            <span className="ml-2">Compare</span>
          </Button>
        </div>

        {/* ─── Example Pairs ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Try:
          </span>
          {COMPARE_EXAMPLES.map(([a, b]) => (
            <ExamplePill
              key={`${a}-${b}`}
              label={`${a} vs ${b}`}
              onClick={() => {
                setMed1(a);
                setMed2(b);
              }}
            />
          ))}
        </div>

        {/* ─── Results Area ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="skeleton" {...animationVariants.fadeIn}>
              <ComparisonViewSkeleton />
            </motion.div>
          )}
          {error && !loading && (
            <motion.div key="error" {...animationVariants.fadeIn}>
              <ErrorBanner message={error} />
            </motion.div>
          )}
          {result && !loading && (
            <motion.div
              key="result"
              {...animationVariants.fadeUp}
              transition={springPresets.smooth}
            >
              <ComparisonView result={result} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Disclaimer Footer ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "mt-12 p-4 rounded-xl",
            "bg-[hsl(var(--color-warning)/0.06)] border border-[hsl(var(--color-warning)/0.15)]"
          )}
        >
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-[hsl(var(--color-warning))] shrink-0 mt-0.5" />
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              <span className="font-semibold text-[hsl(var(--foreground))]">
                Disclaimer:
              </span>{" "}
              This tool is for informational purposes only. Always consult with
              a healthcare professional or pharmacist before making any changes
              to your medication.
            </p>
          </div>
        </motion.div>
      </AnimatedContainer>
    </div>
  );
}
