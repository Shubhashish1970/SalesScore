"use client";

import type { ScorecardData } from "@/types/scorecard";
import { DEFAULT_OVERDUE_BUCKETS, DEFAULT_KPI_WEIGHTS } from "@/types/scorecard";
import { GeminiCommentaryBadge } from "@/components/GeminiCommentaryBadge";

/**
 * Screen 4: Overdue buckets; outstanding on bar; red for penalized; OS score roundel; OD weightage.
 * Buckets from data.overdueBuckets or DEFAULT_OVERDUE_BUCKETS.
 */
interface Props {
  data: ScorecardData;
}

function getOverdueBuckets(data: ScorecardData) {
  return data.overdueBuckets && data.overdueBuckets.length > 0 ? data.overdueBuckets : DEFAULT_OVERDUE_BUCKETS;
}

function formatAmount(n: number): string {
  if (n >= 100) return `${(n / 100).toFixed(1)} Cr`;
  if (n >= 1) return `${n.toFixed(1)} L`;
  return `${(n * 100).toFixed(0)} K`;
}

/** Bar width % below which the amount is shown beside the bar instead of inside it (matches Product Mix behavior). */
const SMALL_BAR_PCT = 18;

export function OverdueMoney({ data }: Props) {
  const { overdue } = data;
  const buckets = getOverdueBuckets(data);
  const penalties = data.overdueBucketPenalties ?? Object.fromEntries(buckets.map((b) => [b.key, b.penaltyPct]));
  const amounts = overdue.bucketAmounts;
  const total = buckets.reduce((s, b) => s + overdue[b.key], 0) || 1;
  const badShare = (overdue.d181_270 + overdue.d271_365 + overdue.gt365) / total;
  const osScore = overdue.overdueScore ?? null;
  const totalOutstanding = amounts
    ? buckets.reduce((s, b) => s + (amounts[b.key] ?? 0), 0)
    : 0;
  const onTimeAmount = amounts ? (amounts.notDue ?? 0) : 0;
  const totalOverdueAmount = totalOutstanding - onTimeAmount;
  const totalOutstandingStr = totalOutstanding > 0 ? formatAmount(totalOutstanding) : null;
  const totalOverdueStr = totalOverdueAmount > 0 ? formatAmount(totalOverdueAmount) : null;
  const overdueWeight = data.kpiWeights?.overdue ?? DEFAULT_KPI_WEIGHTS.overdue;
  const noPenaltyBuckets = buckets.filter((b) => (penalties[b.key] ?? b.penaltyPct) === 0);
  const penalizedBuckets = buckets.filter((b) => (penalties[b.key] ?? b.penaltyPct) > 0);

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
      <h2 className="text-lg font-semibold text-slate-800 mb-0.5 pr-20">Outstanding money</h2>
      <p className="text-[#2f41a7] text-xs mt-0 mb-4 pr-20">
        Total money owed by customers. Late (overdue) amounts hurt your score.
      </p>
      {totalOverdueAmount > 0 && totalOverdueStr != null && (
        <div className="mb-4">
          <p className="text-3xl font-bold text-slate-900 tabular-nums">{totalOverdueStr}</p>
          <p className="text-slate-500 text-sm">overdue</p>
        </div>
      )}
      {totalOutstandingStr != null && (
        <div className="mb-6">
          <p className="text-xl font-semibold text-slate-700 tabular-nums">{totalOutstandingStr}</p>
          <p className="text-slate-500 text-sm">total outstanding</p>
        </div>
      )}
      {penalties && (
        <p className="text-xs text-slate-500 mb-2">
          OD weightage = penalty % applied to money in that bucket (higher = worse for score).
        </p>
      )}
      <div className="space-y-2 mb-2">
        {noPenaltyBuckets.length > 0 && (
        <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50/30 p-2 space-y-1.5">
          <p className="text-[10px] text-emerald-800 font-medium px-0.5 -mt-0.5">No penalty (on time / 1–110 days)</p>
          {noPenaltyBuckets.map(({ key, label }) => {
            const pct = total ? (overdue[key] / total) * 100 : 0;
            const barWidth = Math.max(pct, 3);
            const amountStr = amounts ? formatAmount(amounts[key]) : null;
            const penaltyPct = penalties ? penalties[key] : null;
            const showAmountInBar = amountStr && pct >= SMALL_BAR_PCT;
            const showAmountBeside = amountStr && pct < SMALL_BAR_PCT;
            return (
              <div key={key} className="flex items-center gap-2">
                <div className="w-28 text-slate-600 text-xs shrink-0">{label}</div>
                <div className="flex-1 min-w-0 h-5 bg-slate-200 rounded overflow-hidden relative flex items-center justify-end pr-2">
                  <div
                    className="absolute inset-y-0 left-0 rounded bg-slate-400"
                    style={{ width: `${barWidth}%` }}
                  />
                  {showAmountInBar && (
                    <span className="relative z-10 text-[10px] font-normal text-slate-700 tabular-nums">{amountStr}</span>
                  )}
                  {showAmountBeside && (
                    <span
                      className="absolute z-10 text-[10px] font-normal text-slate-700 tabular-nums whitespace-nowrap"
                      style={{ left: `calc(${barWidth}% + 6px)` }}
                    >
                      {amountStr}
                    </span>
                  )}
                </div>
                {penaltyPct != null && (
                  <span className="text-[10px] text-emerald-600 font-medium w-8 shrink-0 text-right">{penaltyPct === 0 ? "0%" : `${penaltyPct}%`}</span>
                )}
              </div>
            );
          })}
        </div>
        )}
        {penalizedBuckets.length > 0 && (
        <div className="rounded-lg border-2 border-dashed border-amber-400 bg-amber-50/20 p-2 space-y-1.5 animate-overdue-dashed-glow">
          <p className="text-[10px] text-amber-800 font-medium px-0.5 -mt-0.5">Penalized (111+ days)</p>
          {penalizedBuckets.map(({ key, label }) => {
            const pct = total ? (overdue[key] / total) * 100 : 0;
            const barWidth = Math.max(pct, 3);
            const hasMoney = overdue[key] > 0;
            const showRed = hasMoney;
            const amountStr = amounts ? formatAmount(amounts[key]) : null;
            const penaltyPct = penalties ? penalties[key] : null;
            const showAmountInBar = amountStr && pct >= SMALL_BAR_PCT;
            const showAmountBeside = amountStr && pct < SMALL_BAR_PCT;
            return (
              <div key={key} className="flex items-center gap-2">
                <div className="w-28 text-slate-600 text-xs shrink-0">{label}</div>
                <div className="flex-1 min-w-0 h-5 bg-slate-200 rounded overflow-hidden relative flex items-center justify-end pr-2">
                  <div
                    className={`absolute inset-y-0 left-0 rounded animate-overdue-penalized origin-left ${showRed ? "bg-red-600 animate-overdue-bar-attention ring-1 ring-red-400/50" : "bg-slate-400"}`}
                    style={{ width: `${barWidth}%` }}
                  />
                  {showAmountInBar && (
                    <span className="relative z-10 text-[10px] font-normal text-slate-700 tabular-nums">{amountStr}</span>
                  )}
                  {showAmountBeside && (
                    <span
                      className="absolute z-10 text-[10px] font-normal text-slate-700 tabular-nums whitespace-nowrap"
                      style={{ left: `calc(${barWidth}% + 6px)` }}
                    >
                      {amountStr}
                    </span>
                  )}
                </div>
                {penaltyPct != null && penaltyPct > 0 && (
                  <span className="text-[10px] text-amber-600 font-medium w-8 shrink-0 text-right">{penaltyPct}%</span>
                )}
              </div>
            );
          })}
        </div>
        )}
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
