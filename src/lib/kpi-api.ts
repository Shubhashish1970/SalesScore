/**
 * KPI Data API: fetches scorecard by mobile and role.
 * Set NEXT_PUBLIC_KPI_DATA_API_URL in build env.
 * On failure, no sample fallback — caller should show BreakScreen.
 */

import type { ScorecardData, Role } from "@/types/scorecard";

const KPI_API_URL = process.env.NEXT_PUBLIC_KPI_DATA_API_URL?.trim() || "";

function isScorecardLike(obj: unknown): obj is ScorecardData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "mobile" in obj &&
    "role" in obj &&
    "finalScore" in obj &&
    "maxScore" in obj
  );
}

/**
 * Fetch scorecard from KPI Data API.
 * @throws On network error, non-2xx, or invalid response shape.
 */
export async function fetchScorecard(
  mobile: string,
  role: Role
): Promise<ScorecardData> {
  if (!KPI_API_URL) {
    throw new Error("KPI Data API URL not configured.");
  }
  const url = new URL(KPI_API_URL);
  url.searchParams.set("mobile", mobile);
  url.searchParams.set("role", role);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    throw new Error(`KPI API error: ${res.status} ${res.statusText}`);
  }
  const raw = await res.json();

  if (!isScorecardLike(raw)) {
    throw new Error("KPI API returned invalid scorecard shape.");
  }
  return raw as ScorecardData;
}

export function isKpiApiConfigured(): boolean {
  return KPI_API_URL.length > 0;
}
