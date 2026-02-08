"use client";

import type { ScorecardData } from "@/types/scorecard";

/**
 * Screen 2: Gatekeeper — growth achieved or not.
 * Shows Growth % (from JSON) in big font with arrow; Green >5%, Amber 0–5%, Red <0%.
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

type GrowthBand = "green" | "amber" | "red";

function getGrowthBand(pct: number): GrowthBand {
  if (pct > 5) return "green";
  if (pct >= 0) return "amber";
  return "red";
}

const bandColors: Record<GrowthBand, { text: string; arrow: string }> = {
  green: { text: "text-emerald-600", arrow: "text-emerald-600" },
  amber: { text: "text-amber-600", arrow: "text-amber-600" },
  red: { text: "text-red-600", arrow: "text-red-600" },
};

function GrowthArrow({ band, direction }: { band: GrowthBand; direction: "up" | "down" | "flat" }) {
  const c = bandColors[band].arrow;
  if (direction === "up")
    return (
      <span className={`inline-block ${c}`} aria-hidden>
        ▲
      </span>
    );
  if (direction === "down")
    return (
      <span className={`inline-block ${c}`} aria-hidden>
        ▼
      </span>
    );
  return (
    <span className={`inline-block ${c}`} aria-hidden>
      ●
    </span>
  );
}

export function GrowthCheck({ data }: Props) {
  const { growth } = data;
  const achieved = growth.growthFactor === 1;
  const pct = growth.growthPercent;
  const band = getGrowthBand(pct);
  const direction: "up" | "down" | "flat" = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  const colors = bandColors[band];

  const isFlatOrRed = band === "red" || direction === "flat";
  const animationClass = isFlatOrRed ? "animate-growth-pct-attention" : "animate-growth-pct";

  return (
    <section className="min-h-[80dvh] flex flex-col px-5 pt-8 pb-6 relative">
      <h2 className="text-lg font-semibold text-slate-800 mb-0.5 pr-14">Growth Check ( Qualifying Criteria )</h2>
      <p className="text-[#2f41a7] text-xs mt-0 mb-10 pr-16">
        Sales this year vs last year — growth is required for your score to count.
      </p>
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center py-2 border-b border-slate-200">
          <span className="text-slate-600">This year</span>
          <span className="font-semibold text-slate-900">{formatMoney(growth.CY_NRV)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-200">
          <span className="text-slate-600">Last year</span>
          <span className="font-medium text-slate-700">{formatMoney(growth.LY_NRV)}</span>
        </div>
      </div>
      <div className={`flex items-center gap-3 mb-6 ${animationClass}`}>
        <span className={`text-4xl font-bold tabular-nums ${colors.text}`}>
          {pct > 0 ? "+" : ""}
          {pct.toFixed(1)}%
        </span>
        <GrowthArrow band={band} direction={direction} />
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
