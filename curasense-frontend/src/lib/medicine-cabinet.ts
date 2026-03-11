// ============================================
// MEDICINE CABINET — localStorage Utility
// Manages saved medicines and recent searches
// SSR-safe with typeof window guards
// ============================================

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CabinetMedicine {
  name: string;
  addedAt: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CABINET_KEY = "curasense_medicine_cabinet";
const RECENT_KEY = "curasense_recent_searches";
const MAX_CABINET = 20;
const MAX_RECENT = 8;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

// ─── Cabinet Functions ───────────────────────────────────────────────────────

/** Get all medicines in the cabinet */
export function getCabinet(): CabinetMedicine[] {
  return getStorage<CabinetMedicine[]>(CABINET_KEY, []);
}

/** Add a medicine to the cabinet (no-op if already present) */
export function addToCabinet(name: string): CabinetMedicine[] {
  const cabinet = getCabinet();
  const normalized = name.trim();
  if (!normalized) return cabinet;

  // Check if already exists (case-insensitive)
  if (cabinet.some((m) => m.name.toLowerCase() === normalized.toLowerCase())) {
    return cabinet;
  }

  const updated = [{ name: normalized, addedAt: Date.now() }, ...cabinet].slice(
    0,
    MAX_CABINET
  );
  setStorage(CABINET_KEY, updated);
  return updated;
}

/** Remove a medicine from the cabinet by name */
export function removeFromCabinet(name: string): CabinetMedicine[] {
  const cabinet = getCabinet();
  const updated = cabinet.filter(
    (m) => m.name.toLowerCase() !== name.toLowerCase()
  );
  setStorage(CABINET_KEY, updated);
  return updated;
}

/** Check if a medicine is in the cabinet */
export function isInCabinet(name: string): boolean {
  return getCabinet().some(
    (m) => m.name.toLowerCase() === name.trim().toLowerCase()
  );
}

/** Clear the entire cabinet */
export function clearCabinet(): void {
  setStorage(CABINET_KEY, []);
}

// ─── Recent Searches ─────────────────────────────────────────────────────────

/** Get recent medicine searches */
export function getRecentSearches(): string[] {
  return getStorage<string[]>(RECENT_KEY, []);
}

/** Add a search term to recent searches (moves to front if exists) */
export function addRecentSearch(term: string): string[] {
  const normalized = term.trim();
  if (!normalized) return getRecentSearches();

  const recent = getRecentSearches().filter(
    (s) => s.toLowerCase() !== normalized.toLowerCase()
  );
  const updated = [normalized, ...recent].slice(0, MAX_RECENT);
  setStorage(RECENT_KEY, updated);
  return updated;
}

// ─── Activity Tracking ───────────────────────────────────────────────────────

export type ActivityType = "lookup" | "interaction" | "compare" | "scan" | "advisor";

export interface Activity {
  type: ActivityType;
  query: string;
  timestamp: number;
}

const ACTIVITY_KEY = "curasense_medicine_activity";
const MAX_ACTIVITIES = 20;

/** Get recent activities */
export function getActivities(): Activity[] {
  return getStorage<Activity[]>(ACTIVITY_KEY, []);
}

/** Record a new activity (most recent first, deduplicates same type+query) */
export function addActivity(type: ActivityType, query: string): Activity[] {
  const normalized = query.trim();
  if (!normalized) return getActivities();

  const activities = getActivities().filter(
    (a) =>
      !(
        a.type === type &&
        a.query.toLowerCase() === normalized.toLowerCase()
      )
  );
  const updated: Activity[] = [
    { type, query: normalized, timestamp: Date.now() },
    ...activities,
  ].slice(0, MAX_ACTIVITIES);
  setStorage(ACTIVITY_KEY, updated);
  return updated;
}
