"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generatePromoCode } from "@/lib/promo-utils";

type Promo = {
    id: string;
    code: string;
    description: string | null;
    discount_type: string;
    discount_value: number;
    minimum_order_value: number | null;
    maximum_discount: number | null;
    usage_limit: number | null;
    usage_limit_per_user: number | null;
    used_count: number;
    usageCount: number;
    start_date: string;
    expiry_date: string;
    is_active: boolean;
    applicable_products: string[];
    applicable_categories: string[];
    excluded_products: string[];
    stackable: boolean;
};

type Product = { id: string; name: string };
type Category = { id: string; name: string };

const EMPTY_FORM = {
    code: "",
    prefix: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    minimum_order_value: "",
    maximum_discount: "",
    usage_limit: "",
    usage_limit_per_user: "",
    start_date: "",
    expiry_date: "",
    is_active: true,
    applicable_products: [] as string[],
    applicable_categories: [] as string[],
    excluded_products: [] as string[],
    stackable: false,
};

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200";

export function PromoManager({
    initialPromos, products, categories,
}: {
    initialPromos: Promo[];
    products: Product[];
    categories: Category[];
}) {
    const router = useRouter();
    const [promos, setPromos] = useState(initialPromos);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    function setF(key: string, value: unknown) {
        setForm((f) => ({ ...f, [key]: value }));
        setError("");
    }

    function toggleMulti(key: "applicable_products" | "applicable_categories" | "excluded_products", id: string) {
        setForm((f) => {
            const arr = f[key] as string[];
            return { ...f, [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] };
        });
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError("");

        const res = await fetch("/api/admin/promos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                prefix: undefined,
                discount_value: parseFloat(form.discount_value) || 0,
                minimum_order_value: form.minimum_order_value ? parseFloat(form.minimum_order_value) : null,
                maximum_discount: form.maximum_discount ? parseFloat(form.maximum_discount) : null,
                usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
                usage_limit_per_user: form.usage_limit_per_user ? parseInt(form.usage_limit_per_user) : null,
                start_date: form.start_date || null,
                expiry_date: form.expiry_date || null,
            }),
        });

        const data = await res.json();
        setSaving(false);

        if (!res.ok) { setError(data.error ?? "Failed"); return; }

        setPromos((prev) => [{
            ...data,
            discount_value: Number(data.discount_value),
            minimum_order_value: data.minimum_order_value ? Number(data.minimum_order_value) : null,
            maximum_discount: data.maximum_discount ? Number(data.maximum_discount) : null,
            start_date: data.start_date ? data.start_date.slice(0, 10) : "",
            expiry_date: data.expiry_date ? data.expiry_date.slice(0, 10) : "",
            usageCount: 0,
        }, ...prev]);
        setForm(EMPTY_FORM);
        setCreating(false);
        router.refresh();
    }

    async function toggleActive(id: string, current: boolean) {
        setTogglingId(id);
        const res = await fetch(`/api/admin/promos/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: !current }),
        });
        setTogglingId(null);
        if (res.ok) {
            setPromos((prev) => prev.map((p) => p.id === id ? { ...p, is_active: !current } : p));
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this promo code? Usage history will be lost.")) return;
        setDeletingId(id);
        const res = await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
        setDeletingId(null);
        if (res.ok) {
            setPromos((prev) => prev.filter((p) => p.id !== id));
            router.refresh();
        }
    }

    function promoStatus(p: Promo): { label: string; color: string } {
        const now = new Date();
        if (!p.is_active) return { label: "Inactive", color: "bg-gray-100 text-gray-500" };
        if (p.expiry_date && new Date(p.expiry_date) < now) return { label: "Expired", color: "bg-red-100 text-red-600" };
        if (p.start_date && new Date(p.start_date) > now) return { label: "Scheduled", color: "bg-yellow-100 text-yellow-700" };
        if (p.usage_limit !== null && p.used_count >= p.usage_limit) return { label: "Limit reached", color: "bg-orange-100 text-orange-700" };
        return { label: "Active", color: "bg-green-100 text-green-700" };
    }

    function discountLabel(p: Promo) {
        if (p.discount_type === "percentage") {
            return `${p.discount_value}% off${p.maximum_discount ? ` (max ₹${p.maximum_discount.toLocaleString("en-IN")})` : ""}`;
        }
        if (p.discount_type === "fixed") return `₹${p.discount_value.toLocaleString("en-IN")} off`;
        return "Free shipping";
    }

    return (
        <div className="space-y-6">

            {/* Create form */}
            {creating ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-semibold text-gray-800 text-lg">New Promo Code</h2>
                        <button onClick={() => { setCreating(false); setError(""); }}
                            className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleCreate} className="space-y-6">

                        {/* Code */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                    Promo Code
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        value={form.code}
                                        onChange={(e) => setF("code", e.target.value.toUpperCase().replace(/\s/g, ""))}
                                        className={`${inputCls} font-mono tracking-widest flex-1`}
                                        placeholder="SAVE20 or auto-generate"
                                        maxLength={30}
                                    />
                                    <button type="button"
                                        onClick={() => setF("code", generatePromoCode(form.prefix || undefined))}
                                        className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 whitespace-nowrap">
                                        Auto
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                    Prefix (for auto-generate)
                                </label>
                                <input value={form.prefix}
                                    onChange={(e) => setF("prefix", e.target.value.toUpperCase())}
                                    className={inputCls} placeholder="e.g. SUMMER" maxLength={10} />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                Description
                            </label>
                            <input value={form.description}
                                onChange={(e) => setF("description", e.target.value)}
                                className={inputCls} placeholder="e.g. Summer sale 20% off" />
                        </div>

                        {/* Discount type + value */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                    Discount Type *
                                </label>
                                <select value={form.discount_type}
                                    onChange={(e) => setF("discount_type", e.target.value)}
                                    className={inputCls}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                    <option value="free_shipping">Free Shipping</option>
                                </select>
                            </div>
                            {form.discount_type !== "free_shipping" && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                        Value *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                            {form.discount_type === "percentage" ? "%" : "₹"}
                                        </span>
                                        <input required type="number" min="0"
                                            max={form.discount_type === "percentage" ? "100" : undefined}
                                            step="0.01"
                                            value={form.discount_value}
                                            onChange={(e) => setF("discount_value", e.target.value)}
                                            className={`${inputCls} pl-8`}
                                            placeholder={form.discount_type === "percentage" ? "20" : "500"} />
                                    </div>
                                </div>
                            )}
                            {form.discount_type === "percentage" && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                        Max Discount Cap (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                        <input type="number" min="0" step="0.01"
                                            value={form.maximum_discount}
                                            onChange={(e) => setF("maximum_discount", e.target.value)}
                                            className={`${inputCls} pl-8`} placeholder="Optional cap" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rules */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                    Min Order Value (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                    <input type="number" min="0" step="0.01"
                                        value={form.minimum_order_value}
                                        onChange={(e) => setF("minimum_order_value", e.target.value)}
                                        className={`${inputCls} pl-8`} placeholder="No minimum" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                    Total Usage Limit
                                </label>
                                <input type="number" min="1"
                                    value={form.usage_limit}
                                    onChange={(e) => setF("usage_limit", e.target.value)}
                                    className={inputCls} placeholder="Unlimited" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                    Per User Limit
                                </label>
                                <input type="number" min="1"
                                    value={form.usage_limit_per_user}
                                    onChange={(e) => setF("usage_limit_per_user", e.target.value)}
                                    className={inputCls} placeholder="Unlimited" />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                    Start Date
                                </label>
                                <input type="date" value={form.start_date}
                                    onChange={(e) => setF("start_date", e.target.value)}
                                    className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                    Expiry Date
                                </label>
                                <input type="date" value={form.expiry_date}
                                    min={form.start_date || new Date().toISOString().slice(0, 10)}
                                    onChange={(e) => setF("expiry_date", e.target.value)}
                                    className={inputCls} />
                            </div>
                        </div>

                        {/* Product / category restrictions */}
                        {(products.length > 0 || categories.length > 0) && (
                            <div className="space-y-4 border border-gray-100 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Restrictions (leave empty = applies to all)
                                </p>

                                {categories.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium mb-2">Applicable categories</p>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((cat) => (
                                                <button key={cat.id} type="button"
                                                    onClick={() => toggleMulti("applicable_categories", cat.id)}
                                                    className={`px-3 py-1 rounded-full text-xs border-2 font-medium transition-all ${form.applicable_categories.includes(cat.id)
                                                            ? "border-gray-900 bg-gray-900 text-white"
                                                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                                                        }`}>
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {products.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium mb-2">Applicable products</p>
                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                            {products.map((p) => (
                                                <button key={p.id} type="button"
                                                    onClick={() => toggleMulti("applicable_products", p.id)}
                                                    className={`px-3 py-1 rounded-full text-xs border-2 font-medium transition-all ${form.applicable_products.includes(p.id)
                                                            ? "border-gray-900 bg-gray-900 text-white"
                                                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                                                        }`}>
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {products.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium mb-2">Excluded products</p>
                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                            {products.map((p) => (
                                                <button key={p.id} type="button"
                                                    onClick={() => toggleMulti("excluded_products", p.id)}
                                                    className={`px-3 py-1 rounded-full text-xs border-2 font-medium transition-all ${form.excluded_products.includes(p.id)
                                                            ? "border-red-500 bg-red-500 text-white"
                                                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                                                        }`}>
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Toggles */}
                        <div className="flex gap-8">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <button type="button"
                                    onClick={() => setF("is_active", !form.is_active)}
                                    className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${form.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                                    <span className={`absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                                </button>
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <button type="button"
                                    onClick={() => setF("stackable", !form.stackable)}
                                    className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${form.stackable ? "bg-green-500" : "bg-gray-300"}`}>
                                    <span className={`absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.stackable ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                                </button>
                                <span className="text-sm font-medium text-gray-700">Stackable with other promos</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={saving}
                                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60">
                                {saving ? "Creating..." : "Create Promo Code"}
                            </button>
                            <button type="button" onClick={() => { setCreating(false); setForm(EMPTY_FORM); }}
                                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <button onClick={() => setCreating(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 font-medium transition-colors">
                    + Create Promo Code
                </button>
            )}

            {/* Promo list */}
            <div className="space-y-3">
                {promos.length === 0 && !creating && (
                    <div className="text-center py-16 text-gray-400 bg-white border border-gray-100 rounded-2xl">
                        <p className="text-4xl mb-3">🎟️</p>
                        <p className="font-medium">No promo codes yet</p>
                    </div>
                )}

                {promos.map((p) => {
                    const status = promoStatus(p);
                    const expanded = expandedId === p.id;

                    return (
                        <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                            {/* Main row */}
                            <div className="px-6 py-4 flex items-center gap-4 flex-wrap">
                                {/* Code + type */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono font-bold text-gray-800 tracking-widest text-base">
                                            {p.code}
                                        </span>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">{discountLabel(p)}</p>
                                    {p.description && (
                                        <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-6 text-sm text-gray-500 shrink-0">
                                    <div className="text-center">
                                        <p className="font-bold text-gray-800 text-base">{p.used_count}</p>
                                        <p className="text-xs text-gray-400">
                                            {p.usage_limit !== null ? `/ ${p.usage_limit}` : "∞"} uses
                                        </p>
                                    </div>
                                    {p.minimum_order_value !== null && (
                                        <div className="text-center hidden sm:block">
                                            <p className="font-semibold text-gray-700">₹{p.minimum_order_value.toLocaleString("en-IN")}</p>
                                            <p className="text-xs text-gray-400">min order</p>
                                        </div>
                                    )}
                                    {p.expiry_date && (
                                        <div className="text-center hidden sm:block">
                                            <p className="font-semibold text-gray-700">
                                                {new Date(p.expiry_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </p>
                                            <p className="text-xs text-gray-400">expires</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => toggleActive(p.id, p.is_active)}
                                        disabled={togglingId === p.id}
                                        className={`w-11 h-6 rounded-full relative transition-colors shrink-0 disabled:opacity-50 ${p.is_active ? "bg-green-500" : "bg-gray-300"}`}
                                    >
                                        <span className={`absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${p.is_active ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                                    </button>
                                    <button onClick={() => setExpandedId(expanded ? null : p.id)}
                                        className="text-xs text-blue-600 hover:underline">
                                        {expanded ? "Less" : "Details"}
                                    </button>
                                    <button onClick={() => handleDelete(p.id)}
                                        disabled={deletingId === p.id}
                                        className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40">
                                        {deletingId === p.id ? "..." : "Delete"}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded details */}
                            {expanded && (
                                <div className="border-t border-gray-50 px-6 py-4 bg-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                    {[
                                        ["Type", p.discount_type],
                                        ["Value", discountLabel(p)],
                                        ["Min Order", p.minimum_order_value != null ? `₹${p.minimum_order_value}` : "None"],
                                        ["Max Discount", p.maximum_discount != null ? `₹${p.maximum_discount}` : "None"],
                                        ["Per User", p.usage_limit_per_user != null ? `${p.usage_limit_per_user}x` : "Unlimited"],
                                        ["Start", p.start_date ? new Date(p.start_date).toLocaleDateString("en-IN") : "Immediately"],
                                        ["Expiry", p.expiry_date ? new Date(p.expiry_date).toLocaleDateString("en-IN") : "Never"],
                                        ["Stackable", p.stackable ? "Yes" : "No"],
                                    ].map(([label, value]) => (
                                        <div key={label}>
                                            <p className="text-xs text-gray-400">{label}</p>
                                            <p className="font-medium text-gray-700 mt-0.5">{value}</p>
                                        </div>
                                    ))}
                                    {p.applicable_products.length > 0 && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-gray-400">Applicable products</p>
                                            <p className="text-xs text-gray-600 mt-0.5">{p.applicable_products.length} products</p>
                                        </div>
                                    )}
                                    {p.applicable_categories.length > 0 && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-gray-400">Applicable categories</p>
                                            <p className="text-xs text-gray-600 mt-0.5">{p.applicable_categories.length} categories</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}