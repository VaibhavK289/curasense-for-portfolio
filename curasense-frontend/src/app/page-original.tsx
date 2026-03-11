"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  GradientText,
  FloatingOrb,
  SpotlightCard,
  PulsingDot,
  TiltCard,
  StaggerContainer,
  StaggerItem,
  AnimatedContainer,
  OrganicBlob,
  DNAPattern,
  HeartbeatDivider,
} from "@/components/ui/aceternity";
import { springPresets, animationVariants } from "@/styles/tokens/animations";
import { useAuth } from "@/lib/auth-context";

// Feature cards with semantic category colors
const features = [
  {
    icon: FileText,
    title: "Prescription Analysis",
    description:
      "Upload any medical prescription or blood test report PDF for instant AI-powered analysis and insights.",
    href: "/diagnosis/prescription",
    bgColor: "bg-[hsl(var(--color-diagnosis))]",
    shadowColor: "shadow-[hsl(var(--color-diagnosis)/0.3)]",
    hoverShadow: "hover:shadow-[hsl(var(--color-diagnosis)/0.2)]",
    textColor: "text-[hsl(var(--color-diagnosis))]",
  },
  {
    icon: ScanLine,
    title: "X-Ray & CT Analysis",
    description:
      "Advanced vision AI to analyze X-rays, CT scans, and MRI images with detailed diagnostic reports.",
    href: "/diagnosis/xray",
    bgColor: "bg-[hsl(var(--color-imaging))]",
    shadowColor: "shadow-[hsl(var(--color-imaging)/0.3)]",
    hoverShadow: "hover:shadow-[hsl(var(--color-imaging)/0.2)]",
    textColor: "text-[hsl(var(--color-imaging))]",
  },
  {
    icon: Pill,
    title: "Medicine Comparison",
    description:
      "Compare medications, check interactions, and find alternatives with comprehensive drug information.",
    href: "/medicine",
    bgColor: "bg-[hsl(var(--color-medicine))]",
    shadowColor: "shadow-[hsl(var(--color-medicine)/0.3)]",
    hoverShadow: "hover:shadow-[hsl(var(--color-medicine)/0.2)]",
    textColor: "text-[hsl(var(--color-medicine))]",
  },
];

// Stats with varied icon colors - highlighting capabilities, not vanity metrics
const stats = [
  { label: "Document Types", value: "6+", icon: FileText, color: "text-[hsl(var(--color-diagnosis))]" },
  { label: "Analysis Speed", value: "<30s", icon: Zap, color: "text-[hsl(var(--color-warning))]" },
  { label: "AI Models", value: "3", icon: Brain, color: "text-[hsl(var(--brand-secondary))]" },
  { label: "Always Available", value: "24/7", icon: Shield, color: "text-[hsl(var(--color-success))]" },
];

// How it works steps with sequential colors
const howItWorksSteps = [
  {
    step: "01",
    title: "Upload Your Document",
    desc: "Simply drag and drop your prescription, report, or medical image",
    icon: FileText,
    color: "from-[hsl(var(--color-info))] to-[hsl(201_96%_45%)]",
  },
  {
    step: "02",
    title: "AI Analysis",
    desc: "Our advanced AI models process and analyze your medical data",
    icon: Brain,
    color: "from-[hsl(var(--brand-secondary))] to-[hsl(262_83%_65%)]",
  },
  {
    step: "03",
    title: "Get Insights",
    desc: "Receive detailed reports, recommendations, and answers to your questions",
    icon: Activity,
    color: "from-[hsl(var(--color-success))] to-[hsl(142_76%_50%)]",
  },
];

// Authenticated Dashboard Component - what logged-in users see
function AuthenticatedDashboard({ userName }: { userName?: string }) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative min-h-screen">
      {/* Subtle background */}
      <FloatingOrb 
        className="w-64 h-64 -top-32 -right-32 opacity-30" 
        delay={0} 
        color="brand-primary"
      />

      <div className="relative z-10 space-y-8">
        {/* Welcome Section */}
        <section className="pt-4 pb-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.smooth}
          >
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
              {greeting()}, {userName?.split(" ")[0] || "User"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">
              What would you like to analyze today?
            </h1>
          </motion.div>
        </section>

        {/* Quick Actions Grid */}
        <section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, ...springPresets.smooth }}
              >
                <Link href={feature.href}>
                  <Card className="h-full cursor-pointer hover:border-[hsl(var(--brand-primary)/0.4)] transition-colors p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center flex-shrink-0`}
                      >
                        <feature.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                          {feature.description}
                        </p>
                      </div>
                      <ArrowRight className={`h-4 w-4 ${feature.textColor} flex-shrink-0 mt-1`} />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Activity - placeholder for real data */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              Recent Activity
            </h2>
            <Link 
              href="/history" 
              className="text-sm text-[hsl(var(--brand-primary))] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
              </div>
              <h3 className="text-base font-medium text-[hsl(var(--foreground))] mb-1">
                No recent reports
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm">
                Upload a prescription, X-ray, or start a medicine comparison to see your analysis history here.
              </p>
              <Link href="/diagnosis/prescription" className="mt-4">
                <Button size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Prescription
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        {/* System Status - subtle, not flashy */}
        <section className="pb-8">
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="flex h-2 w-2 rounded-full bg-[hsl(var(--color-success))]" />
            All AI systems operational
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  // Authenticated users see a dashboard, not the marketing landing page
  if (isAuthenticated) {
    return <AuthenticatedDashboard userName={user?.displayName || user?.firstName} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Elements - Organic shapes mixed with orbs */}
      <FloatingOrb 
        className="w-80 h-80 -top-40 -left-40" 
        delay={0} 
        color="brand-primary"
      />
      <OrganicBlob 
        className="absolute -top-20 right-0 w-[500px] h-[500px] opacity-30"
        color="brand-secondary"
      />
      <FloatingOrb 
        className="w-48 h-48 bottom-1/4 -right-24" 
        delay={3} 
        color="brand-secondary"
      />

      <div className="relative z-10 space-y-24">
        {/* Hero Section with varied entrance animations */}
        <section className="text-center pt-8">
          {/* Status Badge - scale in with bounce */}
          <motion.div 
            variants={animationVariants.scaleIn}
            initial="initial"
            animate="animate"
            transition={springPresets.bouncy}
            className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--color-success)/0.3)] bg-[hsl(var(--color-success)/0.1)] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[hsl(var(--color-success))] mb-6 sm:mb-8"
          >
            <PulsingDot color="success" />
            <span>AI-Powered Healthcare</span>
          </motion.div>

          {/* Main Headline - blur in effect */}
          <motion.h1 
            variants={animationVariants.blurIn}
            initial="initial"
            animate="animate"
            transition={{ ...springPresets.smooth, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 text-[hsl(var(--foreground))] px-2"
          >
            Your Health, Powered by{" "}
            <GradientText variant="brand" className="block mt-1 sm:mt-2">
              Intelligent AI
            </GradientText>
          </motion.h1>

          {/* Subtitle - fade up */}
          <motion.p 
            variants={animationVariants.fadeUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4"
          >
            CuraSense combines cutting-edge AI with medical expertise to provide
            instant analysis of prescriptions, medical images, and drug
            comparisons.
          </motion.p>

          {/* CTA Buttons - stack on mobile */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <motion.div
              variants={animationVariants.slideInLeft}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3, ...springPresets.snappy }}
              className="w-full sm:w-auto"
            >
              <Link href="/diagnosis" className="block">
                <Button size="lg" variant="default" className="gap-2 text-sm sm:text-base px-6 sm:px-8 w-full sm:w-auto h-12 sm:h-11 shape-sharp active:scale-[0.98]">
                  <Stethoscope className="h-5 w-5" />
                  Start Diagnosis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              variants={animationVariants.slideInRight}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.35, ...springPresets.snappy }}
              className="w-full sm:w-auto"
            >
              <Link href="/medicine" className="block">
                <Button size="lg" variant="outline" className="gap-2 text-sm sm:text-base px-6 sm:px-8 w-full sm:w-auto h-12 sm:h-11 shape-capsule active:scale-[0.98]">
                  <Pill className="h-5 w-5" />
                  Compare Medicines
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Decorative DNA Pattern divider - hidden on small mobile */}
        <DNAPattern className="mx-auto max-w-md hidden sm:block" />

        {/* Stats Section with varied stagger animations */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <motion.div
                whileHover={{ y: -4, transition: springPresets.snappy }}
                whileTap={{ scale: 0.98 }}
              >
                <SpotlightCard className="text-center p-4 sm:p-6 md:p-8 shape-asymmetric">
                  <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-4 ${stat.color}`} />
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-0.5 sm:mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
                    {stat.label}
                  </div>
                </SpotlightCard>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Heartbeat divider */}
        <HeartbeatDivider className="my-6 sm:my-8" color="success" />

        {/* Main Features with varied shapes */}
        <section>
          <AnimatedContainer variant="scaleIn" className="text-center mb-8 sm:mb-12 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-3 sm:mb-4">
              Powerful Healthcare Tools
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-sm sm:text-base lg:text-lg max-w-xl mx-auto">
              Three specialized AI models working together for comprehensive healthcare support
            </p>
          </AnimatedContainer>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, rotate: -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.12,
                  ...springPresets.smooth
                }}
              >
                <Link href={feature.href}>
                  <TiltCard 
                    className={`h-full cursor-pointer active:scale-[0.98] ${index === 1 ? 'shape-soft' : index === 2 ? 'shape-asymmetric-alt' : ''}`}
                  >
                    <div className="h-full flex flex-col p-4 sm:p-6 md:p-8">
                      {/* Icon with category color and varied shape */}
                      <div
                        className={`w-11 h-11 sm:w-14 sm:h-14 ${index === 0 ? 'rounded-xl' : index === 1 ? 'rounded-2xl' : 'shape-squircle'} ${feature.bgColor} flex items-center justify-center mb-4 sm:mb-6 shadow-lg ${feature.shadowColor}`}
                      >
                        <feature.icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-lg sm:text-xl font-semibold text-[hsl(var(--foreground))] mb-2 sm:mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] mb-4 sm:mb-6 flex-grow leading-relaxed">
                        {feature.description}
                      </p>
                      
                      {/* CTA with category color */}
                      <motion.div 
                        className={`flex items-center gap-2 ${feature.textColor} font-medium text-sm sm:text-base`}
                        whileHover={{ x: 4 }}
                        transition={springPresets.snappy}
                      >
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </div>
                  </TiltCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works with varied step colors */}
        <AnimatedContainer variant="fadeLeft">
          <Card className="overflow-hidden border-0 shadow-xl shape-asymmetric">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Steps */}
              <div className="p-5 sm:p-8 md:p-12 lg:p-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-6 sm:mb-8">
                  How CuraSense Works
                </h2>
                <div className="space-y-5 sm:space-y-8">
                  {howItWorksSteps.map((item, index) => (
                    <motion.div 
                      key={item.step} 
                      className="flex gap-4 sm:gap-5"
                      initial={{ opacity: 0, x: -30, scale: 0.95 }}
                      whileInView={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ 
                        delay: index * 0.15, 
                        ...springPresets.smooth 
                      }}
                      viewport={{ once: true }}
                    >
                      <div className="flex-shrink-0">
                        <motion.div 
                          className={`w-10 h-10 sm:w-12 sm:h-12 ${index === 0 ? 'rounded-lg' : index === 1 ? 'rounded-xl' : 'rounded-2xl'} bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={springPresets.bouncy}
                        >
                          {item.step}
                        </motion.div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[hsl(var(--foreground))] text-base sm:text-lg mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Health CTA Panel - using brand gradient */}
              <div className="bg-gradient-to-br from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] p-5 sm:p-8 md:p-12 lg:p-16 flex items-center justify-center relative overflow-hidden">
                {/* Decorative organic blob */}
                <div className="absolute inset-0 opacity-10">
                  <OrganicBlob className="absolute -top-20 -right-20 w-[400px] h-[400px]" color="brand-secondary" />
                </div>
                
                <div className="text-center text-white relative z-10">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <Heart className="h-20 w-20 mx-auto mb-6 drop-shadow-lg" />
                  </motion.div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Your Health Matters</h3>
                  <p className="text-white/90 max-w-sm mx-auto leading-relaxed">
                    CuraSense is designed to assist and inform, not replace professional medical advice.
                    Always consult with healthcare professionals.
                  </p>
                  <motion.div 
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/80 shape-pill bg-white/10 px-4 py-2"
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Built for Privacy & Security
                  </motion.div>
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        {/* Trust Banner with semantic colors */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center pb-8"
        >
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 uppercase tracking-wider font-medium">
            Trusted by healthcare professionals worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10">
            {[
              { Icon: Clock, label: "Fast" },
              { Icon: Shield, label: "Secure" },
              { Icon: Brain, label: "Smart" },
              { Icon: Activity, label: "Accurate" },
              { Icon: Heart, label: "Caring" },
            ].map(({ Icon, label }, i) => (
              <motion.div 
                key={label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -3, scale: 1.1 }}
                className="flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground)/0.6)] hover:text-[hsl(var(--muted-foreground))] transition-colors cursor-default"
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
