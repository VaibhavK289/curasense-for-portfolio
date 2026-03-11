"use client";

import { useEffect, useRef, createContext, useContext, useState, ReactNode, useCallback } from "react";
import Lenis from "lenis";

// ============================================
// LENIS SMOOTH SCROLL CONTEXT
// Industry-standard smooth scrolling like Linear/Vercel
// ============================================

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProps {
  children: ReactNode;
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    orientation?: "vertical" | "horizontal";
    smoothWheel?: boolean;
    wheelMultiplier?: number;
    touchMultiplier?: number;
    infinite?: boolean;
  };
}

export function SmoothScroll({ children, options = {} }: SmoothScrollProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  const duration = options.duration ?? 1.2;
  const orientation = options.orientation ?? "vertical";
  const smoothWheel = options.smoothWheel ?? true;
  const wheelMultiplier = options.wheelMultiplier ?? 1;
  const touchMultiplier = options.touchMultiplier ?? 1.5;
  const infinite = options.infinite ?? false;

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (prefersReducedMotion) {
      return;
    }

    const lenisInstance = new Lenis({
      duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo easing
      orientation,
      smoothWheel,
      wheelMultiplier,
      touchMultiplier,
      infinite,
    });

    function raf(time: number) {
      lenisInstance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);
    
    const timeoutId = setTimeout(() => {
      setLenis(lenisInstance);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lenisInstance.destroy();
    };
  }, [duration, orientation, smoothWheel, wheelMultiplier, touchMultiplier, infinite]);

  const scrollTo = useCallback((
    target: string | number | HTMLElement,
    scrollOptions?: { offset?: number; duration?: number }
  ) => {
    if (lenis) {
      lenis.scrollTo(target, {
        offset: scrollOptions?.offset ?? 0,
        duration: scrollOptions?.duration ?? 1.2,
      });
    }
  }, [lenis]);

  const contextValue = { lenis, scrollTo };

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

// ============================================
// SCROLL PROGRESS INDICATOR
// Shows reading progress on pages
// ============================================
export function ScrollProgress({ className }: { className?: string }) {
  const [progress, setProgress] = useState(0);
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (!lenis) return;

    const handleScroll = () => {
      setProgress(lenis.progress);
    };

    lenis.on("scroll", handleScroll);
    return () => lenis.off("scroll", handleScroll);
  }, [lenis]);

  return (
    <div 
      className={`fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] z-50 transition-all duration-100 ${className}`}
      style={{ width: `${progress * 100}%` }}
    />
  );
}

// ============================================
// SCROLL TO TOP BUTTON
// Floating button to scroll to top
// ============================================
export function ScrollToTop({ threshold = 400 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);
  const { lenis, scrollTo } = useSmoothScroll();

  useEffect(() => {
    if (!lenis) return;

    const handleScroll = () => {
      setVisible(lenis.scroll > threshold);
    };

    lenis.on("scroll", handleScroll);
    return () => lenis.off("scroll", handleScroll);
  }, [lenis, threshold]);

  if (!visible) return null;

  return (
    <button
      onClick={() => scrollTo(0)}
      className="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-lg flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--brand-primary))] transition-all duration-200"
      aria-label="Scroll to top"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  );
}
