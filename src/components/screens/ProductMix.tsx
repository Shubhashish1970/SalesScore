"use client";

import type { ScorecardData } from "@/types/scorecard";

/**
 * Screen 5: Category distribution. Higher category = higher score impact; helped vs diluted.
 */
interface Props {
  data: ScorecardData;
}

const CATEGORIES: { key: keyof ScorecardData["productMix"]; label: string; impact: string; weight: number }[] = [
  { key: "categoryA", label: "Category A", impact: "Highest", weight: 1.4 },
  { key: "categoryB", label: "Category B", impact: "High", weight: 1.3 },
  { key: "categoryC", label: "Category C", impact: "Medium", weight: 1.2 },
  { key: "categoryD", label: "Category D", impact: "Lower", weight: 1.1 },
  { key: "categoryE", label: "Category E", impact: "Lowest", weight: 0 },
];

export function ProductMix({ data }: Props) {
  const { productMix } = data;
  const topShare = productMix.categoryA + productMix.categoryB;
  const helped = productMix.nrvFactor >= 0.65;
  const catA = CATEGORIES.find((c) => c.key === "categoryA")!;
  const catB = CATEGORIES.find((c) => c.key === "categoryB")!;

  return (
    <section className="min-h-[80dvh] flex flex-col justify-center px-5 py-6 relative">
      <div
        className="absolute top-6 right-5 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold tabular-nums bg-indigo-500 text-white"
        aria-label={`Product score: ${productMix.nrvFactor}`}
      >
        {productMix.nrvFactor.toFixed(2)}
      </div>
      <h2 className="text-lg font-semibold text-slate-800 mb-1 pr-14">Product mix</h2>
      <p className="text-violet-400 text-xs mb-2">
        Share of sales from each category. Higher categories (A, B) improve your score more.
      </p>
      <p className="text-xs text-slate-600 mb-3">
        CAT A sales <span className="font-medium text-slate-800">{productMix.categoryA}%</span> (weight {catA.weight}) · CAT B sales <span className="font-medium text-slate-800">{productMix.categoryB}%</span> (weight {catB.weight}) · Product score: <span className="font-semibold tabular-nums">{productMix.nrvFactor.toFixed(2)}</span>
      </p>
      <div className="space-y-2 mb-6">
        {CATEGORIES.map(({ key, label, impact, weight }) => {
          const isMaxBenefit = key === "categoryA" || key === "categoryB";
          const isNoBenefit = key === "categoryE";
          const row = (
            <div key={key} className="flex items-center gap-2">
              <div className="w-20 text-slate-700 text-sm shrink-0">{label}</div>
              <div className="flex-1 h-5 bg-slate-200 rounded overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded"
                  style={{ width: `${productMix[key]}%` }}
                />
              </div>
              <span className="text-slate-600 text-xs w-14">{impact}</span>
              <span className="text-[10px] text-slate-500 w-6">({weight})</span>
            </div>
          );
          if (isMaxBenefit) {
            return <div key={key} className="rounded-lg border-2 border-emerald-400/70 bg-emerald-50/30 px-2 py-1.5 animate-product-cat-benefit">{row}</div>;
          }
          if (isNoBenefit) {
            return <div key={key} className="rounded-lg border-2 border-red-400/80 bg-red-50/40 px-2 py-1.5 animate-product-cat-none">{row}</div>;
          }
          return <div key={key}>{row}</div>;
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
