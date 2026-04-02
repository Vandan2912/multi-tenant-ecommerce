import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BrandManager } from "@/components/admin/BrandManager";

export default async function AdminBrandsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const brands = await db.brand.findMany({
    where: { tenant_id: session.user.tenantId },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Brands</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage product brands for your store
        </p>
      </div>
      <BrandManager initialBrands={brands} />
    </div>
  );
}
