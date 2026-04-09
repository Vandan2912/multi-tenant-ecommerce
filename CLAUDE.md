# CLAUDE.md — Multi-Tenant E-Commerce Platform

> Read this file first. Detailed docs are split across `docs/` — follow links below.

---

## What This Is

A **white-label, multi-tenant e-commerce platform** for small Indian businesses.
One Next.js app, one Supabase database, one Vercel deployment — serves all client stores.
Each client gets their own storefront at their own domain. No code cloning per client.

---

## Detailed Documentation

| File                                           | Covers                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Multi-tenancy, DB schema, auth, environment variables, Prisma 7 notes  |
| [`docs/SYSTEMS.md`](docs/SYSTEMS.md)           | Product/variant system, promo codes, search, image upload              |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)   | Repo structure, patterns, running locally, deployment, quick reference |

---

## Tech Stack

| Layer      | Tech                                 |
| ---------- | ------------------------------------ |
| Framework  | Next.js 14 (App Router) + TypeScript |
| Database   | PostgreSQL via Supabase              |
| ORM        | Prisma 7                             |
| Auth       | NextAuth.js (beta)                   |
| Styling    | Tailwind CSS                         |
| Payments   | Razorpay                             |
| Images     | Cloudinary                           |
| Deployment | Vercel                               |

---

## The One Rule

**Every DB query that touches tenant data must include `WHERE tenant_id = $tenantId`.**
No exceptions. One missing filter = data leak between clients.

---

## Quick Start

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Local stores: `localhost:3000` (Tech Store) · `localhost:3001` (Fashion Hub)
Admin: `/admin/login` · Super admin: `/superadmin`
Seed credentials: `admin@techstore.com` / `admin123`
