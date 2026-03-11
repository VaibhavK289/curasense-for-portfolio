"use client";

import { useState, useEffect, useSyncExternalStore, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnnounce } from "@/components/accessibility";

// useSyncExternalStore helpers for online status
function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function getOnlineServerSnapshot(): boolean {
  return true; // Assume online on server
}

function subscribeOnline(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Offline Indicator
 * Shows when user loses internet connection
 * WCAG: Provides status message to screen readers
 */
export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot);
  const [showBanner, setShowBanner] = useState(false);
  const wasOfflineRef = useRef(false);
  const { announceAssertive } = useAnnounce();
  const prevOnlineRef = useRef(isOnline);

  // Handle online/offline transitions
  useEffect(() => {
    // Only react to actual changes
    if (prevOnlineRef.current === isOnline) return;
    prevOnlineRef.current = isOnline;

    if (!isOnline) {
      queueMicrotask(() => {
        setShowBanner(true);
        wasOfflineRef.current = true;
      });
      announceAssertive("You are offline. Some features may not work.");
    } else if (wasOfflineRef.current) {
      announceAssertive("You are back online");
      // Keep banner briefly to show "Back online" message
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, announceAssertive]);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100]"
          role="alert"
          aria-live="assertive"
        >
          <div
            className={`flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium ${
              isOnline
                ? "bg-[hsl(var(--color-success))] text-white"
                : "bg-[hsl(var(--color-warning))] text-white"
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4" aria-hidden="true" />
                <span>You&apos;re back online!</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" aria-hidden="true" />
                <span>You&apos;re offline. Some features may not work.</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-white hover:bg-white/20"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to check online status
 */
export function useOnlineStatus() {
  return useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot);
}
