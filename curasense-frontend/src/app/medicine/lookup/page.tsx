"use client";

// ============================================
// CURASENSE — Dedicated Medicine Lookup Page
// Search any medicine by name for AI-powered insights
// Supports ?q= URL parameter for deep-linking
// ============================================

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { GradientText, AnimatedContainer } from "@/components/ui/aceternity";
import { springPresets, animationVariants } from "@/styles/tokens/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMedicine } from "@/lib/api";
import { flattenMedicine } from "@/lib/medicine-types";
import type { Medicine } from "@/lib/medicine-types";
import MedicineCard, { MedicineCardSkeleton } from "@/components/medicine/MedicineCard";
import { saveReport } from "@/lib/save-report";
import { useAuth } from "@/lib/auth-context";
import { addToCabinet, isInCabinet, addRecentSearch, addActivity } from "@/lib/medicine-cabinet";
import Link from "next/link";
import {
  ArrowLeft,
  Pill,
  Search,
  Loader2,
  AlertTriangle,
  Check,
  Plus,
  Info,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const EXAMPLE_MEDICINES = [
  "Paracetamol",
  "Ibuprofen",
  "Metformin",
  "Amoxicillin",
  "Aspirin",
];

const PILL_COLOR_MAP: Record<string, { hover: string; hoverBg: string; hoverBorder: string }> = {
  "color-medicine": {
    hover: "hover:text-[hsl(var(--color-medicine))]",
    hoverBg: "hover:bg-[hsl(var(--color-medicine)/0.05)]",
    hoverBorder: "hover:border-[hsl(var(--color-medicine)/0.4)]",
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ExamplePill({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const colors = PILL_COLOR_MAP["color-medicine"];
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        "text-[hsl(var(--muted-foreground))]",
        colors.hoverBorder,
        colors.hover,
        colors.hoverBg
      )}
    >
      {label}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 bg-[hsl(var(--color-error)/0.08)] border border-[hsl(var(--color-error)/0.2)] text-[hsl(var(--color-error))] text-sm px-4 py-3 rounded-xl"
    >
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </motion.div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function MedicineLookupPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inCabinet, setInCabinet] = useState(false);
  const { accessToken } = useAuth();

  // ─── Auto-search from URL ?q= param ─────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim()) {
      setQuery(q.trim());
      performSearch(q.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Check cabinet status when result changes ───────────────────────────
  useEffect(() => {
    if (result?.name) {
      setInCabinet(isInCabinet(result.name));
    } else {
      setInCabinet(false);
    }
  }, [result]);

  // ─── Search logic ───────────────────────────────────────────────────────
  async function performSearch(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getMedicine(trimmed);
      const flat = flattenMedicine(data);
      setResult(flat);

      // Track activity
      addActivity("lookup", flat.name);

      // Track recent search
      addRecentSearch(flat.name);

      // Save report
      saveReport(
        {
          type: "medicine",
          title: `Medicine Lookup: ${flat.name}`,
          summary: `Looked up ${flat.name}${flat.manufacturer ? ` by ${flat.manufacturer}` : ""}`,
          content: JSON.stringify(data),
          status: "completed",
        },
        accessToken,
      );
    } catch (e: unknown) {
      setError(
        (e as Error).message || "Failed to fetch medicine information.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    performSearch(query);
  }

  function handleExampleClick(name: string) {
    setQuery(name);
    performSearch(name);
  }

  function handleAddToCabinet() {
    if (!result?.name) return;
    addToCabinet(result.name);
    setInCabinet(true);
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative overflow-hidden">
      {/* ─── Decorative Background ───────────────────────────────── */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[hsl(var(--color-medicine)/0.05)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-[hsl(var(--brand-primary)/0.05)] blur-3xl" />

      <AnimatedContainer
        variant="fadeUp"
        className="relative z-10 container max-w-3xl mx-auto py-6 px-4 sm:px-6"
      >
        {/* ─── Back Navigation ───────────────────────────────────── */}
        <Link
          href="/medicine"
          className={cn(
            "inline-flex items-center gap-1.5 text-sm mb-6",
            "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
            "transition-colors duration-200"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Medicine Hub</span>
        </Link>

        {/* ─── Page Header ───────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--color-medicine)/0.1)]"
            >
              <Pill className="h-6 w-6 text-[hsl(var(--color-medicine))]" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Medicine Lookup
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                Search any medicine by name for detailed AI-powered insights
              </p>
            </div>
          </div>
        </div>

        {/* ─── Search Bar ────────────────────────────────────────── */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Paracetamol, Ibuprofen, Metformin..."
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            size="lg"
            className="bg-[hsl(var(--color-medicine))] hover:bg-[hsl(var(--color-medicine)/0.9)] text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="hidden sm:inline ml-2">Search</span>
          </Button>
        </div>

        {/* ─── Example Pills ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Try:
          </span>
          {EXAMPLE_MEDICINES.map((name) => (
            <ExamplePill
              key={name}
              label={name}
              onClick={() => handleExampleClick(name)}
            />
          ))}
        </div>

        {/* ─── Results Area ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="skeleton" {...animationVariants.fadeIn}>
              <MedicineCardSkeleton />
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
              className="space-y-4"
            >
              <MedicineCard medicine={result} />

              {/* ─── Add to Cabinet Button ────────────────────────── */}
              {!inCabinet ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, ...springPresets.smooth }}
                >
                  <button
                    onClick={handleAddToCabinet}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                      "border transition-all duration-200",
                      "bg-[hsl(var(--color-medicine)/0.08)] border-[hsl(var(--color-medicine)/0.2)]",
                      "text-[hsl(var(--color-medicine))]",
                      "hover:bg-[hsl(var(--color-medicine)/0.15)] hover:border-[hsl(var(--color-medicine)/0.4)]"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    Add to Cabinet
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={springPresets.snappy}
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                      "border",
                      "bg-[hsl(var(--color-success)/0.08)] border-[hsl(var(--color-success)/0.2)]",
                      "text-[hsl(var(--color-success))]"
                    )}
                  >
                    <Check className="h-4 w-4" />
                    In Cabinet
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Disclaimer Footer ─────────────────────────────────── */}
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
              to your medication regimen.
            </p>
          </div>
        </motion.div>
      </AnimatedContainer>
    </div>
  );
}
