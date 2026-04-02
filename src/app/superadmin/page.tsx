import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { TenantToggle } from "@/components/superadmin/TenantToggle";

export default async function SuperAdminHome() {
    const session = await auth();
    if (!session?.user?.isSuperAdmin) redirect("/admin/login");

    const tenants = await db.tenant.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { products: true, orders: true } },
        },
    });

    const PLAN_COLORS: Record<string, string> = {
        basic: "bg-gray-100 text-gray-600",
        standard: "bg-blue-100 text-blue-700",
        premium: "bg-purple-100 text-purple-700",
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">All Tenants</h1>
                    <p className="text-gray-500 text-sm mt-1">{tenants.length} stores on platform</p>
                </div>
                <a href="/superadmin/new"
                    className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
                    + Onboard Client
                </a>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Total Stores", value: tenants.length },
                    { label: "Active Stores", value: tenants.filter((t) => t.is_active).length },
                    { label: "Total Products", value: tenants.reduce((s, t) => s + t._count.products, 0) },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
                        <p className="text-3xl font-bold mt-2">{value}</p>
                    </div>
                ))}
            </div>

            {/* Tenants table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-white/10">
                        <tr>
                            {["Store", "Domain", "Plan", "Products", "Orders", "Active", ""].map((h) => (
                                <th key={h}
                                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {tenants.map((t) => (
                            <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-4">
                                    <p className="font-semibold text-white">{t.name}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                                        {t.id.slice(-8)}
                                    </p>
                                </td>
                                <td className="px-5 py-4">
                                    <p className="text-gray-300 font-mono text-xs">{t.domain}</p>
                                </td>
                                <td className="px-5 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[t.plan] ?? "bg-gray-100 text-gray-600"
                                        }`}>
                                        {t.plan}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-gray-400">{t._count.products}</td>
                                <td className="px-5 py-4 text-gray-400">{t._count.orders}</td>
                                <td className="px-5 py-4">
                                    <TenantToggle tenantId={t.id} isActive={t.is_active} />
                                </td>
                                <td className="px-5 py-4">
                                    <a href={`/superadmin/${t.id}`}
                                        className="text-xs text-blue-400 hover:underline font-medium">
                                        Manage
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}