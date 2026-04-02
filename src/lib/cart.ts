export type CartItem = {
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variant?: string;
};

const CART_KEY = "cart";

export function getCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    } catch {
        return [];
    }
}

export function saveCart(items: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
    const cart = getCart();
    const existing = cart.find(
        (i) => i.productId === item.productId && i.variant === item.variant
    );

    if (existing) {
        existing.quantity += quantity;
        saveCart(cart);
        return cart;
    }

    const updated = [...cart, { ...item, quantity }];
    saveCart(updated);
    return updated;
}

export function updateQuantity(id: string, quantity: number) {
    const cart = getCart();
    if (quantity <= 0) {
        const updated = cart.filter((i) => i.id !== id);
        saveCart(updated);
        return updated;
    }
    const updated = cart.map((i) => (i.id === id ? { ...i, quantity } : i));
    saveCart(updated);
    return updated;
}

export function removeFromCart(id: string) {
    const updated = getCart().filter((i) => i.id !== id);
    saveCart(updated);
    return updated;
}

export function clearCart() {
    localStorage.removeItem(CART_KEY);
}

export function getCartTotal(items: CartItem[]) {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function getCartCount(items: CartItem[]) {
    return items.reduce((sum, i) => sum + i.quantity, 0);
}