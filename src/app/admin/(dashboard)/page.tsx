import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
    const session = await auth();
    console.log(session)
    if (!session?.user?.tenantId) redirect("/admin/login");

    const tenantId = session.user.tenantId;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
        ordersToday,
        ordersMonth,
        totalRevenue,
        pendingOrders,
        totalProducts,
        lowStock,
        recentOrders,
    ] = await Promise.all([
        db.order.count({ where: { tenant_id: tenantId, createdAt: { gte: startOfDay } } }),
        db.order.count({ where: { tenant_id: tenantId, createdAt: { gte: startOfMonth } } }),
        db.order.aggregate({
            where: { tenant_id: tenantId, payment_status: { not: "failed" } },
            _sum: { total: true },
        }),
        db.order.count({ where: { tenant_id: tenantId, status: "pending" } }),
        db.product.count({ where: { tenant_id: tenantId, is_active: true } }),
        db.product.count({ where: { tenant_id: tenantId, is_active: true, stock: { lte: 5 } } }),
        db.order.findMany({
            where: { tenant_id: tenantId },
            orderBy: { createdAt: "desc" },
            take: 8,
        }),
    ]);

    const stats = [
        { label: "Orders Today", value: ordersToday, sub: "new orders" },
        { label: "Orders This Month", value: ordersMonth, sub: "this month" },
        { label: "Total Revenue", value: `₹${Number(totalRevenue._sum.total ?? 0).toLocaleString("en-IN")}`, sub: "all time" },
        { label: "Pending Orders", value: pendingOrders, sub: "need action", alert: pendingOrders > 0 },
        { label: "Products", value: totalProducts, sub: "active" },
        { label: "Low Stock", value: lowStock, sub: "≤ 5 units", alert: lowStock > 0 },
    ];

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {stats.map(({ label, value, sub, alert }) => (
                    <div
                        key={label}
                        className={`bg-white rounded-2xl border p-5 ${alert ? "border-amber-200 bg-amber-50" : "border-gray-100"
                            }`}
                    >
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            {label}
                        </p>
                        <p className={`text-3xl font-bold mt-2 ${alert ? "text-amber-600" : "text-gray-800"}`}>
                            {value}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{sub}</p>
                    </div>
                ))}
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-2xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Recent Orders</h2>
                    <a href="/admin/orders" className="text-sm text-blue-600 hover:underline">
                        View all
                    </a>
                </div>
                <div className="divide-y divide-gray-50">
                    {recentOrders.length === 0 ? (
                        <p className="px-6 py-8 text-center text-gray-400 text-sm">
                            No orders yet
                        </p>
                    ) : (
                        recentOrders.map((order) => {
                            const address = order.address_json as { city?: string } | null;
                            return (
                                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 font-mono">
                                            #{order.id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {address?.city ?? "—"} · {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-800">
                                            ₹{Number(order.total).toLocaleString("en-IN")}
                                        </p>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.status === "delivered" ? "bg-green-100 text-green-700" :
                                            order.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                                                order.status === "shipped" ? "bg-purple-100 text-purple-700" :
                                                    order.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                        "bg-amber-100 text-amber-700"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}