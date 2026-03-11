"use client";

// ============================================
// CURASENSE MEDICINE HUB — Premium Dashboard
// World-class Healthcare Design System
// Multi-layered visual experience
// 5 UX features: Autocomplete, Categories,
// Activity Feed, Emergency Card, Batch Matrix
// ============================================

import { useState, useEffect, useCallback, useRef, useMemo, type FormEvent } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Pill,
  Search,
  Stethoscope,
  AlertTriangle,
  GitCompare,
  ArrowRight,
  Lightbulb,
  Plus,
  X,
  Package,
  Zap,
  ChevronRight,
  ChevronDown,
  Camera,
  Sparkles,
  Shield,
  TrendingUp,
  Heart,
  Activity,
  Clock,
  Eye,
  Copy,
  Check,
  Printer,
  FileText,
  Grid3X3,
  Loader2,
  HeartPulse,
  Brain,
  Droplets,
  Bug,
  Flower2,
  CircleDot,
  Beaker,
  Tablets,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GradientText,
  GridPattern,
  FloatingOrb,
  HeartbeatDivider,
  PulsingDot,
  SpotlightCard,
} from "@/components/ui/aceternity";
import {
  AuroraBackground,
  GlowOrb,
  SpotlightCardV2,
  ParallaxContainer,
  AnimatedCounter,
  MorphingBlob,
  AnimatedDivider,
} from "@/components/ui/premium-components";
import {
  springPresets,
  animationVariants,
  staggerConfig,
  gestureConfig,
} from "@/styles/tokens/animations";
import { useRouter } from "next/navigation";
import {
  getCabinet,
  addToCabinet,
  removeFromCabinet,
  getRecentSearches,
  getActivities,
  type CabinetMedicine,
  type Activity as ActivityItem,
} from "@/lib/medicine-cabinet";
import { checkInteraction } from "@/lib/api";
import type { InteractionResponse } from "@/lib/medicine-types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FeatureCardConfig {
  id: string;
  title: string;
  description: string;
  subtitle: string;
  icon: typeof Pill;
  route: string;
  colorKey: string;
  stats: string;
}

interface FeatureColorMap {
  iconBg: string;
  iconBgSolid: string;
  iconText: string;
  hoverBorder: string;
  hoverShadow: string;
  gradientFrom: string;
  gradientTo: string;
  accentGlow: string;
  actionText: string;
  pillBg: string;
  pillText: string;
  dotColor: string;
}

// ─── Static Color Class Map ──────────────────────────────────────────────────

const FEATURE_COLORS: Record<string, FeatureColorMap> = {
  medicine: {
    iconBg: "bg-[hsl(var(--color-medicine)/0.12)]",
    iconBgSolid: "bg-gradient-to-br from-[hsl(var(--color-medicine))] to-[hsl(var(--color-medicine-glow))]",
    iconText: "text-[hsl(var(--color-medicine))]",
    hoverBorder: "group-hover:border-[hsl(var(--color-medicine)/0.4)]",
    hoverShadow: "group-hover:shadow-[0_20px_60px_-12px_hsl(var(--color-medicine)/0.2)]",
    gradientFrom: "from-[hsl(var(--color-medicine)/0.06)]",
    gradientTo: "to-transparent",
    accentGlow: "bg-[hsl(var(--color-medicine)/0.08)]",
    actionText: "text-[hsl(var(--color-medicine))]",
    pillBg: "bg-[hsl(var(--color-medicine)/0.08)]",
    pillText: "text-[hsl(var(--color-medicine))]",
    dotColor: "bg-[hsl(var(--color-medicine))]",
  },
  primary: {
    iconBg: "bg-[hsl(var(--brand-primary)/0.12)]",
    iconBgSolid: "bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-primary-light))]",
    iconText: "text-[hsl(var(--brand-primary))]",
    hoverBorder: "group-hover:border-[hsl(var(--brand-primary)/0.4)]",
    hoverShadow: "group-hover:shadow-[0_20px_60px_-12px_hsl(var(--brand-primary)/0.2)]",
    gradientFrom: "from-[hsl(var(--brand-primary)/0.06)]",
    gradientTo: "to-transparent",
    accentGlow: "bg-[hsl(var(--brand-primary)/0.08)]",
    actionText: "text-[hsl(var(--brand-primary))]",
    pillBg: "bg-[hsl(var(--brand-primary)/0.08)]",
    pillText: "text-[hsl(var(--brand-primary))]",
    dotColor: "bg-[hsl(var(--brand-primary))]",
  },
  warning: {
    iconBg: "bg-[hsl(var(--color-warning)/0.12)]",
    iconBgSolid: "bg-gradient-to-br from-[hsl(var(--color-warning))] to-[hsl(var(--color-warning-vibrant))]",
    iconText: "text-[hsl(var(--color-warning))]",
    hoverBorder: "group-hover:border-[hsl(var(--color-warning)/0.4)]",
    hoverShadow: "group-hover:shadow-[0_20px_60px_-12px_hsl(var(--color-warning)/0.2)]",
    gradientFrom: "from-[hsl(var(--color-warning)/0.06)]",
    gradientTo: "to-transparent",
    accentGlow: "bg-[hsl(var(--color-warning)/0.08)]",
    actionText: "text-[hsl(var(--color-warning))]",
    pillBg: "bg-[hsl(var(--color-warning)/0.08)]",
    pillText: "text-[hsl(var(--color-warning))]",
    dotColor: "bg-[hsl(var(--color-warning))]",
  },
  secondary: {
    iconBg: "bg-[hsl(var(--brand-secondary)/0.12)]",
    iconBgSolid: "bg-gradient-to-br from-[hsl(var(--brand-secondary))] to-[hsl(var(--brand-secondary-light))]",
    iconText: "text-[hsl(var(--brand-secondary))]",
    hoverBorder: "group-hover:border-[hsl(var(--brand-secondary)/0.4)]",
    hoverShadow: "group-hover:shadow-[0_20px_60px_-12px_hsl(var(--brand-secondary)/0.2)]",
    gradientFrom: "from-[hsl(var(--brand-secondary)/0.06)]",
    gradientTo: "to-transparent",
    accentGlow: "bg-[hsl(var(--brand-secondary)/0.08)]",
    actionText: "text-[hsl(var(--brand-secondary))]",
    pillBg: "bg-[hsl(var(--brand-secondary)/0.08)]",
    pillText: "text-[hsl(var(--brand-secondary))]",
    dotColor: "bg-[hsl(var(--brand-secondary))]",
  },
  info: {
    iconBg: "bg-[hsl(var(--color-info)/0.12)]",
    iconBgSolid: "bg-gradient-to-br from-[hsl(var(--color-info))] to-[hsl(var(--color-info-vibrant))]",
    iconText: "text-[hsl(var(--color-info))]",
    hoverBorder: "group-hover:border-[hsl(var(--color-info)/0.4)]",
    hoverShadow: "group-hover:shadow-[0_20px_60px_-12px_hsl(var(--color-info)/0.2)]",
    gradientFrom: "from-[hsl(var(--color-info)/0.06)]",
    gradientTo: "to-transparent",
    accentGlow: "bg-[hsl(var(--color-info)/0.08)]",
    actionText: "text-[hsl(var(--color-info))]",
    pillBg: "bg-[hsl(var(--color-info)/0.08)]",
    pillText: "text-[hsl(var(--color-info))]",
    dotColor: "bg-[hsl(var(--color-info))]",
  },
};

// ─── Feature Card Configs ────────────────────────────────────────────────────

const FEATURE_CARDS: FeatureCardConfig[] = [
  {
    id: "lookup",
    title: "Medicine Lookup",
    subtitle: "Instant Intelligence",
    description:
      "Search any medicine for comprehensive AI-powered insights — dosage, side effects, interactions, and safety analysis.",
    icon: Search,
    route: "/medicine/lookup",
    colorKey: "medicine",
    stats: "10,000+ medicines",
  },
  {
    id: "advisor",
    title: "Symptom Advisor",
    subtitle: "AI Recommendations",
    description:
      "Describe your symptoms naturally and receive personalized medicine recommendations with safety profiles.",
    icon: Stethoscope,
    route: "/medicine/advisor",
    colorKey: "primary",
    stats: "Smart matching",
  },
  {
    id: "interactions",
    title: "Drug Interactions",
    subtitle: "Safety Analysis",
    description:
      "Check if medicines can be safely combined. Get severity ratings, clinical guidance, and safer alternatives.",
    icon: AlertTriangle,
    route: "/medicine/interactions",
    colorKey: "warning",
    stats: "Risk detection",
  },
  {
    id: "compare",
    title: "Compare Medicines",
    subtitle: "Side-by-Side Analysis",
    description:
      "Compare effectiveness, safety profiles, cost, and suitability of medicines with AI-generated insights.",
    icon: GitCompare,
    route: "/medicine/compare",
    colorKey: "secondary",
    stats: "Deep comparison",
  },
  {
    id: "scanner",
    title: "Medicine Scanner",
    subtitle: "Vision AI",
    description:
      "Upload a photo of any medicine packaging and get instant AI identification, composition analysis, and safety data.",
    icon: Camera,
    route: "/medicine/scanner",
    colorKey: "info",
    stats: "Image recognition",
  },
];

// ─── Bento Grid Classes ──────────────────────────────────────────────────────

const GRID_SPANS: Record<string, string> = {
  lookup: "lg:col-span-7",
  advisor: "lg:col-span-5",
  interactions: "lg:col-span-5",
  compare: "lg:col-span-7",
  scanner: "lg:col-span-12",
};

// ─── Popular & Common Medicines (for autocomplete) ───────────────────────────

const POPULAR_MEDICINES = [
  "Paracetamol",
  "Ibuprofen",
  "Metformin",
  "Aspirin",
  "Amoxicillin",
  "Omeprazole",
];

const COMMON_MEDICINES = [
  "Paracetamol", "Ibuprofen", "Aspirin", "Metformin", "Amoxicillin",
  "Azithromycin", "Omeprazole", "Pantoprazole", "Cetirizine", "Loratadine",
  "Dolo 650", "Crocin", "Combiflam", "Calpol", "Saridon",
  "Atorvastatin", "Rosuvastatin", "Amlodipine", "Losartan", "Telmisartan",
  "Metoprolol", "Atenolol", "Lisinopril", "Ramipril", "Enalapril",
  "Ciprofloxacin", "Doxycycline", "Cephalexin", "Clindamycin", "Fluconazole",
  "Diclofenac", "Naproxen", "Tramadol", "Gabapentin", "Pregabalin",
  "Montelukast", "Salbutamol", "Levothyroxine", "Prednisone", "Dexamethasone",
  "Warfarin", "Clopidogrel", "Ranitidine", "Famotidine", "Domperidone",
  "Ondansetron", "Metoclopramide", "Glimepiride", "Sitagliptin", "Insulin",
];

// ─── Stats ───────────────────────────────────────────────────────────────────

const HERO_STATS = [
  { value: 10000, suffix: "+", label: "Medicines", icon: Pill },
  { value: 99, suffix: "%", label: "Accuracy", icon: Shield },
  { value: 500, suffix: "+", label: "Interactions", icon: Activity },
  { value: 24, suffix: "/7", label: "Available", icon: Heart },
];

// ─── Health Tips ─────────────────────────────────────────────────────────────

const HEALTH_TIPS = [
  "Always complete your full course of antibiotics, even if you feel better early. Stopping mid-course can contribute to antibiotic resistance.",
  "Store medicines in a cool, dry place away from direct sunlight. Bathrooms are often too humid for proper medication storage.",
  "Take medicines at the same time each day to maintain consistent blood levels and maximize their effectiveness.",
  "Never crush or split extended-release tablets unless your pharmacist confirms it is safe — it can cause dangerous dose-dumping.",
  "Keep an updated list of all your medications, including over-the-counter drugs and supplements, to share with every healthcare provider.",
  "Grapefruit and grapefruit juice can interact with many common medications, including statins and blood pressure drugs.",
  "Do not take expired medications. Chemical changes over time can reduce effectiveness or create harmful byproducts.",
  "If you experience unexpected side effects, contact your healthcare provider rather than abruptly stopping the medication.",
  "Drink a full glass of water when taking oral medications to help absorption and reduce the risk of esophageal irritation.",
  "Some medications need to be taken with food, while others work best on an empty stomach. Always check your prescription label.",
  "Avoid alcohol when taking pain relievers like acetaminophen (paracetamol) — the combination can cause serious liver damage.",
  "Keep all medications out of reach of children. Use child-resistant packaging and store them in locked cabinets when possible.",
  "Eye drops and ear drops expire faster once opened. Check the packaging for the post-opening shelf life, often 28 days.",
  "If you miss a dose, take it as soon as you remember — unless it is almost time for your next dose. Never double up.",
  "Herbal supplements can interact with prescription medications. Always inform your doctor about everything you take.",
];

// ─── Medicine Categories ─────────────────────────────────────────────────────

interface MedicineCategory {
  name: string;
  icon: typeof Pill;
  color: string;
  symptoms: string;
  examples: string[];
}

const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string; hoverBg: string; border: string }> = {
  medicine: {
    bg: "bg-[hsl(var(--color-medicine)/0.08)]",
    text: "text-[hsl(var(--color-medicine))]",
    hoverBg: "hover:bg-[hsl(var(--color-medicine)/0.12)]",
    border: "border-[hsl(var(--color-medicine)/0.15)]",
  },
  primary: {
    bg: "bg-[hsl(var(--brand-primary)/0.08)]",
    text: "text-[hsl(var(--brand-primary))]",
    hoverBg: "hover:bg-[hsl(var(--brand-primary)/0.12)]",
    border: "border-[hsl(var(--brand-primary)/0.15)]",
  },
  warning: {
    bg: "bg-[hsl(var(--color-warning)/0.08)]",
    text: "text-[hsl(var(--color-warning))]",
    hoverBg: "hover:bg-[hsl(var(--color-warning)/0.12)]",
    border: "border-[hsl(var(--color-warning)/0.15)]",
  },
  secondary: {
    bg: "bg-[hsl(var(--brand-secondary)/0.08)]",
    text: "text-[hsl(var(--brand-secondary))]",
    hoverBg: "hover:bg-[hsl(var(--brand-secondary)/0.12)]",
    border: "border-[hsl(var(--brand-secondary)/0.15)]",
  },
  info: {
    bg: "bg-[hsl(var(--color-info)/0.08)]",
    text: "text-[hsl(var(--color-info))]",
    hoverBg: "hover:bg-[hsl(var(--color-info)/0.12)]",
    border: "border-[hsl(var(--color-info)/0.15)]",
  },
  error: {
    bg: "bg-[hsl(var(--color-error)/0.08)]",
    text: "text-[hsl(var(--color-error))]",
    hoverBg: "hover:bg-[hsl(var(--color-error)/0.12)]",
    border: "border-[hsl(var(--color-error)/0.15)]",
  },
  success: {
    bg: "bg-[hsl(var(--color-success)/0.08)]",
    text: "text-[hsl(var(--color-success))]",
    hoverBg: "hover:bg-[hsl(var(--color-success)/0.12)]",
    border: "border-[hsl(var(--color-success)/0.15)]",
  },
};

const MEDICINE_CATEGORIES: MedicineCategory[] = [
  {
    name: "Pain Relief",
    icon: HeartPulse,
    color: "error",
    symptoms: "headache, body pain, fever",
    examples: ["Paracetamol", "Ibuprofen", "Aspirin"],
  },
  {
    name: "Diabetes",
    icon: Droplets,
    color: "primary",
    symptoms: "high blood sugar, diabetes management",
    examples: ["Metformin", "Glimepiride", "Sitagliptin"],
  },
  {
    name: "Blood Pressure",
    icon: Activity,
    color: "warning",
    symptoms: "high blood pressure, hypertension",
    examples: ["Amlodipine", "Losartan", "Telmisartan"],
  },
  {
    name: "Antibiotics",
    icon: Bug,
    color: "success",
    symptoms: "bacterial infection, fever with infection",
    examples: ["Amoxicillin", "Azithromycin", "Ciprofloxacin"],
  },
  {
    name: "Allergies",
    icon: Flower2,
    color: "secondary",
    symptoms: "sneezing, runny nose, allergic reaction",
    examples: ["Cetirizine", "Loratadine", "Montelukast"],
  },
  {
    name: "Heart Health",
    icon: Heart,
    color: "error",
    symptoms: "cholesterol, heart disease prevention",
    examples: ["Atorvastatin", "Clopidogrel", "Metoprolol"],
  },
  {
    name: "Stomach & Digestion",
    icon: CircleDot,
    color: "medicine",
    symptoms: "acidity, acid reflux, nausea",
    examples: ["Omeprazole", "Pantoprazole", "Domperidone"],
  },
  {
    name: "Mental Health",
    icon: Brain,
    color: "info",
    symptoms: "anxiety, insomnia, nerve pain",
    examples: ["Gabapentin", "Pregabalin", "Dexamethasone"],
  },
];

// ─── Activity Type Config ────────────────────────────────────────────────────

const ACTIVITY_TYPE_MAP: Record<string, { icon: typeof Pill; label: string; color: string; route: string }> = {
  lookup: { icon: Search, label: "Looked up", color: "medicine", route: "/medicine/lookup?q=" },
  advisor: { icon: Stethoscope, label: "Symptoms", color: "primary", route: "/medicine/advisor?symptoms=" },
  interaction: { icon: AlertTriangle, label: "Interaction", color: "warning", route: "/medicine/interactions" },
  compare: { icon: GitCompare, label: "Compared", color: "secondary", route: "/medicine/compare" },
  scan: { icon: Camera, label: "Scanned", color: "info", route: "/medicine/lookup?q=" },
};

// ─── Risk Level Color Map ────────────────────────────────────────────────────

const RISK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Low: {
    bg: "bg-[hsl(var(--color-success)/0.1)]",
    text: "text-[hsl(var(--color-success))]",
    border: "border-[hsl(var(--color-success)/0.3)]",
  },
  Moderate: {
    bg: "bg-[hsl(var(--color-warning)/0.1)]",
    text: "text-[hsl(var(--color-warning))]",
    border: "border-[hsl(var(--color-warning)/0.3)]",
  },
  High: {
    bg: "bg-[hsl(var(--color-error)/0.1)]",
    text: "text-[hsl(var(--color-error))]",
    border: "border-[hsl(var(--color-error)/0.3)]",
  },
  Unknown: {
    bg: "bg-[hsl(var(--muted)/0.5)]",
    text: "text-[hsl(var(--muted-foreground))]",
    border: "border-[hsl(var(--border))]",
  },
};

// ─── Helper: relative time ───────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function MedicineHubPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [cabinet, setCabinet] = useState<CabinetMedicine[]>([]);
  const [cabinetInput, setCabinetInput] = useState("");
  const [mounted, setMounted] = useState(false);

  // Autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Activities
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Emergency card
  const [showEmergencyCard, setShowEmergencyCard] = useState(false);
  const [copiedEmergency, setCopiedEmergency] = useState(false);

  // Batch interaction matrix
  const [matrixResults, setMatrixResults] = useState<Map<string, InteractionResponse>>(new Map());
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);

  // Scroll-linked hero parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  // SSR-safe load
  useEffect(() => {
    setMounted(true);
    setCabinet(getCabinet());
    setActivities(getActivities());
  }, []);

  const todayTip = HEALTH_TIPS[new Date().getDate() % HEALTH_TIPS.length];

  // ── Autocomplete suggestions ─────────────────────────────────────────────

  const autocompleSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 1) return [];

    const results: { label: string; source: string }[] = [];

    // Cabinet items
    for (const med of cabinet) {
      if (med.name.toLowerCase().includes(q) && results.length < 8) {
        results.push({ label: med.name, source: "cabinet" });
      }
    }

    // Recent searches
    if (mounted) {
      const recent = getRecentSearches();
      for (const term of recent) {
        if (
          term.toLowerCase().includes(q) &&
          !results.some((r) => r.label.toLowerCase() === term.toLowerCase()) &&
          results.length < 8
        ) {
          results.push({ label: term, source: "recent" });
        }
      }
    }

    // Common medicines
    for (const med of COMMON_MEDICINES) {
      if (
        med.toLowerCase().includes(q) &&
        !results.some((r) => r.label.toLowerCase() === med.toLowerCase()) &&
        results.length < 8
      ) {
        results.push({ label: med, source: "common" });
      }
    }

    return results.slice(0, 8);
  }, [searchQuery, cabinet, mounted]);

  // Close autocomplete on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Recent activities (top 5) ────────────────────────────────────────────

  const recentActivities = useMemo(() => activities.slice(0, 5), [activities]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleSearch = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const q = searchQuery.trim();
      if (!q) return;
      setShowAutocomplete(false);
      router.push(`/medicine/lookup?q=${encodeURIComponent(q)}`);
    },
    [searchQuery, router]
  );

  const handleAutocompleteSelect = useCallback(
    (label: string) => {
      setSearchQuery(label);
      setShowAutocomplete(false);
      router.push(`/medicine/lookup?q=${encodeURIComponent(label)}`);
    },
    [router]
  );

  const handlePopularClick = useCallback(
    (name: string) => {
      router.push(`/medicine/lookup?q=${encodeURIComponent(name)}`);
    },
    [router]
  );

  const handleAddToCabinet = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const name = cabinetInput.trim();
      if (!name) return;
      const updated = addToCabinet(name);
      setCabinet(updated);
      setCabinetInput("");
    },
    [cabinetInput]
  );

  const handleRemoveFromCabinet = useCallback((name: string) => {
    const updated = removeFromCabinet(name);
    setCabinet(updated);
  }, []);

  const handleCabinetMedicineClick = useCallback(
    (name: string) => {
      router.push(`/medicine/lookup?q=${encodeURIComponent(name)}`);
    },
    [router]
  );

  // ── Emergency card ───────────────────────────────────────────────────────

  const emergencyCardText = useMemo(() => {
    if (cabinet.length === 0) return "";
    const lines = [
      "EMERGENCY MEDICINE CARD",
      `Generated: ${new Date().toLocaleDateString()}`,
      "---",
      "Current Medications:",
      ...cabinet.map((m, i) => `  ${i + 1}. ${m.name}`),
      "---",
      "Note: Show this card to any healthcare provider in case of emergency.",
      "Generated by CuraSense Medicine Hub",
    ];
    return lines.join("\n");
  }, [cabinet]);

  const handleCopyEmergencyCard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(emergencyCardText);
      setCopiedEmergency(true);
      setTimeout(() => setCopiedEmergency(false), 2000);
    } catch {
      // fallback
    }
  }, [emergencyCardText]);

  // ── Batch Interaction Matrix ─────────────────────────────────────────────

  const matrixMedicines = useMemo(() => cabinet.slice(0, 5).map((m) => m.name), [cabinet]);

  const handleCheckAllInteractions = useCallback(async () => {
    if (matrixMedicines.length < 2) return;

    setMatrixLoading(true);
    setMatrixError(null);
    setShowMatrix(true);
    const newResults = new Map<string, InteractionResponse>();

    // Build all pairs
    const pairs: [string, string][] = [];
    for (let i = 0; i < matrixMedicines.length; i++) {
      for (let j = i + 1; j < matrixMedicines.length; j++) {
        pairs.push([matrixMedicines[i], matrixMedicines[j]]);
      }
    }

    try {
      const results = await Promise.allSettled(
        pairs.map(([m1, m2]) => checkInteraction(m1, m2))
      );

      let failCount = 0;
      results.forEach((result, idx) => {
        const [m1, m2] = pairs[idx];
        const key = `${m1}|||${m2}`;
        if (result.status === "fulfilled") {
          newResults.set(key, result.value);
        } else {
          failCount++;
        }
      });

      setMatrixResults(newResults);
      if (failCount > 0 && failCount < pairs.length) {
        setMatrixError(`${failCount} of ${pairs.length} checks failed. Partial results shown.`);
      } else if (failCount === pairs.length) {
        setMatrixError("All interaction checks failed. Please try again later.");
      }
    } catch {
      setMatrixError("Failed to check interactions. Please try again.");
    } finally {
      setMatrixLoading(false);
    }
  }, [matrixMedicines]);

  function getMatrixResult(m1: string, m2: string): InteractionResponse | undefined {
    return matrixResults.get(`${m1}|||${m2}`) || matrixResults.get(`${m2}|||${m1}`);
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ══════════════════════════════════
          LAYERED BACKGROUND SYSTEM
          Aurora + Grid + Floating Orbs
         ══════════════════════════════════ */}
      <AuroraBackground intensity="subtle" />
      <GridPattern className="opacity-30" />

      {/* Floating Orbs */}
      <FloatingOrb
        className="h-[500px] w-[500px] -top-32 -left-48"
        color="brand-primary"
        delay={0}
      />
      <FloatingOrb
        className="h-[400px] w-[400px] top-1/4 -right-32"
        color="brand-secondary"
        delay={3}
      />
      <GlowOrb
        className="-bottom-20 left-1/4"
        color="success"
        size="lg"
        delay={6}
        blur="xl"
      />
      <GlowOrb
        className="top-2/3 right-1/4"
        color="info"
        size="md"
        delay={9}
        blur="lg"
      />

      {/* ── Main Content ── */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ════════════════════════════════
            HERO SECTION — Scroll-linked parallax
           ════════════════════════════════ */}
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="flex flex-col items-center pt-4 pb-6 text-center"
        >
          {/* AI Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.smooth, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--brand-primary)/0.2)] bg-[hsl(var(--brand-primary)/0.06)] px-4 py-1.5"
          >
            <PulsingDot color="success" />
            <span className="text-xs font-medium text-[hsl(var(--brand-primary))]">
              AI-Powered Medicine Intelligence
            </span>
            <Sparkles className="h-3 w-3 text-[hsl(var(--brand-primary))]" />
          </motion.div>

          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={springPresets.bouncy}
            className="relative mb-8"
          >
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--color-medicine)), hsl(var(--brand-primary)))",
              }}
              animate={{
                boxShadow: [
                  "0 0 30px 8px hsl(var(--color-medicine) / 0.2)",
                  "0 0 50px 16px hsl(var(--color-medicine) / 0.35)",
                  "0 0 30px 8px hsl(var(--color-medicine) / 0.2)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              className="relative flex h-24 w-24 items-center justify-center rounded-3xl"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--color-medicine)), hsl(var(--brand-primary)))",
              }}
            >
              <Pill className="h-12 w-12 text-white" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.smooth, delay: 0.2 }}
            className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl"
          >
            <GradientText>Medicine Hub</GradientText>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.smooth, delay: 0.3 }}
            className="mt-4 max-w-2xl text-base leading-relaxed text-[hsl(var(--muted-foreground))] md:text-lg"
          >
            Your intelligent companion for medicine safety, drug interactions,
            and personalized health insights — powered by advanced AI
          </motion.p>

          {/* ── Search Bar with Autocomplete ── */}
          <motion.div
            ref={searchRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.smooth, delay: 0.4 }}
            className="relative mt-10 w-full max-w-xl"
          >
            <form
              onSubmit={handleSearch}
              className="group relative flex items-center gap-3"
            >
              {/* Ambient glow behind search */}
              <div
                className="pointer-events-none absolute -inset-3 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--color-medicine) / 0.15), hsl(var(--brand-primary) / 0.15))",
                }}
              />
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <Input
                  type="text"
                  placeholder="Search any medicine for AI insights..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAutocomplete(true);
                  }}
                  onFocus={() => setShowAutocomplete(true)}
                  className="h-14 rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--card)/0.8)] pl-12 pr-4 text-base backdrop-blur-sm transition-all duration-300 focus:border-[hsl(var(--brand-primary)/0.5)] focus:shadow-[0_0_0_3px_hsl(var(--brand-primary)/0.1)]"
                />
              </div>
              <Button
                type="submit"
                className="h-14 rounded-xl px-8 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--color-medicine)), hsl(var(--brand-primary)))",
                  boxShadow: "0 8px 32px -8px hsl(var(--brand-primary) / 0.35)",
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>

            {/* ── Autocomplete Dropdown ── */}
            <AnimatePresence>
              {showAutocomplete && autocompleSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={springPresets.snappy}
                  className="absolute top-full left-0 right-16 z-50 mt-2 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.95)] shadow-2xl backdrop-blur-lg"
                >
                  {autocompleSuggestions.map((item, i) => (
                    <button
                      key={`${item.label}-${item.source}`}
                      onClick={() => handleAutocompleteSelect(item.label)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-150",
                        "hover:bg-[hsl(var(--brand-primary)/0.06)]",
                        i < autocompleSuggestions.length - 1 && "border-b border-[hsl(var(--border)/0.5)]"
                      )}
                    >
                      {item.source === "cabinet" ? (
                        <Package className="h-3.5 w-3.5 text-[hsl(var(--brand-primary))]" />
                      ) : item.source === "recent" ? (
                        <Clock className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                      ) : (
                        <Pill className="h-3.5 w-3.5 text-[hsl(var(--color-medicine))]" />
                      )}
                      <span className="flex-1 font-medium text-[hsl(var(--foreground))]">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground)/0.6)]">
                        {item.source === "cabinet"
                          ? "Cabinet"
                          : item.source === "recent"
                            ? "Recent"
                            : ""}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Popular Medicine Pills ── */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              initial: {},
              animate: { transition: staggerConfig.fast },
            }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground)/0.6)]">
              Popular
            </span>
            {POPULAR_MEDICINES.map((med) => (
              <motion.button
                key={med}
                variants={animationVariants.fadeUp}
                transition={springPresets.snappy}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePopularClick(med)}
                className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.6)] px-3.5 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] backdrop-blur-sm transition-all duration-200 hover:border-[hsl(var(--brand-primary)/0.4)] hover:bg-[hsl(var(--brand-primary)/0.06)] hover:text-[hsl(var(--brand-primary))]"
              >
                {med}
              </motion.button>
            ))}
          </motion.div>
        </motion.section>

        {/* ── Heartbeat Divider ── */}
        <HeartbeatDivider color="brand" />

        {/* ════════════════════════════════
            STATS ROW
           ════════════════════════════════ */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            initial: {},
            animate: { transition: staggerConfig.fast },
          }}
          className="mb-14 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {HERO_STATS.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={animationVariants.fadeUp}
                transition={springPresets.smooth}
                className="group relative flex flex-col items-center rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.5)] p-5 backdrop-blur-sm transition-all duration-300 hover:border-[hsl(var(--brand-primary)/0.3)] hover:bg-[hsl(var(--card)/0.8)]"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--brand-primary)/0.08)] transition-colors duration-300 group-hover:bg-[hsl(var(--brand-primary)/0.15)]">
                  <StatIcon className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                </div>
                <div className="text-2xl font-bold text-[hsl(var(--foreground))] md:text-3xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2} />
                </div>
                <span className="mt-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </motion.section>

        {/* ════════════════════════════════
            BENTO GRID — Premium Feature Cards
            SpotlightCardV2 + ParallaxContainer
           ════════════════════════════════ */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            initial: {},
            animate: { transition: staggerConfig.normal },
          }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12"
        >
          {FEATURE_CARDS.map((card) => {
            const colors = FEATURE_COLORS[card.colorKey];
            const Icon = card.icon;
            const span = GRID_SPANS[card.id];

            return (
              <motion.div
                key={card.id}
                variants={animationVariants.fadeUp}
                transition={springPresets.smooth}
                className={cn(span, "md:col-span-1")}
              >
                <ParallaxContainer intensity={6}>
                  <SpotlightCardV2 borderGlow>
                    <button
                      onClick={() => router.push(card.route)}
                      className={cn(
                        "group relative flex h-full w-full flex-col items-start overflow-hidden p-7 text-left transition-all duration-500",
                        "lg:min-h-[220px]"
                      )}
                    >
                      {/* Background gradient on hover */}
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                          colors.gradientFrom,
                          colors.gradientTo
                        )}
                      />

                      {/* Top row: icon + stats badge */}
                      <div className="relative z-10 flex w-full items-start justify-between">
                        {/* Gradient Icon Container */}
                        <motion.div
                          className={cn(
                            "flex h-13 w-13 items-center justify-center rounded-2xl shadow-lg",
                            colors.iconBgSolid
                          )}
                          whileHover={{ scale: 1.08, rotate: 3 }}
                          transition={springPresets.snappy}
                          style={{
                            boxShadow: `0 8px 24px -8px hsl(var(--brand-primary) / 0.3)`,
                          }}
                        >
                          <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
                        </motion.div>

                        {/* Stats badge */}
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
                            colors.pillBg,
                            colors.pillText
                          )}
                        >
                          {card.stats}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="relative z-10 mt-5">
                        <p
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-widest",
                            colors.actionText
                          )}
                        >
                          {card.subtitle}
                        </p>
                        <h3 className="mt-1.5 text-xl font-bold text-[hsl(var(--foreground))] transition-colors duration-200">
                          {card.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                          {card.description}
                        </p>
                      </div>

                      {/* CTA with hover arrow animation */}
                      <div className="relative z-10 mt-auto pt-5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 group-hover:gap-3",
                            colors.actionText
                          )}
                        >
                          Explore
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </span>
                      </div>

                      {/* Decorative large icon watermark */}
                      <Icon
                        className={cn(
                          "pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 transition-all duration-500",
                          colors.iconText,
                          "opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110"
                        )}
                        strokeWidth={0.6}
                      />

                      {/* Corner accent dot */}
                      <div
                        className={cn(
                          "absolute right-5 top-5 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                          colors.dotColor
                        )}
                      />
                    </button>
                  </SpotlightCardV2>
                </ParallaxContainer>
              </motion.div>
            );
          })}
        </motion.section>

        {/* ── Section Divider ── */}
        <AnimatedDivider variant="gradient" className="my-10" />

        {/* ════════════════════════════════
            MEDICINE CATEGORY QUICK-ACCESS
           ════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={springPresets.smooth}
          className="mb-10"
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--brand-secondary)), hsl(var(--brand-primary)))",
              }}
            >
              <Grid3X3 className="h-5 w-5 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
                Browse by Condition
              </h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Quick access to medicines by health category
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {MEDICINE_CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              const catColors = CATEGORY_COLOR_MAP[cat.color] || CATEGORY_COLOR_MAP.primary;

              return (
                <motion.div
                  key={cat.name}
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={springPresets.snappy}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300",
                    "bg-[hsl(var(--card)/0.6)] backdrop-blur-sm",
                    "border-[hsl(var(--border)/0.5)]",
                    "hover:border-[hsl(var(--border))] hover:shadow-lg"
                  )}
                >
                  {/* Category header */}
                  <button
                    onClick={() =>
                      router.push(
                        `/medicine/advisor?symptoms=${encodeURIComponent(cat.symptoms)}`
                      )
                    }
                    className="flex items-center gap-2.5 text-left"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                        catColors.bg,
                        catColors.hoverBg
                      )}
                    >
                      <CatIcon className={cn("h-4.5 w-4.5", catColors.text)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
                        {cat.name}
                      </h3>
                    </div>
                  </button>

                  {/* Example medicines */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cat.examples.map((ex) => (
                      <button
                        key={ex}
                        onClick={() =>
                          router.push(
                            `/medicine/lookup?q=${encodeURIComponent(ex)}`
                          )
                        }
                        className={cn(
                          "text-[11px] px-2.5 py-1 rounded-full border transition-all duration-200",
                          "bg-[hsl(var(--card))] border-[hsl(var(--border)/0.5)]",
                          "text-[hsl(var(--muted-foreground))]",
                          "hover:border-[hsl(var(--brand-primary)/0.4)]",
                          "hover:text-[hsl(var(--brand-primary))]",
                          "hover:bg-[hsl(var(--brand-primary)/0.05)]"
                        )}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ════════════════════════════════
            MEDICINE CABINET — Glass Card
           ════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={springPresets.smooth}
          className="relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.6)] p-7 backdrop-blur-md"
        >
          {/* Inner highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent" />

          {/* Decorative blob */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[hsl(var(--brand-primary)/0.04)] blur-3xl" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-primary-light)))",
                    boxShadow:
                      "0 8px 24px -8px hsl(var(--brand-primary) / 0.35)",
                  }}
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  transition={springPresets.snappy}
                >
                  <Package className="h-6 w-6 text-white" strokeWidth={1.8} />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
                    My Medicine Cabinet
                  </h2>
                  <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
                    Quick access to your saved medicines
                  </p>
                </div>
              </div>
              {mounted && cabinet.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={springPresets.bouncy}
                  className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--brand-primary)/0.1)] px-3 py-1 text-xs font-semibold text-[hsl(var(--brand-primary))]"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-primary))]" />
                  {cabinet.length} saved
                </motion.span>
              )}
            </div>

            {/* Cabinet Items */}
            <AnimatePresence mode="popLayout">
              {mounted && cabinet.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                    <Plus className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Add medicines you take regularly for quick access across all features
                  </p>
                </motion.div>
              ) : mounted ? (
                <motion.div
                  layout
                  className="mt-5 flex flex-wrap gap-2.5"
                >
                  {cabinet.map((med) => (
                    <motion.div
                      key={med.name}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={springPresets.snappy}
                      className="group/pill flex items-center gap-2 rounded-full border border-[hsl(var(--brand-primary)/0.2)] bg-[hsl(var(--brand-primary)/0.06)] px-4 py-2 transition-all duration-200 hover:border-[hsl(var(--brand-primary)/0.4)] hover:bg-[hsl(var(--brand-primary)/0.1)] hover:shadow-sm"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-primary)/0.5)]" />
                      <button
                        onClick={() => handleCabinetMedicineClick(med.name)}
                        className="text-sm font-medium text-[hsl(var(--brand-primary))] transition-colors hover:text-[hsl(var(--brand-primary-dark))]"
                      >
                        {med.name}
                      </button>
                      <button
                        onClick={() => handleRemoveFromCabinet(med.name)}
                        className="flex h-5 w-5 items-center justify-center rounded-full opacity-40 transition-all duration-200 hover:bg-[hsl(var(--color-error)/0.1)] hover:text-[hsl(var(--color-error))] hover:opacity-100 group-hover/pill:opacity-70"
                        aria-label={`Remove ${med.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Add to Cabinet */}
            <form
              onSubmit={handleAddToCabinet}
              className="mt-5 flex items-center gap-3"
            >
              <div className="relative flex-1">
                <Pill className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground)/0.4)]" />
                <Input
                  type="text"
                  placeholder="Add a medicine to your cabinet..."
                  value={cabinetInput}
                  onChange={(e) => setCabinetInput(e.target.value)}
                  className="h-11 rounded-xl bg-[hsl(var(--background)/0.6)] pl-10 text-sm backdrop-blur-sm"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="h-11 gap-1.5 rounded-xl border-[hsl(var(--brand-primary)/0.3)] px-5 font-semibold text-[hsl(var(--brand-primary))] transition-all duration-200 hover:bg-[hsl(var(--brand-primary)/0.06)] hover:shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </form>

            {/* Quick Actions */}
            <AnimatePresence>
              {mounted && cabinet.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={springPresets.smooth}
                  className="mt-5 flex flex-wrap gap-4 border-t border-[hsl(var(--border)/0.5)] pt-5"
                >
                  <button
                    onClick={() =>
                      router.push(
                        `/medicine/interactions?m1=${encodeURIComponent(cabinet[0].name)}&m2=${encodeURIComponent(cabinet[1].name)}`
                      )
                    }
                    className="group/action inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--color-warning))] transition-all duration-200 hover:gap-2.5"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--color-warning)/0.1)] transition-colors group-hover/action:bg-[hsl(var(--color-warning)/0.15)]">
                      <Zap className="h-3.5 w-3.5" />
                    </div>
                    Check Interactions
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/action:translate-x-0.5" />
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/medicine/compare?m1=${encodeURIComponent(cabinet[0].name)}&m2=${encodeURIComponent(cabinet[1].name)}`
                      )
                    }
                    className="group/action inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--brand-secondary))] transition-all duration-200 hover:gap-2.5"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--brand-secondary)/0.1)] transition-colors group-hover/action:bg-[hsl(var(--brand-secondary)/0.15)]">
                      <GitCompare className="h-3.5 w-3.5" />
                    </div>
                    Compare Medicines
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/action:translate-x-0.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ Emergency Medicine Card ═══ */}
            <AnimatePresence>
              {mounted && cabinet.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={springPresets.smooth}
                  className="mt-5 border-t border-[hsl(var(--border)/0.5)] pt-5"
                >
                  <button
                    onClick={() => setShowEmergencyCard(!showEmergencyCard)}
                    className="group/emc flex items-center gap-2 text-sm font-semibold text-[hsl(var(--color-error))] transition-all duration-200"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--color-error)/0.1)] transition-colors group-hover/emc:bg-[hsl(var(--color-error)/0.15)]">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    Emergency Medicine Card
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        showEmergencyCard && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {showEmergencyCard && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={springPresets.smooth}
                        className="mt-4"
                      >
                        <div className="rounded-xl border border-[hsl(var(--color-error)/0.15)] bg-[hsl(var(--color-error)/0.03)] p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-[hsl(var(--color-error))]" />
                              <span className="text-sm font-bold text-[hsl(var(--foreground))]">
                                Emergency Medicine Card
                              </span>
                            </div>
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>

                          {/* Medicine list */}
                          <div className="space-y-2 mb-4">
                            {cabinet.map((med, i) => (
                              <div
                                key={med.name}
                                className="flex items-center gap-3 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] px-3 py-2"
                              >
                                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--color-error)/0.1)] text-xs font-bold text-[hsl(var(--color-error))]">
                                  {i + 1}
                                </span>
                                <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                                  {med.name}
                                </span>
                              </div>
                            ))}
                          </div>

                          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
                            Show this card to any healthcare provider in case of emergency.
                          </p>

                          {/* Copy button */}
                          <button
                            onClick={handleCopyEmergencyCard}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200",
                              copiedEmergency
                                ? "bg-[hsl(var(--color-success)/0.1)] text-[hsl(var(--color-success))] border border-[hsl(var(--color-success)/0.2)]"
                                : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)]"
                            )}
                          >
                            {copiedEmergency ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                Copy to Clipboard
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ Batch Interaction Matrix ═══ */}
            <AnimatePresence>
              {mounted && cabinet.length >= 3 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={springPresets.smooth}
                  className="mt-5 border-t border-[hsl(var(--border)/0.5)] pt-5"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowMatrix(!showMatrix)}
                      className="group/matrix flex items-center gap-2 text-sm font-semibold text-[hsl(var(--color-warning))] transition-all duration-200"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--color-warning)/0.1)] transition-colors group-hover/matrix:bg-[hsl(var(--color-warning)/0.15)]">
                        <Grid3X3 className="h-3.5 w-3.5" />
                      </div>
                      Interaction Matrix
                      {matrixMedicines.length < cabinet.length && (
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                          (first {matrixMedicines.length})
                        </span>
                      )}
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          showMatrix && "rotate-180"
                        )}
                      />
                    </button>

                    {!matrixLoading && matrixResults.size === 0 && (
                      <Button
                        onClick={handleCheckAllInteractions}
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs border-[hsl(var(--color-warning)/0.3)] text-[hsl(var(--color-warning))] hover:bg-[hsl(var(--color-warning)/0.06)]"
                      >
                        <Zap className="h-3 w-3" />
                        Check All
                      </Button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showMatrix && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={springPresets.smooth}
                        className="mt-4"
                      >
                        {matrixLoading ? (
                          <div className="flex items-center justify-center gap-3 py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--color-warning))]" />
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">
                              Checking {matrixMedicines.length * (matrixMedicines.length - 1) / 2} interactions...
                            </span>
                          </div>
                        ) : matrixResults.size === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                              Click &quot;Check All&quot; to analyze interactions between your cabinet medicines.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {matrixError && (
                              <div className="text-xs text-[hsl(var(--color-warning))] bg-[hsl(var(--color-warning)/0.06)] border border-[hsl(var(--color-warning)/0.15)] rounded-lg px-3 py-2">
                                {matrixError}
                              </div>
                            )}

                            {/* Matrix grid */}
                            <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)]">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr>
                                    <th className="p-2 text-left font-semibold text-[hsl(var(--muted-foreground))] border-b border-[hsl(var(--border)/0.5)]" />
                                    {matrixMedicines.map((med) => (
                                      <th
                                        key={med}
                                        className="p-2 text-center font-semibold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border)/0.5)] max-w-[100px] truncate"
                                      >
                                        {med}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {matrixMedicines.map((row, ri) => (
                                    <tr key={row}>
                                      <td className="p-2 font-semibold text-[hsl(var(--foreground))] border-r border-[hsl(var(--border)/0.5)] max-w-[100px] truncate">
                                        {row}
                                      </td>
                                      {matrixMedicines.map((col, ci) => {
                                        if (ri === ci) {
                                          return (
                                            <td
                                              key={col}
                                              className="p-2 text-center bg-[hsl(var(--muted)/0.2)]"
                                            >
                                              <span className="text-[hsl(var(--muted-foreground)/0.4)]">
                                                —
                                              </span>
                                            </td>
                                          );
                                        }
                                        const result = getMatrixResult(row, col);
                                        if (!result) {
                                          return (
                                            <td
                                              key={col}
                                              className="p-2 text-center"
                                            >
                                              <span className="text-[hsl(var(--muted-foreground)/0.3)]">
                                                ?
                                              </span>
                                            </td>
                                          );
                                        }
                                        const riskKey = result.risk_level === "Low" || result.risk_level === "Moderate" || result.risk_level === "High"
                                          ? result.risk_level
                                          : "Unknown";
                                        const riskColors = RISK_COLORS[riskKey];
                                        return (
                                          <td key={col} className="p-1.5 text-center">
                                            <button
                                              onClick={() =>
                                                router.push(
                                                  `/medicine/interactions?m1=${encodeURIComponent(result.medicine1)}&m2=${encodeURIComponent(result.medicine2)}`
                                                )
                                              }
                                              className={cn(
                                                "inline-block rounded-md px-2 py-1 text-[10px] font-bold border transition-all duration-200 hover:scale-105",
                                                riskColors.bg,
                                                riskColors.text,
                                                riskColors.border
                                              )}
                                              title={`${result.medicine1} + ${result.medicine2}: ${result.risk_level}`}
                                            >
                                              {result.risk_level}
                                            </button>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Re-check button */}
                            <div className="flex justify-end">
                              <Button
                                onClick={handleCheckAllInteractions}
                                size="sm"
                                variant="ghost"
                                className="gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--color-warning))]"
                              >
                                <Zap className="h-3 w-3" />
                                Re-check
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ════════════════════════════════
            RECENT ACTIVITY FEED
           ════════════════════════════════ */}
        <AnimatePresence>
          {mounted && recentActivities.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ ...springPresets.smooth, delay: 0.05 }}
              className="relative mt-8 overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.6)] p-7 backdrop-blur-md"
            >
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--color-medicine)), hsl(var(--brand-primary)))",
                    }}
                  >
                    <Clock className="h-5 w-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
                      Recent Activity
                    </h2>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Your latest medicine hub actions
                    </p>
                  </div>
                </div>

                {/* Activity list */}
                <div className="space-y-2">
                  {recentActivities.map((act, i) => {
                    const typeConfig = ACTIVITY_TYPE_MAP[act.type] || ACTIVITY_TYPE_MAP.lookup;
                    const ActIcon = typeConfig.icon;
                    const actColors = CATEGORY_COLOR_MAP[typeConfig.color] || CATEGORY_COLOR_MAP.primary;

                    // Build route for navigation
                    let actRoute = typeConfig.route;
                    if (act.type === "lookup" || act.type === "scan") {
                      actRoute = `${typeConfig.route}${encodeURIComponent(act.query)}`;
                    } else if (act.type === "advisor") {
                      actRoute = `${typeConfig.route}${encodeURIComponent(act.query)}`;
                    }

                    return (
                      <motion.button
                        key={`${act.type}-${act.timestamp}`}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...springPresets.snappy, delay: i * 0.05 }}
                        onClick={() => router.push(actRoute)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200",
                          "hover:bg-[hsl(var(--muted)/0.4)]",
                          "group/act"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                            actColors.bg,
                          )}
                        >
                          <ActIcon className={cn("h-4 w-4", actColors.text)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground)/0.6)]">
                              {typeConfig.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                            {act.query}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-[hsl(var(--muted-foreground)/0.5)]">
                          {relativeTime(act.timestamp)}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground)/0.3)] transition-all group-hover/act:translate-x-0.5 group-hover/act:text-[hsl(var(--muted-foreground))]" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════
            HEALTH TIP OF THE DAY — Glowing Card
           ════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ ...springPresets.smooth, delay: 0.1 }}
          className="relative mt-8 overflow-hidden rounded-3xl border border-[hsl(var(--color-info)/0.2)] bg-gradient-to-br from-[hsl(var(--color-info)/0.04)] to-[hsl(var(--brand-secondary)/0.02)] p-7"
        >
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[hsl(var(--color-info)/0.06)] blur-3xl" />

          <div className="relative z-10 flex gap-4">
            <motion.div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--color-info)), hsl(var(--color-info-vibrant)))",
                boxShadow: "0 8px 24px -8px hsl(var(--color-info) / 0.35)",
              }}
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Lightbulb className="h-6 w-6 text-white" strokeWidth={1.8} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                  Health Tip of the Day
                </h3>
                <span className="rounded-full bg-[hsl(var(--color-info)/0.1)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--color-info))]">
                  Daily
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {todayTip}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ════════════════════════════════
            DISCLAIMER FOOTER
           ════════════════════════════════ */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...springPresets.smooth, delay: 0.1 }}
          className="mt-8 mb-4 rounded-2xl border border-[hsl(var(--color-warning)/0.2)] bg-[hsl(var(--color-warning)/0.03)] p-5"
        >
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--color-warning)/0.1)]">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--color-warning))]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--color-warning))]">
                Medical Disclaimer
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                CuraSense provides AI-generated medicine information for
                educational purposes only. This is not medical advice. Always
                consult a qualified healthcare professional before starting,
                stopping, or changing any medication.
              </p>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
