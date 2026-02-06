/**
 * Scorecard types — JSON-driven; all UI derives from these.
 * No formulas exposed to users; backend sends computed factors and scores.
 */

export type Role = "TM" | "RM" | "ZM" | "BU";

export interface Growth {
  CY_NRV: number;
  LY_NRV: number;
  growthFactor: 0 | 1;
}

export interface Dso {
  avgOutstanding12M: number;
  avgDailySales: number;
  dsoDays: number;
  dsoBand: "<50" | "50-110" | "110-170" | ">170";
  dsoFactor: number; // 0 = blocked, 0.5 = partial, 1 = full
}

export interface Overdue {
  notDue: number;
  d1_110: number;
  d111_180: number;
  d181_270: number;
  d271_365: number;
  gt365: number;
  penaltyApplied: number;
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

export interface ScorecardData {
  role: Role;
  entityName: string;
  growth: Growth;
  dso: Dso;
  overdue: Overdue;
  productMix: ProductMix;
  finalScore: number;
  keyDrivers: KeyDriver[];
  recommendedActions: RecommendedAction[];
}
