"use client";

import { useEffect } from "react";
import type { Role } from "@/types/scorecard";
import type { LeaderboardEntry } from "@/types/leaderboard";

interface Props {
  isOpen: boolean;
  onClose: () => void;
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
  return n.toFixed(1);
}

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl" aria-hidden>🥇</span>;
  if (rank === 2) return <span className="text-2xl" aria-hidden>🥈</span>;
  if (rank === 3) return <span className="text-2xl" aria-hidden>🥉</span>;
  return (
    <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 tabular-nums">
      {rank}
    </span>
  );
}

export function LeaderboardModal({
  isOpen,
  onClose,
  entries,
  role,
  loading,
  error,
  currentUserName,
}: Props) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const title = getTitle(role);
  const top3 = entries.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
    >
      <div
        className="w-full max-w-lg max-h-[90dvh] flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl" aria-hidden>🏆</span>
              <h2 id="leaderboard-title" className="text-lg font-bold">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -m-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close leaderboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" aria-hidden />
              <p className="text-slate-500 text-sm">Loading leaderboard…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-red-600 text-sm text-center">{error}</p>
              <button type="button" onClick={onClose} className="mt-4 text-amber-600 text-sm font-medium">Close</button>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-slate-500 text-sm">No leaderboard data yet.</p>
            </div>
          ) : (
            <>
              {top3.length > 0 && (
                <div className="shrink-0 px-4 py-6 bg-gradient-to-b from-amber-50/80 to-white">
                  <div className="flex items-end justify-center gap-2 sm:gap-4">
                    {top3[1] && (
                      <div className="flex flex-col items-center flex-1 order-2">
                        <div className="w-full max-w-[90px] rounded-t-xl bg-gradient-to-b from-slate-300 to-slate-400 text-white p-3 h-20 flex flex-col items-center justify-end shadow-md">
                          <span className="text-2xl mb-1">🥈</span>
                          <span className="text-xs font-bold truncate w-full text-center">{top3[1].name}</span>
                          <span className="text-xs font-bold tabular-nums">{formatScore(top3[1].totalScore)}</span>
                        </div>
                        <span className="mt-2 text-sm font-bold text-slate-600">2nd</span>
                      </div>
                    )}
                    {top3[0] && (
                      <div className="flex flex-col items-center flex-1 order-1">
                        <div className="w-full max-w-[100px] rounded-t-xl bg-gradient-to-b from-amber-400 to-amber-600 text-white p-3 h-24 flex flex-col items-center justify-end shadow-lg">
                          <span className="text-3xl mb-1">🥇</span>
                          <span className="text-xs font-bold truncate w-full text-center">{top3[0].name}</span>
                          <span className="text-sm font-bold tabular-nums">{formatScore(top3[0].totalScore)}</span>
                        </div>
                        <span className="mt-2 text-sm font-bold text-amber-600">1st</span>
                      </div>
                    )}
                    {top3[2] && (
                      <div className="flex flex-col items-center flex-1 order-3">
                        <div className="w-full max-w-[90px] rounded-t-xl bg-gradient-to-b from-amber-700 to-amber-900 text-white p-3 h-16 flex flex-col items-center justify-end shadow-md">
                          <span className="text-2xl mb-1">🥉</span>
                          <span className="text-xs font-bold truncate w-full text-center">{top3[2].name}</span>
                          <span className="text-xs font-bold tabular-nums">{formatScore(top3[2].totalScore)}</span>
                        </div>
                        <span className="mt-2 text-sm font-bold text-slate-600">3rd</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="shrink-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-left">
                      <th className="px-3 py-2 font-medium w-10">#</th>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium min-w-[4rem]">Territory</th>
                      <th className="px-3 py-2 font-medium text-right tabular-nums">DSO</th>
                      <th className="px-3 py-2 font-medium text-right tabular-nums">OS</th>
                      <th className="px-3 py-2 font-medium text-right tabular-nums">Mix</th>
                      <th className="px-3 py-2 font-medium text-right tabular-nums">Total</th>
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
                          <td className="px-3 py-2"><Medal rank={entry.rank} /></td>
                          <td className="px-3 py-2">
                            <span className={isCurrentUser ? "text-amber-800" : "text-slate-800"}>
                              {entry.name}
                              {isCurrentUser && <span className="ml-1 text-amber-600 text-xs">(you)</span>}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-600 truncate max-w-[5rem]">{entry.territory || "—"}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-700">{formatScore(entry.dsoScore)}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-700">{formatScore(entry.osScore)}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-700">{formatScore(entry.productMixScore)}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-semibold text-slate-900">{formatScore(entry.totalScore)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      <button type="button" className="absolute inset-0 -z-10" aria-label="Close" onClick={onClose} />
    </div>
  );
}
