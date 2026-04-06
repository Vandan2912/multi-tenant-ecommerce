"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import {
  generateCombinations,
  variantNameFromOptions,
  sortSizeValues,
  type OptionTypeFull,
  type OptionValueMeta,
  type ProductOptionFull,
} from "@/lib/options";

type Category = { id: string; name: string; parent_id: string | null; parent?: { name: string } | null };
type Brand = { id: string; name: string };

type VariantRow = {
  id?: string;
  name: string;
  sku: string;
  price: string;
  discount_price: string;
  stock: string;
  unit: string;
  options_json: Record<string, string>;
  is_active: boolean;
  isNew?: boolean;
};

type Props = {
  categories: Category[];
  brands: Brand[];
  optionTypes: OptionTypeFull[];
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
    productOptions?: ProductOptionFull[];
  };
  mode: "create" | "edit";
};

const UNITS = ["piece", "kg", "g", "litre", "ml", "metre", "pair", "set", "box"];

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200";

export function ProductForm({ categories, brands, optionTypes, initialData, mode }: Props) {
  const router = useRouter();

  // ── Basic fields ─────────────────────────────────────────
  const [fields, setFields] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    category_id: initialData?.category_id ?? "",
    brand_id: initialData?.brand_id ?? "",
    images: initialData?.images ?? "",
    is_active: initialData?.is_active ?? true,
  });

  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    initialData?.specs ?? [{ key: "", value: "" }]
  );

  // ── Selected option types for this product ────────────────
  // Each entry: { optionTypeId, selectedValueIds[] }
  const [selectedOptions, setSelectedOptions] = useState<{ optionTypeId: string; selectedValueIds: string[] }[]
  >(
    initialData?.productOptions?.map((po) => ({
      optionTypeId: po.option_type_id,
      selectedValueIds: po.selected_values_json as string[],
    })) ?? []
  );

  // ── Variants ──────────────────────────────────────────────
  const [variants, setVariants] = useState<VariantRow[]>(
    initialData?.variants ?? []
  );

  // ── UI state ──────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "options" | "variants" | "specs">("basic");

  function setField(key: string, value: string | boolean) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  // ── Spec helpers ─────────────────────────────────────────
  function setSpec(i: number, part: "key" | "value", val: string) {
    setSpecs((p) => p.map((s, idx) => idx === i ? { ...s, [part]: val } : s));
  }

  // ── Option selection helpers ──────────────────────────────
  function isOptionSelected(optionTypeId: string) {
    return selectedOptions.some((o) => o.optionTypeId === optionTypeId);
  }

  function toggleOption(optionTypeId: string) {
    if (isOptionSelected(optionTypeId)) {
      setSelectedOptions((prev) => prev.filter((o) => o.optionTypeId !== optionTypeId));
    } else {
      setSelectedOptions((prev) => [...prev, { optionTypeId, selectedValueIds: [] }]);
    }
  }

  function toggleValueSelection(optionTypeId: string, valueId: string) {
    setSelectedOptions((prev) =>
      prev.map((o) => {
        if (o.optionTypeId !== optionTypeId) return o;
        const has = o.selectedValueIds.includes(valueId);
        return {
          ...o,
          selectedValueIds: has
            ? o.selectedValueIds.filter((id) => id !== valueId)
            : [...o.selectedValueIds, valueId],
        };
      })
    );
  }

  function selectAllValues(optionTypeId: string) {
    const ot = optionTypes.find((o) => o.id === optionTypeId);
    if (!ot) return;
    setSelectedOptions((prev) =>
      prev.map((o) =>
        o.optionTypeId === optionTypeId
          ? { ...o, selectedValueIds: ot.values_json.map((v) => v.id) }
          : o
      )
    );
  }

  // ── Generate variants from selected options ───────────────
  const generateVariants = useCallback(() => {
    const activeOptions = selectedOptions
      .map((sel) => {
        const ot = optionTypes.find((o) => o.id === sel.optionTypeId);
        if (!ot) return null;
        const selectedValues = ot.values_json.filter((v) =>
          sel.selectedValueIds.includes(v.id)
        );
        // Sort sizes correctly
        const sorted = ot.type === "SIZE" ? sortSizeValues(selectedValues) : selectedValues;
        return { optionType: ot, selectedValues: sorted };
      })
      .filter(Boolean) as { optionType: OptionTypeFull; selectedValues: OptionValueMeta[] }[];

    if (activeOptions.length === 0 || activeOptions.some((o) => o.selectedValues.length === 0)) {
      return;
    }

    const combos = generateCombinations(activeOptions);
    const existing = new Map(variants.map((v) => [JSON.stringify(v.options_json), v]));

    const newVariants: VariantRow[] = combos.map((combo) => {
      const key = JSON.stringify(combo);
      const exiting = existing.get(key);

      if (exiting) return exiting; // preserve existing data — soft approach

      // Brand new combination
      return {
        name: variantNameFromOptions(combo),
        sku: "",
        price: variants[0]?.price ?? "",  // inherit first variant price
        discount_price: variants[0]?.discount_price ?? "",
        stock: "0",
        unit: "piece",
        options_json: combo,
        is_active: true,
        isNew: true,
      };
    });

    setVariants(newVariants);
    setActiveTab("variants");
  }, [selectedOptions, optionTypes, variants]);

  // ── Variant field helpers ─────────────────────────────────
  function setVariant(i: number, key: keyof VariantRow, val: unknown) {
    setVariants((prev) =>
      prev.map((v, idx) => idx === i ? { ...v, [key]: val } : v)
    );
  }

  // ── Bulk apply within group ───────────────────────────────
  // Group = same value for the FIRST option dimension (e.g. same Size)
  function bulkApplyToGroup(
    sourceIdx: number,
    field: "price" | "discount_price" | "unit"
  ) {
    const source = variants[sourceIdx];
    const firstKey = Object.keys(source.options_json)[0];
    const firstVal = source.options_json[firstKey];

    setVariants((prev) =>
      prev.map((v) => {
        if (v.options_json[firstKey] !== firstVal) return v;
        return { ...v, [field]: source[field] };
      })
    );
  }

  function bulkApplyAll(
    sourceIdx: number,
    field: "price" | "discount_price" | "unit"
  ) {
    const source = variants[sourceIdx];
    setVariants((prev) => prev.map((v) => ({ ...v, [field]: source[field] })));
  }

  // ── Group variants by first option dimension ──────────────
  function getGroups(): { groupKey: string; groupVal: string; rows: { variant: VariantRow; idx: number }[] }[] {
    if (variants.length === 0) return [];

    const firstKey = Object.keys(variants[0].options_json)[0];
    if (!firstKey) return [{ groupKey: "", groupVal: "Default", rows: variants.map((v, idx) => ({ variant: v, idx })) }];

    const groupMap = new Map<string, { variant: VariantRow; idx: number }[]>();
    variants.forEach((v, idx) => {
      const gv = v.options_json[firstKey] ?? "Default";
      if (!groupMap.has(gv)) groupMap.set(gv, []);
      groupMap.get(gv)!.push({ variant: v, idx });
    });

    return Array.from(groupMap.entries()).map(([groupVal, rows]) => ({
      groupKey: firstKey,
      groupVal,
      rows,
    }));
  }

  // ── Submit ───────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (variants.length === 0) {
      setError("Add at least one variant before saving");
      setActiveTab("variants");
      return;
    }
    setLoading(true);
    setError("");

    const payload = {
      name: fields.name,
      description: fields.description || null,
      category_id: fields.category_id || null,
      brand_id: fields.brand_id || null,
      images: fields.images
        ? fields.images.split("\n").map((s) => s.trim()).filter(Boolean)
        : [],
      specs_json: Object.fromEntries(
        specs.filter((s) => s.key && s.value).map((s) => [s.key, s.value])
      ),
      is_active: fields.is_active,
      productOptions: selectedOptions.map((o, i) => ({
        option_type_id: o.optionTypeId,
        selected_values_json: o.selectedValueIds,
        position: i,
      })),
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku || null,
        price: parseFloat(v.price) || 0,
        discount_price: v.discount_price ? parseFloat(v.discount_price) : null,
        stock: parseInt(v.stock) || 0,
        unit: v.unit || "piece",
        options_json: v.options_json,
        is_active: v.is_active,
      })),
    };

    const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${initialData?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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

  // ── Derived ──────────────────────────────────────────────
  const roots = categories.filter((c) => !c.parent_id);
  const children = (pid: string) => categories.filter((c) => c.parent_id === pid);
  const groups = getGroups();

  const selectedOptCount = selectedOptions.reduce(
    (s, o) => s + o.selectedValueIds.length, 0
  );
  const possibleCombos = selectedOptions.reduce(
    (product, o) => product * (o.selectedValueIds.length || 1), 1
  );

  const TABS = [
    { key: "basic", label: "Basic Info" },
    { key: "options", label: `Options${selectedOptions.length > 0 ? ` (${selectedOptions.length})` : ""}` },
    { key: "variants", label: `Variants${variants.length > 0 ? ` (${variants.length})` : ""}` },
    { key: "specs", label: "Specifications" },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Basic Info ──────────────────────────────── */}
      {activeTab === "basic" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Product Name *
            </label>
            <input required value={fields.name}
              onChange={(e) => setField("name", e.target.value)}
              className={inputCls} placeholder="e.g. Oxford Cotton Shirt" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Description
            </label>
            <textarea rows={3} value={fields.description}
              onChange={(e) => setField("description", e.target.value)}
              className={inputCls} placeholder="Describe your product..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Category
              </label>
              <select value={fields.category_id}
                onChange={(e) => setField("category_id", e.target.value)}
                className={inputCls}>
                <option value="">No category</option>
                {roots.map((root) => (
                  <optgroup key={root.id} label={root.name}>
                    <option value={root.id}>{root.name} (all)</option>
                    {children(root.id).map((sub) => (
                      <option key={sub.id} value={sub.id}>↳ {sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Brand
              </label>
              <select value={fields.brand_id}
                onChange={(e) => setField("brand_id", e.target.value)}
                className={inputCls}>
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Product Images
            </label>
            <ImageUploader
              value={fields.images}
              onChange={(val) => setField("images", val)}
            />
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Visible in store</p>
              <p className="text-xs text-gray-400">Toggle off to hide from customers</p>
            </div>
            <button type="button"
              onClick={() => setField("is_active", !fields.is_active)}
              className={`w-11 h-6 rounded-full transition-colors relative ${fields.is_active ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${fields.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Options ─────────────────────────────────── */}
      {activeTab === "options" && (
        <div className="space-y-4">
          {optionTypes.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400">
              <p className="text-3xl mb-3">🎛️</p>
              <p className="font-medium">No option types defined yet</p>
              <a href="/admin/options"
                className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                Go to Options → Create Color, Size, Material
              </a>
            </div>
          ) : (
            <>
              {optionTypes.map((ot) => {
                const sel = selectedOptions.find((o) => o.optionTypeId === ot.id);
                const isEnabled = !!sel;
                const isColour = ot.type === "COLOUR";

                const TYPE_BADGE: Record<string, string> = {
                  TEXT: "bg-gray-100 text-gray-600",
                  COLOUR: "bg-pink-100 text-pink-700",
                  SIZE: "bg-blue-100 text-blue-700",
                  NUMBER: "bg-amber-100 text-amber-700",
                  BOOLEAN: "bg-green-100 text-green-700",
                };

                return (
                  <div key={ot.id}
                    className={`bg-white border-2 rounded-2xl overflow-hidden transition-colors ${isEnabled ? "border-gray-900" : "border-gray-100"
                      }`}>
                    {/* Option type header */}
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleOption(ot.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isEnabled ? "bg-gray-900 border-gray-900" : "border-gray-300"
                            }`}
                        >
                          {isEnabled && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800">{ot.name}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[ot.type] ?? "bg-gray-100"}`}>
                              {ot.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {ot.values_json.length} values available
                          </p>
                        </div>
                      </div>
                      {isEnabled && (
                        <button type="button"
                          onClick={() => selectAllValues(ot.id)}
                          className="text-xs text-blue-600 hover:underline">
                          Select all
                        </button>
                      )}
                    </div>

                    {/* Value picker */}
                    {isEnabled && (
                      <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                        {ot.values_json.length === 0 ? (
                          <p className="text-sm text-gray-400">
                            No values in this option type.{" "}
                            <a href="/admin/options" className="text-blue-600 hover:underline">
                              Add values →
                            </a>
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {ot.values_json.map((v) => {
                              const checked = sel?.selectedValueIds.includes(v.id) ?? false;
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => toggleValueSelection(ot.id, v.id)}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${checked
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                                    }`}
                                >
                                  {isColour && v.hex && (
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                                      style={{ backgroundColor: v.hex }}
                                    />
                                  )}
                                  {v.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Generate button */}
              {selectedOptions.length > 0 && selectedOptCount > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {possibleCombos} variant{possibleCombos !== 1 ? "s" : ""} will be generated
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {selectedOptions
                          .map((o) => {
                            const ot = optionTypes.find((t) => t.id === o.optionTypeId);
                            return `${o.selectedValueIds.length} ${ot?.name ?? ""}`;
                          })
                          .join(" × ")}
                        {" "}= {possibleCombos}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={generateVariants}
                      className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800"
                    >
                      Generate Variants →
                    </button>
                  </div>
                  {variants.length > 0 && (
                    <p className="text-xs text-amber-600 mt-3 bg-amber-50 rounded-lg px-3 py-2">
                      ⚠ Existing variants with matching options will be preserved. New combinations will be added.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Tab: Variants ────────────────────────────────── */}
      {activeTab === "variants" && (
        <div className="space-y-4">
          {variants.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400">
              <p className="text-3xl mb-3">📦</p>
              <p className="font-medium">No variants yet</p>
              <p className="text-sm mt-1">Go to Options tab, select values, then click Generate Variants</p>
              <button type="button" onClick={() => setActiveTab("options")}
                className="mt-4 text-sm text-blue-600 hover:underline">
                Go to Options →
              </button>
            </div>
          ) : (
            <>
              {/* Grouped variant table */}
              {groups.map((group) => (
                <div key={group.groupVal}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  {/* Group header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      {group.groupKey && (
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {group.groupKey}:
                        </span>
                      )}
                      <span className="font-semibold text-gray-800">{group.groupVal}</span>
                      <span className="text-xs text-gray-400">
                        ({group.rows.length} variant{group.rows.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                    {/* Bulk apply for group */}
                    {group.rows.length > 1 && (
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Apply first row to group:</span>
                        {(["price", "discount_price", "unit"] as const).map((field) => (
                          <button key={field} type="button"
                            onClick={() => bulkApplyToGroup(group.rows[0].idx, field)}
                            className="text-blue-600 hover:underline capitalize">
                            {field === "discount_price" ? "sale price" : field}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Variant rows */}
                  <div className="divide-y divide-gray-50">
                    {group.rows.map(({ variant: v, idx }) => (
                      <div key={idx} className="px-5 py-4">
                        {/* Variant name + options display */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {Object.entries(v.options_json).map(([key, val]) => {
                              // Find colour hex if applicable
                              const ot = optionTypes.find((o) => o.name === key);
                              const ov = ot?.values_json.find((vv) => vv.label === val);
                              const hex = ot?.type === "COLOUR" ? ov?.hex : null;
                              return (
                                <span key={key}
                                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                  {hex && (
                                    <span className="w-3 h-3 rounded-full border border-gray-300"
                                      style={{ backgroundColor: hex }} />
                                  )}
                                  {val}
                                </span>
                              );
                            })}
                            {v.isNew && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                New
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                              <button type="button"
                                onClick={() => setVariant(idx, "is_active", !v.is_active)}
                                className={`w-8 h-4 rounded-full relative transition-colors ${v.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                                <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${v.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                              </button>
                              Active
                            </label>
                          </div>
                        </div>

                        {/* Price + Stock + SKU + Unit */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Price (₹) *</label>
                            <div className="relative">
                              <input required type="number" min="0" step="0.01"
                                value={v.price}
                                onChange={(e) => setVariant(idx, "price", e.target.value)}
                                className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Sale Price (₹)</label>
                            <div className="relative">
                              <input type="number" min="0" step="0.01"
                                value={v.discount_price}
                                onChange={(e) => setVariant(idx, "discount_price", e.target.value)}
                                className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                                placeholder="—" />
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Stock</label>
                            <input type="number" min="0"
                              value={v.stock}
                              onChange={(e) => setVariant(idx, "stock", e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Unit</label>
                            <select value={v.unit}
                              onChange={(e) => setVariant(idx, "unit", e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white">
                              {UNITS.map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* SKU */}
                        <div className="mt-3">
                          <input
                            value={v.sku}
                            onChange={(e) => setVariant(idx, "sku", e.target.value)}
                            placeholder="SKU (optional)"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bulk apply all */}
                  {variants.length > 1 && group.rows.length > 0 && (
                    <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500">
                      <span>Apply first row to ALL variants:</span>
                      {(["price", "discount_price"] as const).map((field) => (
                        <button key={field} type="button"
                          onClick={() => bulkApplyAll(group.rows[0].idx, field)}
                          className="text-blue-600 hover:underline capitalize">
                          {field === "discount_price" ? "sale price" : field}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Tab: Specifications ──────────────────────────── */}
      {activeTab === "specs" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">Specifications</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Technical details shown on the product page
              </p>
            </div>
            <button type="button"
              onClick={() => setSpecs((p) => [...p, { key: "", value: "" }])}
              className="text-sm text-blue-600 hover:underline">
              + Add row
            </button>
          </div>

          {specs.length === 0 && (
            <p className="text-sm text-gray-400">No specifications yet</p>
          )}

          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input value={spec.key}
                onChange={(e) => setSpec(i, "key", e.target.value)}
                placeholder="e.g. Material"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
              <input value={spec.value}
                onChange={(e) => setSpec(i, "value", e.target.value)}
                placeholder="e.g. 100% Cotton"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
              <button type="button"
                onClick={() => setSpecs((p) => p.filter((_, idx) => idx !== i))}
                className="text-gray-300 hover:text-red-400 px-2 text-xl leading-none">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors">
          {loading ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        {mode === "edit" && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="ml-auto px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm disabled:opacity-60">
            {deleting ? "Deleting..." : "Delete Product"}
          </button>
        )}
      </div>
    </form>
  );
}