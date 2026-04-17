import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseSections } from "@/lib/page-builder/sections";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const page = await db.pageConfig.findFirst({
    where: { id, tenant_id: session.user.tenantId },
  });
  if (!page)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(page);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tenantId = session.user.tenantId;

  const existing = await db.pageConfig.findFirst({
    where: { id, tenant_id: tenantId },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.is_published === "boolean")
    data.is_published = body.is_published;
  if (Array.isArray(body.sections))
    data.sections_json = parseSections(body.sections);

  const updated = await db.pageConfig.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await db.pageConfig.findFirst({
    where: { id, tenant_id: session.user.tenantId },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.pageConfig.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
