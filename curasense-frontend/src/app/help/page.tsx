"use client";

import { motion } from "framer-motion";
import { HelpCircle, Book, MessageCircle, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradientText, SpotlightCard } from "@/components/ui/aceternity";
import { springPresets } from "@/styles/tokens/animations";

const faqs = [
  {
    question: "How accurate is the AI analysis?",
    answer:
      "Our AI models achieve over 95% accuracy in document parsing and provide comprehensive analysis. However, results should always be verified by healthcare professionals.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "For prescriptions and reports, we support PDF files. For medical imaging, we support JPG, PNG, and DICOM formats.",
  },
  {
    question: "Is my medical data secure?",
    answer:
      "Yes, all data is processed securely and is not stored permanently. Each session is isolated and data is automatically cleared after use.",
  },
  {
    question: "Can I use this for actual medical decisions?",
    answer:
      "CuraSense is designed as an informational tool only. Always consult with qualified healthcare professionals for medical decisions.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[hsl(var(--brand-primary)/0.06)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[hsl(var(--brand-secondary)/0.06)] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.smooth}
        className="container max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] shadow-lg shadow-[hsl(var(--brand-primary)/0.3)]">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                <GradientText>Help & Support</GradientText>
              </h1>
              <p className="text-[hsl(var(--muted-foreground))]">
                Get help with CuraSense features and find answers to common questions
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <SpotlightCard className="p-6 text-center">
            <Book className="h-10 w-10 mx-auto mb-4 text-[hsl(var(--brand-primary))]" />
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">
              Documentation
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              Learn how to use all CuraSense features
            </p>
            <Link href="/help/docs">
              <Button variant="outline" className="gap-2">
                Read Docs <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </SpotlightCard>

          <SpotlightCard className="p-6 text-center">
            <MessageCircle className="h-10 w-10 mx-auto mb-4 text-[hsl(var(--brand-primary))]" />
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">
              AI Assistant
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              Chat with our AI for instant help
            </p>
            <Button className="gap-2">
              Open Chat <MessageCircle className="h-4 w-4" />
            </Button>
          </SpotlightCard>

          <SpotlightCard className="p-6 text-center">
            <Mail className="h-10 w-10 mx-auto mb-4 text-[hsl(var(--brand-primary))]" />
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">
              Contact Support
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              Reach out for personalized assistance
            </p>
            <Button variant="outline" className="gap-2">
              Email Us <Mail className="h-4 w-4" />
            </Button>
          </SpotlightCard>
        </div>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find answers to common questions about CuraSense
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-[hsl(var(--border))] pb-6 last:border-0 last:pb-0"
                >
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-[hsl(var(--muted-foreground))]">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
