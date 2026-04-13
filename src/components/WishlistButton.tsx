"use client";

import { useWishlist } from "@/lib/wishlist-context";
import type { WishlistItem } from "@/lib/wishlist";

type Props = {
  item: Omit<WishlistItem, never>;
  className?: string;
};

export function WishlistButton({ item, className = "" }: Props) {
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(item.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow transition-transform hover:scale-110 ${className}`}
    >
      <svg
        className="w-4 h-4"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: wishlisted ? "#ef4444" : "#9ca3af" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
