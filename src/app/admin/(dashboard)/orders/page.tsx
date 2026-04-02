import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
// import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

type Props = {
    searchParams: Promise<{ status?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
    const session = await auth();
    if (!session?.user?.tenantId) redirect("/admin/login");

    const params = await searchParams;
    const tenantId = session.user.tenantId;

    const orders = await db.order.findMany({
        where: {
            tenant_id: tenantId,
            ...(params.status ? { status: params.status } : {}),
        },
        orderBy: { createdAt: "desc" },
    });

    const STATUS_TABS = [
        { value: "", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                <p className="text-sm text-gray-400 mt-1">{orders.length} orders</p>
            </div>

            {/* Status tabs */}
            <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
                {STATUS_TABS.map(({ value, label }) => (
                    <a
                        key={value}
                        href={value ? `/admin/orders?status=${value}` : "/admin/orders"}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${(params.status ?? "") === value
                            ? "bg-white text-gray-800 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {label}
                    </a>
                ))}
            </div>

            {/* Orders table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {orders.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">📋</p>
                        <p className="font-medium">No orders found</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map((order) => {
                                const address = order.address_json as {
                                    name?: string; city?: string; phone?: string
                                } | null;
                                const items = order.items_json as Array<{
                                    name: string; quantity: number
                                }>;

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-mono font-semibold text-gray-800">
                                                #{order.id.slice(-8).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {order.payment_status}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">
                                            <p>{address?.name ?? "—"}</p>
                                            <p className="text-xs text-gray-400">{address?.city ?? ""}</p>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">
                                            {items.slice(0, 2).map((i, idx) => (
                                                <p key={idx} className="truncate max-w-[140px]">
                                                    {i.name} ×{i.quantity}
                                                </p>
                                            ))}
                                            {items.length > 2 && (
                                                <p className="text-xs text-gray-400">
                                                    +{items.length - 2} more
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-gray-800">
                                            ₹{Number(order.total).toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-4 py-4">
                                            <OrderStatusSelect
                                                orderId={order.id}
                                                currentStatus={order.status}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-gray-400 text-xs">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric"
                                            })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div >
    );
}