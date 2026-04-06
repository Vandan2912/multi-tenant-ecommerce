import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatePromoCode } from "@/lib/promo";

export async function GET() {
    const session = await auth();
    if (!session?.user?.tenantId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const promos = await db.promoCode.findMany({
        where: { tenant_id: session.user.tenantId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { usages: true } } },
    });

    return NextResponse.json(promos);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.tenantId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tenantId = session.user.tenantId;
    const body = await req.json();

    // Normalize code
    const code = (body.code?.trim() || generatePromoCode(body.prefix)).toUpperCase();

    // Check uniqueness
    const existing = await db.promoCode.findUnique({
        where: { tenant_id_code: { tenant_id: tenantId, code } },
    });
    if (existing)
        return NextResponse.json({ error: "Promo code already exists" }, { status: 400 });

    const promo = await db.promoCode.create({
        data: {
            tenant_id: tenantId,
            code,
            description: body.description ?? null,
            discount_type: body.discount_type,
            discount_value: body.discount_value ?? 0,
            minimum_order_value: body.minimum_order_value ?? null,
            maximum_discount: body.maximum_discount ?? null,
            usage_limit: body.usage_limit ?? null,
            usage_limit_per_user: body.usage_limit_per_user ?? null,
            start_date: body.start_date ? new Date(body.start_date) : null,
            expiry_date: body.expiry_date ? new Date(body.expiry_date) : null,
            is_active: body.is_active ?? true,
            applicable_products: body.applicable_products ?? [],
            applicable_categories: body.applicable_categories ?? [],
            excluded_products: body.excluded_products ?? [],
            stackable: body.stackable ?? false,
        },
    });

    return NextResponse.json(promo);
}