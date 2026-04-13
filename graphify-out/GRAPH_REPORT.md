# Graph Report - .  (2026-04-14)

## Corpus Check
- Corpus is ~35,491 words - fits in a single context window. You may not need a graph.

## Summary
- 282 nodes · 233 edges · 83 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Tenant Resolution & Architecture|Tenant Resolution & Architecture]]
- [[_COMMUNITY_Database Schema & Tables|Database Schema & Tables]]
- [[_COMMUNITY_API Route Handlers|API Route Handlers]]
- [[_COMMUNITY_Admin CRUD Routes|Admin CRUD Routes]]
- [[_COMMUNITY_Product Query Functions|Product Query Functions]]
- [[_COMMUNITY_Cart Management|Cart Management]]
- [[_COMMUNITY_Product Variants & Options|Product Variants & Options]]
- [[_COMMUNITY_Order Form & Checkout|Order Form & Checkout]]
- [[_COMMUNITY_Promo Code Admin UI|Promo Code Admin UI]]
- [[_COMMUNITY_Search Navigation|Search Navigation]]
- [[_COMMUNITY_Option Value CRUD|Option Value CRUD]]
- [[_COMMUNITY_Product Pricing Display|Product Pricing Display]]
- [[_COMMUNITY_Product Filter UI|Product Filter UI]]
- [[_COMMUNITY_Variant Combination Generator|Variant Combination Generator]]
- [[_COMMUNITY_Product Search System|Product Search System]]
- [[_COMMUNITY_Variant Selector UI|Variant Selector UI]]
- [[_COMMUNITY_Image Upload UI|Image Upload UI]]
- [[_COMMUNITY_Brand Management|Brand Management]]
- [[_COMMUNITY_Admin Auth Flow|Admin Auth Flow]]
- [[_COMMUNITY_Store Layout|Store Layout]]
- [[_COMMUNITY_Price Range Slider|Price Range Slider]]
- [[_COMMUNITY_Razorpay Checkout|Razorpay Checkout]]
- [[_COMMUNITY_Promo Input Component|Promo Input Component]]
- [[_COMMUNITY_Store Settings Form|Store Settings Form]]
- [[_COMMUNITY_Category Manager|Category Manager]]
- [[_COMMUNITY_Cart Context Provider|Cart Context Provider]]
- [[_COMMUNITY_Tenant Resolution Library|Tenant Resolution Library]]
- [[_COMMUNITY_Promo Validation Logic|Promo Validation Logic]]
- [[_COMMUNITY_Database Seed Script|Database Seed Script]]
- [[_COMMUNITY_Next.js Middleware|Next.js Middleware]]
- [[_COMMUNITY_Root App Layout|Root App Layout]]
- [[_COMMUNITY_Not Found Page|Not Found Page]]
- [[_COMMUNITY_Superadmin Onboarding|Superadmin Onboarding]]
- [[_COMMUNITY_Admin Dashboard Layout|Admin Dashboard Layout]]
- [[_COMMUNITY_Admin Dashboard Home|Admin Dashboard Home]]
- [[_COMMUNITY_Admin Store Settings|Admin Store Settings]]
- [[_COMMUNITY_Admin Options Page|Admin Options Page]]
- [[_COMMUNITY_New Product Page|New Product Page]]
- [[_COMMUNITY_Edit Product Page|Edit Product Page]]
- [[_COMMUNITY_Admin Brands Page|Admin Brands Page]]
- [[_COMMUNITY_Admin Coupons Page|Admin Coupons Page]]
- [[_COMMUNITY_Admin Promos Page|Admin Promos Page]]
- [[_COMMUNITY_Admin Categories Page|Admin Categories Page]]
- [[_COMMUNITY_Storefront Products Page|Storefront Products Page]]
- [[_COMMUNITY_Sort Select Component|Sort Select Component]]
- [[_COMMUNITY_Add to Cart Button|Add to Cart Button]]
- [[_COMMUNITY_Tenant Toggle|Tenant Toggle]]
- [[_COMMUNITY_Order Status Select|Order Status Select]]
- [[_COMMUNITY_Order Status Badge|Order Status Badge]]
- [[_COMMUNITY_Admin Sidebar|Admin Sidebar]]
- [[_COMMUNITY_Coupon Manager|Coupon Manager]]
- [[_COMMUNITY_Product Form Admin|Product Form Admin]]
- [[_COMMUNITY_Promo Code Generator|Promo Code Generator]]
- [[_COMMUNITY_Prisma DB Client|Prisma DB Client]]
- [[_COMMUNITY_Cart & Wishlist|Cart & Wishlist]]
- [[_COMMUNITY_Prisma Config|Prisma Config]]
- [[_COMMUNITY_Next.js Type Declarations|Next.js Type Declarations]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_NextAuth Type Declarations|NextAuth Type Declarations]]
- [[_COMMUNITY_Superadmin Layout|Superadmin Layout]]
- [[_COMMUNITY_Superadmin Home Page|Superadmin Home Page]]
- [[_COMMUNITY_Superadmin New Tenant|Superadmin New Tenant]]
- [[_COMMUNITY_Superadmin Tenant Detail|Superadmin Tenant Detail]]
- [[_COMMUNITY_Storefront Home Page|Storefront Home Page]]
- [[_COMMUNITY_Product Detail Page|Product Detail Page]]
- [[_COMMUNITY_Storefront Orders Route|Storefront Orders Route]]
- [[_COMMUNITY_Admin Login Page|Admin Login Page]]
- [[_COMMUNITY_Admin Orders Page|Admin Orders Page]]
- [[_COMMUNITY_Admin Product Detail|Admin Product Detail]]
- [[_COMMUNITY_Admin Customers Page|Admin Customers Page]]
- [[_COMMUNITY_Navbar Component|Navbar Component]]
- [[_COMMUNITY_Filter Drawer Component|Filter Drawer Component]]
- [[_COMMUNITY_Auth Config|Auth Config]]
- [[_COMMUNITY_Repo Structure Docs|Repo Structure Docs]]
- [[_COMMUNITY_Storefront Routes Docs|Storefront Routes Docs]]
- [[_COMMUNITY_Admin Routes Docs|Admin Routes Docs]]
- [[_COMMUNITY_Superadmin Routes Docs|Superadmin Routes Docs]]
- [[_COMMUNITY_API Routes Docs|API Routes Docs]]
- [[_COMMUNITY_Analytics Dashboard Feature|Analytics Dashboard Feature]]
- [[_COMMUNITY_Email Notifications Feature|Email Notifications Feature]]
- [[_COMMUNITY_Shipping Calculation Feature|Shipping Calculation Feature]]
- [[_COMMUNITY_Product Reviews Feature|Product Reviews Feature]]
- [[_COMMUNITY_Bulk CSV Import Feature|Bulk CSV Import Feature]]

## God Nodes (most connected - your core abstractions)
1. `Database Schema` - 14 edges
2. `POST()` - 13 edges
3. `Multi-Tenant E-Commerce Platform` - 10 edges
4. `Promo Validation Logic (src/lib/promo.ts)` - 7 edges
5. `PATCH()` - 6 edges
6. `DELETE()` - 6 edges
7. `Tenant Table` - 5 edges
8. `handleSubmit()` - 4 edges
9. `GET()` - 4 edges
10. `getCart()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Tenant ID Filter Rule (The One Rule)` --semantically_similar_to--> `Row Level Security (Supabase RLS)`  [INFERRED] [semantically similar]
  CLAUDE.md → docs/ARCHITECTURE.md
- `RazorpayButton.tsx` --references--> `Razorpay Payments`  [INFERRED]
  docs/DEVELOPMENT.md → CLAUDE.md
- `Multi-Tenancy Architecture` --references--> `Multi-Tenant E-Commerce Platform`  [EXTRACTED]
  docs/ARCHITECTURE.md → CLAUDE.md
- `Row Level Security (Supabase RLS)` --references--> `Supabase (PostgreSQL)`  [EXTRACTED]
  docs/ARCHITECTURE.md → CLAUDE.md
- `Prisma Singleton (src/lib/db.ts)` --references--> `Supabase (PostgreSQL)`  [EXTRACTED]
  docs/ARCHITECTURE.md → CLAUDE.md

## Hyperedges (group relationships)
- **Tenant Isolation Stack (Middleware + RLS + tenant_id filter)** — arch_middleware, arch_rls, claude_tenant_id_rule [INFERRED 0.90]
- **Order Creation Flow (API + Promo Validation + Razorpay)** — dev_api_orders, systems_promo_validation, dev_api_webhook [INFERRED 0.85]
- **Product Variant Generation (OptionType + Combination Generator + Variant Table)** — systems_option_type, systems_combination_generator, arch_variant_table [EXTRACTED 0.95]

## Communities

### Community 0 - "Tenant Resolution & Architecture"
Cohesion: 0.09
Nodes (28): Domain & DNS Setup, getTenant() / getTenantWithConfig(), middleware.ts — Tenant Domain Resolution, Multi-Tenancy Architecture, Prisma 7 Config (prisma.config.ts), Prisma Singleton (src/lib/db.ts), Rationale: RLS as Second Line of Defense, Row Level Security (Supabase RLS) (+20 more)

### Community 1 - "Database Schema & Tables"
Cohesion: 0.09
Nodes (26): Brand Table, Category Table (self-referential), Customer Table, Database Schema, OptionType Table, Order Table, Product Table, ProductOption Table (+18 more)

### Community 2 - "API Route Handlers"
Cohesion: 0.13
Nodes (3): checkRateLimit(), GET(), POST()

### Community 3 - "Admin CRUD Routes"
Cohesion: 0.22
Nodes (2): DELETE(), PATCH()

### Community 4 - "Product Query Functions"
Cohesion: 0.28
Nodes (3): getCategoryIds(), getPriceRange(), getProducts()

### Community 5 - "Cart Management"
Cohesion: 0.39
Nodes (5): addToCart(), getCart(), removeFromCart(), saveCart(), updateQuantity()

### Community 6 - "Product Variants & Options"
Cohesion: 0.22
Nodes (9): ProductForm.tsx (admin), VariantSelector.tsx, src/lib/options.ts, Combination Generator (src/lib/options.ts), OptionType System (Color/Size/Material), Product & Variant System, Rationale: Soft Delete Preserves Price/Stock Data, Size Sorting (SIZE_ORDER) (+1 more)

### Community 7 - "Order Form & Checkout"
Cohesion: 0.29
Nodes (2): handleSubmit(), validate()

### Community 8 - "Promo Code Admin UI"
Cohesion: 0.25
Nodes (0): 

### Community 9 - "Search Navigation"
Cohesion: 0.47
Nodes (3): handleKeyDown(), navigate(), navigateSearch()

### Community 10 - "Option Value CRUD"
Cohesion: 0.33
Nodes (0): 

### Community 11 - "Product Pricing Display"
Cohesion: 0.6
Nodes (3): getPrice(), getPriceRange(), PriceDisplay()

### Community 12 - "Product Filter UI"
Cohesion: 0.5
Nodes (2): toggleInStock(), updateParam()

### Community 13 - "Variant Combination Generator"
Cohesion: 0.4
Nodes (0): 

### Community 14 - "Product Search System"
Cohesion: 0.4
Nodes (5): SearchModal.tsx, src/lib/products.ts, Search Autocomplete (Cmd+K Modal), Full Product Search (URL-driven filters), JSONB Search via db.$queryRaw

### Community 15 - "Variant Selector UI"
Cohesion: 0.5
Nodes (0): 

### Community 16 - "Image Upload UI"
Cohesion: 0.5
Nodes (0): 

### Community 17 - "Brand Management"
Cohesion: 0.67
Nodes (2): handleAdd(), slugify()

### Community 18 - "Admin Auth Flow"
Cohesion: 0.67
Nodes (4): AdminUser Table, Super Admin Auth Flow, Tenant Admin Auth Flow, src/lib/auth.ts

### Community 19 - "Store Layout"
Cohesion: 0.67
Nodes (0): 

### Community 20 - "Price Range Slider"
Cohesion: 0.67
Nodes (0): 

### Community 21 - "Razorpay Checkout"
Cohesion: 0.67
Nodes (0): 

### Community 22 - "Promo Input Component"
Cohesion: 0.67
Nodes (0): 

### Community 23 - "Store Settings Form"
Cohesion: 0.67
Nodes (0): 

### Community 24 - "Category Manager"
Cohesion: 0.67
Nodes (0): 

### Community 25 - "Cart Context Provider"
Cohesion: 0.67
Nodes (0): 

### Community 26 - "Tenant Resolution Library"
Cohesion: 0.67
Nodes (0): 

### Community 27 - "Promo Validation Logic"
Cohesion: 0.67
Nodes (0): 

### Community 28 - "Database Seed Script"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Next.js Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Root App Layout"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Not Found Page"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Superadmin Onboarding"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Admin Dashboard Layout"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Admin Dashboard Home"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Admin Store Settings"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Admin Options Page"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "New Product Page"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Edit Product Page"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Admin Brands Page"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Admin Coupons Page"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Admin Promos Page"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Admin Categories Page"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Storefront Products Page"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Sort Select Component"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Add to Cart Button"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Tenant Toggle"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Order Status Select"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Order Status Badge"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Admin Sidebar"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Coupon Manager"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Product Form Admin"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Promo Code Generator"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Prisma DB Client"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Cart & Wishlist"
Cohesion: 1.0
Nodes (2): src/lib/cart.ts, Feature: Wishlist

### Community 55 - "Prisma Config"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Next.js Type Declarations"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Tailwind Config"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "NextAuth Type Declarations"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Superadmin Layout"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Superadmin Home Page"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Superadmin New Tenant"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "Superadmin Tenant Detail"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Storefront Home Page"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Product Detail Page"
Cohesion: 1.0
Nodes (0): 

### Community 65 - "Storefront Orders Route"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "Admin Login Page"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "Admin Orders Page"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "Admin Product Detail"
Cohesion: 1.0
Nodes (0): 

### Community 69 - "Admin Customers Page"
Cohesion: 1.0
Nodes (0): 

### Community 70 - "Navbar Component"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "Filter Drawer Component"
Cohesion: 1.0
Nodes (0): 

### Community 72 - "Auth Config"
Cohesion: 1.0
Nodes (0): 

### Community 73 - "Repo Structure Docs"
Cohesion: 1.0
Nodes (1): Repo Structure

### Community 74 - "Storefront Routes Docs"
Cohesion: 1.0
Nodes (1): Storefront (store) Routes

### Community 75 - "Admin Routes Docs"
Cohesion: 1.0
Nodes (1): Admin Dashboard Routes

### Community 76 - "Superadmin Routes Docs"
Cohesion: 1.0
Nodes (1): Super Admin Panel Routes

### Community 77 - "API Routes Docs"
Cohesion: 1.0
Nodes (1): API Routes

### Community 78 - "Analytics Dashboard Feature"
Cohesion: 1.0
Nodes (1): Feature: Admin Analytics Dashboard

### Community 79 - "Email Notifications Feature"
Cohesion: 1.0
Nodes (1): Feature: Email Notifications

### Community 80 - "Shipping Calculation Feature"
Cohesion: 1.0
Nodes (1): Feature: Shipping Calculation

### Community 81 - "Product Reviews Feature"
Cohesion: 1.0
Nodes (1): Feature: Product Reviews / Ratings

### Community 82 - "Bulk CSV Import Feature"
Cohesion: 1.0
Nodes (1): Feature: Bulk Product Import (CSV)

## Knowledge Gaps
- **45 isolated node(s):** `Next.js 14 (App Router)`, `NextAuth.js`, `Tailwind CSS`, `Product Table`, `Customer Table` (+40 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Database Seed Script`** (2 nodes): `seed.ts`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Middleware`** (2 nodes): `middleware()`, `middleware.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Root App Layout`** (2 nodes): `RootLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Not Found Page`** (2 nodes): `NotFound()`, `not-found.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Superadmin Onboarding`** (2 nodes): `OnboardClientPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Dashboard Layout`** (2 nodes): `AdminLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Dashboard Home`** (2 nodes): `AdminDashboard()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Store Settings`** (2 nodes): `AdminSettingsPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Options Page`** (2 nodes): `AdminOptionsPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `New Product Page`** (2 nodes): `NewProductPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Edit Product Page`** (2 nodes): `EditProductPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Brands Page`** (2 nodes): `AdminBrandsPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Coupons Page`** (2 nodes): `AdminCouponsPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Promos Page`** (2 nodes): `AdminPromosPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Categories Page`** (2 nodes): `AdminCategoriesPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Storefront Products Page`** (2 nodes): `filterUrl()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sort Select Component`** (2 nodes): `SortSelect()`, `SortSelect.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Add to Cart Button`** (2 nodes): `AddToCartButton()`, `AddToCartButton.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tenant Toggle`** (2 nodes): `TenantToggle.tsx`, `TenantToggle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Order Status Select`** (2 nodes): `OrderStatusSelect()`, `OrderStatusSelect.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Order Status Badge`** (2 nodes): `OrderStatusBadge()`, `OrderStatusBadge.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Sidebar`** (2 nodes): `AdminSidebar()`, `AdminSidebar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Coupon Manager`** (2 nodes): `CouponManager()`, `CouponManager.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Product Form Admin`** (2 nodes): `ProductForm()`, `ProductForm.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Promo Code Generator`** (2 nodes): `generatePromoCode()`, `promo-utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Prisma DB Client`** (2 nodes): `createPrismaClient()`, `db.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cart & Wishlist`** (2 nodes): `src/lib/cart.ts`, `Feature: Wishlist`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Prisma Config`** (1 nodes): `prisma.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Type Declarations`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `NextAuth Type Declarations`** (1 nodes): `next-auth.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Superadmin Layout`** (1 nodes): `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Superadmin Home Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Superadmin New Tenant`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Superadmin Tenant Detail`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Storefront Home Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Product Detail Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Storefront Orders Route`** (1 nodes): `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Login Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Orders Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Product Detail`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Customers Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Navbar Component`** (1 nodes): `Navbar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Filter Drawer Component`** (1 nodes): `FilterDrawer.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Config`** (1 nodes): `auth.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Repo Structure Docs`** (1 nodes): `Repo Structure`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Storefront Routes Docs`** (1 nodes): `Storefront (store) Routes`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Routes Docs`** (1 nodes): `Admin Dashboard Routes`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Superadmin Routes Docs`** (1 nodes): `Super Admin Panel Routes`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes Docs`** (1 nodes): `API Routes`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Analytics Dashboard Feature`** (1 nodes): `Feature: Admin Analytics Dashboard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Email Notifications Feature`** (1 nodes): `Feature: Email Notifications`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Shipping Calculation Feature`** (1 nodes): `Feature: Shipping Calculation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Product Reviews Feature`** (1 nodes): `Feature: Product Reviews / Ratings`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Bulk CSV Import Feature`** (1 nodes): `Feature: Bulk Product Import (CSV)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Database Schema` connect `Database Schema & Tables` to `Tenant Resolution & Architecture`, `Admin Auth Flow`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Tenant Table` connect `Tenant Resolution & Architecture` to `Database Schema & Tables`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `Multi-Tenant E-Commerce Platform` connect `Tenant Resolution & Architecture` to `Database Schema & Tables`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `Next.js 14 (App Router)`, `NextAuth.js`, `Tailwind CSS` to the rest of the system?**
  _45 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Tenant Resolution & Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Database Schema & Tables` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `API Route Handlers` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._