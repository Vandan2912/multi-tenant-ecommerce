"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import {
    CartItem,
    getCart,
    addToCart as addItem,
    updateQuantity as updateQty,
    removeFromCart as removeItem,
    clearCart as clear,
    getCartTotal,
    getCartCount,
} from "./cart";

type CartContext = {
    items: CartItem[];
    count: number;
    total: number;
    addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
    updateQuantity: (id: string, qty: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        setItems(getCart());
    }, []);

    const addToCart = useCallback(
        (item: Omit<CartItem, "quantity">, qty = 1) => {
            setItems(addItem(item, qty));
        },
        []
    );

    const updateQuantity = useCallback((id: string, qty: number) => {
        setItems(updateQty(id, qty));
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setItems(removeItem(id));
    }, []);

    const clearCart = useCallback(() => {
        clear();
        setItems([]);
    }, []);

    return (
        <CartContext.Provider
            value={{
                items,
                count: getCartCount(items),
                total: getCartTotal(items),
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
}