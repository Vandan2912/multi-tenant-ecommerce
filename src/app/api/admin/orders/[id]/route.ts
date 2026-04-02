import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = session.user.tenantId;
    const body = await req.json();

    const existing = await db.order.findFirst({
        where: { id, tenant_id: tenantId },
    });
    if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const order = await db.order.update({
        where: { id },
        data: {
            ...(body.status && { status: body.status }),
            ...(body.payment_status && { payment_status: body.payment_status }),
        },
    });

    return NextResponse.json(order);
}