"use client";

import { useState } from "react";
import { compareMedicines, CompareResponse, MedicineDetail, Medicine, flattenMedicine } from "@/lib/api";
import MedicineCard from "@/components/MedicineCard";
import { GitCompare, Loader2, ArrowLeftRight } from "lucide-react";

/** Flatten backend MedicineDetail into the flat Medicine shape MedicineCard expects */
function flatten(m: MedicineDetail): Medicine {
  return flattenMedicine(m);
}

function ComparisonRow({
  label,
  val1,
  val2,
}: {
  label: string;
  val1?: string | null;
  val2?: string | null;
}) {
  if (!val1 && !val2) return null;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start py-3 border-b border-slate-100 last:border-0">
      <p className="text-sm text-slate-600 leading-relaxed">{val1 ?? "—"}</p>
      <div className="flex flex-col items-center justify-start pt-1 gap-1">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
          {label}
        </span>
        <ArrowLeftRight size={12} className="text-slate-300" />
      </div>
      <p className="text-sm text-slate-600 leading-relaxed text-right">{val2 ?? "—"}</p>
    </div>
  );
}

function ListRow({
  label,
  items1,
  items2,
}: {
  label: string;
  items1?: string[];
  items2?: string[];
}) {
  if (!items1?.length && !items2?.length) return null;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start py-3 border-b border-slate-100 last:border-0">
      <p className="text-sm text-slate-600">{items1?.join(", ") || "—"}</p>
      <div className="flex flex-col items-center justify-start pt-1 gap-1">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
          {label}
        </span>
        <ArrowLeftRight size={12} className="text-slate-300" />
      </div>
      <p className="text-sm text-slate-600 text-right">{items2?.join(", ") || "—"}</p>
    </div>
  );
}

export default function ComparePage() {
  const [med1, setMed1] = useState("");
  const [med2, setMed2] = useState("");
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function compare() {
    if (!med1.trim() || !med2.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await compareMedicines(med1.trim(), med2.trim());
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to compare medicines.");
    } finally {
      setLoading(false);
    }
  }

  const flat1 = result ? flatten(result.medicine_1) : null;
  const flat2 = result ? flatten(result.medicine_2) : null;
  const summary = result?.comparison_summary;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="text-rose-500" size={20} />
          <h1 className="text-xl font-bold text-slate-800">Compare Medicines</h1>
        </div>
        <p className="text-sm text-slate-500">
          Side-by-side comparison of composition, dosage, price, safety scores, and more for any two medicines.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Medicine 1
            </label>
            <input
              value={med1}
              onChange={(e) => setMed1(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && compare()}
              placeholder="e.g. Paracetamol"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
          <div className="flex items-center justify-center pb-2">
            <span className="text-slate-400 font-semibold text-sm">vs</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Medicine 2
            </label>
            <input
              value={med2}
              onChange={(e) => setMed2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && compare()}
              placeholder="e.g. Ibuprofen"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
        </div>
        <button
          onClick={compare}
          disabled={!med1.trim() || !med2.trim() || loading}
          className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-3 rounded-xl transition-all"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <GitCompare size={15} />}
          Compare
        </button>
      </div>

      {/* Examples */}
      <div className="flex flex-wrap gap-2 mb-8 text-xs text-slate-400">
        <span className="self-center">Try:</span>
        {[
          ["Paracetamol", "Ibuprofen"],
          ["Metformin", "Glipizide"],
          ["Amoxicillin", "Azithromycin"],
        ].map(([a, b]) => (
          <button
            key={`${a}-${b}`}
            onClick={() => { setMed1(a); setMed2(b); }}
            className="bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-700 text-slate-500 px-2.5 py-1 rounded-full transition-all"
          >
            {a} vs {b}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 gap-5">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="h-24 bg-rose-200/40" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Results */}
      {result && flat1 && flat2 && !loading && (
        <div className="space-y-6">
          {/* Medicine cards side by side */}
          <div className="grid grid-cols-2 gap-5">
            <MedicineCard medicine={flat1} variant="compact" />
            <MedicineCard medicine={flat2} variant="compact" />
          </div>

          {/* Comparison summary table */}
          {summary && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <GitCompare size={14} className="text-rose-500" />
                <h3 className="text-sm font-semibold text-slate-700">Detailed Comparison</h3>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 px-5 py-2.5 bg-slate-50/50 border-b border-slate-100">
                <p className="text-xs font-bold text-blue-600">{flat1.name}</p>
                <div className="w-20" />
                <p className="text-xs font-bold text-purple-600 text-right">{flat2.name}</p>
              </div>

              <div className="px-5">
                <ListRow
                  label="Unique Ingredients"
                  items1={summary.unique_to_med1}
                  items2={summary.unique_to_med2}
                />
                <ListRow
                  label="Common Ingredients"
                  items1={summary.common_ingredients}
                  items2={summary.common_ingredients}
                />
                <ListRow
                  label="Common Uses"
                  items1={summary.common_uses}
                  items2={summary.common_uses}
                />
                <ComparisonRow
                  label="More Warnings"
                  val1={summary.more_warnings === flat1.name ? "More warnings" : "Fewer warnings"}
                  val2={summary.more_warnings === flat2.name ? "More warnings" : "Fewer warnings"}
                />
                <ComparisonRow
                  label="Side Effects"
                  val1={summary.higher_side_effect_count === flat1.name ? "More side effects" : summary.higher_side_effect_count === "Equal" ? "Equal" : "Fewer side effects"}
                  val2={summary.higher_side_effect_count === flat2.name ? "More side effects" : summary.higher_side_effect_count === "Equal" ? "Equal" : "Fewer side effects"}
                />
              </div>

              {/* Safer option badge */}
              {summary.safer_option && (
                <div className="px-5 py-3 border-t border-slate-100 bg-emerald-50/60">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    Safer option:
                  </span>{" "}
                  <span className="text-sm font-bold text-emerald-800">{summary.safer_option}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
