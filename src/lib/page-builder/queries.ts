import { db } from "@/lib/db";
import {
  createSection,
  parseSections,
  type PageSections,
} from "./sections";

// Default homepage layout used when a tenant has no PageConfig yet.
// Mirrors the hard-coded homepage so stores look the same out of the box.
export function defaultHomepageSections(
  storeName: string,
  tagline?: string | null,
): PageSections {
  const hero = createSection("hero", 0);
  hero.config = {
    ...hero.config,
    title: `Welcome to ${storeName}`,
    subtitle: tagline ?? "Discover our collection",
    buttonText: "Shop Now",
    buttonLink: "/products",
  };

  const featured = createSection("featured_products", 1);
  featured.config = {
    ...featured.config,
    title: "Latest Products",
    mode: "latest",
    limit: 8,
    cardStyle: "minimal",
  };

  const categories = createSection("category_grid", 2);
  categories.config = {
    ...categories.config,
    title: "Shop by Category",
    mode: "all",
    columns: 4,
  };

  return [hero, featured, categories];
}

export async function getPublishedPage(tenantId: string, slug: string) {
  const page = await db.pageConfig.findUnique({
    where: { tenant_id_slug: { tenant_id: tenantId, slug } },
  });
  if (!page || !page.is_published) return null;
  return { ...page, sections: parseSections(page.sections_json) };
}

export async function getPageForAdmin(tenantId: string, slug: string) {
  const page = await db.pageConfig.findUnique({
    where: { tenant_id_slug: { tenant_id: tenantId, slug } },
  });
  if (!page) return null;
  return { ...page, sections: parseSections(page.sections_json) };
}

export async function listPages(tenantId: string) {
  return db.pageConfig.findMany({
    where: { tenant_id: tenantId },
    orderBy: { updatedAt: "desc" },
  });
}
