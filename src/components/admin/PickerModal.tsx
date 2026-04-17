"use client";

import { useEffect, useMemo, useState } from "react";

type Option = { id: string; name: string };

export function PickerModal({
  open,
  title,
  options,
  selected,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  options: Option[];
  selected: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<string[]>(selected);

  useEffect(() => {
    if (open) {
      setDraft(selected);
      setQ("");
    }
  }, [open, selected]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return options;
    return options.filter((o) => o.name.toLowerCase().includes(term));
  }, [q, options]);

  if (!open) return null;

  function toggle(id: string) {
    setDraft((d) =>
      d.includes(id) ? d.filter((x) => x !== id) : [...d, id],
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {draft.length} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No matches</p>
          ) : (
            filtered.map((o) => {
              const checked = draft.includes(o.id);
              return (
                <label
                  key={o.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-50 ${
                    checked ? "bg-blue-50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(o.id)}
                  />
                  <span className="flex-1">{o.name}</span>
                </label>
              );
            })
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black"
          >
            Save ({draft.length})
          </button>
        </div>
      </div>
    </div>
  );
}
