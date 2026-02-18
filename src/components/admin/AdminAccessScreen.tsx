"use client";

import { useState, useEffect } from "react";
import {
  fetchHoMappingsFromApi,
  saveHoMappingsToApi,
  loadHoMappings,
  type HoMapping,
  type HoTarget,
} from "@/lib/ho-mappings";
import type { Role } from "@/lib/jwt-utils";

const ROLES: Role[] = ["TM", "RM", "ZM", "BU"];

function TargetRow({
  target,
  onChange,
  onRemove,
}: {
  target: HoTarget;
  onChange: (t: HoTarget) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
      <input
        type="text"
        placeholder="Target mobile"
        value={target.mobile}
        onChange={(e) => onChange({ ...target, mobile: e.target.value })}
        className="border border-slate-300 rounded px-2 py-1.5 text-sm w-32"
      />
      <select
        value={target.role}
        onChange={(e) => onChange({ ...target, role: e.target.value as Role })}
        className="border border-slate-300 rounded px-2 py-1.5 text-sm w-20"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Label (optional)"
        value={target.label ?? ""}
        onChange={(e) => onChange({ ...target, label: e.target.value || undefined })}
        className="border border-slate-300 rounded px-2 py-1.5 text-sm flex-1 min-w-24"
      />
      <input
        type="text"
        placeholder="Area code"
        value={target.areaCode ?? ""}
        onChange={(e) => onChange({ ...target, areaCode: e.target.value || undefined })}
        className="border border-slate-300 rounded px-2 py-1.5 text-sm w-32"
        title="Required for WhatsApp direct link (e.g. 721 or MADHYA PRADESH)"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-red-600 hover:text-red-700 text-sm font-medium"
      >
        Remove
      </button>
    </div>
  );
}

function MappingCard({
  mapping,
  onChange,
  onRemove,
}: {
  mapping: HoMapping;
  onChange: (m: HoMapping) => void;
  onRemove: () => void;
}) {
  const addTarget = () => {
    onChange({
      ...mapping,
      targets: [...mapping.targets, { mobile: "", role: "TM", areaCode: undefined }],
    });
  };

  const updateTarget = (i: number, t: HoTarget) => {
    const next = [...mapping.targets];
    next[i] = t;
    onChange({ ...mapping, targets: next });
  };

  const removeTarget = (i: number) => {
    onChange({
      ...mapping,
      targets: mapping.targets.filter((_, j) => j !== i),
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-xs text-slate-500">Mobile Number</span>
          <input
            type="text"
            placeholder="e.g. 9876543210"
            value={mapping.hoMobile}
            onChange={(e) => onChange({ ...mapping, hoMobile: e.target.value })}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 text-sm font-medium shrink-0"
        >
          Remove HO
        </button>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">HO Leader&apos;s Name</span>
        <input
          type="text"
          placeholder="e.g. John Doe"
          value={mapping.hoLeaderName ?? ""}
          onChange={(e) => onChange({ ...mapping, hoLeaderName: e.target.value || undefined })}
          className="border border-slate-300 rounded px-2 py-1.5 text-sm"
        />
      </label>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">Targets (users this HO can view)</span>
          <button
            type="button"
            onClick={addTarget}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            + Add target
          </button>
        </div>
        <div className="space-y-2">
          {mapping.targets.map((t, i) => (
            <TargetRow
              key={i}
              target={t}
              onChange={(t) => updateTarget(i, t)}
              onRemove={() => removeTarget(i)}
            />
          ))}
          {mapping.targets.length === 0 && (
            <p className="text-xs text-slate-400 italic">No targets. Add at least one.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminAccessScreen() {
  const [mappings, setMappings] = useState<HoMapping[]>(() => loadHoMappings());
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    fetchHoMappingsFromApi().then((m) => setMappings(m.length > 0 ? m : loadHoMappings()));
  }, []);

  const handleSave = async () => {
    setSaveError(false);
    const ok = await saveHoMappingsToApi(mappings);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setSaveError(true);
    }
  };

  const addMapping = () => {
    setMappings([...mappings, { hoMobile: "", hoLeaderName: undefined, targets: [] }]);
  };

  const updateMapping = (i: number, m: HoMapping) => {
    const next = [...mappings];
    next[i] = m;
    setMappings(next);
  };

  const removeMapping = (i: number) => {
    setMappings(mappings.filter((_, j) => j !== i));
  };

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex-1 overflow-auto px-4 py-4 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">HO User Mappings</h2>
          <p className="text-xs text-slate-500 mb-4">
            HO users can view scorecards of mapped targets. Add mobile, HO leader&apos;s name,
            and targets (mobile, role, label, area code). Area code is required for WhatsApp direct links.
          </p>
          <div className="space-y-4">
            {mappings.map((m, i) => (
              <MappingCard
                key={i}
                mapping={m}
                onChange={(m) => updateMapping(i, m)}
                onRemove={() => removeMapping(i)}
              />
            ))}
            <button
              type="button"
              onClick={addMapping}
              className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-slate-700 hover:border-slate-400 text-sm font-medium"
            >
              + Add HO user
            </button>
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
