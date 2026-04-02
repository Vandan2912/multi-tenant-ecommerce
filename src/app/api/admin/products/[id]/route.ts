import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tenantId = session.user.tenantId;
  const body = await req.json();

  const existing = await db.product.findFirst({
    where: { id, tenant_id: tenantId },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update product fields
  await db.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description ?? null,
      category_id: body.category_id ?? null,
      brand_id: body.brand_id ?? null,
      images: body.images ?? [],
      specs_json: body.specs_json ?? {},
      is_active: body.is_active,
    },
  });

  // Handle variants
  for (const v of body.variants ?? []) {
    if (v._delete && v.id) {
      await db.variant.delete({ where: { id: v.id } });
    } else if (v.id) {
      await db.variant.update({
        where: { id: v.id },
        data: {
          name: v.name,
          sku: v.sku ?? null,
          price: v.price,
          discount_price: v.discount_price ?? null,
          stock: v.stock ?? 0,
          unit: v.unit ?? "piece",
          options_json: v.options_json ?? {},
          is_active: v.is_active ?? true,
        },
      });
    } else if (!v._delete) {
      await db.variant.create({
        data: {
          tenant_id: tenantId,
          product_id: id,
          name: v.name,
          sku: v.sku ?? null,
          price: v.price,
          discount_price: v.discount_price ?? null,
          stock: v.stock ?? 0,
          unit: v.unit ?? "piece",
          options_json: v.options_json ?? {},
          is_active: v.is_active ?? true,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tenantId = session.user.tenantId;

  const existing = await db.product.findFirst({
    where: { id, tenant_id: tenantId },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Hard delete cascades to variants via schema
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
