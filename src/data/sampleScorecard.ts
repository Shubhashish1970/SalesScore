/**
 * Sample scorecard JSON for each role. Backend would replace this;
 * UI is fully driven by this structure.
 * Config (bands, thresholds, weights) comes from App Config, not JSON.
 */

import type { ScorecardData } from "@/types/scorecard";

/** TM sample: realistic values from Dindigul / Pushpanathan (score 111/120, CY 1.9 Cr, DSO 74 days, OS 0.69 Cr). */
export const sampleTM: ScorecardData = {
  mobile: "9080340493",
  name: "Pushpanathan",
  role: "TM",
  entityName: "Dindigul",
  growth: {
    CY_NRV: 19000000,
    LY_NRV: 15000000,
    growthPercent: 28.8,
    growthFactor: 1,
  },
  dso: {
    dsoDays: 74,
    dsoScore: 36,
    dsoBand: "50-110",
    dsoFactor: 1.1,
  },
  overdue: {
    notDue: 94,
    d1_110: 2,
    d111_180: 2,
    d181_270: 1,
    d271_365: 0.5,
    gt365: 0.5,
    overdueScore: 33,
    bucketAmounts: { notDue: 65, d1_110: 2, d111_180: 1, d181_270: 0.5, d271_365: 0.3, gt365: 0.2 },
  },
  productMix: {
    categoryA: 38,
    categoryB: 28,
    categoryC: 22,
    categoryD: 8,
    categoryE: 4,
    nrvFactor: 1.22,
    categoryANrv: 7220000,
    categoryBNrv: 5320000,
    categoryCNrv: 4180000,
    categoryDNrv: 1520000,
    categoryENrv: 760000,
  },
  finalScore: 111,
  maxScore: 120,
  achievementMessage: "Your score is in the Green zone — keep it up.",
  recommendedActions: [
    {
      whatToDo: "Keep DSO below 110 days to retain full factor",
      whyItHelps: "You are in the 50–110 band; improving further can lift the score",
      expectedImpact: "Medium",
    },
    {
      whatToDo: "Push Category A and B in under-performing outlets",
      whyItHelps: "Better product mix increases the score weight from sales",
      expectedImpact: "Medium",
    },
    {
      whatToDo: "Clear the small overdue in 111+ day buckets",
      whyItHelps: "Reducing aged dues keeps penalty low and protects your score",
      expectedImpact: "High",
    },
  ],
};

/** TM sample: Gorakhpur territory — Raghavendra Pandey (Emp 22873). Score 36/120, growth 127%, DSO 239 days, OS 1.99 Cr. */
export const sampleGorakhpurTM: ScorecardData = {
  mobile: "9151003714",
  name: "Raghavendra Pandey",
  role: "TM",
  entityName: "Gorakhpur",
  growth: {
    CY_NRV: 18000000,
    LY_NRV: 8000000,
    growthPercent: 127.0,
    growthFactor: 1,
  },
  dso: {
    dsoDays: 239.53,
    dsoScore: 0,
    dsoBand: ">170",
    dsoFactor: 0,
  },
  overdue: {
    notDue: 37,
    d1_110: 8,
    d111_180: 5,
    d181_270: 3,
    d271_365: 2,
    gt365: 45,
    overdueScore: -1.9,
    bucketAmounts: { notDue: 0.74, d1_110: 0.16, d111_180: 0.09, d181_270: 0.05, d271_365: 0.04, gt365: 0.91 },
  },
  productMix: {
    categoryA: 24,
    categoryB: 14,
    categoryC: 26,
    categoryD: 22,
    categoryE: 14,
    nrvFactor: 38.3,
    categoryANrv: 4320000,
    categoryBNrv: 2520000,
    categoryCNrv: 4680000,
    categoryDNrv: 3960000,
    categoryENrv: 2520000,
  },
  finalScore: 36,
  maxScore: 120,
  achievementMessage: "Your score is in the Red zone — focus on DSO and overdue to improve.",
  recommendedActions: [
    {
      whatToDo: "Bring DSO below 170 days to unlock a DSO factor",
      whyItHelps: "Currently in >170 band with factor 0; improving collection lifts score",
      expectedImpact: "High",
    },
    {
      whatToDo: "Clear overdue beyond 365 days on priority",
      whyItHelps: "200% penalty on 0.91 Cr is pulling the score down",
      expectedImpact: "High",
    },
    {
      whatToDo: "Push Category A and B share in under-performing dealers",
      whyItHelps: "Product mix at 38.3% can improve NRV factor further",
      expectedImpact: "Medium",
    },
  ],
};

/** TM sample: Prayagraj — Devansh Singh (Emp 22730). Score 103/120, CY 1.2 Cr, growth 73.8%, DSO 126.76 days, OS 0.53 Cr. */
export const samplePrayagrajTM: ScorecardData = {
  mobile: "9118199000",
  name: "Devansh Singh",
  role: "TM",
  entityName: "Prayagraj",
  growth: {
    CY_NRV: 12000000,
    LY_NRV: 7000000,
    growthPercent: 73.8,
    growthFactor: 1,
  },
  dso: {
    dsoDays: 126.76,
    dsoScore: 33,
    dsoBand: "110-170",
    dsoFactor: 1.0,
  },
  overdue: {
    notDue: 59,
    d1_110: 11,
    d111_180: 28,
    d181_270: 1,
    d271_365: 1,
    gt365: 0,
    overdueScore: 31.7,
    bucketAmounts: { notDue: 31, d1_110: 6, d111_180: 15, d181_270: 1, d271_365: 0, gt365: 0 },
  },
  productMix: {
    categoryA: 1.81,
    categoryB: 57.67,
    categoryC: 3.57,
    categoryD: 28.04,
    categoryE: 8.91,
    nrvFactor: 38.3,
    categoryANrv: 215970,
    categoryBNrv: 6896622,
    categoryCNrv: 426671,
    categoryDNrv: 3353020,
    categoryENrv: 1065773,
  },
  finalScore: 103,
  maxScore: 120,
  achievementMessage: "Your score is in the Green zone — keep it up.",
  recommendedActions: [
    { whatToDo: "Bring DSO below 110 days to unlock higher factor", whyItHelps: "You are in the 110–170 days band. Moving to 50–110 days unlocks a better DSO factor and lifts your overall score.", expectedImpact: "High" },
    { whatToDo: "Clear overdue in 111–180 days bucket on priority", whyItHelps: "15 L is in the 20% penalty bucket. Clearing it reduces penalty drag and improves your OS score.", expectedImpact: "High" },
    { whatToDo: "Push Category A and B share in under-performing outlets", whyItHelps: "Your mix is already helping (38/34). More of Category A and B will improve the NRV factor further.", expectedImpact: "Medium" },
    { whatToDo: "Keep growth momentum and monitor 181+ day overdue", whyItHelps: "Growth is strong; keeping 181+ day bucket minimal avoids the highest penalties and protects your score.", expectedImpact: "Medium" },
  ],
};

export const sampleRM: ScorecardData = {
  mobile: "9876510002",
  name: "Priya",
  role: "RM",
  entityName: "Region East",
  growth: {
    CY_NRV: 18500000,
    LY_NRV: 17200000,
    growthPercent: 7.6,
    growthFactor: 1,
  },
  dso: {
    dsoDays: 103,
    dsoScore: 28,
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
    overdueScore: 68,
    bucketAmounts: { notDue: 23.2, d1_110: 9.6, d111_180: 4, d181_270: 2, d271_365: 0.8, gt365: 0.4 },
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
  maxScore: 120,
  achievementMessage: "Your score is in the Red zone — focus on the areas below to improve.",
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

/** Lucknow RM: Sandeep Singh Sikarwar (Emp 22815). From Nagarjuna NaCl dashboard. Score 41/120, DSO 179 days, OS 9.88 Cr. */
export const sampleLucknowRM: ScorecardData = {
  mobile: "8121026014",
  name: "Sandeep Singh Sikarwar",
  role: "RM",
  entityName: "Lucknow",
  growth: {
    CY_NRV: 122000000,
    LY_NRV: 102000000,
    growthPercent: 19.6,
    growthFactor: 1,
  },
  dso: {
    dsoDays: 179.83,
    dsoScore: 0,
    dsoBand: ">170",
    dsoFactor: 0,
  },
  overdue: {
    notDue: 43,
    d1_110: 5,
    d111_180: 0,
    d181_270: 0,
    d271_365: 0,
    gt365: 52,
    overdueScore: 6,
    bucketAmounts: { notDue: 428, d1_110: 50, d111_180: 0, d181_270: 0, d271_365: 0, gt365: 510 },
  },
  productMix: {
    categoryA: 35,
    categoryB: 28,
    categoryC: 22,
    categoryD: 10,
    categoryE: 5,
    nrvFactor: 35.1,
  },
  finalScore: 41,
  maxScore: 120,
  achievementMessage: "Your score is in the Red zone — focus on DSO and overdue to improve.",
  recommendedActions: [
    { whatToDo: "Prioritise clearing >365 days overdue (4.87 Cr)", whyItHelps: "200% penalty on this bucket is severely hurting your OS score", expectedImpact: "High" },
    { whatToDo: "Drive DSO below 170 days", whyItHelps: "DSO at 179 days is in the zero-factor band; improving unlocks score", expectedImpact: "High" },
    { whatToDo: "Replicate growth from the 4 positive territories", whyItHelps: "57% of territories grew; scaling best practices can lift regional score", expectedImpact: "Medium" },
  ],
};

export const sampleZM: ScorecardData = {
  mobile: "9876510003",
  name: "Amit",
  role: "ZM",
  entityName: "Zone Central",
  growth: {
    CY_NRV: 72000000,
    LY_NRV: 69000000,
    growthPercent: 4.3,
    growthFactor: 1,
  },
  dso: {
    dsoDays: 108,
    dsoScore: 35,
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
    overdueScore: 62,
    bucketAmounts: { notDue: 22, d1_110: 10.4, d111_180: 4.4, d181_270: 2, d271_365: 0.8, gt365: 0.4 },
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
  maxScore: 120,
  achievementMessage: "Your score is in the Red zone — focus on the areas below to improve.",
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
  mobile: "9876510004",
  name: "Sneha",
  role: "BU",
  entityName: "Seeds Business Unit",
  growth: {
    CY_NRV: 280000000,
    LY_NRV: 265000000,
    growthPercent: 5.7,
    growthFactor: 1,
  },
  dso: {
    dsoDays: 112,
    dsoScore: 38,
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
    overdueScore: 58,
    bucketAmounts: { notDue: 20.8, d1_110: 10.8, d111_180: 4.8, d181_270: 2.4, d271_365: 0.8, gt365: 0.4 },
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
  maxScore: 120,
  achievementMessage: "Your score is in the Red zone — focus on the areas below to improve.",
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

/** Default data for app when no mobile in URL (demo mode). */
export const defaultScorecard = sampleTM;

/**
 * Demo: map plain mobile to sample scorecard (use only for local/demo; production should use ?u= token only).
 */
export const scorecardByMobile: Record<string, ScorecardData> = {
  "9876510001": sampleTM,
  "9080340493": sampleTM,
  "9151003714": sampleGorakhpurTM,
  "9118199000": samplePrayagrajTM,
  "9876510002": sampleRM,
  "8121026014": sampleLucknowRM,
  "9876510003": sampleZM,
  "9876510004": sampleBU,
};

/**
 * Demo: map masked/opaque user token to sample scorecard.
 * Production: backend puts encrypted mobile (or opaque token) in ?u=; API GET /api/scorecard?u={token} decrypts/resolves and returns ScorecardData. Mobile never appears in URL.
 */
export const scorecardByToken: Record<string, ScorecardData> = {
  "d_tm": sampleTM,
  "d_gorakhpur": sampleGorakhpurTM,
  "d_prayagraj": samplePrayagrajTM,
  "d_rm": sampleRM,
  "d_lucknow": sampleLucknowRM,
  "d_zm": sampleZM,
  "d_bu": sampleBU,
};
