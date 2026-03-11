"use client";

import { useSyncExternalStore } from "react";

/**
 * useReducedMotion
 * Respects user's motion preferences
 * WCAG 2.3.3: Animation from Interactions (Level AAA)
 */
function getSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot(): boolean {
  return false; // Default to no reduced motion on server
}

function subscribe(callback: () => void): () => void {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
