"use client";

import type { ScorecardData } from "@/types/scorecard";

/**
 * Screen 3: DSO in plain language. Band shown visually; labels under each segment; impact explained.
 */
interface Props {
  data: ScorecardData;
}

const BANDS: {
  band: ScorecardData["dso"]["dsoBand"];
  label: string;
  shortLabel: string;
  color: string;
  roundelColor: string;
}[] = [
  { band: "<50", label: "Under 50 days", shortLabel: "<50", color: "bg-emerald-500", roundelColor: "bg-emerald-500 text-white" },
  { band: "50-110", label: "50–110 days", shortLabel: "50–110", color: "bg-lime-500", roundelColor: "bg-lime-600 text-white" },
  { band: "110-170", label: "110–170 days", shortLabel: "110–170", color: "bg-amber-500", roundelColor: "bg-amber-500 text-slate-900" },
  { band: ">170", label: "Over 170 days", shortLabel: ">170", color: "bg-red-500", roundelColor: "bg-red-500 text-white" },
];

function impactText(factor: number): string {
  if (factor <= 0) return "Collection speed is blocking your score. Improving it will unlock the score.";
  if (factor < 1) return "Collection speed is partly limiting your score. Reducing days will help.";
  return "Collection speed is in a good band and helping your score.";
}

export function CollectionSpeed({ data }: Props) {
  const { dso } = data;
  const activeBandConfig = BANDS.find((b) => b.band === dso.dsoBand);
  const roundelColor = activeBandConfig?.roundelColor ?? "bg-slate-500 text-white";

  return (
    <section className="min-h-[80dvh] flex flex-col justify-center px-5 py-6 relative">
      <div
        className={`absolute top-6 right-5 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold tabular-nums ${roundelColor}`}
        aria-label={`DSO score: ${dso.dsoScore}`}
      >
        {dso.dsoScore}
      </div>
      <h2 className="text-lg font-semibold text-slate-800 mb-2 pr-14">Collection Speed (DSO)</h2>
      <p className="text-slate-600 text-sm mb-4">
        How many days, on average, your customers take to pay. Fewer days is better.
      </p>
      <div className="mb-6">
        <p className="text-3xl font-bold text-slate-900 tabular-nums">{dso.dsoDays}</p>
        <p className="text-slate-500 text-sm">days to collect</p>
      </div>
      <div className="flex gap-1 mb-1">
        {BANDS.map((b) => (
          <div key={b.band} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full h-2 rounded-full ${b.color} ${
                b.band === dso.dsoBand
                  ? "ring-2 ring-offset-2 ring-slate-400 animate-dso-band"
                  : "opacity-40"
              }`}
              title={b.label}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mb-6">
        {BANDS.map((b) => (
          <div key={b.band} className="flex-1 text-center">
            <span className="text-xs text-slate-500">{b.shortLabel}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-slate-100 p-4 mb-6">
        <p className="text-slate-700 text-sm">{impactText(dso.dsoFactor)}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Norms of scoring</p>
        <ul className="text-xs text-slate-700 space-y-1">
          <li>If DSO days is &lt; 50, then DSO Factor = 1.2</li>
          <li>If DSO days is 50–110, then DSO Factor = 1.1</li>
          <li>If DSO days is 110–170, then DSO Factor = 1.1</li>
          <li>If DSO days is &gt; 170, then DSO Factor = 0</li>
        </ul>
      </div>
    </section>
  );
}
