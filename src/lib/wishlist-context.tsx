"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  WishlistItem,
  getWishlist,
  toggleWishlist as toggle,
  removeFromWishlist as remove,
} from "./wishlist";

type WishlistContext = {
  items: WishlistItem[];
  count: number;
  isWishlisted: (id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (id: string) => void;
};

const WishlistContext = createContext<WishlistContext | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(getWishlist());
  }, []);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems(toggle(item));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(remove(id));
  }, []);

  const isWishlisted = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        isWishlisted,
        toggle: toggleItem,
        remove: removeItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
