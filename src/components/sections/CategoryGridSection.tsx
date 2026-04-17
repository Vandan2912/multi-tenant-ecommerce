import Link from "next/link";
import { db } from "@/lib/db";
import type { CategoryGridConfig } from "@/lib/page-builder/sections";

const COL_CLASS: Record<2 | 3 | 4 | 6, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

export async function CategoryGridSection({
  tenantId,
  config,
}: {
  tenantId: string;
  config: CategoryGridConfig;
}) {
  const categories = await db.category.findMany({
    where: {
      tenant_id: tenantId,
      parent_id: null,
      ...(config.mode === "manual" && config.categoryIds?.length
        ? { id: { in: config.categoryIds } }
        : {}),
    },
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { is_active: true },
        select: { images: true },
        take: 1,
      },
    },
  });

  if (categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {config.title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {config.title}
        </h2>
      )}
      <div className={`grid ${COL_CLASS[config.columns]} gap-4`}>
        {categories.map((c) => {
          const image = c.products[0]?.images?.[0];
          return (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center"
            >
              {image && (
                <img
                  src={image}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              <span className="relative text-white font-semibold text-center px-3">
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
