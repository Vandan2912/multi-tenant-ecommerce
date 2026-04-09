# ARCHITECTURE.md — Multi-Tenancy, Auth, Database, Environment

---

## 1. How Multi-Tenancy Works

Every HTTP request flows through this pipeline:

```
Request hits Vercel
  → middleware.ts reads Host header (e.g. "store1.vandanpatel.in")
  → strips www, sets x-tenant-domain header
  → route handler calls getTenant() or getTenantWithConfig()
  → queries DB: SELECT * FROM "Tenant" WHERE domain = $domain
  → throws notFound() if tenant missing or inactive
  → every downstream DB query uses tenant.id for scoping
```

### The golden rule

```typescript
// ✅ CORRECT — always scope to tenant
const products = await db.product.findMany({
  where: { tenant_id: tenantId, is_active: true },
});

// ❌ WRONG — never do this
const products = await db.product.findMany({
  where: { is_active: true },
});
```

### Row Level Security

Supabase RLS is enabled on all tables as a second line of defense.
Even buggy application code cannot leak cross-tenant data.
RLS policy: `tenant_id = current_setting('app.current_tenant_id')`.

---

## 2. Database Schema

### Core tables

```
Tenant          — master client registry (domain, slug, plan, is_active)
StoreConfig     — per-client theme, features, contact, SEO (1:1 with Tenant)
Brand           — product brands, scoped per tenant
Category        — self-relation for subcategories via parent_id (max 2 levels)
OptionType      — reusable option definitions (Color, Size, Material) per tenant
ProductOption   — which option types a product uses + selected value IDs
Product         — product template — NO price/stock here (lives on Variant)
Variant         — purchasable item: price, discount_price, stock, unit, options_json
Order           — customer orders with items_json + address_json
Customer        — upserted by email per tenant on first order
AdminUser       — admin logins scoped to a tenant
PromoCode       — full promo rule set (see SYSTEMS.md)
PromoUsage      — per-usage tracking for per-user limits + analytics
```

### Critical design decisions

- **Products have no price/stock** — all on `Variant`. Every product needs ≥ 1 variant.
- **`Variant.options_json`** is JSONB: `{"Color": "Black", "Size": "M"}`
- **`Category.parent_id`** — null = top-level, set = subcategory
- **`OptionType.values_json`** — array of `{id, label, hex?, order?}`
- **`PromoCode` replaces the old `Coupon` model** — do not use Coupon

### Migrations

```bash
# Development
npx prisma migrate dev --name descriptive_name

# Production
npx prisma migrate deploy
```

Never edit the database directly. Always go through Prisma migrations.

---

## 3. Authentication

### Two auth paths

**Tenant admin** — stored in `AdminUser` table

- JWT includes: `tenantId`, `role`, `adminId`, `isSuperAdmin: false`
- Login at `/admin/login` — domain auto-filled from `window.location.host`
- Admin of store A cannot access `/admin` routes of store B

**Super admin** — credentials from env vars, not stored in DB

- JWT includes: `isSuperAdmin: true`, `tenantId: ""`
- Login at `/admin/login` using `SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_PASSWORD`
- Accesses `/superadmin/*` only

### Protecting routes

```typescript
// Admin routes — src/app/admin/layout.tsx
const session = await auth();
if (!session?.user?.tenantId) redirect("/admin/login");

// Super admin routes — src/app/superadmin/layout.tsx
const session = await auth();
if (!session?.user?.isSuperAdmin) redirect("/admin/login");

// API routes — every admin API file
const session = await auth();
if (!session?.user?.tenantId)
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

---

## 4. Environment Variables

### Required — app will not start without these

```bash
DATABASE_URL        # Supabase pooled connection (port 6543, pgbouncer=true)
DIRECT_URL          # Supabase direct connection (port 5432, migrations only)
NEXTAUTH_SECRET     # openssl rand -base64 32
NEXTAUTH_URL        # Full deployment URL (https://vandanpatel.in in prod)
SUPER_ADMIN_EMAIL   # Super admin login email
SUPER_ADMIN_PASSWORD # Super admin login password
```

### Required for features

```bash
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

### Rules

- `DATABASE_URL` — pooled, used by the app at runtime
- `DIRECT_URL` — direct, used ONLY by Prisma CLI for migrations
- Never commit `.env` or `.env.local`

---

## 5. Prisma 7 — Breaking Changes from v6

### Schema file — NO URLs allowed

```prisma
datasource db {
  provider = "postgresql"
  # NO url here — Prisma 7 reads from prisma.config.ts
}
```

### prisma.config.ts — URLs go here

```typescript
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"), // direct connection for migrations
  },
});
```

### Runtime client — requires adapter

```typescript
// src/lib/db.ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });
```

The singleton pattern in `src/lib/db.ts` uses `globalThis` to prevent
multiple Prisma client instances during Next.js hot reload in development.

---

## 6. Domain & DNS

### Adding a client domain (production)

1. Add domain in **Vercel Dashboard → Project → Settings → Domains**
2. Client adds DNS records at their registrar:

```
A     @    76.76.21.21
CNAME www  cname.vercel-dns.com.
```

For your own subdomains (`store1.vandanpatel.in`):

```
CNAME store1  cname.vercel-dns.com.
```

3. Create tenant via `/superadmin/new` with `domain: "riyafashion.com"`
4. DNS propagates in 15 min – 48 hrs

### External service dashboards

| Service    | URL                    | What to find                           |
| ---------- | ---------------------- | -------------------------------------- |
| Supabase   | app.supabase.com       | DB tables, RLS policies, direct DB URL |
| Cloudinary | cloudinary.com/console | API keys, images by folder             |
| Razorpay   | dashboard.razorpay.com | Keys, webhooks, payments               |
| Vercel     | vercel.com/dashboard   | Deployments, domains, env vars, logs   |
