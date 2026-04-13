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

    // Build shipping_json from submitted fields
    const shippingJson =
        body.shippingType === "flat_rate"
            ? {
                  type: "flat_rate",
                  flat_rate: Number(body.shippingFlatRate) || 0,
                  free_above: body.shippingFreeAbove
                      ? Number(body.shippingFreeAbove)
                      : undefined,
              }
            : { type: "free" };

    const configData = {
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
        shipping_json: shippingJson,
    };

    // Upsert store config
    await db.storeConfig.upsert({
        where: { tenant_id: tenantId },
        update: configData,
        create: { tenant_id: tenantId, ...configData },
    });

    return NextResponse.json({ ok: true });
}