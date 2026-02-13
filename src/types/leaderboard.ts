/**
 * Leaderboard types — API returns by role only (no mobile).
 * GET /leaderboard?role=TM|RM|ZM
 */

import type { Role } from "./scorecard";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  territory: string;
  dsoScore: number;
  osScore: number;
  productMixScore: number;
  totalScore: number;
  growth?: 0 | 1;
}

/** Role-specific name key in API response */
const NAME_KEYS: Record<Role, string> = {
  TM: "TM name",
  RM: "RM name",
  ZM: "ZM name",
  BU: "TM name",
};

const TERRITORY_KEYS = ["Territory name", "Region name", "Zone name"] as const;

function getTerritory(raw: Record<string, unknown>): string {
  for (const k of TERRITORY_KEYS) {
    const v = raw[k];
    if (typeof v === "string") return v;
  }
  return "";
}

export function transformLeaderboardEntry(
  raw: Record<string, unknown>,
  role: Role
): LeaderboardEntry {
  const nameKey = NAME_KEYS[role];
  const name =
    String(
      raw[nameKey] ?? raw["TM name"] ?? raw["RM name"] ?? raw["ZM name"] ?? ""
    ) || "—";

  return {
    rank: Number(raw.rank ?? 0),
    name,
    territory: getTerritory(raw),
    dsoScore: Number(raw["DSO score"] ?? 0),
    osScore: Number(raw["OS score"] ?? 0),
    productMixScore: Number(raw["product score"] ?? 0),
    totalScore: Number(raw["total score"] ?? 0),
    growth: raw.growth === 1 ? 1 : 0,
  };
}
