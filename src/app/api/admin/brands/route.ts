import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const { name, slug, logo_url } = await req.json();

  const existing = await db.brand.findUnique({
    where: { tenant_id_slug: { tenant_id: tenantId, slug } },
  });
  if (existing)
    return NextResponse.json(
      { error: "Brand slug already exists" },
      { status: 400 },
    );

  const brand = await db.brand.create({
    data: { tenant_id: tenantId, name, slug, logo_url: logo_url ?? null },
  });

  return NextResponse.json(brand);
}
