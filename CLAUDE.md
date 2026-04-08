# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run dev2         # Start second dev server on port 3001 (multi-tenant testing)
npm run build        # prisma generate + next build
npm run seed         # Seed DB with 2 sample tenants
npm run lint         # ESLint check
```

No test runner is configured in this project.

## Architecture

This is a **Next.js 14 App Router** multi-tenant SaaS ecommerce platform. Each tenant is a separate store identified by domain (e.g., `store1.example.com`).

### Multi-Tenancy

`src/middleware.ts` intercepts every request, reads the `Host` header, and injects `x-tenant-domain`. Route handlers call `getTenant()` or `getTenantWithConfig()` from `src/lib/tenant.ts` to look up the tenant. Every Prisma query must filter by `tenant_id` — this is the core isolation contract.

### Three Application Layers

| Layer | Path | Purpose |
|---|---|---|
| Storefront | `src/app/(store)/` | Customer-facing shopping (public) |
| Admin Dashboard | `src/app/admin/(dashboard)/` | Per-tenant store management (protected) |
| SuperAdmin | `src/app/superadmin/` | Platform-level tenant lifecycle management |

### Authentication

- **NextAuth.js 5 (beta)** with JWT strategy — no database sessions
- Two credential flows: superadmin (hardcoded via `SUPER_ADMIN_EMAIL`/`SUPER_ADMIN_PASSWORD` env vars), tenant admin (DB-backed with bcryptjs)
- JWT extends with `tenantId`, `role`, `adminId`, `isSuperAdmin` — see `src/types/next-auth.d.ts`

### Data Layer

- **Prisma + PostgreSQL** (Supabase-hosted)
- `DATABASE_URL` uses connection pooling; `DIRECT_URL` is the direct connection used for migrations
- `src/lib/db.ts` exports a Prisma singleton
- Schema: `prisma/schema.prisma` — 12 tables, all core tables include `tenant_id`

### Key lib files

- `src/lib/tenant.ts` — tenant resolution helpers
- `src/lib/cart-context.tsx` — React Context + localStorage for cart state
- `src/lib/products.ts` — product queries with filtering/search/pagination
- `src/lib/promo.ts` — promo code validation logic (complex rules: min order, per-user limits, category/product exclusions)

### Product Model

Products have **Variants** (with independent pricing/stock) composed from reusable **OptionTypes** (e.g., "Size": S/M/L/XL). OptionTypes are tenant-scoped and reusable across products.

### Payments

Razorpay integration — per-tenant keys stored in `StoreConfig`. Payment webhook at `src/app/api/payment/webhook/`. Images hosted on Cloudinary; upload endpoint at `src/app/api/admin/upload/`.

## Environment Variables

```
DATABASE_URL          # PostgreSQL connection pooling URL (Supabase)
DIRECT_URL            # Direct PostgreSQL URL for migrations
NEXTAUTH_SECRET       # JWT signing secret
NEXTAUTH_URL          # Canonical URL for auth callbacks
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
SUPER_ADMIN_EMAIL
SUPER_ADMIN_PASSWORD
```

Razorpay keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) can be set globally or per-tenant via StoreConfig.

## Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
