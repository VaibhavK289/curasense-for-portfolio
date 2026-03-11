"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, ScanLine, Pill, Search, ArrowLeft, ArrowRight,
  Upload, Brain, CheckCircle2, Shield, Zap, Activity,
  BarChart3, History, UserCircle, Settings, HelpCircle,
  Sparkles, AlertTriangle, Eye, Layers, MessageCircle,
  Lock, FlaskConical, Microscope, HeartPulse,
  BookOpen, ChevronDown, Camera, Repeat,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GradientText } from "@/components/ui/aceternity";
import { Button } from "@/components/ui/button";
import {
  SpotlightCardV2,
  GradientTextV2,
  GlassCard,
  StaggerContainerV2,
  StaggerItemV2,
  AnimatedCounter,
  AuroraBackground,
  MorphingBlob,
} from "@/components/ui/premium-components";

/* ──────────────────────────────────────────────────
   SECTIONS & NAVIGATION
   ────────────────────────────────────────────────── */
const sections = [
  { id: "start",        label: "Get Started",     icon: Sparkles },
  { id: "prescription", label: "Prescriptions",   icon: FileText },
  { id: "imaging",      label: "Medical Imaging", icon: ScanLine },
  { id: "medicine",     label: "Medicine Hub",     icon: Pill },
  { id: "more",         label: "More",            icon: Settings },
  { id: "faq",          label: "FAQ",             icon: HelpCircle },
];

/* ──────────────────────────────────────────────────
   FAQ ACCORDION
   ────────────────────────────────────────────────── */
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard variant="subtle" hover className="!rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
      >
        <span className="font-medium text-[hsl(var(--foreground))] pr-4 text-[15px]">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed border-t border-[hsl(var(--border))] pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ──────────────────────────────────────────────────
   BENTO FEATURE CARD (with spotlight)
   ────────────────────────────────────────────────── */
function BentoCard({ icon: Icon, title, desc, gradient, href, span }: {
  icon: React.ElementType; title: string; desc: string;
  gradient: string; href?: string; span?: string;
}) {
  const inner = (
    <SpotlightCardV2 borderGlow className={`h-full ${span || ""}`}>
      <div className="p-6 sm:p-8 h-full flex flex-col">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">{title}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed flex-1">{desc}</p>
        {href && (
          <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--brand-primary))] group">
            Try it now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </SpotlightCardV2>
  );
  return href ? <Link href={href} className={span || ""}>{inner}</Link> : <div className={span || ""}>{inner}</div>;
}

/* ──────────────────────────────────────────────────
   STEP TIMELINE
   ────────────────────────────────────────────────── */
function Timeline({ steps }: { steps: { icon: React.ElementType; title: string; desc: string }[] }) {
  return (
    <StaggerContainerV2 className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-secondary))] to-transparent" />
      {steps.map((step, i) => (
        <StaggerItemV2 key={i}>
          <div className="relative flex gap-6 pb-10 last:pb-0">
            {/* Dot */}
            <div className="absolute -left-8 top-1 w-[30px] h-[30px] rounded-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--brand-primary))] flex items-center justify-center z-10">
              <span className="text-xs font-bold text-[hsl(var(--brand-primary))]">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 mb-1.5">
                <step.icon className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
                {step.title}
              </h4>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{step.desc}</p>
            </div>
          </div>
        </StaggerItemV2>
      ))}
    </StaggerContainerV2>
  );
}

/* ──────────────────────────────────────────────────
   CONTENT PANELS
   ────────────────────────────────────────────────── */
function StartPanel() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--brand-primary)/0.08)] to-[hsl(var(--brand-secondary)/0.05)] border border-[hsl(var(--brand-primary)/0.12)] p-8 sm:p-12">
        <MorphingBlob className="w-64 h-64 -top-20 -right-20 opacity-10" />
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mb-4 leading-tight">
            Welcome to{" "}
            <GradientTextV2 variant="brand">CuraSense</GradientTextV2>
          </h2>
          <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] leading-relaxed mb-8">
            Your AI-powered healthcare companion. Analyze prescriptions, scan medical images,
            and explore 50,000+ medications — all in seconds.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/diagnosis/prescription">
              <Button size="lg" className="gap-2 shadow-lg shadow-[hsl(var(--brand-primary)/0.2)]">
                <Sparkles className="w-5 h-5" /> Start Analyzing
              </Button>
            </Link>
            <Link href="/medicine/lookup">
              <Button variant="outline" size="lg" className="gap-2">
                <Search className="w-5 h-5" /> Medicine Lookup
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StaggerContainerV2 className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Zap, val: 30, suffix: "s", prefix: "<", label: "Analysis time" },
          { icon: Activity, val: 95, suffix: "%+", prefix: "", label: "Accuracy rate" },
          { icon: Pill, val: 50, suffix: "k+", prefix: "", label: "Medicines" },
          { icon: Shield, val: 100, suffix: "%", prefix: "", label: "Private & secure" },
        ].map((s) => (
          <StaggerItemV2 key={s.label}>
            <GlassCard variant="default" className="p-5 text-center">
              <s.icon className="w-6 h-6 mx-auto mb-3 text-[hsl(var(--brand-primary))]" />
              <div className="text-2xl font-bold text-[hsl(var(--foreground))]">
                {s.prefix}<AnimatedCounter value={s.val} />{s.suffix}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
            </GlassCard>
          </StaggerItemV2>
        ))}
      </StaggerContainerV2>

      {/* How it works */}
      <div>
        <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-10">How It Works</h3>
        <div className="max-w-lg">
          <Timeline steps={[
            { icon: Upload, title: "Upload Your Document", desc: "Drop a prescription PDF, lab report, X-ray image, or simply type your symptoms." },
            { icon: Brain, title: "AI Processes & Analyzes", desc: "Specialized healthcare AI models process your input — medical NER, vision analysis, and clinical reasoning engines." },
            { icon: CheckCircle2, title: "Get Detailed Insights", desc: "Comprehensive report with findings, recommendations, drug interactions, and safety alerts." },
          ]} />
        </div>
      </div>

      {/* Quick Launch */}
      <div>
        <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-8">Jump Right In</h3>
        <div className="grid sm:grid-cols-3 gap-5">
          <BentoCard icon={FileText} title="Prescriptions" desc="Upload a PDF for comprehensive AI analysis of medications and dosages." gradient="from-blue-500 to-indigo-600" href="/diagnosis/prescription" />
          <BentoCard icon={ScanLine} title="Medical Imaging" desc="Analyze X-rays, CT scans, and MRIs with advanced vision AI." gradient="from-violet-500 to-purple-600" href="/diagnosis/xray" />
          <BentoCard icon={Search} title="Medicine Lookup" desc="Search any medication for dosage, side effects, and interactions." gradient="from-emerald-500 to-teal-600" href="/medicine/lookup" />
        </div>
      </div>
    </div>
  );
}

function PrescriptionPanel() {
  return (
    <div className="space-y-16">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">Prescription Analysis</h2>
        <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          Upload any medical document and let AI extract medications, verify dosages,
          and flag potential drug interactions — automatically.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Timeline */}
        <div>
          <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-8">Step-by-Step</h3>
          <Timeline steps={[
            { icon: FileText, title: "Navigate to Analysis", desc: "Click 'Prescription Analysis' from the dashboard or sidebar." },
            { icon: Upload, title: "Upload or Type", desc: "Drag & drop a PDF (up to 10MB), or switch to text mode to type/paste symptoms directly." },
            { icon: Brain, title: "AI Processing", desc: "CrewAI medical agents analyze using Named Entity Recognition, drug databases, and clinical reasoning." },
            { icon: CheckCircle2, title: "Review & Save", desc: "Get medications, dosages, interactions, side effects, and personalized recommendations." },
          ]} />
        </div>

        {/* Right: Info cards */}
        <div className="space-y-6">
          <SpotlightCardV2 borderGlow>
            <div className="p-6">
              <h4 className="font-semibold text-[hsl(var(--foreground))] mb-4">Supported Documents</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: FileText, label: "Prescriptions" },
                  { icon: FlaskConical, label: "Lab Reports" },
                  { icon: Microscope, label: "Blood Tests" },
                  { icon: HeartPulse, label: "ECG Reports" },
                  { icon: BookOpen, label: "Discharge Summaries" },
                ].map((d) => (
                  <span key={d.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--muted))] text-xs text-[hsl(var(--foreground))]">
                    <d.icon className="w-3.5 h-3.5 text-[hsl(var(--brand-primary))]" />
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </SpotlightCardV2>

          <GlassCard variant="subtle" className="p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-5 h-5 text-[hsl(var(--brand-primary))] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[hsl(var(--foreground))] text-sm mb-1">Pro Tip</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Upload clear, high-resolution scans for best results. The AI handles handwritten prescriptions but performs best with typed documents.
                </p>
              </div>
            </div>
          </GlassCard>

          <Link href="/diagnosis/prescription">
            <Button size="lg" className="w-full gap-2 shadow-lg shadow-[hsl(var(--brand-primary)/0.15)]">
              <FileText className="w-5 h-5" /> Try Prescription Analysis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ImagingPanel() {
  return (
    <div className="space-y-16">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">Medical Imaging AI</h2>
        <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          Advanced vision models powered by Google Gemini analyze X-rays, CT scans, and MRIs — detecting abnormalities and generating detailed findings.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-8">How to Analyze</h3>
          <Timeline steps={[
            { icon: ScanLine, title: "Open Medical Imaging", desc: "Navigate to Diagnosis → X-Ray Analysis from the sidebar." },
            { icon: Upload, title: "Upload Your Scan", desc: "Drop an X-ray, CT scan, or MRI in JPG, PNG, or DICOM format." },
            { icon: Eye, title: "AI Vision Analysis", desc: "Google Gemini examines for abnormalities, anatomical structures, and clinical findings." },
            { icon: CheckCircle2, title: "Findings Report", desc: "Structured report with identified findings, severity, and follow-up recommendations." },
          ]} />
        </div>

        <div className="space-y-6">
          <SpotlightCardV2 borderGlow>
            <div className="p-6">
              <h4 className="font-semibold text-[hsl(var(--foreground))] mb-4">Supported Formats</h4>
              <div className="flex gap-3">
                {["JPG / JPEG", "PNG", "DICOM"].map((f) => (
                  <span key={f} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--muted))] text-sm text-[hsl(var(--foreground))] font-mono">
                    <Camera className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </SpotlightCardV2>

          <GlassCard variant="subtle" className="p-6 !border-[hsl(var(--color-warning)/0.2)]">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--color-warning))] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[hsl(var(--foreground))] text-sm mb-1">Important Disclaimer</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  AI imaging analysis is assistive and does not replace professional radiological interpretation. Always consult a qualified healthcare professional.
                </p>
              </div>
            </div>
          </GlassCard>

          <Link href="/diagnosis/xray">
            <Button size="lg" className="w-full gap-2 shadow-lg shadow-[hsl(var(--brand-primary)/0.15)]">
              <ScanLine className="w-5 h-5" /> Try Medical Imaging
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MedicinePanel() {
  return (
    <div className="space-y-16">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">Medicine Hub</h2>
        <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          A comprehensive intelligence platform for 50,000+ medications.
          Search, compare, check interactions, and get AI recommendations.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <BentoCard icon={Search}        title="Medicine Lookup"     desc="Search any medicine by name. Get dosage, uses, side effects, contraindications and warnings." gradient="from-emerald-500 to-teal-600" href="/medicine/lookup" />
        <BentoCard icon={Layers}        title="Compare Medicines"   desc="Side-by-side comparison of two medications — effectiveness, side effects, and alternatives." gradient="from-blue-500 to-indigo-600" href="/medicine/compare" />
        <BentoCard icon={AlertTriangle} title="Interaction Checker" desc="Check if your medicines can be taken together safely. See severity levels and explanations." gradient="from-rose-500 to-pink-600" href="/medicine/interactions" />
        <BentoCard icon={MessageCircle} title="AI Advisor"          desc="Describe your symptoms and get AI-recommended medications with detailed explanations." gradient="from-violet-500 to-purple-600" href="/medicine/advisor" />
        <BentoCard icon={Camera}        title="Medicine Scanner"    desc="Scan a medicine package using your camera for instant identification and information." gradient="from-amber-500 to-orange-600" href="/medicine/scanner" />
      </div>

      <GlassCard variant="subtle" className="p-6 !border-[hsl(var(--accent-rose)/0.15)]">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-[hsl(var(--accent-rose))] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-[hsl(var(--foreground))] text-sm mb-1">Always Check Interactions</h4>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              Before starting a new medication, use the Interaction Checker — especially if you take multiple prescriptions.
              The system shows severity levels (mild, moderate, severe) for each identified interaction.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function MorePanel() {
  return (
    <div className="space-y-16">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">More Features</h2>
        <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          Reports, analytics, account management, and everything else CuraSense offers.
        </p>
      </div>

      {/* Reports & Analytics Bento */}
      <div>
        <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-8">Reports & Analytics</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <BentoCard icon={FileText}  title="Saved Reports"       desc="Every analysis is saved automatically. Revisit any past report from the Reports page." gradient="from-amber-500 to-orange-600" href="/reports" />
          <BentoCard icon={History}   title="Activity History"    desc="Chronological timeline of all your activities — analyses, searches, and scans." gradient="from-cyan-500 to-blue-600" href="/history" />
          <BentoCard icon={BarChart3} title="Analytics Dashboard" desc="Visual charts — total analyses, accuracy trends, most-used features, and weekly activity." gradient="from-violet-500 to-purple-600" href="/analytics" />
          <BentoCard icon={Zap}       title="Real-Time Updates"   desc="Analytics update instantly as you use CuraSense. Track your healthcare journey over time." gradient="from-emerald-500 to-teal-600" />
        </div>
      </div>

      {/* Account Comparison */}
      <div>
        <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-8">Account & Security</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <SpotlightCardV2 borderGlow>
            <div className="p-6 sm:p-8">
              <h4 className="font-semibold text-[hsl(var(--foreground))] mb-5 flex items-center gap-2 text-lg">
                <UserCircle className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                Guest Mode
              </h4>
              <ul className="space-y-4 text-sm text-[hsl(var(--muted-foreground))]">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[hsl(var(--color-success))]" /> Full feature access — no sign-up</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[hsl(var(--color-success))]" /> Instant AI analysis</li>
                <li className="flex items-center gap-3"><AlertTriangle className="w-4 h-4 text-[hsl(var(--color-warning))]" /> Data stored locally only</li>
                <li className="flex items-center gap-3"><AlertTriangle className="w-4 h-4 text-[hsl(var(--color-warning))]" /> Lost on browser clear</li>
              </ul>
            </div>
          </SpotlightCardV2>

          <SpotlightCardV2 borderGlow spotlightColor="hsl(var(--brand-primary))">
            <div className="p-6 sm:p-8">
              <h4 className="font-semibold text-[hsl(var(--foreground))] mb-5 flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-[hsl(var(--brand-primary))]" />
                Registered Account
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[hsl(var(--brand-primary))] text-white font-bold ml-auto">RECOMMENDED</span>
              </h4>
              <ul className="space-y-4 text-sm text-[hsl(var(--muted-foreground))]">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[hsl(var(--color-success))]" /> Persistent report history</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[hsl(var(--color-success))]" /> Analytics & trend tracking</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[hsl(var(--color-success))]" /> Cross-device access</li>
                <li className="flex items-center gap-3"><Lock className="w-4 h-4 text-[hsl(var(--color-success))]" /> JWT auth + encrypted storage</li>
              </ul>
            </div>
          </SpotlightCardV2>
        </div>
      </div>
    </div>
  );
}

function FAQPanel() {
  const faqs = [
    { q: "How accurate is the AI analysis?", a: "Our models achieve over 95% accuracy in document parsing. The prescription analyzer uses CrewAI with multiple specialized agents, and imaging uses Google Gemini vision. Results should always be verified by healthcare professionals." },
    { q: "What file formats are supported?", a: "Prescriptions & lab reports: PDF (up to 10MB). Medical imaging: JPG, PNG, DICOM. You can also type symptoms as text for quick AI diagnosis." },
    { q: "Is my medical data secure?", a: "All data is processed with end-to-end encryption. Documents are analyzed in-session and never stored permanently on servers. Each session is isolated. We follow HIPAA-compliant practices." },
    { q: "Can I use CuraSense for medical decisions?", a: "CuraSense is an informational and assistive tool only. Always consult qualified healthcare professionals before making medical decisions." },
    { q: "Do I need an account?", a: "No! Guest Mode gives full access without signing up. A free account adds persistent history, analytics, and cross-device access." },
    { q: "How long does analysis take?", a: "Most analyses complete in under 30 seconds. Prescriptions take 15-20s, imaging 20-30s. A real-time progress indicator shows status." },
    { q: "Can I check drug interactions?", a: "Yes! Go to Medicine Hub → Interactions. Add 2+ medications and the system checks against a comprehensive database, showing severity levels (mild, moderate, severe)." },
    { q: "Is CuraSense free?", a: "Yes, completely free. All features — prescription analysis, imaging, medicine lookup, interactions, AI recommendations — are available at no cost." },
    { q: "What makes CuraSense different?", a: "CuraSense combines CrewAI diagnosis, Google Gemini vision, and sentence transformers for medicine similarity into one unified platform — with zero permanent data storage for maximum privacy." },
    { q: "How do I report a bug?", a: "Use 'Contact Support' on the Help page, or the AI Chat Assistant available throughout the app." },
  ];

  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          Everything you need to know about CuraSense.
        </p>
      </div>
      <div className="max-w-2xl space-y-4">
        {faqs.map((faq, i) => <FAQ key={i} q={faq.q} a={faq.a} />)}
      </div>
    </div>
  );
}

const panels: Record<string, () => React.JSX.Element> = {
  start: StartPanel, prescription: PrescriptionPanel, imaging: ImagingPanel,
  medicine: MedicinePanel, more: MorePanel, faq: FAQPanel,
};

/* ──────────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────────── */
export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("start");
  const ActivePanel = panels[activeTab];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative overflow-hidden">
      {/* Aurora BG */}
      <AuroraBackground intensity="subtle" />

      <div className="relative z-10">
        {/* ── HEADER ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Help
          </Link>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">
              <GradientText>User Guide</GradientText>
            </h1>
            <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl leading-relaxed">
              Everything you need to master CuraSense&apos;s AI-powered healthcare tools.
            </p>
          </motion.div>
        </div>

        {/* ── TAB BAR ── */}
        <div className="sticky top-0 z-30 bg-[hsl(var(--background)/0.85)] backdrop-blur-xl border-b border-[hsl(var(--border))]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {sections.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                      isActive
                        ? "text-[hsl(var(--foreground))]"
                        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="docTab"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ActivePanel />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── FOOTER ── */}
        <div className="border-t border-[hsl(var(--border))]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
              CuraSense — AI-Powered Healthcare Assistant. For informational purposes only. Always consult a healthcare professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
