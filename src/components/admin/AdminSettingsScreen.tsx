"use client";

import { useState, useEffect } from "react";
import {
  getAppConfig,
  saveConfig,
  resetAppConfig,
  loadConfigFromStorage,
  getDefaultConfig,
  type AppConfig,
} from "@/lib/app-config";
import { AdminAccessScreen } from "./AdminAccessScreen";

type AdminTab = "settings" | "access";

export function AdminSettingsScreen() {
  const [tab, setTab] = useState<AdminTab>("settings");
  const [config, setConfig] = useState<AppConfig>(() => getAppConfig());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfigFromStorage();
    setConfig({ ...getAppConfig() });
  }, []);

  const handleSave = () => {
    saveConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaults = getDefaultConfig();
    resetAppConfig();
    saveConfig(defaults);
    setConfig(defaults);
  };

  if (tab === "access") {
    return (
      <div className="flex flex-col min-h-dvh">
        <header className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-slate-800">Admin</h1>
            <a href="/" className="text-sm text-amber-700 hover:text-amber-800 font-medium">
              Exit admin
            </a>
          </div>
          <nav className="flex gap-1">
            <button
              type="button"
              onClick={() => setTab("settings")}
              className="px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-amber-100"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => setTab("access")}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-amber-200 text-amber-900"
            >
              Access
            </button>
          </nav>
        </header>
        <div className="flex-1 min-h-0 flex flex-col">
          <AdminAccessScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-slate-800">Admin</h1>
          <a href="/" className="text-sm text-amber-700 hover:text-amber-800 font-medium">
            Exit admin
          </a>
        </div>
        <nav className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab("settings")}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-amber-200 text-amber-900"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={() => setTab("access")}
            className="px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-amber-100"
          >
            Access
          </button>
        </nav>
      </header>
      <div className="flex-1 overflow-auto px-4 py-4 space-y-6">
        {/* Score bands */}
        <section className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Score Bands</h2>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">redEnd</span>
              <input
                type="number"
                value={config.scoreBandThresholds.redEnd}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    scoreBandThresholds: {
                      ...config.scoreBandThresholds,
                      redEnd: Number(e.target.value) || 80,
                    },
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">amberEnd</span>
              <input
                type="number"
                value={config.scoreBandThresholds.amberEnd}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    scoreBandThresholds: {
                      ...config.scoreBandThresholds,
                      amberEnd: Number(e.target.value) || 90,
                    },
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">maxScore</span>
              <input
                type="number"
                value={config.maxScore}
                onChange={(e) =>
                  setConfig({ ...config, maxScore: Number(e.target.value) || 120 })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </section>

        {/* Growth bands */}
        <section className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Growth Bands</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">greenAbove (%)</span>
              <input
                type="number"
                value={config.growthBandThresholds.greenAbove}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    growthBandThresholds: {
                      ...config.growthBandThresholds,
                      greenAbove: Number(e.target.value) ?? 5,
                    },
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">amberAbove (%)</span>
              <input
                type="number"
                value={config.growthBandThresholds.amberAbove}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    growthBandThresholds: {
                      ...config.growthBandThresholds,
                      amberAbove: Number(e.target.value) ?? 0,
                    },
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </section>

        {/* KPI weights */}
        <section className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">KPI Weights</h2>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">productMix</span>
              <input
                type="number"
                value={config.kpiWeights.productMix}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    kpiWeights: {
                      ...config.kpiWeights,
                      productMix: Number(e.target.value) || 34,
                    },
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">overdue</span>
              <input
                type="number"
                value={config.kpiWeights.overdue}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    kpiWeights: {
                      ...config.kpiWeights,
                      overdue: Number(e.target.value) || 33,
                    },
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">dso</span>
              <input
                type="number"
                value={config.kpiWeights.dso}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    kpiWeights: {
                      ...config.kpiWeights,
                      dso: Number(e.target.value) || 33,
                    },
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </section>

        {/* Product mix thresholds */}
        <section className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Product Mix</h2>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">helpThreshold</span>
              <input
                type="number"
                step="0.01"
                value={config.productMixHelpThreshold}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    productMixHelpThreshold: Number(e.target.value) ?? 0.65,
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">badgeGreenRatio</span>
              <input
                type="number"
                step="0.1"
                value={config.productMixBadgeGreenRatio}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    productMixBadgeGreenRatio: Number(e.target.value) ?? 1,
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">badgeAmberRatio</span>
              <input
                type="number"
                step="0.1"
                value={config.productMixBadgeAmberRatio}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    productMixBadgeAmberRatio: Number(e.target.value) ?? 0.8,
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </section>

        {/* Overdue badge */}
        <section className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Overdue Badge Thresholds</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">greenAbove</span>
              <input
                type="number"
                value={config.overdueBadgeGreenAbove}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    overdueBadgeGreenAbove: Number(e.target.value) ?? 33,
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">amberAbove</span>
              <input
                type="number"
                value={config.overdueBadgeAmberAbove}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    overdueBadgeAmberAbove: Number(e.target.value) ?? 27,
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </section>

        {/* Recommended actions */}
        <section className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Recommended Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">min</span>
              <input
                type="number"
                value={config.recommendedActionsMin}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    recommendedActionsMin: Number(e.target.value) ?? 3,
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">max</span>
              <input
                type="number"
                value={config.recommendedActionsMax}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    recommendedActionsMax: Number(e.target.value) ?? 5,
                  })
                }
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </section>

        {/* Overdue bucket penalties */}
        <section className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Overdue Bucket Penalties (%)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              ["notDue", "d1_110", "d111_180", "d181_270", "d271_365", "gt365"] as const
            ).map((key) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">{key}</span>
                <input
                  type="number"
                  value={config.overdueBucketPenalties[key]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      overdueBucketPenalties: {
                        ...config.overdueBucketPenalties,
                        [key]: Number(e.target.value) ?? 0,
                      },
                    })
                  }
                  className="border border-slate-300 rounded px-2 py-1.5 text-sm"
                />
              </label>
            ))}
          </div>
        </section>

        {/* DSO bands factors */}
        <section className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">DSO Bands (factor)</h2>
          <div className="space-y-2">
            {config.dsoBands.map((band, i) => (
              <div key={band.id} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-16 shrink-0">{band.shortLabel}</span>
                <input
                  type="number"
                  step="0.1"
                  value={band.factor}
                  onChange={(e) => {
                    const next = [...config.dsoBands];
                    next[i] = { ...band, factor: Number(e.target.value) ?? band.factor };
                    setConfig({ ...config, dsoBands: next });
                  }}
                  className="border border-slate-300 rounded px-2 py-1.5 text-sm w-20"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="shrink-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg"
        >
          Reset to defaults
        </button>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-sm text-emerald-600 font-medium">Saved</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
          >
            Save
          </button>
        </div>
      </footer>
    </div>
  );
}
