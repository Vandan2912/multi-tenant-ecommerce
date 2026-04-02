import Link from "next/link";
import { Product, Category } from "@prisma/client";

type ProductWithCategory = Product & { category: Category | null };

type Props = {
    product: ProductWithCategory;
    style?: "minimal" | "detailed" | "grid-dense";
    primaryColor?: string;
};

export function ProductCard({ product, style = "minimal", primaryColor = "#2563EB" }: Props) {
    const hasDiscount =
        product.discount_price !== null &&
        Number(product.discount_price) < Number(product.price);

    const displayPrice = hasDiscount
        ? Number(product.discount_price)
        : Number(product.price);

    const discountPercent = hasDiscount
        ? Math.round(
            ((Number(product.price) - Number(product.discount_price)) /
                Number(product.price)) *
            100
        )
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
                    {discountPercent && (
                        <span className="absolute top-2 left-2 text-xs font-bold text-white px-2 py-1 rounded-full"
                            style={{ backgroundColor: primaryColor }}>
                            -{discountPercent}%
                        </span>
                    )}
                </div>
                <div className="mt-2 px-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: primaryColor }}>
                        ₹{displayPrice.toLocaleString("en-IN")}
                    </p>
                </div>
            </Link>
        );
    }

    if (style === "detailed") {
        return (
            <Link href={`/products/${product.id}`} className="group block border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    {product.images[0] && (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    )}
                    {discountPercent && (
                        <span className="absolute top-3 left-3 text-xs font-bold text-white px-2 py-1 rounded-full"
                            style={{ backgroundColor: primaryColor }}>
                            {discountPercent}% OFF
                        </span>
                    )}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-500">Out of Stock</span>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    {product.category && (
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                            {product.category.name}
                        </p>
                    )}
                    <h3 className="font-semibold text-gray-800 leading-snug">{product.name}</h3>
                    {product.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                        <span className="font-bold text-lg" style={{ color: primaryColor }}>
                            ₹{displayPrice.toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                                ₹{Number(product.price).toLocaleString("en-IN")}
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
                {discountPercent && (
                    <span className="absolute top-2 right-2 text-xs font-bold text-white px-2 py-1 rounded-full"
                        style={{ backgroundColor: primaryColor }}>
                        -{discountPercent}%
                    </span>
                )}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
                        <span className="text-xs font-semibold text-gray-500">Out of Stock</span>
                    </div>
                )}
            </div>
            <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-800 truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-sm" style={{ color: primaryColor }}>
                        ₹{displayPrice.toLocaleString("en-IN")}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}