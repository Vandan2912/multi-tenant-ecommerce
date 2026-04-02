import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const body = await req.json();

    // Update tenant name
    await db.tenant.update({
        where: { id: tenantId },
        data: { name: body.storeName },
    });

    // Upsert store config
    await db.storeConfig.upsert({
        where: { tenant_id: tenantId },
        update: {
            store_tagline: body.tagline,
            primary_color: body.primaryColor,
            font_family: body.fontFamily,
            hero_layout: body.heroLayout,
            product_card_style: body.productCardStyle,
            logo_url: body.logoUrl || null,
            features_json: {
                enableCOD: body.enableCOD,
                enableWishlist: body.enableWishlist,
                enableCoupons: body.enableCoupons,
            },
            contact_json: {
                phone: body.phone,
                email: body.email,
                whatsapp: body.whatsapp,
            },
        },
        create: {
            tenant_id: tenantId,
            store_tagline: body.tagline,
            primary_color: body.primaryColor,
            font_family: body.fontFamily,
            hero_layout: body.heroLayout,
            product_card_style: body.productCardStyle,
            logo_url: body.logoUrl || null,
            features_json: {
                enableCOD: body.enableCOD,
                enableWishlist: body.enableWishlist,
                enableCoupons: body.enableCoupons,
            },
            contact_json: {
                phone: body.phone,
                email: body.email,
                whatsapp: body.whatsapp,
            },
        },
    });

    return NextResponse.json({ ok: true });
}