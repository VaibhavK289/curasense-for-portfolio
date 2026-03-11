"use client";

import { cn } from "@/lib/utils";

/**
 * Skip Navigation Link
 * Allows keyboard users to skip to main content
 * WCAG 2.4.1: Bypass Blocks (Level A)
 */
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className={cn(
        // Visually hidden until focused
        "fixed left-4 top-4 z-[100] -translate-y-full opacity-0",
        "focus:translate-y-0 focus:opacity-100",
        // Styling when visible
        "rounded-lg bg-[hsl(var(--brand-primary))] px-4 py-3 text-sm font-semibold text-white",
        "shadow-lg ring-2 ring-white ring-offset-2 ring-offset-[hsl(var(--background))]",
        "transition-all duration-200 focus:outline-none"
      )}
    >
      Skip to main content
    </a>
  );
}

/**
 * Skip Navigation Target
 * Mark the main content area
 */
interface SkipNavTargetProps {
  children: React.ReactNode;
  className?: string;
}

export function SkipNavTarget({ children, className }: SkipNavTargetProps) {
  return (
    <main
      id="main-content"
      className={className}
      tabIndex={-1}
      // Remove focus outline when clicked (but keep for keyboard)
      style={{ outline: "none" }}
    >
      {children}
    </main>
  );
}
