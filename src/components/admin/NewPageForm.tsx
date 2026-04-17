"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function NewPageForm({ preset }: { preset?: string }) {
  const router = useRouter();
  const isHomePreset = preset === "home";

  const [title, setTitle] = useState(isHomePreset ? "Home" : "");
  const [slug, setSlug] = useState(isHomePreset ? "home" : "");
  const [pageType, setPageType] = useState(isHomePreset ? "home" : "custom");
  const [slugTouched, setSlugTouched] = useState(isHomePreset);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        page_type: pageType,
        sections: [],
        is_published: false,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create page");
      setSubmitting(false);
      return;
    }
    const page = await res.json();
    router.push(`/admin/pages/${page.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Title
        </label>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Slug
        </label>
        <input
          value={slug}
          onChange={(e) => {
            setSlug(slugify(e.target.value));
            setSlugTouched(true);
          }}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">
          Used in URLs. &quot;home&quot; is reserved for the homepage.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Page Type
        </label>
        <select
          value={pageType}
          onChange={(e) => setPageType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="home">Homepage</option>
          <option value="custom">Custom Page</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create Page"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/pages")}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
