"use client";

import { useState } from "react";
import {
  getMedicine,
  flattenMedicine,
  recommend,
  checkInteraction,
  compareMedicines,
} from "@/lib/api";
import type {
  Medicine,
  InteractionResponse,
  CompareResponse,
  MedicineDetail,
} from "@/lib/api";
import MedicineCard from "@/components/MedicineCard";
import MarkdownContent from "@/components/MarkdownContent";
import {
  Pill,
  Stethoscope,
  AlertTriangle,
  GitCompare,
  Search,
  Loader2,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ArrowLeftRight,
} from "lucide-react";
import clsx from "clsx";

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "lookup",      label: "Medicine Lookup",  icon: Pill,          activeClass: "border-purple-600 text-purple-700", iconClass: "text-purple-500" },
  { id: "recommend",   label: "Symptom Advisor",  icon: Stethoscope,   activeClass: "border-teal-600 text-teal-700",     iconClass: "text-teal-500"   },
  { id: "interaction", label: "Drug Interaction", icon: AlertTriangle, activeClass: "border-amber-600 text-amber-700",   iconClass: "text-amber-500"  },
  { id: "compare",     label: "Compare",          icon: GitCompare,    activeClass: "border-rose-600 text-rose-700",     iconClass: "text-rose-500"   },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Shared: Interaction risk config ──────────────────────────────────────────

const RISK_CONFIG = {
  Low: {
    icon: ShieldCheck,
    bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500", barWidth: "w-1/4",
    label: "Low Risk",
  },
  Moderate: {
    icon: ShieldAlert,
    bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500", barWidth: "w-1/2",
    label: "Moderate Risk",
  },
  High: {
    icon: ShieldX,
    bg: "bg-red-50", border: "border-red-200", text: "text-red-700",
    badge: "bg-red-100 text-red-700", bar: "bg-red-500", barWidth: "w-full",
    label: "High Risk",
  },
};

function getRisk(level: string) {
  const key = Object.keys(RISK_CONFIG).find((k) =>
    level?.toLowerCase().includes(k.toLowerCase())
  ) as keyof typeof RISK_CONFIG | undefined;
  return RISK_CONFIG[key ?? "Moderate"];
}

// ── Shared: Compare helpers ───────────────────────────────────────────────────

function ComparisonRow({ label, val1, val2 }: { label: string; val1?: string | null; val2?: string | null }) {
  if (!val1 && !val2) return null;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start py-3 border-b border-slate-100 last:border-0">
      <p className="text-sm text-slate-600 leading-relaxed">{val1 ?? "—"}</p>
      <div className="flex flex-col items-center justify-start pt-1 gap-1">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{label}</span>
        <ArrowLeftRight size={12} className="text-slate-300" />
      </div>
      <p className="text-sm text-slate-600 leading-relaxed text-right">{val2 ?? "—"}</p>
    </div>
  );
}

function ListRow({ label, items1, items2 }: { label: string; items1?: string[]; items2?: string[] }) {
  if (!items1?.length && !items2?.length) return null;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start py-3 border-b border-slate-100 last:border-0">
      <p className="text-sm text-slate-600">{items1?.join(", ") || "—"}</p>
      <div className="flex flex-col items-center justify-start pt-1 gap-1">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{label}</span>
        <ArrowLeftRight size={12} className="text-slate-300" />
      </div>
      <p className="text-sm text-slate-600 text-right">{items2?.join(", ") || "—"}</p>
    </div>
  );
}

// ── Tab: Medicine Lookup ──────────────────────────────────────────────────────

const LOOKUP_EXAMPLES = ["Paracetamol", "Ibuprofen", "Metformin", "Amoxicillin", "Aspirin"];

function LookupTab() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(name?: string) {
    const n = (name ?? query).trim();
    if (!n) return;
    setLoading(true); setError(null); setResult(null);
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
    <div className="max-w-3xl mx-auto px-6 py-8">
      <p className="text-sm text-slate-500 mb-6">
        Search any medicine by name. CuraSense fetches live data via RAG and enriches it with AI.
      </p>

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
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Search
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-xs text-slate-400">Try:</span>
        {LOOKUP_EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => { setQuery(ex); lookup(ex); }}
            className="text-xs bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-700 text-slate-500 px-2.5 py-1 rounded-full transition-all"
          >
            {ex}
          </button>
        ))}
      </div>

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
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {result && !loading && <MedicineCard medicine={result} />}
    </div>
  );
}

// ── Tab: Symptom Advisor ──────────────────────────────────────────────────────

const SYMPTOM_EXAMPLES = [
  "fever and headache",
  "joint pain and inflammation",
  "acid reflux and heartburn",
  "mild anxiety and insomnia",
  "type 2 diabetes management",
];

function RecommendTab() {
  const [symptoms, setSymptoms] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function search(s?: string) {
    const sym = (s ?? symptoms).trim();
    if (!sym) return;
    setLoading(true); setError(null); setResults([]); setSearched(false);
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
    <div className="max-w-4xl mx-auto px-6 py-8">
      <p className="text-sm text-slate-500 mb-6">
        Describe your symptoms in plain language and get AI-ranked medicine recommendations with pros, cons, and safety information.
      </p>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-4">
        <label className="block text-sm font-medium text-slate-600 mb-2">Describe your symptoms</label>
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

      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-xs text-slate-400 self-center">Examples:</span>
        {SYMPTOM_EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => { setSymptoms(ex); search(ex); }}
            className="text-xs bg-white border border-slate-200 hover:border-teal-300 hover:text-teal-700 text-slate-500 px-3 py-1 rounded-full transition-all"
          >
            {ex}
          </button>
        ))}
      </div>

      {loading && [0, 1].map((i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-pulse mb-4">
          <div className="h-24 bg-teal-200/50" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      ))}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {searched && !loading && results.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">No recommendations found. Try rephrasing your symptoms.</div>
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

// ── Tab: Drug Interaction ─────────────────────────────────────────────────────

function InteractionTab() {
  const [med1, setMed1] = useState("");
  const [med2, setMed2] = useState("");
  const [result, setResult] = useState<InteractionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    if (!med1.trim() || !med2.trim()) return;
    setLoading(true); setError(null); setResult(null);
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
    <div className="max-w-2xl mx-auto px-6 py-8">
      <p className="text-sm text-slate-500 mb-6">
        Enter two medicine names to check for potential interaction risks, contraindications, and safety recommendations.
      </p>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-4">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Medicine 1</label>
            <input
              value={med1}
              onChange={(e) => setMed1(e.target.value)}
              placeholder="e.g. Aspirin"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Medicine 2</label>
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

      <div className="flex flex-wrap gap-2 mb-8 text-xs text-slate-400">
        <span className="self-center">Try:</span>
        {[["Aspirin", "Warfarin"], ["Metformin", "Ibuprofen"], ["Lisinopril", "Potassium"]].map(([a, b]) => (
          <button
            key={`${a}-${b}`}
            onClick={() => { setMed1(a); setMed2(b); }}
            className="bg-white border border-slate-200 hover:border-amber-300 hover:text-amber-700 text-slate-500 px-2.5 py-1 rounded-full transition-all"
          >
            {a} + {b}
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-4/5" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {result && risk && !loading && (
        <div className={clsx("border rounded-2xl overflow-hidden shadow-sm", risk.border)}>
          {/* Risk header */}
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
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div className={clsx("h-full rounded-full transition-all", risk.bar, risk.barWidth)} />
            </div>
          </div>

          {/* Medicines */}
          <div className="px-6 py-4 bg-white border-b border-slate-100">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{result.medicine1}</span>
              <span className="text-slate-400 font-medium">+</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{result.medicine2}</span>
            </div>
          </div>

          {/* Explanation — full markdown */}
          <div className="px-6 py-5 bg-white">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Explanation</h4>
            <MarkdownContent content={result.explanation} className="text-slate-700" />

            {result.recommendations && result.recommendations.length > 0 && (
              <div className="mt-5">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Recommendations</h4>
                <MarkdownContent
                  content={result.recommendations.map((r) => `- ${r}`).join("\n")}
                  className="text-slate-600"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Compare Medicines ────────────────────────────────────────────────────

function CompareTab() {
  const [med1, setMed1] = useState("");
  const [med2, setMed2] = useState("");
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function compare() {
    if (!med1.trim() || !med2.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await compareMedicines(med1.trim(), med2.trim());
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to compare medicines.");
    } finally {
      setLoading(false);
    }
  }

  const flat1 = result ? flattenMedicine(result.medicine_1 as MedicineDetail) : null;
  const flat2 = result ? flattenMedicine(result.medicine_2 as MedicineDetail) : null;
  const summary = result?.comparison_summary;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <p className="text-sm text-slate-500 mb-6">
        Side-by-side comparison of composition, dosage, price, safety scores, and more for any two medicines.
      </p>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-4">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Medicine 1</label>
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
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Medicine 2</label>
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

      <div className="flex flex-wrap gap-2 mb-8 text-xs text-slate-400">
        <span className="self-center">Try:</span>
        {[["Paracetamol", "Ibuprofen"], ["Metformin", "Glipizide"], ["Amoxicillin", "Azithromycin"]].map(([a, b]) => (
          <button
            key={`${a}-${b}`}
            onClick={() => { setMed1(a); setMed2(b); }}
            className="bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-700 text-slate-500 px-2.5 py-1 rounded-full transition-all"
          >
            {a} vs {b}
          </button>
        ))}
      </div>

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
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {result && flat1 && flat2 && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <MedicineCard medicine={flat1} variant="compact" />
            <MedicineCard medicine={flat2} variant="compact" />
          </div>

          {summary && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <GitCompare size={14} className="text-rose-500" />
                <h3 className="text-sm font-semibold text-slate-700">Detailed Comparison</h3>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 px-5 py-2.5 bg-slate-50/50 border-b border-slate-100">
                <p className="text-xs font-bold text-blue-600">{flat1.name}</p>
                <div className="w-20" />
                <p className="text-xs font-bold text-purple-600 text-right">{flat2.name}</p>
              </div>
              <div className="px-5">
                <ListRow label="Unique Ingredients" items1={summary.unique_to_med1} items2={summary.unique_to_med2} />
                <ListRow label="Common Ingredients" items1={summary.common_ingredients} items2={summary.common_ingredients} />
                <ListRow label="Common Uses" items1={summary.common_uses} items2={summary.common_uses} />
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
              {summary.safer_option && (
                <div className="px-5 py-3 border-t border-slate-100 bg-emerald-50/60">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Safer option: </span>
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MedicinePage() {
  const [activeTab, setActiveTab] = useState<TabId>("lookup");
  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky tab header */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="px-6 pt-5">
          <div className="flex items-center gap-2 mb-4">
            <activeTabMeta.icon size={20} className={activeTabMeta.iconClass} />
            <h1 className="text-xl font-bold text-slate-800">Medicine Hub</h1>
          </div>
          {/* Tab bar */}
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all",
                    active
                      ? tab.activeClass
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "lookup"      && <LookupTab />}
        {activeTab === "recommend"   && <RecommendTab />}
        {activeTab === "interaction" && <InteractionTab />}
        {activeTab === "compare"     && <CompareTab />}
      </div>
    </div>
  );
}
