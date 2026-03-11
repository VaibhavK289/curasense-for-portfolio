"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Custom hook for client-side detection without the setState-in-effect warning
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// ============================================
// ELITE MESH GRADIENT SYSTEM
// Inspired by Linear, Stripe, Vercel
// ============================================
function MeshGradient({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Primary gradient blob */}
      <div
        className={cn(
          "absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full blur-[120px]",
          "animate-mesh-float-1",
          isDark
            ? "bg-[hsl(var(--brand-primary)/0.15)]"
            : "bg-[hsl(var(--brand-primary)/0.08)]"
        )}
      />

      {/* Secondary gradient blob */}
      <div
        className={cn(
          "absolute -top-[10%] -right-[20%] w-[60%] h-[60%] rounded-full blur-[100px]",
          "animate-mesh-float-2",
          isDark
            ? "bg-[hsl(var(--brand-secondary)/0.12)]"
            : "bg-[hsl(var(--brand-secondary)/0.06)]"
        )}
      />

      {/* Tertiary accent blob */}
      <div
        className={cn(
          "absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[100px]",
          "animate-mesh-float-3",
          isDark
            ? "bg-[hsl(var(--color-info)/0.08)]"
            : "bg-[hsl(var(--color-info)/0.04)]"
        )}
      />

      {/* Bottom accent for depth */}
      <div
        className={cn(
          "absolute -bottom-[30%] right-[10%] w-[50%] h-[50%] rounded-full blur-[120px]",
          "animate-mesh-float-4",
          isDark
            ? "bg-[hsl(var(--brand-primary)/0.1)]"
            : "bg-[hsl(var(--brand-primary)/0.05)]"
        )}
      />
    </div>
  );
}

// ============================================
// NOISE TEXTURE OVERLAY
// Adds organic grain like premium sites
// ============================================
function NoiseTexture({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[1]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity,
      }}
    />
  );
}

// ============================================
// GRID MESH PATTERN
// Subtle structural grid like Linear
// ============================================
function GridMesh({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        backgroundImage: isDark
          ? `linear-gradient(to right, hsl(var(--neutral-800) / 0.4) 1px, transparent 1px),
             linear-gradient(to bottom, hsl(var(--neutral-800) / 0.4) 1px, transparent 1px)`
          : `linear-gradient(to right, hsl(var(--neutral-200) / 0.5) 1px, transparent 1px),
             linear-gradient(to bottom, hsl(var(--neutral-200) / 0.5) 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 100%)",
      }}
    />
  );
}

// ============================================
// AURORA EFFECT
// Northern lights inspired ambient animation
// ============================================
function AuroraEffect({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!isDark) return null;

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Primary aurora band */}
      <div
        className="absolute top-0 left-[5%] w-[90%] h-[300px] blur-[80px] rounded-full animate-aurora-1"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%,
            hsl(var(--brand-primary) / 0.15) 20%,
            hsl(var(--brand-secondary) / 0.12) 40%,
            hsl(var(--color-info) / 0.08) 60%,
            hsl(var(--brand-primary) / 0.12) 80%,
            transparent 100%
          )`,
        }}
      />
      {/* Secondary aurora shimmer */}
      <div
        className="absolute top-[5%] left-[15%] w-[70%] h-[200px] blur-[60px] rounded-full animate-aurora-2"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%,
            hsl(var(--brand-secondary) / 0.1) 30%,
            hsl(var(--color-success) / 0.08) 50%,
            hsl(var(--brand-primary) / 0.1) 70%,
            transparent 100%
          )`,
        }}
      />
    </div>
  );
}

// ============================================
// FLOATING PARTICLES
// Subtle animated particles for depth
// ============================================

// Pre-generate particle data to avoid impure render
const PARTICLE_DATA = [
  { id: 0, size: 2.5, x: 15, y: 25, duration: 22, delay: 3, drift: 8 },
  { id: 1, size: 1.8, x: 45, y: 10, duration: 28, delay: 0, drift: -5 },
  { id: 2, size: 3.2, x: 75, y: 55, duration: 25, delay: 7, drift: 12 },
  { id: 3, size: 1.5, x: 30, y: 70, duration: 30, delay: 2, drift: -8 },
  { id: 4, size: 2.8, x: 85, y: 30, duration: 20, delay: 5, drift: 6 },
  { id: 5, size: 2.0, x: 10, y: 85, duration: 27, delay: 8, drift: -10 },
  { id: 6, size: 3.5, x: 55, y: 40, duration: 23, delay: 1, drift: 15 },
  { id: 7, size: 1.2, x: 90, y: 75, duration: 32, delay: 4, drift: -7 },
  { id: 8, size: 2.3, x: 25, y: 15, duration: 26, delay: 6, drift: 9 },
  { id: 9, size: 1.7, x: 65, y: 90, duration: 21, delay: 9, drift: -12 },
  { id: 10, size: 2.9, x: 5, y: 50, duration: 29, delay: 0, drift: 7 },
  { id: 11, size: 1.4, x: 80, y: 5, duration: 24, delay: 3, drift: -6 },
  { id: 12, size: 3.0, x: 40, y: 80, duration: 31, delay: 7, drift: 11 },
  { id: 13, size: 2.1, x: 95, y: 45, duration: 19, delay: 2, drift: -9 },
  { id: 14, size: 1.6, x: 20, y: 35, duration: 28, delay: 5, drift: 8 },
  { id: 15, size: 2.7, x: 60, y: 65, duration: 22, delay: 8, drift: -4 },
  { id: 16, size: 1.9, x: 35, y: 95, duration: 26, delay: 1, drift: 10 },
  { id: 17, size: 3.3, x: 70, y: 20, duration: 25, delay: 6, drift: -11 },
  { id: 18, size: 2.4, x: 50, y: 60, duration: 30, delay: 4, drift: 5 },
  { id: 19, size: 1.3, x: 15, y: 45, duration: 27, delay: 9, drift: -8 },
];

function FloatingParticles() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLE_DATA.map((particle) => (
        <motion.div
          key={particle.id}
          className={cn(
            "absolute rounded-full",
            isDark ? "bg-white/20" : "bg-[hsl(var(--brand-primary))]/15"
          )}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, particle.drift, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// CURSOR SPOTLIGHT
// Interactive radial gradient following mouse
// ============================================
function CursorSpotlight() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isClient = useIsClient();

  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const backgroundStyle = useTransform(
    [x, y],
    ([latestX, latestY]) =>
      `radial-gradient(600px circle at ${latestX}px ${latestY}px, ${
        isDark
          ? "hsl(var(--brand-primary) / 0.06)"
          : "hsl(var(--brand-primary) / 0.03)"
      }, transparent 40%)`
  );

  useEffect(() => {
    if (!isClient) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isClient, mouseX, mouseY]);

  if (!isClient) return null;

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{ background: backgroundStyle }}
    />
  );
}

// ============================================
// STARFIELD EFFECT (Dark mode only)
// Subtle star pattern for depth
// ============================================
function Starfield() {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isClient = useIsClient();

  useEffect(() => {
    if (resolvedTheme !== "dark" || !canvasRef.current || !isClient) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Seed-based pseudo-random for consistent star positions
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000;
      return x - Math.floor(x);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawStars();
    };

    const drawStars = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const stars = 100;
      for (let i = 0; i < stars; i++) {
        const x = seededRandom(i * 1) * canvas.width;
        const y = seededRandom(i * 2) * canvas.height;
        const radius = seededRandom(i * 3) * 1.2;
        const opacity = seededRandom(i * 4) * 0.5 + 0.1;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resolvedTheme, isClient]);

  if (resolvedTheme !== "dark" || !isClient) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-40"
    />
  );
}

// ============================================
// VIGNETTE EFFECT
// Subtle edge darkening for focus
// ============================================
function Vignette() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: isDark
          ? "radial-gradient(ellipse at center, transparent 40%, hsl(var(--background)) 100%)"
          : "radial-gradient(ellipse at center, transparent 50%, hsl(var(--background) / 0.3) 100%)",
      }}
    />
  );
}

// ============================================
// MAIN GLOBAL BACKGROUND COMPONENT
// Combines all layers into unified system
// ============================================
interface GlobalBackgroundProps {
  variant?: "default" | "hero" | "minimal" | "page";
  showCursor?: boolean;
  showGrid?: boolean;
  showAurora?: boolean;
  showParticles?: boolean;
  className?: string;
}

export function GlobalBackground({
  variant = "default",
  showCursor = true,
  showGrid = true,
  showAurora = true,
  showParticles = false,
  className,
}: GlobalBackgroundProps) {
  const isClient = useIsClient();

  // Render a placeholder on server to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={cn("fixed inset-0 -z-10 bg-[hsl(var(--background))]", className)} />
    );
  }

  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
      {/* Layer 1: Base background */}
      <div className="absolute inset-0 bg-[hsl(var(--background))]" />

      {/* Layer 2: Starfield (dark mode only) */}
      <Starfield />

      {/* Layer 3: Mesh gradient */}
      <MeshGradient />

      {/* Layer 4: Aurora effect */}
      {(showAurora || variant === "hero") && <AuroraEffect />}

      {/* Layer 5: Floating particles */}
      {(showParticles || variant === "hero") && <FloatingParticles />}

      {/* Layer 6: Grid mesh */}
      {showGrid && variant !== "minimal" && <GridMesh />}

      {/* Layer 7: Vignette */}
      <Vignette />

      {/* Layer 8: Noise texture */}
      <NoiseTexture opacity={0.025} />

      {/* Layer 9: Cursor spotlight */}
      {showCursor && <CursorSpotlight />}
    </div>
  );
}

// ============================================
// PAGE-SPECIFIC BACKGROUNDS
// ============================================

export function DiagnosisBackground() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base */}
      <div className="absolute inset-0 bg-[hsl(var(--background))]" />

      {/* Medical pulse line effect */}
      <div className="absolute top-[20%] left-0 right-0 h-px overflow-hidden opacity-20">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className={cn(
            "h-full w-[200px]",
            isDark
              ? "bg-gradient-to-r from-transparent via-[hsl(var(--color-diagnosis))] to-transparent"
              : "bg-gradient-to-r from-transparent via-[hsl(var(--color-diagnosis)/0.8)] to-transparent"
          )}
        />
      </div>

      {/* Diagnosis-colored gradient orbs */}
      <div
        className={cn(
          "absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] animate-mesh-float-1",
          isDark
            ? "bg-[hsl(var(--color-diagnosis)/0.1)]"
            : "bg-[hsl(var(--color-diagnosis)/0.05)]"
        )}
      />

      <div
        className={cn(
          "absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] animate-mesh-float-2",
          isDark
            ? "bg-[hsl(var(--brand-secondary)/0.08)]"
            : "bg-[hsl(var(--brand-secondary)/0.04)]"
        )}
      />

      {/* Grid overlay */}
      <GridMesh />

      {/* Noise */}
      <NoiseTexture opacity={0.02} />
    </div>
  );
}

export function MedicineBackground() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base */}
      <div className="absolute inset-0 bg-[hsl(var(--background))]" />

      {/* Molecular pattern effect */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="molecular" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="3" fill="currentColor" />
              <circle cx="50" cy="30" r="2" fill="currentColor" />
              <circle cx="80" cy="60" r="3" fill="currentColor" />
              <circle cx="30" cy="80" r="2" fill="currentColor" />
              <line x1="10" y1="10" x2="50" y2="30" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="30" x2="80" y2="60" stroke="currentColor" strokeWidth="0.5" />
              <line x1="80" y1="60" x2="30" y2="80" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#molecular)" className="text-[hsl(var(--color-medicine))]" />
        </svg>
      </div>

      {/* Medicine-colored orbs */}
      <div
        className={cn(
          "absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[130px] animate-mesh-float-1",
          isDark
            ? "bg-[hsl(var(--color-medicine)/0.12)]"
            : "bg-[hsl(var(--color-medicine)/0.06)]"
        )}
      />

      <div
        className={cn(
          "absolute bottom-[20%] right-[5%] w-[400px] h-[400px] rounded-full blur-[100px] animate-mesh-float-3",
          isDark
            ? "bg-[hsl(var(--brand-primary)/0.1)]"
            : "bg-[hsl(var(--brand-primary)/0.05)]"
        )}
      />

      {/* Grid */}
      <GridMesh />

      {/* Noise */}
      <NoiseTexture opacity={0.02} />
    </div>
  );
}

// Export individual components for custom use
export {
  MeshGradient,
  NoiseTexture,
  GridMesh,
  AuroraEffect,
  FloatingParticles,
  CursorSpotlight,
  Starfield,
  Vignette,
};
