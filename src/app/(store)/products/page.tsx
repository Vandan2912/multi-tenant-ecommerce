import { Suspense } from "react";
import { getTenantWithConfig } from "@/lib/tenant";
import { getProducts, getCategoryTree, getBrands } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { WishlistButton } from "@/components/WishlistButton";
import { FilterSidebar } from "@/components/FilterSidebar";
import { FilterDrawer } from "@/components/FilterDrawer";
import { SortSelect } from "@/components/SortSelect";
import { notFound } from "next/navigation";

type Props = {
  searchParams: Promise<{
    category?: string;
    brands?: string;
    search?: string;
    min?: string;
    max?: string;
    instock?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  let tenant;
  try { tenant = await getTenantWithConfig(); }
  catch { notFound(); }

  const config = tenant.storeConfig;
  const primaryColor = config?.primary_color ?? "#2563EB";
  const cardStyle = (config?.product_card_style ?? "minimal") as
    "minimal" | "detailed" | "grid-dense";

  // Parse filters from URL
  const activeBrands = params.brands ? params.brands.split(",").filter(Boolean) : [];
  const activeMin = params.min ? parseInt(params.min) : undefined;
  const activeMax = params.max ? parseInt(params.max) : undefined;
  const activeInStock = params.instock === "true";
  const activeSort = (params.sort ?? "newest") as
    "newest" | "price_asc" | "price_desc" | "name_asc";
  const currentPage = params.page ? parseInt(params.page) : 1;

  const [
    { products, total, pages, priceRange },
    categoryTree,
    brands,
  ] = await Promise.all([
    getProducts(tenant.id, {
      categorySlug: params.category,
      brandSlugs: activeBrands,
      search: params.search,
      minPrice: activeMin,
      maxPrice: activeMax,
      inStock: activeInStock,
      sort: activeSort,
      page: currentPage,
    }),
    getCategoryTree(tenant.id),
    getBrands(tenant.id),
  ]);

  const gridClass =
    cardStyle === "grid-dense"
      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6";

  // Count active filters for badge
  const activeCount =
    (params.category ? 1 : 0) +
    activeBrands.length +
    (activeMin !== undefined ? 1 : 0) +
    (activeMax !== undefined ? 1 : 0) +
    (activeInStock ? 1 : 0);

  // Build URL helper
  function filterUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = {
      category: params.category,
      brands: params.brands,
      search: params.search,
      min: params.min,
      max: params.max,
      instock: params.instock,
      sort: params.sort,
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
    const s = p.toString();
    return `/products${s ? `?${s}` : ""}`;
  }

  const sidebarProps = {
    categoryTree,
    brands,
    priceRange,
    primaryColor,
    activeCategory: params.category,
    activeBrands,
    activeMin,
    activeMax,
    activeInStock,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header row */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} items</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile filter trigger */}
          <Suspense>
            <FilterDrawer {...sidebarProps} activeCount={activeCount} />
          </Suspense>
          {/* Sort */}
          <Suspense>
            <SortSelect current={activeSort} />
          </Suspense>
        </div>
      </div>

      {/* Active filter chips */}
      {(activeCount > 0 || params.search) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {params.search && (
            <a href={filterUrl({ search: undefined })}
              className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 hover:bg-gray-200">
              🔍 "{params.search}" <span className="text-gray-400">×</span>
            </a>
          )}
          {params.category && (
            <a href={filterUrl({ category: undefined })}
              className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 hover:bg-gray-200">
              📂 {params.category} <span className="text-gray-400">×</span>
            </a>
          )}
          {activeBrands.map((b) => (
            <a key={b}
              href={filterUrl({
                brands: activeBrands.filter((x) => x !== b).join(",") || undefined,
              })}
              className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 hover:bg-gray-200">
              🏷️ {b} <span className="text-gray-400">×</span>
            </a>
          ))}
          {(activeMin !== undefined || activeMax !== undefined) && (
            <a href={filterUrl({ min: undefined, max: undefined })}
              className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 hover:bg-gray-200">
              💰 ₹{activeMin?.toLocaleString("en-IN") ?? priceRange.min} – ₹{activeMax?.toLocaleString("en-IN") ?? priceRange.max}
              <span className="text-gray-400">×</span>
            </a>
          )}
          {activeInStock && (
            <a href={filterUrl({ instock: undefined })}
              className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 hover:bg-gray-200">
              ✅ In stock <span className="text-gray-400">×</span>
            </a>
          )}
          <a href="/products"
            className="px-3 py-1 text-xs text-red-500 hover:text-red-700 font-medium">
            Clear all
          </a>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-52 shrink-0">
          <Suspense>
            <FilterSidebar {...sidebarProps} />
          </Suspense>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-4xl mb-4">🛍️</p>
              <p className="font-medium text-lg">No products found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
              <a href="/products"
                className="mt-4 inline-block text-sm font-medium hover:underline"
                style={{ color: primaryColor }}>
                Clear all filters
              </a>
            </div>
          ) : (
            <div className={gridClass}>
              {products.map((product) => {
                const firstVariant = product.variants[0];
                const price = firstVariant ? Number(firstVariant.price) : 0;
                const discountPrice = firstVariant?.discount_price
                  ? Number(firstVariant.discount_price)
                  : null;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    style={cardStyle}
                    primaryColor={primaryColor}
                    wishlistButton={
                      <WishlistButton
                        item={{
                          id: product.id,
                          name: product.name,
                          image: product.images[0] ?? "",
                          price,
                          discountPrice,
                          variantCount: product.variants.length,
                        }}
                      />
                    }
                  />
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-12 flex-wrap">
              {currentPage > 1 && (
                <a href={filterUrl({ page: String(currentPage - 1) })}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                  ← Prev
                </a>
              )}
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === pages)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-3 py-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <a key={p}
                      href={filterUrl({ page: String(p) })}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${p === currentPage ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      style={p === currentPage ? { backgroundColor: primaryColor } : {}}>
                      {p}
                    </a>
                  )
                )}
              {currentPage < pages && (
                <a href={filterUrl({ page: String(currentPage + 1) })}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                  Next →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}