import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

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
  console.log("✓ Tenant A:", tenantA.name);

  // ── Tenant B ────────────────────────────────────────────
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
  console.log("✓ Tenant B:", tenantB.name);

  // ── Categories for A ─────────────────────────────────────
  const catElectronics = await db.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenantA.id, slug: "electronics" } },
    update: {},
    create: { tenant_id: tenantA.id, name: "Electronics", slug: "electronics" },
  });
  const catHome = await db.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenantA.id, slug: "home" } },
    update: {},
    create: { tenant_id: tenantA.id, name: "Home & Kitchen", slug: "home" },
  });
  console.log("✓ Categories for A");

  // ── Categories for B ─────────────────────────────────────
  const catWomen = await db.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenantB.id, slug: "women" } },
    update: {},
    create: { tenant_id: tenantB.id, name: "Women", slug: "women" },
  });
  const catMen = await db.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenantB.id, slug: "men" } },
    update: {},
    create: { tenant_id: tenantB.id, name: "Men", slug: "men" },
  });
  console.log("✓ Categories for B");

  // ── Products for Tenant A ────────────────────────────────
  const productsA = [
    {
      name: "Wireless Headphones",
      description: "Premium sound quality with 30-hour battery life and active noise cancellation.",
      price: 2999,
      discount_price: 2499,
      stock: 50,
      category_id: catElectronics.id,
      images: ["https://placehold.co/600x600/2563EB/white?text=Headphones"],
    },
    {
      name: "Smart Watch",
      description: "Track fitness, receive notifications, and more. Water resistant up to 50m.",
      price: 4999,
      discount_price: null,
      stock: 30,
      category_id: catElectronics.id,
      images: ["https://placehold.co/600x600/2563EB/white?text=SmartWatch"],
    },
    {
      name: "Coffee Maker",
      description: "Brew the perfect cup every morning. 12-cup capacity with programmable timer.",
      price: 3499,
      discount_price: 2999,
      stock: 20,
      category_id: catHome.id,
      images: ["https://placehold.co/600x600/2563EB/white?text=CoffeeMaker"],
    },
    {
      name: "Blender Pro",
      description: "1000W motor, 6 stainless steel blades. Perfect for smoothies and soups.",
      price: 1999,
      discount_price: null,
      stock: 15,
      category_id: catHome.id,
      images: ["https://placehold.co/600x600/2563EB/white?text=Blender"],
    },
  ];

  for (const p of productsA) {
    await db.product.create({
      data: { tenant_id: tenantA.id, ...p, price: p.price, discount_price: p.discount_price ?? undefined },
    });
  }
  console.log("✓ Products for A:", productsA.length);

  // ── Products for Tenant B ────────────────────────────────
  const productsB = [
    {
      name: "Floral Kurta",
      description: "Light cotton kurta with elegant floral print. Available in multiple sizes.",
      price: 899,
      discount_price: 699,
      stock: 100,
      category_id: catWomen.id,
      images: ["https://placehold.co/600x600/E91E8C/white?text=Kurta"],
    },
    {
      name: "Embroidered Dupatta",
      description: "Hand-embroidered dupatta in premium silk. Pairs well with any salwar suit.",
      price: 599,
      discount_price: null,
      stock: 60,
      category_id: catWomen.id,
      images: ["https://placehold.co/600x600/E91E8C/white?text=Dupatta"],
    },
    {
      name: "Men's Linen Shirt",
      description: "Breathable linen shirt perfect for summer. Regular fit, full sleeves.",
      price: 1299,
      discount_price: 999,
      stock: 45,
      category_id: catMen.id,
      images: ["https://placehold.co/600x600/E91E8C/white?text=Shirt"],
    },
    {
      name: "Men's Chino Pants",
      description: "Slim fit chinos in stretchable fabric. Available in navy, beige and olive.",
      price: 1499,
      discount_price: null,
      stock: 35,
      category_id: catMen.id,
      images: ["https://placehold.co/600x600/E91E8C/white?text=Chinos"],
    },
  ];

  for (const p of productsB) {
    await db.product.create({
      data: { tenant_id: tenantB.id, ...p, price: p.price, discount_price: p.discount_price ?? undefined },
    });
  }
  console.log("✓ Products for B:", productsB.length);


  // ── Admin users ──────────────────────────────────────────
  const passwordHash = await bcrypt.hash("admin123", 10);

  await db.adminUser.upsert({
    where: { tenant_id_email: { tenant_id: tenantA.id, email: "admin@store-a.com" } },
    update: {},
    create: {
      tenant_id: tenantA.id,
      email: "admin@store-a.com",
      password_hash: passwordHash,
      role: "admin",
    },
  });
  console.log("✓ Admin for A: admin@store-a.com / admin123");

  await db.adminUser.upsert({
    where: { tenant_id_email: { tenant_id: tenantB.id, email: "admin@store-b.com" } },
    update: {},
    create: {
      tenant_id: tenantB.id,
      email: "admin@store-b.com",
      password_hash: passwordHash,
      role: "admin",
    },
  });
  console.log("✓ Admin for B: admin@store-b.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => pool.end());