"use client";

import { useState, useEffect } from "react";
import {
  fetchAccessConfigFromApi,
  saveAccessConfigToApi,
  type AccessConfig,
} from "@/lib/access-config";

export function AdminConfigurationScreen() {
  const [config, setConfig] = useState<AccessConfig>({
    allowUrlAccess: true,
    allowTokenAccess: true,
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    fetchAccessConfigFromApi().then(setConfig);
  }, []);

  const handleSave = async () => {
    setSaveError(false);
    const ok = await saveAccessConfigToApi(config);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setSaveError(true);
    }
  };

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex-1 overflow-auto px-4 py-4 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Access Methods</h2>
          <p className="text-xs text-slate-500 mb-4">
            Control how users can access the scorecard. Disable URL access to block links like
            <code className="mx-1 px-1 bg-slate-100 rounded text-slate-600">?mobile=...&amp;role=TM</code>.
            Disable Token access to block links like
            <code className="mx-1 px-1 bg-slate-100 rounded text-slate-600">?token=&lt;JWT&gt;</code>.
          </p>
          <div className="space-y-4 rounded-lg border border-slate-200 p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowUrlAccess}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, allowUrlAccess: e.target.checked }))
                }
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Allow URL access
              </span>
            </label>
            <p className="text-xs text-slate-500 ml-7">
              Enables access via <code className="bg-slate-100 px-1 rounded">?mobile=...&amp;role=TM|RM|ZM|BU</code>
            </p>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowTokenAccess}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, allowTokenAccess: e.target.checked }))
                }
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Allow Token access
              </span>
            </label>
            <p className="text-xs text-slate-500 ml-7">
              Enables access via <code className="bg-slate-100 px-1 rounded">?token=&lt;JWT&gt;</code> (e.g. from WhatsApp bot)
            </p>
          </div>
        </section>
      </div>
      <footer className="shrink-0 bg-white border-t border-slate-200 px-4 py-3">
        <div className="flex justify-end gap-2">
          {saveError && (
            <span className="text-sm text-red-600 self-center">Save failed. Check network.</span>
          )}
          {saved && (
            <span className="text-sm text-emerald-600 font-medium self-center">Saved</span>
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
