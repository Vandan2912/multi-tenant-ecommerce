import { db } from "./db";
import { Prisma } from "@prisma/client";

// ── Types ──────────────────────────────────────────────────
export type FilterParams = {
  categorySlug?: string;
  brandSlugs?: string[];   // multiple brands
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  page?: number;
  limit?: number;
};

// ── Category helpers ───────────────────────────────────────
export async function getCategoryTree(tenantId: string) {
  const all = await db.category.findMany({
    where: { tenant_id: tenantId },
    orderBy: { name: "asc" },
  });
  const roots = all.filter((c) => !c.parent_id);
  return roots.map((root) => ({
    ...root,
    children: all.filter((c) => c.parent_id === root.id),
  }));
}

export async function getCategories(tenantId: string) {
  return db.category.findMany({
    where: { tenant_id: tenantId },
    orderBy: { name: "asc" },
    include: { parent: true, children: true },
  });
}

export async function getBrands(tenantId: string) {
  return db.brand.findMany({
    where: { tenant_id: tenantId },
    orderBy: { name: "asc" },
  });
}

async function getCategoryIds(tenantId: string, slug: string): Promise<string[]> {
  const cat = await db.category.findUnique({
    where: { tenant_id_slug: { tenant_id: tenantId, slug } },
    include: { children: true },
  });
  if (!cat) return [];
  return [cat.id, ...cat.children.map((c) => c.id)];
}

// ── Price range for a tenant (for slider bounds) ───────────
export async function getPriceRange(tenantId: string) {
  const result = await db.variant.aggregate({
    where: { tenant_id: tenantId, is_active: true },
    _min: { price: true },
    _max: { price: true },
  });
  return {
    min: Math.floor(Number(result._min.price ?? 0)),
    max: Math.ceil(Number(result._max.price ?? 100000)),
  };
}

// ── Main product query ─────────────────────────────────────
export async function getProducts(tenantId: string, opts: FilterParams = {}) {
  const {
    categorySlug,
    brandSlugs = [],
    search,
    minPrice,
    maxPrice,
    inStock,
    sort = "newest",
    page = 1,
    limit = 12,
  } = opts;

  // Resolve category IDs (includes subcategories)
  const categoryIds = categorySlug
    ? await getCategoryIds(tenantId, categorySlug)
    : [];

  // Find product IDs that have variants matching price/stock filters
  const variantWhere: Prisma.VariantWhereInput = {
    tenant_id: tenantId,
    is_active: true,
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
        OR: [
          {
            discount_price: {
              not: null,
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          },
          {
            discount_price: null,
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          },
        ],
      }
      : {}),
    ...(inStock ? { stock: { gt: 0 } } : {}),
  };

  // Get product IDs that match variant filters
  let filteredProductIds: string[] | undefined;
  if (minPrice !== undefined || maxPrice !== undefined || inStock) {
    const matchingVariants = await db.variant.findMany({
      where: variantWhere,
      select: { product_id: true },
      distinct: ["product_id"],
    });
    filteredProductIds = matchingVariants.map((v) => v.product_id);
    if (filteredProductIds.length === 0) {
      return { products: [], total: 0, pages: 0, page, priceRange: await getPriceRange(tenantId) };
    }
  }

  // Build product where clause
  const productWhere: Prisma.ProductWhereInput = {
    tenant_id: tenantId,
    is_active: true,
    ...(categoryIds.length > 0 && { category_id: { in: categoryIds } }),
    ...(brandSlugs.length > 0 && { brand: { slug: { in: brandSlugs } } }),
    ...(filteredProductIds && { id: { in: filteredProductIds } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
        { category: { name: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  // Sort
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc" ? { variants: { _count: "asc" } } :
      sort === "price_desc" ? { variants: { _count: "desc" } } :
        sort === "name_asc" ? { name: "asc" } :
          { createdAt: "desc" };

  const [products, total, priceRange] = await Promise.all([
    db.product.findMany({
      where: productWhere,
      include: {
        category: { include: { parent: true } },
        brand: true,
        variants: {
          where: { is_active: true },
          orderBy: { price: "asc" },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where: productWhere }),
    getPriceRange(tenantId),
  ]);

  // For price sort, sort in memory by actual variant price
  let sorted = products;
  if (sort === "price_asc" || sort === "price_desc") {
    sorted = [...products].sort((a, b) => {
      const priceOf = (p: typeof a) => {
        const v = p.variants[0];
        if (!v) return 0;
        return v.discount_price ? Number(v.discount_price) : Number(v.price);
      };
      return sort === "price_asc"
        ? priceOf(a) - priceOf(b)
        : priceOf(b) - priceOf(a);
    });
  }

  return {
    products: sorted,
    total,
    pages: Math.ceil(total / limit),
    page,
    priceRange,
  };
}

// ── Single product ─────────────────────────────────────────
export async function getProductById(tenantId: string, productId: string) {
  return db.product.findFirst({
    where: { id: productId, tenant_id: tenantId, is_active: true },
    include: {
      category: { include: { parent: true } },
      brand: true,
      variants: {
        where: { is_active: true },
        orderBy: { price: "asc" },
      },
    },
  });
}

// ── Autocomplete search ────────────────────────────────────
export async function searchProducts(tenantId: string, query: string, limit = 8) {
  if (!query || query.trim().length < 2) return [];

  const products = await db.product.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { brand: { name: { contains: query, mode: "insensitive" } } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      variants: {
        where: { is_active: true },
        orderBy: { price: "asc" },
        take: 1,
      },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand?.name ?? null,
    category: p.category?.name ?? null,
    image: p.images[0] ?? null,
    price: p.variants[0]
      ? (p.variants[0].discount_price
        ? Number(p.variants[0].discount_price)
        : Number(p.variants[0].price))
      : null,
  }));
}