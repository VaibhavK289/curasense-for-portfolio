"use client";

import { motion } from "framer-motion";
import { 
  AlertCircle, 
  RefreshCw, 
  WifiOff, 
  Clock, 
  HelpCircle,
  Home,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/lib/use-error-recovery";
import Link from "next/link";

interface ErrorRecoveryCardProps {
  error: ErrorState;
  onRetry: () => void;
  onReset?: () => void;
  isRetrying?: boolean;
  nextRetryIn?: number | null;
  className?: string;
  showBackHome?: boolean;
}

/**
 * Error Recovery Card
 * Displays error with clear recovery actions
 * WCAG: role="alert" for screen readers
 */
export function ErrorRecoveryCard({
  error,
  onRetry,
  onReset,
  isRetrying = false,
  nextRetryIn,
  className,
  showBackHome = true,
}: ErrorRecoveryCardProps) {
  const formatRetryTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      role="alert"
      aria-live="assertive"
      className={className}
    >
      <Card className="p-6 border-[hsl(var(--color-error)/0.3)] bg-[hsl(var(--color-error)/0.05)]">
        <div className="flex flex-col items-center text-center">
          {/* Error Icon */}
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center mb-4",
            error.isOffline 
              ? "bg-[hsl(var(--color-warning)/0.1)]" 
              : "bg-[hsl(var(--color-error)/0.1)]"
          )}>
            {error.isOffline ? (
              <WifiOff className="h-7 w-7 text-[hsl(var(--color-warning))]" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-7 w-7 text-[hsl(var(--color-error))]" aria-hidden="true" />
            )}
          </div>

          {/* Error Title */}
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            {error.isOffline ? "You're Offline" : "Something Went Wrong"}
          </h3>

          {/* Error Message */}
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 max-w-md">
            {error.message}
          </p>

          {/* Retry Count Info */}
          {error.retryCount > 0 && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4 flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Attempt {error.retryCount} of 3
            </p>
          )}

          {/* Retry Countdown */}
          {isRetrying && nextRetryIn != null && (
            <div className="mb-4 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              </motion.div>
              <span>Retrying in {formatRetryTime(nextRetryIn)}...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {error.canRetry && !isRetrying && (
              <Button
                onClick={onRetry}
                className="gap-2"
                aria-label={`Retry request, attempt ${error.retryCount + 1} of 3`}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try Again
              </Button>
            )}

            {!error.canRetry && (
              <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                Maximum retries reached.
              </div>
            )}

            {onReset && (
              <Button
                variant="outline"
                onClick={onReset}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Start Over
              </Button>
            )}

            {showBackHome && (
              <Link href="/">
                <Button variant="ghost" className="gap-2">
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Back to Home
                </Button>
              </Link>
            )}
          </div>

          {/* Help Link */}
          <Link 
            href="/help" 
            className="mt-4 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--brand-primary))] flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="h-3 w-3" aria-hidden="true" />
            Need help?
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Inline Error Message
 * For smaller error displays within forms
 */
interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ message, onRetry, className }: InlineErrorProps) {
  return (
    <div 
      role="alert"
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg",
        "bg-[hsl(var(--color-error)/0.1)] border border-[hsl(var(--color-error)/0.2)]",
        "text-sm text-[hsl(var(--color-error))]",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onRetry}
          className="h-7 px-2 text-[hsl(var(--color-error))] hover:bg-[hsl(var(--color-error)/0.1)]"
        >
          <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  );
}
