import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { PageBuilder } from "@/components/admin/PageBuilder";
import { parseSections } from "@/lib/page-builder/sections";

export default async function EditPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const { id } = await params;
  const page = await db.pageConfig.findFirst({
    where: { id, tenant_id: session.user.tenantId },
  });
  if (!page) notFound();

  const [categories, products] = await Promise.all([
    db.category.findMany({
      where: { tenant_id: session.user.tenantId },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: { tenant_id: session.user.tenantId, is_active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-8">
      <PageBuilder
        page={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          page_type: page.page_type,
          is_published: page.is_published,
          sections: parseSections(page.sections_json),
        }}
        categories={categories}
        products={products}
      />
    </div>
  );
}
