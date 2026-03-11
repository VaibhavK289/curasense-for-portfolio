"use client";

import { useState } from "react";
import { checkInteraction, InteractionResponse } from "@/lib/api";
import { AlertTriangle, Loader2, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import clsx from "clsx";

const RISK_CONFIG = {
  Low: {
    icon: ShieldCheck,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-500",
    barWidth: "w-1/4",
    label: "Low Risk",
  },
  Moderate: {
    icon: ShieldAlert,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
    barWidth: "w-1/2",
    label: "Moderate Risk",
  },
  High: {
    icon: ShieldX,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
    bar: "bg-red-500",
    barWidth: "w-full",
    label: "High Risk",
  },
};

function getRisk(level: string) {
  const key = Object.keys(RISK_CONFIG).find(
    (k) => level?.toLowerCase().includes(k.toLowerCase())
  ) as keyof typeof RISK_CONFIG | undefined;
  return RISK_CONFIG[key ?? "Moderate"];
}

export default function InteractionPage() {
  const [med1, setMed1] = useState("");
  const [med2, setMed2] = useState("");
  const [result, setResult] = useState<InteractionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    if (!med1.trim() || !med2.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await checkInteraction(med1.trim(), med2.trim());
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to check interaction.");
    } finally {
      setLoading(false);
    }
  }

  const risk = result ? getRisk(result.risk_level) : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="text-amber-500" size={20} />
          <h1 className="text-xl font-bold text-slate-800">Drug Interaction Checker</h1>
        </div>
        <p className="text-sm text-slate-500">
          Enter two medicine names to check for potential interaction risks, contraindications, and safety recommendations.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Medicine 1
            </label>
            <input
              value={med1}
              onChange={(e) => setMed1(e.target.value)}
              placeholder="e.g. Aspirin"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Medicine 2
            </label>
            <input
              value={med2}
              onChange={(e) => setMed2(e.target.value)}
              placeholder="e.g. Warfarin"
              onKeyDown={(e) => e.key === "Enter" && check()}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
        </div>

        <button
          onClick={check}
          disabled={!med1.trim() || !med2.trim() || loading}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-3 rounded-xl transition-all"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <AlertTriangle size={15} />}
          Check Interaction
        </button>
      </div>

      {/* Quick examples */}
      <div className="flex flex-wrap gap-2 mb-8 text-xs text-slate-400">
        <span className="self-center">Try:</span>
        {[["Aspirin", "Warfarin"], ["Metformin", "Ibuprofen"], ["Lisinopril", "Potassium"]].map(
          ([a, b]) => (
            <button
              key={`${a}-${b}`}
              onClick={() => {
                setMed1(a);
                setMed2(b);
              }}
              className="bg-white border border-slate-200 hover:border-amber-300 hover:text-amber-700 text-slate-500 px-2.5 py-1 rounded-full transition-all"
            >
              {a} + {b}
            </button>
          )
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-4/5" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Result */}
      {result && risk && !loading && (
        <div className={clsx("border rounded-2xl overflow-hidden shadow-sm", risk.border)}>
          {/* Risk level header */}
          <div className={clsx("px-6 py-4", risk.bg)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <risk.icon size={20} className={risk.text} />
                <span className={clsx("text-base font-bold", risk.text)}>{risk.label}</span>
              </div>
              <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full", risk.badge)}>
                {result.risk_level}
              </span>
            </div>
            {/* Risk bar */}
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div className={clsx("h-full rounded-full transition-all", risk.bar, risk.barWidth)} />
            </div>
          </div>

          {/* Medicines compared */}
          <div className="px-6 py-4 bg-white border-b border-slate-100">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                {result.medicine1}
              </span>
              <span className="text-slate-400 font-medium">+</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                {result.medicine2}
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div className="px-6 py-5 bg-white">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Explanation
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{result.explanation}</p>

            {result.recommendations && result.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Recommendations
                </h4>
                <ul className="space-y-1.5">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="mt-0.5 flex-shrink-0">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
