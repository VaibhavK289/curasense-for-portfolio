"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, ScanLine, ArrowRight, Stethoscope, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { GradientText, TiltCard, StaggerContainer, StaggerItem } from "@/components/ui/aceternity";
import { springPresets } from "@/styles/tokens/animations";

const diagnosisOptions = [
  {
    icon: FileText,
    title: "Upload Prescription / Medical Report",
    description:
      "Upload any PDF document including doctor prescriptions, blood test reports, diagnostic reports, and more. Our AI will analyze and provide detailed insights.",
    href: "/diagnosis/prescription",
    bgColor: "bg-[hsl(var(--color-diagnosis))]",
    shadowColor: "shadow-[hsl(var(--color-diagnosis)/0.3)]",
    textColor: "text-[hsl(var(--color-diagnosis))]",
    dotColor: "bg-[hsl(var(--color-diagnosis))]",
    features: [
      "PDF parsing and extraction",
      "Named Entity Recognition (NER)",
      "Medicine identification",
      "Dosage analysis",
      "Safety recommendations",
    ],
  },
  {
    icon: ScanLine,
    title: "X-Ray / CT Scan / MRI Analysis",
    description:
      "Upload medical images for AI-powered analysis. Get detailed reports about findings, abnormalities, and recommendations.",
    href: "/diagnosis/xray",
    bgColor: "bg-[hsl(var(--color-imaging))]",
    shadowColor: "shadow-[hsl(var(--color-imaging)/0.3)]",
    textColor: "text-[hsl(var(--color-imaging))]",
    dotColor: "bg-[hsl(var(--color-imaging))]",
    features: [
      "Image quality assessment",
      "Anatomical structure analysis",
      "Abnormality detection",
      "Clinical significance",
      "Follow-up recommendations",
    ],
  },
];

export default function DiagnosisPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[hsl(var(--brand-primary)/0.06)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[hsl(var(--brand-secondary)/0.06)] blur-3xl" />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.smooth}
      className="container max-w-5xl mx-auto py-6 px-4 sm:px-6 relative z-10"
    >
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] shadow-lg">
            <Stethoscope className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <GradientText>CuraSense Diagnosis</GradientText>
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              AI-powered medical document and image analysis
            </p>
          </div>
        </div>
      </div>

      {/* Diagnosis Options */}
      <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-2 gap-8">
        {diagnosisOptions.map((option) => (
          <StaggerItem key={option.title}>
            <Link href={option.href}>
              <TiltCard className="h-full cursor-pointer group p-8">
                <div className="h-full flex flex-col">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-xl ${option.bgColor} flex items-center justify-center mb-6 shadow-lg ${option.shadowColor} group-hover:scale-105 transition-transform duration-200`}
                  >
                    <option.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-3">
                    {option.title}
                  </h2>
                  <p className="text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                    {option.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-2.5 mb-8 flex-grow">
                    {option.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${option.dotColor}`} />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  {/* CTA */}
                  <div className={`flex items-center gap-2 ${option.textColor} font-semibold group-hover:gap-4 transition-all`}>
                    Start Analysis
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </TiltCard>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Info Section - using warning color for notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12"
      >
        <Card className="bg-[hsl(var(--color-warning)/0.08)] border-[hsl(var(--color-warning)/0.2)]">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--color-warning)/0.15)] flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-[hsl(var(--color-warning))]" />
              </div>
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">
                  Important Notice
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  CuraSense AI provides informational analysis only. Results should
                  not replace professional medical diagnosis. Always consult with
                  qualified healthcare providers for medical decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
    </div>
  );
}
