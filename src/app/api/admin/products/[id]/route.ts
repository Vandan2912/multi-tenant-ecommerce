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

    // Verify product belongs to this tenant
    const existing = await db.product.findFirst({
        where: { id, tenant_id: tenantId },
    });
    if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const product = await db.product.update({
        where: { id },
        data: {
            name: body.name,
            description: body.description ?? null,
            price: body.price,
            discount_price: body.discount_price ?? null,
            stock: body.stock,
            category_id: body.category_id ?? null,
            images: body.images ?? [],
            is_active: body.is_active,
        },
    });

    return NextResponse.json(product);
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const existing = await db.product.findFirst({
        where: { id, tenant_id: tenantId },
    });
    if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Soft delete
    await db.product.update({
        where: { id },
        data: { is_active: false },
    });

    return NextResponse.json({ ok: true });
}