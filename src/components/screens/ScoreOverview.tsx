"use client";

import { useState, useEffect } from "react";
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
  isInLeaderboard?: boolean;
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

export function ScoreOverview({ data, isInLeaderboard }: Props) {
  const { scoreBandThresholds } = getAppConfig();
  const redEnd = scoreBandThresholds.redEnd;
  const amberEnd = scoreBandThresholds.amberEnd;
  const achievementLine = data.achievementMessage?.trim();
  const bandStyle = getBandStyle(data.finalScore, redEnd, amberEnd);
  const storageKey = `hall-of-fame-congrats-seen-${data.mobile ?? "unknown"}`;
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsDismissed, setCongratsDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isInLeaderboard && !congratsDismissed) {
      setShowCongrats(true);
    }
  }, [isInLeaderboard, congratsDismissed]);

  const dismissCongrats = () => {
    setShowCongrats(false);
    setCongratsDismissed(true);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="min-h-[80dvh] flex flex-col px-5 pt-8 pb-6 relative">
      {showCongrats && isInLeaderboard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-congrats-enter"
          onClick={dismissCongrats}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-5xl block mb-3" aria-hidden>🏆</span>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Congratulations!</h3>
            <p className="text-slate-600 text-sm mb-4">
              You&apos;re in the Hall of Fame! Tap the trophy icon to see your ranking.
            </p>
            <button
              type="button"
              onClick={dismissCongrats}
              className="w-full py-3 rounded-xl font-medium text-white"
              style={{ backgroundColor: "#034EA2" }}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
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
      <div className="mt-auto pt-8">
        {achievementLine ? (
          <div className={`rounded-xl p-4 flex items-start gap-2 border ${bandStyle}`}>
            <GeminiCommentaryBadge show={Boolean(data.commentaryFromGemini)} className="mt-0.5" />
            <p className="font-medium flex-1 text-base leading-relaxed">{achievementLine}</p>
          </div>
        ) : data.commentaryLoading ? (
          <div className={`rounded-xl p-4 flex items-center gap-2 border ${bandStyle} min-h-[3rem]`}>
            <CommentaryLoading />
          </div>
        ) : null}
      </div>
    </section>
  );
}
