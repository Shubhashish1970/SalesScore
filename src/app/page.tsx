"use client";

import { useSwipe } from "@/hooks/useSwipe";
import {
  defaultScorecard,
  scorecardByMobile,
  scorecardByToken,
  sampleTM,
  sampleRM,
  sampleZM,
  sampleBU,
} from "@/data/sampleScorecard";
import type { ScorecardData } from "@/types/scorecard";
import { ScoreOverview } from "@/components/screens/ScoreOverview";
import { GrowthCheck } from "@/components/screens/GrowthCheck";
import { CollectionSpeed } from "@/components/screens/CollectionSpeed";
import { OverdueMoney } from "@/components/screens/OverdueMoney";
import { ProductMix } from "@/components/screens/ProductMix";
import { WhatToDoNext } from "@/components/screens/WhatToDoNext";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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
 * Entry: WhatsApp CTA uses ?u=<token> (encrypted mobile or opaque token). Mobile never in URL.
 * Backend: when building the CTA link, encrypt mobile (or issue token) and set ?u= that value.
 * API: GET /api/scorecard?u={token} decrypts/resolves to user, returns ScorecardData.
 * Demo: ?u=d_tm|d_rm|d_zm|d_bu or ?mobile= (plain, local only). No param = role dropdown.
 */
function HomeContent() {
  const searchParams = useSearchParams();
  const userToken = searchParams.get("u");
  const mobileFromUrl = searchParams.get("mobile");
  const [data, setData] = useState<ScorecardData>(defaultScorecard);
  const { currentIndex, setCurrentIndex, goNext, goPrev, onTouchStart, onTouchEnd } = useSwipe(0);

  const isPersonalLink = Boolean(userToken || mobileFromUrl);
  const isDemoMode = !isPersonalLink;

  useEffect(() => {
    if (userToken) {
      const scorecard = scorecardByToken[userToken];
      if (scorecard) {
        setData(scorecard);
      }
      // Else: in production, fetch GET /api/scorecard?u={userToken} and setData(response)
    } else if (mobileFromUrl) {
      const scorecard = scorecardByMobile[mobileFromUrl];
      if (scorecard) setData(scorecard);
    } else {
      setData(defaultScorecard);
    }
    setCurrentIndex(0);
  }, [userToken, mobileFromUrl, setCurrentIndex]);

  const Screen = SCREENS[currentIndex];

  return (
    <main className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-sm">
      <header className="sticky top-0 z-10 shrink-0 bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between">
        {isDemoMode ? (
          <>
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
          </>
        ) : (
          <span className="text-slate-700 text-sm font-medium" aria-label="Welcome">
            Welcome, {data.name}
          </span>
        )}
      </header>

      <div
        className="swipe-container flex-1 min-h-0 flex flex-col relative"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Screen data={data} />

        {/* Mid-screen prev/next as < > icons — fixed to viewport middle, don't block swipe */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2 z-10">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            aria-label="Previous"
            className="pointer-events-auto w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:pointer-events-none touch-manipulation active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex === SCREENS.length - 1}
            aria-label="Next"
            className="pointer-events-auto w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:pointer-events-none touch-manipulation active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white text-slate-500">Loading…</div>}>
      <HomeContent />
    </Suspense>
  );
}
