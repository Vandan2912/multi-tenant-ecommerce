"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

type Props = {
    storeName: string;
    primaryColor: string;
    logoUrl?: string | null;
};

export function Navbar({ storeName, primaryColor, logoUrl }: Props) {
    const { count } = useCart();

    return (
        <nav
            className="sticky top-0 z-50 border-b border-black/10"
            style={{ backgroundColor: primaryColor }}
        >
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo / store name */}
                <Link href="/" className="flex items-center gap-2">
                    {logoUrl ? (
                        <img src={logoUrl} alt={storeName} className="h-8 w-auto" />
                    ) : (
                        <span className="font-bold text-white text-lg tracking-tight">
                            {storeName}
                        </span>
                    )}
                </Link>

                {/* Links */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/products"
                        className="text-white/90 hover:text-white text-sm font-medium transition-colors"
                    >
                        Products
                    </Link>

                    {/* Cart icon */}
                    <Link
                        href="/cart"
                        className="relative text-white hover:text-white/80 transition-colors"
                        aria-label="Cart"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        {count > 0 && (
                            <span className="absolute -top-2 -right-2 bg-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ color: primaryColor }}>
                                {count > 99 ? "99+" : count}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
}