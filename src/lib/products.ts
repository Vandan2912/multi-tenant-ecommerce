import { db } from "./db";
import { Prisma } from "@prisma/client";

// ── Category tree ──────────────────────────────────────────
export async function getCategoryTree(tenantId: string) {
  const all = await db.category.findMany({
    where: { tenant_id: tenantId },
    orderBy: { name: "asc" },
  });

  // Build tree — parent categories with children nested
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

// ── Get all category IDs including children ────────────────
async function getCategoryIds(
  tenantId: string,
  slug: string
): Promise<string[]> {
  const cat = await db.category.findUnique({
    where: { tenant_id_slug: { tenant_id: tenantId, slug } },
    include: { children: true },
  });
  if (!cat) return [];
  return [cat.id, ...cat.children.map((c) => c.id)];
}

// ── Product list ───────────────────────────────────────────
export async function getProducts(
  tenantId: string,
  opts: {
    categorySlug?: string;
    brandSlug?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const { categorySlug, brandSlug, search, page = 1, limit = 12 } = opts;

  // Resolve category filter — include subcategories
  const categoryIds = categorySlug
    ? await getCategoryIds(tenantId, categorySlug)
    : [];

  const where: Prisma.ProductWhereInput = {
    tenant_id: tenantId,
    is_active: true,
    ...(categoryIds.length > 0 && {
      category_id: { in: categoryIds },
    }),
    ...(brandSlug && {
      brand: { slug: brandSlug },
    }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: { include: { parent: true } },
        brand: true,
        variants: {
          where: { is_active: true },
          orderBy: { price: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return { products, total, pages: Math.ceil(total / limit), page };
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