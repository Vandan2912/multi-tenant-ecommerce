import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const categories = await db.category.findMany({
    where: { tenant_id: session.user.tenantId },
    orderBy: { createdAt: "asc" },
    include: { parent: true, children: true },
  });

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <p className="text-sm text-gray-400 mt-1">
          Add top-level categories and subcategories under them
        </p>
      </div>
      <CategoryManager
        tenantId={session.user.tenantId}
        initialCategories={categories}
      />
    </div>
  );
}
