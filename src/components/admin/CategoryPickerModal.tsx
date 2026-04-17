"use client";

import { useState } from "react";
import { PickerModal } from "./PickerModal";

type Category = { id: string; name: string };

export function CategoryPickerModal({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = categories.filter((c) => value.includes(c.id));

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left bg-white hover:bg-gray-50"
      >
        {value.length === 0
          ? "Select categories…"
          : `${value.length} categor${value.length === 1 ? "y" : "ies"} selected`}
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full"
            >
              {c.name}
              <button
                type="button"
                onClick={() => onChange(value.filter((id) => id !== c.id))}
                className="text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <PickerModal
        open={open}
        title="Pick categories"
        options={categories}
        selected={value}
        onClose={() => setOpen(false)}
        onSave={onChange}
      />
    </div>
  );
}
