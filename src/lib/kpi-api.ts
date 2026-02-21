/**
 * KPI Data API: fetches scorecard by mobile and role.
 * Set NEXT_PUBLIC_KPI_DATA_API_URL in build env.
 * The API returns ONLY core KPI data. achievementMessage and recommendedActions
 * are NOT from the API — they come from Gemini and are merged client-side.
 * Transform handles kw-sales API format and adds empty achievementMessage/recommendedActions when absent.
 * On failure, no sample fallback — caller should show BreakScreen.
 */

import type { ScorecardData, Role, OverdueBucketKey } from "@/types/scorecard";
import { getAppConfig, getDefaultConfig } from "@/lib/app-config";

const KPI_API_URL = process.env.NEXT_PUBLIC_KPI_DATA_API_URL?.trim() || "";

const ROLE_MAP: Record<string, Role> = {
  "Territory Manager": "TM",
  "Regional Manager": "RM",
  "Zonal Manager": "ZM",
  "BU Head": "BU",
  TM: "TM",
  RM: "RM",
  ZM: "ZM",
  BU: "BU",
};

const VALID_DSO_BANDS = ["<50", "50-110", "110-170", ">170"] as const;

function normalizeDsoBand(band: string): (typeof VALID_DSO_BANDS)[number] {
  const normalized = band.replace(/\s+/g, "");
  return (VALID_DSO_BANDS.includes(normalized as (typeof VALID_DSO_BANDS)[number])
    ? normalized
    : "50-110") as (typeof VALID_DSO_BANDS)[number];
}

/** Transform kw-sales API response to ScorecardData. Adds achievementMessage and recommendedActions when absent. */
function transformApiResponse(raw: unknown): ScorecardData {
  const obj = (typeof raw === "object" && raw !== null && "scorecard" in raw
    ? (raw as { scorecard?: unknown }).scorecard
    : raw) as Record<string, unknown>;

  if (!obj || typeof obj !== "object" || !("mobile" in obj) || !("finalScore" in obj) || !("maxScore" in obj)) {
    throw new Error("KPI API returned invalid scorecard shape.");
  }

  const roleRaw = obj.role ?? obj.Role;
  const role: Role = (typeof roleRaw === "string" && ROLE_MAP[roleRaw]) ? ROLE_MAP[roleRaw] : "TM";

  const growth = (obj.growth as Record<string, unknown>) ?? {};

  const dso = (obj.dso as Record<string, unknown>) ?? {};
  const dsoBandRaw = String(dso.dsoBand ?? "");
  const dsoBand = normalizeDsoBand(dsoBandRaw) as ScorecardData["dso"]["dsoBand"];

  const overdue = (obj.overdue as Record<string, unknown>) ?? {};
  const bucketKeys: OverdueBucketKey[] = ["notDue", "d1_110", "d111_180", "d181_270", "d271_365", "gt365"];
  const overduePercentages: Record<OverdueBucketKey, number> = {} as Record<OverdueBucketKey, number>;
  const bucketAmounts: Record<OverdueBucketKey, number> = {} as Record<OverdueBucketKey, number>;
  for (const k of bucketKeys) {
    overduePercentages[k] = Number(overdue[k] ?? 0);
    const amt = (overdue.bucketAmounts as Record<string, unknown>)?.[k];
    bucketAmounts[k] = Number(amt ?? 0);
  }

  const productMix = (obj.productMix as Record<string, unknown>) ?? {};
  const productMixWeight = getAppConfig().kpiWeights.productMix ?? getDefaultConfig().kpiWeights.productMix;
  const apiProductMixScore = obj.productMixScore ?? productMix.productMixScore;
  const hasProductMixScore = apiProductMixScore != null && apiProductMixScore !== "";
  const productMixScore = hasProductMixScore
    ? Number(apiProductMixScore)
    : Number(productMix.nrvFactor ?? 0) * productMixWeight;

  return {
    mobile: String(obj.mobile ?? ""),
    name: String(obj.name ?? ""),
    role,
    entityName: String(obj.entityName ?? ""),
    growth: {
      CY_NRV: Number(growth.CY_NRV ?? 0),
      LY_NRV: Number(growth.LY_NRV ?? 0),
      growthPercent: Number(growth.growthPercent ?? 0),
      growthFactor: (Number(growth.growthFactor ?? 1) >= 1 ? 1 : 0) as 0 | 1,
    },
    dso: {
      dsoDays: Number(dso.dsoDays ?? 0),
      dsoScore: Number(dso.dsoScore ?? 0),
      dsoBand: dsoBand || "50-110",
      dsoFactor: Number(dso.dsoFactor ?? 1),
    },
    overdue: {
      ...overduePercentages,
      overdueScore: Number(overdue.overdueScore ?? 0),
      bucketAmounts,
    },
    productMix: {
      categoryA: Number(productMix.categoryA ?? 0),
      categoryB: Number(productMix.categoryB ?? 0),
      categoryC: Number(productMix.categoryC ?? 0),
      categoryD: Number(productMix.categoryD ?? 0),
      categoryE: Number(productMix.categoryE ?? 0),
      nrvFactor: Number(productMix.nrvFactor ?? 0),
      productMixScore,
      categoryANrv: Number(productMix.categoryANrv ?? 0) || undefined,
      categoryBNrv: Number(productMix.categoryBNrv ?? 0) || undefined,
      categoryCNrv: Number(productMix.categoryCNrv ?? 0) || undefined,
      categoryDNrv: Number(productMix.categoryDNrv ?? 0) || undefined,
      categoryENrv: Number(productMix.categoryENrv ?? 0) || undefined,
    },
    finalScore: Number(obj.finalScore ?? 0),
    maxScore: Number(obj.maxScore ?? getAppConfig().maxScore),
    achievementMessage: "",
    recommendedActions: [],
  };
}

/**
 * Fetch scorecard from KPI Data API.
 * @param areaCode Optional; required for TM/RM/ZM/BU in multi-territory setup. Omit for HO.
 * @throws On network error, non-2xx, or invalid response shape.
 */
export async function fetchScorecard(
  mobile: string,
  role: Role,
  areaCode?: string
): Promise<ScorecardData> {
  if (!KPI_API_URL) {
    throw new Error("KPI Data API URL not configured.");
  }
  const base = KPI_API_URL.startsWith("/") && typeof window !== "undefined"
    ? window.location.origin
    : undefined;
  const url = base ? new URL(KPI_API_URL, base) : new URL(KPI_API_URL);
  url.searchParams.set("mobile", mobile);
  url.searchParams.set("role", role);
  if (areaCode) {
    url.searchParams.set("areaCode", areaCode);
  }

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    throw new Error(`KPI API error: ${res.status} ${res.statusText}`);
  }
  const raw = await res.json();

  return transformApiResponse(raw);
}

export function isKpiApiConfigured(): boolean {
  return KPI_API_URL.length > 0;
}
