"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Tenant, StoreConfig } from "@prisma/client";
import type { ShippingConfig } from "@/lib/shipping";

type Props = {
    tenant: Tenant;
    config: StoreConfig | null;
};

export function SettingsForm({ tenant, config }: Props) {
    const router = useRouter();
    const features = (config?.features_json ?? {}) as Record<string, boolean>;
    const contact = (config?.contact_json ?? {}) as Record<string, string>;
    const shipping = (config?.shipping_json ?? { type: "free" }) as ShippingConfig;

    const [fields, setFields] = useState({
        storeName: tenant.name,
        tagline: config?.store_tagline ?? "",
        primaryColor: config?.primary_color ?? "#2563EB",
        fontFamily: config?.font_family ?? "Inter",
        heroLayout: config?.hero_layout ?? "centered",
        productCardStyle: config?.product_card_style ?? "minimal",
        logoUrl: config?.logo_url ?? "",
        phone: contact.phone ?? "",
        email: contact.email ?? "",
        whatsapp: contact.whatsapp ?? "",
        enableCOD: features.enableCOD ?? true,
        enableWishlist: features.enableWishlist ?? false,
        enableCoupons: features.enableCoupons ?? false,
        shippingType: shipping.type ?? "free",
        shippingFlatRate: String(shipping.flat_rate ?? 99),
        shippingFreeAbove: String(shipping.free_above ?? ""),
    });

    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    function set(key: string, value: string | boolean) {
        setFields((f) => ({ ...f, [key]: value }));
        setSaved(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        await fetch("/api/admin/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fields),
        });

        setLoading(false);
        setSaved(true);
        router.refresh();
    }

    const inputClass =
        "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200";

    function Toggle({
        label, desc, value, onChange,
    }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
        return (
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <button
                    type="button"
                    onClick={() => onChange(!value)}
                    className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${value ? "bg-green-500" : "bg-gray-300"
                        }`}
                >
                    <span className={`absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? "translate-x-[22px]" : "translate-x-0.5"
                        }`} />
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">

            {/* Brand */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h2 className="font-semibold text-gray-800">Brand</h2>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Store Name
                    </label>
                    <input value={fields.storeName}
                        onChange={(e) => set("storeName", e.target.value)}
                        className={inputClass} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Tagline
                    </label>
                    <input value={fields.tagline} placeholder="Your store's tagline"
                        onChange={(e) => set("tagline", e.target.value)}
                        className={inputClass} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Logo URL
                    </label>
                    <input value={fields.logoUrl} placeholder="https://..."
                        onChange={(e) => set("logoUrl", e.target.value)}
                        className={inputClass} />
                </div>
            </section>

            {/* Theme */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h2 className="font-semibold text-gray-800">Theme</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            Primary Color
                        </label>
                        <div className="flex gap-2 items-center">
                            <input type="color" value={fields.primaryColor}
                                onChange={(e) => set("primaryColor", e.target.value)}
                                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                            <input value={fields.primaryColor}
                                onChange={(e) => set("primaryColor", e.target.value)}
                                className={`${inputClass} font-mono`} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            Font Family
                        </label>
                        <select value={fields.fontFamily}
                            onChange={(e) => set("fontFamily", e.target.value)}
                            className={inputClass}>
                            {["Inter", "Poppins", "Roboto", "Lato", "Montserrat", "Playfair Display"].map((f) => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            Homepage Layout
                        </label>
                        <select value={fields.heroLayout}
                            onChange={(e) => set("heroLayout", e.target.value)}
                            className={inputClass}>
                            <option value="centered">Centered</option>
                            <option value="split">Split</option>
                            <option value="fullscreen">Fullscreen</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            Product Card Style
                        </label>
                        <select value={fields.productCardStyle}
                            onChange={(e) => set("productCardStyle", e.target.value)}
                            className={inputClass}>
                            <option value="minimal">Minimal</option>
                            <option value="detailed">Detailed</option>
                            <option value="grid-dense">Grid Dense</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h2 className="font-semibold text-gray-800">Contact</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            Phone
                        </label>
                        <input value={fields.phone} placeholder="+91 98765 43210"
                            onChange={(e) => set("phone", e.target.value)}
                            className={inputClass} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            WhatsApp Number
                        </label>
                        <input value={fields.whatsapp} placeholder="919876543210"
                            onChange={(e) => set("whatsapp", e.target.value)}
                            className={inputClass} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            Email
                        </label>
                        <input value={fields.email} placeholder="hello@yourstore.com"
                            onChange={(e) => set("email", e.target.value)}
                            className={inputClass} />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-2">Features</h2>
                <Toggle label="Cash on Delivery" desc="Allow customers to pay on delivery"
                    value={fields.enableCOD} onChange={(v) => set("enableCOD", v)} />
                <Toggle label="Wishlist" desc="Let customers save products"
                    value={fields.enableWishlist} onChange={(v) => set("enableWishlist", v)} />
                <Toggle label="Coupons" desc="Enable discount coupon codes at checkout"
                    value={fields.enableCoupons} onChange={(v) => set("enableCoupons", v)} />
            </section>

            {/* Shipping */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h2 className="font-semibold text-gray-800">Shipping</h2>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Shipping Type
                    </label>
                    <select
                        value={fields.shippingType}
                        onChange={(e) => set("shippingType", e.target.value)}
                        className={inputClass}
                    >
                        <option value="free">Always Free</option>
                        <option value="flat_rate">Flat Rate</option>
                    </select>
                </div>
                {fields.shippingType === "flat_rate" && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                Flat Rate (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={fields.shippingFlatRate}
                                onChange={(e) => set("shippingFlatRate", e.target.value)}
                                placeholder="99"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                Free Above (₹) — optional
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={fields.shippingFreeAbove}
                                onChange={(e) => set("shippingFreeAbove", e.target.value)}
                                placeholder="e.g. 500"
                                className={inputClass}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Leave blank to always charge the flat rate
                            </p>
                        </div>
                    </div>
                )}
            </section>

            {/* Save */}
            <div className="flex items-center gap-3">
                <button type="submit" disabled={loading}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors">
                    {loading ? "Saving..." : "Save Settings"}
                </button>
                {saved && (
                    <span className="text-sm text-green-600 font-medium">✓ Saved</span>
                )}
            </div>
        </form>
    );
}