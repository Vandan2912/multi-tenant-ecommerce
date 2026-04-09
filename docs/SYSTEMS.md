# SYSTEMS.md — Products, Variants, Promos, Search, Images

---

## 1. Product & Variant System

### Concept

```
OptionType (tenant-level, reusable)
  "Color" → [{id, label: "Black", hex: "#000000"}, {id, label: "Red", hex: "#EF4444"}]
  "Size"  → [{id, label: "XS"}, {id, label: "S"}, {id, label: "M"}]

Product
  └── ProductOption — which option types used + which value IDs selected
        e.g. Color: [black-id, red-id], Size: [xs-id, s-id, m-id]

  └── Variant (auto-generated combinations)
        Black / XS  → price, discount_price, stock, unit, SKU
        Black / S   → price, discount_price, stock, unit, SKU
        Black / M   → ...
        Red   / XS  → ...
        (6 total = 2 colors × 3 sizes)
```

### Combination generator

`src/lib/options.ts` — `generateCombinations()` produces cartesian product of selected values.
`variantNameFromOptions()` builds the display name: `"Black / XS"`.

### Soft delete on regeneration

When option values change on an existing product:

- **Existing variants** matching current combos → preserved (price/stock data kept)
- **New combos** not in existing variants → created as new rows
- **Removed combos** not in incoming list → marked `is_active: false`, never hard-deleted

This is intentional. Hard-deleting loses price/stock data that was manually entered.

### Size sorting

`SIZE` type values always sort by `SIZE_ORDER` in `options.ts`:
`XXXS < XXS < XS < S < M < L < XL < XXL < XXXL`
Regardless of insertion order. Enforced in `sortSizeValues()`.

### Option type field types

| Type      | Use case             | Extra metadata               |
| --------- | -------------------- | ---------------------------- |
| `TEXT`    | Material, Fit, Style | none                         |
| `COLOUR`  | Color swatches       | `hex` field for swatch color |
| `SIZE`    | Clothing/shoe sizes  | auto-sorted by SIZE_ORDER    |
| `NUMBER`  | Weight, Volume       | none                         |
| `BOOLEAN` | Yes/No options       | max 2 values                 |

---

## 2. Promo Code System

### Validation order (all server-side, `src/lib/promo.ts`)

1. Code exists — normalized: `code.trim().toUpperCase()`
2. `is_active` check
3. `start_date` and `expiry_date` range against `new Date()`
4. Global `usage_limit` check (`used_count >= usage_limit`)
5. Per-user `usage_limit_per_user` check (queries `PromoUsage` by `identifier`)
6. Stacking check — if `stackable: false` and another promo already active
7. Eligible cart items filtered by `applicable_products`, `applicable_categories`, `excluded_products`
8. `minimum_order_value` check against full cart total
9. Discount calculated on eligible subtotal only

### Discount types

| Type            | Behavior                                                        |
| --------------- | --------------------------------------------------------------- |
| `percentage`    | X% of eligible subtotal, capped by `maximum_discount` if set    |
| `fixed`         | Flat ₹ amount, capped at eligible subtotal (no negative totals) |
| `free_shipping` | Returns `isFreeShipping: true`, discount = 0                    |

### Never trust the client

`PromoInput.tsx` validates for UX feedback only.
The real validation runs in `src/app/api/orders/route.ts` at order creation.
A client bypassing the UI will be caught server-side.

### Rate limiting

`/api/promo/validate` — in-memory, max 10 attempts per IP per minute.
**Replace with Redis for multi-instance Vercel deployments in production.**

### Recording usage

After order created, `recordPromoUsage()` in `src/lib/promo.ts`:

- Creates a `PromoUsage` row (for per-user tracking + analytics)
- Increments `PromoCode.used_count`

---

## 3. Search

### Autocomplete (Cmd+K modal)

- `SearchModal.tsx` — opens on `Cmd+K` / `Ctrl+K` / clicking the search button
- 250ms debounce → `GET /api/search?q=query`
- Returns 8 results: name, brand, category, image, lowest variant price
- Keyboard nav: `↑↓` move, `Enter` selects, `Esc` closes
- "View all results" → navigates to `/products?search=query`

### Full product search (listing page filters)

URL-driven: `/products?search=black+cotton+shirt`

Searches via raw SQL (`db.$queryRaw`) because Prisma does not support
JSONB value search with standard `contains`. Searches across:

- `Product.name` (ILIKE)
- `Product.description` (ILIKE)
- `Brand.name` (ILIKE)
- `Category.name` (ILIKE)
- `Variant.name` (ILIKE) — e.g. "Black / M"
- `Variant.options_json` values via `jsonb_each_text()` — e.g. searches "black" matches `{"Color":"Black"}`
- `Product.specs_json` values via `jsonb_each_text()` — e.g. searches "cotton" matches `{"Material":"Cotton"}`

### Price filtering

Filters on variant price, not product price.
Uses `discount_price` when set, otherwise `price`:

```sql
WHERE (
  (discount_price IS NOT NULL AND discount_price >= $min AND discount_price <= $max)
  OR (discount_price IS NULL AND price >= $min AND price <= $max)
)
```

### URL filter params

| Param      | Example               | Notes                                         |
| ---------- | --------------------- | --------------------------------------------- |
| `search`   | `?search=black+shirt` | Full-text across all fields                   |
| `category` | `?category=audio`     | Includes subcategories automatically          |
| `brands`   | `?brands=sony,boat`   | Comma-separated slugs, multi-select           |
| `min`      | `?min=1000`           | Variant price                                 |
| `max`      | `?max=30000`          | Variant price                                 |
| `instock`  | `?instock=true`       | Only variants with stock > 0                  |
| `sort`     | `?sort=price_asc`     | newest \| price_asc \| price_desc \| name_asc |
| `page`     | `?page=2`             | Pagination                                    |

All filters are stateless URL params — shareable, bookmarkable, browser back/forward works.

---

## 4. Image Upload

### Flow

```
Admin selects/drops image in ImageUploader.tsx
  → file sent to POST /api/admin/upload as multipart/form-data
  → server converts to base64
  → uploads to Cloudinary: folder = stores/{tenantId}/products/
  → transformation: width 1200, height 1200, crop limit, quality auto, format auto
  → returns secure_url
  → stored in Product.images[] (string array)
```

### Cloudinary folder structure

`stores/{tenantId}/products/` — tenant images isolated by folder.

### Transformations on upload

Auto-converts to WebP for modern browsers. Max 1200×1200px. Quality auto-optimized.
Reduces storage and improves storefront load speed.

### Manual URL fallback

`ImageUploader.tsx` has a collapsible "paste URLs manually" section.
Useful for images already hosted on external CDNs.

### Image reordering

Admin can reorder images with `←` `→` buttons in the preview grid.
First image = main product image shown in cards and search results.

---

## 5. Things That Must Never Happen

| What                                         | Why                                      |
| -------------------------------------------- | ---------------------------------------- |
| DB query without `tenant_id` filter          | Data leak between clients                |
| Secrets in committed files                   | Security breach                          |
| `localStorage` in server components          | Runtime error                            |
| URLs in `prisma/schema.prisma` datasource    | Prisma 7 breaks                          |
| Hard-deleting variants on regeneration       | Loses manually-entered price/stock data  |
| Trusting client-side promo discount          | Always recalculate server-side           |
| Using old `Coupon` model                     | Replaced by `PromoCode`                  |
| Storefront queries without `is_active: true` | Shows hidden products to customers       |
| `db.$queryRaw` with string concatenation     | SQL injection — always use parameterized |
