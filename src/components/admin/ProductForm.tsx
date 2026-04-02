"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

type ProductData = {
    name: string;
    description: string;
    price: string;
    discount_price: string;
    stock: string;
    category_id: string;
    images: string;
    is_active: boolean;
};

type Props = {
    categories: Category[];
    initialData?: Partial<ProductData> & { id?: string };
    mode: "create" | "edit";
};

const EMPTY: ProductData = {
    name: "", description: "", price: "",
    discount_price: "", stock: "0",
    category_id: "", images: "", is_active: true,
};

export function ProductForm({ categories, initialData, mode }: Props) {
    const router = useRouter();
    const [fields, setFields] = useState<ProductData>({
        ...EMPTY,
        ...initialData,
    });
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    function set(key: keyof ProductData, value: string | boolean) {
        setFields((f) => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const payload = {
            name: fields.name,
            description: fields.description,
            price: parseFloat(fields.price),
            discount_price: fields.discount_price ? parseFloat(fields.discount_price) : null,
            stock: parseInt(fields.stock),
            category_id: fields.category_id || null,
            images: fields.images
                ? fields.images.split("\n").map((s) => s.trim()).filter(Boolean)
                : [],
            is_active: fields.is_active,
        };

        const url = mode === "create"
            ? "/api/admin/products"
            : `/api/admin/products/${initialData?.id}`;

        const res = await fetch(url, {
            method: mode === "create" ? "POST" : "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setLoading(false);

        if (!res.ok) {
            const data = await res.json();
            setError(data.error ?? "Something went wrong");
            return;
        }

        router.push("/admin/products");
        router.refresh();
    }

    async function handleDelete() {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        setDeleting(true);

        const res = await fetch(`/api/admin/products/${initialData?.id}`, {
            method: "DELETE",
        });

        setDeleting(false);

        if (res.ok) {
            router.push("/admin/products");
            router.refresh();
        }
    }

    const inputClass =
        "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200";

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                    {error}
                </div>
            )}

            {/* Name */}
            <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Product Name *
                </label>
                <input
                    required
                    value={fields.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Wireless Headphones"
                />
            </div>

            {/* Description */}
            <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Description
                </label>
                <textarea
                    rows={3}
                    value={fields.description}
                    onChange={(e) => set("description", e.target.value)}
                    className={inputClass}
                    placeholder="Describe your product..."
                />
            </div>

            {/* Price + Discount */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Price (₹) *
                    </label>
                    <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={fields.price}
                        onChange={(e) => set("price", e.target.value)}
                        className={inputClass}
                        placeholder="999"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Sale Price (₹)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={fields.discount_price}
                        onChange={(e) => set("discount_price", e.target.value)}
                        className={inputClass}
                        placeholder="Leave blank if no sale"
                    />
                </div>
            </div>

            {/* Stock + Category */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Stock
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={fields.stock}
                        onChange={(e) => set("stock", e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Category
                    </label>
                    <select
                        value={fields.category_id}
                        onChange={(e) => set("category_id", e.target.value)}
                        className={inputClass}
                    >
                        <option value="">No category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Images */}
            <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Image URLs
                </label>
                <textarea
                    rows={3}
                    value={fields.images}
                    onChange={(e) => set("images", e.target.value)}
                    className={`${inputClass} font-mono text-xs`}
                    placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
                />
                <p className="text-xs text-gray-400 mt-1">One URL per line</p>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                    <p className="text-sm font-medium text-gray-700">Visible in store</p>
                    <p className="text-xs text-gray-400">Toggle off to hide from customers</p>
                </div>
                <button
                    type="button"
                    onClick={() => set("is_active", !fields.is_active)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${fields.is_active ? "bg-green-500" : "bg-gray-300"
                        }`}
                >
                    <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${fields.is_active ? "translate-x-5" : "translate-x-0.5"
                            }`}
                    />
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
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
                    className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                    Cancel
                </button>

                {mode === "edit" && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="ml-auto px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                )}
            </div>
        </form>
    );
}