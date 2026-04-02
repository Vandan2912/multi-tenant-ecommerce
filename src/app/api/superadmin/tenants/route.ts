import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.isSuperAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
        name, domain, slug, plan,
        adminEmail, adminPassword,
        primaryColor, fontFamily,
    } = body;

    // Check domain + slug uniqueness
    const existing = await db.tenant.findFirst({
        where: { OR: [{ domain }, { slug }] },
    });
    if (existing) {
        return NextResponse.json(
            { error: "Domain or slug already taken" },
            { status: 400 }
        );
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const tenant = await db.tenant.create({
        data: {
            name,
            domain,
            slug,
            plan: plan ?? "standard",
            storeConfig: {
                create: {
                    primary_color: primaryColor ?? "#2563EB",
                    font_family: fontFamily ?? "Inter",
                    hero_layout: "centered",
                    product_card_style: "minimal",
                    features_json: {
                        enableCOD: true,
                        enableWishlist: false,
                        enableCoupons: false,
                    },
                },
            },
            adminUsers: {
                create: {
                    email: adminEmail,
                    password_hash: passwordHash,
                    role: "admin",
                },
            },
        },
    });

    return NextResponse.json({ tenantId: tenant.id });
}