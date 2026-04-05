import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminCustomersPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const tenantId = session.user.tenantId;

  const customers = await db.customer.findMany({
    where: { tenant_id: tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  // Total spend per customer
  const spends = await db.order.groupBy({
    by: ["customer_id"],
    where: { tenant_id: tenantId, customer_id: { not: null } },
    _sum: { total: true },
  });

  const spendMap = Object.fromEntries(
    spends.map((s) => [s.customer_id, Number(s._sum.total ?? 0)]),
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <p className="text-sm text-gray-400 mt-1">{customers.length} total</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium">No customers yet</p>
            <p className="text-sm mt-1">
              Customers appear after their first order
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Customer", "Phone", "Orders", "Total Spent", "Joined"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.email ?? "—"}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.phone ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-800">
                      {c._count.orders}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    ₹{(spendMap[c.id] ?? 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
