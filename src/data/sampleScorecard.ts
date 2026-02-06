/**
 * Sample scorecard JSON for each role. Backend would replace this;
 * UI is fully driven by this structure.
 */

import type { ScorecardData } from "@/types/scorecard";

export const sampleTM: ScorecardData = {
  role: "TM",
  entityName: "Territory North-East",
  growth: {
    CY_NRV: 4250000,
    LY_NRV: 3800000,
    growthFactor: 1,
  },
  dso: {
    avgOutstanding12M: 1200000,
    avgDailySales: 120000,
    dsoDays: 100,
    dsoBand: "50-110",
    dsoFactor: 0.8,
  },
  overdue: {
    notDue: 60,
    d1_110: 25,
    d111_180: 8,
    d181_270: 4,
    d271_365: 2,
    gt365: 1,
    penaltyApplied: 12,
  },
  productMix: {
    categoryA: 35,
    categoryB: 28,
    categoryC: 22,
    categoryD: 10,
    categoryE: 5,
    nrvFactor: 0.72,
  },
  finalScore: 68,
  keyDrivers: [
    { text: "Sales grew compared to last year", positive: true },
    { text: "Some money is stuck beyond 180 days", positive: false },
    { text: "Collection speed is in the middle band", positive: false },
  ],
  recommendedActions: [
    {
      whatToDo: "Follow up with top 5 dealers who have bills over 180 days",
      whyItHelps: "Reducing old dues cuts the penalty and improves your score",
      expectedImpact: "High",
    },
    {
      whatToDo: "Push Category A and B products in under-performing outlets",
      whyItHelps: "Better product mix increases the score weight from sales",
      expectedImpact: "Medium",
    },
    {
      whatToDo: "Collect cheques and clear pending DSO within 90 days",
      whyItHelps: "Faster collection moves you to a better DSO band",
      expectedImpact: "High",
    },
  ],
};

export const sampleRM: ScorecardData = {
  role: "RM",
  entityName: "Region East",
  growth: {
    CY_NRV: 18500000,
    LY_NRV: 17200000,
    growthFactor: 1,
  },
  dso: {
    avgOutstanding12M: 5200000,
    avgDailySales: 505000,
    dsoDays: 103,
    dsoBand: "50-110",
    dsoFactor: 0.75,
  },
  overdue: {
    notDue: 58,
    d1_110: 24,
    d111_180: 10,
    d181_270: 5,
    d271_365: 2,
    gt365: 1,
    penaltyApplied: 15,
  },
  productMix: {
    categoryA: 32,
    categoryB: 30,
    categoryC: 20,
    categoryD: 12,
    categoryE: 6,
    nrvFactor: 0.68,
  },
  finalScore: 62,
  keyDrivers: [
    { text: "Region has grown over last year", positive: true },
    { text: "Overdue beyond 180 days is pulling the score down", positive: false },
    { text: "Two territories have no growth; focus support there", positive: false },
  ],
  recommendedActions: [
    {
      whatToDo: "Review weak territories and reallocate dealer focus",
      whyItHelps: "Improving lagging territories lifts regional growth and score",
      expectedImpact: "High",
    },
    {
      whatToDo: "Drive DSO improvement in territories with DSO above 120 days",
      whyItHelps: "Faster collection at territory level improves region band",
      expectedImpact: "Medium",
    },
    {
      whatToDo: "Share best practices from top territories on overdue reduction",
      whyItHelps: "Systematic follow-up reduces penalties across the region",
      expectedImpact: "Medium",
    },
  ],
};

export const sampleZM: ScorecardData = {
  role: "ZM",
  entityName: "Zone Central",
  growth: {
    CY_NRV: 72000000,
    LY_NRV: 69000000,
    growthFactor: 1,
  },
  dso: {
    avgOutstanding12M: 21000000,
    avgDailySales: 1950000,
    dsoDays: 108,
    dsoBand: "110-170",
    dsoFactor: 0.5,
  },
  overdue: {
    notDue: 55,
    d1_110: 26,
    d111_180: 11,
    d181_270: 5,
    d271_365: 2,
    gt365: 1,
    penaltyApplied: 18,
  },
  productMix: {
    categoryA: 30,
    categoryB: 28,
    categoryC: 24,
    categoryD: 12,
    categoryE: 6,
    nrvFactor: 0.65,
  },
  finalScore: 54,
  keyDrivers: [
    { text: "Zone growth is on track", positive: true },
    { text: "Collection speed is in the higher band; score is partially capped", positive: false },
    { text: "Old overdue is a systemic issue across regions", positive: false },
  ],
  recommendedActions: [
    {
      whatToDo: "Roll out zone-level DSO targets and track weekly",
      whyItHelps: "Bringing DSO below 110 unlocks full score potential",
      expectedImpact: "High",
    },
    {
      whatToDo: "Standardise overdue follow-up process across all regions",
      whyItHelps: "Consistent process reduces penalties and improves predictability",
      expectedImpact: "High",
    },
    {
      whatToDo: "Correct product mix in regions heavy on Category D and E",
      whyItHelps: "Better mix improves NRV factor and overall score",
      expectedImpact: "Medium",
    },
  ],
};

export const sampleBU: ScorecardData = {
  role: "BU",
  entityName: "Seeds Business Unit",
  growth: {
    CY_NRV: 280000000,
    LY_NRV: 265000000,
    growthFactor: 1,
  },
  dso: {
    avgOutstanding12M: 85000000,
    avgDailySales: 7600000,
    dsoDays: 112,
    dsoBand: "110-170",
    dsoFactor: 0.55,
  },
  overdue: {
    notDue: 52,
    d1_110: 27,
    d111_180: 12,
    d181_270: 6,
    d271_365: 2,
    gt365: 1,
    penaltyApplied: 20,
  },
  productMix: {
    categoryA: 28,
    categoryB: 26,
    categoryC: 26,
    categoryD: 14,
    categoryE: 6,
    nrvFactor: 0.62,
  },
  finalScore: 58,
  keyDrivers: [
    { text: "BU has achieved growth vs last year", positive: true },
    { text: "Policy on credit and collection needs tightening", positive: false },
    { text: "Product mix is tilted toward lower-impact categories", positive: false },
  ],
  recommendedActions: [
    {
      whatToDo: "Tighten credit policy for channels with DSO above 150 days",
      whyItHelps: "Policy change prevents further slip and protects score",
      expectedImpact: "High",
    },
    {
      whatToDo: "Incentivise Category A and B through schemes and targets",
      whyItHelps: "Mix correction improves NRV factor at BU level",
      expectedImpact: "High",
    },
    {
      whatToDo: "Review zones with highest overdue beyond 270 days",
      whyItHelps: "Targeted intervention reduces penalty drag on score",
      expectedImpact: "Medium",
    },
  ],
};

/** Default data for app; switch role via query or context in real use */
export const defaultScorecard = sampleTM;
