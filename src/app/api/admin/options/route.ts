import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await auth();
    if (!session?.user?.tenantId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const options = await db.optionType.findMany({
        where: { tenant_id: session.user.tenantId },
        orderBy: { position: "asc" },
    });

    return NextResponse.json(options);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.tenantId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tenantId = session.user.tenantId;
    const { name, type, values_json, position } = await req.json();

    const existing = await db.optionType.findUnique({
        where: { tenant_id_name: { tenant_id: tenantId, name } },
    });
    if (existing)
        return NextResponse.json({ error: "Option type with this name already exists" }, { status: 400 });

    const option = await db.optionType.create({
        data: {
            tenant_id: tenantId,
            name,
            type,
            values_json: values_json ?? [],
            position: position ?? 0,
        },
    });

    return NextResponse.json(option);
}