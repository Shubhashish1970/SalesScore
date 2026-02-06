"use client";

import type { ScorecardData } from "@/types/scorecard";

/**
 * Screen 4: Overdue buckets; highlight beyond 180 days. Plain-language penalties.
 */
interface Props {
  data: ScorecardData;
}

const BUCKETS: { key: keyof Omit<ScorecardData["overdue"], "penaltyApplied">; label: string; highlight: boolean }[] = [
  { key: "notDue", label: "On time", highlight: false },
  { key: "d1_110", label: "1–110 days late", highlight: false },
  { key: "d111_180", label: "111–180 days late", highlight: false },
  { key: "d181_270", label: "181–270 days late", highlight: true },
  { key: "d271_365", label: "271–365 days late", highlight: true },
  { key: "gt365", label: "Over 365 days late", highlight: true },
];

export function OverdueMoney({ data }: Props) {
  const { overdue } = data;
  const total = BUCKETS.reduce((s, b) => s + overdue[b.key], 0) || 1;
  const badShare = (overdue.d181_270 + overdue.d271_365 + overdue.gt365) / total;

  return (
    <section className="min-h-[80dvh] flex flex-col justify-center px-5 py-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-2">Overdue money</h2>
      <p className="text-slate-600 text-sm mb-4">
        Money that is late. The older the delay, the more it hurts your score.
      </p>
      <div className="space-y-2 mb-4">
        {BUCKETS.map(({ key, label, highlight }) => {
          const pct = total ? (overdue[key] / total) * 100 : 0;
          return (
            <div key={key} className="flex items-center gap-2">
              <div className="w-24 text-slate-600 text-xs shrink-0">{label}</div>
              <div className="flex-1 h-6 bg-slate-200 rounded overflow-hidden">
                <div
                  className={`h-full rounded ${highlight ? "bg-red-500" : "bg-slate-400"}`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <span className="text-slate-700 text-sm font-medium w-8 text-right">{overdue[key]}%</span>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-2">
        <p className="text-amber-900 text-sm">
          {badShare > 0.1
            ? "A large share of overdue is beyond 180 days. This applies the highest penalty and hurts your score the most."
            : "Most overdue is in earlier buckets. Focus on clearing anything beyond 180 days first."}
        </p>
      </div>
      <p className="text-slate-500 text-xs">Penalty applied to score: {overdue.penaltyApplied} points</p>
      <p className="mt-8 text-amber-700 text-sm font-medium">Swipe right to continue →</p>
    </section>
  );
}
