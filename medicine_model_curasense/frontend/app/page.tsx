import Link from "next/link";
import { MessageCircle, LayoutGrid, ArrowRight, Pill, Stethoscope, AlertTriangle, GitCompare } from "lucide-react";

const features = [
  {
    href: "/chat",
    icon: MessageCircle,
    light: "bg-blue-50",
    text: "text-blue-700",
    title: "AI Chat",
    description:
      "Ask anything about medicines, symptoms, or health. CuraSense uses Gemini AI with session memory to give fully formatted, context-aware answers.",
    subFeatures: [] as string[],
  },
  {
    href: "/medicine",
    icon: LayoutGrid,
    light: "bg-purple-50",
    text: "text-purple-700",
    title: "Medicine Hub",
    description:
      "All medicine tools in one place — search by name, get symptom-based recommendations, check drug interactions, and compare two medicines side by side.",
    subFeatures: ["Medicine Lookup", "Symptom Advisor", "Drug Interaction", "Compare Medicines"],
  },
];

const subIcons = [Pill, Stethoscope, AlertTriangle, GitCompare];
const subColors = ["text-purple-500", "text-teal-500", "text-amber-500", "text-rose-500"];

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          Powered by Gemini 2.5 Flash
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-3 leading-tight">
          Medicine Intelligence,
          <br />
          <span className="text-blue-600">Reimagined with AI</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          CuraSense brings together RAG-powered medicine lookup, AI-driven recommendations,
          drug interaction analysis, and conversational health assistance — all in one place.
        </p>
        <p className="mt-3 text-xs text-amber-600 font-medium bg-amber-50 inline-block px-3 py-1.5 rounded-lg">
          For informational purposes only. Always consult a licensed healthcare professional.
        </p>
      </div>

      {/* Feature cards — 2 sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map(({ href, icon: Icon, light, text, title, description, subFeatures }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
          >
            <div className={`inline-flex items-center justify-center w-11 h-11 ${light} rounded-xl mb-4`}>
              <Icon className={text} size={22} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">{title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-1">{description}</p>

            {subFeatures.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-5">
                {subFeatures.map((label, i) => {
                  const SubIcon = subIcons[i];
                  return (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg px-2.5 py-1.5"
                    >
                      <SubIcon size={12} className={subColors[i]} />
                      {label}
                    </div>
                  );
                })}
              </div>
            )}

            <div className={`flex items-center gap-1 text-xs font-semibold ${text}`}>
              Get started{" "}
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
