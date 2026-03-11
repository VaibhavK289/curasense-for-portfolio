"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { springPresets } from "@/styles/tokens/animations";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Error illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springPresets.bouncy}
          className="relative mb-8"
        >
          {/* Pulsing background */}
          <motion.div
            className="absolute inset-0 mx-auto w-32 h-32 rounded-full bg-[hsl(var(--color-error)/0.1)]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Error icon */}
          <motion.div
            className="relative z-10 w-24 h-24 mx-auto rounded-2xl bg-[hsl(var(--color-error)/0.1)] flex items-center justify-center"
            initial={{ rotate: -10 }}
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
          >
            <AlertTriangle className="w-12 h-12 text-[hsl(var(--color-error))]" />
          </motion.div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...springPresets.smooth }}
        >
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3">
            Something went wrong
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-4 leading-relaxed">
            We encountered an unexpected error while processing your request. 
            Our team has been notified and is working on a fix.
          </p>
          
          {/* Error ID for support */}
          {error.digest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-lg bg-[hsl(var(--muted))] text-sm text-[hsl(var(--muted-foreground))]"
            >
              <Bug className="w-4 h-4" />
              Error ID: <code className="font-mono">{error.digest}</code>
            </motion.div>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...springPresets.smooth }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-6"
        >
          <Button onClick={reset} size="lg" className="gap-2 w-full sm:w-auto">
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Button>
          <Link href="/">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="h-5 w-5" />
              Go Home
            </Button>
          </Link>
        </motion.div>

        {/* Development error details */}
        {process.env.NODE_ENV === "development" && (
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-left"
          >
            <summary className="cursor-pointer text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              View error details (development only)
            </summary>
            <pre className="mt-2 p-4 rounded-lg bg-[hsl(var(--muted))] text-xs overflow-auto max-h-40">
              <code className="text-[hsl(var(--color-error))]">
                {error.message}
              </code>
              <code className="block mt-2 text-[hsl(var(--muted-foreground))]">
                {error.stack}
              </code>
            </pre>
          </motion.details>
        )}
      </div>
    </div>
  );
}
