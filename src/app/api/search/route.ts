import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { searchProducts } from "@/lib/products";

export async function GET(req: NextRequest) {
    const headersList = await headers();
    const domain = headersList.get("x-tenant-domain");

    if (!domain)
        return NextResponse.json({ results: [] });

    const tenant = await db.tenant.findUnique({
        where: { domain },
        select: { id: true, is_active: true },
    });

    if (!tenant || !tenant.is_active)
        return NextResponse.json({ results: [] });

    const query = req.nextUrl.searchParams.get("q") ?? "";
    const results = await searchProducts(tenant.id, query);

    return NextResponse.json({ results });
}