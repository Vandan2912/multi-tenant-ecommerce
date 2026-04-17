"use client";

import { useState } from "react";
import { PickerModal } from "./PickerModal";

type Product = { id: string; name: string };

export function ProductPickerModal({
  products,
  value,
  onChange,
}: {
  products: Product[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedProducts = products.filter((p) => value.includes(p.id));

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left bg-white hover:bg-gray-50"
      >
        {value.length === 0
          ? "Select products…"
          : `${value.length} product${value.length === 1 ? "" : "s"} selected`}
      </button>

      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedProducts.slice(0, 8).map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full"
            >
              {p.name}
              <button
                type="button"
                onClick={() => onChange(value.filter((id) => id !== p.id))}
                className="text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
          {selectedProducts.length > 8 && (
            <span className="text-xs text-gray-400 px-1 py-1">
              +{selectedProducts.length - 8} more
            </span>
          )}
        </div>
      )}

      <PickerModal
        open={open}
        title="Pick products"
        options={products}
        selected={value}
        onClose={() => setOpen(false)}
        onSave={onChange}
      />
    </div>
  );
}
