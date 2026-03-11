"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

/**
 * Screen Reader Announcer
 * Announces dynamic content changes to screen readers
 * WCAG 4.1.3: Status Messages (Level AA)
 */

interface AnnouncerContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export function useAnnounce() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    // Return no-op functions if used outside provider (safe fallback)
    return {
      announce: () => {},
      announcePolite: () => {},
      announceAssertive: () => {},
    };
  }
  return context;
}

interface ScreenReaderAnnouncerProps {
  children: React.ReactNode;
}

export function ScreenReaderAnnouncer({ children }: ScreenReaderAnnouncerProps) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (priority === "assertive") {
      // Clear and re-set to trigger announcement even if same message
      setAssertiveMessage("");
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage("");
      setTimeout(() => setPoliteMessage(message), 50);
    }
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, "polite");
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, "assertive");
  }, [announce]);

  // Clear messages after they've been announced
  useEffect(() => {
    if (politeMessage) {
      const timer = setTimeout(() => setPoliteMessage(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [politeMessage]);

  useEffect(() => {
    if (assertiveMessage) {
      const timer = setTimeout(() => setAssertiveMessage(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [assertiveMessage]);

  return (
    <AnnouncerContext.Provider value={{ announce, announcePolite, announceAssertive }}>
      {children}
      
      {/* Polite announcements - wait for user to finish current task */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      
      {/* Assertive announcements - interrupt immediately (use sparingly) */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}
