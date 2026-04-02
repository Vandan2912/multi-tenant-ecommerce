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

  const brand = await db.brand.findFirst({
    where: { id, tenant_id: tenantId },
    include: { _count: { select: { products: true } } },
  });

  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (brand._count.products > 0)
    return NextResponse.json(
      { error: "Reassign products before deleting brand" },
      { status: 400 },
    );

  await db.brand.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
