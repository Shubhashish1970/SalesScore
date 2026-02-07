"use client";

import { useState, useEffect } from "react";
import type { ScorecardData } from "@/types/scorecard";

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

export function ProductMix({ data }: Props) {
  const { productMix } = data;
  const helped = productMix.nrvFactor >= 0.65;
  const [mounted, setMounted] = useState(false);
  const [mountedAB, setMountedAB] = useState(false);
  const [showABHighlight, setShowABHighlight] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 80);
    const t2 = setTimeout(() => setMountedAB(true), 320);
    const t3 = setTimeout(() => setShowABHighlight(true), 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <section className="min-h-[80dvh] flex flex-col justify-center px-5 py-6 relative">
      <div
        className="absolute top-6 right-5 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold tabular-nums bg-indigo-500 text-white"
        aria-label={`Product score: ${Math.round(productMix.nrvFactor)}`}
      >
        {Math.round(productMix.nrvFactor)}
      </div>
      <h2 className="text-lg font-semibold text-slate-800 mb-0.5 pr-14">Product mix</h2>
      <p className="text-[#2f41a7] text-xs mt-0 mb-4">
        Share of sales from each category. Higher categories (A, B) improve your score more.
      </p>
      <div className="space-y-2 mb-6">
        <div className="relative space-y-2">
          <div
            className={`pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50/40 transition-opacity duration-300 z-0 ${showABHighlight ? "opacity-100" : "opacity-0"}`}
            style={{ bottom: "auto", height: "3.5rem" }}
            aria-hidden={!showABHighlight}
          />
          {CATEGORIES.slice(0, 2).map(({ key, label, weight }, i) => {
            const idx = i;
            const pct = productMix[key];
            const nrvKey = NRV_KEYS[idx];
            const nrvValue = productMix[nrvKey] ?? 0;
            const nrvStr = nrvValue > 0 ? formatNrv(nrvValue) : null;
            const barClass = "absolute inset-y-0 left-0 h-full rounded product-mix-bar flex items-center pl-2 min-w-0 bg-indigo-500 animate-product-mix-bar-ab";
            const barStyle: React.CSSProperties = { width: mountedAB ? `${pct}%` : "0%" };
            return (
              <div key={key} className="relative z-10 flex items-center gap-2">
                <div className="w-20 text-slate-700 text-sm shrink-0">{label}</div>
                <div className="flex-1 h-6 bg-slate-200 rounded overflow-hidden relative min-w-0 flex items-center justify-end pr-2">
                  <div className={barClass} style={barStyle}>
                    {mountedAB && nrvStr && (
                      <span className="text-[10px] font-normal text-white drop-shadow-sm tabular-nums truncate">{nrvStr}</span>
                    )}
                  </div>
                  <span className="relative z-10 text-[10px] font-normal text-slate-700 tabular-nums ml-1">{pct}%</span>
                </div>
                <span className="text-[10px] text-slate-500 w-6 tabular-nums">{weight}</span>
              </div>
            );
          })}
        </div>
        {CATEGORIES.slice(2).map(({ key, label, weight }, i) => {
          const idx = i + 2;
          const pct = productMix[key];
          const nrvKey = NRV_KEYS[idx];
          const nrvValue = productMix[nrvKey] ?? 0;
          const nrvStr = nrvValue > 0 ? formatNrv(nrvValue) : null;
          const isCatE = key === "categoryE";
          const barClass = [
            "absolute inset-y-0 left-0 h-full rounded product-mix-bar flex items-center pl-2 min-w-0",
            isCatE ? "" : "bg-indigo-500",
          ].filter(Boolean).join(" ");
          const barStyle: React.CSSProperties = {
            width: mounted ? `${pct}%` : "0%",
            ...(isCatE ? { backgroundColor: "#ff2c2c" } : {}),
          };
          return (
            <div key={key} className="flex items-center gap-2">
              <div className="w-20 text-slate-700 text-sm shrink-0">{label}</div>
              <div className="flex-1 h-6 bg-slate-200 rounded overflow-hidden relative min-w-0 flex items-center justify-end pr-2">
                <div className={barClass} style={barStyle}>
                  {mounted && nrvStr && (
                    <span className="text-[10px] font-normal text-white drop-shadow-sm tabular-nums truncate">{nrvStr}</span>
                  )}
                </div>
                <span className="relative z-10 text-[10px] font-normal text-slate-700 tabular-nums ml-1">{pct}%</span>
              </div>
              <span className="text-[10px] text-slate-500 w-6 tabular-nums">{weight}</span>
            </div>
          );
        })}
      </div>
      <div className={`rounded-xl p-4 ${helped ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
        <p className="text-sm font-medium">
          {helped
            ? "Your mix is helping your score. More of Category A and B will help further."
            : "Your mix is diluting the score. Shifting more sales to Category A and B will improve it."}
        </p>
      </div>
    </section>
  );
}
