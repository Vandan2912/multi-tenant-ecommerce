"use client";

import { useState } from "react";

type CartItem = {
    productId: string;
    categoryId?: string | null;
    price: number;
    quantity: number;
};

type PromoResult = {
    promoCodeId: string;
    code: string;
    discount: number;
    message: string;
    isFreeShipping: boolean;
    discountType: string;
};

type Props = {
    cartItems: CartItem[];
    identifier: string;
    primaryColor: string;
    onApply: (result: PromoResult | null) => void;
    applied: PromoResult | null;
};

export function PromoInput({ cartItems, identifier, primaryColor, onApply, applied }: Props) {
    const [code, setCode] = useState(applied?.code ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleApply() {
        if (!code.trim()) return;
        setLoading(true);
        setError("");

        const res = await fetch("/api/promo/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code.trim(), cartItems, identifier }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.status === 429) {
            setError("Too many attempts. Please wait a minute.");
            return;
        }

        if (!data.valid) {
            setError(data.error ?? "Invalid promo code");
            onApply(null);
            return;
        }

        onApply({
            promoCodeId: data.promoCode.id,
            code: data.promoCode.code,
            discount: data.discount,
            message: data.message,
            isFreeShipping: data.promoCode.discount_type === "free_shipping",
            discountType: data.promoCode.discount_type,
        });
    }

    function handleRemove() {
        setCode("");
        setError("");
        onApply(null);
    }

    if (applied) {
        return (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div>
                    <p className="text-sm font-bold text-green-700 font-mono">{applied.code}</p>
                    <p className="text-xs text-green-600 mt-0.5">{applied.message}</p>
                </div>
                <button onClick={handleRemove}
                    className="text-green-500 hover:text-green-700 text-lg leading-none font-bold">
                    ×
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleApply()}
                    placeholder="Enter promo code"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-gray-200"
                    maxLength={30}
                />
                <button
                    onClick={handleApply}
                    disabled={loading || !code.trim()}
                    className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                >
                    {loading ? "..." : "Apply"}
                </button>
            </div>
            {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
        </div>
    );
}