"use client";

import type { ScorecardData } from "@/types/scorecard";

/**
 * Screen 6: Recommended actions from JSON — what to do, why, expected impact (H/M/L).
 */
interface Props {
  data: ScorecardData;
}

function impactBadge(impact: string) {
  const style =
    impact === "High"
      ? "bg-emerald-100 text-emerald-800"
      : impact === "Medium"
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-100 text-slate-700";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${style}`}>
      Impact: {impact}
    </span>
  );
}

export function WhatToDoNext({ data }: Props) {
  const actions = data.recommendedActions.slice(0, 5);

  return (
    <section className="min-h-[80dvh] flex flex-col px-5 pt-8 pb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-0.5">What to do next</h2>
      <p className="text-[#2f41a7] text-xs mt-0 mb-5">
        Focus on these actions to improve your score. Do the high-impact ones first.
      </p>
      <ul className="space-y-4">
        {actions.map((action, i) => (
          <li key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-medium text-slate-900 mb-1">{action.whatToDo}</p>
            <p className="text-slate-600 text-sm mb-2">{action.whyItHelps}</p>
            {impactBadge(action.expectedImpact)}
          </li>
        ))}
      </ul>
      <p className="mt-8 text-slate-500 text-sm">You’ve reached the end. Revisit this list regularly.</p>
    </section>
  );
}
