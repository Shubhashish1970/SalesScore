"use client";

import type { ScorecardData } from "@/types/scorecard";
import { GeminiCommentaryBadge } from "@/components/GeminiCommentaryBadge";

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
  return "Collection speed is in a good band and helping your score, but you can do better by moving to <50 band.";
}

export function CollectionSpeed({ data }: Props) {
  const { dso } = data;
  const factors = data.dsoBandFactors;
  const activeBandConfig = BANDS.find((b) => b.band === dso.dsoBand);
  const badgeColor = activeBandConfig?.roundelColor ?? "bg-slate-500 text-white";
  const dsoScoreRounded = Math.round(dso.dsoScore);
  const dsoWeight = data.kpiWeights?.dso ?? 33;

  return (
    <section className="min-h-[80dvh] flex flex-col px-5 pt-8 pb-6 relative">
      <div
        className={`absolute top-6 right-5 rounded-lg px-2.5 py-1.5 flex items-center justify-center text-base font-bold tabular-nums min-w-[4.5rem] ${badgeColor}`}
        aria-label={`DSO score: ${dsoScoreRounded} out of ${dsoWeight}`}
      >
        {dsoScoreRounded}/{dsoWeight}
      </div>
      <h2 className="text-lg font-semibold text-slate-800 mb-0.5 pr-20">Collection Speed (DSO)</h2>
      <p className="text-[#2f41a7] text-xs mt-0 mb-4 pr-20">
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
      {data.dsoComment?.trim() ? (
        <div className="rounded-xl bg-slate-100 p-4 flex items-start gap-2">
          <GeminiCommentaryBadge show={Boolean(data.commentaryFromGemini)} className="mt-0.5" />
          <p className="text-slate-700 text-sm flex-1">{data.dsoComment.trim()}</p>
        </div>
      ) : null}
    </section>
  );
}
