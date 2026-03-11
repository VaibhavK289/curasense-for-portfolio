"use client";

// ============================================
// CURASENSE MEDICINE SCANNER
// Upload a medicine image for AI-powered analysis
// Uses Gemini Vision → RAG enrichment pipeline
// ============================================

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  ImageIcon,
  Loader2,
  ArrowLeft,
  Pill,
  Info,
  Plus,
  Check,
  Sparkles,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GradientText, AnimatedContainer } from "@/components/ui/aceternity";
import { springPresets, animationVariants } from "@/styles/tokens/animations";
import { analyzeMedicineImage } from "@/lib/api";
import { flattenMedicine } from "@/lib/medicine-types";
import type { Medicine, ImageAnalysisResponse } from "@/lib/medicine-types";
import MedicineCard, {
  MedicineCardSkeleton,
} from "@/components/medicine/MedicineCard";
import { saveReport } from "@/lib/save-report";
import { useAuth } from "@/lib/auth-context";
import { addToCabinet, isInCabinet, addActivity } from "@/lib/medicine-cabinet";

// ─── Constants ───────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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

// ─── Extracted Info Badge ────────────────────────────────────────────────────

function ExtractedInfoCard({
  info,
}: {
  info: ImageAnalysisResponse["image_extracted_info"];
}) {
  const items = [
    { label: "Brand", value: info.brand },
    { label: "Generic", value: info.generic },
    { label: "Strength", value: info.strength },
  ].filter((i) => i.value);

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.smooth}
      className={cn(
        "rounded-2xl border p-5",
        "bg-[hsl(var(--brand-primary)/0.03)] border-[hsl(var(--brand-primary)/0.2)]"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Extracted from Image
        </h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-3 py-2"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              {item.label}
            </span>
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function MedicineScannerPage() {
  const { accessToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null);
  const [flatMedicine, setFlatMedicine] = useState<Medicine | null>(null);
  const [inCabinet, setInCabinet] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // ─── File Handling ─────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be under 10 MB.");
      return;
    }

    setError(null);
    setResult(null);
    setFlatMedicine(null);
    setInCabinet(false);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setResult(null);
    setFlatMedicine(null);
    setInCabinet(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [preview]);

  // ─── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ─── Analysis ─────────────────────────────────────────────────────────────

  const analyze = useCallback(async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setFlatMedicine(null);

    try {
      const data = await analyzeMedicineImage(selectedFile);
      setResult(data);

      if (data.medicine_insight) {
        const flat = flattenMedicine(data.medicine_insight);
        setFlatMedicine(flat);
        setInCabinet(isInCabinet(flat.name));

        // Track activity
        addActivity("scan", flat.name);

        saveReport(
          {
            type: "medicine",
            title: `Medicine Scan: ${flat.name}`,
            summary: `Scanned image — identified ${flat.name}${
              data.image_extracted_info?.strength
                ? ` (${data.image_extracted_info.strength})`
                : ""
            }`,
            content: JSON.stringify(data),
            status: "completed",
          },
          accessToken
        );
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to analyze image.";
      // Try to parse backend error detail
      try {
        const parsed = JSON.parse(msg);
        setError(parsed.detail || msg);
      } catch {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedFile, accessToken]);

  const handleAddToCabinet = useCallback(() => {
    if (!flatMedicine) return;
    addToCabinet(flatMedicine.name);
    setInCabinet(true);
  }, [flatMedicine]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AnimatedContainer
      variant="fadeUp"
      className="relative min-h-screen bg-[hsl(var(--background))]"
    >
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{ background: "hsl(var(--color-info) / 0.06)" }}
        />
        <div
          className="absolute -bottom-24 -left-32 h-[450px] w-[450px] rounded-full blur-[100px]"
          style={{ background: "hsl(var(--brand-primary) / 0.06)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* ── Back Navigation ── */}
        <Link
          href="/medicine"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-4 w-4" />
          Medicine Hub
        </Link>

        {/* ── Page Header ── */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--color-info)/0.1)]">
            <Camera className="h-6 w-6 text-[hsl(var(--color-info))]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Medicine Scanner
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Upload a photo of any medicine for instant AI-powered analysis
            </p>
          </div>
        </div>

        {/* ── Upload Area ── */}
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.smooth}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200",
              "bg-[hsl(var(--card))]",
              isDragging
                ? "border-[hsl(var(--color-info))] bg-[hsl(var(--color-info)/0.03)]"
                : "border-[hsl(var(--border))] hover:border-[hsl(var(--color-info)/0.4)] hover:bg-[hsl(var(--muted)/0.3)]"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
                  isDragging
                    ? "bg-[hsl(var(--color-info)/0.15)]"
                    : "bg-[hsl(var(--color-info)/0.08)]"
                )}
              >
                <Upload
                  className={cn(
                    "h-8 w-8 transition-colors",
                    isDragging
                      ? "text-[hsl(var(--color-info))]"
                      : "text-[hsl(var(--muted-foreground))]"
                  )}
                />
              </div>

              <div>
                <p className="text-base font-medium text-[hsl(var(--foreground))]">
                  {isDragging
                    ? "Drop your image here"
                    : "Drop a medicine image here"}
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  or click to browse from your device
                </p>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2 border-[hsl(var(--color-info)/0.3)] text-[hsl(var(--color-info))] hover:bg-[hsl(var(--color-info)/0.05)]"
              >
                <ImageIcon className="h-4 w-4" />
                Choose Image
              </Button>

              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                JPEG, PNG, or WebP — up to 10 MB
              </p>
            </div>
          </motion.div>
        ) : (
          /* ── Image Preview + Analyze ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springPresets.smooth}
            className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
          >
            {/* Preview */}
            <div className="relative aspect-video bg-[hsl(var(--muted)/0.3)] flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview!}
                alt="Medicine preview"
                className="max-h-full max-w-full object-contain"
              />

              {/* Remove button */}
              <button
                onClick={clearFile}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--background)/0.8)] backdrop-blur-sm border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--color-error))] hover:bg-[hsl(var(--color-error)/0.1)]"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {(selectedFile.size / 1024).toFixed(0)} KB
                </p>
              </div>

              <Button
                onClick={analyze}
                disabled={loading}
                className="gap-2 shrink-0 text-white"
                size="lg"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--color-info)), hsl(var(--brand-primary)))",
                }}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loading ? "Analyzing..." : "Analyze Medicine"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Results ── */}
        <div className="mt-6 space-y-4">
          <AnimatePresence mode="wait">
            {/* Loading skeleton */}
            {loading && (
              <motion.div key="skeleton" {...animationVariants.fadeIn}>
                <div className="space-y-4">
                  {/* Fake extraction card skeleton */}
                  <div className="animate-pulse rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-4 w-4 rounded bg-[hsl(var(--muted))]" />
                      <div className="h-4 w-32 rounded bg-[hsl(var(--muted))]" />
                    </div>
                    <div className="flex gap-3">
                      <div className="h-10 w-28 rounded-lg bg-[hsl(var(--muted))]" />
                      <div className="h-10 w-36 rounded-lg bg-[hsl(var(--muted))]" />
                      <div className="h-10 w-24 rounded-lg bg-[hsl(var(--muted))]" />
                    </div>
                  </div>
                  <MedicineCardSkeleton />
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && !loading && (
              <motion.div key="error" {...animationVariants.fadeIn}>
                <ErrorBanner message={error} />
              </motion.div>
            )}

            {/* Results */}
            {result && !loading && (
              <motion.div
                key="result"
                {...animationVariants.fadeUp}
                transition={springPresets.smooth}
                className="space-y-4"
              >
                {/* Extracted info card */}
                {result.image_extracted_info && (
                  <ExtractedInfoCard info={result.image_extracted_info} />
                )}

                {/* Full medicine card */}
                {flatMedicine && (
                  <>
                    <MedicineCard medicine={flatMedicine} />

                    {/* Add to Cabinet action */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3"
                    >
                      {inCabinet ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--color-success))]">
                          <Check className="h-4 w-4" />
                          In your Medicine Cabinet
                        </span>
                      ) : (
                        <Button
                          onClick={handleAddToCabinet}
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-[hsl(var(--color-medicine)/0.3)] text-[hsl(var(--color-medicine))] hover:bg-[hsl(var(--color-medicine)/0.05)]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add to Cabinet
                        </Button>
                      )}

                      <Link
                        href={`/medicine/lookup?q=${encodeURIComponent(
                          flatMedicine.name
                        )}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--brand-primary))] hover:underline"
                      >
                        <Pill className="h-3.5 w-3.5" />
                        View full lookup
                      </Link>
                    </motion.div>
                  </>
                )}

                {/* Fallback if insight failed but extraction worked */}
                {!flatMedicine && result.image_extracted_info && (
                  <div className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">
                    Medicine was identified from the image, but full enrichment
                    data could not be loaded. Try searching manually.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── How It Works ── */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.smooth, delay: 0.3 }}
            className="mt-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
          >
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">
              How it works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: "1",
                  title: "Upload",
                  desc: "Take a photo of your medicine packaging, label, or bottle",
                },
                {
                  step: "2",
                  title: "AI Extraction",
                  desc: "Gemini Vision identifies the brand name, generic name, and strength",
                },
                {
                  step: "3",
                  title: "Full Analysis",
                  desc: "Get enriched data — uses, side effects, warnings, pros & cons",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--color-info)/0.1)] text-sm font-bold text-[hsl(var(--color-info))]">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Disclaimer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "mt-8 p-4 rounded-xl",
            "bg-[hsl(var(--color-warning)/0.06)] border border-[hsl(var(--color-warning)/0.15)]"
          )}
        >
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-[hsl(var(--color-warning))] shrink-0 mt-0.5" />
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              <span className="font-semibold text-[hsl(var(--foreground))]">
                Disclaimer:
              </span>{" "}
              Image analysis is AI-powered and may not be 100% accurate. Always
              verify medicine information by reading the packaging carefully and
              consulting a healthcare professional before use.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatedContainer>
  );
}
