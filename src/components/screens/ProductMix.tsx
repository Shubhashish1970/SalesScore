"use client";

import { useState, useEffect } from "react";
import type { ScorecardData } from "@/types/scorecard";
import { getAppConfig } from "@/lib/app-config";
import { GeminiCommentaryBadge } from "@/components/GeminiCommentaryBadge";
import { CommentaryLoading } from "@/components/CommentaryLoading";
import { formatInr } from "@/lib/format-inr";
import { getCommentaryBoxStyle, badgeColorToVariant } from "@/lib/commentary-style";

/**
 * Screen 5: Category distribution. Higher category = higher score impact; helped vs diluted.
 * Categories and thresholds from App Config. NRV values from API are in INR.
 */
interface Props {
  data: ScorecardData;
}

const NRV_KEY_MAP = { categoryA: "categoryANrv", categoryB: "categoryBNrv", categoryC: "categoryCNrv", categoryD: "categoryDNrv", categoryE: "categoryENrv" } as const;

/** Bar width % below which the NRV amount is shown beside the bar instead of inside it. */
const SMALL_BAR_PCT = 18;

export function ProductMix({ data }: Props) {
  const { productMix, growth } = data;
  const { productMixCategories: categories, productMixHelpThreshold: helpThreshold, kpiWeights, productMixBadgeGreenRatio, productMixBadgeAmberRatio } = getAppConfig();
  const weight = kpiWeights.productMix;
  const productMixScore = productMix.productMixScore;
  const ratio = weight > 0 ? productMixScore / weight : 0;
  const helped = ratio >= helpThreshold;
  const totalNrvStr = growth.CY_NRV > 0 ? formatInr(growth.CY_NRV) : null;
  const [mounted, setMounted] = useState(false);
  const [mountedAB, setMountedAB] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 80);
    const t2 = setTimeout(() => setMountedAB(true), 320);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const score = Math.round(productMixScore);
  const badgeColor =
    ratio > productMixBadgeGreenRatio
      ? "bg-emerald-500 text-white"
      : ratio >= productMixBadgeAmberRatio
        ? "bg-amber-500 text-slate-900"
        : "bg-red-500 text-white";
  const commentaryStyle = getCommentaryBoxStyle(badgeColorToVariant(badgeColor));

  return (
    <section className="min-h-[80dvh] flex flex-col px-5 pt-8 pb-6 relative">
      <div
        className={`absolute top-6 right-5 rounded-lg px-2.5 py-1.5 flex items-center justify-center text-base font-bold tabular-nums min-w-[4.5rem] ${badgeColor}`}
        aria-label={`Product score: ${score} out of ${weight}`}
      >
        {score}/{weight}
      </div>
      <h2 className="text-lg font-semibold text-slate-800 mb-0.5 pr-20">Product mix</h2>
      <p className="text-[#2f41a7] text-xs mt-0 mb-4 pr-20">
        Share of sales from each category. Higher categories (A, B) improve your score more.
      </p>
      {totalNrvStr != null && (
        <div className="mb-6">
          <p className="text-3xl font-bold text-slate-900 tabular-nums">{totalNrvStr}</p>
          <p className="text-slate-500 text-sm">Total NRV (CY)</p>
        </div>
      )}
      <div className="space-y-2 mb-6">
        {categories.map(({ id, label, weight }) => {
          const key = id;
          const pct = productMix[key] ?? 0;
          const nrvKey = NRV_KEY_MAP[key];
          const nrvValue = productMix[nrvKey] ?? 0;
          const nrvStr = nrvValue > 0 ? formatInr(nrvValue) : null;
          const isCatE = key === "categoryE";
          const isCatAorB = key === "categoryA" || key === "categoryB";
          const barClass = [
            "absolute inset-y-0 left-0 h-full rounded product-mix-bar flex items-center pl-2 min-w-0",
            isCatE ? "" : isCatAorB ? "bg-emerald-500" : "bg-slate-500",
            isCatAorB ? "animate-product-mix-bar-ab" : "",
          ].filter(Boolean).join(" ");
          const barMounted = isCatAorB ? mountedAB : mounted;
          const barStyle: React.CSSProperties = {
            width: barMounted ? `${pct}%` : "0%",
            ...(isCatE ? { backgroundColor: "#ff2c2c" } : {}),
          };
          const showNrvInBar = barMounted && nrvStr && pct >= SMALL_BAR_PCT;
          const showNrvBeside = barMounted && nrvStr && pct < SMALL_BAR_PCT;
          return (
            <div key={key} className="flex items-center gap-2">
              <div className="w-20 text-slate-700 text-sm shrink-0">{label}</div>
              <div className="group flex-1 min-w-0 h-6 bg-slate-200 rounded overflow-hidden relative flex items-center">
                <div className={barClass} style={barStyle}>
                  {showNrvInBar && (
                    <span className="text-[10px] font-normal text-white drop-shadow-sm tabular-nums truncate">{nrvStr}</span>
                  )}
                </div>
                {showNrvBeside && (
                  <span
                    className="absolute z-10 text-[10px] font-normal text-slate-700 tabular-nums whitespace-nowrap"
                    style={{ left: `calc(${pct}% + 6px)` }}
                  >
                    {nrvStr}
                  </span>
                )}
                <span className="relative z-10 text-[10px] font-normal text-slate-700 tabular-nums ml-auto mr-2">{pct}%</span>
              </div>
              <span className="text-[10px] text-slate-500 w-6 shrink-0 tabular-nums">{weight}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-auto pt-8">
        {data.productMixComment?.trim() ? (
          <div className={`rounded-xl p-4 flex items-start gap-2 border ${commentaryStyle}`}>
            <GeminiCommentaryBadge show={Boolean(data.commentaryFromGemini)} className="mt-0.5" />
            <p className="text-sm font-medium flex-1">{data.productMixComment.trim()}</p>
          </div>
        ) : data.commentaryLoading ? (
          <div className={`rounded-xl p-4 flex items-center gap-2 border min-h-[3rem] ${commentaryStyle}`}>
            <CommentaryLoading />
          </div>
        ) : null}
      </div>
    </section>
  );
}
