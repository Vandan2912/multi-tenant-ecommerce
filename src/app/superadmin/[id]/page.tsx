import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";

export default async function ManageTenantPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user?.isSuperAdmin) redirect("/admin/login");

    const { id } = await params;

    const tenant = await db.tenant.findUnique({
        where: { id },
        include: {
            storeConfig: true,
            _count: { select: { products: true, orders: true, customers: true } },
        },
    });

    if (!tenant) notFound();

    const recentOrders = await db.order.findMany({
        where: { tenant_id: id },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    return (
        <div className="p-8 max-w-3xl">
            <div className="mb-8">
                <a href="/superadmin"
                    className="text-sm text-gray-500 hover:text-white mb-4 inline-block">
                    ← All Tenants
                </a>
                <h1 className="text-2xl font-bold">{tenant.name}</h1>
                <p className="text-gray-500 font-mono text-sm mt-1">{tenant.domain}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Products", value: tenant._count.products },
                    { label: "Orders", value: tenant._count.orders },
                    { label: "Customers", value: tenant._count.customers },
                ].map(({ label, value }) => (
                    <div key={label}
                        className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
                        <p className="text-3xl font-bold mt-2">{value}</p>
                    </div>
                ))}
            </div>

            {/* Config summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-3">
                <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-500">
                    Store Config
                </h2>
                {[
                    ["Plan", tenant.plan],
                    ["Status", tenant.is_active ? "Active" : "Inactive"],
                    ["Primary Color", tenant.storeConfig?.primary_color ?? "—"],
                    ["Font", tenant.storeConfig?.font_family ?? "—"],
                    ["Hero Layout", tenant.storeConfig?.hero_layout ?? "—"],
                    ["Card Style", tenant.storeConfig?.product_card_style ?? "—"],
                ].map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500">{key}</span>
                        <span className="text-white font-medium">{val}</span>
                    </div>
                ))}
            </div>

            {/* Recent orders */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                    <h2 className="font-semibold text-sm">Recent Orders</h2>
                </div>
                {recentOrders.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 text-sm">No orders yet</p>
                ) : (
                    <div className="divide-y divide-white/5">
                        {recentOrders.map((o) => (
                            <div key={o.id}
                                className="px-6 py-3 flex justify-between text-sm">
                                <span className="font-mono text-gray-400">
                                    #{o.id.slice(-8).toUpperCase()}
                                </span>
                                <span className="text-white font-semibold">
                                    ₹{Number(o.total).toLocaleString("en-IN")}
                                </span>
                                <span className="text-gray-500">{o.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}