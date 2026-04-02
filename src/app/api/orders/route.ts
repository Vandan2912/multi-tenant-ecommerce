import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { z } from "zod";

const orderSchema = z.object({
    items: z.array(
        z.object({
            productId: z.string(),
            name: z.string(),
            price: z.number(),
            quantity: z.number().min(1),
            image: z.string(),
            variant: z.string().optional(),
        })
    ).min(1),
    customer: z.object({
        name: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().min(10),
    }),
    address: z.object({
        line1: z.string().min(1),
        line2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().min(1),
        pincode: z.string().min(6),
    }),
    paymentMethod: z.enum(["cod", "online"]),
    couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        // ── Resolve tenant ─────────────────────────────────────
        const headersList = await headers();
        const domain = headersList.get("x-tenant-domain");

        if (!domain) {
            return NextResponse.json({ error: "Unknown store" }, { status: 400 });
        }

        const tenant = await db.tenant.findUnique({
            where: { domain },
            include: { storeConfig: true },
        });

        if (!tenant || !tenant.is_active) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // ── Validate body ──────────────────────────────────────
        const body = await req.json();
        const parsed = orderSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid data", details: parsed.error.flatten() },
                { status: 422 }
            );
        }

        const { items, customer, address, paymentMethod, couponCode } = parsed.data;

        // ── Verify products belong to this tenant ──────────────
        const productIds = items.map((i) => i.productId);
        const products = await db.product.findMany({
            where: {
                id: { in: productIds },
                tenant_id: tenant.id,
                is_active: true,
            },
        });

        if (products.length !== productIds.length) {
            return NextResponse.json(
                { error: "One or more products not found" },
                { status: 400 }
            );
        }

        // ── Check stock ────────────────────────────────────────
        for (const item of items) {
            const product = products.find((p) => p.id === item.productId);
            if (!product || product.stock < item.quantity) {
                return NextResponse.json(
                    { error: `Insufficient stock for: ${item.name}` },
                    { status: 400 }
                );
            }
        }

        // ── Apply coupon if provided ───────────────────────────
        let discountAmount = 0;
        if (couponCode) {
            const coupon = await db.coupon.findFirst({
                where: {
                    tenant_id: tenant.id,
                    code: couponCode.toUpperCase(),
                    OR: [{ expiry: null }, { expiry: { gte: new Date() } }],
                },
            });

            if (coupon) {
                const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
                if (coupon.type === "flat") {
                    discountAmount = Number(coupon.value);
                } else {
                    discountAmount = Math.round((subtotal * Number(coupon.value)) / 100);
                }
                // Increment usage
                await db.coupon.update({
                    where: { id: coupon.id },
                    data: { used_count: { increment: 1 } },
                });
            }
        }

        // ── Calculate total ────────────────────────────────────
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const total = Math.max(0, subtotal - discountAmount);

        // ── Upsert customer ────────────────────────────────────
        let customerRecord = null;
        if (customer.email) {
            customerRecord = await db.customer.upsert({
                where: {
                    tenant_id_email: {
                        tenant_id: tenant.id,
                        email: customer.email,
                    },
                },
                update: {
                    name: customer.name,
                    phone: customer.phone,
                },
                create: {
                    tenant_id: tenant.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    address: address,
                },
            });
        }

        // ── Create order ───────────────────────────────────────
        const order = await db.order.create({
            data: {
                tenant_id: tenant.id,
                customer_id: customerRecord?.id ?? null,
                status: paymentMethod === "cod" ? "confirmed" : "pending",
                payment_status: paymentMethod === "cod" ? "pending" : "awaiting",
                total: total,
                items_json: items,
                address_json: address,
            },
        });

        // ── Decrement stock ────────────────────────────────────
        await Promise.all(
            items.map((item) =>
                db.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                })
            )
        );

        return NextResponse.json({
            orderId: order.id,
            total,
            paymentMethod,
        });
    } catch (err) {
        console.error("[ORDER_CREATE]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}