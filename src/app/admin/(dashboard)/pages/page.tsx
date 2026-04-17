import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PagesListClient } from "@/components/admin/PagesListClient";

export default async function AdminPagesPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const pages = await db.pageConfig.findMany({
    where: { tenant_id: session.user.tenantId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      page_type: true,
      is_published: true,
      updatedAt: true,
    },
  });

  const hasHome = pages.some((p) => p.slug === "home");

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pages</h1>
          <p className="text-sm text-gray-400 mt-1">
            Build your storefront pages with drag-free sections
          </p>
        </div>
        {!hasHome && (
          <Link
            href="/admin/pages/new?preset=home"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black"
          >
            Create Homepage
          </Link>
        )}
      </div>

      <PagesListClient
        initialPages={pages.map((p) => ({
          ...p,
          updatedAt: p.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
