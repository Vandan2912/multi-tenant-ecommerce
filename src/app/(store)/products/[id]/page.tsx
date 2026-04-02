import { getTenantWithConfig } from "@/lib/tenant";
import { getProductBySlug } from "@/lib/products";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
    const { id } = await params;

    let tenant;
    try {
        tenant = await getTenantWithConfig();
    } catch {
        notFound();
    }

    const product = await getProductBySlug(tenant.id, id);
    if (!product) notFound();

    const primaryColor = tenant.storeConfig?.primary_color ?? "#2563EB";
    const inStock = product.stock > 0;

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

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            {/* Back */}
            <a
                href="/products"
                className="text-sm font-medium hover:underline mb-8 inline-block"
                style={{ color: primaryColor }}
            >
                ← Back to Products
            </a>

            <div className="grid md:grid-cols-2 gap-10 mt-4">
                {/* Image */}
                <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                    {product.images[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
                            📦
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-4">
                    {product.category && (
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                            {product.category.name}
                        </p>
                    )}

                    <h1 className="text-3xl font-bold text-gray-800 leading-tight">
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                            ₹{displayPrice.toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                            <>
                                <span className="text-xl text-gray-400 line-through">
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </span>
                                <span
                                    className="text-sm font-bold text-white px-2 py-1 rounded-full"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {discountPercent}% OFF
                                </span>
                            </>
                        )}
                    </div>

                    {/* Stock */}
                    <p className={`text-sm font-medium ${inStock ? "text-green-600" : "text-red-500"}`}>
                        {inStock ? `✓ In Stock (${product.stock} left)` : "✗ Out of Stock"}
                    </p>

                    {/* Description */}
                    {product.description && (
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    )}

                    {/* Variants */}
                    {product.variants.length > 0 && (
                        <div className="space-y-3">
                            {product.variants.map((v) => {
                                const options = v.options as string[];
                                return (
                                    <div key={v.id}>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">{v.label}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {options.map((opt) => (
                                                <button
                                                    key={opt}
                                                    className="px-4 py-1.5 border border-gray-200 rounded-full text-sm hover:border-current transition-colors"
                                                    style={{ color: primaryColor }}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* CTA */}
                    <AddToCartButton
                        product={{
                            id: product.id,
                            name: product.name,
                            price: Number(product.price),
                            discountPrice: product.discount_price
                                ? Number(product.discount_price)
                                : null,
                            image: product.images[0] ?? "",
                            stock: product.stock,
                        }}
                        primaryColor={primaryColor}
                    />
                </div>
            </div>
        </div >
    );
}