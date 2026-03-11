"use client";

// ============================================
// CURASENSE — Dedicated Symptom Advisor Page
// Describe symptoms → AI-ranked medicine recommendations
// ============================================

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { GradientText, AnimatedContainer } from "@/components/ui/aceternity";
import { springPresets, animationVariants } from "@/styles/tokens/animations";
import { Button } from "@/components/ui/button";
import { recommendMedicines } from "@/lib/api";
import { flattenMedicine } from "@/lib/medicine-types";
import type { Medicine } from "@/lib/medicine-types";
import RecommendationView, {
  RecommendationViewSkeleton,
} from "@/components/medicine/RecommendationView";
import { saveReport } from "@/lib/save-report";
import { useAuth } from "@/lib/auth-context";
import { addActivity } from "@/lib/medicine-cabinet";
import Link from "next/link";
import {
  ArrowLeft,
  Stethoscope,
  ChevronRight,
  Loader2,
  Info,
  Sparkles,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const COMMON_SYMPTOMS = [
  "Headache",
  "Fever",
  "Cough",
  "Body Pain",
  "Nausea",
  "Fatigue",
  "Sore Throat",
  "Joint Pain",
  "Acid Reflux",
  "Insomnia",
  "Anxiety",
  "Allergies",
] as const;

const EXAMPLE_QUERIES = [
  "fever and headache",
  "joint pain and inflammation",
  "acid reflux and heartburn",
  "mild anxiety and insomnia",
] as const;

// Static pill color map for teal (brand-primary)
const PILL_COLOR_MAP = {
  hover: "hover:text-[hsl(var(--brand-primary))]",
  hoverBg: "hover:bg-[hsl(var(--brand-primary)/0.05)]",
  hoverBorder: "hover:border-[hsl(var(--brand-primary)/0.4)]",
} as const;

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 text-[hsl(var(--muted-foreground))] text-sm"
    >
      {message}
    </motion.div>
  );
}

function SymptomTag({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        "text-[hsl(var(--muted-foreground))]",
        PILL_COLOR_MAP.hover,
        PILL_COLOR_MAP.hoverBg,
        PILL_COLOR_MAP.hoverBorder
      )}
    >
      {label}
    </button>
  );
}

function ExamplePill({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        "text-[hsl(var(--muted-foreground))]",
        "flex items-center gap-1.5",
        PILL_COLOR_MAP.hover,
        PILL_COLOR_MAP.hoverBg,
        PILL_COLOR_MAP.hoverBorder
      )}
    >
      <Sparkles className="h-3 w-3" />
      {label}
    </button>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function SymptomAdvisorPage() {
  const [symptoms, setSymptoms] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const { accessToken } = useAuth();

  // ── Symptom tag append helper ──────────────────────────────────────────────

  function appendSymptom(tag: string) {
    setSymptoms((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      return trimmed.endsWith(",") ? `${trimmed} ${tag}` : `${trimmed}, ${tag}`;
    });
  }

  // ── Search handler ─────────────────────────────────────────────────────────

  async function search(s?: string) {
    const sym = (s ?? symptoms).trim();
    if (!sym) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(false);
    try {
      const data = await recommendMedicines(sym);
      const meds = (data.recommended_medicines ?? []).map(flattenMedicine);
      setResults(meds);
      setSearched(true);

      // Track activity
      addActivity("advisor", sym);

      saveReport(
        {
          type: "medicine",
          title: `Symptom Advisor: ${sym.slice(0, 50)}`,
          summary: `Found ${meds.length} recommendations for "${sym}"`,
          content: JSON.stringify(data),
          status: "completed",
        },
        accessToken
      );
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to get recommendations.");
    } finally {
      setLoading(false);
    }
  }

  // ── Auto-search from URL query params ──────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSymptoms = params.get("symptoms");
    if (urlSymptoms && urlSymptoms.trim()) {
      setSymptoms(urlSymptoms.trim());
      search(urlSymptoms.trim());
    }
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[hsl(var(--brand-primary)/0.05)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-[hsl(var(--brand-secondary)/0.05)] blur-3xl" />

      <AnimatedContainer
        variant="fadeUp"
        className="relative z-10 container max-w-4xl mx-auto py-6 px-4 sm:px-6"
      >
        {/* ─── Back Navigation ──────────────────────────────────── */}
        <Link
          href="/medicine"
          className={cn(
            "inline-flex items-center gap-1.5 text-sm mb-6",
            "text-[hsl(var(--muted-foreground))]",
            "hover:text-[hsl(var(--brand-primary))] transition-colors"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Medicine Hub
        </Link>

        {/* ─── Page Header ──────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--brand-primary)/0.1)]"
            >
              <Stethoscope className="h-7 w-7 text-[hsl(var(--brand-primary))]" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                <GradientText>Symptom Advisor</GradientText>
              </h1>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mt-0.5">
                Describe your symptoms and get AI-ranked medicine recommendations
              </p>
            </div>
          </div>
        </div>

        {/* ─── Symptom Input Card ───────────────────────────────── */}
        <div
          className={cn(
            "rounded-2xl border p-5 mb-6",
            "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
            "shadow-sm"
          )}
        >
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Describe your symptoms
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault();
                search();
              }
            }}
            placeholder="e.g. I have a high fever, sore throat, and body aches for the past 2 days..."
            rows={3}
            className={cn(
              "w-full text-sm outline-none resize-none rounded-xl p-3",
              "bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]",
              "text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]",
              "focus:border-[hsl(var(--brand-primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--brand-primary)/0.1)]",
              "transition-all"
            )}
          />

          {/* Common symptom tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {COMMON_SYMPTOMS.map((tag) => (
              <SymptomTag
                key={tag}
                label={tag}
                onClick={() => appendSymptom(tag)}
              />
            ))}
          </div>

          {/* Footer: hint + button */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[hsl(var(--border)/0.5)]">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              Ctrl+Enter to search
            </span>
            <Button
              onClick={() => search()}
              disabled={!symptoms.trim() || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="ml-1.5">Get Recommendations</span>
            </Button>
          </div>
        </div>

        {/* ─── Example Queries ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Try:
          </span>
          {EXAMPLE_QUERIES.map((ex) => (
            <ExamplePill
              key={ex}
              label={ex}
              onClick={() => {
                setSymptoms(ex);
                search(ex);
              }}
            />
          ))}
        </div>

        {/* ─── Results Area ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="skeleton" {...animationVariants.fadeIn}>
              <RecommendationViewSkeleton />
            </motion.div>
          )}
          {error && !loading && (
            <motion.div key="error" {...animationVariants.fadeIn}>
              <ErrorBanner message={error} />
            </motion.div>
          )}
          {searched && !loading && results.length === 0 && (
            <EmptyState message="No recommendations found. Try rephrasing your symptoms." />
          )}
          {results.length > 0 && !loading && (
            <motion.div
              key="results"
              {...animationVariants.fadeUp}
              transition={springPresets.smooth}
            >
              <RecommendationView medicines={results} />
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
              This tool is for informational purposes only. Always consult with a
              healthcare professional or pharmacist before making any changes to
              your medication. AI recommendations are not a substitute for
              professional medical advice.
            </p>
          </div>
        </motion.div>
      </AnimatedContainer>
    </div>
  );
}
