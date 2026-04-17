import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { PageRenderer } from "@/components/sections/PageRenderer";
import { parseSections } from "@/lib/page-builder/sections";

export const dynamic = "force-dynamic";

export default async function PagePreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const { id } = await params;
  const [page, tenant] = await Promise.all([
    db.pageConfig.findFirst({
      where: { id, tenant_id: session.user.tenantId },
    }),
    db.tenant.findUnique({
      where: { id: session.user.tenantId },
      include: { storeConfig: true },
    }),
  ]);

  if (!page || !tenant) notFound();

  const primaryColor = tenant.storeConfig?.primary_color ?? "#2563EB";
  const fontFamily = tenant.storeConfig?.font_family ?? "Inter";
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
  const sections = parseSections(page.sections_json);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={fontUrl} />

      <div
        style={{
          "--color-primary": primaryColor,
          fontFamily: `'${fontFamily}', sans-serif`,
        } as React.CSSProperties}
        className="min-h-screen bg-white"
      >
        {!page.is_published && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 text-center font-medium">
            Draft preview — not published
          </div>
        )}
        {sections.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">
            No sections yet. Add sections to see a preview.
          </div>
        ) : (
          <PageRenderer
            sections={sections}
            tenantId={tenant.id}
            primaryColor={primaryColor}
          />
        )}
      </div>
    </>
  );
}
