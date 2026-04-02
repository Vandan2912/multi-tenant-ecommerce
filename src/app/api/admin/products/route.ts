import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const body = await req.json();

    const product = await db.product.create({
        data: {
            tenant_id: tenantId,
            name: body.name,
            description: body.description || null,
            price: body.price,
            discount_price: body.discount_price ?? null,
            stock: body.stock ?? 0,
            category_id: body.category_id ?? null,
            images: body.images ?? [],
            is_active: body.is_active ?? true,
        },
    });

    return NextResponse.json(product);
}