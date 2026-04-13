export type WishlistItem = {
  id: string; // product id
  name: string;
  image: string;
  price: number;
  discountPrice: number | null;
  variantCount: number;
};

const WISHLIST_KEY = "wishlist";

export function getWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveWishlist(items: WishlistItem[]): void {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

export function toggleWishlist(item: WishlistItem): WishlistItem[] {
  const list = getWishlist();
  const exists = list.some((i) => i.id === item.id);
  const updated = exists ? list.filter((i) => i.id !== item.id) : [...list, item];
  saveWishlist(updated);
  return updated;
}

export function isWishlisted(id: string): boolean {
  return getWishlist().some((i) => i.id === id);
}

export function removeFromWishlist(id: string): WishlistItem[] {
  const updated = getWishlist().filter((i) => i.id !== id);
  saveWishlist(updated);
  return updated;
}
