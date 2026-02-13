"use client";

import { useSwipe } from "@/hooks/useSwipe";
import type { ScorecardData } from "@/types/scorecard";
import { EMPTY_SCORECARD } from "@/types/scorecard";
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
import { LeaderboardModal } from "@/components/LeaderboardModal";
import { fetchLeaderboard } from "@/lib/leaderboard-api";
import type { LeaderboardEntry } from "@/types/leaderboard";

const SCREENS = [
  ScoreOverview,
  GrowthCheck,
  CollectionSpeed,
  OverdueMoney,
  ProductMix,
  WhatToDoNext,
] as const;

const ADMIN_MOBILE = process.env.NEXT_PUBLIC_ADMIN_MOBILE ?? "1234567890";

/**
 * Entry: App works only via KPI API. Use ?mobile=...&role=TM|RM|ZM|BU.
 * API: https://kw-sales-score-api-366769154420.asia-south1.run.app (via same-origin proxy).
 */
function HomeContent() {
  const searchParams = useSearchParams();
  const mobileFromUrl = searchParams.get("mobile");
  const roleFromUrl = searchParams.get("role");
  const [data, setData] = useState<ScorecardData>(EMPTY_SCORECARD);
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const { currentIndex, setCurrentIndex, goNext, goPrev, onTouchStart, onTouchEnd } = useSwipe(0);

  const isAdminMode = mobileFromUrl === ADMIN_MOBILE;

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
      setData((prev) => ({ ...prev, commentaryLoading: true }));

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
      const p1 = post({ scorecard, config, fields: ["achievementMessage"] })
        .then((raw) => {
          if (cancelled) return;
          const commentary = unwrap(raw);
          if (commentary?.achievementMessage) {
            const merged = mergeCommentaryIntoScorecard(scorecard, commentary);
            setData((prev) => ({ ...merged, commentaryFromGemini: true, commentaryLoading: prev.commentaryLoading }));
          }
        })
        .catch(() => {
          post({ scorecard, config })
            .then((raw) => {
              if (cancelled) return;
              const commentary = unwrap(raw);
              const merged = mergeCommentaryIntoScorecard(scorecard, commentary);
              setData((prev) => ({ ...merged, commentaryFromGemini: true, commentaryLoading: prev.commentaryLoading }));
            })
            .catch((err) => {
              if (!cancelled) console.warn("[Scorecard] Commentary failed:", (err as Error)?.message);
            });
        });

      const p2 = post({ scorecard, config, fields: ["growthComment", "dsoComment", "overdueComment", "productMixComment", "recommendedActions"] })
        .then((raw) => {
          if (cancelled) return;
          const commentary = unwrap(raw);
          setData((prev) => ({ ...mergeCommentaryIntoScorecard(prev, commentary), commentaryFromGemini: true }));
        })
        .catch(() => {});

      Promise.allSettled([p1, p2]).then(() => {
        if (!cancelled) setData((prev) => ({ ...prev, commentaryLoading: false }));
      });
    };

    if (!mobileFromUrl || !isKpiApiConfigured()) {
      setFetchError(true);
      setLoading(false);
      return () => { cancelled = true; };
    }

    const role = (roleFromUrl === "TM" || roleFromUrl === "RM" || roleFromUrl === "ZM" || roleFromUrl === "BU"
      ? roleFromUrl
      : "TM") as ScorecardData["role"];

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
    return () => { cancelled = true; };
  }, [mobileFromUrl, roleFromUrl, setCurrentIndex, retryKey]);

  useEffect(() => {
    if (!leaderboardOpen || !data.role) return;
    const role = data.role;
    if (role === "BU") return;
    let cancelled = false;
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    fetchLeaderboard(role)
      .then((entries) => {
        if (!cancelled) {
          setLeaderboardEntries(entries);
          setLeaderboardError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLeaderboardEntries([]);
          setLeaderboardError((err as Error)?.message ?? "Failed to load leaderboard");
        }
      })
      .finally(() => {
        if (!cancelled) setLeaderboardLoading(false);
      });
    return () => { cancelled = true; };
  }, [leaderboardOpen, data.role]);

  const Screen = SCREENS[currentIndex];
  const showLeaderboardIcon = (data.role === "TM" || data.role === "RM" || data.role === "ZM") && currentIndex === 1;

  if (fetchError) {
    const noLink = !mobileFromUrl;
    return (
      <main className="h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white">
        <BreakScreen
          onRetry={noLink ? undefined : retryLoad}
          message={noLink ? "Open this app via your personalized link (e.g. ?mobile=...&role=TM)." : undefined}
        />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white">
        <header className="shrink-0 border-b border-slate-200 px-3 py-2">
          <span className="text-slate-400 text-sm">Scorecard</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" aria-hidden />
          <p className="text-slate-500 text-sm">Loading your scorecard…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white shadow-sm overflow-hidden">
      <header className="shrink-0 bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between">
        <span className="text-slate-700 text-sm font-medium" aria-label="Welcome">
          Welcome, {data.name}
        </span>
        {showLeaderboardIcon && (
          <button
            type="button"
            onClick={() => setLeaderboardOpen(true)}
            className="p-2 -m-2 rounded-full hover:bg-amber-50 text-amber-600 transition-colors"
            aria-label="View leaderboard"
          >
            <span className="text-xl" aria-hidden>🏆</span>
          </button>
        )}
      </header>

      <LeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        entries={leaderboardEntries}
        role={data.role}
        loading={leaderboardLoading}
        error={leaderboardError}
        currentUserName={data.name}
      />

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
