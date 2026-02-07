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
  const factors = data.dsoBandFactors;
  const activeBandConfig = BANDS.find((b) => b.band === dso.dsoBand);
  const roundelColor = activeBandConfig?.roundelColor ?? "bg-slate-500 text-white";

  return (
    <section className="min-h-[80dvh] flex flex-col justify-center px-5 py-6 relative">
      <div
        className={`absolute top-6 right-5 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold tabular-nums ${roundelColor}`}
        aria-label={`DSO score: ${Math.round(dso.dsoScore)}`}
      >
        {Math.round(dso.dsoScore)}
      </div>
      <h2 className="text-lg font-semibold text-slate-800 mb-0.5 pr-14">Collection Speed (DSO)</h2>
      <p className="text-[#2f41a7] text-xs mt-0 mb-4">
        How many days, on average, your customers take to pay. Fewer days is better.
      </p>
      <div className="mb-6">
        <p className="text-3xl font-bold text-slate-900 tabular-nums">{dso.dsoDays}</p>
        <p className="text-slate-500 text-sm">days to collect</p>
      </div>
      {factors && (
        <>
          <p className="text-xs text-slate-500 mb-1">
            DSO Factor = weight for your score in this band (higher = better for score).
          </p>
          <div className="flex gap-1 mb-0.5">
            {BANDS.map((b) => (
              <div key={b.band} className="flex-1 text-center">
                <span className="text-xs font-medium text-slate-600 tabular-nums" title={`${b.label}: factor ${factors[b.band]}`}>
                  {factors[b.band]}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
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
      <div className="rounded-xl bg-slate-100 p-4">
        <p className="text-slate-700 text-sm">{impactText(dso.dsoFactor)}</p>
      </div>
    </section>
  );
}
