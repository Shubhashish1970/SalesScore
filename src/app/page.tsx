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
import { decodeJwtPayload, extractMobileAndRole, isAdminToken, validateTokenParams, normalizeRole, validateAreaCode } from "@/lib/jwt-utils";
import { fetchHoMappingsFromApi, isHoUserFromMappings, getHoTargetsFromMappings, getHoLeaderNameFromMappings, getTargetByRoleAndAreaCode } from "@/lib/ho-mappings";
import { fetchAccessConfigFromApi, type AccessConfig } from "@/lib/access-config";
import type { HoTarget, HoMapping } from "@/lib/ho-mappings";
import { AdminSettingsScreen } from "@/components/admin/AdminSettingsScreen";
import { HoTargetSelector } from "@/components/HoTargetSelector";
import { LeaderboardScreen } from "@/components/screens/LeaderboardScreen";
import { fetchLeaderboard } from "@/lib/leaderboard-api";
import type { LeaderboardEntry } from "@/types/leaderboard";
import { ReactIcon } from "@/components/ReactIcon";

const SCREENS = [
  ScoreOverview,
  GrowthCheck,
  CollectionSpeed,
  OverdueMoney,
  ProductMix,
  WhatToDoNext,
] as const;

/**
 * Entry: App works via KPI API.
 * URL params: ?mobile=...&role=TM|RM|ZM|BU  OR  ?token=<JWT> (WhatsApp Bot).
 * Admin: ?token=<JWT> with payload.email = shubhashish@nacl.murugappa.com (no direct URL access).
 */
function HomeContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const mobileFromParams = searchParams.get("mobile");
  const roleFromParams = searchParams.get("role");
  const areaCodeFromParams = searchParams.get("areaCode");

  const { mobileFromUrl, roleFromUrl, areaCodeFromUrlOrToken, paramValidationFailed, noLink } = (() => {
    if (tokenFromUrl) {
      const validated = validateTokenParams(tokenFromUrl);
      if (validated) {
        return {
          mobileFromUrl: validated.mobile,
          roleFromUrl: validated.role,
          areaCodeFromUrlOrToken: validated.areaCode,
          paramValidationFailed: false,
          noLink: false,
        };
      }
      return {
        mobileFromUrl: null,
        roleFromUrl: null,
        areaCodeFromUrlOrToken: undefined as string | undefined,
        paramValidationFailed: true,
        noLink: false,
      };
    }
    const mobile = (mobileFromParams ?? "").trim();
    const role = normalizeRole(roleFromParams ?? "");
    if (!mobile) {
      return {
        mobileFromUrl: null,
        roleFromUrl: null,
        areaCodeFromUrlOrToken: undefined as string | undefined,
        paramValidationFailed: false,
        noLink: true,
      };
    }
    if (!role) {
      return {
        mobileFromUrl: null,
        roleFromUrl: null,
        areaCodeFromUrlOrToken: undefined as string | undefined,
        paramValidationFailed: true,
        noLink: false,
      };
    }
    const areaCode = areaCodeFromParams ? validateAreaCode(areaCodeFromParams) : undefined;
    if (areaCodeFromParams && !areaCode) {
      return {
        mobileFromUrl: null,
        roleFromUrl: null,
        areaCodeFromUrlOrToken: undefined as string | undefined,
        paramValidationFailed: true,
        noLink: false,
      };
    }
    return {
      mobileFromUrl: mobile,
      roleFromUrl: role,
      areaCodeFromUrlOrToken: areaCode,
      paramValidationFailed: false,
      noLink: false,
    };
  })();
  const [data, setData] = useState<ScorecardData>(EMPTY_SCORECARD);
  const [fetchError, setFetchError] = useState(false);
  const [invalidUser, setInvalidUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<HoTarget | null>(null);
  const [forceShowSelector, setForceShowSelector] = useState(false);
  const [targetConfigMissing, setTargetConfigMissing] = useState(false);
  const [hoMappings, setHoMappings] = useState<HoMapping[] | null>(null);
  const [accessConfig, setAccessConfig] = useState<AccessConfig | null>(null);
  const { currentIndex, setCurrentIndex, goNext, goPrev, onTouchStart, onTouchEnd } = useSwipe(0);

  const mappings = hoMappings ?? [];
  const isHo = Boolean(mobileFromUrl && isHoUserFromMappings(mobileFromUrl, mappings));
  const hoTargets = mobileFromUrl ? getHoTargetsFromMappings(mobileFromUrl, mappings) : null;
  const hoLeaderName = mobileFromUrl ? getHoLeaderNameFromMappings(mobileFromUrl, mappings) : undefined;

  const resolvedTarget =
    selectedTarget ??
    (!forceShowSelector && isHo && areaCodeFromUrlOrToken && roleFromUrl
      ? getTargetByRoleAndAreaCode(mobileFromUrl!, roleFromUrl, areaCodeFromUrlOrToken, mappings)
      : null);

  const effectiveMobile = resolvedTarget?.mobile ?? mobileFromUrl;
  const effectiveRole = (resolvedTarget?.role ?? roleFromUrl ?? "TM") as ScorecardData["role"];
  const effectiveAreaCode = resolvedTarget?.areaCode ?? areaCodeFromUrlOrToken;

  const areaCodeRequiredButMissing =
    !effectiveAreaCode && !isHo && hoMappings !== null;
  const finalParamValidationFailed = paramValidationFailed || areaCodeRequiredButMissing;

  const isAdminMode =
    Boolean(tokenFromUrl) && isAdminToken(decodeJwtPayload(tokenFromUrl ?? ""));

  const retryLoad = useCallback(() => {
    setFetchError(false);
    setInvalidUser(false);
    setTargetConfigMissing(false);
    setLoading(true);
    setRetryKey((k) => k + 1);
  }, []);

  const goBackToSelector = useCallback(() => {
    setSelectedTarget(null);
    setForceShowSelector(true);
    setTargetConfigMissing(false);
  }, []);

  useEffect(() => {
    fetchHoMappingsFromApi().then((m) => setHoMappings(m));
  }, []);

  useEffect(() => {
    fetchAccessConfigFromApi().then(setAccessConfig);
  }, []);

  useEffect(() => {
    loadConfigFromStorage();
    if (isAdminMode) return;
    if (finalParamValidationFailed) return;
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

    if (isHo && !resolvedTarget) {
      setLoading(false);
      setTargetConfigMissing(false);
      return () => { cancelled = true; };
    }

    const needsAreaCode =
      isHo &&
      selectedTarget &&
      resolvedTarget &&
      (resolvedTarget.role === "TM" || resolvedTarget.role === "RM" || resolvedTarget.role === "ZM") &&
      !resolvedTarget.areaCode?.trim();
    if (needsAreaCode) {
      setLoading(false);
      setTargetConfigMissing(true);
      return () => { cancelled = true; };
    }

    if (hoMappings === null && mobileFromUrl) {
      setLoading(true);
      return () => { cancelled = true; };
    }

    if (!effectiveMobile || !isKpiApiConfigured()) {
      setFetchError(true);
      setLoading(false);
      setTargetConfigMissing(false);
      return () => { cancelled = true; };
    }

    setTargetConfigMissing(false);

    const role = effectiveRole;

    setLoading(true);
    fetchScorecard(effectiveMobile, role, effectiveAreaCode ?? undefined)
      .then((scorecard) => {
        if (cancelled) return;
        const isEmptyOrPlaceholder = (s: string | undefined) => {
          const t = (s ?? "").trim().toLowerCase();
          return !t || t === "n/a" || t === "na" || t === "-" || t === "null" || t === "undefined" || t === "unknown";
        };
        const noName = isEmptyOrPlaceholder(scorecard.name) || scorecard.name?.trim() === String(effectiveMobile);
        const noEntity = isEmptyOrPlaceholder(scorecard.entityName);
        const isInvalidUser = noName && noEntity;
        if (isInvalidUser) {
          setFetchError(true);
          setInvalidUser(true);
        } else {
          setData(scorecard);
          setInvalidUser(false);
          runCommentary(scorecard);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setFetchError(true);
        setInvalidUser(false);
        setLoading(false);
      });

    if (role === "TM" || role === "RM" || role === "ZM") {
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
    }

    return () => { cancelled = true; };
  }, [effectiveMobile, effectiveRole, effectiveAreaCode, isHo, selectedTarget, forceShowSelector, areaCodeFromUrlOrToken, roleFromUrl, hoMappings, mobileFromUrl, setCurrentIndex, retryKey, finalParamValidationFailed]);

  if (isAdminMode) {
    return (
      <main className="min-h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white">
        <AdminSettingsScreen />
      </main>
    );
  }

  const usingTokenAccess = Boolean(tokenFromUrl);
  const usingUrlAccess = !tokenFromUrl && Boolean(mobileFromParams);
  const accessBlocked =
    accessConfig &&
    ((usingUrlAccess && !accessConfig.allowUrlAccess) ||
      (usingTokenAccess && !accessConfig.allowTokenAccess));

  if (accessBlocked) {
    return (
      <main className="h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white">
        <BreakScreen variant="accessDisabled" />
      </main>
    );
  }

  if (noLink) {
    return (
      <main className="h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white">
        <BreakScreen
          variant="noLink"
          message="Open via your personalized link: ?mobile=...&role=TM|RM|ZM|BU&areaCode=... (or ?token=<JWT> with areaCode in payload)"
        />
      </main>
    );
  }

  if (finalParamValidationFailed) {
    return (
      <main className="h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white">
        <BreakScreen variant="invalidParams" />
      </main>
    );
  }

  if (isHo && hoTargets && !resolvedTarget) {
    return (
      <main className="min-h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white">
        <HoTargetSelector targets={hoTargets} leaderName={hoLeaderName} onSelect={(t) => setSelectedTarget(t)} />
      </main>
    );
  }

  if (targetConfigMissing) {
    const label = resolvedTarget?.label || resolvedTarget?.role || "This target";
    return (
      <main className="h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white">
        <BreakScreen
          variant="targetConfigMissing"
          message={`${label} needs an area code. Please add it in Admin (Access tab → HO mappings → edit target).`}
          onRetry={goBackToSelector}
        />
      </main>
    );
  }

  const Screen = SCREENS[currentIndex];
  const showLeaderboardIcon = (data.role === "TM" || data.role === "RM" || data.role === "ZM") && currentIndex === 0;
  const cu = (data.name ?? "").toLowerCase().trim();
  const isInLeaderboard =
    leaderboardEntries.length > 0 &&
    Boolean(cu) &&
    leaderboardEntries.some((e) => {
      const en = e.name.toLowerCase().trim();
      return en.includes(cu) || cu.includes(en);
    });

  if (fetchError) {
    const noLink = !mobileFromUrl;
    return (
      <main className="h-dvh max-h-dvh flex flex-col max-w-lg mx-auto bg-white">
        <BreakScreen
          onRetry={noLink ? undefined : retryLoad}
          message={noLink ? "Open this app via your personalized link (e.g. ?mobile=...&role=TM or ?token=<JWT> from WhatsApp)." : undefined}
          variant={noLink ? "noLink" : invalidUser ? "invalidUser" : "fetchError"}
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
        <div className="flex items-center gap-2">
          {currentIndex === 0 && (
            <ReactIcon className="w-5 h-5 text-slate-400" />
          )}
          <span className="text-slate-700 text-sm font-medium" aria-label="Welcome">
            Welcome, {data.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isHo && resolvedTarget && (
            <button
              type="button"
              onClick={() => {
                setSelectedTarget(null);
                setForceShowSelector(true);
              }}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              Switch view
            </button>
          )}
          {showLeaderboardIcon && !leaderboardOpen && (
          <button
            type="button"
            onClick={() => setLeaderboardOpen(true)}
            className="p-2 -m-2 rounded-full hover:bg-amber-50 text-amber-600 transition-colors"
            aria-label="View leaderboard"
          >
            <span className="text-xl animate-trophy-glow inline-block" aria-hidden>🏆</span>
          </button>
          )}
        </div>
      </header>

      <div
        className={`swipe-container flex-1 min-h-0 ${leaderboardOpen ? "overflow-hidden" : "overflow-auto"}`}
        onTouchStart={leaderboardOpen ? undefined : onTouchStart}
        onTouchEnd={leaderboardOpen ? undefined : onTouchEnd}
      >
        {leaderboardOpen ? (
          <LeaderboardScreen
            entries={leaderboardEntries}
            role={data.role}
            loading={leaderboardLoading}
            error={leaderboardError}
            currentUserName={data.name}
          />
        ) : currentIndex === 0 ? (
          <ScoreOverview data={data} isInLeaderboard={isInLeaderboard} />
        ) : (
          <Screen data={data} />
        )}
      </div>

      <footer className="shrink-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between">
        {leaderboardOpen ? (
          <>
            <button
              type="button"
              onClick={() => setLeaderboardOpen(false)}
              className="text-amber-700 text-sm font-medium py-1 px-3"
              aria-label="Back"
            >
              ← Back
            </button>
            <span />
          </>
        ) : (
          <>
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
          </>
        )}
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
