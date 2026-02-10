"use client";

import { useState, useEffect } from "react";
import type { ScorecardData } from "@/types/scorecard";
import { GeminiCommentaryBadge } from "@/components/GeminiCommentaryBadge";

/**
 * Screen 5: Category distribution. Higher category = higher score impact; helped vs diluted.
 */
interface Props {
  data: ScorecardData;
}

const CATEGORIES: { key: keyof ScorecardData["productMix"]; label: string; weight: number }[] = [
  { key: "categoryA", label: "Category A", weight: 1.4 },
  { key: "categoryB", label: "Category B", weight: 1.3 },
  { key: "categoryC", label: "Category C", weight: 1.2 },
  { key: "categoryD", label: "Category D", weight: 1.1 },
  { key: "categoryE", label: "Category E", weight: 0 },
];

function formatNrv(rupees: number): string {
  if (rupees >= 1e7) return `${(rupees / 1e7).toFixed(2)} Cr`;
  if (rupees >= 1e5) return `${(rupees / 1e5).toFixed(2)} L`;
  return `${(rupees / 1e3).toFixed(1)} K`;
}

const NRV_KEYS: ("categoryANrv" | "categoryBNrv" | "categoryCNrv" | "categoryDNrv" | "categoryENrv")[] = [
  "categoryANrv", "categoryBNrv", "categoryCNrv", "categoryDNrv", "categoryENrv",
];

/** Bar width % below which the NRV amount is shown only in a tooltip (same font/size as category label). */
const SMALL_BAR_PCT = 18;

export function ProductMix({ data }: Props) {
  const { productMix, growth } = data;
  const helped = productMix.nrvFactor >= 0.65;
  const totalNrvStr = growth.CY_NRV > 0 ? formatNrv(growth.CY_NRV) : null;
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

  const score = Math.round(productMix.nrvFactor);
  const weight = data.kpiWeights?.productMix ?? 34;
  const ratio = weight > 0 ? productMix.nrvFactor / weight : 0;
  const badgeColor =
    ratio > 1
      ? "bg-emerald-500 text-white"
      : ratio >= 0.8
        ? "bg-amber-500 text-slate-900"
        : "bg-red-500 text-white";

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
        {CATEGORIES.map(({ key, label, weight }, i) => {
          const pct = productMix[key] ?? 0;
          const nrvKey = NRV_KEYS[i];
          const nrvValue = productMix[nrvKey] ?? 0;
          const nrvStr = nrvValue > 0 ? formatNrv(nrvValue) : null;
          const isCatE = key === "categoryE";
          const isCatAorB = key === "categoryA" || key === "categoryB";
          const barClass = [
            "absolute inset-y-0 left-0 h-full rounded product-mix-bar flex items-center pl-2 min-w-0",
            isCatE ? "" : isCatAorB ? "bg-emerald-500" : "bg-indigo-500",
            isCatAorB ? "animate-product-mix-bar-ab" : "",
          ].filter(Boolean).join(" ");
          const barMounted = isCatAorB ? mountedAB : mounted;
          const barStyle: React.CSSProperties = {
            width: barMounted ? `${pct}%` : "0%",
            ...(isCatE ? { backgroundColor: "#ff2c2c" } : {}),
          };
          const showNrvInBar = barMounted && nrvStr && pct >= SMALL_BAR_PCT;
          const showNrvInTooltip = barMounted && nrvStr && pct < SMALL_BAR_PCT;
          return (
            <div key={key} className="flex items-center gap-2">
              <div className="w-20 text-slate-700 text-sm shrink-0">{label}</div>
              <div className="group flex-1 h-6 bg-slate-200 rounded overflow-hidden relative min-w-0 flex items-center justify-end pr-2">
                <div className={barClass} style={barStyle}>
                  {showNrvInBar && (
                    <span className="text-[10px] font-normal text-white drop-shadow-sm tabular-nums truncate">{nrvStr}</span>
                  )}
                </div>
                {showNrvInTooltip && (
                  <div
                    className="pointer-events-none absolute bottom-full left-0 mb-1 hidden rounded bg-white px-2 py-1 shadow-md ring-1 ring-slate-200 group-hover:block z-20"
                    aria-hidden
                  >
                    <span className="text-sm text-slate-700 tabular-nums whitespace-nowrap">{nrvStr}</span>
                  </div>
                )}
                <span className="relative z-10 text-[10px] font-normal text-slate-700 tabular-nums ml-1">{pct}%</span>
              </div>
              <span className="text-[10px] text-slate-500 w-6 tabular-nums">{weight}</span>
            </div>
          );
        })}
      </div>
      {data.productMixComment?.trim() ? (
        <div className={`rounded-xl p-4 flex items-start gap-2 ${helped ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
          <GeminiCommentaryBadge show={Boolean(data.commentaryFromGemini)} className="mt-0.5" />
          <p className="text-sm font-medium flex-1">{data.productMixComment.trim()}</p>
        </div>
      ) : null}
    </section>
  );
}
