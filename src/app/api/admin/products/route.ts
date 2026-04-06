import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const body = await req.json();

  const product = await db.product.create({
    data: {
      tenant_id: tenantId,
      name: body.name,
      description: body.description ?? null,
      category_id: body.category_id ?? null,
      brand_id: body.brand_id ?? null,
      images: body.images ?? [],
      specs_json: body.specs_json ?? {},
      is_active: body.is_active ?? true,
      variants: {
        create: (body.variants ?? []).map((v: any) => ({
          tenant_id: tenantId,
          name: v.name,
          sku: v.sku ?? null,
          price: v.price,
          discount_price: v.discount_price ?? null,
          stock: v.stock ?? 0,
          unit: v.unit ?? "piece",
          options_json: v.options_json ?? {},
          is_active: v.is_active ?? true,
        })),
      },
      productOptions: {
        create: (body.productOptions ?? []).map((po: any) => ({
          tenant_id: tenantId,
          option_type_id: po.option_type_id,
          position: po.position ?? 0,
          selected_values_json: po.selected_values_json ?? [],
        })),
      },
    },
  });

  return NextResponse.json(product);
}