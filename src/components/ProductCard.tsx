import Link from "next/link";

type Variant = {
  price: unknown;
  discount_price?: unknown;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  images: string[];
  brand?: { name: string } | null;
  category?: { name: string; parent?: { name: string } | null } | null;
  variants: Variant[];
};

type Props = {
  product: Product;
  style?: "minimal" | "detailed" | "grid-dense";
  primaryColor?: string;
  wishlistButton?: React.ReactNode;
};

function getPrice(variants: Variant[]) {
  if (variants.length === 0) return { price: 0, discountPrice: null };
  const first = variants[0];
  return {
    price: Number(first.price),
    discountPrice: first.discount_price ? Number(first.discount_price) : null,
  };
}

function getPriceRange(variants: Variant[]) {
  if (variants.length === 0) return null;
  const prices = variants.map((v) => {
    const p = Number(v.price);
    const d = v.discount_price ? Number(v.discount_price) : null;
    return d ?? p;
  });
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? null : { min, max };
}

function getTotalStock(variants: Variant[]) {
  return variants.reduce((s, v) => s + v.stock, 0);
}

function PriceDisplay({
  variants,
  primaryColor,
  size = "sm",
}: {
  variants: Variant[];
  primaryColor: string;
  size?: "sm" | "lg";
}) {
  const { price, discountPrice } = getPrice(variants);
  const range = getPriceRange(variants);
  const textSize = size === "lg" ? "text-2xl" : "text-sm";
  const subSize = size === "lg" ? "text-base" : "text-xs";

  if (range) {
    return (
      <p className={`font-bold ${textSize}`} style={{ color: primaryColor }}>
        ₹{range.min.toLocaleString("en-IN")} – ₹
        {range.max.toLocaleString("en-IN")}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <p className={`font-bold ${textSize}`} style={{ color: primaryColor }}>
        ₹{(discountPrice ?? price).toLocaleString("en-IN")}
      </p>
      {discountPrice && (
        <p className={`text-gray-400 line-through ${subSize}`}>
          ₹{price.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}

export function ProductCard({
  product,
  style = "minimal",
  primaryColor = "#2563EB",
  wishlistButton,
}: Props) {
  const { price, discountPrice } = getPrice(product.variants);
  const totalStock = getTotalStock(product.variants);
  const outOfStock = totalStock === 0;

  const discountPct =
    discountPrice && price
      ? Math.round(((price - discountPrice) / price) * 100)
      : null;

  if (style === "grid-dense") {
    return (
      <Link href={`/products/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
          {product.images[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          {discountPct && (
            <span
              className="absolute top-2 left-2 text-xs font-bold text-white px-2 py-0.5 rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              -{discountPct}%
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500">
                Out of Stock
              </span>
            </div>
          )}
          {wishlistButton && (
            <div className="absolute bottom-2 right-2">{wishlistButton}</div>
          )}
        </div>
        <div className="mt-2 px-0.5">
          {product.brand && (
            <p className="text-xs text-gray-400 mb-0.5">{product.brand.name}</p>
          )}
          <p className="text-sm font-medium text-gray-800 truncate">
            {product.name}
          </p>
          <PriceDisplay
            variants={product.variants}
            primaryColor={primaryColor}
          />
        </div>
      </Link>
    );
  }

  if (style === "detailed") {
    return (
      <Link
        href={`/products/${product.id}`}
        className="group block border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.images[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          {discountPct && (
            <span
              className="absolute top-3 left-3 text-xs font-bold text-white px-2 py-1 rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              {discountPct}% OFF
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-500">
                Out of Stock
              </span>
            </div>
          )}
          {wishlistButton && (
            <div className="absolute bottom-3 right-3">{wishlistButton}</div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            {product.brand && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {product.brand.name}
              </p>
            )}
            {product.category && (
              <p className="text-xs text-gray-400">
                {product.category.parent
                  ? `${product.category.parent.name} › ${product.category.name}`
                  : product.category.name}
              </p>
            )}
          </div>
          <h3 className="font-semibold text-gray-800 leading-snug">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <PriceDisplay
              variants={product.variants}
              primaryColor={primaryColor}
            />
            {product.variants.length > 1 && (
              <span className="text-xs text-gray-400">
                {product.variants.length} variants
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // minimal (default)
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        {product.images[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {discountPct && (
          <span
            className="absolute top-2 right-2 text-xs font-bold text-white px-2 py-0.5 rounded-full"
            style={{ backgroundColor: primaryColor }}
          >
            -{discountPct}%
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
            <span className="text-xs font-semibold text-gray-500">
              Out of Stock
            </span>
          </div>
        )}
        {wishlistButton && (
          <div className="absolute bottom-2 right-2">{wishlistButton}</div>
        )}
      </div>
      <div className="mt-3">
        {product.brand && (
          <p className="text-xs text-gray-400 mb-0.5">{product.brand.name}</p>
        )}
        <h3 className="text-sm font-medium text-gray-800 truncate">
          {product.name}
        </h3>
        <PriceDisplay variants={product.variants} primaryColor={primaryColor} />
      </div>
    </Link>
  );
}
