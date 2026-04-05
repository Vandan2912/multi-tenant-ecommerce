import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CouponManager } from "@/components/admin/CouponManager";

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const coupons = await db.coupon.findMany({
    where: { tenant_id: session.user.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
        <p className="text-sm text-gray-400 mt-1">
          Create discount codes for your store
        </p>
      </div>
      <CouponManager
        tenantId={session.user.tenantId}
        initialCoupons={coupons.map((c) => ({
          ...c,
          value: Number(c.value),
          expiry: c.expiry ? c.expiry.toISOString().slice(0, 10) : "",
        }))}
      />
    </div>
  );
}
