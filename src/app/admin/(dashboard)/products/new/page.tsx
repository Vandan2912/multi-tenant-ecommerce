import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const tenantId = session.user.tenantId;

  const [categories, brands] = await Promise.all([
    db.category.findMany({
      where: { tenant_id: tenantId },
      orderBy: { name: "asc" },
      include: { parent: true },
    }),
    db.brand.findMany({
      where: { tenant_id: tenantId },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Add Product</h1>
      <ProductForm categories={categories} brands={brands} mode="create" />
    </div>
  );
}
