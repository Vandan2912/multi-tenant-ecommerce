"use client";

import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, total } = useCart();
    const [primaryColor, setPrimaryColor] = useState("#2563EB");

    useEffect(() => {
        const color = getComputedStyle(document.documentElement)
            .getPropertyValue("--color-primary")
            .trim();
        if (color) setPrimaryColor(color);
    }, []);

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
                <p className="text-5xl">🛒</p>
                <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
                <p className="text-gray-400 text-sm">Add some products to get started</p>
                <Link
                    href="/products"
                    className="mt-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold"
                    style={{ backgroundColor: primaryColor }}
                >
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Your Cart</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* ── Items ─────────────────────────────────────────── */}
                <div className="md:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
                        >
                            {/* Image */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                                        📦
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
                                {item.variant && (
                                    <p className="text-xs text-gray-400 mt-0.5">{item.variant}</p>
                                )}
                                <p className="font-bold mt-1" style={{ color: primaryColor }}>
                                    ₹{item.price.toLocaleString("en-IN")}
                                </p>
                            </div>

                            {/* Qty controls */}
                            <div className="flex flex-col items-end justify-between shrink-0">
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-gray-300 hover:text-red-400 transition-colors text-lg"
                                    aria-label="Remove"
                                >
                                    ×
                                </button>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="text-gray-500 hover:text-gray-800 w-5 text-center font-bold"
                                    >
                                        −
                                    </button>
                                    <span className="text-sm font-medium w-4 text-center">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="text-gray-500 hover:text-gray-800 w-5 text-center font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Summary ────────────────────────────────────────── */}
                <div className="h-fit bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="font-semibold text-gray-800 text-lg">Order Summary</h2>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>₹{total.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Shipping</span>
                            <span className="text-green-600 font-medium">Free</span>
                        </div>
                        <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800 text-base">
                            <span>Total</span>
                            <span>₹{total.toLocaleString("en-IN")}</span>
                        </div>
                    </div>

                    <Link
                        href="/checkout"
                        className="block w-full py-3 rounded-xl text-white text-center font-semibold text-sm transition-opacity hover:opacity-90"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Proceed to Checkout →
                    </Link>

                    <Link
                        href="/products"
                        className="block w-full py-2.5 rounded-xl text-center text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}