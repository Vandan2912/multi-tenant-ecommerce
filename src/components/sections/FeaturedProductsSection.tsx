import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import type { FeaturedProductsConfig } from "@/lib/page-builder/sections";

async function fetchProducts(
  tenantId: string,
  config: FeaturedProductsConfig,
) {
  const limit = Math.max(1, Math.min(config.limit ?? 8, 24));

  if (config.mode === "manual" && config.productIds?.length) {
    return db.product.findMany({
      where: {
        tenant_id: tenantId,
        is_active: true,
        id: { in: config.productIds },
      },
      include: {
        brand: true,
        category: { include: { parent: true } },
        variants: { where: { is_active: true }, orderBy: { price: "asc" } },
      },
      take: limit,
    });
  }

  if (config.mode === "category" && config.categorySlug) {
    const cat = await db.category.findUnique({
      where: {
        tenant_id_slug: { tenant_id: tenantId, slug: config.categorySlug },
      },
      include: { children: true },
    });
    if (!cat) return [];
    const categoryIds = [cat.id, ...cat.children.map((c) => c.id)];
    return db.product.findMany({
      where: {
        tenant_id: tenantId,
        is_active: true,
        category_id: { in: categoryIds },
      },
      include: {
        brand: true,
        category: { include: { parent: true } },
        variants: { where: { is_active: true }, orderBy: { price: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  // latest (default)
  return db.product.findMany({
    where: { tenant_id: tenantId, is_active: true },
    include: {
      brand: true,
      category: { include: { parent: true } },
      variants: { where: { is_active: true }, orderBy: { price: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function FeaturedProductsSection({
  tenantId,
  primaryColor,
  config,
}: {
  tenantId: string;
  primaryColor: string;
  config: FeaturedProductsConfig;
}) {
  const products = await fetchProducts(tenantId, config);
  if (products.length === 0) return null;

  const cardStyle = config.cardStyle ?? "minimal";

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {config.title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {config.title}
        </h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            style={cardStyle}
            primaryColor={primaryColor}
          />
        ))}
      </div>
    </section>
  );
}
