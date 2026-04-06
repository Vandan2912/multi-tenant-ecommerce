import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { validatePromoCode } from "@/lib/promo";

// Rate limiting — simple in-memory (use Redis in production)
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = attempts.get(ip);

    if (!entry || entry.resetAt < now) {
        attempts.set(ip, { count: 1, resetAt: now + 60_000 }); // 1 min window
        return true;
    }

    if (entry.count >= 10) return false; // max 10 attempts/min

    entry.count++;
    return true;
}

export async function POST(req: NextRequest) {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    if (!checkRateLimit(ip))
        return NextResponse.json(
            { valid: false, error: "Too many attempts. Please wait a minute." },
            { status: 429 }
        );

    const headersList = await headers();
    const domain = headersList.get("x-tenant-domain");
    if (!domain)
        return NextResponse.json({ valid: false, error: "Unknown store" }, { status: 400 });

    const tenant = await db.tenant.findUnique({
        where: { domain },
        select: { id: true, is_active: true },
    });
    if (!tenant || !tenant.is_active)
        return NextResponse.json({ valid: false, error: "Store not found" }, { status: 404 });

    const body = await req.json();
    const { code, cartItems, identifier } = body;

    if (!code?.trim())
        return NextResponse.json({ valid: false, error: "Enter a promo code" }, { status: 400 });

    if (!cartItems?.length)
        return NextResponse.json({ valid: false, error: "Cart is empty" }, { status: 400 });

    const result = await validatePromoCode(
        tenant.id,
        code,
        cartItems,
        identifier ?? "",
    );

    return NextResponse.json(result);
}