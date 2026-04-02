import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  // ── Tenant A ───────────────────────────────────────────────
  const tenantA = await db.tenant.upsert({
    where: { domain: "localhost:3000" },
    update: {},
    create: {
      name: "Tech Store",
      domain: "localhost:3000",
      slug: "tech-store",
      plan: "standard",
      storeConfig: {
        create: {
          primary_color: "#2563EB",
          font_family: "Inter",
          hero_layout: "centered",
          product_card_style: "detailed",
          store_tagline: "Best tech at best prices",
          features_json: { enableCOD: true, enableWishlist: true, enableCoupons: true },
          contact_json: { phone: "+91 98765 43210", email: "hello@techstore.com", whatsapp: "919876543210" },
          seo_json: { title: "Tech Store — Gadgets & Electronics", description: "Shop the latest electronics." },
        },
      },
      adminUsers: { create: { email: "admin@techstore.com", password_hash: passwordHash, role: "admin" } },
    },
  });
  console.log("✓ Tenant A:", tenantA.name);

  // ── Tenant B ───────────────────────────────────────────────
  const tenantB = await db.tenant.upsert({
    where: { domain: "localhost:3001" },
    update: {},
    create: {
      name: "Fashion Hub",
      domain: "localhost:3001",
      slug: "fashion-hub",
      plan: "standard",
      storeConfig: {
        create: {
          primary_color: "#E91E8C",
          font_family: "Poppins",
          hero_layout: "split",
          product_card_style: "minimal",
          store_tagline: "Fashion for everyone",
          features_json: { enableCOD: true, enableWishlist: true, enableCoupons: true },
          contact_json: { phone: "+91 91234 56789", email: "hello@fashionhub.com", whatsapp: "919123456789" },
          seo_json: { title: "Fashion Hub — Trendy Clothing", description: "Latest fashion trends." },
        },
      },
      adminUsers: { create: { email: "admin@fashionhub.com", password_hash: passwordHash, role: "admin" } },
    },
  });
  console.log("✓ Tenant B:", tenantB.name);

  // ── Brands for A ───────────────────────────────────────────
  const brandSony = await db.brand.upsert({
    where: { tenant_id_slug: { tenant_id: tenantA.id, slug: "sony" } },
    update: {},
    create: { tenant_id: tenantA.id, name: "Sony", slug: "sony" },
  });
  const brandBoAt = await db.brand.upsert({
    where: { tenant_id_slug: { tenant_id: tenantA.id, slug: "boat" } },
    update: {},
    create: { tenant_id: tenantA.id, name: "boAt", slug: "boat" },
  });
  console.log("✓ Brands for A");

  // ── Brands for B ───────────────────────────────────────────
  const brandHM = await db.brand.upsert({
    where: { tenant_id_slug: { tenant_id: tenantB.id, slug: "h-and-m" } },
    update: {},
    create: { tenant_id: tenantB.id, name: "H&M", slug: "h-and-m" },
  });
  const brandZara = await db.brand.upsert({
    where: { tenant_id_slug: { tenant_id: tenantB.id, slug: "zara" } },
    update: {},
    create: { tenant_id: tenantB.id, name: "Zara", slug: "zara" },
  });
  console.log("✓ Brands for B");

  // ── Categories for A ───────────────────────────────────────
  const catElectronics = await db.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenantA.id, slug: "electronics" } },
    update: {},
    create: { tenant_id: tenantA.id, name: "Electronics", slug: "electronics", parent_id: null },
  });
  const catAudio = await db.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenantA.id, slug: "audio" } },
    update: {},
    create: { tenant_id: tenantA.id, name: "Audio", slug: "audio", parent_id: catElectronics.id },
  });
  const catWearables = await db.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenantA.id, slug: "wearables" } },
    update: {},
    create: { tenant_id: tenantA.id, name: "Wearables", slug: "wearables", parent_id: catElectronics.id },
  });
  console.log("✓ Categories for A");

  // ── Categories for B ───────────────────────────────────────
  const catClothing = await db.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenantB.id, slug: "clothing" } },
    update: {},
    create: { tenant_id: tenantB.id, name: "Clothing", slug: "clothing", parent_id: null },
  });
  const catMen = await db.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenantB.id, slug: "men" } },
    update: {},
    create: { tenant_id: tenantB.id, name: "Men", slug: "men", parent_id: catClothing.id },
  });
  const catWomen = await db.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenantB.id, slug: "women" } },
    update: {},
    create: { tenant_id: tenantB.id, name: "Women", slug: "women", parent_id: catClothing.id },
  });
  console.log("✓ Categories for B");

  // ── Products for A ─────────────────────────────────────────
  const productHeadphones = await db.product.create({
    data: {
      tenant_id: tenantA.id,
      brand_id: brandSony.id,
      category_id: catAudio.id,
      name: "Sony WH-1000XM5",
      description: "Industry-leading noise cancellation with 30-hour battery life.",
      images: ["https://placehold.co/600x600/2563EB/white?text=WH-1000XM5"],
      specs_json: {
        "Driver Size": "30mm",
        "Frequency Response": "4Hz–40,000Hz",
        "Battery Life": "30 hours",
        "Connectivity": "Bluetooth 5.2",
        "Weight": "250g",
      },
      variants: {
        create: [
          {
            tenant_id: tenantA.id,
            name: "Black",
            sku: "SONY-WH1000XM5-BLK",
            price: 29990,
            discount_price: 24990,
            stock: 15,
            unit: "piece",
            options_json: { Color: "Black" },
          },
          {
            tenant_id: tenantA.id,
            name: "Silver",
            sku: "SONY-WH1000XM5-SLV",
            price: 29990,
            discount_price: 24990,
            stock: 8,
            unit: "piece",
            options_json: { Color: "Silver" },
          },
        ],
      },
    },
  });

  const productEarbuds = await db.product.create({
    data: {
      tenant_id: tenantA.id,
      brand_id: brandBoAt.id,
      category_id: catAudio.id,
      name: "boAt Airdopes 141",
      description: "42 hours total playback with ENx technology for clear calls.",
      images: ["https://placehold.co/600x600/2563EB/white?text=Airdopes141"],
      specs_json: {
        "Playback Time": "42 hours total",
        "Driver Size": "8mm",
        "Connectivity": "Bluetooth 5.1",
        "Water Resistance": "IPX4",
        "Weight": "4.1g per earbud",
      },
      variants: {
        create: [
          {
            tenant_id: tenantA.id,
            name: "Bold Black",
            sku: "BOAT-141-BLK",
            price: 1499,
            discount_price: 999,
            stock: 50,
            unit: "piece",
            options_json: { Color: "Bold Black" },
          },
          {
            tenant_id: tenantA.id,
            name: "Active White",
            sku: "BOAT-141-WHT",
            price: 1499,
            discount_price: 999,
            stock: 35,
            unit: "piece",
            options_json: { Color: "Active White" },
          },
          {
            tenant_id: tenantA.id,
            name: "Navy Blue",
            sku: "BOAT-141-NVY",
            price: 1499,
            discount_price: 999,
            stock: 0,
            unit: "piece",
            options_json: { Color: "Navy Blue" },
          },
        ],
      },
    },
  });

  const productWatch = await db.product.create({
    data: {
      tenant_id: tenantA.id,
      brand_id: brandSony.id,
      category_id: catWearables.id,
      name: "Sony SmartBand",
      description: "Track your fitness goals with heart rate monitoring.",
      images: ["https://placehold.co/600x600/2563EB/white?text=SmartBand"],
      specs_json: {
        "Display": "0.96 inch OLED",
        "Battery": "7 days",
        "Water Resistance": "IP68",
        "Sensors": "Heart rate, SpO2, Accelerometer",
      },
      variants: {
        create: [
          {
            tenant_id: tenantA.id,
            name: "Small",
            sku: "SONY-SB-S",
            price: 4999,
            discount_price: 3999,
            stock: 20,
            unit: "piece",
            options_json: { Size: "Small", Color: "Black" },
          },
          {
            tenant_id: tenantA.id,
            name: "Large",
            sku: "SONY-SB-L",
            price: 4999,
            discount_price: 3999,
            stock: 12,
            unit: "piece",
            options_json: { Size: "Large", Color: "Black" },
          },
        ],
      },
    },
  });
  console.log("✓ Products for A:", 3);

  // ── Products for B ─────────────────────────────────────────
  const productShirt = await db.product.create({
    data: {
      tenant_id: tenantB.id,
      brand_id: brandHM.id,
      category_id: catMen.id,
      name: "Slim Fit Oxford Shirt",
      description: "Classic Oxford shirt in soft cotton blend. Perfect for office or casual wear.",
      images: ["https://placehold.co/600x600/E91E8C/white?text=OxfordShirt"],
      specs_json: {
        "Material": "80% Cotton, 20% Polyester",
        "Fit": "Slim Fit",
        "Collar": "Button-down",
        "Care": "Machine wash 30°C",
        "Country of Origin": "India",
      },
      variants: {
        create: [
          { tenant_id: tenantB.id, name: "S / White", sku: "HM-SHIRT-S-WHT", price: 1999, discount_price: 1499, stock: 20, unit: "piece", options_json: { Size: "S", Color: "White" } },
          { tenant_id: tenantB.id, name: "M / White", sku: "HM-SHIRT-M-WHT", price: 1999, discount_price: 1499, stock: 25, unit: "piece", options_json: { Size: "M", Color: "White" } },
          { tenant_id: tenantB.id, name: "L / White", sku: "HM-SHIRT-L-WHT", price: 1999, discount_price: 1499, stock: 18, unit: "piece", options_json: { Size: "L", Color: "White" } },
          { tenant_id: tenantB.id, name: "S / Blue",  sku: "HM-SHIRT-S-BLU", price: 1999, discount_price: 1499, stock: 15, unit: "piece", options_json: { Size: "S", Color: "Blue" } },
          { tenant_id: tenantB.id, name: "M / Blue",  sku: "HM-SHIRT-M-BLU", price: 1999, discount_price: 1499, stock: 22, unit: "piece", options_json: { Size: "M", Color: "Blue" } },
          { tenant_id: tenantB.id, name: "L / Blue",  sku: "HM-SHIRT-L-BLU", price: 1999, discount_price: 1499, stock: 0,  unit: "piece", options_json: { Size: "L", Color: "Blue" } },
        ],
      },
    },
  });

  const productDress = await db.product.create({
    data: {
      tenant_id: tenantB.id,
      brand_id: brandZara.id,
      category_id: catWomen.id,
      name: "Floral Wrap Dress",
      description: "Elegant wrap dress with floral print. Adjustable tie waist for a flattering fit.",
      images: ["https://placehold.co/600x600/E91E8C/white?text=WrapDress"],
      specs_json: {
        "Material": "100% Viscose",
        "Fit": "Wrap",
        "Length": "Midi",
        "Care": "Hand wash cold",
        "Country of Origin": "India",
      },
      variants: {
        create: [
          { tenant_id: tenantB.id, name: "XS / Red",  sku: "ZR-DRESS-XS-RED", price: 3999, discount_price: 2999, stock: 10, unit: "piece", options_json: { Size: "XS", Color: "Red" } },
          { tenant_id: tenantB.id, name: "S / Red",   sku: "ZR-DRESS-S-RED",  price: 3999, discount_price: 2999, stock: 14, unit: "piece", options_json: { Size: "S",  Color: "Red" } },
          { tenant_id: tenantB.id, name: "M / Red",   sku: "ZR-DRESS-M-RED",  price: 3999, discount_price: 2999, stock: 16, unit: "piece", options_json: { Size: "M",  Color: "Red" } },
          { tenant_id: tenantB.id, name: "S / Blue",  sku: "ZR-DRESS-S-BLU",  price: 3999, discount_price: 2999, stock: 8,  unit: "piece", options_json: { Size: "S",  Color: "Blue" } },
          { tenant_id: tenantB.id, name: "M / Blue",  sku: "ZR-DRESS-M-BLU",  price: 3999, discount_price: 2999, stock: 0,  unit: "piece", options_json: { Size: "M",  Color: "Blue" } },
        ],
      },
    },
  });
  console.log("✓ Products for B:", 2);

  console.log("\n✅ Seed complete");
  console.log("   Store A admin: admin@techstore.com / admin123  → localhost:3000/admin");
  console.log("   Store B admin: admin@fashionhub.com / admin123 → localhost:3001/admin");
}

main()
  .catch(console.error)
  .finally(() => pool.end());