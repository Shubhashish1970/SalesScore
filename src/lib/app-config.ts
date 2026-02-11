/**
 * Central App Config — admin-configurable parameters (methodology of prompting).
 * These are NOT in the scorecard JSON; they come from Admin Settings.
 * For now: static defaults. Later: load from Firestore when Admin panel is implemented.
 */

import type {
  ScoreBandThresholds,
  GrowthBandThresholds,
  DsoBandDefinition,
  OverdueBucketDefinition,
  OverdueBucketPenalties,
  ProductMixCategoryDefinition,
  KpiWeights,
} from "@/types/scorecard";

export interface AppConfig {
  scoreBandThresholds: ScoreBandThresholds;
  maxScore: number;
  growthBandThresholds: GrowthBandThresholds;
  dsoBands: DsoBandDefinition[];
  overdueBuckets: OverdueBucketDefinition[];
  overdueBucketPenalties: OverdueBucketPenalties;
  productMixCategories: ProductMixCategoryDefinition[];
  kpiWeights: Required<KpiWeights>;
  productMixHelpThreshold: number;
  /** Overdue badge: green when osScore > this. */
  overdueBadgeGreenAbove: number;
  /** Overdue badge: amber when osScore >= this and <= greenAbove. */
  overdueBadgeAmberAbove: number;
  /** Product mix badge: green when ratio (nrvFactor/weight) > this. */
  productMixBadgeGreenRatio: number;
  /** Product mix badge: amber when ratio >= this and <= greenRatio. */
  productMixBadgeAmberRatio: number;
  recommendedActionsMin: number;
  recommendedActionsMax: number;
}

const DEFAULT_APP_CONFIG: AppConfig = {
  scoreBandThresholds: { redEnd: 80, amberEnd: 90 },
  maxScore: 120,
  growthBandThresholds: { greenAbove: 5, amberAbove: 0 },
  dsoBands: [
    { id: "<50", label: "Under 50 days", shortLabel: "<50", factor: 1.2, color: "bg-emerald-500", roundelColor: "bg-emerald-500 text-white" },
    { id: "50-110", label: "50–110 days", shortLabel: "50–110", factor: 1.1, color: "bg-lime-600", roundelColor: "bg-lime-600 text-white" },
    { id: "110-170", label: "110–170 days", shortLabel: "110–170", factor: 1.0, color: "bg-amber-500", roundelColor: "bg-amber-500 text-slate-900" },
    { id: ">170", label: "Over 170 days", shortLabel: ">170", factor: 0, color: "bg-red-500", roundelColor: "bg-red-500 text-white" },
  ],
  overdueBuckets: [
    { key: "notDue", label: "On time", penaltyPct: 0 },
    { key: "d1_110", label: "1–110 days late", penaltyPct: 0 },
    { key: "d111_180", label: "111–180 days late", penaltyPct: 20 },
    { key: "d181_270", label: "181–270 days late", penaltyPct: 50 },
    { key: "d271_365", label: "271–365 days late", penaltyPct: 100 },
    { key: "gt365", label: "Over 365 days late", penaltyPct: 200 },
  ],
  overdueBucketPenalties: { notDue: 0, d1_110: 0, d111_180: 20, d181_270: 50, d271_365: 100, gt365: 200 },
  productMixCategories: [
    { id: "categoryA", label: "Category A", weight: 1.4 },
    { id: "categoryB", label: "Category B", weight: 1.3 },
    { id: "categoryC", label: "Category C", weight: 1.2 },
    { id: "categoryD", label: "Category D", weight: 1.1 },
    { id: "categoryE", label: "Category E", weight: 0 },
  ],
  kpiWeights: { productMix: 34, overdue: 33, dso: 33 },
  productMixHelpThreshold: 0.65,
  overdueBadgeGreenAbove: 33,
  overdueBadgeAmberAbove: 27,
  productMixBadgeGreenRatio: 1,
  productMixBadgeAmberRatio: 0.8,
  recommendedActionsMin: 3,
  recommendedActionsMax: 5,
};

const STORAGE_KEY = "sales-scorecard-config";

let _config: AppConfig = { ...DEFAULT_APP_CONFIG };

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const out = { ...target } as Record<string, unknown>;
  for (const k of Object.keys(source) as (keyof T)[]) {
    const key = String(k);
    const v = source[k];
    if (v != null && typeof v === "object" && !Array.isArray(v) && typeof target[k] === "object" && target[k] != null && !Array.isArray(target[k])) {
      out[key] = deepMerge((target[k] as object) || {}, v as Record<string, unknown>);
    } else if (v !== undefined) {
      out[key] = v;
    }
  }
  return out as T;
}

/**
 * Load config from localStorage (client-only). Merges into current _config.
 */
export function loadConfigFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    if (parsed && typeof parsed === "object") {
      _config = deepMerge({ ...DEFAULT_APP_CONFIG }, parsed) as AppConfig;
    }
  } catch {
    // ignore parse errors
  }
}

/**
 * Save config to localStorage and update _config.
 */
export function saveConfig(config: AppConfig): void {
  _config = config;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore quota errors
  }
}

/**
 * Get the current app config. Used by screens and Gemini prompt building.
 */
export function getAppConfig(): AppConfig {
  return _config;
}

/**
 * Reset to defaults. Does not clear localStorage; use saveConfig() to persist.
 */
export function resetAppConfig(): void {
  _config = JSON.parse(JSON.stringify(DEFAULT_APP_CONFIG));
}

/** Get defaults for cloning/editing. */
export function getDefaultConfig(): AppConfig {
  return JSON.parse(JSON.stringify(DEFAULT_APP_CONFIG));
}
