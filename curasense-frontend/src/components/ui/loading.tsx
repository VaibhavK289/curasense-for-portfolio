"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[hsl(var(--muted))]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Text skeleton with multiple lines
 */
export function TextSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton for loading cards
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6",
        className
      )}
    >
      {/* Icon placeholder */}
      <Skeleton className="h-12 w-12 rounded-lg mb-4" />
      
      {/* Title */}
      <Skeleton className="h-6 w-3/4 mb-3" />
      
      {/* Description lines */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      
      {/* Footer/CTA */}
      <Skeleton className="h-4 w-24 mt-6" />
    </div>
  );
}

/**
 * Stats card skeleton
 */
export function StatSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center",
        className
      )}
    >
      <Skeleton className="h-8 w-8 rounded-full mx-auto mb-4" />
      <Skeleton className="h-8 w-16 mx-auto mb-2" />
      <Skeleton className="h-4 w-24 mx-auto" />
    </div>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-[hsl(var(--border))] overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-[hsl(var(--muted))] p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-[hsl(var(--border))]">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Chat message skeleton
 */
export function ChatMessageSkeleton({
  isUser = false,
  className,
}: {
  isUser?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {/* Avatar */}
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      
      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl p-4",
          isUser
            ? "bg-[hsl(var(--brand-primary)/0.1)]"
            : "bg-[hsl(var(--muted))]"
        )}
      >
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

/**
 * Form skeleton
 */
export function FormSkeleton({
  fields = 3,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}

/**
 * Image/File upload skeleton
 */
export function UploadSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed border-[hsl(var(--border))] p-12 flex flex-col items-center justify-center",
        className
      )}
    >
      <Skeleton className="h-16 w-16 rounded-full mb-4" />
      <Skeleton className="h-5 w-48 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

/**
 * Page loading skeleton with motion
 */
export function PageLoadingSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("space-y-8", className)}
    >
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Content grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Table */}
      <TableSkeleton rows={4} columns={4} />
    </motion.div>
  );
}

/**
 * Dashboard loading skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main area */}
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton />
          <TableSkeleton rows={5} columns={3} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * Spinner for inline loading states
 */
export function Spinner({
  size = "default",
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <svg
      className={cn(
        "animate-spin text-[hsl(var(--brand-primary))]",
        sizeClasses[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Full page loader
 */
export function FullPageLoader({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <Spinner size="lg" />
        </motion.div>
        {message && (
          <p className="text-[hsl(var(--muted-foreground))] animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Skeleton;
