"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for catching and handling React errors gracefully.
 * Provides a user-friendly error message and recovery options.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service in production
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });

    // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[hsl(var(--color-error)/0.1)] flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-[hsl(var(--color-error))]" />
            </div>

            {/* Error Message */}
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
              Something went wrong
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">
              We encountered an unexpected error. This has been logged and we&apos;ll look into it.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Error details
                </summary>
                <pre className="mt-2 p-4 rounded-lg bg-[hsl(var(--muted))] text-xs overflow-auto max-h-40">
                  <code className="text-[hsl(var(--color-error))]">
                    {this.state.error.toString()}
                  </code>
                  {this.state.errorInfo && (
                    <code className="block mt-2 text-[hsl(var(--muted-foreground))]">
                      {this.state.errorInfo.componentStack}
                    </code>
                  )}
                </pre>
              </details>
            )}

            {/* Recovery Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                variant="default"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Link href="/">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for async error boundaries (for suspense)
 */
export function AsyncErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * Page-level error fallback component
 */
export function PageErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[hsl(var(--color-error)/0.1)] flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-[hsl(var(--color-error))]" />
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-3">
          Page Error
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-8 text-lg">
          This page encountered an error and couldn&apos;t load properly.
        </p>

        {/* Error ID for support */}
        {error.digest && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
            Error ID: <code className="font-mono">{error.digest}</code>
          </p>
        )}

        {/* Recovery Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="default" size="lg" className="gap-2">
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="h-5 w-5" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline error component for smaller error states
 */
export function InlineError({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-[hsl(var(--color-error)/0.2)] bg-[hsl(var(--color-error)/0.05)]">
      <AlertTriangle className="h-5 w-5 text-[hsl(var(--color-error))] flex-shrink-0" />
      <p className="text-sm text-[hsl(var(--color-error))] flex-grow">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          className="flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default ErrorBoundary;
