"use client";

import type { HoTarget } from "@/lib/ho-mappings";

interface HoTargetSelectorProps {
  targets: HoTarget[];
  /** HO leader name; shown as "Welcome <Name>" when provided. */
  leaderName?: string;
  onSelect: (target: HoTarget) => void;
}

export function HoTargetSelector({ targets, leaderName, onSelect }: HoTargetSelectorProps) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 max-w-lg mx-auto bg-slate-50">
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-lg font-semibold text-slate-800 mb-1">
          {leaderName ? `Welcome, ${leaderName}` : "Welcome"}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Choose a territory, region, zone, or BU to view its scorecard.
        </p>
        <div className="space-y-2">
          {targets.map((t, i) => {
            const needsAreaCode =
              (t.role === "TM" || t.role === "RM" || t.role === "ZM") && !t.areaCode?.trim();
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(t)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-left text-slate-800 hover:bg-amber-50 hover:border-amber-200 transition-colors flex items-center justify-between gap-2"
              >
                <span className="font-medium">
                  {t.label || `${t.role} – ${t.mobile}`}
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  {needsAreaCode && (
                    <span
                      className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"
                      title="Add area code in Admin for this target"
                    >
                      Needs area code
                    </span>
                  )}
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {t.role}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
