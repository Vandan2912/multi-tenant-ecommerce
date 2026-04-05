import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
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

    const { amount } = await req.json(); // amount in paise (₹1 = 100 paise)

    if (!amount || amount < 100)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    // Use tenant's Razorpay key if set, else fall back to platform key
    const keyId =
      tenant.storeConfig?.razorpay_key_id ?? process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error("[RAZORPAY_CREATE]", err);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 },
    );
  }
}
