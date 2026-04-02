"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/lib/cart-context";

type Variant = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  unit: string | null;
  options: Record<string, string>;
  isActive: boolean;
};

type Props = {
  product: {
    id: string;
    name: string;
    image: string;
    variants: Variant[];
  };
  primaryColor: string;
};

export function VariantSelector({ product, primaryColor }: Props) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);

  const activeVariants = product.variants.filter((v) => v.isActive);

  // Collect all option keys (e.g. ["Color", "Size"])
  const optionKeys = useMemo(() => {
    const keys = new Set<string>();
    activeVariants.forEach((v) =>
      Object.keys(v.options).forEach((k) => keys.add(k)),
    );
    return Array.from(keys);
  }, [activeVariants]);

  // Selected option values
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    optionKeys.forEach((k) => {
      const first = activeVariants[0]?.options[k];
      if (first) init[k] = first;
    });
    return init;
  });

  // Find matching variant from selected options
  const matchedVariant = useMemo(() => {
    return (
      activeVariants.find((v) =>
        optionKeys.every((k) => v.options[k] === selected[k]),
      ) ?? null
    );
  }, [selected, activeVariants, optionKeys]);

  // Get all unique values for a given option key
  function getOptionsForKey(key: string): string[] {
    return Array.from(
      new Set(activeVariants.map((v) => v.options[key]).filter(Boolean)),
    );
  }

  // Check if a combination is in stock
  function isOptionAvailable(key: string, value: string): boolean {
    const tentative = { ...selected, [key]: value };
    const match = activeVariants.find((v) =>
      optionKeys.every((k) => v.options[k] === tentative[k]),
    );
    return match ? match.stock > 0 : false;
  }

  const inStock = matchedVariant ? matchedVariant.stock > 0 : false;
  const displayPrice = matchedVariant
    ? (matchedVariant.discountPrice ?? matchedVariant.price)
    : null;
  const originalPrice = matchedVariant?.price ?? null;
  const hasDiscount =
    displayPrice !== null &&
    originalPrice !== null &&
    displayPrice < originalPrice;

  const cartItem = items.find(
    (i) => i.productId === product.id && i.variant === matchedVariant?.name,
  );

  function handleAdd() {
    if (!matchedVariant || !inStock) return;
    addToCart(
      {
        id: `${product.id}-${matchedVariant.id}`,
        productId: product.id,
        name: product.name,
        price: displayPrice!,
        image: product.image,
        variant: matchedVariant.name,
      },
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  // Simple product — one variant, no option keys
  if (optionKeys.length === 0 && activeVariants.length === 1) {
    const v = activeVariants[0];
    const dp = v.discountPrice ?? v.price;
    const inS = v.stock > 0;
    return (
      <div className="space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold" style={{ color: primaryColor }}>
            ₹{dp.toLocaleString("en-IN")}
          </span>
          {v.discountPrice && (
            <span className="text-base text-gray-400 line-through">
              ₹{v.price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <p
          className={`text-sm font-medium ${inS ? "text-green-600" : "text-red-500"}`}
        >
          {inS
            ? `✓ In Stock (${v.stock} ${v.unit ?? "units"})`
            : "✗ Out of Stock"}
        </p>
        <SimpleAddButton
          product={{
            ...product,
            price: dp,
            stock: v.stock,
            variantName: v.name,
          }}
          primaryColor={primaryColor}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Option selectors */}
      {optionKeys.map((key) => (
        <div key={key}>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {key}
            {selected[key] && (
              <span className="ml-2 font-normal text-gray-500">
                {selected[key]}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {getOptionsForKey(key).map((value) => {
              const available = isOptionAvailable(key, value);
              const isSelected = selected[key] === value;
              return (
                <button
                  key={value}
                  onClick={() => setSelected((s) => ({ ...s, [key]: value }))}
                  disabled={!available}
                  className={`px-4 py-1.5 rounded-full text-sm border-2 transition-all font-medium
                    ${
                      isSelected
                        ? "text-white border-transparent"
                        : available
                          ? "text-gray-700 border-gray-200 hover:border-gray-400"
                          : "text-gray-300 border-gray-100 cursor-not-allowed line-through"
                    }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: primaryColor,
                          borderColor: primaryColor,
                        }
                      : {}
                  }
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Matched variant price + stock */}
      {matchedVariant && (
        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <span
              className="text-2xl font-bold"
              style={{ color: primaryColor }}
            >
              ₹{displayPrice!.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-gray-400 line-through">
                  ₹{originalPrice!.toLocaleString("en-IN")}
                </span>
                <span
                  className="text-sm font-bold text-white px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                >
                  {Math.round(
                    ((originalPrice! - displayPrice!) / originalPrice!) * 100,
                  )}
                  % OFF
                </span>
              </>
            )}
          </div>
          <p
            className={`text-sm font-medium ${inStock ? "text-green-600" : "text-red-500"}`}
          >
            {inStock
              ? `✓ In Stock (${matchedVariant.stock} ${matchedVariant.unit ?? "units"})`
              : "✗ Out of Stock"}
          </p>
          {matchedVariant.sku && (
            <p className="text-xs text-gray-400 font-mono">
              SKU: {matchedVariant.sku}
            </p>
          )}
        </div>
      )}

      {/* Add to cart */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={!matchedVariant || !inStock}
          className="flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          {!matchedVariant
            ? "Select options"
            : added
              ? "✓ Added to Cart"
              : !inStock
                ? "Out of Stock"
                : "Add to Cart"}
        </button>

        {cartItem && (
          <a
            href="/cart"
            className="px-5 py-3 rounded-xl font-semibold border-2 transition-colors text-sm"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Cart ({cartItem.quantity})
          </a>
        )}
      </div>
    </div>
  );
}

function SimpleAddButton({
  product,
  primaryColor,
}: {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    stock: number;
    variantName: string;
  };
  primaryColor: string;
}) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);

  const cartItem = items.find((i) => i.productId === product.id);
  const inStock = product.stock > 0;

  function handleAdd() {
    if (!inStock) return;
    addToCart(
      {
        id: `${product.id}-default`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        variant: product.variantName,
      },
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleAdd}
        disabled={!inStock}
        className="flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        style={{ backgroundColor: primaryColor }}
      >
        {added ? "✓ Added to Cart" : !inStock ? "Out of Stock" : "Add to Cart"}
      </button>
      {cartItem && (
        <a
          href="/cart"
          className="px-5 py-3 rounded-xl font-semibold border-2 text-sm"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          Cart ({cartItem.quantity})
        </a>
      )}
    </div>
  );
}
