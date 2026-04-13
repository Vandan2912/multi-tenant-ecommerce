import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { OptionValueMeta } from "@/lib/options";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const { id } = await params;
  const tenantId = session.user.tenantId;

  const [product, categories, brands, optionTypes] = await Promise.all([
    db.product.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        variants: { orderBy: { createdAt: "asc" } },
        productOptions: {
          orderBy: { position: "asc" },
          include: { optionType: true },
        },
      },
    }),
    db.category.findMany({
      where: { tenant_id: tenantId }, orderBy: { name: "asc" }, include: { parent: true },
    }),
    db.brand.findMany({
      where: { tenant_id: tenantId }, orderBy: { name: "asc" },
    }),
    db.optionType.findMany({
      where: { tenant_id: tenantId }, orderBy: { position: "asc" },
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
        optionTypes={optionTypes.map((o) => ({ ...o, values_json: o.values_json as OptionValueMeta[] }))}
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
            options_json: (v.options_json ?? {}) as Record<string, string>,
            is_active: v.is_active,
          })),
          productOptions: product.productOptions.map((po) => ({
            id: po.id,
            option_type_id: po.option_type_id,
            position: po.position,
            selected_values_json: po.selected_values_json as string[],
            optionType: {
              ...po.optionType,
              values_json: po.optionType.values_json as OptionValueMeta[],
            },
          })),
        }}
      />
    </div>
  );
}