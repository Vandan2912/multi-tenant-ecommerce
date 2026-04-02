"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  parent: { id: string; name: string } | null;
  children: { id: string; name: string; slug: string }[];
};

type Props = {
  tenantId: string;
  initialCategories: Category[];
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function CategoryManager({ initialCategories }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Top-level categories only as parent options
  const roots = categories.filter((c) => !c.parent_id);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: slugify(name.trim()),
        parent_id: parentId || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create category");
      return;
    }

    setName("");
    setParentId("");
    router.refresh();

    // Optimistic update
    setCategories((prev) => [
      ...prev,
      {
        ...data,
        parent: parentId ? (prev.find((c) => c.id === parentId) ?? null) : null,
        children: [],
      },
    ]);
  }

  async function handleDelete(id: string) {
    const cat = categories.find((c) => c.id === id);
    if (cat?.children.length) {
      setError("Delete subcategories first before deleting a parent category.");
      return;
    }
    if (!confirm("Delete this category?")) return;
    setDeletingId(id);

    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Add Category</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Category name"
            className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
          >
            <option value="">Top-level category</option>
            {roots.map((c) => (
              <option key={c.id} value={c.id}>
                Under: {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>

        {name && (
          <p className="text-xs text-gray-400 mt-2">
            Slug: <span className="font-mono">{slugify(name)}</span>
          </p>
        )}
      </div>

      {/* Category tree */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {roots.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🗂️</p>
            <p className="text-sm">No categories yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {roots.map((root) => (
              <li key={root.id}>
                {/* Root category */}
                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300 text-lg">▶</span>
                    <div>
                      <p className="font-semibold text-gray-800">{root.name}</p>
                      <p className="text-xs text-gray-400 font-mono">
                        {root.slug}
                      </p>
                    </div>
                    {root.children.length > 0 && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {root.children.length} sub
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(root.id)}
                    disabled={deletingId === root.id}
                    className="text-sm text-red-400 hover:text-red-600 disabled:opacity-40"
                  >
                    {deletingId === root.id ? "..." : "Delete"}
                  </button>
                </div>

                {/* Subcategories */}
                {root.children.length > 0 && (
                  <ul className="border-t border-gray-50 divide-y divide-gray-50 bg-gray-50/50">
                    {root.children.map((child) => (
                      <li
                        key={child.id}
                        className="flex items-center justify-between px-6 py-3 pl-14 hover:bg-gray-50"
                      >
                        <div>
                          <p className="text-sm text-gray-700">{child.name}</p>
                          <p className="text-xs text-gray-400 font-mono">
                            {child.slug}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(child.id)}
                          disabled={deletingId === child.id}
                          className="text-sm text-red-400 hover:text-red-600 disabled:opacity-40"
                        >
                          {deletingId === child.id ? "..." : "Delete"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
