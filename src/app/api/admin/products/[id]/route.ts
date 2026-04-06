import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tenantId = session.user.tenantId;
  const body = await req.json();

  const existing = await db.product.findFirst({ where: { id, tenant_id: tenantId } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update base product
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

  // Upsert product options
  for (const po of body.productOptions ?? []) {
    await db.productOption.upsert({
      where: {
        product_id_option_type_id: {
          product_id: id,
          option_type_id: po.option_type_id,
        },
      },
      update: {
        selected_values_json: po.selected_values_json,
        position: po.position,
      },
      create: {
        product_id: id,
        tenant_id: tenantId,
        option_type_id: po.option_type_id,
        selected_values_json: po.selected_values_json,
        position: po.position,
      },
    });
  }

  // Remove deselected options
  const incomingOptionTypeIds = (body.productOptions ?? []).map((po: any) => po.option_type_id);
  await db.productOption.deleteMany({
    where: {
      product_id: id,
      option_type_id: { notIn: incomingOptionTypeIds },
    },
  });

  // Handle variants — soft approach
  const existingVariants = await db.variant.findMany({ where: { product_id: id } });
  const existingMap = new Map(existingVariants.map((v) => [v.id, v]));

  for (const v of body.variants ?? []) {
    if (v.id && existingMap.has(v.id)) {
      // Update existing
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
    } else if (!v.id) {
      // Create new
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

  // Mark variants not in incoming list as inactive (soft)
  const incomingIds = (body.variants ?? []).filter((v: any) => v.id).map((v: any) => v.id);
  await db.variant.updateMany({
    where: {
      product_id: id,
      id: { notIn: incomingIds },
    },
    data: { is_active: false },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tenantId = session.user.tenantId;

  const existing = await db.product.findFirst({ where: { id, tenant_id: tenantId } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}