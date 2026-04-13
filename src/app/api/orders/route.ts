import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { z } from "zod";
import { validatePromoCode, recordPromoUsage } from "@/lib/promo";

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    categoryId: z.string().nullable().optional(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().min(1),
    image: z.string(),
    variant: z.string().optional(),
  })).min(1),
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
  promoCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // ── Resolve tenant ───────────────────────────────────
    const headersList = await headers();
    const domain = headersList.get("x-tenant-domain");

    if (!domain)
      return NextResponse.json({ error: "Unknown store" }, { status: 400 });

    const tenant = await db.tenant.findUnique({
      where: { domain },
      include: { storeConfig: true },
    });
    if (!tenant || !tenant.is_active)
      return NextResponse.json({ error: "Store not found" }, { status: 404 });

    // ── Validate body ────────────────────────────────────
    const parsed = orderSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 422 });

    const { items, customer, address, paymentMethod, promoCode } = parsed.data;

    // ── Verify products belong to this tenant ────────────
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await db.product.findMany({
      where: { id: { in: productIds }, tenant_id: tenant.id, is_active: true },
      include: { category: true },
    });

    if (products.length !== productIds.length)
      return NextResponse.json({ error: "One or more products not found" }, { status: 400 });

    // ── Validate stock availability ──────────────────────
    const variantIds = items
      .filter((i) => i.variantId)
      .map((i) => i.variantId as string);

    if (variantIds.length > 0) {
      const variants = await db.variant.findMany({
        where: { id: { in: variantIds }, tenant_id: tenant.id },
        select: { id: true, stock: true, name: true },
      });

      for (const item of items) {
        if (!item.variantId) continue;
        const variant = variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json({ error: `Variant not found for "${item.name}"` }, { status: 400 });
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json(
            { error: `Only ${variant.stock} unit(s) available for "${item.name}"` },
            { status: 400 },
          );
        }
      }
    }

    // ── Validate promo code (server-side, never trust client) ──
    let promoDiscount = 0;
    let promoCodeRecord = null;
    let isFreeShipping = false;

    if (promoCode?.trim()) {
      const identifier = customer.phone || customer.email || "";

      const cartItemsForPromo = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          categoryId: product?.category_id ?? null,
          price: item.price,
          quantity: item.quantity,
        };
      });

      const promoResult = await validatePromoCode(
        tenant.id,
        promoCode,
        cartItemsForPromo,
        identifier,
      );

      if (!promoResult.valid)
        return NextResponse.json({ error: promoResult.error }, { status: 400 });

      promoDiscount = promoResult.discount;
      promoCodeRecord = promoResult.promoCode;
      isFreeShipping = promoResult.promoCode.discount_type === "free_shipping";
    }

    // ── Calculate total ──────────────────────────────────
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = isFreeShipping ? 0 : 0; // your shipping logic here
    const total = Math.max(0, subtotal - promoDiscount + shipping);

    // ── Upsert customer ──────────────────────────────────
    let customerRecord = null;
    if (customer.email) {
      customerRecord = await db.customer.upsert({
        where: { tenant_id_email: { tenant_id: tenant.id, email: customer.email } },
        update: { name: customer.name, phone: customer.phone },
        create: {
          tenant_id: tenant.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address,
        },
      });
    }

    // ── Create order ─────────────────────────────────────
    const order = await db.order.create({
      data: {
        tenant_id: tenant.id,
        customer_id: customerRecord?.id ?? null,
        status: paymentMethod === "cod" ? "confirmed" : "pending",
        payment_status: paymentMethod === "cod" ? "pending" : "awaiting",
        total,
        items_json: items,
        address_json: { ...address, name: customer.name, phone: customer.phone },
      },
    });

    // ── Decrement stock for COD orders ───────────────────
    if (paymentMethod === "cod" && variantIds.length > 0) {
      await db.$transaction(
        items
          .filter((i) => i.variantId)
          .map((i) =>
            db.variant.update({
              where: { id: i.variantId! },
              data: { stock: { decrement: i.quantity } },
            }),
          ),
      );
    }

    // ── Record promo usage ───────────────────────────────
    if (promoCodeRecord && promoDiscount > 0) {
      const identifier = customer.phone || customer.email || "";
      await recordPromoUsage(
        promoCodeRecord.id,
        tenant.id,
        identifier,
        order.id,
        promoDiscount,
      );
    }

    return NextResponse.json({
      orderId: order.id,
      total,
      subtotal,
      promoDiscount,
      isFreeShipping,
      paymentMethod,
    });

  } catch (err) {
    console.error("[ORDER_CREATE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}