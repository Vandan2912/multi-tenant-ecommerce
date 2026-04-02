import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
    const session = await auth();
    if (!session?.user?.tenantId) redirect("/admin/login");

    const tenant = await db.tenant.findUnique({
        where: { id: session.user.tenantId },
        include: { storeConfig: true },
    });

    if (!tenant) redirect("/admin/login");

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-sm text-gray-400 mt-1">Customize your store appearance and features</p>
            </div>
            <SettingsForm tenant={tenant} config={tenant.storeConfig} />
        </div>
    );
}