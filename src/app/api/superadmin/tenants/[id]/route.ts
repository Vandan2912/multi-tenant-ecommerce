import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.isSuperAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const tenant = await db.tenant.update({
        where: { id },
        data: {
            ...(body.is_active !== undefined && { is_active: body.is_active }),
            ...(body.plan !== undefined && { plan: body.plan }),
            ...(body.name !== undefined && { name: body.name }),
        },
    });

    return NextResponse.json(tenant);
}