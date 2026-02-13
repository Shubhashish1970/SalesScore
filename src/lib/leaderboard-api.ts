/**
 * Leaderboard API: fetches by role only (no mobile).
 * GET /api/leaderboard?role=TM|RM|ZM
 */

import type { Role } from "@/types/scorecard";
import type { LeaderboardEntry } from "@/types/leaderboard";
import { transformLeaderboardEntry } from "@/types/leaderboard";

const LEADERBOARD_API_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/leaderboard`
    : "";

export async function fetchLeaderboard(
  role: Role
): Promise<LeaderboardEntry[]> {
  if (!LEADERBOARD_API_URL) {
    throw new Error("Leaderboard API not available");
  }
  const url = new URL(LEADERBOARD_API_URL);
  url.searchParams.set("role", role);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    throw new Error(`Leaderboard API error: ${res.status} ${res.statusText}`);
  }
  const raw = await res.json();

  const arr = Array.isArray(raw.leaderboard) ? raw.leaderboard : [];
  return arr.map((item: Record<string, unknown>) =>
    transformLeaderboardEntry(item, role)
  );
}
