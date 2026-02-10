"use client";

import type { ScorecardData } from "@/types/scorecard";
import { GeminiCommentaryBadge } from "@/components/GeminiCommentaryBadge";
import type { OverdueBucketKey } from "@/types/scorecard";

/**
 * Screen 4: Overdue buckets; outstanding on bar; red for penalized; OS score roundel; OD weightage.
 */
interface Props {
  data: ScorecardData;
}

const BUCKETS: { key: OverdueBucketKey; label: string }[] = [
  { key: "notDue", label: "On time" },
  { key: "d1_110", label: "1–110 days late" },
  { key: "d111_180", label: "111–180 days late" },
  { key: "d181_270", label: "181–270 days late" },
  { key: "d271_365", label: "271–365 days late" },
  { key: "gt365", label: "Over 365 days late" },
];

const PENALTY_START_INDEX = 2;

function formatAmount(n: number): string {
  if (n >= 100) return `${(n / 100).toFixed(1)} Cr`;
  if (n >= 1) return `${n.toFixed(1)} L`;
  return `${(n * 100).toFixed(0)} K`;
}

export function OverdueMoney({ data }: Props) {
  const { overdue } = data;
  const penalties = data.overdueBucketPenalties;
  const amounts = overdue.bucketAmounts;
  const total = BUCKETS.reduce((s, b) => s + overdue[b.key], 0) || 1;
  const badShare = (overdue.d181_270 + overdue.d271_365 + overdue.gt365) / total;
  const osScore = overdue.overdueScore ?? null;
  const totalOverdueLakhs = amounts
    ? BUCKETS.reduce((s, b) => s + (amounts[b.key] ?? 0), 0)
    : 0;
  const totalOverdueStr = totalOverdueLakhs > 0 ? formatAmount(totalOverdueLakhs) : null;
  const overdueWeight = data.kpiWeights?.overdue ?? 33;

  return (
    <section className="min-h-[80dvh] flex flex-col px-5 pt-8 pb-6 relative">
      {osScore != null && (
        <div
          className="absolute top-6 right-5 rounded-lg px-2.5 py-1.5 flex items-center justify-center text-base font-bold tabular-nums bg-amber-500 text-slate-900 min-w-[4.5rem]"
          aria-label={`OS score: ${Math.round(osScore)} out of ${overdueWeight}`}
        >
          {Math.round(osScore)}/{overdueWeight}
        </div>
      )}
      <h2 className="text-lg font-semibold text-slate-800 mb-0.5 pr-20">Overdue money</h2>
      <p className="text-[#2f41a7] text-xs mt-0 mb-4 pr-20">
        Money that is late. The older the delay, the more it hurts your score.
      </p>
      {totalOverdueStr != null && (
        <div className="mb-6">
          <p className="text-3xl font-bold text-slate-900 tabular-nums">{totalOverdueStr}</p>
          <p className="text-slate-500 text-sm">total overdue</p>
        </div>
      )}
      {penalties && (
        <p className="text-xs text-slate-500 mb-2">
          OD weightage = penalty % applied to money in that bucket (higher = worse for score).
        </p>
      )}
      <div className="space-y-2 mb-2">
        <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50/30 p-2 space-y-1.5">
          <p className="text-[10px] text-emerald-800 font-medium px-0.5 -mt-0.5">No penalty (on time / 1–110 days)</p>
          {BUCKETS.slice(0, PENALTY_START_INDEX).map(({ key, label }) => {
            const pct = total ? (overdue[key] / total) * 100 : 0;
            const amountStr = amounts ? formatAmount(amounts[key]) : null;
            const penaltyPct = penalties ? penalties[key] : null;
            return (
              <div key={key} className="flex items-center gap-2">
                <div className="w-28 text-slate-600 text-xs shrink-0">{label}</div>
                <div className="flex-1 h-5 bg-slate-200 rounded overflow-hidden relative min-w-0 flex items-center justify-end pr-2">
                  <div
                    className="absolute inset-y-0 left-0 rounded bg-slate-400"
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                  {amountStr && (
                    <span className="relative z-10 text-xs font-medium text-slate-700 tabular-nums">{amountStr}</span>
                  )}
                </div>
                {penaltyPct != null && (
                  <span className="text-[10px] text-emerald-600 font-medium w-8 shrink-0 text-right">{penaltyPct === 0 ? "0%" : `${penaltyPct}%`}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="rounded-lg border-2 border-dashed border-amber-400 bg-amber-50/20 p-2 space-y-1.5 animate-overdue-dashed-glow">
          <p className="text-[10px] text-amber-800 font-medium px-0.5 -mt-0.5">Penalized (111+ days)</p>
          {BUCKETS.slice(PENALTY_START_INDEX).map(({ key, label }) => {
            const pct = total ? (overdue[key] / total) * 100 : 0;
            const hasMoney = overdue[key] > 0;
            const showRed = hasMoney;
            const amountStr = amounts ? formatAmount(amounts[key]) : null;
            const penaltyPct = penalties ? penalties[key] : null;
            return (
              <div key={key} className="flex items-center gap-2">
                <div className="w-28 text-slate-600 text-xs shrink-0">{label}</div>
                <div className="flex-1 h-5 bg-slate-200 rounded overflow-hidden relative min-w-0 flex items-center justify-end pr-2">
                  <div
                    className={`absolute inset-y-0 left-0 rounded animate-overdue-penalized origin-left ${showRed ? "bg-red-600 animate-overdue-bar-attention ring-1 ring-red-400/50" : "bg-slate-400"}`}
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                  {amountStr && (
                    <span className="relative z-10 text-xs font-medium text-slate-700 tabular-nums">{amountStr}</span>
                  )}
                </div>
                {penaltyPct != null && penaltyPct > 0 && (
                  <span className="text-[10px] text-amber-600 font-medium w-8 shrink-0 text-right">{penaltyPct}%</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {data.overdueComment?.trim() ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-2">
          <GeminiCommentaryBadge show={Boolean(data.commentaryFromGemini)} className="mt-0.5" />
          <p className="text-amber-900 text-sm flex-1">{data.overdueComment.trim()}</p>
        </div>
      ) : null}
    </section>
  );
}
