"use client";

import type { ScorecardData } from "@/types/scorecard";

/**
 * Screen 5: Category distribution. Higher category = higher score impact; helped vs diluted.
 */
interface Props {
  data: ScorecardData;
}

const CATEGORIES = [
  { key: "categoryA" as const, label: "Category A", impact: "Highest" },
  { key: "categoryB" as const, label: "Category B", impact: "High" },
  { key: "categoryC" as const, label: "Category C", impact: "Medium" },
  { key: "categoryD" as const, label: "Category D", impact: "Lower" },
  { key: "categoryE" as const, label: "Category E", impact: "Lowest" },
];

export function ProductMix({ data }: Props) {
  const { productMix } = data;
  const topShare = productMix.categoryA + productMix.categoryB;
  const helped = productMix.nrvFactor >= 0.65;

  return (
    <section className="min-h-[80dvh] flex flex-col justify-center px-5 py-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-2">Product mix</h2>
      <p className="text-slate-600 text-sm mb-4">
        Share of sales from each category. Higher categories (A, B) improve your score more.
      </p>
      <div className="space-y-2 mb-6">
        {CATEGORIES.map(({ key, label, impact }) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-20 text-slate-700 text-sm shrink-0">{label}</div>
            <div className="flex-1 h-5 bg-slate-200 rounded overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded"
                style={{ width: `${productMix[key]}%` }}
              />
            </div>
            <span className="text-slate-600 text-xs w-14">{impact}</span>
          </div>
        ))}
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
