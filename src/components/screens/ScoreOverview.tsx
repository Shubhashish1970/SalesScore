"use client";

import type { ScorecardData } from "@/types/scorecard";
import { ScoreGauge } from "@/components/ScoreGauge";

/**
 * Screen 1: One concept — your score (gauge with red/amber/green bands and needle) and a single-line explanation.
 * maxScore and band thresholds come from JSON; CTA directs user to swipe for "why".
 */
interface Props {
  data: ScorecardData;
}

function getRoleLabel(role: ScorecardData["role"]) {
  const labels: Record<ScorecardData["role"], string> = {
    TM: "Territory Manager",
    RM: "Regional Manager",
    ZM: "Zonal Manager",
    BU: "BU Head",
  };
  return labels[role];
}

export function ScoreOverview({ data }: Props) {
  const summary =
    data.keyDrivers.length > 0
      ? data.keyDrivers[0].positive
        ? data.keyDrivers[0].text
        : data.keyDrivers.find((d) => d.positive)?.text ?? data.keyDrivers[0].text
      : "Your score reflects sales, collection speed, and product mix.";

  const redEnd = data.scoreBandThresholds?.redEnd ?? 80;
  const amberEnd = data.scoreBandThresholds?.amberEnd ?? 90;

  return (
    <section className="min-h-[80dvh] flex flex-col justify-center px-5 py-6">
      <p className="text-slate-500 text-sm mb-1">{getRoleLabel(data.role)}</p>
      <h1 className="text-xl font-semibold text-slate-800 mb-2">{data.entityName}</h1>
      <div className="my-4">
        <ScoreGauge
          score={data.finalScore}
          maxScore={data.maxScore}
          redEnd={redEnd}
          amberEnd={amberEnd}
        />
        <p className="text-center mt-2">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">{data.finalScore}</span>
          <span className="text-lg text-slate-500 ml-1">/ {data.maxScore}</span>
        </p>
      </div>
      <p className="text-slate-700 text-base leading-relaxed max-w-sm">{summary}</p>
      <p className="mt-8 text-amber-700 text-sm font-medium">Swipe right to understand why →</p>
    </section>
  );
}
