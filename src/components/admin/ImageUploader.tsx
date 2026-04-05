"use client";

import { useState, useRef } from "react";

type Props = {
  value: string; // newline-separated URLs
  onChange: (val: string) => void;
};

export function ImageUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const urls = value
    ? value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    for (const f of Array.from(files)) {
      if (f.size > MAX_SIZE) {
        setError(`${f.name} is too large. Max 5MB per image.`);
        return;
      }
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }

    const newUrls = [...urls, ...data.urls];
    onChange(newUrls.join("\n"));
  }

  function removeUrl(url: string) {
    const updated = urls.filter((u) => u !== url);
    onChange(updated.join("\n"));
  }

  function moveUrl(from: number, to: number) {
    const updated = [...urls];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated.join("\n"));
  }

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {urls.map((url, i) => (
            <div
              key={url}
              className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
            >
              <img
                src={url}
                alt={`Image ${i + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => removeUrl(url)}
                  className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium"
                >
                  Remove
                </button>
                <div className="flex gap-1">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => moveUrl(i, i - 1)}
                      className="bg-white/20 text-white text-xs px-2 py-1 rounded-full"
                    >
                      ←
                    </button>
                  )}
                  {i < urls.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveUrl(i, i + 1)}
                      className="bg-white/20 text-white text-xs px-2 py-1 rounded-full"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>

              {/* First image badge */}
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          uploading
            ? "border-blue-300 bg-blue-50"
            : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-blue-600 font-medium">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-2xl">📸</p>
            <p className="text-sm font-medium text-gray-600">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, WEBP up to 5MB each
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">
          {error}
          <button onClick={() => setError("")} className="ml-2 text-red-400">
            x
          </button>
        </p>
      )}

      {/* Manual URL fallback */}
      <details className="text-xs text-gray-400">
        <summary className="cursor-pointer hover:text-gray-600">
          Or paste image URLs manually
        </summary>
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            "https://example.com/image1.jpg\nhttps://example.com/image2.jpg"
          }
          className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
      </details>
    </div>
  );
}
