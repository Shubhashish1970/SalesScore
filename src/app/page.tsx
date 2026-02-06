"use client";

import { useSwipe } from "@/hooks/useSwipe";
import { defaultScorecard, sampleTM, sampleRM, sampleZM, sampleBU } from "@/data/sampleScorecard";
import type { ScorecardData } from "@/types/scorecard";
import { ScoreOverview } from "@/components/screens/ScoreOverview";
import { GrowthCheck } from "@/components/screens/GrowthCheck";
import { CollectionSpeed } from "@/components/screens/CollectionSpeed";
import { OverdueMoney } from "@/components/screens/OverdueMoney";
import { ProductMix } from "@/components/screens/ProductMix";
import { WhatToDoNext } from "@/components/screens/WhatToDoNext";
import { useState, useEffect } from "react";

const SCREENS = [
  ScoreOverview,
  GrowthCheck,
  CollectionSpeed,
  OverdueMoney,
  ProductMix,
  WhatToDoNext,
] as const;

const ROLE_DATA: Record<string, ScorecardData> = {
  TM: sampleTM,
  RM: sampleRM,
  ZM: sampleZM,
  BU: sampleBU,
};

/**
 * One concept per screen; horizontal swipe right only.
 * Data is JSON-driven; role only changes which dataset is shown (same 6 screens).
 */
export default function Home() {
  const [data, setData] = useState<ScorecardData>(defaultScorecard);
  const { currentIndex, setCurrentIndex, goNext, onTouchStart, onTouchEnd } = useSwipe(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [data.role]);

  const Screen = SCREENS[currentIndex];

  return (
    <main className="min-h-screen max-w-lg mx-auto bg-white shadow-sm">
      {/* Role switcher for demo only; in production, role comes from auth/API */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between">
        <span className="text-slate-500 text-sm">Scorecard</span>
        <select
          className="text-sm border border-slate-300 rounded px-2 py-1 text-slate-700"
          value={data.role}
          onChange={(e) => {
            const next = ROLE_DATA[e.target.value];
            if (next) setData(next);
          }}
          aria-label="Select role"
        >
          <option value="TM">TM</option>
          <option value="RM">RM</option>
          <option value="ZM">ZM</option>
          <option value="BU">BU</option>
        </select>
      </header>

      <div
        className="swipe-container"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Screen data={data} />
      </div>

      {/* Progress and next: optional tap target for non-swipe users */}
      <footer className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex gap-1">
          {SCREENS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i === currentIndex ? "bg-amber-500" : "bg-slate-300"}`}
              aria-hidden
            />
          ))}
        </div>
        {currentIndex < SCREENS.length - 1 && (
          <button
            type="button"
            onClick={goNext}
            className="text-amber-700 text-sm font-medium py-1 px-3"
          >
            Next →
          </button>
        )}
      </footer>
    </main>
  );
}
