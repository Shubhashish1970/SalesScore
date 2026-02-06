"use client";

import type { ScorecardData } from "@/types/scorecard";

/**
 * Screen 3: DSO in plain language. Band shown visually; impact explained (blocked/partial/full).
 */
interface Props {
  data: ScorecardData;
}

const BANDS: { band: ScorecardData["dso"]["dsoBand"]; label: string; color: string }[] = [
  { band: "<50", label: "Under 50 days", color: "bg-emerald-500" },
  { band: "50-110", label: "50–110 days", color: "bg-lime-500" },
  { band: "110-170", label: "110–170 days", color: "bg-amber-500" },
  { band: ">170", label: "Over 170 days", color: "bg-red-500" },
];

function impactText(factor: number): string {
  if (factor <= 0) return "Collection speed is blocking your score. Improving it will unlock the score.";
  if (factor < 1) return "Collection speed is partly limiting your score. Reducing days will help.";
  return "Collection speed is in a good band and helping your score.";
}

export function CollectionSpeed({ data }: Props) {
  const { dso } = data;

  return (
    <section className="min-h-[80dvh] flex flex-col justify-center px-5 py-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-2">Collection speed</h2>
      <p className="text-slate-600 text-sm mb-4">
        How many days, on average, your customers take to pay. Fewer days is better.
      </p>
      <div className="mb-6">
        <p className="text-3xl font-bold text-slate-900 tabular-nums">{dso.dsoDays}</p>
        <p className="text-slate-500 text-sm">days to collect</p>
      </div>
      <div className="flex gap-1 mb-6">
        {BANDS.map((b) => (
          <div
            key={b.band}
            className={`flex-1 h-2 rounded-full ${b.color} ${
              b.band === dso.dsoBand ? "ring-2 ring-offset-2 ring-slate-400" : "opacity-40"
            }`}
            title={b.label}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 mb-2">Bands: &lt;50 · 50–110 · 110–170 · &gt;170 days</p>
      <div className="rounded-xl bg-slate-100 p-4">
        <p className="text-slate-700 text-sm">{impactText(dso.dsoFactor)}</p>
      </div>
      <p className="mt-8 text-amber-700 text-sm font-medium">Swipe right to continue →</p>
    </section>
  );
}
