"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { genId, sortSizeValues } from "@/lib/options";
import type { OptionValueMeta } from "@/lib/options";

const TYPES = [
  { value: "TEXT", label: "Text", desc: "Material, Style, Fit…" },
  { value: "COLOUR", label: "Colour", desc: "Black, Red, Blue…" },
  { value: "SIZE", label: "Size", desc: "XS, S, M, L, XL…" },
  { value: "NUMBER", label: "Number", desc: "250g, 500ml, 1kg…" },
  { value: "BOOLEAN", label: "Yes/No", desc: "Customisable, Gift wrap…" },
];

type OptionType = {
  id: string;
  name: string;
  type: string;
  values_json: OptionValueMeta[];
  position: number;
};

export function OptionTypeManager({
  initialOptionTypes,
}: {
  initialOptionTypes: OptionType[];
}) {
  const router = useRouter();
  const [types, setTypes] = useState(initialOptionTypes);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── New option type form state ────────────────────────────
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("TEXT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!newName.trim()) return;
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        type: newType,
        values_json: [],
        position: types.length,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }

    setTypes((prev) => [...prev, { ...data, values_json: [] }]);
    setNewName("");
    setNewType("TEXT");
    setCreating(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Delete this option type? Products using it will lose this option.",
      )
    )
      return;
    const res = await fetch(`/api/admin/options/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTypes((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {/* Existing option types */}
      {types.map((ot) => (
        <OptionTypeCard
          key={ot.id}
          optionType={ot}
          isEditing={editingId === ot.id}
          onEdit={() => setEditingId(editingId === ot.id ? null : ot.id)}
          onDelete={() => handleDelete(ot.id)}
          onUpdate={(updated) => {
            setTypes((prev) => prev.map((t) => (t.id === ot.id ? updated : t)));
            setEditingId(null);
            router.refresh();
          }}
        />
      ))}

      {/* Create new */}
      {creating ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">New Option Type</h3>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Name
              </label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="e.g. Color"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} — {t.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={saving || !newName.trim()}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Option Type"}
            </button>
            <button
              onClick={() => {
                setCreating(false);
                setNewName("");
                setError("");
              }}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors font-medium"
        >
          + Add Option Type
        </button>
      )}
    </div>
  );
}

// ── Individual Option Type Card ────────────────────────────
function OptionTypeCard({
  optionType,
  isEditing,
  onEdit,
  onDelete,
  onUpdate,
}: {
  optionType: OptionType;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updated: OptionType) => void;
}) {
  const [values, setValues] = useState<OptionValueMeta[]>(
    optionType.values_json,
  );
  const [newVal, setNewVal] = useState("");
  const [newHex, setNewHex] = useState("#000000");
  const [saving, setSaving] = useState(false);

  const isColour = optionType.type === "COLOUR";
  const isSize = optionType.type === "SIZE";
  const isBoolean = optionType.type === "BOOLEAN";

  function addValue() {
    if (!newVal.trim() && !isBoolean) return;
    const label = isBoolean
      ? values.length === 0
        ? "Yes"
        : "No"
      : newVal.trim();
    if (values.find((v) => v.label.toLowerCase() === label.toLowerCase()))
      return;

    const newValue: OptionValueMeta = {
      id: genId(),
      label,
      ...(isColour ? { hex: newHex } : {}),
    };

    let updated = [...values, newValue];
    if (isSize) updated = sortSizeValues(updated);

    setValues(updated);
    setNewVal("");
    setNewHex("#000000");
  }

  function removeValue(id: string) {
    setValues((prev) => prev.filter((v) => v.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/options/${optionType.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values_json: values }),
    });
    setSaving(false);
    if (res.ok) {
      onUpdate({ ...optionType, values_json: values });
    }
  }

  const TYPE_BADGE: Record<string, string> = {
    TEXT: "bg-gray-100 text-gray-600",
    COLOUR: "bg-pink-100 text-pink-700",
    SIZE: "bg-blue-100 text-blue-700",
    NUMBER: "bg-amber-100 text-amber-700",
    BOOLEAN: "bg-green-100 text-green-700",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800">{optionType.name}</p>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[optionType.type] ?? "bg-gray-100 text-gray-600"}`}
              >
                {optionType.type}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {optionType.values_json.length} values
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {isEditing ? "Done" : "Edit values"}
          </button>
          <button
            onClick={onDelete}
            className="text-sm text-red-400 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Values preview (collapsed) */}
      {!isEditing && (
        <div className="px-6 py-3 flex flex-wrap gap-2">
          {optionType.values_json.length === 0 ? (
            <p className="text-sm text-gray-400">
              No values yet — click Edit values
            </p>
          ) : (
            optionType.values_json.map((v) => (
              <span
                key={v.id}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-sm text-gray-700"
              >
                {isColour && v.hex && (
                  <span
                    className="w-3 h-3 rounded-full border border-gray-200 shrink-0"
                    style={{ backgroundColor: v.hex }}
                  />
                )}
                {v.label}
              </span>
            ))
          )}
        </div>
      )}

      {/* Values editor (expanded) */}
      {isEditing && (
        <div className="px-6 py-4 space-y-4">
          {/* Current values */}
          <div className="flex flex-wrap gap-2">
            {values.map((v) => (
              <span
                key={v.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm"
              >
                {isColour && v.hex && (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                    style={{ backgroundColor: v.hex }}
                  />
                )}
                {v.label}
                <button
                  onClick={() => removeValue(v.id)}
                  className="text-gray-300 hover:text-red-400 ml-0.5 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add value input */}
          {!isBoolean && (
            <div className="flex gap-2">
              {isColour && (
                <input
                  type="color"
                  value={newHex}
                  onChange={(e) => setNewHex(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 shrink-0"
                />
              )}
              <input
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addValue()}
                placeholder={
                  isColour
                    ? "Color name (e.g. Black)"
                    : isSize
                      ? "Size (e.g. XL)"
                      : isBoolean
                        ? "Value (Yes/No)"
                        : "Value"
                }
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <button
                onClick={addValue}
                disabled={!newVal.trim()}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          )}

          {isBoolean && values.length < 2 && (
            <button
              onClick={addValue}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add {values.length === 0 ? "Yes" : "No"} value
            </button>
          )}

          {/* Size preset helper */}
          {isSize && (
            <div className="flex flex-wrap gap-1.5">
              <p className="w-full text-xs text-gray-400">Quick add:</p>
              {["XS", "S", "M", "L", "XL", "XXL"]
                .filter((s) => !values.find((v) => v.label === s))
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      const nv: OptionValueMeta = { id: genId(), label: s };
                      setValues((prev) => sortSizeValues([...prev, nv]));
                    }}
                    className="px-2.5 py-1 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                  >
                    {s}
                  </button>
                ))}
            </div>
          )}

          {/* Save */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Values"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
