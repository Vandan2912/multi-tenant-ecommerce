# Storefront Customization Plan

Here's the state of the art and a plan to make the storefront fully customizable per tenant.

## What's already in place

StoreConfig row per tenant stores:

- primary_color
- font_family
- hero_layout
- product_card_style
- logo_url
- store_tagline
- features_json
- contact_json
- seo_json
- shipping_json
- razorpay_key_id

But only a subset is actually wired to the storefront:

- primary_color
- font_family
- logo_url
- tagline
- SEO
- shipping
- features

The `hero_layout` and `product_card_style` enums are saved but never consumed.

Everything else in the storefront (hero content, sections, navbar items, footer, typography scale, button style, page copy) is hardcoded.

## The gap

The goal is **"every store can set everything."**

Today a tenant can only skin the store:

- colors
- logo
- font
- tagline

They **cannot change**:

- structure (sections, layout)
- content (hero copy, CTAs, footer links, custom pages)
- component style (cards, buttons, radii)

---

## Phased plan

### Phase 1 — Finish what's half-built (1–2 days)

Make the existing fields actually render.

- `hero_layout`: implement split and fullscreen variants in `src/app/(store)/page.tsx`
- `product_card_style`: implement minimal / detailed / grid-dense variants in product card component
- Apply `primary_color` consistently (buttons, links, accents via CSS variables already in layout)

---

### Phase 2 — Theme tokens (2–3 days)

Expand StoreConfig into a full token set:

- **Colors**: primary, secondary, accent, text, background, muted
- **Typography**: heading_font, body_font, base font_scale (compact/normal/large)
- **Shape**: border_radius (sharp/rounded/pill), button_style (solid/outline/ghost)
- **Layout density**: container_width, section_spacing

Store as a single `theme_json` blob.

Expose all tokens as CSS variables in `(store)/layout.tsx`.

Build a **Theme admin tab** with live preview:

- iframe pointing to `/?preview=<token-override>`

---

### Phase 3 — Content blocks / page builder (4–6 days)

Move homepage from hardcoded JSX → block list stored in:

`storeConfig.homepage_json`

```js
blocks: [
  { type: "hero", variant, headline, subheadline, cta_text, cta_href, image_url },
  { type: "featured_products", title, product_ids, limit },
  { type: "categories_grid", category_ids },
  { type: "image_banner", image_url, link },
  { type: "text", markdown },
  { type: "testimonials", items: [...] },
  { type: "newsletter" },
]
```
