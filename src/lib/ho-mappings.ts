/**
 * HO (Head Office) user mappings.
 * Fetched from API (Firestore) so all users see the same mappings.
 * Fallback to localStorage when API unavailable.
 */

import type { Role } from "@/lib/jwt-utils";

export interface HoTarget {
  mobile: string;
  role: Role;
  label?: string;
}

export interface HoMapping {
  hoMobile: string;
  /** Display name for HO leader; shown as "Welcome <Name>" on target selector. */
  hoLeaderName?: string;
  targets: HoTarget[];
}

const STORAGE_KEY = "sales-scorecard-access";

function normalizeMappings(raw: HoMapping[]): HoMapping[] {
  return (Array.isArray(raw) ? raw : []).map((m) => ({
    hoMobile: String(m.hoMobile ?? "").trim(),
    hoLeaderName: typeof m.hoLeaderName === "string" ? m.hoLeaderName.trim() : undefined,
    targets: (Array.isArray(m.targets) ? m.targets : []).map((t) => ({
      mobile: String(t.mobile ?? "").trim(),
      role: (["TM", "RM", "ZM", "BU"].includes(String(t.role ?? "").toUpperCase())
        ? String(t.role).toUpperCase() as Role
        : "TM"),
      label: typeof t.label === "string" ? t.label.trim() : undefined,
    })),
  })).filter((m) => m.hoMobile.length > 0);
}

function loadFromStorage(): HoMapping[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeMappings(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

/**
 * Fetch HO mappings from API. Falls back to localStorage on failure.
 */
export async function fetchHoMappingsFromApi(): Promise<HoMapping[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch(`${window.location.origin}/api/ho-mappings`, { method: "GET" });
    if (!res.ok) return loadFromStorage();
    const data = (await res.json()) as { mappings?: HoMapping[] };
    return normalizeMappings(Array.isArray(data?.mappings) ? data.mappings : []);
  } catch {
    return loadFromStorage();
  }
}

/**
 * Save HO mappings to API and localStorage.
 */
export async function saveHoMappingsToApi(mappings: HoMapping[]): Promise<boolean> {
  const normalized = normalizeMappings(mappings);
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    const res = await fetch(`${window.location.origin}/api/admin/ho-mappings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappings: normalized }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Load HO mappings from localStorage (for admin UI).
 */
export function loadHoMappings(): HoMapping[] {
  return loadFromStorage();
}

/**
 * Save HO mappings to localStorage only.
 */
export function saveHoMappings(mappings: HoMapping[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeMappings(mappings)));
  } catch {
    // ignore
  }
}

/**
 * Get targets for an HO user from mappings.
 */
export function getHoTargetsFromMappings(hoMobile: string, mappings: HoMapping[]): HoTarget[] | null {
  const n = String(hoMobile ?? "").trim();
  if (!n) return null;
  const found = mappings.find((m) => m.hoMobile === n);
  return found && found.targets.length > 0 ? found.targets : null;
}

/**
 * Check if mobile is an HO user from mappings.
 */
export function isHoUserFromMappings(mobile: string, mappings: HoMapping[]): boolean {
  const t = getHoTargetsFromMappings(mobile, mappings);
  return t !== null && t.length > 0;
}

/**
 * Get HO leader name from mappings for display (e.g. "Welcome <Name>").
 */
export function getHoLeaderNameFromMappings(hoMobile: string, mappings: HoMapping[]): string | undefined {
  const n = String(hoMobile ?? "").trim();
  if (!n) return undefined;
  const found = mappings.find((m) => m.hoMobile === n);
  return found?.hoLeaderName ? found.hoLeaderName.trim() : undefined;
}
