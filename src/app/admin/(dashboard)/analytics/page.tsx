import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { RevenueAreaChart } from "@/components/admin/analytics/RevenueAreaChart";
import { MonthlyBarChart } from "@/components/admin/analytics/MonthlyBarChart";
import { OrderStatusPie } from "@/components/admin/analytics/OrderStatusPie";

type DailyRow = { date: Date; revenue: number; orders: number };
type MonthlyRow = { month: string; revenue: number; orders: number };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const tenantId = session.user.tenantId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
  );
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    revenueThisMonth,
    revenueLastMonth,
    ordersThisMonth,
    ordersLastMonth,
    customersThisMonth,
    customersLastMonth,
    statusCounts,
    dailyData,
    monthlyData,
    recentOrders,
  ] = await Promise.all([
    db.order.aggregate({
      where: {
        tenant_id: tenantId,
        createdAt: { gte: startOfMonth },
        payment_status: { not: "failed" },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    db.order.aggregate({
      where: {
        tenant_id: tenantId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        payment_status: { not: "failed" },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    db.order.count({
      where: { tenant_id: tenantId, createdAt: { gte: startOfMonth } },
    }),
    db.order.count({
      where: {
        tenant_id: tenantId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    db.customer.count({
      where: { tenant_id: tenantId, createdAt: { gte: startOfMonth } },
    }),
    db.customer.count({
      where: {
        tenant_id: tenantId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    db.order.groupBy({
      by: ["status"],
      where: { tenant_id: tenantId },
      _count: { id: true },
    }),
    db.$queryRaw<DailyRow[]>`
      SELECT
        DATE("createdAt") AS date,
        COALESCE(SUM(total), 0)::float AS revenue,
        COUNT(*)::int AS orders
      FROM "Order"
      WHERE tenant_id = ${tenantId}
        AND "createdAt" >= ${thirtyDaysAgo}
        AND payment_status != 'failed'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    db.$queryRaw<MonthlyRow[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') AS month,
        COALESCE(SUM(total), 0)::float AS revenue,
        COUNT(*)::int AS orders
      FROM "Order"
      WHERE tenant_id = ${tenantId}
        AND "createdAt" >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
        AND payment_status != 'failed'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `,
    db.order.findMany({
      where: {
        tenant_id: tenantId,
        createdAt: { gte: thirtyDaysAgo },
        payment_status: { not: "failed" },
      },
      select: { items_json: true },
    }),
  ]);

  // Aggregate top products from items_json
  const productMap = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >();
  for (const order of recentOrders) {
    const items = order.items_json as Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    for (const item of items) {
      const existing = productMap.get(item.name) ?? {
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      productMap.set(item.name, {
        name: item.name,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.price * item.quantity,
      });
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Fill all 30 days (zero-fill missing days)
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (const row of dailyData) {
    const key = new Date(row.date).toISOString().split("T")[0];
    dailyMap.set(key, { revenue: row.revenue, orders: row.orders });
  }
  const chartDailyData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    const data = dailyMap.get(key) ?? { revenue: 0, orders: 0 };
    return { date: label, ...data };
  });

  const statusData = statusCounts.map((s) => ({
    name: s.status,
    value: s._count.id,
  }));

  // Compute comparison metrics
  const revThis = Number(revenueThisMonth._sum.total ?? 0);
  const revLast = Number(revenueLastMonth._sum.total ?? 0);
  const revChange =
    revLast > 0 ? Math.round(((revThis - revLast) / revLast) * 100) : null;

  const ordChange =
    ordersLastMonth > 0
      ? Math.round(
          ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100,
        )
      : null;

  const cusChange =
    customersLastMonth > 0
      ? Math.round(
          ((customersThisMonth - customersLastMonth) / customersLastMonth) *
            100,
        )
      : null;

  const avgOrderValue =
    revenueThisMonth._count.id > 0
      ? Math.round(revThis / revenueThisMonth._count.id)
      : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">
          Performance overview — last 30 days
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Revenue This Month"
          value={`₹${revThis.toLocaleString("en-IN")}`}
          change={revChange}
          sub="vs last month"
        />
        <StatCard
          label="Orders This Month"
          value={ordersThisMonth}
          change={ordChange}
          sub="vs last month"
        />
        <StatCard
          label="New Customers"
          value={customersThisMonth}
          change={cusChange}
          sub="vs last month"
        />
        <StatCard
          label="Avg Order Value"
          value={`₹${avgOrderValue.toLocaleString("en-IN")}`}
          sub="this month"
        />
      </div>

      {/* Revenue chart + order status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Daily Revenue — Last 30 Days
          </h2>
          <RevenueAreaChart data={chartDailyData} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Order Status</h2>
          <OrderStatusPie data={statusData} />
        </div>
      </div>

      {/* Monthly revenue */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">
          Monthly Revenue — Last 6 Months
        </h2>
        <MonthlyBarChart
          data={monthlyData.map((r) => ({
            month: r.month,
            revenue: r.revenue,
            orders: r.orders,
          }))}
        />
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">
          Top Products — Last 30 Days
        </h2>
        {topProducts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No sales data yet
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Units
                </th>
                <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts.map((p, i) => (
                <tr key={i}>
                  <td className="py-3 text-gray-700">{p.name}</td>
                  <td className="py-3 text-right text-gray-500">
                    {p.quantity}
                  </td>
                  <td className="py-3 text-right font-semibold text-gray-800">
                    ₹{p.revenue.toLocaleString("en-IN")}
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

function StatCard({
  label,
  value,
  change,
  sub,
}: {
  label: string;
  value: string | number;
  change?: number | null;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {change !== null && change !== undefined && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
              change > 0
                ? "bg-green-100 text-green-700"
                : change < 0
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}
