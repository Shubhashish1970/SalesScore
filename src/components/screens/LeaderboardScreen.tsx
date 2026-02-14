"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import type { Role } from "@/types/scorecard";
import type { LeaderboardEntry } from "@/types/leaderboard";

/** Brand colors: NACL Blue #034EA2, Support Blue #0071b9, Sun Yellow #ffab00 */
const BRAND = {
  primary: "#034EA2",
  secondary: "#0071b9",
  accent: "#ffab00",
} as const;

interface Props {
  entries: LeaderboardEntry[];
  role: Role;
  loading?: boolean;
  error?: string | null;
  currentUserName?: string;
}

function formatScore(n: number): string {
  return Number(n).toFixed(1);
}

function getRoleLabel(role: Role): string {
  if (role === "ZM") return "Zonal Manager";
  if (role === "RM") return "Regional Manager";
  return "Territory Manager";
}

function formatDate(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-sm" aria-hidden>🥇</span>;
  if (rank === 2) return <span className="text-sm" aria-hidden>🥈</span>;
  if (rank === 3) return <span className="text-sm" aria-hidden>🥉</span>;
  return (
    <span
      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white tabular-nums shrink-0"
      style={{ backgroundColor: BRAND.secondary }}
    >
      {rank}
    </span>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H8v2h8v-2h-3v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}

export function LeaderboardScreen({
  entries,
  role,
  loading,
  error,
  currentUserName,
}: Props) {
  const dateStr = formatDate();
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    if (!loading && !error && entries.length > 0 && !celebrated) {
      setCelebrated(true);
      const duration = 2e3;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#034EA2", "#0071b9", "#ffab00"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#034EA2", "#0071b9", "#ffab00"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [loading, error, entries.length, celebrated]);

  return (
    <section className="min-h-[80dvh] flex flex-col bg-white overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
      <div className="relative overflow-hidden">
        <div
          className="relative flex flex-col min-h-[160px] px-4 py-3 pb-2 bg-cover"
          style={{
            backgroundImage: "url(/hall-of-fame-banner.png?v=10)",
            backgroundPosition: "right top",
          }}
        >
          {/* Hall of Fame + Logo + Trophy pill at bottom-left corner */}
          <div className="absolute bottom-2 left-4 z-10 flex flex-col items-start">
            <div className="bg-white/95 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2 border border-slate-200/50">
              <Image
                src="/nagarjuna-nacl-logo.png"
                alt="Nagarjuna NACL"
                width={24}
                height={24}
                className="object-contain"
                unoptimized
              />
              <span style={{ color: BRAND.accent }}>
                <TrophyIcon className="w-[1rem] h-[1rem]" />
              </span>
              <h2 className="text-sm font-bold" style={{ color: BRAND.primary }}>
                Hall of Fame
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Subtitle just below banner - NACL blue, single line */}
      <p className="px-4 py-2 text-[10px] font-medium whitespace-nowrap shrink-0" style={{ color: BRAND.primary }}>
        Ranked by Total Score of DSO, OS &amp; Product Mix
      </p>

      <div className="pt-2 flex-1 min-h-0 flex flex-col">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: BRAND.primary, borderTopColor: "transparent" }}
            aria-hidden
          />
          <p className="text-slate-500 text-[10px]">Loading leaderboard…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-red-600 text-[10px] text-center">{error}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-slate-500 text-[10px]">No leaderboard data yet.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="px-3 py-1 grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto_auto] gap-x-1 gap-y-0 text-[9px] font-semibold text-slate-500 border-b border-slate-200 bg-slate-50/80 shrink-0">
            <span className="w-5" />
            <span>{getRoleLabel(role)}</span>
            <span className="text-right tabular-nums w-8 ml-5">DSO</span>
            <span className="text-right tabular-nums w-8">OS</span>
            <span className="text-right tabular-nums w-8">Mix</span>
            <span className="text-right tabular-nums w-10 font-bold" style={{ color: BRAND.primary }}>Total</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {entries.map((entry, i) => {
              const cu = (currentUserName ?? "").toLowerCase().trim();
              const en = entry.name.toLowerCase().trim();
              const isCurrentUser = cu && (en.includes(cu) || cu.includes(en));
              return (
                <div
                  key={entry.rank}
                  className={`grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto_auto] gap-x-1 px-3 py-1.5 items-center border-b border-slate-100 ${
                    isCurrentUser ? "bg-amber-50/80" : i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  } flex-1 min-h-0`}
                >
                  <Medal rank={entry.rank} />
                  <div className="min-w-0 overflow-hidden">
                    <p className={`text-[9px] leading-tight break-words ${isCurrentUser ? "font-medium" : ""}`} style={isCurrentUser ? { color: BRAND.primary } : { color: "#334155" }}>
                      {entry.name}
                      {isCurrentUser && <span className="ml-0.5 text-[8px]" style={{ color: BRAND.primary }}>(you)</span>}
                    </p>
                    <p className="text-slate-500 text-[8px] leading-tight break-words">{entry.territory || "—"}</p>
                  </div>
                  <span className="text-slate-700 tabular-nums w-8 text-right text-[9px] ml-5">{formatScore(entry.dsoScore)}</span>
                  <span className="text-slate-700 tabular-nums w-8 text-right text-[9px]">{formatScore(entry.osScore)}</span>
                  <span className="text-slate-700 tabular-nums w-8 text-right text-[9px]">{formatScore(entry.productMixScore)}</span>
                  <span className="font-bold tabular-nums w-10 text-right text-[9px]" style={{ color: BRAND.primary }}>{formatScore(entry.totalScore)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
      {/* Date pill below scorecard - RHS */}
      <div className="flex items-center justify-end px-4 py-2 border-t border-slate-200 bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: BRAND.primary }}>
          <span className="text-white text-[10px] font-medium tabular-nums">{dateStr}</span>
        </div>
      </div>
      </div>
    </section>
  );
}
