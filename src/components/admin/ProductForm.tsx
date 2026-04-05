"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  parent?: { name: string } | null;
};
type Brand = { id: string; name: string };

type VariantRow = {
  id?: string;
  name: string;
  sku: string;
  price: string;
  discount_price: string;
  stock: string;
  unit: string;
  options: { key: string; value: string }[];
  is_active: boolean;
  _delete?: boolean;
};

type Props = {
  categories: Category[];
  brands: Brand[];
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    category_id?: string;
    brand_id?: string;
    images?: string;
    specs?: { key: string; value: string }[];
    is_active?: boolean;
    variants?: VariantRow[];
  };
  mode: "create" | "edit";
};

const EMPTY_VARIANT = (): VariantRow => ({
  name: "",
  sku: "",
  price: "",
  discount_price: "",
  stock: "0",
  unit: "piece",
  options: [{ key: "", value: "" }],
  is_active: true,
});

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200";

export function ProductForm({ categories, brands, initialData, mode }: Props) {
  const router = useRouter();

  const [fields, setFields] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    category_id: initialData?.category_id ?? "",
    brand_id: initialData?.brand_id ?? "",
    images: initialData?.images ?? "",
    is_active: initialData?.is_active ?? true,
  });

  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    initialData?.specs ?? [{ key: "", value: "" }],
  );

  const [variants, setVariants] = useState<VariantRow[]>(
    initialData?.variants?.length ? initialData.variants : [EMPTY_VARIANT()],
  );

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // ── Field helpers ────────────────────────────────────────
  function setField(key: string, value: string | boolean) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  // ── Spec helpers ─────────────────────────────────────────
  function setSpec(i: number, part: "key" | "value", val: string) {
    setSpecs((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [part]: val } : s)),
    );
  }
  function addSpec() {
    setSpecs((p) => [...p, { key: "", value: "" }]);
  }
  function removeSpec(i: number) {
    setSpecs((p) => p.filter((_, idx) => idx !== i));
  }

  // ── Variant helpers ──────────────────────────────────────
  function setVariant(i: number, key: keyof VariantRow, val: unknown) {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [key]: val } : v)),
    );
  }

  function setOption(
    vi: number,
    oi: number,
    part: "key" | "value",
    val: string,
  ) {
    setVariants((prev) =>
      prev.map((v, idx) => {
        if (idx !== vi) return v;
        const options = v.options.map((o, j) =>
          j === oi ? { ...o, [part]: val } : o,
        );
        return { ...v, options };
      }),
    );
  }

  function addOption(vi: number) {
    setVariants((prev) =>
      prev.map((v, idx) =>
        idx === vi
          ? { ...v, options: [...v.options, { key: "", value: "" }] }
          : v,
      ),
    );
  }

  function removeOption(vi: number, oi: number) {
    setVariants((prev) =>
      prev.map((v, idx) =>
        idx === vi
          ? { ...v, options: v.options.filter((_, j) => j !== oi) }
          : v,
      ),
    );
  }

  function addVariant() {
    setVariants((p) => [...p, EMPTY_VARIANT()]);
  }

  function removeVariant(i: number) {
    const v = variants[i];
    if (v.id) {
      // Mark for deletion on save
      setVariants((prev) =>
        prev.map((r, idx) => (idx === i ? { ...r, _delete: true } : r)),
      );
    } else {
      setVariants((prev) => prev.filter((_, idx) => idx !== i));
    }
  }

  // ── Submit ───────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name: fields.name,
      description: fields.description || null,
      category_id: fields.category_id || null,
      brand_id: fields.brand_id || null,
      images: fields.images
        ? fields.images
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      specs_json: Object.fromEntries(
        specs.filter((s) => s.key && s.value).map((s) => [s.key, s.value]),
      ),
      is_active: fields.is_active,
      variants: variants
        .filter((v) => !v._delete || v.id)
        .map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku || null,
          price: parseFloat(v.price) || 0,
          discount_price: parseFloat(v.discount_price) || null,
          stock: parseInt(v.stock) || 0,
          unit: v.unit || "piece",
          options_json: Object.fromEntries(
            v.options
              .filter((o) => o.key && o.value)
              .map((o) => [o.key, o.value]),
          ),
          is_active: v.is_active,
          _delete: v._delete ?? false,
        })),
    };

    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${initialData?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this product and all its variants?")) return;
    setDeleting(true);
    await fetch(`/api/admin/products/${initialData?.id}`, { method: "DELETE" });
    router.push("/admin/products");
    router.refresh();
  }

  // Top-level + subcategories grouped for select
  const roots = categories.filter((c) => !c.parent_id);
  const children = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  const visibleVariants = variants.filter((v) => !v._delete);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* ── Basic info ──────────────────────────────────── */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Basic Info</h2>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
            Product Name *
          </label>
          <input
            required
            value={fields.name}
            onChange={(e) => setField("name", e.target.value)}
            className={inputCls}
            placeholder="e.g. Sony WH-1000XM5"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
            Description
          </label>
          <textarea
            rows={3}
            value={fields.description}
            onChange={(e) => setField("description", e.target.value)}
            className={inputCls}
            placeholder="Describe your product..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Category
            </label>
            <select
              value={fields.category_id}
              onChange={(e) => setField("category_id", e.target.value)}
              className={inputCls}
            >
              <option value="">No category</option>
              {roots.map((root) => (
                <optgroup key={root.id} label={root.name}>
                  <option value={root.id}>{root.name} (all)</option>
                  {children(root.id).map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      ↳ {sub.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Brand
            </label>
            <select
              value={fields.brand_id}
              onChange={(e) => setField("brand_id", e.target.value)}
              className={inputCls}
            >
              <option value="">No brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
            Product Images
          </label>
          <ImageUploader
            value={fields.images}
            onChange={(val) => setField("images", val)}
          />
        </div>
        {/* <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
            Image URLs
          </label>
          <textarea
            rows={2}
            value={fields.images}
            onChange={(e) => setField("images", e.target.value)}
            className={`${inputCls} font-mono text-xs`}
            placeholder={
              "https://example.com/image1.jpg\nhttps://example.com/image2.jpg"
            }
          />
          <p className="text-xs text-gray-400 mt-1">One URL per line</p>
        </div> */}

        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Visible in store
            </p>
            <p className="text-xs text-gray-400">
              Toggle off to hide from customers
            </p>
          </div>
          <button
            type="button"
            onClick={() => setField("is_active", !fields.is_active)}
            className={`w-11 h-6 rounded-full transition-colors relative ${fields.is_active ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${fields.is_active ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      </section>

      {/* ── Specifications ───────────────────────────────── */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Specifications</h2>
          <button
            type="button"
            onClick={addSpec}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add row
          </button>
        </div>

        {specs.map((spec, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={spec.key}
              onChange={(e) => setSpec(i, "key", e.target.value)}
              placeholder="e.g. Material"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <input
              value={spec.value}
              onChange={(e) => setSpec(i, "value", e.target.value)}
              placeholder="e.g. Cotton"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <button
              type="button"
              onClick={() => removeSpec(i)}
              className="text-gray-300 hover:text-red-400 px-2 text-lg"
            >
              ×
            </button>
          </div>
        ))}

        {specs.length === 0 && (
          <p className="text-sm text-gray-400">No specifications added.</p>
        )}
      </section>

      {/* ── Variants ─────────────────────────────────────── */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Variants</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Each variant has its own price, stock and options (Size, Color,
              etc.)
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800"
          >
            + Add Variant
          </button>
        </div>

        {visibleVariants.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No variants yet — click &quot;Add Variant&quot; above
          </p>
        )}

        {variants.map((v, vi) => {
          if (v._delete) return null;
          return (
            <div
              key={vi}
              className="border border-gray-100 rounded-xl p-5 space-y-4 relative"
            >
              {/* Variant header */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-600">
                  Variant {visibleVariants.indexOf(v) + 1}
                  {v.name && ` — ${v.name}`}
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-gray-500">
                    <button
                      type="button"
                      onClick={() => setVariant(vi, "is_active", !v.is_active)}
                      className={`w-8 h-4 rounded-full relative transition-colors ${v.is_active ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${v.is_active ? "translate-x-4" : "translate-x-0.5"}`}
                      />
                    </button>
                    Active
                  </label>
                  {visibleVariants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(vi)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Name + SKU */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Variant Name *
                  </label>
                  <input
                    required
                    value={v.name}
                    onChange={(e) => setVariant(vi, "name", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Black / XL"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    SKU
                  </label>
                  <input
                    value={v.sku}
                    onChange={(e) => setVariant(vi, "sku", e.target.value)}
                    className={`${inputCls} font-mono`}
                    placeholder="e.g. PROD-BLK-XL"
                  />
                </div>
              </div>

              {/* Price + Discount + Stock + Unit */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.price}
                    onChange={(e) => setVariant(vi, "price", e.target.value)}
                    className={inputCls}
                    placeholder="999"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.discount_price}
                    onChange={(e) =>
                      setVariant(vi, "discount_price", e.target.value)
                    }
                    className={inputCls}
                    placeholder="—"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => setVariant(vi, "stock", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Unit
                  </label>
                  <select
                    value={v.unit}
                    onChange={(e) => setVariant(vi, "unit", e.target.value)}
                    className={inputCls}
                  >
                    {[
                      "piece",
                      "kg",
                      "g",
                      "litre",
                      "ml",
                      "metre",
                      "pair",
                      "set",
                      "box",
                    ].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500">
                    Options (Size, Color, etc.)
                  </label>
                  <button
                    type="button"
                    onClick={() => addOption(vi)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    + Add option
                  </button>
                </div>
                <div className="space-y-2">
                  {v.options.map((opt, oi) => (
                    <div key={oi} className="flex gap-2">
                      <input
                        value={opt.key}
                        onChange={(e) =>
                          setOption(vi, oi, "key", e.target.value)
                        }
                        placeholder="Option (e.g. Color)"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-200"
                      />
                      <input
                        value={opt.value}
                        onChange={(e) =>
                          setOption(vi, oi, "value", e.target.value)
                        }
                        placeholder="Value (e.g. Red)"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-200"
                      />
                      {v.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(vi, oi)}
                          className="text-gray-300 hover:text-red-400 px-1 text-base"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors"
        >
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete Product"}
          </button>
        )}
      </div>
    </form>
  );
}
