"use client";

import { cn } from "@/lib/utils";

interface CuraSenseLogoProps {
  className?: string;
  /** "white" for use on gradient/dark backgrounds, "brand" for use on light/card backgrounds */
  variant?: "white" | "brand";
}

/**
 * CuraSense Professional Logo
 * 
 * Design concept: A modern rounded shield silhouette containing an abstract
 * letter "C" formed by a negative-space arc, with a medical pulse/heartbeat
 * line cutting through the centre. The design conveys:
 *   - Protection & trust (shield form)
 *   - Healthcare & diagnostics (pulse line)
 *   - AI intelligence (geometric precision, clean arcs)
 *   - Brand identity ("C" monogram)
 */
export function CuraSenseLogo({ className, variant = "white" }: CuraSenseLogoProps) {
  const isWhite = variant === "white";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CuraSense logo"
      role="img"
    >
      {/* ── Shield body ── */}
      <path
        d="M16 1.5C16 1.5 4 5.5 4 7.5v7.5c0 7.73 5.33 14.5 12 16 6.67-1.5 12-8.27 12-16V7.5C28 5.5 16 1.5 16 1.5z"
        fill={isWhite ? "rgba(255,255,255,0.12)" : "hsl(var(--brand-primary) / 0.08)"}
        stroke={isWhite ? "rgba(255,255,255,0.85)" : "hsl(var(--brand-primary))"}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* ── Inner shield highlight (depth layer) ── */}
      <path
        d="M16 4C16 4 7 7.2 7 8.8v5.7c0 5.9 4.06 11.06 9 12.2 4.94-1.14 9-6.3 9-12.2V8.8C25 7.2 16 4 16 4z"
        fill={isWhite ? "rgba(255,255,255,0.06)" : "hsl(var(--brand-primary) / 0.04)"}
      />

      {/* ── "C" arc monogram ── */}
      <path
        d="M20.5 10.5a7 7 0 1 0 0 11"
        stroke={isWhite ? "white" : "hsl(var(--brand-primary))"}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity={isWhite ? 0.92 : 1}
      />

      {/* ── Pulse/heartbeat line ── */}
      <path
        d="M8.5 16h4l1.4-3.2 2.1 6.4 2.1-6.4L19.5 16h4"
        stroke={isWhite ? "hsl(168, 90%, 65%)" : "hsl(var(--brand-secondary))"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── Subtle AI dot accent (top-right) ── */}
      <circle
        cx="22"
        cy="8.5"
        r="1.2"
        fill={isWhite ? "hsl(168, 90%, 65%)" : "hsl(var(--brand-secondary))"}
        opacity="0.8"
      />
    </svg>
  );
}
