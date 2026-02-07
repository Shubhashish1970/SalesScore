"use client";

import dynamic from "next/dynamic";
import type { ScorecardData } from "@/types/scorecard";

const ScoreGaugeHighcharts = dynamic(
  () => import("@/components/ScoreGaugeHighcharts").then((m) => m.ScoreGaugeHighcharts),
  { ssr: false }
);

/**
 * Screen 1: One concept — speedometer gauge (Highcharts) and achievement line from JSON.
 * Backend sends achievementMessage; frontend only displays it.
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
  const redEnd = data.scoreBandThresholds?.redEnd ?? 80;
  const amberEnd = data.scoreBandThresholds?.amberEnd ?? 90;
  const achievementLine = data.achievementMessage || "Your score at a glance.";

  return (
    <section className="min-h-[80dvh] flex flex-col justify-center px-5 py-6">
      <p className="text-slate-500 text-sm mb-1">{getRoleLabel(data.role)}</p>
      <h1 className="text-xl font-semibold text-slate-800 mb-2">{data.entityName}</h1>
      <div className="my-2">
        <ScoreGaugeHighcharts
          score={data.finalScore}
          maxScore={data.maxScore}
          redEnd={redEnd}
          amberEnd={amberEnd}
        />
      </div>
      <p className="text-slate-700 text-base leading-relaxed max-w-sm">{achievementLine}</p>
    </section>
  );
}
