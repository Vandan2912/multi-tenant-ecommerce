"use client";

import { useRef, useState } from "react";

export function SingleImagePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setError("Max 5MB");
      return;
    }
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("files", file);
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
    onChange(data.urls[0] ?? "");
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors ${
            uploading
              ? "border-blue-300 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          {uploading ? (
            <p className="text-sm text-blue-600">Uploading…</p>
          ) : (
            <>
              <p className="text-xl mb-1">📸</p>
              <p className="text-xs font-medium text-gray-600">
                Click or drop an image
              </p>
              <p className="text-xs text-gray-400">Max 5MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "or paste an image URL…"}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
