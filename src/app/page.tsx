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
import type { GeminiCommentaryOutput } from "@/gemini";
import { mergeCommentaryIntoScorecard } from "@/gemini";
import { BreakScreen } from "@/components/screens/BreakScreen";
import { ScoreOverview } from "@/components/screens/ScoreOverview";
import { GrowthCheck } from "@/components/screens/GrowthCheck";
import { CollectionSpeed } from "@/components/screens/CollectionSpeed";
import { OverdueMoney } from "@/components/screens/OverdueMoney";
import { ProductMix } from "@/components/screens/ProductMix";
import { WhatToDoNext } from "@/components/screens/WhatToDoNext";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { fetchScorecard, isKpiApiConfigured } from "@/lib/kpi-api";
import { getAppConfig, loadConfigFromStorage } from "@/lib/app-config";
import { AdminSettingsScreen } from "@/components/admin/AdminSettingsScreen";

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

const ADMIN_MOBILE = process.env.NEXT_PUBLIC_ADMIN_MOBILE ?? "1234567890";

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
  const roleFromUrl = searchParams.get("role");
  const [data, setData] = useState<ScorecardData>(defaultScorecard);
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const { currentIndex, setCurrentIndex, goNext, goPrev, onTouchStart, onTouchEnd } = useSwipe(0);

  const isAdminMode = mobileFromUrl === ADMIN_MOBILE;
  const isPersonalLink = Boolean(userToken || mobileFromUrl);
  const isDemoMode = !isPersonalLink && !isAdminMode;

  if (isAdminMode) {
    return (
      <main className="min-h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white">
        <AdminSettingsScreen />
      </main>
    );
  }

  const retryLoad = useCallback(() => {
    setFetchError(false);
    setLoading(true);
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    loadConfigFromStorage();
    if (mobileFromUrl === ADMIN_MOBILE) return;
    let cancelled = false;
    setCurrentIndex(0);

    const runCommentary = (scorecard: ScorecardData) => {
      const commentaryUrl = process.env.NEXT_PUBLIC_GEMINI_COMMENTARY_URL ?? "/api/gemini/commentary";

      const post = (payload: unknown) =>
        fetch(commentaryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Commentary failed"))));

      const unwrap = (raw: unknown): Partial<GeminiCommentaryOutput> => {
        const obj =
          typeof (raw as { achievementMessage?: string })?.achievementMessage === "string"
            ? (raw as Record<string, unknown>)
            : ((raw as { data?: unknown })?.data ?? (raw as { result?: unknown })?.result ?? raw);
        return (obj ?? {}) as Partial<GeminiCommentaryOutput>;
      };

      const config = getAppConfig();
      post({ scorecard, config, fields: ["achievementMessage"] })
        .then((raw) => {
          if (cancelled) return;
          const commentary = unwrap(raw);
          if (commentary?.achievementMessage) {
            const merged = mergeCommentaryIntoScorecard(scorecard, commentary);
            setData({ ...merged, commentaryFromGemini: true });
          }
        })
        .catch(() => {
          post({ scorecard, config })
            .then((raw) => {
              if (cancelled) return;
              const commentary = unwrap(raw);
              const merged = mergeCommentaryIntoScorecard(scorecard, commentary);
              setData({ ...merged, commentaryFromGemini: true });
            })
            .catch((err) => {
              if (!cancelled) console.warn("[Scorecard] Commentary failed:", (err as Error)?.message);
            });
        });

      post({ scorecard, config, fields: ["growthComment", "dsoComment", "overdueComment", "productMixComment", "recommendedActions"] })
        .then((raw) => {
          if (cancelled) return;
          const commentary = unwrap(raw);
          setData((prev) => ({ ...mergeCommentaryIntoScorecard(prev, commentary), commentaryFromGemini: true }));
        })
        .catch(() => {});
    };

    if (isDemoMode) {
      setData(defaultScorecard);
      setFetchError(false);
      setLoading(false);
      return;
    }

    if (userToken) {
      const scorecard = scorecardByToken[userToken];
      if (scorecard) {
        setData(scorecard);
        setFetchError(false);
        setLoading(false);
        runCommentary(scorecard);
      } else {
        setFetchError(true);
        setLoading(false);
      }
      return () => { cancelled = true; };
    }

    if (mobileFromUrl) {
      const role = (roleFromUrl === "TM" || roleFromUrl === "RM" || roleFromUrl === "ZM" || roleFromUrl === "BU"
        ? roleFromUrl
        : "TM") as ScorecardData["role"];

      if (isKpiApiConfigured()) {
        setLoading(true);
        fetchScorecard(mobileFromUrl, role)
          .then((scorecard) => {
            if (cancelled) return;
            setData(scorecard);
            setFetchError(false);
            setLoading(false);
            runCommentary(scorecard);
          })
          .catch(() => {
            if (cancelled) return;
            setFetchError(true);
            setLoading(false);
          });
      } else {
        const scorecard = scorecardByMobile[mobileFromUrl];
        if (scorecard) {
          setData(scorecard);
          setFetchError(false);
          runCommentary(scorecard);
        } else {
          setFetchError(true);
        }
        setLoading(false);
      }
      return () => { cancelled = true; };
    }

    setData(defaultScorecard);
    setFetchError(false);
    setLoading(false);
    return () => { cancelled = true; };
  }, [userToken, mobileFromUrl, roleFromUrl, isDemoMode, setCurrentIndex, retryKey]);

  const Screen = SCREENS[currentIndex];

  if (fetchError) {
    return (
      <main className="h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white">
        <BreakScreen onRetry={retryLoad} />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="h-dvh max-h-dvh flex items-center justify-center bg-white">
        <div className="text-slate-500">Loading your scorecard…</div>
      </main>
    );
  }

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
