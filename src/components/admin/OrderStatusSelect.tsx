"use client";

import { useState } from "react";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

export function OrderStatusSelect({
    orderId,
    currentStatus,
}: {
    orderId: string;
    currentStatus: string;
}) {
    const [status, setStatus] = useState(currentStatus);
    const [saving, setSaving] = useState(false);

    async function handleChange(newStatus: string) {
        setSaving(true);
        setStatus(newStatus);

        await fetch(`/api/admin/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

        setSaving(false);
    }

    return (
        <select
            value={status}
            onChange={(e) => handleChange(e.target.value)}
            disabled={saving}
            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 ${COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
        >
            {STATUSES.map((s) => (
                <option key={s} value={s}>
                    {s}
                </option>
            ))}
        </select>
    );
}