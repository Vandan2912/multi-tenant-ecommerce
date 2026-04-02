import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user?.tenantId) redirect("/admin/login");

    const { id } = await params;

    const [product, categories] = await Promise.all([
        db.product.findFirst({
            where: { id, tenant_id: session.user.tenantId },
        }),
        db.category.findMany({
            where: { tenant_id: session.user.tenantId },
            orderBy: { name: "asc" },
        }),
    ]);

    if (!product) notFound();

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
                <p className="text-sm text-gray-400 font-mono mt-1">{product.id}</p>
            </div>
            <ProductForm
                categories={categories}
                mode="edit"
                initialData={{
                    id: product.id,
                    name: product.name,
                    description: product.description ?? "",
                    price: String(product.price),
                    discount_price: product.discount_price ? String(product.discount_price) : "",
                    stock: String(product.stock),
                    category_id: product.category_id ?? "",
                    images: product.images.join("\n"),
                    is_active: product.is_active,
                }}
            />
        </div>
    );
}