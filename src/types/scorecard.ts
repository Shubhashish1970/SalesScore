/**
 * Scorecard types — JSON-driven; all UI derives from these.
 * No formulas exposed to users; backend sends computed factors and scores.
 */

export type Role = "TM" | "RM" | "ZM" | "BU";

export interface Growth {
  CY_NRV: number;
  LY_NRV: number;
  /** Growth % (backend-computed): (CY_NRV - LY_NRV) / LY_NRV * 100. Used for display and band (Green >5%, Amber 0–5%, Red <0%). */
  growthPercent: number;
  growthFactor: 0 | 1;
}

export type DsoBandId = "<50" | "50-110" | "110-170" | ">170";

export interface DsoBandDefinition {
  id: DsoBandId;
  label: string;
  shortLabel: string;
  factor: number;
  /** Tailwind bar color, e.g. "bg-emerald-500" */
  color: string;
  /** Tailwind badge/roundel color, e.g. "bg-emerald-500 text-white" */
  roundelColor: string;
}

export interface Dso {
  dsoDays: number;
  /** DSO score (e.g. 0–100); shown in roundel. Backend-computed; distinct from dsoDays. */
  dsoScore: number;
  dsoBand: DsoBandId;
  dsoFactor: number; // 0 = blocked, 0.5 = partial, 1 = full
}

/** Keys for overdue buckets (percentages); penalty applies to last four. */
export type OverdueBucketKey = "notDue" | "d1_110" | "d111_180" | "d181_270" | "d271_365" | "gt365";

/** Penalty % per bucket (0 = no penalty). From JSON/API. */
export type OverdueBucketPenalties = Record<OverdueBucketKey, number>;

/** Overdue bucket definition: key, label, penalty %. From JSON/API. */
export interface OverdueBucketDefinition {
  key: OverdueBucketKey;
  label: string;
  penaltyPct: number;
}

/** Product mix category: id (matches productMix keys), label, weight for score impact. From JSON/API. */
export type ProductMixCategoryKey = "categoryA" | "categoryB" | "categoryC" | "categoryD" | "categoryE";

export interface ProductMixCategoryDefinition {
  id: ProductMixCategoryKey;
  label: string;
  weight: number;
}

/** Growth band thresholds: greenAbove = % above which is green, amberAbove = % above which is amber. Red = below amberAbove. */
export interface GrowthBandThresholds {
  greenAbove: number;
  amberAbove: number;
}

export interface Overdue {
  notDue: number;
  d1_110: number;
  d111_180: number;
  d181_270: number;
  d271_365: number;
  gt365: number;
  /** OS score shown in roundel (e.g. 0–100 or negative). Backend-computed. */
  overdueScore?: number;
  /** Outstanding amount per bucket for display on bar; same units (e.g. lakhs). Optional. */
  bucketAmounts?: Record<OverdueBucketKey, number>;
}

export interface ProductMix {
  categoryA: number;
  categoryB: number;
  categoryC: number;
  categoryD: number;
  categoryE: number;
  nrvFactor: number;
  /** NRV per category in rupees (from API/JSON). Shown inside bars. */
  categoryANrv?: number;
  categoryBNrv?: number;
  categoryCNrv?: number;
  categoryDNrv?: number;
  categoryENrv?: number;
}

export type ImpactLevel = "High" | "Medium" | "Low";

export interface RecommendedAction {
  whatToDo: string;
  whyItHelps: string;
  expectedImpact: ImpactLevel;
}

/** Gauge bands: red below redEnd, amber from redEnd to amberEnd, green above amberEnd. All from JSON so not hardcoded. */
export interface ScoreBandThresholds {
  redEnd: number;
  amberEnd: number;
}

/** Max score (weight) per KPI for "score/max" display in badge. Optional; defaults: productMix 34, overdue 33, dso 33. */
export interface KpiWeights {
  /** Product mix (NRV factor) — e.g. 34. */
  productMix?: number;
  /** Overdue money (OS) — e.g. 33. */
  overdue?: number;
  /** Collection Speed (DSO) — e.g. 33. */
  dso?: number;
}

export const DEFAULT_KPI_WEIGHTS: Required<KpiWeights> = {
  productMix: 34,
  overdue: 33,
  dso: 33,
};

/** Overdue bucket definitions from API/JSON. When absent, use this default. */
export const DEFAULT_OVERDUE_BUCKETS: OverdueBucketDefinition[] = [
  { key: "notDue", label: "On time", penaltyPct: 0 },
  { key: "d1_110", label: "1–110 days late", penaltyPct: 0 },
  { key: "d111_180", label: "111–180 days late", penaltyPct: 20 },
  { key: "d181_270", label: "181–270 days late", penaltyPct: 50 },
  { key: "d271_365", label: "271–365 days late", penaltyPct: 100 },
  { key: "gt365", label: "Over 365 days late", penaltyPct: 200 },
];

/** Product mix category definitions from API/JSON. When absent, use this default. */
export const DEFAULT_PRODUCT_MIX_CATEGORIES: ProductMixCategoryDefinition[] = [
  { id: "categoryA", label: "Category A", weight: 1.4 },
  { id: "categoryB", label: "Category B", weight: 1.3 },
  { id: "categoryC", label: "Category C", weight: 1.2 },
  { id: "categoryD", label: "Category D", weight: 1.1 },
  { id: "categoryE", label: "Category E", weight: 0 },
];

/** Growth band thresholds from API/JSON. Green: >greenAbove, Amber: amberAbove to greenAbove, Red: <amberAbove. */
export const DEFAULT_GROWTH_BAND_THRESHOLDS: GrowthBandThresholds = {
  greenAbove: 5,
  amberAbove: 0,
};

/** DSO factor per band; derived from dsoBands when present. Fallback when dsoBands omitted. */
export type DsoBandFactors = Record<DsoBandId, number>;

/** DSO band definitions from API/JSON. Each band: id, label, factor, colors. UI reads this for display. */
export const DEFAULT_DSO_BANDS: DsoBandDefinition[] = [
  { id: "<50", label: "Under 50 days", shortLabel: "<50", factor: 1.2, color: "bg-emerald-500", roundelColor: "bg-emerald-500 text-white" },
  { id: "50-110", label: "50–110 days", shortLabel: "50–110", factor: 1.1, color: "bg-lime-600", roundelColor: "bg-lime-600 text-white" },
  { id: "110-170", label: "110–170 days", shortLabel: "110–170", factor: 1.0, color: "bg-amber-500", roundelColor: "bg-amber-500 text-slate-900" },
  { id: ">170", label: "Over 170 days", shortLabel: ">170", factor: 0, color: "bg-red-500", roundelColor: "bg-red-500 text-white" },
];

export interface ScorecardData {
  /** Unique identifier: user's mobile number. Used when opening app from WhatsApp CTA; backend resolves person and role from this. */
  mobile: string;
  /** Display name for the user; shown as "Welcome <name>" when opened via personal link (no role dropdown). */
  name: string;
  role: Role;
  entityName: string;
  growth: Growth;
  dso: Dso;
  overdue: Overdue;
  productMix: ProductMix;
  finalScore: number;
  /** Maximum possible score (e.g. 120). Gauge and display use this; not hardcoded. */
  maxScore: number;
  /** Gauge band thresholds: &lt; redEnd = red, redEnd–amberEnd = amber, &gt; amberEnd = green. Default 80, 90 if omitted. */
  scoreBandThresholds?: ScoreBandThresholds;
  /** Single line for Score Overview under the gauge; backend-derived from score and bands (Red/Amber/Green). */
  achievementMessage: string;
  /** DSO band definitions from API. Each band has id, label, shortLabel, factor, color, roundelColor. UI reads this. */
  dsoBands?: DsoBandDefinition[];
  /** DSO factor by band. Derived from dsoBands when present; otherwise from API. Kept for backward compat. */
  dsoBandFactors?: DsoBandFactors;
  /** Overdue bucket definitions (key, label, penaltyPct). When absent, use DEFAULT_OVERDUE_BUCKETS. */
  overdueBuckets?: OverdueBucketDefinition[];
  /** OD weightage: penalty % per bucket. Can be derived from overdueBuckets or sent separately. */
  overdueBucketPenalties?: OverdueBucketPenalties;
  /** Product mix category definitions (id, label, weight). When absent, use DEFAULT_PRODUCT_MIX_CATEGORIES. */
  productMixCategories?: ProductMixCategoryDefinition[];
  /** Growth band thresholds (greenAbove, amberAbove). When absent, use DEFAULT_GROWTH_BAND_THRESHOLDS. */
  growthBandThresholds?: GrowthBandThresholds;
  /** Product mix "helped" threshold: nrvFactor >= this shows green. Optional; default 0.65. */
  productMixHelpThreshold?: number;
  /** KPI weights for score/max badge (e.g. 38/34). Optional; defaults used per KPI. */
  kpiWeights?: KpiWeights;
  /** Gemini-generated: comment in bottom box (Growth Check). When absent, fallback to hardcoded growth message. */
  growthComment?: string;
  /** Gemini-generated: comment in grey box (Collection Speed). When absent, fallback to hardcoded DSO message. */
  dsoComment?: string;
  /** Gemini-generated: comment in yellow box (Overdue). When absent, fallback to hardcoded overdue message. */
  overdueComment?: string;
  /** Gemini-generated: comment in green/amber box (Product Mix). When absent, fallback to hardcoded mix message. */
  productMixComment?: string;
  recommendedActions: RecommendedAction[];
  /** True when commentary was applied from Gemini API; used to show the Gemini-assist icon. */
  commentaryFromGemini?: boolean;
}
