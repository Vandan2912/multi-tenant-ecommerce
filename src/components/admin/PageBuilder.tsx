"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  SECTION_META,
  SECTION_TYPES,
  createSection,
  type PageSections,
  type Section,
  type SectionType,
} from "@/lib/page-builder/sections";
import { SectionConfigForm } from "./SectionConfigForm";

type RefOpt = { id: string; name: string; slug?: string };

type Page = {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  is_published: boolean;
  sections: PageSections;
};

export function PageBuilder({
  page,
  categories,
  products,
}: {
  page: Page;
  categories: RefOpt[];
  products: RefOpt[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(page.title);
  const [sections, setSections] = useState<PageSections>(page.sections);
  const [isPublished, setIsPublished] = useState(page.is_published);
  const [expandedId, setExpandedId] = useState<string | null>(
    page.sections[0]?.id ?? null,
  );
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [previewNonce, setPreviewNonce] = useState(0);

  function addSection(type: SectionType) {
    const next = createSection(type, sections.length);
    setSections((prev) => [...prev, next]);
    setExpandedId(next.id);
    setShowAdd(false);
  }

  function removeSection(id: string) {
    if (!confirm("Remove this section?")) return;
    setSections((prev) =>
      prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, position: i })),
    );
  }

  function moveSection(id: string, direction: -1 | 1) {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const to = idx + direction;
      if (to < 0 || to >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[to]] = [copy[to], copy[idx]];
      return copy.map((s, i) => ({ ...s, position: i }));
    });
  }

  function updateConfig(id: string, config: Section["config"]) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? ({ ...s, config } as Section) : s)),
    );
  }

  function handleDrop(targetIdx: number) {
    if (!dragId) return;
    setSections((prev) => {
      const fromIdx = prev.findIndex((s) => s.id === dragId);
      if (fromIdx === -1) return prev;
      // Adjust target if removing source shifts indices
      const adjusted = fromIdx < targetIdx ? targetIdx - 1 : targetIdx;
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(adjusted, 0, moved);
      return copy.map((s, i) => ({ ...s, position: i }));
    });
    setDragId(null);
    setDropTarget(null);
  }

  async function save(publish?: boolean) {
    setSaving(true);
    const newPublished = publish ?? isPublished;
    const res = await fetch(`/api/admin/pages/${page.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        sections,
        is_published: newPublished,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setIsPublished(newPublished);
      setSavedAt(new Date());
      setPreviewNonce((n) => n + 1);
      router.refresh();
    } else {
      alert("Failed to save");
    }
  }

  return (
    <div>
      {/* ── Top bar ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isPublished
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isPublished ? "Published" : "Draft"}
        </span>
        {savedAt && (
          <span className="text-xs text-gray-400">
            Saved {savedAt.toLocaleTimeString()}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            disabled={saving}
            onClick={() => save()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            disabled={saving}
            onClick={() => save(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black disabled:opacity-50"
          >
            {isPublished ? "Update" : "Publish"}
          </button>
          {isPublished && (
            <button
              disabled={saving}
              onClick={() => save(false)}
              className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Unpublish
            </button>
          )}
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-6 ${
          showPreview ? "lg:grid-cols-2" : ""
        }`}
      >
        {/* ── Left: section list ────────────────────────────── */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 text-2xl font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none py-1"
            />
            <span className="text-sm text-gray-400">/{page.slug}</span>
          </div>

          <div>
            {sections.length === 0 && (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                <p className="text-gray-500 mb-4">
                  No sections yet. Add your first one.
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black"
                >
                  + Add Section
                </button>
              </div>
            )}

            {sections.map((section, idx) => {
              const meta = SECTION_META[section.type];
              const expanded = expandedId === section.id;
              const beingDragged = dragId === section.id;
              return (
                <div key={section.id}>
                  <DropZone
                    active={dropTarget === idx && dragId !== null}
                    onDragOver={(e) => {
                      if (!dragId) return;
                      e.preventDefault();
                      setDropTarget(idx);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(idx);
                    }}
                  />
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDragId(section.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setDropTarget(null);
                    }}
                    className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-opacity ${
                      beingDragged ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex items-center px-4 py-3 gap-3">
                      <span
                        className="text-gray-300 cursor-grab active:cursor-grabbing select-none px-1"
                        title="Drag to reorder"
                      >
                        ⋮⋮
                      </span>
                      <span className="text-xl">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">
                          {meta.label}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {meta.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveSection(section.id, -1)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          disabled={idx === sections.length - 1}
                          onClick={() => moveSection(section.id, 1)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() =>
                            setExpandedId(expanded ? null : section.id)
                          }
                          className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          {expanded ? "Close" : "Edit"}
                        </button>
                        <button
                          onClick={() => removeSection(section.id)}
                          className="p-1.5 text-red-500 hover:text-red-700"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
                        <SectionConfigForm
                          section={section}
                          categories={categories}
                          products={products}
                          onChange={(cfg) => updateConfig(section.id, cfg)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {sections.length > 0 && (
              <DropZone
                active={dropTarget === sections.length && dragId !== null}
                onDragOver={(e) => {
                  if (!dragId) return;
                  e.preventDefault();
                  setDropTarget(sections.length);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(sections.length);
                }}
              />
            )}
          </div>

          {/* {sections.length > 0 && ( */}
          <div className="mt-4">
            {showAdd ? (
              <AddSectionPicker
                onPick={addSection}
                onCancel={() => setShowAdd(false)}
              />
            ) : (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700"
              >
                + Add Section
              </button>
            )}
          </div>
          {/* )} */}
        </div>

        {/* ── Right: live preview iframe ────────────────────── */}
        {showPreview && (
          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      previewDevice === "desktop"
                        ? "bg-gray-900 text-white"
                        : "text-gray-600"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      previewDevice === "mobile"
                        ? "bg-gray-900 text-white"
                        : "text-gray-600"
                    }`}
                  >
                    Mobile
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreviewNonce((n) => n + 1)}
                    className="text-xs text-gray-500 hover:text-gray-800"
                    title="Reload preview"
                  >
                    ↻ Reload
                  </button>
                  <a
                    href={`/admin/preview/${page.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Open ↗
                  </a>
                </div>
              </div>
              <div className="bg-gray-100 flex justify-center p-4">
                <div
                  className="bg-white shadow-sm transition-all"
                  style={{
                    width: previewDevice === "mobile" ? 390 : "100%",
                    maxWidth: "100%",
                  }}
                >
                  <iframe
                    key={previewNonce}
                    src={`/admin/preview/${page.id}`}
                    className="w-full block border-0"
                    style={{ height: "75vh" }}
                    title="Page preview"
                  />
                </div>
              </div>
              <p className="px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
                Preview reflects last-saved draft. Save to refresh.
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function DropZone({
  active,
  onDragOver,
  onDrop,
}: {
  active: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`transition-all ${
        active
          ? "h-12 my-2 border-2 border-dashed border-blue-500 rounded-lg bg-blue-50"
          : "h-3"
      }`}
    />
  );
}

function AddSectionPicker({
  onPick,
  onCancel,
}: {
  onPick: (type: SectionType) => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">
          Choose a section
        </h3>
        <button
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SECTION_TYPES.map((type) => {
          const meta = SECTION_META[type];
          return (
            <button
              key={type}
              onClick={() => onPick(type)}
              className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left"
            >
              <span className="text-xl">{meta.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  {meta.label}
                </p>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {meta.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
