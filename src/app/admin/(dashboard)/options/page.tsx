import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { OptionTypeManager } from "@/components/admin/OptionTypeManager";

export default async function AdminOptionsPage() {
    const session = await auth();
    if (!session?.user?.tenantId) redirect("/admin/login");

    const optionTypes = await db.optionType.findMany({
        where: { tenant_id: session.user.tenantId },
        orderBy: { position: "asc" },
    });

    return (
        <div className="p-8 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Option Types</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Define reusable options (Size, Color, Material) that products can use to generate variants
                </p>
            </div>
            <OptionTypeManager
                initialOptionTypes={optionTypes.map((o) => ({
                    ...o,
                    values_json: o.values_json as any[],
                }))}
            />
        </div>
    );
}