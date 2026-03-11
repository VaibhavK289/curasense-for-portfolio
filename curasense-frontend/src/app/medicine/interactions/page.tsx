"use client";

// ============================================
// DRUG INTERACTION CHECKER — Dedicated Page
// Amber/warning themed interaction checker with
// cabinet quick-fill, example pairs, and URL auto-fill
// ============================================

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { GradientText, AnimatedContainer } from "@/components/ui/aceternity";
import { springPresets, animationVariants } from "@/styles/tokens/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkInteraction } from "@/lib/api";
import type { InteractionResponse } from "@/lib/medicine-types";
import InteractionResult, {
  InteractionResultSkeleton,
} from "@/components/medicine/InteractionResult";
import { saveReport } from "@/lib/save-report";
import { useAuth } from "@/lib/auth-context";
import { getCabinet, addActivity, type CabinetMedicine } from "@/lib/medicine-cabinet";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Info,
  Pill,
} from "lucide-react";

// ─── Example Pairs ───────────────────────────────────────────────────────────

const EXAMPLE_PAIRS: [string, string][] = [
  ["Aspirin", "Warfarin"],
  ["Metformin", "Ibuprofen"],
  ["Lisinopril", "Potassium"],
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

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function InteractionCheckerPage() {
  const [med1, setMed1] = useState("");
  const [med2, setMed2] = useState("");
  const [result, setResult] = useState<InteractionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cabinet, setCabinet] = useState<CabinetMedicine[]>([]);
  const { accessToken } = useAuth();

  // ─── Load cabinet from localStorage ──────────────────────────
  useEffect(() => {
    setCabinet(getCabinet());
  }, []);

  // ─── Auto-fill from URL query params ─────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m1 = params.get("m1") ?? "";
    const m2 = params.get("m2") ?? "";

    if (m1) setMed1(m1);
    if (m2) setMed2(m2);

    // Auto-trigger check if both params are present
    if (m1.trim() && m2.trim()) {
      // Small delay to let state settle before triggering
      const timeout = setTimeout(() => {
        performCheck(m1.trim(), m2.trim());
      }, 100);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Check Interaction ───────────────────────────────────────
  async function performCheck(medicine1?: string, medicine2?: string) {
    const m1 = (medicine1 ?? med1).trim();
    const m2 = (medicine2 ?? med2).trim();
    if (!m1 || !m2) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await checkInteraction(m1, m2);
      setResult(data);

      // Track activity
      addActivity("interaction", `${m1} + ${m2}`);

      saveReport(
        {
          type: "medicine",
          title: `Interaction: ${m1} + ${m2}`,
          summary: `Risk level: ${data.risk_level} — ${m1} + ${m2}`,
          content: JSON.stringify(data),
          status: "completed",
        },
        accessToken,
      );
    } catch (e: unknown) {
      setError(
        (e as Error).message || "Failed to check interaction.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ─── Fill from Cabinet ───────────────────────────────────────
  function fillFromCabinet(name: string) {
    if (!med1.trim()) {
      setMed1(name);
    } else if (!med2.trim()) {
      setMed2(name);
    }
    // If both filled, do nothing
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative overflow-hidden">
      {/* ─── Decorative Background ─────────────────────────────── */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[hsl(var(--color-warning)/0.06)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-[hsl(var(--brand-primary)/0.04)] blur-3xl" />

      <AnimatedContainer
        variant="fadeUp"
        className="relative z-10 container max-w-3xl mx-auto py-6 px-4 sm:px-6"
      >
        {/* ─── Back Navigation ──────────────────────────────────── */}
        <Link
          href="/medicine"
          className={cn(
            "inline-flex items-center gap-1.5 text-sm mb-6",
            "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
            "transition-colors duration-200",
          )}
        >
          <ArrowLeft size={16} />
          <span>Medicine Hub</span>
        </Link>

        {/* ─── Page Header ──────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--color-warning)/0.1)]"
            >
              <AlertTriangle className="h-7 w-7 text-[hsl(var(--color-warning))]" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Drug Interaction Checker
              </h1>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mt-0.5">
                Check potential interaction risks between two medicines
              </p>
            </div>
          </div>
        </div>

        {/* ─── Cabinet Quick-Fill ───────────────────────────────── */}
        {cabinet.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-4"
          >
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">
              Quick fill from your cabinet:
            </p>
            <div className="flex flex-wrap gap-2">
              {cabinet.map((item) => (
                <button
                  key={item.name}
                  onClick={() => fillFromCabinet(item.name)}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border",
                    "transition-all duration-200",
                    "bg-[hsl(var(--brand-primary)/0.05)] border-[hsl(var(--brand-primary)/0.2)]",
                    "text-[hsl(var(--brand-primary))]",
                    "hover:bg-[hsl(var(--brand-primary)/0.1)] hover:border-[hsl(var(--brand-primary)/0.4)]",
                  )}
                >
                  <Pill size={12} />
                  {item.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Input Card ───────────────────────────────────────── */}
        <div
          className={cn(
            "rounded-2xl border p-6 mb-4",
            "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
            "shadow-sm",
          )}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">
                Medicine 1
              </label>
              <Input
                value={med1}
                onChange={(e) => setMed1(e.target.value)}
                placeholder="e.g. Aspirin"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">
                Medicine 2
              </label>
              <Input
                value={med2}
                onChange={(e) => setMed2(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && performCheck()}
                placeholder="e.g. Warfarin"
              />
            </div>
          </div>
          <Button
            onClick={() => performCheck()}
            disabled={!med1.trim() || !med2.trim() || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span className="ml-2">Check Interaction</span>
          </Button>
        </div>

        {/* ─── Example Pairs ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Try:
          </span>
          {EXAMPLE_PAIRS.map(([a, b]) => (
            <button
              key={`${a}-${b}`}
              onClick={() => {
                setMed1(a);
                setMed2(b);
              }}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
                "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
                "text-[hsl(var(--muted-foreground))]",
                "hover:border-[hsl(var(--color-warning)/0.4)]",
                "hover:text-[hsl(var(--color-warning))]",
                "hover:bg-[hsl(var(--color-warning)/0.05)]",
              )}
            >
              {a} + {b}
            </button>
          ))}
        </div>

        {/* ─── Results Area ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="skeleton" {...animationVariants.fadeIn}>
              <InteractionResultSkeleton />
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
              <InteractionResult result={result} />
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
            "bg-[hsl(var(--color-warning)/0.06)] border border-[hsl(var(--color-warning)/0.15)]",
          )}
        >
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-[hsl(var(--color-warning))] shrink-0 mt-0.5" />
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              <span className="font-semibold text-[hsl(var(--foreground))]">
                Disclaimer:
              </span>{" "}
              Drug interaction data is AI-generated and for informational
              purposes only. Always consult a qualified healthcare professional
              or pharmacist before combining medications. Do not start, stop, or
              change any medication regimen based solely on this tool.
            </p>
          </div>
        </motion.div>
      </AnimatedContainer>
    </div>
  );
}
