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
        await db.order.update({
          where: { id: orderId },
          data: {
            payment_status: "paid",
            status: "confirmed",
          },
        });
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
