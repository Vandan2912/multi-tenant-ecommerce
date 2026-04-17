import { getTenantWithConfig } from "@/lib/tenant";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/sections/PageRenderer";
import {
  defaultHomepageSections,
  getPublishedPage,
} from "@/lib/page-builder/queries";

export default async function HomePage() {
  let tenant;
  try {
    tenant = await getTenantWithConfig();
  } catch {
    notFound();
  }

  const primaryColor = tenant.storeConfig?.primary_color ?? "#2563EB";

  const published = await getPublishedPage(tenant.id, "home");
  const sections =
    published?.sections ??
    defaultHomepageSections(tenant.name, tenant.storeConfig?.store_tagline);

  return (
    <main className="min-h-screen">
      <PageRenderer
        sections={sections}
        tenantId={tenant.id}
        primaryColor={primaryColor}
      />
    </main>
  );
}
