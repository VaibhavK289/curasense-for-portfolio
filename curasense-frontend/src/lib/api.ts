// API Configuration
// All backend calls go through Next.js API routes (server-side proxy).
// This avoids CORS issues and removes the need for NEXT_PUBLIC_ build-time env vars.

import type {
  MedicineDetail,
  CompareResponse,
  RecommendResponse,
  InteractionResponse,
  BackendInteractionRaw,
  ImageAnalysisResponse,
} from "@/lib/medicine-types";
import { flattenInteraction } from "@/lib/medicine-types";

// Request timeout (500 seconds for long-running operations)
const REQUEST_TIMEOUT = 500000;

// Helper function with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export interface DiagnosisResponse {
  status: "success" | "error";
  report?: string;
  error?: string;
}

export interface ChatResponse {
  response: string;
  model?: string;
}

/**
 * Extract the markdown report from a CrewAI pipeline result string.
 *
 * The ML backend returns `str(result)` where `result` is a Python dict
 * produced by `normalize(CrewOutput)`. The dict has keys: raw, pydantic,
 * json_dict, tasks_output, token_usage.  We want just the `raw` field
 * which contains the actual markdown clinical report.
 *
 * Python's `str(dict)` uses `repr()` for values, so strings are quoted
 * with ' or " and special chars are escaped (\n, \t, \', \", \\).
 * This function handles that encoding.
 */
function extractMarkdownFromReport(report: string): string {
  if (!report) return report;

  // Strategy 1: Try JSON.parse (future-proofing if backend switches to json.dumps)
  try {
    const parsed = JSON.parse(report);
    if (parsed && typeof parsed === "object" && typeof parsed.raw === "string") {
      return parsed.raw;
    }
  } catch {
    // Not valid JSON — expected for Python str() output
  }

  // Strategy 2: Parse Python dict repr to extract the 'raw' field value.
  // Look for the 'raw': marker, detect the quote char, then walk the string
  // character by character, handling Python escape sequences.
  const markers = ["'raw': ", '"raw": '];
  for (const marker of markers) {
    const idx = report.indexOf(marker);
    if (idx === -1) continue;

    const afterMarker = idx + marker.length;
    if (afterMarker >= report.length) continue;

    const quote = report[afterMarker];
    if (quote !== "'" && quote !== '"') continue;

    let extracted = "";
    let i = afterMarker + 1;

    while (i < report.length) {
      if (report[i] === "\\" && i + 1 < report.length) {
        // Escaped character
        const next = report[i + 1];
        switch (next) {
          case "n":  extracted += "\n"; break;
          case "t":  extracted += "\t"; break;
          case "\\": extracted += "\\"; break;
          case "'":  extracted += "'";  break;
          case '"':  extracted += '"';  break;
          default:   extracted += next; break;
        }
        i += 2;
      } else if (report[i] === quote) {
        // Unescaped quote = end of the raw string value
        break;
      } else {
        extracted += report[i];
        i++;
      }
    }

    // Sanity check: a real clinical report should have substantial content
    if (extracted.trim().length > 50) {
      return extracted;
    }
  }

  // Fallback: return as-is (might already be plain markdown)
  return report;
}

// PDF Diagnosis API - Uses Next.js API route to proxy to backend
// This avoids CORS issues and keeps the same-origin request pattern
export async function diagnosePDF(file: File): Promise<DiagnosisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithTimeout(
    "/api/diagnose/pdf",
    {
      method: "POST",
      body: formData,
    },
    500000 // 8+ min timeout for PDF processing
  );

  const data: DiagnosisResponse = await response.json();
  if (data.report) {
    data.report = extractMarkdownFromReport(data.report);
  }
  return data;
}

// Text Diagnosis API - Uses Next.js API route to proxy to backend
export async function diagnoseText(text: string): Promise<DiagnosisResponse> {
  const response = await fetchWithTimeout(
    "/api/diagnose/text",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
    500000 // 8+ min timeout for diagnosis
  );

  const data: DiagnosisResponse = await response.json();
  if (data.report) {
    data.report = extractMarkdownFromReport(data.report);
  }
  return data;
}

// X-Ray Analysis API - Uses Next.js API routes to proxy to vision backend
export async function uploadXrayImage(
  threadId: string,
  file: File
): Promise<{ success: boolean; message?: string }> {
  const formData = new FormData();
  formData.append("thread_id", threadId);
  formData.append("image", file);

  const response = await fetchWithTimeout("/api/vision/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return { success: response.ok, message: JSON.stringify(data) };
}

export async function queryXrayImage(
  threadId: string,
  query: string
): Promise<{ success: boolean }> {
  const response = await fetchWithTimeout("/api/vision/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread_id: threadId, query }),
  });

  return { success: response.ok };
}

export async function getXrayAnswer(threadId: string): Promise<string> {
  const response = await fetchWithTimeout("/api/vision/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread_id: threadId }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let result = "";

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value);
    }
  }

  return result;
}

// Chat API - Uses Next.js API route to proxy to backend
export async function sendChatMessage(
  message: string,
  reportContext?: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<ChatResponse> {
  const response = await fetchWithTimeout("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      report_context: reportContext || "",
      conversation_history: conversationHistory || [],
    }),
  });

  return response.json();
}

// Medicine Comparison API (legacy) - Uses Next.js API route to proxy to backend
export async function compareMedicinesLegacy(
  medicines: string[]
): Promise<{ comparison: Array<Record<string, string>> }> {
  const response = await fetchWithTimeout("/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medicines }),
  });

  return response.json();
}

// ─── Medicine Insight API ────────────────────────────────────────────────────
// All routes proxy through Next.js API routes → medicine backend (port 8000)

/** GET /api/medicine/:name — lookup a single medicine by name */
export async function getMedicine(name: string): Promise<MedicineDetail> {
  const response = await fetchWithTimeout(
    `/api/medicine/${encodeURIComponent(name)}`,
    { method: "GET" },
    REQUEST_TIMEOUT
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

/** POST /api/medicine/recommend — symptom-based medicine recommendations */
export async function recommendMedicines(
  symptoms: string
): Promise<RecommendResponse> {
  const response = await fetchWithTimeout(
    "/api/medicine/recommend",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ illness_text: symptoms }),
    },
    REQUEST_TIMEOUT
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

/** POST /api/medicine/interaction — check drug interaction between two medicines */
export async function checkInteraction(
  medicine1: string,
  medicine2: string
): Promise<InteractionResponse> {
  const response = await fetchWithTimeout(
    "/api/medicine/interaction",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicine_1: medicine1, medicine_2: medicine2 }),
    },
    REQUEST_TIMEOUT
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  const raw: BackendInteractionRaw = await response.json();
  return flattenInteraction(raw);
}

/** POST /api/medicine/compare — side-by-side comparison of two medicines */
export async function compareMedicines(
  medicine1: string,
  medicine2: string
): Promise<CompareResponse> {
  const response = await fetchWithTimeout(
    "/api/medicine/compare",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicine_1: medicine1, medicine_2: medicine2 }),
    },
    REQUEST_TIMEOUT
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

/** POST /api/medicine/analyze-image — analyze a medicine image via Gemini vision */
export async function analyzeMedicineImage(
  file: File
): Promise<ImageAnalysisResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetchWithTimeout(
    "/api/medicine/analyze-image",
    {
      method: "POST",
      body: formData,
    },
    REQUEST_TIMEOUT
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}
