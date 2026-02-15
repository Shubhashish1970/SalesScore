"use client";

import type { HoTarget } from "@/lib/ho-mappings";

interface HoTargetSelectorProps {
  targets: HoTarget[];
  onSelect: (target: HoTarget) => void;
}

export function HoTargetSelector({ targets, onSelect }: HoTargetSelectorProps) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 max-w-lg mx-auto bg-slate-50">
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-lg font-semibold text-slate-800 mb-1">Select scorecard to view</h1>
        <p className="text-sm text-slate-500 mb-6">
          Choose a territory, region, zone, or BU to view its scorecard.
        </p>
        <div className="space-y-2">
          {targets.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(t)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-left text-slate-800 hover:bg-amber-50 hover:border-amber-200 transition-colors flex items-center justify-between"
            >
              <span className="font-medium">
                {t.label || `${t.role} – ${t.mobile}`}
              </span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {t.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
