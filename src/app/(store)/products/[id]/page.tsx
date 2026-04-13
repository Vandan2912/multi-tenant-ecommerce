import { getTenantWithConfig } from "@/lib/tenant";
import { getProductById } from "@/lib/products";
import { VariantSelector } from "@/components/VariantSelector";
import { WishlistButton } from "@/components/WishlistButton";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  let tenant;
  try {
    tenant = await getTenantWithConfig();
  } catch {
    notFound();
  }

  const product = await getProductById(tenant.id, id);
  if (!product) notFound();

  const primaryColor = tenant.storeConfig?.primary_color ?? "#2563EB";
  const specs = product.specs_json as Record<string, string> | null;

  // Lowest active price for display
  const activeVariants = product.variants.filter((v) => v.is_active);
  const prices = activeVariants.map((v) =>
    v.discount_price ? Number(v.discount_price) : Number(v.price),
  );
  const lowestPrice = prices.length ? Math.min(...prices) : 0;
  const highestPrice = prices.length ? Math.max(...prices) : 0;
  const priceRange = lowestPrice !== highestPrice;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8 flex-wrap">
        <a href="/products" className="text-gray-400 hover:underline">
          Products
        </a>
        {product.category?.parent && (
          <>
            <span className="text-gray-300">/</span>
            <a
              href={`/products?category=${product.category.parent.slug}`}
              className="text-gray-400 hover:underline"
            >
              {product.category.parent.name}
            </a>
          </>
        )}
        {product.category && (
          <>
            <span className="text-gray-300">/</span>
            <a
              href={`/products?category=${product.category.slug}`}
              className="text-gray-400 hover:underline"
            >
              {product.category.name}
            </a>
          </>
        )}
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
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
        <div className="flex flex-col gap-5">
          {/* Brand + category */}
          <div className="flex items-center gap-3">
            {product.brand && (
              <a
                href={`/products?brand=${product.brand.slug}`}
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                {product.brand.name}
              </a>
            )}
            {product.category && (
              <span className="text-xs text-gray-400">
                {product.category.parent
                  ? `${product.category.parent.name} › ${product.category.name}`
                  : product.category.name}
              </span>
            )}
          </div>

          {/* Name + wishlist */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-800 leading-tight">
              {product.name}
            </h1>
            <WishlistButton
              item={{
                id: product.id,
                name: product.name,
                image: product.images[0] ?? "",
                price: activeVariants[0] ? Number(activeVariants[0].price) : 0,
                discountPrice: activeVariants[0]?.discount_price
                  ? Number(activeVariants[0].discount_price)
                  : null,
                variantCount: activeVariants.length,
              }}
              className="shrink-0 mt-1"
            />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-3xl font-bold"
              style={{ color: primaryColor }}
            >
              {priceRange
                ? `₹${lowestPrice.toLocaleString("en-IN")} – ₹${highestPrice.toLocaleString("en-IN")}`
                : `₹${lowestPrice.toLocaleString("en-IN")}`}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Variant selector + add to cart — client component */}
          <VariantSelector
            product={{
              id: product.id,
              name: product.name,
              image: product.images[0] ?? "",
              variants: product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                sku: v.sku,
                price: Number(v.price),
                discountPrice: v.discount_price
                  ? Number(v.discount_price)
                  : null,
                stock: v.stock,
                unit: v.unit,
                options: v.options_json as Record<string, string>,
                isActive: v.is_active,
              })),
            }}
            primaryColor={primaryColor}
          />
        </div>
      </div>

      {/* Specifications */}
      {specs && Object.keys(specs).length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Specifications
          </h2>
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            {Object.entries(specs).map(([key, value], i) => (
              <div
                key={key}
                className={`flex gap-4 px-6 py-3 text-sm ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <span className="w-40 shrink-0 text-gray-500 font-medium">
                  {key}
                </span>
                <span className="text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
