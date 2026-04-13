"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  function handleAddToCart(item: (typeof items)[0]) {
    addToCart({
      id: `${item.id}-default`,
      productId: item.id,
      name: item.name,
      price: item.discountPrice ?? item.price,
      image: item.image,
    });
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1500);
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🤍</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Your wishlist is empty
        </h1>
        <p className="text-gray-400 mb-6">
          Save products you love and come back to them later.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wishlist</h1>
          <p className="text-sm text-gray-400 mt-0.5">{items.length} saved</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => {
          const effectivePrice = item.discountPrice ?? item.price;
          const discountPct =
            item.discountPrice && item.price
              ? Math.round(
                  ((item.price - item.discountPrice) / item.price) * 100
                )
              : null;

          return (
            <div key={item.id} className="group">
              <Link href={`/products/${item.id}`} className="block">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                      📦
                    </div>
                  )}
                  {discountPct && (
                    <span
                      className="absolute top-2 right-2 text-xs font-bold text-white px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      -{discountPct}%
                    </span>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      remove(item.id);
                    }}
                    aria-label="Remove from wishlist"
                    className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </Link>

              <div className="mt-2 px-0.5">
                <Link href={`/products/${item.id}`}>
                  <p className="text-sm font-medium text-gray-800 truncate hover:underline">
                    {item.name}
                  </p>
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    ₹{effectivePrice.toLocaleString("en-IN")}
                  </p>
                  {item.discountPrice && (
                    <p className="text-xs text-gray-400 line-through">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
                {item.variantCount > 1 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.variantCount} variants
                  </p>
                )}
                <button
                  onClick={() => handleAddToCart(item)}
                  className="mt-2 w-full text-xs font-medium py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {addedIds.has(item.id) ? "Added!" : item.variantCount > 1 ? "View Options" : "Add to Cart"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
