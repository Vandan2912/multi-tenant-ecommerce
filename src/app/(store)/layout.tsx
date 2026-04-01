import type { Metadata } from "next";
import { getTenantWithConfig } from "@/lib/tenant";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const tenant = await getTenantWithConfig();
    const seo = tenant.storeConfig?.seo_json as {
      title?: string;
      description?: string;
    } | null;

    return {
      title: seo?.title ?? tenant.name,
      description: seo?.description ?? "",
    };
  } catch {
    return { title: "Store" };
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let tenant;

  try {
    tenant = await getTenantWithConfig();
  } catch {
    notFound();
  }

  const config = tenant.storeConfig;

  const primaryColor = config?.primary_color ?? "#2563EB";
  const fontFamily = config?.font_family ?? "Inter";

  // Build Google Fonts URL
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={fontUrl} />

      <div
        style={
          {
            "--color-primary": primaryColor,
            "--font-family": `'${fontFamily}', sans-serif`,
            fontFamily: `'${fontFamily}', sans-serif`,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </>
  );
}
