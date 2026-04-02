import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const { name, slug, parent_id } = await req.json();

  if (!name || !slug)
    return NextResponse.json(
      { error: "Name and slug required" },
      { status: 400 },
    );

  // Check slug uniqueness within tenant
  const existing = await db.category.findUnique({
    where: { tenant_id_slug: { tenant_id: tenantId, slug } },
  });
  if (existing)
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 });

  const category = await db.category.create({
    data: {
      tenant_id: tenantId,
      name,
      slug,
      parent_id: parent_id ?? null,
    },
  });

  return NextResponse.json(category);
}
