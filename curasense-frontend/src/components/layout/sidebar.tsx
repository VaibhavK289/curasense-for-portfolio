"use client";

import { useState, useEffect } from "react";
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
  ChevronRight,
  History,
  BarChart3,
  User,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientText, PulsingDot } from "@/components/ui/aceternity";
import { CuraSenseLogo } from "@/components/ui/logo";
import { springPresets } from "@/styles/tokens/animations";
import { useAuth } from "@/lib/auth-context";

// Spring configurations
const springConfigs = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 20 },
  smooth: { type: "spring" as const, stiffness: 200, damping: 25 },
  snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
};

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    color: "text-[hsl(var(--muted-foreground))]",
    activeColor: "text-[hsl(var(--foreground))]",
    activeBg: "bg-[hsl(var(--accent))]",
    gradient: "from-slate-500 to-slate-600",
  },
  {
    name: "CuraSense Diagnosis",
    href: "/diagnosis",
    icon: Stethoscope,
    color: "text-[hsl(var(--color-diagnosis))]",
    activeColor: "text-[hsl(var(--color-diagnosis))]",
    activeBg: "bg-[hsl(var(--color-diagnosis)/0.1)]",
    gradient: "from-violet-500 to-purple-600",
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
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "Report History",
    href: "/history",
    icon: History,
    color: "text-[hsl(var(--color-records))]",
    activeColor: "text-[hsl(var(--color-records))]",
    activeBg: "bg-[hsl(var(--color-records)/0.1)]",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    color: "text-[hsl(var(--brand-secondary))]",
    activeColor: "text-[hsl(var(--brand-secondary))]",
    activeBg: "bg-[hsl(var(--brand-secondary)/0.1)]",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    name: "My Profile",
    href: "/profile",
    icon: User,
    color: "text-[hsl(var(--brand-primary))]",
    activeColor: "text-[hsl(var(--brand-primary))]",
    activeBg: "bg-[hsl(var(--brand-primary)/0.1)]",
    gradient: "from-teal-500 to-emerald-600",
  },
];

const bottomNav = [
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Tooltip component for collapsed sidebar
function NavTooltip({ children, label }: { children: React.ReactNode; label: string }) {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50"
          >
            <div className="px-3 py-1.5 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-medium whitespace-nowrap shadow-lg">
              {label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Only show sidebar when user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Desktop Only - Hover trigger area */}
      <div
        className="hidden lg:block fixed left-0 top-0 z-50 h-screen w-4 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
      />

      {/* Desktop Only - Collapsed indicator with glass effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-16 flex-col items-center border-r border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.8)] py-6 backdrop-blur-xl"
      >
        {/* Enterprise Logo - Collapsed with glow */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary))] via-[hsl(168_84%_38%)] to-[hsl(var(--brand-secondary))] shadow-lg shadow-[hsl(var(--brand-primary)/0.35)]"
        >
          <CuraSenseLogo className="h-6 w-6" />
          {/* Subtle glow ring */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary)/0.4)] to-transparent blur-md -z-10" />
        </motion.div>

        <div className="mt-6 flex flex-col items-center gap-2">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || (item.children && item.children.some((child) => pathname === child.href));
            return (
              <NavTooltip key={item.name} label={item.name}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, ...springConfigs.smooth }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                      isActive
                        ? cn(item.activeBg, item.activeColor)
                        : cn("text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]", `hover:${item.color}`)
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-[hsl(var(--brand-primary))]"
                        transition={springConfigs.snappy}
                      />
                    )}
                  </Link>
                </motion.div>
              </NavTooltip>
            );
          })}
        </div>
        
        <div className="mt-auto flex flex-col items-center gap-2">
          {bottomNav.map((item) => (
            <NavTooltip key={item.name} label={item.name}>
              <Link
                href={item.href}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[hsl(var(--muted-foreground))] transition-all duration-200 hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
              >
                <item.icon className="h-5 w-5" />
              </Link>
            </NavTooltip>
          ))}
        </div>
        
        {/* Status indicator with pulse */}
        <div className="mt-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <PulsingDot color="success" />
          </motion.div>
        </div>
      </motion.div>

      {/* Desktop Only - Full sidebar on hover with premium glass effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={springConfigs.snappy}
            onMouseLeave={() => setIsHovered(false)}
            className="hidden lg:block fixed left-0 top-0 z-50 h-screen w-72 border-r border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.95)] shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            {/* Decorative gradient orbs */}
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gradient-to-br from-[hsl(var(--brand-primary)/0.15)] to-transparent blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-gradient-to-br from-[hsl(var(--brand-secondary)/0.1)] to-transparent blur-3xl pointer-events-none" />
            
            <div className="relative flex h-full flex-col">
              {/* Enterprise Logo - Expanded with premium styling */}
              <div className="flex h-20 items-center gap-3 border-b border-[hsl(var(--border)/0.5)] px-6">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 0.4 }}
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary))] via-[hsl(168_84%_38%)] to-[hsl(var(--brand-secondary))] shadow-lg shadow-[hsl(var(--brand-primary)/0.35)]"
                >
                  <CuraSenseLogo className="h-6 w-6" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold">
                    <GradientText>CuraSense</GradientText>
                  </h1>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] tracking-widest uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Healthcare
                  </p>
                </div>
              </div>

              {/* Navigation with stagger animation */}
              <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground)/0.7)]">
                  Main Menu
                </div>
                {navigation.map((item, index) => {
                  const isActive =
                    pathname === item.href ||
                    (item.children &&
                      item.children.some((child) => pathname === child.href));
                  const isItemHovered = hoveredItem === item.name;

                  return (
                    <motion.div 
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, ...springConfigs.smooth }}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden",
                          isActive
                            ? cn(item.activeBg, item.activeColor)
                            : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                        )}
                      >
                        {/* Hover gradient background */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isItemHovered && !isActive ? 0.05 : 0 }}
                          className={`absolute inset-0 bg-gradient-to-r ${item.gradient}`}
                        />
                        
                        {/* Icon with gradient on active */}
                        <div className={cn(
                          "relative flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                          isActive && `bg-gradient-to-br ${item.gradient} shadow-sm`
                        )}>
                          <item.icon
                            className={cn(
                              "h-[18px] w-[18px] transition-colors",
                              isActive
                                ? "text-white"
                                : cn("text-[hsl(var(--muted-foreground))]", `group-hover:${item.color}`)
                            )}
                          />
                        </div>
                        
                        <span className="relative">{item.name}</span>
                        
                        {item.children && (
                          <ChevronRight
                            className={cn(
                              "ml-auto h-4 w-4 transition-transform",
                              isActive && "rotate-90"
                            )}
                          />
                        )}
                        
                        {/* Active indicator line */}
                        {isActive && (
                          <motion.div
                            layoutId="sidebarActiveIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]"
                            transition={springConfigs.snappy}
                          />
                        )}
                      </Link>

                      {/* Children with refined styling */}
                      {item.children && isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-5 mt-1 space-y-1 border-l-2 border-[hsl(var(--border)/0.5)] pl-4"
                        >
                          {item.children.map((child, childIndex) => (
                            <motion.div
                              key={child.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: childIndex * 0.05, ...springConfigs.smooth }}
                            >
                              <Link
                                href={child.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                  pathname === child.href
                                    ? "bg-[hsl(var(--color-diagnosis)/0.1)] text-[hsl(var(--color-diagnosis))] font-medium"
                                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--color-diagnosis))] hover:bg-[hsl(var(--accent)/0.5)]"
                                )}
                              >
                                <child.icon className="h-4 w-4" />
                                {child.name}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </nav>

              {/* Bottom Navigation with refined styling */}
              <div className="border-t border-[hsl(var(--border)/0.5)] p-4">
                {bottomNav.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05, ...springConfigs.smooth }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-all duration-200 hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Premium Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ...springConfigs.smooth }}
                className="m-4 rounded-2xl bg-gradient-to-br from-[hsl(var(--brand-primary))] via-[hsl(168_70%_40%)] to-[hsl(var(--brand-secondary))] p-4 text-white shadow-lg shadow-[hsl(var(--brand-primary)/0.3)] overflow-hidden relative"
              >
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white blur-xl" />
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <motion.span 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex h-2 w-2 rounded-full bg-white"
                    />
                    <Zap className="w-4 h-4" />
                    AI Systems Online
                  </div>
                  <p className="mt-1.5 text-xs text-white/80">
                    3 ML models ready for analysis
                  </p>
                  <div className="mt-3 flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1 flex-1 rounded-full bg-white/30"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                        style={{ originX: 0 }}
                      >
                        <div className="h-full w-full rounded-full bg-white" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
