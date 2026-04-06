import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PromoManager } from "@/components/admin/PromoManager";

export default async function AdminPromosPage() {
    const session = await auth();
    if (!session?.user?.tenantId) redirect("/admin/login");

    const [promos, products, categories] = await Promise.all([
        db.promoCode.findMany({
            where: { tenant_id: session.user.tenantId },
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { usages: true } } },
        }),
        db.product.findMany({
            where: { tenant_id: session.user.tenantId, is_active: true },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
        db.category.findMany({
            where: { tenant_id: session.user.tenantId },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
    ]);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Promo Codes</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Create and manage discount codes for your store
                </p>
            </div>
            <PromoManager
                initialPromos={promos.map((p) => ({
                    ...p,
                    discount_value: Number(p.discount_value),
                    minimum_order_value: p.minimum_order_value ? Number(p.minimum_order_value) : null,
                    maximum_discount: p.maximum_discount ? Number(p.maximum_discount) : null,
                    start_date: p.start_date ? p.start_date.toISOString().slice(0, 10) : "",
                    expiry_date: p.expiry_date ? p.expiry_date.toISOString().slice(0, 10) : "",
                    usageCount: p._count.usages,
                }))}
                products={products}
                categories={categories}
            />
        </div>
    );
}