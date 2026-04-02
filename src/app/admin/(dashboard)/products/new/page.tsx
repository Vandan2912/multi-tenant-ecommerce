import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
    const session = await auth();
    if (!session?.user?.tenantId) redirect("/admin/login");

    const categories = await db.category.findMany({
        where: { tenant_id: session.user.tenantId },
        orderBy: { name: "asc" },
    });

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Add Product</h1>
            </div>
            <ProductForm categories={categories} mode="create" />
        </div>
    );
}