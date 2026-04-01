import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  // ── Tenant A ────────────────────────────────────────────
  const tenantA = await db.tenant.upsert({
    where: { domain: "localhost:3000" },
    update: {},
    create: {
      name: "Demo Store A",
      domain: "localhost:3000",
      slug: "demo-store-a",
      plan: "standard",
      storeConfig: {
        create: {
          primary_color: "#2563EB",
          font_family: "Inter",
          hero_layout: "centered",
          product_card_style: "minimal",
          store_tagline: "Everything you need",
          features_json: {
            enableCOD: true,
            enableWishlist: true,
            enableCoupons: true,
          },
          contact_json: {
            phone: "+91 98765 43210",
            whatsapp: "919876543210",
            email: "hello@store-a.com",
          },
          seo_json: {
            title: "Demo Store A — Shop Online",
            description: "Your one-stop shop for everything.",
          },
        },
      },
    },
  });

  console.log("✓ Tenant A created:", tenantA.name, `(${tenantA.domain})`);

  // ── Tenant B ─────────────────────────────────────────────
  const tenantB = await db.tenant.upsert({
    where: { domain: "localhost:3001" },
    update: {},
    create: {
      name: "Demo Store B",
      domain: "localhost:3001",
      slug: "demo-store-b",
      plan: "basic",
      storeConfig: {
        create: {
          primary_color: "#E91E8C",
          font_family: "Poppins",
          hero_layout: "split",
          product_card_style: "detailed",
          store_tagline: "Fashion for everyone",
          features_json: {
            enableCOD: false,
            enableWishlist: false,
            enableCoupons: true,
          },
          contact_json: {
            phone: "+91 91234 56789",
            whatsapp: "919123456789",
            email: "hello@store-b.com",
          },
          seo_json: {
            title: "Demo Store B — Fashion",
            description: "Trendy fashion delivered fast.",
          },
        },
      },
    },
  });

  console.log("✓ Tenant B created:", tenantB.name, `(${tenantB.domain})`);
}

main()
  .catch(console.error)
  .finally(() => pool.end());