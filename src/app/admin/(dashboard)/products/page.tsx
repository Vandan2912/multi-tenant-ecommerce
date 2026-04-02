import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminProductsPage() {
    const session = await auth();
    if (!session?.user?.tenantId) redirect("/admin/login");

    const tenantId = session.user.tenantId;

    const [products, categories] = await Promise.all([
        db.product.findMany({
            where: { tenant_id: tenantId },
            include: {
                category: true,
                variants: { orderBy: { price: "asc" } },
            },
            orderBy: { createdAt: "desc" },
        }),
        db.category.findMany({
            where: { tenant_id: tenantId },
            orderBy: { name: "asc" },
        }),
    ]);

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    <p className="text-sm text-gray-400 mt-1">{products.length} total</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                    + Add Product
                </Link>
            </div>

            {/* Categories row */}
            {categories.length > 0 && (
                <div className="flex gap-2 mb-6 flex-wrap">
                    {categories.map((cat) => (
                        <span
                            key={cat.id}
                            className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600"
                        >
                            {cat.name}
                        </span>
                    ))}
                    <Link
                        href="/admin/categories"
                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-50"
                    >
                        Manage Categories
                    </Link>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {products.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">📦</p>
                        <p className="font-medium">No products yet</p>
                        <Link
                            href="/admin/products/new"
                            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                        >
                            Add your first product
                        </Link>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map((p) => {
                                const firstVariant = p.variants[0];
                                return (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                {p.images[0] ? (
                                                    <img
                                                        src={p.images[0]}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">
                                                        📦
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{p.name}</p>
                                                <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                    {p.id.slice(-8)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-500">
                                        {p.category?.name ?? "—"}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div>
                                            {firstVariant ? (
                                                <>
                                                    <p className="font-semibold text-gray-800">
                                                        ₹{Number(firstVariant.price).toLocaleString("en-IN")}
                                                    </p>
                                                    {firstVariant.discount_price && (
                                                        <p className="text-xs text-green-600">
                                                            ₹{Number(firstVariant.discount_price).toLocaleString("en-IN")} sale
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-gray-400 text-xs">No variants</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        {firstVariant ? (
                                            <span className={`font-semibold ${
                                                firstVariant.stock === 0 ? "text-red-500" :
                                                firstVariant.stock <= 5 ? "text-amber-500" :
                                                "text-gray-700"
                                            }`}>
                                                {firstVariant.stock}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.is_active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-500"
                                            }`}>
                                            {p.is_active ? "Active" : "Hidden"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <Link
                                            href={`/admin/products/${p.id}`}
                                            className="text-sm text-blue-600 hover:underline font-medium"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}