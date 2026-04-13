import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    const secret = process.env.RAZORPAY_KEY_SECRET!;

    // Verify signature
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const notes = payment.notes ?? {};
      const orderId = notes.internal_order_id;

      if (orderId) {
        // Guard against double-processing (Razorpay can retry webhooks)
        const existing = await db.order.findUnique({
          where: { id: orderId },
          select: { payment_status: true, items_json: true },
        });

        if (existing && existing.payment_status !== "paid") {
          type OrderItem = { variantId?: string; quantity: number };
          const items = (existing.items_json ?? []) as OrderItem[];

          const stockDecrements = items
            .filter((i) => i.variantId)
            .map((i) =>
              db.variant.update({
                where: { id: i.variantId! },
                data: { stock: { decrement: i.quantity } },
              }),
            );

          await db.$transaction([
            db.order.update({
              where: { id: orderId },
              data: { payment_status: "paid", status: "confirmed" },
            }),
            ...stockDecrements,
          ]);
        }
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const notes = payment.notes ?? {};
      const orderId = notes.internal_order_id;

      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: { payment_status: "failed", status: "cancelled" },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[WEBHOOK]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
