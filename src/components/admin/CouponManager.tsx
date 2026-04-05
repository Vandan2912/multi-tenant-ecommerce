"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  expiry: string;
  usage_limit: number | null;
  used_count: number;
};

type Props = {
  tenantId: string;
  initialCoupons: Coupon[];
};

const EMPTY = {
  code: "",
  type: "percent",
  value: "",
  expiry: "",
  usage_limit: "",
};

export function CouponManager({ initialCoupons }: Props) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [fields, setFields] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.code || !fields.value) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: fields.code.toUpperCase().trim(),
        type: fields.type,
        value: parseFloat(fields.value),
        expiry: fields.expiry || null,
        usage_limit: fields.usage_limit ? parseInt(fields.usage_limit) : null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create coupon");
      return;
    }

    setCoupons((prev) => [
      {
        ...data,
        value: Number(data.value),
        expiry: data.expiry ? data.expiry.slice(0, 10) : "",
      },
      ...prev,
    ]);
    setFields(EMPTY);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    setDeletingId(id);

    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    }
  }

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200";

  function isExpired(expiry: string) {
    return expiry && new Date(expiry) < new Date();
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Create Coupon</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Coupon Code *
              </label>
              <input
                required
                value={fields.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                className={`${inputCls} font-mono tracking-widest`}
                placeholder="SAVE20"
                maxLength={20}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Discount Type *
              </label>
              <select
                value={fields.type}
                onChange={(e) => set("type", e.target.value)}
                className={inputCls}
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Value *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {fields.type === "percent" ? "%" : "₹"}
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  max={fields.type === "percent" ? "100" : undefined}
                  step="0.01"
                  value={fields.value}
                  onChange={(e) => set("value", e.target.value)}
                  className={`${inputCls} pl-8`}
                  placeholder={fields.type === "percent" ? "20" : "100"}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Expiry Date
              </label>
              <input
                type="date"
                value={fields.expiry}
                onChange={(e) => set("expiry", e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Usage Limit
              </label>
              <input
                type="number"
                min="1"
                value={fields.usage_limit}
                onChange={(e) => set("usage_limit", e.target.value)}
                className={inputCls}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors"
          >
            {loading ? "Creating..." : "Create Coupon"}
          </button>
        </form>
      </div>

      {/* Coupons list */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {coupons.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🎟️</p>
            <p className="font-medium">No coupons yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Code", "Discount", "Used", "Expiry", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((c) => {
                const expired = isExpired(c.expiry);
                const maxed =
                  c.usage_limit !== null && c.used_count >= c.usage_limit;
                const inactive = expired || maxed;

                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-gray-800 tracking-widest">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {c.type === "percent"
                        ? `${c.value}% off`
                        : `₹${c.value.toLocaleString("en-IN")} off`}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {c.used_count}
                      {c.usage_limit !== null && (
                        <span className="text-gray-400">
                          {" "}
                          / {c.usage_limit}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {c.expiry
                        ? new Date(c.expiry).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inactive
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {expired ? "Expired" : maxed ? "Maxed out" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="text-sm text-red-400 hover:text-red-600 disabled:opacity-40"
                      >
                        {deletingId === c.id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
