"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";

type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  _count: { products: number };
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function BrandManager({ initialBrands }: { initialBrands: Brand[] }) {
  const router = useRouter();
  const [brands, setBrands] = useState(initialBrands);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: slugify(name.trim()),
        logo_url: logoUrl.trim() || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create brand");
      return;
    }

    setName("");
    setLogoUrl("");
    setBrands((prev) => [...prev, { ...data, _count: { products: 0 } }]);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const brand = brands.find((b) => b.id === id);
    if (brand && brand._count.products > 0) {
      setError(
        `Cannot delete — ${brand._count.products} products use this brand. Reassign them first.`,
      );
      return;
    }
    if (!confirm("Delete this brand?")) return;
    setDeletingId(id);

    const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (res.ok) {
      setBrands((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Add Brand</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
            <button onClick={() => setError("")} className="ml-2 text-red-400">
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-3">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Brand name"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add Brand"}
            </button>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              Brand Logo
            </label>
            <ImageUploader value={logoUrl} onChange={setLogoUrl} />
          </div>
          {name && (
            <p className="text-xs text-gray-400">
              Slug: <span className="font-mono">{slugify(name)}</span>
            </p>
          )}
        </form>
      </div>

      {/* Brands list */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {brands.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🏷️</p>
            <p className="text-sm">No brands yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {brands.map((brand) => (
              <li
                key={brand.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50"
              >
                {/* Logo */}
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-gray-300 text-lg">🏷️</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{brand.name}</p>
                  <p className="text-xs text-gray-400 font-mono">
                    {brand.slug}
                  </p>
                </div>

                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {brand._count.products} products
                </span>

                <button
                  onClick={() => handleDelete(brand.id)}
                  disabled={deletingId === brand.id}
                  className="text-sm text-red-400 hover:text-red-600 disabled:opacity-40"
                >
                  {deletingId === brand.id ? "..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
