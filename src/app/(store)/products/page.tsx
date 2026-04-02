import { getTenantWithConfig } from "@/lib/tenant";
import { getProducts, getCategoryTree, getBrands } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { notFound } from "next/navigation";

type Props = {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    page?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  let tenant;
  try {
    tenant = await getTenantWithConfig();
  } catch {
    notFound();
  }

  const config = tenant.storeConfig;
  const cardStyle = (config?.product_card_style ?? "minimal") as
    | "minimal"
    | "detailed"
    | "grid-dense";
  const primaryColor = config?.primary_color ?? "#2563EB";

  const [{ products, total, pages }, categoryTree, brands] = await Promise.all([
    getProducts(tenant.id, {
      categorySlug: params.category,
      brandSlug: params.brand,
      search: params.search,
      page: params.page ? parseInt(params.page) : 1,
    }),
    getCategoryTree(tenant.id),
    getBrands(tenant.id),
  ]);

  const currentPage = parseInt(params.page ?? "1") || 1;

  const gridClass =
    cardStyle === "grid-dense"
      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
      : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6";

  function filterUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = {
      category: params.category,
      brand: params.brand,
      search: params.search,
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    const s = p.toString();
    return `/products${s ? `?${s}` : ""}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-400 mt-1">{total} items</p>
        </div>
        <form method="GET" action="/products" className="flex gap-2">
          {params.category && (
            <input type="hidden" name="category" value={params.category} />
          )}
          {params.brand && (
            <input type="hidden" name="brand" value={params.brand} />
          )}
          <input
            name="search"
            defaultValue={params.search}
            placeholder="Search products..."
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none w-48"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-48 shrink-0 space-y-6">
          {/* Categories */}
          {categoryTree.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Categories
              </p>
              <ul className="space-y-0.5">
                <li>
                  <a
                    href={filterUrl({ category: undefined, page: undefined })}
                    className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      !params.category
                        ? "font-semibold text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    style={
                      !params.category ? { backgroundColor: primaryColor } : {}
                    }
                  >
                    All
                  </a>
                </li>
                {categoryTree.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={filterUrl({ category: cat.slug, page: undefined })}
                      className={`block text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
                        params.category === cat.slug
                          ? "text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      style={
                        params.category === cat.slug
                          ? { backgroundColor: primaryColor }
                          : {}
                      }
                    >
                      {cat.name}
                    </a>
                    {/* Subcategories */}
                    {cat.children.length > 0 && (
                      <ul className="mt-0.5 ml-3 space-y-0.5">
                        {cat.children.map((sub) => (
                          <li key={sub.id}>
                            <a
                              href={filterUrl({
                                category: sub.slug,
                                page: undefined,
                              })}
                              className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                                params.category === sub.slug
                                  ? "text-white"
                                  : "text-gray-500 hover:bg-gray-100"
                              }`}
                              style={
                                params.category === sub.slug
                                  ? { backgroundColor: primaryColor }
                                  : {}
                              }
                            >
                              {sub.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Brands */}
          {brands.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Brands
              </p>
              <ul className="space-y-0.5">
                <li>
                  <a
                    href={filterUrl({ brand: undefined, page: undefined })}
                    className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      !params.brand
                        ? "font-semibold text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    style={
                      !params.brand ? { backgroundColor: primaryColor } : {}
                    }
                  >
                    All Brands
                  </a>
                </li>
                {brands.map((b) => (
                  <li key={b.id}>
                    <a
                      href={filterUrl({ brand: b.slug, page: undefined })}
                      className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        params.brand === b.slug
                          ? "text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      style={
                        params.brand === b.slug
                          ? { backgroundColor: primaryColor }
                          : {}
                      }
                    >
                      {b.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {/* Active filters */}
          {(params.category || params.brand || params.search) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {params.search && (
                <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  &quot;{params.search}&quot;
                  <a
                    href={filterUrl({ search: undefined })}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </a>
                </span>
              )}
              {params.category && (
                <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  {params.category}
                  <a
                    href={filterUrl({ category: undefined })}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </a>
                </span>
              )}
              {params.brand && (
                <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  {params.brand}
                  <a
                    href={filterUrl({ brand: undefined })}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </a>
                </span>
              )}
              <a
                href="/products"
                className="px-3 py-1 text-xs text-red-500 hover:underline"
              >
                Clear all
              </a>
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-4xl mb-4">🛍️</p>
              <p className="font-medium">No products found</p>
              <a
                href="/products"
                className="mt-3 inline-block text-sm hover:underline"
                style={{ color: primaryColor }}
              >
                Clear filters
              </a>
            </div>
          ) : (
            <div className={gridClass}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  style={cardStyle}
                  primaryColor={primaryColor}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={filterUrl({ page: String(p) })}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium ${
                    p === currentPage
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={
                    p === currentPage ? { backgroundColor: primaryColor } : {}
                  }
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
