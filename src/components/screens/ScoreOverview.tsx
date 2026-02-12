"use client";

import dynamic from "next/dynamic";
import type { ScorecardData } from "@/types/scorecard";
import { getAppConfig } from "@/lib/app-config";
import { GeminiCommentaryBadge } from "@/components/GeminiCommentaryBadge";
import { CommentaryLoading } from "@/components/CommentaryLoading";

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

function getBandStyle(score: number, redEnd: number, amberEnd: number) {
  if (score >= amberEnd) return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (score >= redEnd) return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-red-50 text-red-800 border-red-200";
}

export function ScoreOverview({ data }: Props) {
  const { scoreBandThresholds } = getAppConfig();
  const redEnd = scoreBandThresholds.redEnd;
  const amberEnd = scoreBandThresholds.amberEnd;
  const achievementLine = data.achievementMessage?.trim();
  const bandStyle = getBandStyle(data.finalScore, redEnd, amberEnd);

  return (
    <section className="min-h-[80dvh] flex flex-col px-5 pt-8 pb-6">
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
      {achievementLine ? (
        <div
          className={`rounded-xl p-4 flex items-start gap-2 border ${bandStyle}`}
        >
          <GeminiCommentaryBadge show={Boolean(data.commentaryFromGemini)} className="mt-0.5" />
          <p className="font-medium flex-1 text-base leading-relaxed">{achievementLine}</p>
        </div>
      ) : data.commentaryLoading ? (
        <div className={`rounded-xl p-4 flex items-center gap-2 border ${bandStyle} min-h-[3rem]`}>
          <CommentaryLoading />
        </div>
      ) : null}
    </section>
  );
}
