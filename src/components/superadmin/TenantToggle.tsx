"use client";

import { useState } from "react";

export function TenantToggle({
    tenantId,
    isActive,
}: {
    tenantId: string;
    isActive: boolean;
}) {
    const [active, setActive] = useState(isActive);
    const [loading, setLoading] = useState(false);

    async function toggle() {
        setLoading(true);
        const res = await fetch(`/api/superadmin/tenants/${tenantId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: !active }),
        });
        if (res.ok) setActive((v) => !v);
        setLoading(false);
    }

    return (
        <button
            onClick={toggle}
            disabled={loading}
            className={`w-10 h-5 rounded-full relative transition-colors disabled:opacity-50 ${active ? "bg-green-500" : "bg-gray-600"
                }`}
        >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? "translate-x-5" : "translate-x-0.5"
                }`} />
        </button>
    );
}