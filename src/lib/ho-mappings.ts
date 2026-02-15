/**
 * HO (Head Office) user mappings.
 * Stored in localStorage under sales-scorecard-access.
 * HO users can view scorecards of mapped target users (TM/RM/ZM/BU).
 */

import type { Role } from "@/lib/jwt-utils";

export interface HoTarget {
  mobile: string;
  role: Role;
  label?: string;
}

export interface HoMapping {
  hoMobile: string;
  targets: HoTarget[];
}

const STORAGE_KEY = "sales-scorecard-access";

function loadRaw(): HoMapping[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Load all HO mappings from localStorage.
 */
export function loadHoMappings(): HoMapping[] {
  const raw = loadRaw();
  return raw.map((m) => ({
    hoMobile: String(m.hoMobile ?? "").trim(),
    targets: (Array.isArray(m.targets) ? m.targets : []).map((t) => ({
      mobile: String(t.mobile ?? "").trim(),
      role: (["TM", "RM", "ZM", "BU"].includes(String(t.role ?? "").toUpperCase())
        ? String(t.role).toUpperCase() as Role
        : "TM"),
      label: typeof t.label === "string" ? t.label.trim() : undefined,
    })),
  })).filter((m) => m.hoMobile.length > 0);
}

/**
 * Save HO mappings to localStorage.
 */
export function saveHoMappings(mappings: HoMapping[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch {
    // ignore quota errors
  }
}

/**
 * Get targets for an HO user by mobile. Returns null if not an HO user.
 */
export function getHoTargets(hoMobile: string): HoTarget[] | null {
  const normalized = String(hoMobile ?? "").trim();
  if (!normalized) return null;
  const mappings = loadHoMappings();
  const found = mappings.find((m) => m.hoMobile === normalized);
  return found && found.targets.length > 0 ? found.targets : null;
}

/**
 * Check if a mobile is an HO user with at least one target.
 */
export function isHoUser(mobile: string): boolean {
  const targets = getHoTargets(mobile);
  return targets !== null && targets.length > 0;
}
