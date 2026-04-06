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

    const existing = await db.promoCode.findFirst({ where: { id, tenant_id: tenantId } });
    if (!existing)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.promoCode.update({
        where: { id },
        data: {
            description: body.description ?? existing.description,
            discount_type: body.discount_type ?? existing.discount_type,
            discount_value: body.discount_value ?? existing.discount_value,
            minimum_order_value: body.minimum_order_value ?? existing.minimum_order_value,
            maximum_discount: body.maximum_discount ?? existing.maximum_discount,
            usage_limit: body.usage_limit ?? existing.usage_limit,
            usage_limit_per_user: body.usage_limit_per_user ?? existing.usage_limit_per_user,
            start_date: body.start_date ? new Date(body.start_date) : existing.start_date,
            expiry_date: body.expiry_date ? new Date(body.expiry_date) : existing.expiry_date,
            is_active: body.is_active ?? existing.is_active,
            applicable_products: body.applicable_products ?? existing.applicable_products,
            applicable_categories: body.applicable_categories ?? existing.applicable_categories,
            excluded_products: body.excluded_products ?? existing.excluded_products,
            stackable: body.stackable ?? existing.stackable,
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

    const existing = await db.promoCode.findFirst({ where: { id, tenant_id: tenantId } });
    if (!existing)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.promoCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}