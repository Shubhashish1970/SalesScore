"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";
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

function getTitle(role: Role): string {
  if (role === "ZM") return "ZM Leaderboard (Top 5)";
  if (role === "RM") return "RM Leaderboard (Top 10)";
  return "TM Leaderboard (Top 10)";
}

function formatScore(n: number): string {
  return Number(n).toFixed(1);
}

function formatDate(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base" aria-hidden>🥇</span>;
  if (rank === 2) return <span className="text-base" aria-hidden>🥈</span>;
  if (rank === 3) return <span className="text-base" aria-hidden>🥉</span>;
  return (
    <span
      className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white tabular-nums"
      style={{ backgroundColor: BRAND.secondary }}
    >
      {rank}
    </span>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
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
  const title = getTitle(role);
  const dateStr = formatDate();
  const shareRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!shareRef.current || entries.length === 0 || sharing) return;
    setSharing(true);
    try {
      const isMobile = typeof navigator !== "undefined" && (navigator.maxTouchPoints > 0 || "ontouchstart" in window) && window.innerWidth < 1024;
      const canvas = await html2canvas(shareRef.current, {
        scale: isMobile ? 1.5 : 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
      if (!blob) throw new Error("Failed to create image");
      const file = new File([blob], `leaderboard-${dateStr}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${title} - ${dateStr}`,
          text: `Check out the ${title}`,
          files: [file],
        });
      } else if (navigator.share) {
        throw new Error("File sharing not supported");
      } else {
        alert("Sharing is not supported in this browser. Please use a modern mobile browser.");
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        const msg = (err as Error)?.message ?? "";
        if (msg.includes("user gesture") || msg.includes("gesture")) {
          alert("Please tap Share again to share the screenshot.");
        } else {
          alert("Could not share screenshot. Please try again or use a different browser.");
        }
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <section className="min-h-[80dvh] flex flex-col px-4 pt-4 pb-6 overflow-hidden">
      <div
        ref={shareRef}
        className="flex flex-col flex-1 min-h-0"
      >
      <div
        className="rounded-xl px-4 py-3 mb-4 shadow-lg flex items-start gap-3"
        style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}
      >
        <div className="shrink-0 mt-0.5 rounded-lg bg-white/95 p-1.5">
          <Image
            src="/nagarjuna-nacl-logo.png"
            alt="Nagarjuna NACL"
            width={44}
            height={44}
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-white/90 text-xs font-medium tabular-nums" aria-label={`Date: ${dateStr}`}>
                {dateStr}
              </span>
              {!loading && !error && entries.length > 0 && (
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-50"
                  aria-label="Share leaderboard"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-white/85 text-[10px] mt-1">
            Rank by total score. DSO, OS, and Product Mix contribute to the total.
          </p>
        </div>
      </div>

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
        <div
          className="flex-1 min-h-0 overflow-y-auto rounded-xl border bg-white shadow-sm"
          style={{ borderColor: `${BRAND.primary}30` }}
        >
          <table className="w-full table-fixed text-[9px] leading-tight">
            <thead className="sticky top-0 z-10 text-left" style={{ backgroundColor: `${BRAND.primary}15` }}>
              <tr style={{ color: BRAND.primary }}>
                <th className="px-2 py-2 font-semibold w-10">#</th>
                <th className="pl-2 pr-1 py-2 font-semibold">Name</th>
                <th className="pl-1 pr-2 py-2 font-semibold w-16">Territory</th>
                <th className="px-2 py-2 font-semibold text-right tabular-nums w-10">DSO</th>
                <th className="px-2 py-2 font-semibold text-right tabular-nums w-10">OS</th>
                <th className="px-2 py-2 font-semibold text-right tabular-nums w-10">Mix</th>
                <th className="px-2 py-2 font-semibold text-right tabular-nums w-12">Total</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const cu = (currentUserName ?? "").toLowerCase().trim();
                const en = entry.name.toLowerCase().trim();
                const isCurrentUser = cu && (en.includes(cu) || cu.includes(en));
                return (
                  <tr
                    key={entry.rank}
                    className={`border-b ${i < 3 ? "font-medium" : ""}`}
                    style={{
                      borderBottomColor: `${BRAND.primary}20`,
                      backgroundColor: isCurrentUser ? `${BRAND.accent}25` : i % 2 === 0 ? "#fff" : `${BRAND.primary}08`,
                    }}
                  >
                    <td className="px-2 py-1.5"><Medal rank={entry.rank} /></td>
                    <td className="pl-2 pr-1 py-1.5">
                      <span
                        className={isCurrentUser ? "font-semibold" : "text-slate-800"}
                        style={isCurrentUser ? { color: BRAND.primary } : {}}
                      >
                        {entry.name}
                        {isCurrentUser && <span className="ml-0.5 text-[8px]" style={{ color: BRAND.primary }}>(you)</span>}
                      </span>
                    </td>
                    <td className="pl-1 pr-2 py-1.5 text-slate-600 truncate max-w-16">{entry.territory || "—"}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatScore(entry.dsoScore)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatScore(entry.osScore)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatScore(entry.productMixScore)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums font-bold" style={{ color: BRAND.primary }}>{formatScore(entry.totalScore)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </section>
  );
}
