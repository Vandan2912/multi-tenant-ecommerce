import { headers } from "next/headers";
import { db } from "./db";
import { Tenant } from "@prisma/client";

export type { Tenant };

export async function getTenant(): Promise<Tenant> {
  const headersList = await headers();
  const domain = headersList.get("x-tenant-domain");

  if (!domain) {
    throw new Error("No tenant domain found in request headers");
  }

  const tenant = await db.tenant.findUnique({
    where: { domain },
  });

  if (!tenant) {
    throw new Error(`No tenant found for domain: ${domain}`);
  }

  if (!tenant.is_active) {
    throw new Error(`Store is inactive: ${domain}`);
  }

  return tenant;
}

export async function getTenantWithConfig() {
  const headersList = await headers();
  const domain = headersList.get("x-tenant-domain");

  if (!domain) throw new Error("No tenant domain found");

  const tenant = await db.tenant.findUnique({
    where: { domain },
    include: { storeConfig: true },
  });

  if (!tenant) throw new Error(`No tenant found for domain: ${domain}`);
  if (!tenant.is_active) throw new Error(`Store is inactive: ${domain}`);

  return tenant;
}