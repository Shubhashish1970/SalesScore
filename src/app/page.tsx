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
import { mergeCommentaryIntoScorecard } from "@/gemini";
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
    let scorecard: ScorecardData | undefined;
    if (userToken) {
      scorecard = scorecardByToken[userToken];
      if (scorecard) setData(scorecard);
      // Else: in production, fetch GET /api/scorecard?u={userToken} and setData(response)
    } else if (mobileFromUrl) {
      scorecard = scorecardByMobile[mobileFromUrl];
      if (scorecard) setData(scorecard);
    } else {
      setData(defaultScorecard);
    }
    setCurrentIndex(0);

    // When opened via personal link, fetch Gemini commentary and merge into scorecard.
    // With static export (Firebase Hosting) there is no same-origin API; set NEXT_PUBLIC_GEMINI_COMMENTARY_URL to your hosted API.
    if (scorecard) {
      const commentaryUrl = process.env.NEXT_PUBLIC_GEMINI_COMMENTARY_URL ?? "/api/gemini/commentary";
      fetch(commentaryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scorecard),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Commentary failed"))))
        .then((commentary) => setData(mergeCommentaryIntoScorecard(scorecard!, commentary)))
        .catch((err) => {
          console.warn("[Scorecard] Commentary request failed, using sample text:", err?.message || err);
        });
    }
  }, [userToken, mobileFromUrl, setCurrentIndex]);

  const Screen = SCREENS[currentIndex];

  return (
    <main className="h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white shadow-sm overflow-hidden">
      <header className="shrink-0 bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between">
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
        className="swipe-container flex-1 min-h-0 overflow-auto"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Screen data={data} />
      </div>

      <footer className="shrink-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="text-amber-700 text-sm font-medium py-1 px-3 disabled:opacity-40 disabled:cursor-default"
          aria-label="Previous"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex === SCREENS.length - 1}
          className="text-amber-700 text-sm font-medium py-1 px-3 disabled:opacity-40 disabled:cursor-default"
          aria-label="Next"
        >
          Next →
        </button>
      </footer>
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
