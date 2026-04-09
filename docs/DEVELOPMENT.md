# DEVELOPMENT.md — Repo Structure, Patterns, Running Locally

---

## 1. Repo Structure

```
src/
├── app/
│   ├── (store)/                    # Customer-facing storefront
│   │   ├── layout.tsx              # Tenant config → CSS vars, CartProvider, Navbar
│   │   ├── page.tsx                # Homepage
│   │   ├── products/page.tsx       # Listing: filters, search, pagination
│   │   ├── products/[id]/page.tsx  # Detail: VariantSelector, specs, breadcrumb
│   │   ├── cart/page.tsx           # Cart (client component, localStorage)
│   │   ├── checkout/page.tsx       # Checkout: promo + COD/Razorpay
│   │   └── order-confirmed/page.tsx
│   │
│   ├── admin/                      # Tenant admin dashboard
│   │   ├── layout.tsx              # Auth guard + AdminSidebar
│   │   ├── page.tsx                # Stats dashboard
│   │   ├── login/page.tsx
│   │   ├── products/               # List + new + [id] (edit)
│   │   ├── options/page.tsx        # OptionType manager
│   │   ├── categories/page.tsx     # Category tree CRUD
│   │   ├── brands/page.tsx         # Brand CRUD
│   │   ├── orders/page.tsx         # Orders + inline status update
│   │   ├── customers/page.tsx      # Customer list + spend
│   │   ├── promos/page.tsx         # Full promo code manager
│   │   └── settings/page.tsx       # Theme + features
│   │
│   ├── superadmin/                 # Platform operator panel
│   │   ├── layout.tsx              # isSuperAdmin guard
│   │   ├── page.tsx                # All tenants + stats
│   │   ├── new/page.tsx            # Onboard new client
│   │   └── [id]/page.tsx           # Manage tenant
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth handler
│   │   ├── orders/route.ts         # Create order (public, tenant-scoped)
│   │   ├── search/route.ts         # Autocomplete (public)
│   │   ├── promo/validate/route.ts # Promo validation (public, rate-limited)
│   │   ├── payment/create-order/   # Razorpay order
│   │   ├── payment/webhook/        # Razorpay webhook
│   │   └── admin/                  # products, categories, brands, options,
│   │                               # orders, promos, settings, upload
│   │
│   ├── not-found.tsx               # Unknown domain 404
│   └── globals.css
│
├── lib/
│   ├── auth.ts                     # NextAuth (tenant admin + super admin)
│   ├── cart.ts                     # localStorage cart helpers
│   ├── cart-context.tsx            # CartProvider + useCart
│   ├── db.ts                       # Prisma singleton (PrismaPg adapter)
│   ├── options.ts                  # Option helpers, combination generator
│   ├── products.ts                 # All product queries + JSONB search
│   ├── promo.ts                    # Promo validation + usage recording
│   └── tenant.ts                   # getTenant() + getTenantWithConfig()
│
└── components/
    ├── Navbar.tsx                  # SearchModal + cart badge
    ├── ProductCard.tsx             # minimal | detailed | grid-dense
    ├── VariantSelector.tsx         # Option-driven picker with color swatches
    ├── SearchModal.tsx             # Cmd+K modal with keyboard nav
    ├── FilterSidebar.tsx           # Desktop filters (URL-driven)
    ├── FilterDrawer.tsx            # Mobile slide-out filters
    ├── PriceRangeSlider.tsx        # Dual-handle slider
    ├── SortSelect.tsx              # Sort dropdown
    ├── PromoInput.tsx              # Promo code input + live validate
    ├── RazorpayButton.tsx          # Online payment flow
    └── admin/
        ├── AdminSidebar.tsx
        ├── ProductForm.tsx         # Tabbed: basic / options / variants / specs
        ├── ImageUploader.tsx       # Drag-drop Cloudinary uploader
        ├── CategoryManager.tsx
        ├── BrandManager.tsx
        ├── OptionTypeManager.tsx
        ├── OrderStatusSelect.tsx   # Inline status changer
        ├── SettingsForm.tsx
        └── PromoManager.tsx
```

---

## 2. Common Code Patterns

### API route — authenticated, tenant-scoped

```typescript
export async function GET() {
  const session = await auth();
  if (!session?.user?.tenantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db.someModel.findMany({
    where: { tenant_id: session.user.tenantId }, // always scope
  });

  return NextResponse.json(data);
}
```

### API route — public, tenant from domain

```typescript
export async function POST(req: NextRequest) {
  const headersList = await headers();
  const domain = headersList.get("x-tenant-domain");

  const tenant = await db.tenant.findUnique({ where: { domain } });
  if (!tenant || !tenant.is_active)
    return NextResponse.json({ error: "Store not found" }, { status: 404 });

  // scope all queries to tenant.id from here
}
```

### Server component — get tenant + config

```typescript
export default async function SomePage() {
  let tenant;
  try {
    tenant = await getTenantWithConfig();
  } catch {
    notFound();
  }

  const primaryColor = tenant.storeConfig?.primary_color ?? "#2563EB";
}
```

### URL filter navigation helper

```typescript
function filterUrl(overrides: Record<string, string | undefined>) {
  const p = new URLSearchParams(params.toString());
  Object.entries(overrides).forEach(([k, v]) => {
    if (v) p.set(k, v);
    else p.delete(k);
  });
  p.delete("page"); // always reset page on filter change
  return `/products?${p.toString()}`;
}
```

---

## 3. Running Locally

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Run both test stores simultaneously:

```bash
npm run dev              # Store A → localhost:3000
npm run dev -- -p 3001   # Store B → localhost:3001
```

| Store       | URL                       | Admin login                                       |
| ----------- | ------------------------- | ------------------------------------------------- |
| Tech Store  | localhost:3000            | `admin@techstore.com` / `admin123`                |
| Fashion Hub | localhost:3001            | `admin@fashionhub.com` / `admin123`               |
| Super Admin | localhost:3000/superadmin | env: `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` |

The seed uses `upsert` — safe to run multiple times without duplicates.

---

## 4. Deployment

```bash
vercel --prod
```

Set all env vars in **Vercel → Project → Settings → Environment Variables**.

### Razorpay webhook (production only)

In Razorpay Dashboard → Webhooks → Add:

```
URL:    https://yourdomain.com/api/payment/webhook
Events: payment.captured, payment.failed
Secret: same as RAZORPAY_KEY_SECRET
```

---

## 5. Key Files Quick Reference

| Need to change               | File                                   |
| ---------------------------- | -------------------------------------- |
| Domain → tenant resolution   | `src/middleware.ts`                    |
| Tenant DB lookup             | `src/lib/tenant.ts`                    |
| All product/search queries   | `src/lib/products.ts`                  |
| Promo validation logic       | `src/lib/promo.ts`                     |
| Option type helpers + combos | `src/lib/options.ts`                   |
| Prisma client                | `src/lib/db.ts`                        |
| Auth config                  | `src/lib/auth.ts`                      |
| Store theme injection        | `src/app/(store)/layout.tsx`           |
| Admin auth guard             | `src/app/admin/layout.tsx`             |
| Order creation + promo apply | `src/app/api/orders/route.ts`          |
| Image upload to Cloudinary   | `src/app/api/admin/upload/route.ts`    |
| Razorpay webhook             | `src/app/api/payment/webhook/route.ts` |
| Database schema              | `prisma/schema.prisma`                 |
| Prisma CLI config            | `prisma.config.ts`                     |
