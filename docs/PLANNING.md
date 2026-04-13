# 🚀 What's Missing — Next Feature Candidates

## 🥇 Tier 1 — High Impact, Core Commerce Gaps

| #   | Feature                          | Why                                                                                                                                                                                                     |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Order Tracking for Customers** | Customers have zero visibility after checkout — no way to check order status. The order-confirmed page is a dead end. Need a `/orders/track` page where customers enter order ID + phone to see status. |
| 2   | **Stock Decrement on Order**     | Orders are created but stock is never decremented on variants. A product can be "sold" infinite times. Critical bug for any live store.                                                                 |
| 3   | **Wishlist**                     | `features_json` already has `enableWishlist` flag but nothing implements it. localStorage-based wishlist with heart icon on product cards.                                                              |
| 4   | **Admin Analytics Dashboard**    | The admin dashboard page exists but needs real stats — revenue, orders over time, top products, low stock alerts.                                                                                       |

---

## 🧩 Tier 2 — Business Enablers

| #   | Feature                       | Why                                                                                                                              |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 5   | **Email Notifications**       | Order confirmation email to customer, new order alert to admin. No notifications exist currently.                                |
| 6   | **Shipping Calculation**      | Shipping is hardcoded to ₹0 everywhere (`const shipping = isFreeShipping ? 0 : 0`). Need configurable shipping rates per tenant. |
| 7   | **Product Reviews / Ratings** | Social proof — critical for conversion in Indian e-commerce.                                                                     |
| 8   | **Inventory Alerts**          | Admin notification when stock drops below threshold.                                                                             |

---

## ✨ Tier 3 — Growth & Polish

| #   | Feature                                       | Why                                                                     |
| --- | --------------------------------------------- | ----------------------------------------------------------------------- |
| 9   | **SEO (meta tags, sitemap, structured data)** | `seo_json` exists in `StoreConfig` but isn't wired to `<head>`.         |
| 10  | **WhatsApp Order Notifications**              | Indian market standard — `contact_json` already has a `whatsapp` field. |
| 11  | **Related Products**                          | Same-category product suggestions on product detail page.               |
| 12  | **Bulk Product Import (CSV)**                 | Admin time-saver for stores with large catalogs.                        |

---

## 💡 Recommendation

Start with:

### 1. Stock Decrement (#2)

- Data integrity fix
- Must-have before going live
- Small scope (touches `api/orders/route.ts` + payment webhook)

### 2. Order Tracking (#1)

- Highest customer-facing impact
- Completes purchase → delivery loop
- Self-contained, no external services required

---

## 👉 Next Step

Which feature(s) do you want to build?

I can:

- Break it into **DB schema + API + UI**
- Give **production-ready code**
- Or design it like **Shopify-level architecture**
