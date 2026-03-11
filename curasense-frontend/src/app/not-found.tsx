"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Search, ArrowLeft, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { springPresets } from "@/styles/tokens/animations";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Animated 404 illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springPresets.bouncy}
          className="relative mb-8"
        >
          {/* Background circle */}
          <motion.div
            className="absolute inset-0 mx-auto w-48 h-48 rounded-full bg-[hsl(var(--brand-primary)/0.1)]"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* 404 Number with heartbeat line */}
          <div className="relative z-10 py-8">
            <motion.div
              className="text-8xl font-bold text-[hsl(var(--foreground))] tracking-tight"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, ...springPresets.bouncy }}
            >
              4
              <motion.span
                className="inline-block text-[hsl(var(--brand-primary))]"
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Stethoscope className="inline w-16 h-16 -mt-4" />
              </motion.span>
              4
            </motion.div>
            
            {/* Flatline SVG */}
            <motion.svg
              viewBox="0 0 300 40"
              className="w-64 h-8 mx-auto mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.path
                d="M0,20 L80,20 L100,20 L110,5 L120,35 L130,20 L150,20 L300,20"
                fill="none"
                stroke="hsl(var(--color-error))"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
              />
            </motion.svg>
          </div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...springPresets.smooth }}
        >
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3">
            Page Not Found
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
            The page you&apos;re looking for seems to have gone for a check-up. 
            It might have been moved, deleted, or never existed.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ...springPresets.smooth }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Link href="/diagnosis">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Search className="h-5 w-5" />
              Try Diagnosis
            </Button>
          </Link>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back to previous page
          </button>
        </motion.div>
      </div>
    </div>
  );
}
