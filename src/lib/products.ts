import { Prisma } from "@prisma/client";
import { db } from "./db";

export async function getProducts(
    tenantId: string,
    opts: {
        categorySlug?: string;
        search?: string;
        page?: number;
        limit?: number;
    } = {}
) {
    const { categorySlug, search, page = 1, limit = 12 } = opts;

    const where: Prisma.ProductWhereInput = {
        tenant_id: tenantId,
        is_active: true,
        ...(categorySlug && {
            category: { slug: categorySlug },
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
            include: { category: true },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        db.product.count({ where }),
    ]);

    return { products, total, pages: Math.ceil(total / limit), page };
}

export async function getProductBySlug(tenantId: string, productId: string) {
    return db.product.findFirst({
        where: {
            id: productId,
            tenant_id: tenantId,
            is_active: true,
        },
        include: {
            category: true,
            variants: true,
        },
    });
}

export async function getCategories(tenantId: string) {
    return db.category.findMany({
        where: { tenant_id: tenantId },
        orderBy: { name: "asc" },
    });
}