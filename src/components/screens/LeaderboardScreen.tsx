"use client";

import type { Role } from "@/types/scorecard";
import type { LeaderboardEntry } from "@/types/leaderboard";

interface Props {
  entries: LeaderboardEntry[];
  role: Role;
  loading?: boolean;
  error?: string | null;
  currentUserName?: string;
}

function getTitle(role: Role): string {
  if (role === "ZM") return "Top 5 ZMs";
  if (role === "RM") return "Top 10 RMs";
  return "Top 10 TMs";
}

function formatScore(n: number): string {
  return String(Math.round(n));
}

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base" aria-hidden>🥇</span>;
  if (rank === 2) return <span className="text-base" aria-hidden>🥈</span>;
  if (rank === 3) return <span className="text-base" aria-hidden>🥉</span>;
  return (
    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 tabular-nums">
      {rank}
    </span>
  );
}

export function LeaderboardScreen({
  entries,
  role,
  loading,
  error,
  currentUserName,
}: Props) {
  const title = getTitle(role);

  return (
    <section className="min-h-[80dvh] flex flex-col px-5 pt-6 pb-4 overflow-hidden">
      <h2 className="text-base font-semibold text-slate-800 mb-0.5 pr-10">{title}</h2>
      <p className="text-[#2f41a7] text-[10px] mt-0 mb-3 pr-12">
        Rank by total score. DSO, OS, and Product Mix contribute to the total.
      </p>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" aria-hidden />
          <p className="text-slate-500 text-[10px]">Loading leaderboard…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-red-600 text-[10px] text-center">{error}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-slate-500 text-[10px]">No leaderboard data yet.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden">
          <table className="w-full text-[10px] leading-tight">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-left">
                <th className="px-1.5 py-1 font-medium w-6">#</th>
                <th className="px-1.5 py-1 font-medium">Name</th>
                <th className="px-1.5 py-1 font-medium min-w-[3rem]">Territory</th>
                <th className="px-1.5 py-1 font-medium text-right tabular-nums w-8">DSO</th>
                <th className="px-1.5 py-1 font-medium text-right tabular-nums w-8">OS</th>
                <th className="px-1.5 py-1 font-medium text-right tabular-nums w-8">Mix</th>
                <th className="px-1.5 py-1 font-medium text-right tabular-nums w-10">Total</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const cu = (currentUserName ?? "").toLowerCase().trim();
                const en = entry.name.toLowerCase().trim();
                const isCurrentUser = cu && (en.includes(cu) || cu.includes(en));
                return (
                  <tr
                    key={entry.rank}
                    className={`border-b border-slate-100 ${isCurrentUser ? "bg-amber-50" : "bg-white"} ${i < 3 ? "font-medium" : ""}`}
                  >
                    <td className="px-1.5 py-0.5"><Medal rank={entry.rank} /></td>
                    <td className="px-1.5 py-0.5">
                      <span className={isCurrentUser ? "text-amber-800" : "text-slate-800"}>
                        {entry.name}
                        {isCurrentUser && <span className="ml-0.5 text-amber-600">(you)</span>}
                      </span>
                    </td>
                    <td className="px-1.5 py-0.5 text-slate-600 truncate max-w-[3.5rem]">{entry.territory || "—"}</td>
                    <td className="px-1.5 py-0.5 text-right tabular-nums text-slate-700">{formatScore(entry.dsoScore)}</td>
                    <td className="px-1.5 py-0.5 text-right tabular-nums text-slate-700">{formatScore(entry.osScore)}</td>
                    <td className="px-1.5 py-0.5 text-right tabular-nums text-slate-700">{formatScore(entry.productMixScore)}</td>
                    <td className="px-1.5 py-0.5 text-right tabular-nums font-semibold text-slate-900">{formatScore(entry.totalScore)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
