"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

function OrderConfirmedContent() {
    const params = useSearchParams();
    const orderId = params.get("id");
    const total = params.get("total");
    const [primaryColor, setPrimaryColor] = useState("#2563EB");

    useEffect(() => {
        const color = getComputedStyle(document.documentElement)
            .getPropertyValue("--color-primary").trim();
        if (color) setPrimaryColor(color);
    }, []);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-6">
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                style={{ backgroundColor: `${primaryColor}18` }}
            >
                ✓
            </div>

            <div>
                <h1 className="text-2xl font-bold text-gray-800">Order Confirmed!</h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Thank you for your order. We&apos;ll get it to you soon.
                </p>
            </div>

            {orderId && (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-8 py-5 space-y-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Order ID</p>
                    <p className="font-mono font-semibold text-gray-700 text-sm">{orderId}</p>
                    {total && (
                        <>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mt-3">
                                Amount
                            </p>
                            <p className="font-bold text-lg" style={{ color: primaryColor }}>
                                ₹{Number(total).toLocaleString("en-IN")}
                            </p>
                        </>
                    )}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
                {orderId && (
                    <Link
                        href={`/orders/track?id=${orderId}`}
                        className="px-6 py-2.5 rounded-full text-white text-sm font-semibold text-center"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Track Order
                    </Link>
                )}
                <Link
                    href="/products"
                    className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 text-center"
                >
                    Continue Shopping
                </Link>
                <Link
                    href="/"
                    className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 text-center"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}

export default function OrderConfirmedPage() {
    return (
        <Suspense>
            <OrderConfirmedContent />
        </Suspense>
    );
}