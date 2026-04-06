import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.tenantId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const tenantId = session.user.tenantId;
    const body = await req.json();

    const existing = await db.optionType.findFirst({
        where: { id, tenant_id: tenantId },
    });
    if (!existing)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.optionType.update({
        where: { id },
        data: {
            ...(body.name !== undefined && { name: body.name }),
            ...(body.values_json !== undefined && { values_json: body.values_json }),
            ...(body.position !== undefined && { position: body.position }),
        },
    });

    return NextResponse.json(updated);
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.tenantId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const existing = await db.optionType.findFirst({
        where: { id, tenant_id: tenantId },
    });
    if (!existing)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check if any products use this option type
    const inUse = await db.productOption.count({
        where: { option_type_id: id },
    });
    if (inUse > 0)
        return NextResponse.json(
            { error: `This option is used by ${inUse} product(s). Remove it from those products first.` },
            { status: 400 }
        );

    await db.optionType.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}