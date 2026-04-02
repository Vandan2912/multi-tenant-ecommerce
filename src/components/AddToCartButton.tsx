"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { CartItem } from "@/lib/cart";

type Props = {
    product: {
        id: string;
        name: string;
        price: number;
        discountPrice: number | null;
        image: string;
        stock: number;
    };
    primaryColor: string;
};

export function AddToCartButton({ product, primaryColor }: Props) {
    const { addToCart, items } = useCart();
    const [added, setAdded] = useState(false);

    const cartItem = items.find((i) => i.productId === product.id);
    const displayPrice = product.discountPrice ?? product.price;

    function handleAdd() {
        const item: Omit<CartItem, "quantity"> = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: displayPrice,
            image: product.image,
        };
        addToCart(item, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    }

    return (
        <div className="flex gap-3 mt-2">
            <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                style={{ backgroundColor: primaryColor }}
            >
                {added ? "✓ Added to Cart" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            {cartItem && (
                <a
                    href="/cart"
                    className="px-5 py-3 rounded-xl font-semibold border-2 transition-colors"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                >
                    View Cart ({cartItem.quantity})
                </a>
            )
            }
        </div >
    );
}