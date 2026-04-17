This is the biggest feature yet — let me plan it thoroughly before any code. A page builder done wrong is a nightmare. Done right, it's the core differentiator of your platform.

---

## The Vision

Every store owner can customize their **entire storefront** from the admin — no code, no developer needed. They drag sections around, pick styles, and hit publish. The page is stored as a JSON document in the database and rendered on the storefront dynamically.

---

## Architecture Decision

**Two approaches exist:**

| Approach                       | How it works                                                                                                                         | Tradeoff                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| **Block-based** (like Shopify) | Page = ordered list of pre-built section blocks. Each block has a type + config. Admin picks blocks, configures them, reorders them. | Simple to build, easy for non-technical users, less flexible |
| **Free-form** (like Webflow)   | Full drag-drop canvas with absolute positioning, custom CSS, nested grids                                                            | Complex to build, intimidating for small business owners     |

**I recommend Block-based.** Your users are small business owners — they want to pick a hero style, change the color, upload an image, and be done. They don't want a design tool.

---

## What Gets a Builder

| Page               | Customizable Sections                                                                  |
| ------------------ | -------------------------------------------------------------------------------------- |
| **Homepage**       | Hero, Featured Products, Categories Grid, Testimonials, Banner, CTA, Custom Text/Image |
| **Product List**   | Header style, Product Card style, Sidebar layout, Filter position                      |
| **Product Detail** | Image layout, Info layout, Related products, Breadcrumb style                          |
| **Header**         | Logo position, Nav style, Search bar, Cart icon, Announcement bar                      |
| **Footer**         | Columns, Links, Social icons, Newsletter, Copyright                                    |
| **Custom Pages**   | About, Contact, FAQ, Policies — full block builder                                     |

---

## Data Model

```txt
PageConfig (per tenant, per page type)
  id, tenant_id, page_type, title, slug, sections_json, is_published

sections_json = [
  {
    id: "hero-1",
    type: "hero",
    position: 0,
    config: {
      layout: "centered",
      title: "Welcome to our store",
      subtitle: "Best products at best prices",
      buttonText: "Shop Now",
      buttonLink: "/products",
      backgroundImage: "https://...",
      overlayOpacity: 40,
      height: "large"
    }
  }
]
```

---

## Section Types — Full Registry

```txt
LAYOUT SECTIONS
hero
banner
spacer
divider
columns

PRODUCT SECTIONS
featured_products
product_carousel
category_grid
brand_showcase
new_arrivals
on_sale

CONTENT SECTIONS
rich_text
image
image_gallery
video
testimonials
faq
newsletter
contact_info
custom_html
```

---

## Build Phases

### Phase A — Foundation

1. Database: PageConfig model + migration
2. Section type registry + config schemas
3. Section renderer components
4. Store layout reads PageConfig
5. Admin basic page editor

### Phase B — Builder UX

6. Drag-and-drop reordering
7. Live preview panel
8. Section config forms
9. Image picker integration
10. Product/category picker modals

### Phase C — Global Customization

11. Header builder
12. Footer builder
13. Product card style editor
14. Product detail layout editor
15. Breadcrumb style editor

### Phase D — Advanced

16. Page versioning
17. Undo/redo
18. Custom pages
19. Mobile preview toggle
20. Section templates

---

## Confirm Before We Start

This is a 4-phase build. Phase A alone is substantial.

**Should I start with Phase A now?**
