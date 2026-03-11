"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  Search, 
  Moon, 
  Sun, 
  ChevronDown,
  Sparkles,
  FileText,
  Pill,
  ScanLine,
  Settings,
  LogOut,
  User,
  Crown,
  X,
  Activity,
  Menu,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { springPresets } from "@/styles/tokens/animations";

// Command palette items
const commandItems = [
  { icon: FileText, label: "New Prescription Analysis", shortcut: "P", href: "/diagnosis/prescription" },
  { icon: ScanLine, label: "New X-Ray Analysis", shortcut: "X", href: "/diagnosis/xray" },
  { icon: Pill, label: "Compare Medicines", shortcut: "M", href: "/medicine" },
  { icon: Activity, label: "View Reports", shortcut: "R", href: "/reports" },
];

// Mock notifications
const notifications = [
  { id: 1, title: "Analysis Complete", message: "Your prescription report is ready", time: "2m ago", unread: true },
  { id: 2, title: "New Feature", message: "Try our improved X-Ray analysis", time: "1h ago", unread: true },
  { id: 3, title: "Weekly Summary", message: "View your health insights", time: "1d ago", unread: false },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const commandRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle hydration - using layout effect alternative pattern
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsCommandOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close dropdowns
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

  const filteredCommands = commandItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springPresets.smooth}
        className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.95)] px-3 sm:px-4 md:px-6 backdrop-blur-xl"
      >
        {/* Left: Mobile Menu + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggleMobileNav'))}
            className="lg:hidden flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors active:scale-95"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary))] via-[hsl(168_84%_38%)] to-[hsl(var(--brand-secondary))] shadow-lg shadow-[hsl(var(--brand-primary)/0.35)]"
            >
            {/* Professional Medical Cross + Pulse + Shield Logo */}
            <svg 
              viewBox="0 0 32 32" 
              fill="none" 
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Shield Shape */}
              <path 
                d="M16 2L4 7v8c0 7.18 5.12 13.89 12 15.5 6.88-1.61 12-8.32 12-15.5V7L16 2z" 
                fill="rgba(255,255,255,0.15)"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Medical Cross - Central Element */}
              <path 
                d="M14 10h4v4h4v4h-4v4h-4v-4h-4v-4h4v-4z" 
                fill="white"
                opacity="0.95"
              />
              {/* Heartbeat/Pulse Line across cross */}
              <path 
                d="M8 16h3l1.5-3 2 6 2-6 1.5 3h6" 
                stroke="hsl(168, 84%, 40%)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* AI Circuit Dots - representing intelligence */}
              <circle cx="6" cy="16" r="1" fill="white" opacity="0.7"/>
              <circle cx="26" cy="16" r="1" fill="white" opacity="0.7"/>
              <circle cx="16" cy="6" r="1" fill="white" opacity="0.7"/>
            </svg>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/10 to-transparent" />
          </motion.div>
          <div className="hidden sm:block">
            <span className="text-base sm:text-lg font-bold text-[hsl(var(--foreground))] tracking-tight">
              Cura<span className="bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] bg-clip-text text-transparent">Sense</span>
            </span>
            <span className="hidden lg:block text-[10px] text-[hsl(var(--muted-foreground))] tracking-widest uppercase -mt-0.5">
              AI Healthcare
            </span>
          </div>
          </Link>
        </div>

        {/* Center: Command Palette Trigger - Hidden on small mobile */}
        <div className="hidden sm:flex flex-1 justify-center px-2 sm:px-4 md:px-8">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="group flex items-center gap-2 sm:gap-3 h-9 sm:h-10 w-full max-w-xs sm:max-w-sm rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 sm:px-4 text-sm text-[hsl(var(--muted-foreground))] transition-all hover:border-[hsl(var(--brand-primary)/0.5)] hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary)/0.3)]"
          >
            <Search className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--brand-primary))] transition-colors" />
            <span className="flex-1 text-left truncate text-xs sm:text-sm">Search...</span>
            <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-1.5 font-mono text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
          {/* Mobile Search Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCommandOpen(true)}
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors active:scale-95"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] active:scale-95"
            aria-label="Toggle theme"
          >
            {mounted && (
              <>
                <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </>
            )}
          </motion.button>

          {/* Notifications */}
          <div ref={notificationsRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] active:scale-95",
                isNotificationsOpen && "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
              )}
              aria-label={`Notifications (${unreadCount} unread)`}
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--color-error))] text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={springPresets.snappy}
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">Notifications</h3>
                    {unreadCount > 0 && (
                      <button className="text-xs text-[hsl(var(--brand-primary))] hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        className={cn(
                          "flex w-full gap-3 p-4 text-left transition-colors hover:bg-[hsl(var(--muted)/0.5)]",
                          notification.unread && "bg-[hsl(var(--brand-primary)/0.05)]"
                        )}
                      >
                        <div className={cn(
                          "mt-1 h-2 w-2 rounded-full flex-shrink-0",
                          notification.unread ? "bg-[hsl(var(--brand-primary))]" : "bg-transparent"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[hsl(var(--border))] p-2">
                    <button className="w-full rounded-lg py-2 text-sm text-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-[hsl(var(--border))] mx-2" />

          {/* User Profile */}
          <div ref={profileRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 md:gap-3 rounded-xl p-1.5 pr-2 md:pr-3 transition-colors hover:bg-[hsl(var(--muted))]",
                isProfileOpen && "bg-[hsl(var(--muted))]"
              )}
            >
              {/* Avatar */}
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white shadow-sm">
                <span className="text-sm font-semibold">DR</span>
              </div>
              
              {/* Name & Plan */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[hsl(var(--foreground))] leading-tight">
                  Dr. Sarah Chen
                </p>
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-[hsl(var(--color-warning))]" />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">Pro Plan</span>
                </div>
              </div>
              
              {/* Chevron */}
              <ChevronDown className={cn(
                "h-4 w-4 text-[hsl(var(--muted-foreground))] transition-transform",
                isProfileOpen && "rotate-180"
              )} />
            </motion.button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={springPresets.snappy}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl overflow-hidden"
                >
                  {/* User Info */}
                  <div className="p-4 border-b border-[hsl(var(--border))]">
                    <p className="font-medium text-[hsl(var(--foreground))]">Dr. Sarah Chen</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">sarah.chen@hospital.org</p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                      <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      Your Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                      <Settings className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      Settings
                    </Link>
                  </div>
                  
                  {/* Upgrade Banner */}
                  <div className="p-2 border-t border-[hsl(var(--border))]">
                    <div className="rounded-lg bg-gradient-to-r from-[hsl(var(--brand-primary)/0.1)] to-[hsl(var(--brand-secondary)/0.1)] p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
                        <span className="text-sm font-medium text-[hsl(var(--foreground))]">Upgrade to Enterprise</span>
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Unlock unlimited analyses & team features
                      </p>
                    </div>
                  </div>
                  
                  {/* Logout */}
                  <div className="p-2 border-t border-[hsl(var(--border))]">
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[hsl(var(--color-error))] hover:bg-[hsl(var(--color-error)/0.1)] transition-colors">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isCommandOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommandOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              ref={commandRef}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={springPresets.snappy}
              className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-4">
                <Search className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent py-4 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsCommandOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.2)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Quick Actions
                </p>
                {filteredCommands.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsCommandOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))] group-hover:bg-[hsl(var(--brand-primary)/0.1)] transition-colors">
                      <item.icon className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--brand-primary))] transition-colors" />
                    </div>
                    <span className="flex-1 text-sm">{item.label}</span>
                    <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-1.5 font-mono text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                      {item.shortcut}
                    </kbd>
                  </Link>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-1.5 py-0.5">↵</kbd>
                    to select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-1.5 py-0.5">esc</kbd>
                    to close
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[hsl(var(--brand-primary))]" />
                  AI-powered search
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
