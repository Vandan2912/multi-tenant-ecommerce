import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import type { ShippingConfig } from "@/lib/shipping";

export async function GET() {
  const headersList = await headers();
  const domain = headersList.get("x-tenant-domain");

  if (!domain)
    return NextResponse.json({ error: "Unknown store" }, { status: 400 });

  const config = await db.storeConfig.findFirst({
    where: { tenant: { domain, is_active: true } },
    select: { shipping_json: true, features_json: true },
  });

  const shipping = (config?.shipping_json ?? { type: "free" }) as ShippingConfig;
  const features = (config?.features_json ?? {}) as Record<string, boolean>;

  return NextResponse.json({ shipping, features });
}
