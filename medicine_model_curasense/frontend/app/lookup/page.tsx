"use client";

import { useState } from "react";
import { getMedicine, flattenMedicine } from "@/lib/api";
import MedicineCard from "@/components/MedicineCard";
import { Search, Pill, Loader2 } from "lucide-react";
import type { Medicine } from "@/lib/api";

const EXAMPLES = ["Paracetamol", "Ibuprofen", "Metformin", "Amoxicillin", "Aspirin"];

export default function LookupPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(name?: string) {
    const n = (name ?? query).trim();
    if (!n) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await getMedicine(n);
      setResult(flattenMedicine(data));
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to fetch medicine info.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Pill className="text-purple-500" size={20} />
          <h1 className="text-xl font-bold text-slate-800">Medicine Lookup</h1>
        </div>
        <p className="text-sm text-slate-500">
          Search any medicine by name. CuraSense fetches live data via RAG and enriches it with AI.
        </p>
      </div>

      {/* Search box */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all shadow-sm">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder="e.g. Paracetamol, Ibuprofen..."
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          onClick={() => lookup()}
          disabled={!query.trim() || loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-3 rounded-xl transition-all"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Search
        </button>
      </div>

      {/* Quick examples */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-xs text-slate-400">Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setQuery(ex);
              lookup(ex);
            }}
            className="text-xs bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-700 text-slate-500 px-2.5 py-1 rounded-full transition-all"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-pulse">
          <div className="h-24 bg-purple-200/60" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && <MedicineCard medicine={result} />}
    </div>
  );
}
