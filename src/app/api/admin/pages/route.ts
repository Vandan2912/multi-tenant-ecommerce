import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseSections } from "@/lib/page-builder/sections";

export async function GET() {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pages = await db.pageConfig.findMany({
    where: { tenant_id: session.user.tenantId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const body = await req.json();

  const slug = String(body.slug ?? "").trim().toLowerCase();
  const title = String(body.title ?? "").trim();
  const page_type = String(body.page_type ?? "custom");

  if (!slug || !title)
    return NextResponse.json(
      { error: "slug and title required" },
      { status: 400 },
    );

  const existing = await db.pageConfig.findUnique({
    where: { tenant_id_slug: { tenant_id: tenantId, slug } },
  });
  if (existing)
    return NextResponse.json(
      { error: "Page with this slug already exists" },
      { status: 400 },
    );

  const sections = parseSections(body.sections ?? []);

  const page = await db.pageConfig.create({
    data: {
      tenant_id: tenantId,
      page_type,
      slug,
      title,
      sections_json: sections,
      is_published: Boolean(body.is_published),
    },
  });

  return NextResponse.json(page);
}
