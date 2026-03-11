// ============================================
// MEDICINE MODULE — TypeScript Types & Utilities
// Mirrors the backend Pydantic schemas for the
// medicine insight service (Gemini + Tavily + ChromaDB)
// ============================================

// ─── Core Types ──────────────────────────────────────────────────────────────

/** Raw shape returned by the backend for any medicine object */
export interface MedicineDetail {
  basic_info: {
    name: string;
    dosage_mg?: number | null;
    price?: number | null;
    composition?: string[];
    uses?: string[];
    side_effects?: string[];
    warnings?: string[];
    contraindications?: string[];
    manufacturer?: string | null;
    source_urls?: string[];
  };
  pros?: string[];
  cons?: string[];
  similar_medicines?: string[];
  approx_cost?: string | null;
}

/** Flat shape used by UI components (MedicineCard, etc.) */
export interface Medicine {
  name: string;
  dosage_mg?: number | string | null;
  price?: number | string | null;
  composition?: string;
  uses?: string[];
  side_effects?: string[];
  warnings?: string[];
  contraindications?: string[];
  manufacturer?: string | null;
  pros?: string[];
  cons?: string[];
  similar_medicines?: string[];
  estimated_cost_inr?: string | null;
}

// ─── Response Types ──────────────────────────────────────────────────────────

/** POST /recommend response */
export interface RecommendResponse {
  symptoms_detected: string[];
  recommended_medicines: MedicineDetail[];
  disclaimer?: string;
}

/** Frontend-facing interaction shape (flat) */
export interface InteractionResponse {
  medicine1: string;
  medicine2: string;
  risk_level: "Low" | "Moderate" | "High" | string;
  explanation: string;
  recommendations?: string[];
}

/** Actual backend interaction response (nested) */
export interface BackendInteractionRaw {
  medicine_1: string;
  medicine_2: string;
  interaction_analysis: {
    risk_level: string;
    explanation: string;
    recommendation: string;
  };
  disclaimer?: string;
}

/** POST /compare response */
export interface CompareResponse {
  medicine_1: MedicineDetail;
  medicine_2: MedicineDetail;
  comparison_summary?: {
    higher_dosage?: string | null;
    price_difference?: string | null;
    common_ingredients?: string[];
    unique_to_med1?: string[];
    unique_to_med2?: string[];
    common_uses?: string[];
    more_warnings?: string | null;
    higher_side_effect_count?: string | null;
    safer_option?: string | null;
  };
}

/** POST /analyze-image response */
export interface ImageAnalysisResponse {
  image_extracted_info: {
    brand: string | null;
    generic: string | null;
    strength: string | null;
  };
  medicine_insight: MedicineDetail;
}

// ─── Risk Levels ─────────────────────────────────────────────────────────────

export type RiskLevel = "Low" | "Moderate" | "High";

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Flatten a nested MedicineDetail into the flat Medicine shape for UI */
export function flattenMedicine(raw: MedicineDetail): Medicine {
  return {
    name: raw.basic_info?.name ?? "Unknown",
    dosage_mg: raw.basic_info?.dosage_mg ?? undefined,
    price: raw.basic_info?.price ?? undefined,
    composition: raw.basic_info?.composition?.join(", ") ?? undefined,
    uses: raw.basic_info?.uses ?? [],
    side_effects: raw.basic_info?.side_effects ?? [],
    warnings: raw.basic_info?.warnings ?? [],
    contraindications: raw.basic_info?.contraindications ?? [],
    manufacturer: raw.basic_info?.manufacturer ?? undefined,
    pros: raw.pros ?? [],
    cons: raw.cons ?? [],
    similar_medicines: raw.similar_medicines ?? [],
    estimated_cost_inr: raw.approx_cost ?? undefined,
  };
}

/** Normalize a backend interaction response into the flat frontend shape */
export function flattenInteraction(raw: BackendInteractionRaw): InteractionResponse {
  const a = raw.interaction_analysis ?? {};
  return {
    medicine1: raw.medicine_1,
    medicine2: raw.medicine_2,
    risk_level: a.risk_level ?? "Unknown",
    explanation: a.explanation ?? "",
    recommendations: a.recommendation ? [a.recommendation] : undefined,
  };
}
