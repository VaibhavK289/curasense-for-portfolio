"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  Moon, 
  Sun, 
  ChevronDown,
  Settings,
  LogOut,
  User,
  Menu,
  LogIn,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { springPresets } from "@/styles/tokens/animations";
import { useAuth } from "@/lib/auth-context";
import { CuraSenseLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

// Notifications - only shown when authenticated
const notifications = [
  { id: 1, title: "Analysis Complete", message: "Your prescription report is ready", time: "2m ago", unread: true },
  { id: 2, title: "System Update", message: "New analysis models available", time: "1h ago", unread: false },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={springPresets.smooth}
      className="sticky top-0 z-40 flex h-12 sm:h-14 items-center justify-between border-b border-[hsl(var(--border)/0.5)] bg-[hsl(var(--background)/0.85)] px-3 sm:px-4 backdrop-blur-xl"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-primary)/0.02)] via-transparent to-[hsl(var(--brand-secondary)/0.02)] pointer-events-none" />
      
      {/* Left: Mobile Menu + Logo */}
      <div className="relative flex items-center gap-3">
        {/* Mobile Menu Button - only show when authenticated */}
        {isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.dispatchEvent(new CustomEvent('toggleMobileNav'))}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
        )}

        {/* Logo with premium hover effect */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
            transition={{ duration: 0.4 }}
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary))] via-[hsl(168_84%_38%)] to-[hsl(var(--brand-secondary))] shadow-lg shadow-[hsl(var(--brand-primary)/0.25)] group-hover:shadow-xl group-hover:shadow-[hsl(var(--brand-primary)/0.35)] transition-shadow"
          >
            <CuraSenseLogo className="h-5 w-5 sm:h-6 sm:w-6" />
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary)/0.3)] to-transparent blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-[hsl(var(--foreground))] tracking-tight">
              Cura<span className="bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] bg-clip-text text-transparent">Sense</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Actions based on auth state */}
      <div className="relative flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle - premium animated */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors overflow-hidden"
          aria-label="Toggle theme"
        >
          {mounted && (
            <>
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? -90 : 0, scale: theme === 'dark' ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Sun className="h-[18px] w-[18px]" />
              </motion.div>
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 0 : 90, scale: theme === 'dark' ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Moon className="h-[18px] w-[18px]" />
              </motion.div>
            </>
          )}
        </motion.button>

        {isAuthenticated ? (
          <>
            {/* Notifications - premium animated */}
            <div ref={notificationsRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors",
                  isNotificationsOpen && "bg-[hsl(var(--muted))]"
                )}
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--color-error))] to-[hsl(0_80%_55%)] text-[10px] font-medium text-white shadow-lg shadow-[hsl(var(--color-error)/0.3)]"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={springPresets.snappy}
                    className="absolute right-0 top-full mt-3 w-72 sm:w-80 rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.95)] backdrop-blur-xl shadow-2xl shadow-[hsl(var(--foreground)/0.1)] overflow-hidden"
                  >
                    {/* Decorative gradient */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[hsl(var(--brand-primary)/0.05)] to-transparent pointer-events-none" />
                    
                    <div className="relative flex items-center justify-between border-b border-[hsl(var(--border)/0.5)] p-4">
                      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Notifications</h3>
                      {unreadCount > 0 && (
                        <button className="text-xs font-medium text-[hsl(var(--brand-primary))] hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          className={cn(
                            "flex w-full gap-3 p-3 text-left hover:bg-[hsl(var(--muted)/0.5)] transition-colors",
                            notification.unread && "bg-[hsl(var(--brand-primary)/0.03)]"
                          )}
                        >
                          <div className={cn(
                            "mt-1.5 h-2 w-2 rounded-full flex-shrink-0",
                            notification.unread ? "bg-[hsl(var(--brand-primary))]" : "bg-transparent"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                              {notification.title}
                            </p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Dropdown - Premium */}
            <div ref={profileRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl p-1.5 pr-3 transition-all hover:bg-[hsl(var(--muted))] border border-transparent hover:border-[hsl(var(--border)/0.5)]",
                  isProfileOpen && "bg-[hsl(var(--muted))] border-[hsl(var(--border)/0.5)]"
                )}
              >
                <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary)/0.15)] to-[hsl(var(--brand-secondary)/0.1)] text-[hsl(var(--brand-primary))]">
                  <User className="h-4 w-4" />
                  {/* Online indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[hsl(var(--color-success))] border-2 border-[hsl(var(--background))]" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-[hsl(var(--foreground))]">
                  {user?.displayName || user?.firstName || "User"}
                </span>
                <motion.div
                  animate={{ rotate: isProfileOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="hidden sm:block h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={springPresets.snappy}
                    className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.95)] backdrop-blur-xl shadow-2xl shadow-[hsl(var(--foreground)/0.1)] overflow-hidden"
                  >
                    {/* Header with gradient */}
                    <div className="relative p-4 border-b border-[hsl(var(--border)/0.5)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary)/0.05)] to-transparent" />
                      <div className="relative">
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">{user?.email}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors group"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))] group-hover:bg-[hsl(var(--brand-primary)/0.1)] transition-colors">
                          <Settings className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--brand-primary))] transition-colors" />
                        </div>
                        Settings
                      </Link>
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[hsl(var(--color-error))] hover:bg-[hsl(var(--color-error)/0.1)] transition-colors group"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-error)/0.1)] group-hover:bg-[hsl(var(--color-error)/0.15)] transition-colors">
                          <LogOut className="h-4 w-4" />
                        </div>
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <>
            {/* Unauthenticated: Login / Get Started buttons */}
            <Link href="/login">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex gap-2 text-sm font-medium"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                size="sm" 
                className="gap-2 text-sm font-medium h-9 px-4 rounded-lg bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.9)]"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        )}
      </div>
    </motion.header>
  );
}
