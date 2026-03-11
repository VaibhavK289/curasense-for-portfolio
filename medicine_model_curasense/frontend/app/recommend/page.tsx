"use client";

import { useState } from "react";
import { recommend, flattenMedicine } from "@/lib/api";
import MedicineCard from "@/components/MedicineCard";
import { Stethoscope, Loader2, ChevronRight } from "lucide-react";
import type { Medicine } from "@/lib/api";

const EXAMPLE_SYMPTOMS = [
  "fever and headache",
  "joint pain and inflammation",
  "acid reflux and heartburn",
  "mild anxiety and insomnia",
  "type 2 diabetes management",
];

export default function RecommendPage() {
  const [symptoms, setSymptoms] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function search(s?: string) {
    const sym = (s ?? symptoms).trim();
    if (!sym) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(false);
    try {
      const data = await recommend(sym);
      setResults((data.recommended_medicines ?? []).map(flattenMedicine));
      setSearched(true);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to get recommendations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Stethoscope className="text-teal-500" size={20} />
          <h1 className="text-xl font-bold text-slate-800">Symptom Advisor</h1>
        </div>
        <p className="text-sm text-slate-500">
          Describe your symptoms in plain language and get AI-ranked medicine recommendations with pros, cons, and safety information.
        </p>
      </div>

      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Describe your symptoms
        </label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && search()}
          placeholder="e.g. I have a high fever, sore throat, and body aches for the past 2 days..."
          rows={3}
          className="w-full text-sm text-slate-700 placeholder:text-slate-400 outline-none resize-none"
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">Ctrl+Enter to search</span>
          <button
            onClick={() => search()}
            disabled={!symptoms.trim() || loading}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-xl transition-all"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
            Get Recommendations
          </button>
        </div>
      </div>

      {/* Example chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-xs text-slate-400 self-center">Examples:</span>
        {EXAMPLE_SYMPTOMS.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setSymptoms(ex);
              search(ex);
            }}
            className="text-xs bg-white border border-slate-200 hover:border-teal-300 hover:text-teal-700 text-slate-500 px-3 py-1 rounded-full transition-all"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-24 bg-teal-200/50" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && results.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No recommendations found. Try rephrasing your symptoms.
        </div>
      )}

      {results.length > 0 && !loading && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {results.length} Recommendation{results.length > 1 ? "s" : ""}
          </p>
          <div className="space-y-5">
            {results.map((med, i) => (
              <div key={i} className="relative">
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
                  {i + 1}
                </div>
                <MedicineCard medicine={med} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
