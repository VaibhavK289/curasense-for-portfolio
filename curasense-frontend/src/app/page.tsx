"use client";

// ============================================
// CURASENSE LANDING PAGE V4.0
// Premium Healthcare Design - Aceternity Inspired
// Lead Designer: 30 Years Experience
// ============================================

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, useMemo } from "react";
import {
  Stethoscope,
  FileText,
  ScanLine,
  Pill,
  ArrowRight,
  Shield,
  Zap,
  Brain,
  Heart,
  Activity,
  CheckCircle2,
  Sparkles,
  Lock,
  Globe,
  Users,
  TrendingUp,
  BarChart3,
  UserCircle2,
  ArrowUpRight,
  Calendar,
  Clock,
  Play,
  Star,
  Quote,
  Fingerprint,
  Eye,
  FlaskConical,
  Microscope,
  HeartPulse,
  Upload,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useAppStore, Report } from "@/lib/store";
import {
  GlassCard,
  SpotlightCardV2,
  AuroraBackground,
  StaggerContainerV2,
  StaggerItemV2,
  AnimatedCounter,
  MorphingBlob,
  ParallaxContainer,
} from "@/components/ui/premium-components";
import {
  GridPattern,
  PulsingDot,
} from "@/components/ui/aceternity";

// ============================================
// DESIGN TOKENS
// ============================================
const springSmooth = { type: "spring" as const, stiffness: 100, damping: 20 };

// ============================================
// FEATURE DATA
// ============================================
const mainFeatures = [
  {
    icon: FileText,
    title: "Prescription Analysis",
    description: "AI extracts medications, dosages, and provides comprehensive analysis with drug interactions and recommendations.",
    href: "/diagnosis/prescription",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    iconGradient: "from-blue-600 to-cyan-500",
    stats: "30+ document types",
    badge: "Most Popular",
  },
  {
    icon: ScanLine,
    title: "Medical Imaging AI",
    description: "Advanced vision models analyze X-rays, CT scans, and MRIs with hospital-grade accuracy and detailed findings.",
    href: "/diagnosis/xray",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    iconGradient: "from-violet-600 to-purple-500",
    stats: "99.2% accuracy",
    badge: "AI Powered",
  },
  {
    icon: Pill,
    title: "Medicine Intelligence",
    description: "Compare medications, check interactions, find generic alternatives, and understand side effects instantly.",
    href: "/medicine",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    iconGradient: "from-emerald-600 to-teal-500",
    stats: "50k+ medicines",
    badge: "Database",
  },
];

const stats = [
  { value: 30, suffix: "s", label: "Analysis Time", icon: Zap, description: "Average processing" },
  { value: 99.2, suffix: "%", label: "Accuracy", icon: Activity, description: "Clinical grade" },
  { value: 50, suffix: "k+", label: "Medicines", icon: Pill, description: "In database" },
  { value: 100, suffix: "%", label: "Private", icon: Shield, description: "HIPAA compliant" },
];

const howItWorks = [
  {
    step: "01",
    title: "Upload",
    description: "Drag & drop prescription, lab report, or medical image",
    icon: Upload,
    color: "from-blue-500 to-cyan-500",
  },
  {
    step: "02",
    title: "Analyze",
    description: "AI processes with specialized healthcare models",
    icon: Brain,
    color: "from-violet-500 to-purple-500",
  },
  {
    step: "03",
    title: "Insights",
    description: "Get detailed analysis and recommendations",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-500",
  },
];

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Cardiologist",
    avatar: "SC",
    content: "CuraSense has transformed how I review patient prescriptions. The drug interaction alerts alone have been invaluable.",
    rating: 5,
  },
  {
    name: "Dr. Michael Patel",
    role: "Radiologist",
    avatar: "MP",
    content: "The X-ray analysis accuracy is remarkable. It's like having a second pair of expert eyes on every scan.",
    rating: 5,
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Family Medicine",
    avatar: "ER",
    content: "My patients love getting detailed explanations of their lab results. CuraSense makes complex data accessible.",
    rating: 5,
  },
];

const trustBadges = [
  { icon: Shield, label: "HIPAA Compliant", description: "Full regulatory compliance" },
  { icon: Lock, label: "End-to-End Encrypted", description: "Bank-level security" },
  { icon: Fingerprint, label: "Privacy First", description: "No data retention" },
  { icon: Globe, label: "Global Access", description: "24/7 availability" },
];

const capabilities = [
  { icon: FileText, label: "Prescriptions" },
  { icon: FlaskConical, label: "Lab Reports" },
  { icon: Microscope, label: "Blood Tests" },
  { icon: ScanLine, label: "X-Rays" },
  { icon: Eye, label: "CT Scans" },
  { icon: HeartPulse, label: "ECG Reports" },
];

// ============================================
// INTERACTIVE DEMO PREVIEW
// ============================================
function DemoPreview() {
  const [activeStep, setActiveStep] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { label: "Upload", icon: Upload, color: "text-blue-400" },
    { label: "Analyze", icon: Brain, color: "text-violet-400" },
    { label: "Results", icon: CheckCircle2, color: "text-emerald-400" },
  ];

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-emerald-500/20 blur-3xl" />
      
      {/* Mock interface */}
      <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-white/40">curasense.app/diagnosis</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          {/* Progress indicators */}
          <div className="flex justify-center gap-8 mb-8">
            {steps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center gap-2">
                <motion.div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    i <= activeStep ? "bg-white/10" : "bg-white/5"
                  }`}
                  animate={{
                    scale: i === activeStep ? 1.1 : 1,
                    borderColor: i === activeStep ? "rgba(255,255,255,0.3)" : "transparent",
                  }}
                >
                  <step.icon className={`w-5 h-5 ${i <= activeStep ? step.color : "text-white/30"}`} />
                </motion.div>
                <span className={`text-xs ${i <= activeStep ? "text-white/80" : "text-white/30"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Animated content area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {activeStep === 0 && (
                <div className="border-2 border-dashed border-white/20 rounded-2xl p-8">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                  <p className="text-white/60">Drop your medical document here</p>
                </div>
              )}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto rounded-full border-2 border-violet-400 border-t-transparent"
                  />
                  <p className="text-white/60">AI analyzing document...</p>
                </div>
              )}
              {activeStep === 2 && (
                <div className="space-y-3 text-left max-w-sm mx-auto">
                  {["Medication identified", "Dosage verified", "No interactions found"].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-3 bg-emerald-500/10 rounded-lg p-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-white/80">{item}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ============================================
// AUTHENTICATED DASHBOARD
// ============================================
function AuthenticatedDashboard({ userName, isGuest = false }: { userName?: string; isGuest?: boolean }) {
  const { exitGuestMode } = useAuth();
  const router = useRouter();
  const { reports, setCurrentReport, getAnalytics } = useAppStore();

  // Safe date helper — handles string-serialized dates from localStorage
  const safeDate = (v: unknown): Date => {
    if (!v) return new Date(0);
    const d = new Date(v as string | number | Date);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  // Recent reports (latest 5)
  const recentReports = useMemo(() => {
    return [...reports]
      .sort((a, b) => safeDate(b.createdAt).getTime() - safeDate(a.createdAt).getTime())
      .slice(0, 5);
  }, [reports]);

  // Analytics data
  const analytics = useMemo(() => getAnalytics(), [reports]);

  // Report type icon/color mapping
  const typeConfig: Record<string, { icon: typeof FileText; color: string; bg: string; route: string }> = {
    prescription: { icon: FileText, color: "text-[hsl(var(--brand-primary))]", bg: "bg-[hsl(var(--brand-primary)/0.1)]", route: "/diagnosis/prescription" },
    text: { icon: FileText, color: "text-[hsl(var(--color-info))]", bg: "bg-[hsl(var(--color-info)/0.1)]", route: "/diagnosis/prescription" },
    xray: { icon: ScanLine, color: "text-[hsl(var(--brand-secondary))]", bg: "bg-[hsl(var(--brand-secondary)/0.1)]", route: "/diagnosis/xray" },
    medicine: { icon: Pill, color: "text-[hsl(var(--color-success))]", bg: "bg-[hsl(var(--color-success)/0.1)]", route: "/medicine" },
  };

  // Chart bar data from daily analytics (last 7 days)
  const chartBars = useMemo(() => {
    if (reports.length === 0) return [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const bars: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const dayStr = day.toDateString();
      const count = reports.filter((r) => safeDate(r.createdAt).toDateString() === dayStr).length;
      bars.push(count);
    }
    const maxVal = Math.max(...bars, 1);
    return bars.map((v) => Math.max((v / maxVal) * 100, 5));
  }, [reports]);

  // Weekly trend percentage
  const weeklyTrend = useMemo(() => {
    if (reports.length === 0) return null;
    const now = new Date();
    const thisWeek = reports.filter((r) => {
      const d = safeDate(r.createdAt);
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length;
    const lastWeek = reports.filter((r) => {
      const d = safeDate(r.createdAt);
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 7 && diff <= 14;
    }).length;
    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  }, [reports]);
  
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary)/0.03)] via-transparent to-[hsl(var(--brand-secondary)/0.03)]" />
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[hsl(var(--brand-primary)/0.05)] blur-[150px]"
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative space-y-8">
        {/* Guest Banner */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <UserCircle2 className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">Guest Mode</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Create an account to save your analysis history</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/register">
                <Button size="sm" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Create Account
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={exitGuestMode}>Exit</Button>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              {currentDate}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))]">
              {greeting()},{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] bg-clip-text text-transparent">
                {isGuest ? "Guest" : (userName?.split(" ")[0] || "there")}
              </span>
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-2 max-w-lg">
              Your AI healthcare companion is ready. Analyze prescriptions, medical images, or compare medications.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3"
          >
            {[
              { icon: Activity, label: "99.2%", sublabel: "Accuracy", color: "text-emerald-500" },
              { icon: Zap, label: "<30s", sublabel: "Response", color: "text-blue-500" },
              { icon: Shield, label: "100%", sublabel: "Private", color: "text-violet-500" },
            ].map((stat) => (
              <div key={stat.sublabel} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="font-semibold text-[hsl(var(--foreground))]">{stat.label}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.sublabel}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Main Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {mainFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group relative overflow-hidden rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 hover:border-[hsl(var(--brand-primary)/0.3)] transition-all duration-300 hover:shadow-xl">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  <div className="relative">
                    {/* Badge */}
                    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-[hsl(var(--brand-primary)/0.1)] text-[hsl(var(--brand-primary))] mb-4">
                      {feature.badge}
                    </span>
                    
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.iconGradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--brand-primary))] transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {feature.stats}
                      </span>
                      <ArrowRight className="w-5 h-5 text-[hsl(var(--brand-primary))] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity & Analytics Preview */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Recent Activity</h2>
              <Link href="/history" className="text-sm text-[hsl(var(--brand-primary))] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--muted)/0.5)] flex items-center justify-center mb-4"
                >
                  <FileText className="w-10 h-10 text-[hsl(var(--muted-foreground)/0.5)]" />
                </motion.div>
                <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">No analysis yet</h3>
                <p className="text-[hsl(var(--muted-foreground))] mb-6 max-w-sm">
                  Upload a prescription or medical image to get started with AI-powered analysis.
                </p>
                <div className="flex gap-3">
                  <Link href="/diagnosis/prescription">
                    <Button className="gap-2">
                      <FileText className="w-4 h-4" />
                      Analyze Prescription
                    </Button>
                  </Link>
                  <Link href="/diagnosis/xray">
                    <Button variant="outline" className="gap-2">
                      <ScanLine className="w-4 h-4" />
                      Analyze X-Ray
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report, i) => {
                  const cfg = typeConfig[report.type] || typeConfig.text;
                  const ReportIcon = cfg.icon;
                  const date = safeDate(report.createdAt);
                  const statusDot = report.status === "completed" ? "bg-emerald-500" : report.status === "pending" ? "bg-amber-500" : "bg-red-500";

                  return (
                    <motion.button
                      key={report.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      onClick={() => {
                        setCurrentReport(report);
                        router.push(cfg.route);
                      }}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-[hsl(var(--muted)/0.4)] transition-colors group text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <ReportIcon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{report.title}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-2 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                          {report.status}
                          <span className="text-[hsl(var(--border))]">·</span>
                          <Clock className="w-3 h-3" />
                          {date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Analytics Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Link href="/analytics" className="block h-full">
              <div className="group bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 h-full hover:border-[hsl(var(--brand-primary)/0.3)] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[hsl(var(--brand-primary))]" />
                    <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Analytics</h2>
                  </div>
                  {reports.length > 0 && (
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-[hsl(var(--brand-primary)/0.1)] text-[hsl(var(--brand-primary))]">
                      {analytics.totalReportsAnalyzed} reports
                    </span>
                  )}
                </div>

                {/* Mini chart - real data or placeholder */}
                <div className="flex items-end justify-between h-32 mb-4 px-2">
                  {chartBars.map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.7 + i * 0.05, duration: 0.5 }}
                      className="w-6 rounded-t-md bg-gradient-to-t from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">Weekly trend</span>
                    {weeklyTrend !== null ? (
                      <span className={`flex items-center gap-1 ${weeklyTrend >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                        <TrendingUp className={`w-4 h-4 ${weeklyTrend < 0 ? "rotate-180" : ""}`} />
                        {weeklyTrend >= 0 ? "+" : ""}{weeklyTrend}%
                      </span>
                    ) : (
                      <span className="text-[hsl(var(--muted-foreground))]">No data</span>
                    )}
                  </div>
                  {reports.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">Avg. confidence</span>
                      <span className="text-[hsl(var(--foreground))] font-medium">
                        {analytics.accuracyMetrics.averageConfidence > 0 ? `${Math.round(analytics.accuracyMetrics.averageConfidence * 100)}%` : "—"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                  <span className="text-sm text-[hsl(var(--brand-primary))] flex items-center gap-1 group-hover:gap-2 transition-all">
                    View detailed analytics <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Status Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap items-center justify-between gap-4 pt-4"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-500">All systems operational</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> HIPAA Compliant</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> Encrypted</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Fast Response</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// LANDING PAGE CONTENT (for non-authenticated users)
// ============================================
function LandingPageContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: isMounted ? heroRef : undefined,
    offset: ["start start", "end start"],
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* ============================================
          PREMIUM BACKGROUND EFFECTS
          ============================================ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <AuroraBackground intensity="subtle" />
        <GridPattern className="opacity-30" />
        
        {/* Floating orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-violet-500/10 to-purple-500/5 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div 
          className="relative z-10 max-w-6xl mx-auto text-center"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
              <PulsingDot color="success" />
              <span className="text-sm font-medium text-emerald-400">AI-Powered Healthcare Platform</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ...springSmooth }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
          >
            <span className="text-[hsl(var(--foreground))]">Healthcare</span>
            <br />
            <span className="text-[hsl(var(--foreground))]">Meets </span>
            <span className="bg-gradient-to-r from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-secondary))] to-[hsl(var(--brand-primary))] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              Intelligence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Transform medical documents into actionable insights. 
            <span className="text-[hsl(var(--foreground))]"> Analyze prescriptions, X-rays, and medications </span>
            with clinical-grade AI accuracy.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <Link href="/diagnosis">
              <Button size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 text-lg shadow-xl shadow-[hsl(var(--brand-primary)/0.25)] hover:shadow-2xl hover:shadow-[hsl(var(--brand-primary)/0.3)] transition-all">
                <Stethoscope className="w-5 h-5" />
                Start Free Analysis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 h-14 px-8 text-lg backdrop-blur-sm">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center items-center gap-8 text-sm text-[hsl(var(--muted-foreground))]"
          >
            {[
              { icon: Shield, label: "HIPAA Compliant" },
              { icon: Lock, label: "End-to-End Encrypted" },
              { icon: Zap, label: "30s Analysis" },
              { icon: Users, label: "10k+ Users" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground))]"
          >
            <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================
          STATS SECTION
          ============================================ */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <StaggerContainerV2 className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <StaggerItemV2 key={stat.label}>
                <SpotlightCardV2 borderGlow className="text-center p-8">
                  <stat.icon className="w-8 h-8 mx-auto mb-4 text-[hsl(var(--brand-primary))]" />
                  <div className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">{stat.label}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{stat.description}</div>
                </SpotlightCardV2>
              </StaggerItemV2>
            ))}
          </StaggerContainerV2>
        </div>
      </section>

      {/* ============================================
          FEATURES BENTO GRID
          ============================================ */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-medium text-[hsl(var(--brand-primary))] uppercase tracking-wider mb-4">
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
              Everything you need for
              <br />
              <span className="bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] bg-clip-text text-transparent">
                intelligent healthcare
              </span>
            </h2>
            <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Three specialized AI models working together to provide comprehensive medical analysis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {mainFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={feature.href}>
                  <ParallaxContainer intensity={8}>
                    <SpotlightCardV2 borderGlow className="h-full cursor-pointer group">
                      <div className="p-8">
                        <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-[hsl(var(--brand-primary)/0.1)] text-[hsl(var(--brand-primary))] mb-6">
                          {feature.badge}
                        </span>
                        
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4 group-hover:text-[hsl(var(--brand-primary))] transition-colors">
                          {feature.title}
                        </h3>
                        
                        <p className="text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                          {feature.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
                          <span className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            {feature.stats}
                          </span>
                          <span className="text-[hsl(var(--brand-primary))] flex items-center gap-1 group-hover:gap-2 transition-all">
                            Try now <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </SpotlightCardV2>
                  </ParallaxContainer>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          INTERACTIVE DEMO SECTION
          ============================================ */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-sm font-medium text-[hsl(var(--brand-primary))] uppercase tracking-wider mb-4">
                See it in action
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
                Simple, fast, and
                <br />
                <span className="bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] bg-clip-text text-transparent">
                  incredibly accurate
                </span>
              </h2>
              <p className="text-lg text-[hsl(var(--muted-foreground))] mb-8">
                Upload any medical document and get comprehensive AI analysis in seconds. 
                Our specialized healthcare models understand context, identify issues, and provide actionable insights.
              </p>
              
              <div className="space-y-4">
                {howItWorks.map((step, i) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">{step.title}</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <DemoPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          CAPABILITIES SECTION
          ============================================ */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              Analyze any medical document
            </h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              Our AI understands a wide range of medical documents and imaging formats
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            {capabilities.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary)/0.3)] transition-all cursor-default"
              >
                <Icon className="w-5 h-5 text-[hsl(var(--brand-primary))]" />
                <span className="font-medium text-[hsl(var(--foreground))]">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS SECTION
          ============================================ */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-medium text-[hsl(var(--brand-primary))] uppercase tracking-wider mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))]">
              Trusted by healthcare professionals
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <SpotlightCardV2 className="h-full">
                  <div className="p-8">
                    <Quote className="w-10 h-10 text-[hsl(var(--brand-primary)/0.2)] mb-4" />
                    <p className="text-[hsl(var(--foreground))] mb-6 leading-relaxed">
                      &quot;{testimonial.content}&quot;
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] flex items-center justify-center text-white font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-[hsl(var(--foreground))]">{testimonial.name}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </SpotlightCardV2>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TRUST & SECURITY SECTION
          ============================================ */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <GlassCard variant="strong" hover={false} className="overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-10 lg:p-16">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="inline-block text-sm font-medium text-[hsl(var(--brand-primary))] uppercase tracking-wider mb-4">
                    Security & Privacy
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-6">
                    Your health data is sacred
                  </h2>
                  <p className="text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
                    We take security seriously. Your medical information is encrypted, never stored, and processed with the highest standards of healthcare data protection.
                  </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {trustBadges.map((badge, i) => (
                    <motion.div
                      key={badge.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand-primary)/0.1)] flex items-center justify-center flex-shrink-0">
                        <badge.icon className="w-6 h-6 text-[hsl(var(--brand-primary))]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">{badge.label}</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{badge.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] p-10 lg:p-16 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20">
                  <MorphingBlob className="w-[400px] h-[400px] -top-32 -right-32" color="secondary" />
                </div>
                <div className="relative text-center text-white">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Heart className="w-24 h-24 mx-auto mb-8 drop-shadow-2xl" />
                  </motion.div>
                  <h3 className="text-3xl font-bold mb-4">Your Health Matters</h3>
                  <p className="text-white/80 max-w-sm mx-auto">
                    CuraSense is designed to assist and inform. Always consult healthcare professionals for medical decisions.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ============================================
          FINAL CTA SECTION
          ============================================ */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-[hsl(var(--foreground))] mb-6">
              Ready to transform your
              <br />
              <span className="bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] bg-clip-text text-transparent">
                healthcare experience?
              </span>
            </h2>
            <p className="text-xl text-[hsl(var(--muted-foreground))] mb-12 max-w-2xl mx-auto">
              Join thousands of users who trust CuraSense for intelligent medical analysis. Start free, no credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 h-14 px-10 text-lg shadow-xl shadow-[hsl(var(--brand-primary)/0.3)]">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/help">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>

            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-8">
              <Check className="w-4 h-4 inline mr-1 text-emerald-500" />
              Free forever for personal use • No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-20" />
    </div>
  );
}

// ============================================
// MAIN LANDING PAGE
// ============================================
export default function HomePage() {
  const { isAuthenticated, user, isGuest } = useAuth();

  // Show dashboard for authenticated users OR guests
  if (isAuthenticated || isGuest) {
    return <AuthenticatedDashboard userName={user?.displayName || user?.firstName} isGuest={isGuest} />;
  }

  return <LandingPageContent />;
}
