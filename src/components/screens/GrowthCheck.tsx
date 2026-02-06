"use client";

import type { ScorecardData } from "@/types/scorecard";

/**
 * Screen 2: Gatekeeper — growth achieved or not.
 * Plain language only; no formulas. Still allow swipe when blocked.
 */
interface Props {
  data: ScorecardData;
}

function formatMoney(n: number): string {
  if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)} Cr`;
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)} L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} K`;
  return String(n);
}

export function GrowthCheck({ data }: Props) {
  const { growth } = data;
  const achieved = growth.growthFactor === 1;

  return (
    <section className="min-h-[80dvh] flex flex-col justify-center px-5 py-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Growth check</h2>
      <p className="text-slate-600 text-sm mb-4">
        Sales this year vs last year — growth is required for your score to count.
      </p>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-slate-200">
          <span className="text-slate-600">This year</span>
          <span className="font-semibold text-slate-900">{formatMoney(growth.CY_NRV)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-200">
          <span className="text-slate-600">Last year</span>
          <span className="font-medium text-slate-700">{formatMoney(growth.LY_NRV)}</span>
        </div>
      </div>
      <div
        className={`rounded-xl p-4 ${
          achieved ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
        }`}
      >
        {achieved ? (
          <p className="font-medium">Growth achieved → your score is enabled.</p>
        ) : (
          <p className="font-medium">No growth → score is blocked until you grow over last year.</p>
        )}
      </div>
    </section>
  );
}
