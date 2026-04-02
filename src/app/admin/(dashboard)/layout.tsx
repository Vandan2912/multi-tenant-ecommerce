import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (session?.user?.isSuperAdmin) {
        redirect("/superadmin");
    }

    if (!session?.user?.tenantId) {
        redirect("/admin/login");
    }

    const tenant = await db.tenant.findUnique({
        where: { id: session.user.tenantId },
    });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar
                storeName={tenant?.name ?? "Store"}
                email={session.user.email ?? ""}
            />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}