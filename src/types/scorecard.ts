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

export interface Dso {
  avgOutstanding12M: number;
  avgDailySales: number;
  dsoDays: number;
  /** DSO score (e.g. 0–100); shown in roundel. Backend-computed; distinct from dsoDays. */
  dsoScore: number;
  dsoBand: "<50" | "50-110" | "110-170" | ">170";
  dsoFactor: number; // 0 = blocked, 0.5 = partial, 1 = full
}

/** Keys for overdue buckets (percentages); penalty applies to last four. */
export type OverdueBucketKey = "notDue" | "d1_110" | "d111_180" | "d181_270" | "d271_365" | "gt365";

/** Penalty % per bucket (0 = no penalty). From JSON/API. */
export type OverdueBucketPenalties = Record<OverdueBucketKey, number>;

export interface Overdue {
  notDue: number;
  d1_110: number;
  d111_180: number;
  d181_270: number;
  d271_365: number;
  gt365: number;
  penaltyApplied: number;
  /** OS score shown in roundel (e.g. 0–100). Backend-computed. */
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
}

export type ImpactLevel = "High" | "Medium" | "Low";

export interface RecommendedAction {
  whatToDo: string;
  whyItHelps: string;
  expectedImpact: ImpactLevel;
}

export interface KeyDriver {
  text: string;
  positive: boolean;
}

/** Gauge bands: red below redEnd, amber from redEnd to amberEnd, green above amberEnd. All from JSON so not hardcoded. */
export interface ScoreBandThresholds {
  redEnd: number;
  amberEnd: number;
}

/** DSO factor per band; from JSON or global API. Shown over bands; replaces hardcoded Norms. */
export type DsoBandFactors = Record<Dso["dsoBand"], number>;

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
  /** DSO factor by band (e.g. &lt;50→1.2, 50–110→1.1, …). From JSON or global API; shown over bands. */
  dsoBandFactors?: DsoBandFactors;
  /** OD weightage: penalty % per bucket (0, 0, 20, 50, 100, 200). From JSON/API; shown like DSO factors. */
  overdueBucketPenalties?: OverdueBucketPenalties;
  keyDrivers: KeyDriver[];
  recommendedActions: RecommendedAction[];
}
