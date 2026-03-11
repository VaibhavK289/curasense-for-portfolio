/**
 * save-report.ts
 * Bridges the client-side Zustand store with the server-side database API.
 * Every analysis result is:
 *   1) Immediately added to the Zustand store (instant UI)
 *   2) Asynchronously POSTed to /api/reports for persistence (if user is authenticated)
 *
 * The DB call is fire-and-forget so it never blocks the UI.
 */

import { useAppStore, Report } from "@/lib/store";

// Map client-side types to database enum values
const TYPE_TO_DB: Record<string, string> = {
  prescription: "PRESCRIPTION",
  text: "TEXT_ANALYSIS",
  xray: "XRAY",
  medicine: "MEDICINE_COMPARISON",
};

export interface SaveReportInput {
  type: "prescription" | "text" | "xray" | "medicine";
  title: string;
  summary: string;
  content: string;
  status: "completed" | "pending" | "error";
  findings?: string[];
  confidenceScore?: number;
  processingTimeMs?: number;
}

/**
 * Save a report to both the Zustand store and the database.
 * Returns the store report object immediately.
 */
export function saveReport(
  input: SaveReportInput,
  accessToken?: string | null,
): Report {
  const { addReport } = useAppStore.getState();

  // 1) Save to Zustand store (instant, persisted to localStorage)
  const storeReport: Omit<Report, "id" | "createdAt"> = {
    type: input.type,
    title: input.title,
    summary: input.summary,
    content: input.content,
    status: input.status,
    findings: input.findings,
    confidenceScore: input.confidenceScore,
    processingTimeMs: input.processingTimeMs,
  };

  addReport(storeReport);

  // Get the just-added report (first item in store)
  const saved = useAppStore.getState().reports[0];

  // 2) Persist to DB (fire-and-forget, non-blocking)
  if (accessToken) {
    persistToDatabase(input, accessToken).catch((err) => {
      console.warn("[save-report] DB persist failed (non-blocking):", err);
    });
  }

  return saved;
}

/**
 * POST to /api/reports for server-side persistence.
 */
async function persistToDatabase(
  input: SaveReportInput,
  accessToken: string,
): Promise<void> {
  try {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: input.title,
        type: TYPE_TO_DB[input.type] || "TEXT_ANALYSIS",
        description: input.summary,
        summary: input.summary,
        content: input.content,
        findings: input.findings || [],
        confidenceScore: input.confidenceScore,
        processingTimeMs: input.processingTimeMs,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn("[save-report] DB API returned", res.status, body);
    }
  } catch (err) {
    console.warn("[save-report] DB network error:", err);
  }
}

/**
 * React hook version for use in components.
 * Returns a save function that automatically gets the current access token.
 */
export function useSaveReport() {
  return {
    saveReport: (input: SaveReportInput, accessToken?: string | null) =>
      saveReport(input, accessToken),
  };
}
