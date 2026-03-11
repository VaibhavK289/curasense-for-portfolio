"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useInView,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { springPresets } from "@/styles/tokens/animations";

// ============================================
// REVEAL ON SCROLL
// Animate elements when they enter viewport
// ============================================
interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

export function RevealOnScroll({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.3,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        ...directions[direction],
        filter: "blur(8px)",
      }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        x: 0,
        filter: "blur(0px)",
      } : undefined}
      transition={{ 
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// TEXT REVEAL
// Word-by-word text animation
// ============================================
interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
}

export function TextReveal({
  children,
  className,
  delay = 0,
  staggerDelay = 0.03,
  once = true,
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  
  const words = children.split(" ");

  return (
    <motion.div 
      ref={ref}
      className={cn("flex flex-wrap", className)}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
          transition={{
            duration: 0.4,
            delay: delay + i * staggerDelay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mr-[0.25em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

// ============================================
// PARALLAX SECTION
// Scroll-based parallax effect
// ============================================
interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: "vertical" | "horizontal";
}

export function ParallaxSection({
  children,
  className,
  speed = 0.5,
  direction = "vertical",
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: isMounted ? ref : undefined,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);
  const x = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);
  
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });
  const smoothX = useSpring(x, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div
        style={{ 
          y: direction === "vertical" ? smoothY : 0,
          x: direction === "horizontal" ? smoothX : 0,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// STAGGER REVEAL
// Reveals children with staggered animation
// ============================================
interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function StaggerReveal({
  children,
  className,
  staggerDelay = 0.1,
  direction = "up",
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const directions = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { 
              opacity: 0, 
              ...directions[direction],
              filter: "blur(4px)",
            },
            visible: { 
              opacity: 1, 
              y: 0, 
              x: 0,
              filter: "blur(0px)",
              transition: springPresets.smooth,
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================
// COUNT UP ANIMATION
// Animated number counter
// ============================================
interface CountUpProps {
  target: number;
  duration?: number;
  decimals?: number;
  className?: string;
}

export function CountUp({
  target,
  duration = 2,
  decimals = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Ease out expo
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(easeOutExpo * target);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {count.toFixed(decimals)}
    </span>
  );
}

// ============================================
// FLOATING ELEMENT
// Gentle floating animation
// ============================================
interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
  delay?: number;
}

export function FloatingElement({
  children,
  className,
  duration = 6,
  distance = 10,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// MAGNETIC ELEMENT
// Element that follows cursor within range
// ============================================
interface MagneticElementProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticElement({
  children,
  className,
  strength = 0.3,
}: MagneticElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setPosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={position}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// SCROLL PROGRESS
// Visual scroll progress indicator
// ============================================
interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className={cn(
        "fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] z-50 origin-left",
        className
      )}
      style={{ scaleX }}
    />
  );
}
