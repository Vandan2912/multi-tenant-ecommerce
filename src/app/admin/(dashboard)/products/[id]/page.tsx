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
  const tenantId = session.user.tenantId;

  const [product, categories, brands] = await Promise.all([
    db.product.findFirst({
      where: { id, tenant_id: tenantId },
      include: { variants: { orderBy: { createdAt: "asc" } } },
    }),
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

  if (!product) notFound();

  const specs = product.specs_json as Record<string, string> | null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Product</h1>
      <p className="text-sm text-gray-400 font-mono mb-8">{product.id}</p>
      <ProductForm
        categories={categories}
        brands={brands}
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          category_id: product.category_id ?? "",
          brand_id: product.brand_id ?? "",
          images: product.images.join("\n"),
          is_active: product.is_active,
          specs: specs
            ? Object.entries(specs).map(([key, value]) => ({ key, value }))
            : [],
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku ?? "",
            price: String(v.price),
            discount_price: v.discount_price ? String(v.discount_price) : "",
            stock: String(v.stock),
            unit: v.unit ?? "piece",
            options: Object.entries(
              (v.options_json as Record<string, string>) ?? {},
            ).map(([key, value]) => ({ key, value })),
            is_active: v.is_active,
          })),
        }}
      />
    </div>
  );
}
