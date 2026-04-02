import {
    // getTenant, 
    getTenantWithConfig
} from "@/lib/tenant";
import { getProducts, getCategories } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { notFound } from "next/navigation";

type Props = {
    searchParams: Promise<{ category?: string; search?: string; page?: string }>;
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

    const [{ products, total, pages }, categories] = await Promise.all([
        getProducts(tenant.id, {
            categorySlug: params.category,
            search: params.search,
            page: params.page ? parseInt(params.page) : 1,
        }),
        getCategories(tenant.id),
    ]);

    const gridClass =
        cardStyle === "grid-dense"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6";

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            {/* ── Header ────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    <p className="text-sm text-gray-500 mt-1">{total} items</p>
                </div>

                {/* Search */}
                <form method="GET" className="flex gap-2">
                    <input
                        name="search"
                        defaultValue={params.search}
                        placeholder="Search products..."
                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 w-48"
                        style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
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
                {/* ── Sidebar — categories ──────────────────────────── */}
                {categories.length > 0 && (
                    <aside className="hidden md:block w-44 shrink-0">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Categories
                        </p>
                        <ul className="space-y-1">
                            <li>
                                <a
                                    href="/products"
                                    className={`block text-sm px-3 py-2 rounded-lg transition-colors ${!params.category
                                        ? "font-semibold text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    style={
                                        !params.category
                                            ? { backgroundColor: primaryColor }
                                            : {}
                                    }
                                >
                                    All
                                </a>
                            </li>
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <a
                                        href={`/products?category=${cat.slug}`}
                                        className={`block text-sm px-3 py-2 rounded-lg transition-colors ${params.category === cat.slug
                                            ? "font-semibold text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                        style={
                                            params.category === cat.slug
                                                ? { backgroundColor: primaryColor }
                                                : {}
                                        }
                                    >
                                        {cat.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </aside>
                )
                }

                {/* ── Product grid ──────────────────────────────────── */}
                <div className="flex-1">
                    {products.length === 0 ? (
                        <div className="text-center py-24 text-gray-400">
                            <p className="text-4xl mb-4">🛍️</p>
                            <p className="font-medium">No products found</p>
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

                    {/* ── Pagination ──────────────────────────────────── */}
                    {pages > 1 && (
                        <div className="flex justify-center gap-2 mt-12">
                            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                <a
                                    key={p}
                                    href={`/products?page=${p}${params.category ? `&category=${params.category}` : ""}${params.search ? `&search=${params.search}` : ""}`}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === (parseInt(params.page ?? "1") || 1)
                                        ? "text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    style={
                                        p === (parseInt(params.page ?? "1") || 1)
                                            ? { backgroundColor: primaryColor }
                                            : {}
                                    }
                                >
                                    {p}
                                </a>
                            ))}
                        </div>
                    )}
                </div >
            </div >
        </div >
    );
}