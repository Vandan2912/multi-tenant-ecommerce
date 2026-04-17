"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  page_type: string;
  is_published: boolean;
  updatedAt: string;
};

export function PagesListClient({
  initialPages,
}: {
  initialPages: PageRow[];
}) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [busy, setBusy] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setBusy(id);
    const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) {
      setPages((p) => p.filter((x) => x.id !== id));
      router.refresh();
    } else {
      alert("Failed to delete");
    }
  }

  if (pages.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-gray-500 mb-4">
          No pages yet. Start by creating your homepage.
        </p>
        <Link
          href="/admin/pages/new?preset=home"
          className="inline-block px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black"
        >
          Create Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
          <tr>
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3">Slug</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Updated</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pages.map((p) => (
            <tr key={p.id}>
              <td className="px-5 py-3 font-medium text-gray-800">{p.title}</td>
              <td className="px-5 py-3 text-sm text-gray-500">{p.slug}</td>
              <td className="px-5 py-3 text-sm text-gray-500">{p.page_type}</td>
              <td className="px-5 py-3">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    p.is_published
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {p.is_published ? "Published" : "Draft"}
                </span>
              </td>
              <td className="px-5 py-3 text-sm text-gray-500">
                {new Date(p.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-5 py-3 text-right space-x-3">
                <Link
                  href={`/admin/pages/${p.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Edit
                </Link>
                <button
                  disabled={busy === p.id}
                  onClick={() => handleDelete(p.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
