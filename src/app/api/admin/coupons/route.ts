import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const { code, type, value, expiry, usage_limit } = await req.json();

  if (!code || !type || value === undefined)
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );

  const existing = await db.coupon.findFirst({
    where: { tenant_id: tenantId, code },
  });
  if (existing)
    return NextResponse.json(
      { error: "Coupon code already exists" },
      { status: 400 },
    );

  const coupon = await db.coupon.create({
    data: {
      tenant_id: tenantId,
      code: code.toUpperCase(),
      type,
      value,
      expiry: expiry ? new Date(expiry) : null,
      usage_limit: usage_limit ?? null,
    },
  });

  return NextResponse.json(coupon);
}
