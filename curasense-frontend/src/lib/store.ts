import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Report {
  id: string;
  type: "prescription" | "xray" | "text" | "medicine";
  title: string;
  summary: string;
  content: string;
  status: "pending" | "completed" | "error";
  createdAt: Date;
  // Analytics metadata
  processingTimeMs?: number;
  findings?: string[];
  confidenceScore?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Analytics types
export interface AnalyticsData {
  totalReportsAnalyzed: number;
  reportsByType: Record<string, number>;
  reportsByStatus: Record<string, number>;
  averageProcessingTime: number;
  findingsFrequency: Record<string, number>;
  dailyUsage: Array<{ date: string; count: number }>;
  accuracyMetrics: {
    averageConfidence: number;
    highConfidenceCount: number;
    mediumConfidenceCount: number;
    lowConfidenceCount: number;
  };
  lastUpdated: Date;
}

interface AppState {
  // Sidebar
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;

  // Chat
  isChatOpen: boolean;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChatHistory: () => void;

  // Reports
  reports: Report[];
  currentReport: Report | null;
  addReport: (report: Omit<Report, "id" | "createdAt">) => void;
  removeReport: (id: string) => void;
  setCurrentReport: (report: Report | null) => void;
  clearReports: () => void;

  // Analytics
  getAnalytics: () => AnalyticsData;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Sidebar
      isSidebarExpanded: true,
      toggleSidebar: () =>
        set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
      setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),

      // Chat
      isChatOpen: false,
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      setChatOpen: (open) => set({ isChatOpen: open }),
      chatHistory: [],
      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [
            ...state.chatHistory,
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            },
          ],
        })),
      clearChatHistory: () => set({ chatHistory: [] }),

      // Reports
      reports: [],
      currentReport: null,
      addReport: (report) =>
        set((state) => ({
          reports: [
            {
              ...report,
              id: crypto.randomUUID(),
              createdAt: new Date(),
            },
            ...state.reports,
          ],
        })),
      removeReport: (id) =>
        set((state) => ({
          reports: state.reports.filter((r) => r.id !== id),
          currentReport: state.currentReport?.id === id ? null : state.currentReport,
        })),
      setCurrentReport: (report) => set({ currentReport: report }),
      clearReports: () => set({ reports: [], currentReport: null }),

      // Analytics - computed from reports
      getAnalytics: () => {
        const reports = get().reports;
        const completedReports = reports.filter(r => r.status === "completed");
        
        // Safe date parser — handles strings, Date objects, and invalid values
        const safeDate = (v: unknown): Date | null => {
          if (!v) return null;
          const d = new Date(v as string | number | Date);
          return isNaN(d.getTime()) ? null : d;
        };

        // Reports by type
        const reportsByType: Record<string, number> = {};
        reports.forEach(r => {
          reportsByType[r.type] = (reportsByType[r.type] || 0) + 1;
        });

        // Reports by status
        const reportsByStatus: Record<string, number> = {};
        reports.forEach(r => {
          reportsByStatus[r.status] = (reportsByStatus[r.status] || 0) + 1;
        });

        // Average processing time
        const processingTimes = completedReports
          .filter(r => r.processingTimeMs)
          .map(r => r.processingTimeMs!);
        const averageProcessingTime = processingTimes.length > 0
          ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
          : 0;

        // Findings frequency
        const findingsFrequency: Record<string, number> = {};
        completedReports.forEach(r => {
          r.findings?.forEach(finding => {
            findingsFrequency[finding] = (findingsFrequency[finding] || 0) + 1;
          });
        });

        // Daily usage (last 30 days)
        const last30Days = new Array(30).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString().split("T")[0];
        });
        
        const dailyUsage = last30Days.map(date => ({
          date,
          count: reports.filter(r => {
            const d = safeDate(r.createdAt);
            return d ? d.toISOString().split("T")[0] === date : false;
          }).length,
        }));

        // Accuracy metrics from confidence scores
        const confidenceScores = completedReports
          .filter(r => r.confidenceScore !== undefined)
          .map(r => r.confidenceScore!);
        
        const averageConfidence = confidenceScores.length > 0
          ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
          : 0;

        return {
          totalReportsAnalyzed: completedReports.length,
          reportsByType,
          reportsByStatus,
          averageProcessingTime,
          findingsFrequency,
          dailyUsage,
          accuracyMetrics: {
            averageConfidence,
            highConfidenceCount: confidenceScores.filter(s => s >= 0.8).length,
            mediumConfidenceCount: confidenceScores.filter(s => s >= 0.5 && s < 0.8).length,
            lowConfidenceCount: confidenceScores.filter(s => s < 0.5).length,
          },
          lastUpdated: new Date(),
        };
      },

      // Theme
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "curasense-storage",
      partialize: (state) => ({
        isSidebarExpanded: state.isSidebarExpanded,
        theme: state.theme,
        reports: state.reports,
      }),
    }
  )
);
