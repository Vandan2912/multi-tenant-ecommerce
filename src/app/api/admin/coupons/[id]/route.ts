import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tenantId = session.user.tenantId;

  const coupon = await db.coupon.findFirst({
    where: { id, tenant_id: tenantId },
  });
  if (!coupon)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
