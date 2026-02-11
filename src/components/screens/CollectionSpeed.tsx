"use client";

import type { ScorecardData, DsoBandDefinition } from "@/types/scorecard";
import { DEFAULT_DSO_BANDS, DEFAULT_KPI_WEIGHTS } from "@/types/scorecard";
import { GeminiCommentaryBadge } from "@/components/GeminiCommentaryBadge";

/**
 * Screen 3: DSO in plain language. Band shown visually; labels under each segment; impact explained.
 * Bands come from data.dsoBands (API) or fall back to DEFAULT_DSO_BANDS.
 */
interface Props {
  data: ScorecardData;
}

function getBands(data: ScorecardData): DsoBandDefinition[] {
  const apiBands = data.dsoBands && data.dsoBands.length > 0 ? data.dsoBands : null;
  if (!apiBands) return DEFAULT_DSO_BANDS;
  return apiBands.map((b) => {
    const def = DEFAULT_DSO_BANDS.find((d) => d.id === b.id);
    return {
      ...b,
      color: b.color ?? def?.color ?? "bg-slate-500",
      roundelColor: b.roundelColor ?? def?.roundelColor ?? "bg-slate-500 text-white",
    };
  });
}

function impactText(factor: number): string {
  if (factor <= 0) return "Collection speed is blocking your score. Improving it will unlock the score.";
  if (factor < 1) return "Collection speed is partly limiting your score. Reducing days will help.";
  return "Collection speed is in a good band and helping your score, but you can do better by moving to <50 band.";
}

export function CollectionSpeed({ data }: Props) {
  const { dso } = data;
  const bands = getBands(data);
  const factors = data.dsoBandFactors ?? Object.fromEntries(bands.map((b) => [b.id, b.factor]));
  const activeBandConfig = bands.find((b) => b.id === dso.dsoBand);
  const badgeColor = activeBandConfig?.roundelColor ?? "bg-slate-500 text-white";
  const dsoScoreRounded = Math.round(dso.dsoScore);
  const dsoWeight = data.kpiWeights?.dso ?? DEFAULT_KPI_WEIGHTS.dso;

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
      <p className="text-xs text-slate-500 mb-1">
        DSO Factor = weight for your score in this band (higher = better for score).
      </p>
      <div className="flex gap-1 mb-0.5">
        {bands.map((b) => (
          <div key={b.id} className="flex-1 text-center">
            <span className="text-xs font-medium text-slate-600 tabular-nums" title={`${b.label}: factor ${b.factor}`}>
              {b.factor}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-1 mb-1">
        {bands.map((b) => (
          <div key={b.id} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full h-2 rounded-full ${b.color} ${
                b.id === dso.dsoBand
                  ? "ring-2 ring-offset-2 ring-slate-400 animate-dso-band"
                  : "opacity-40"
              }`}
              title={b.label}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mb-6">
        {bands.map((b) => (
          <div key={b.id} className="flex-1 text-center">
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
