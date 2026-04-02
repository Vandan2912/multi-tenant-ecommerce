"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardClientPage() {
    const router = useRouter();
    const [fields, setFields] = useState({
        name: "", domain: "", slug: "", plan: "standard",
        adminEmail: "", adminPassword: "",
        primaryColor: "#2563EB", fontFamily: "Inter",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function set(key: string, value: string) {
        setFields((f) => ({ ...f, [key]: value }));
        // Auto-generate slug from name
        if (key === "name") {
            setFields((f) => ({
                ...f,
                name: value,
                slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
            }));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/superadmin/tenants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fields),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(data.error ?? "Something went wrong");
            return;
        }

        router.push("/superadmin");
        router.refresh();
    }

    const inputClass =
        "w-full border border-white/10 bg-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20";

    return (
        <div className="p-8 max-w-xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Onboard New Client</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Creates tenant, store config, and admin login in one step
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                <section className="space-y-4">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Store Details
                    </h2>
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Store Name *</label>
                        <input required value={fields.name}
                            onChange={(e) => set("name", e.target.value)}
                            className={inputClass} placeholder="Riya Fashion" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Domain *</label>
                        <input required value={fields.domain}
                            onChange={(e) => set("domain", e.target.value)}
                            className={`${inputClass} font-mono`}
                            placeholder="riyafashion.com" />
                        <p className="text-xs text-gray-600 mt-1">
                            Exact domain the client will use — no https://
                        </p>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Slug *</label>
                        <input required value={fields.slug}
                            onChange={(e) => set("slug", e.target.value)}
                            className={`${inputClass} font-mono`}
                            placeholder="riya-fashion" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Plan</label>
                        <select value={fields.plan}
                            onChange={(e) => set("plan", e.target.value)}
                            className={inputClass}>
                            <option value="basic">Basic</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Admin Login
                    </h2>
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Admin Email *</label>
                        <input required type="email" value={fields.adminEmail}
                            onChange={(e) => set("adminEmail", e.target.value)}
                            className={inputClass} placeholder="owner@riyafashion.com" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Temp Password *</label>
                        <input required value={fields.adminPassword}
                            onChange={(e) => set("adminPassword", e.target.value)}
                            className={inputClass} placeholder="Min 8 characters" />
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Initial Theme
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 mb-1.5 block">Primary Color</label>
                            <div className="flex gap-2 items-center">
                                <input type="color" value={fields.primaryColor}
                                    onChange={(e) => set("primaryColor", e.target.value)}
                                    className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 cursor-pointer p-0.5" />
                                <input value={fields.primaryColor}
                                    onChange={(e) => set("primaryColor", e.target.value)}
                                    className={`${inputClass} font-mono`} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1.5 block">Font</label>
                            <select value={fields.fontFamily}
                                onChange={(e) => set("fontFamily", e.target.value)}
                                className={inputClass}>
                                {["Inter", "Poppins", "Roboto", "Lato", "Montserrat"].map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                <button type="submit" disabled={loading}
                    className="w-full py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-100 disabled:opacity-60 transition-colors">
                    {loading ? "Creating Store..." : "Create Store & Admin Login"}
                </button>
            </form>
        </div>
    );
}