"use client";

import React from "react";

/**
 * Visually Hidden
 * Content visible only to screen readers
 * WCAG 1.3.1: Info and Relationships (Level A)
 */

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: React.ElementType;
}

export function VisuallyHidden({ children, as: Component = "span" }: VisuallyHiddenProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}
