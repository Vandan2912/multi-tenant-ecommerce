import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const headersList = await headers();
    const domain = headersList.get("x-tenant-domain");

    if (!domain)
      return NextResponse.json({ error: "Unknown store" }, { status: 400 });

    const tenant = await db.tenant.findUnique({ where: { domain } });
    if (!tenant || !tenant.is_active)
      return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const orderId = req.nextUrl.searchParams.get("id")?.trim();
    if (!orderId)
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });

    const order = await db.order.findFirst({
      where: { id: orderId, tenant_id: tenant.id },
      select: {
        id: true,
        status: true,
        payment_status: true,
        total: true,
        items_json: true,
        address_json: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({
      id: order.id,
      status: order.status,
      payment_status: order.payment_status,
      total: Number(order.total),
      items: order.items_json,
      address: order.address_json,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (err) {
    console.error("[ORDER_TRACK]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
