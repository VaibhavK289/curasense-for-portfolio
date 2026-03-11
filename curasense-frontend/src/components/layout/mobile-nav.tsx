"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Pill,
  FileText,
  ScanLine,
  Home,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  History,
  BarChart3,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientText } from "@/components/ui/aceternity";
import { CuraSenseLogo } from "@/components/ui/logo";
import { springPresets } from "@/styles/tokens/animations";
import { useAuth } from "@/lib/auth-context";

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    color: "text-[hsl(var(--muted-foreground))]",
    activeColor: "text-[hsl(var(--foreground))]",
    activeBg: "bg-[hsl(var(--accent))]",
  },
  {
    name: "CuraSense Diagnosis",
    href: "/diagnosis",
    icon: Stethoscope,
    color: "text-[hsl(var(--color-diagnosis))]",
    activeColor: "text-[hsl(var(--color-diagnosis))]",
    activeBg: "bg-[hsl(var(--color-diagnosis)/0.1)]",
    children: [
      { name: "Upload Prescription", href: "/diagnosis/prescription", icon: FileText },
      { name: "X-Ray Analysis", href: "/diagnosis/xray", icon: ScanLine },
    ],
  },
  {
    name: "CuraSense Medicine",
    href: "/medicine",
    icon: Pill,
    color: "text-[hsl(var(--color-medicine))]",
    activeColor: "text-[hsl(var(--color-medicine))]",
    activeBg: "bg-[hsl(var(--color-medicine)/0.1)]",
  },
  {
    name: "Report History",
    href: "/history",
    icon: History,
    color: "text-[hsl(var(--color-records))]",
    activeColor: "text-[hsl(var(--color-records))]",
    activeBg: "bg-[hsl(var(--color-records)/0.1)]",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    color: "text-[hsl(var(--brand-secondary))]",
    activeColor: "text-[hsl(var(--brand-secondary))]",
    activeBg: "bg-[hsl(var(--brand-secondary)/0.1)]",
  },
  {
    name: "My Profile",
    href: "/profile",
    icon: User,
    color: "text-[hsl(var(--brand-primary))]",
    activeColor: "text-[hsl(var(--brand-primary))]",
    activeBg: "bg-[hsl(var(--brand-primary)/0.1)]",
  },
];

const bottomNav = [
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Bottom tab bar items for quick access
const tabBarItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Diagnosis", href: "/diagnosis", icon: Stethoscope },
  { name: "Medicine", href: "/medicine", icon: Pill },
  { name: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const prevPathnameRef = useRef(pathname);

  // Close menu on route change using ref to track previous value
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      // Use flushSync alternative - schedule for next tick
      queueMicrotask(() => setIsOpen(false));
    }
  }, [pathname]);

  // Callback for toggle event
  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Listen for toggle event from header
  useEffect(() => {
    window.addEventListener('toggleMobileNav', handleToggle);
    return () => window.removeEventListener('toggleMobileNav', handleToggle);
  }, [handleToggle]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Only show mobile nav when user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button - shown in header on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors active:scale-95"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Full Screen Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={springPresets.snappy}
              className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm bg-[hsl(var(--card))] shadow-2xl lg:hidden"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary))] via-[hsl(168_84%_38%)] to-[hsl(var(--brand-secondary))] shadow-lg">
                      <CuraSenseLogo className="h-5 w-5" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold">
                        <GradientText>CuraSense</GradientText>
                      </h1>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] tracking-widest uppercase">
                        AI Healthcare
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] active:scale-95 transition-all"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    Main Menu
                  </div>
                  {navigation.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.children &&
                        item.children.some((child) => pathname === child.href));

                    return (
                      <div key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200 active:scale-[0.98]",
                            isActive
                              ? cn(item.activeBg, item.activeColor)
                              : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 transition-colors",
                              isActive ? item.activeColor : "text-[hsl(var(--muted-foreground))]"
                            )}
                          />
                          {item.name}
                          {item.children && (
                            <ChevronRight
                              className={cn(
                                "ml-auto h-4 w-4 transition-transform",
                                isActive && "rotate-90"
                              )}
                            />
                          )}
                        </Link>

                        {/* Children */}
                        {item.children && isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="ml-4 mt-1 space-y-1 border-l-2 pl-4 border-[hsl(var(--color-diagnosis)/0.3)]"
                          >
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 active:scale-[0.98]",
                                  pathname === child.href
                                    ? "bg-[hsl(var(--color-diagnosis)/0.1)] text-[hsl(var(--color-diagnosis))] font-medium"
                                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--color-diagnosis))]"
                                )}
                              >
                                <child.icon className="h-4 w-4" />
                                {child.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {/* Bottom Navigation */}
                <div className="border-t border-[hsl(var(--border))] p-4 space-y-1">
                  {bottomNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] active:scale-[0.98] transition-all"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Status Card */}
                <div className="m-4 rounded-xl bg-gradient-to-br from-[hsl(var(--color-success))] to-[hsl(142_76%_45%)] p-4 text-white shadow-lg">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
                    AI Systems Online
                  </div>
                  <p className="mt-1 text-xs text-white/80">
                    3 ML models ready for analysis
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar - Fixed at bottom for quick navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, ...springPresets.smooth }}
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      >
        {/* Safe area padding for iOS */}
        <div className="bg-[hsl(var(--card)/0.98)] border-t border-[hsl(var(--border))] backdrop-blur-xl pb-safe">
          <div className="flex items-center justify-around px-2 py-2">
            {tabBarItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all active:scale-95",
                    isActive
                      ? "text-[hsl(var(--brand-primary))]"
                      : "text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  <div className={cn(
                    "relative p-2 rounded-xl transition-colors",
                    isActive && "bg-[hsl(var(--brand-primary)/0.1)]"
                  )}>
                    <item.icon className="h-5 w-5" />
                    {isActive && (
                      <motion.div
                        layoutId="tabIndicator"
                        className="absolute inset-0 rounded-xl bg-[hsl(var(--brand-primary)/0.1)]"
                        transition={springPresets.snappy}
                      />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium",
                    isActive && "text-[hsl(var(--brand-primary))]"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </>
  );
}
