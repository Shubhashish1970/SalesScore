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
  if (role === "ZM") return "ZM Leaderboard (Top 5)";
  if (role === "RM") return "RM Leaderboard (Top 10)";
  return "TM Leaderboard (Top 10)";
}

function formatScore(n: number): string {
  return Number(n).toFixed(1);
}

function formatDate(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base" aria-hidden>🥇</span>;
  if (rank === 2) return <span className="text-base" aria-hidden>🥈</span>;
  if (rank === 3) return <span className="text-base" aria-hidden>🥉</span>;
  return (
    <span className="w-6 h-6 rounded-lg bg-violet-200 flex items-center justify-center text-[10px] font-bold text-violet-800 tabular-nums">
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
  const dateStr = formatDate();

  return (
    <section className="min-h-[80dvh] flex flex-col px-4 pt-4 pb-6 overflow-hidden">
      <div className="rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 px-4 py-3 mb-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <span className="text-violet-200 text-xs font-medium tabular-nums" aria-label={`Date: ${dateStr}`}>
            {dateStr}
          </span>
        </div>
        <p className="text-violet-200/90 text-[10px] mt-1">
          Rank by total score. DSO, OS, and Product Mix contribute to the total.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" aria-hidden />
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
        <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-violet-200 bg-white shadow-sm">
          <table className="w-full table-fixed text-[9px] leading-tight">
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-violet-100 to-purple-100">
              <tr className="text-violet-800 text-left">
                <th className="px-2 py-2 font-semibold w-10">#</th>
                <th className="pl-2 pr-1 py-2 font-semibold">Name</th>
                <th className="pl-1 pr-2 py-2 font-semibold w-16">Territory</th>
                <th className="px-2 py-2 font-semibold text-right tabular-nums w-10">DSO</th>
                <th className="px-2 py-2 font-semibold text-right tabular-nums w-10">OS</th>
                <th className="px-2 py-2 font-semibold text-right tabular-nums w-10">Mix</th>
                <th className="px-2 py-2 font-semibold text-right tabular-nums w-12">Total</th>
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
                    className={`border-b border-violet-100/60 ${
                      isCurrentUser
                        ? "bg-amber-100/80"
                        : i % 2 === 0
                          ? "bg-white"
                          : "bg-violet-50/40"
                    } ${i < 3 ? "font-medium" : ""}`}
                  >
                    <td className="px-2 py-1.5"><Medal rank={entry.rank} /></td>
                    <td className="pl-2 pr-1 py-1.5">
                      <span className={isCurrentUser ? "text-amber-900 font-semibold" : "text-slate-800"}>
                        {entry.name}
                        {isCurrentUser && <span className="ml-0.5 text-amber-700 text-[8px]">(you)</span>}
                      </span>
                    </td>
                    <td className="pl-1 pr-2 py-1.5 text-slate-600 truncate max-w-16">{entry.territory || "—"}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatScore(entry.dsoScore)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatScore(entry.osScore)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatScore(entry.productMixScore)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums font-bold text-violet-800">{formatScore(entry.totalScore)}</td>
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
