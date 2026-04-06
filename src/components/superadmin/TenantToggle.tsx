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
            className={`w-11 h-6 rounded-full relative transition-colors shrink-0 disabled:opacity-50 ${active ? "bg-green-500" : "bg-gray-400"
                }`}
        >
            <span className={`absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${active ? "translate-x-[22px]" : "translate-x-0.5"
                }`} />
        </button>
    );
}