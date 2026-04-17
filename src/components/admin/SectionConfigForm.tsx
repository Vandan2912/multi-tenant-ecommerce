"use client";

import type {
  BannerConfig,
  CategoryGridConfig,
  CtaConfig,
  FeaturedProductsConfig,
  HeroConfig,
  ImageConfig,
  NewsletterConfig,
  RichTextConfig,
  Section,
  SpacerConfig,
} from "@/lib/page-builder/sections";
import { SingleImagePicker } from "./SingleImagePicker";
import { ProductPickerModal } from "./ProductPickerModal";
import { CategoryPickerModal } from "./CategoryPickerModal";

type RefOpt = { id: string; name: string; slug?: string };

export function SectionConfigForm({
  section,
  categories,
  products,
  onChange,
}: {
  section: Section;
  categories: RefOpt[];
  products: RefOpt[];
  onChange: (config: Section["config"]) => void;
}) {
  switch (section.type) {
    case "hero":
      return (
        <HeroForm
          config={section.config as HeroConfig}
          onChange={onChange as (c: HeroConfig) => void}
        />
      );
    case "banner":
      return (
        <BannerForm
          config={section.config as BannerConfig}
          onChange={onChange as (c: BannerConfig) => void}
        />
      );
    case "featured_products":
      return (
        <FeaturedProductsForm
          config={section.config as FeaturedProductsConfig}
          categories={categories}
          products={products}
          onChange={onChange as (c: FeaturedProductsConfig) => void}
        />
      );
    case "category_grid":
      return (
        <CategoryGridForm
          config={section.config as CategoryGridConfig}
          categories={categories}
          onChange={onChange as (c: CategoryGridConfig) => void}
        />
      );
    case "rich_text":
      return (
        <RichTextForm
          config={section.config as RichTextConfig}
          onChange={onChange as (c: RichTextConfig) => void}
        />
      );
    case "image":
      return (
        <ImageForm
          config={section.config as ImageConfig}
          onChange={onChange as (c: ImageConfig) => void}
        />
      );
    case "newsletter":
      return (
        <NewsletterForm
          config={section.config as NewsletterConfig}
          onChange={onChange as (c: NewsletterConfig) => void}
        />
      );
    case "cta":
      return (
        <CtaForm
          config={section.config as CtaConfig}
          onChange={onChange as (c: CtaConfig) => void}
        />
      );
    case "spacer":
      return (
        <SpacerForm
          config={section.config as SpacerConfig}
          onChange={onChange as (c: SpacerConfig) => void}
        />
      );
  }
}

// ── Shared small bits ────────────────────────────────────────
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const input =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

// ── Hero ─────────────────────────────────────────────────────
function HeroForm({
  config,
  onChange,
}: {
  config: HeroConfig;
  onChange: (c: HeroConfig) => void;
}) {
  const set = <K extends keyof HeroConfig>(k: K, v: HeroConfig[K]) =>
    onChange({ ...config, [k]: v });
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Layout">
          <select
            className={input}
            value={config.layout}
            onChange={(e) => set("layout", e.target.value as HeroConfig["layout"])}
          >
            <option value="centered">Centered</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="split">Split</option>
          </select>
        </Field>
        <Field label="Height">
          <select
            className={input}
            value={config.height ?? "medium"}
            onChange={(e) => set("height", e.target.value as HeroConfig["height"])}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </Field>
      </div>
      <Field label="Title">
        <input
          className={input}
          value={config.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label="Subtitle">
        <input
          className={input}
          value={config.subtitle ?? ""}
          onChange={(e) => set("subtitle", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button Text">
          <input
            className={input}
            value={config.buttonText ?? ""}
            onChange={(e) => set("buttonText", e.target.value)}
          />
        </Field>
        <Field label="Button Link">
          <input
            className={input}
            value={config.buttonLink ?? ""}
            onChange={(e) => set("buttonLink", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Background Image" hint="Leave empty for solid color">
        <SingleImagePicker
          value={config.backgroundImage ?? ""}
          onChange={(url) => set("backgroundImage", url)}
        />
      </Field>
      {config.backgroundImage && (
        <Field label={`Overlay Opacity: ${config.overlayOpacity ?? 0}%`}>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={config.overlayOpacity ?? 0}
            onChange={(e) => set("overlayOpacity", Number(e.target.value))}
            className="w-full"
          />
        </Field>
      )}
    </div>
  );
}

// ── Banner ───────────────────────────────────────────────────
function BannerForm({
  config,
  onChange,
}: {
  config: BannerConfig;
  onChange: (c: BannerConfig) => void;
}) {
  const set = <K extends keyof BannerConfig>(k: K, v: BannerConfig[K]) =>
    onChange({ ...config, [k]: v });
  return (
    <div>
      <Field label="Text">
        <input
          className={input}
          value={config.text}
          onChange={(e) => set("text", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button Text">
          <input
            className={input}
            value={config.buttonText ?? ""}
            onChange={(e) => set("buttonText", e.target.value)}
          />
        </Field>
        <Field label="Button Link">
          <input
            className={input}
            value={config.buttonLink ?? ""}
            onChange={(e) => set("buttonLink", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Background">
          <input
            type="color"
            value={config.backgroundColor ?? "#111827"}
            onChange={(e) => set("backgroundColor", e.target.value)}
            className="w-full h-9 border border-gray-300 rounded-lg"
          />
        </Field>
        <Field label="Text Color">
          <input
            type="color"
            value={config.textColor ?? "#FFFFFF"}
            onChange={(e) => set("textColor", e.target.value)}
            className="w-full h-9 border border-gray-300 rounded-lg"
          />
        </Field>
      </div>
    </div>
  );
}

// ── Featured Products ────────────────────────────────────────
function FeaturedProductsForm({
  config,
  categories,
  products,
  onChange,
}: {
  config: FeaturedProductsConfig;
  categories: RefOpt[];
  products: RefOpt[];
  onChange: (c: FeaturedProductsConfig) => void;
}) {
  const set = <K extends keyof FeaturedProductsConfig>(
    k: K,
    v: FeaturedProductsConfig[K],
  ) => onChange({ ...config, [k]: v });

  return (
    <div>
      <Field label="Title">
        <input
          className={input}
          value={config.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Source">
          <select
            className={input}
            value={config.mode}
            onChange={(e) =>
              set("mode", e.target.value as FeaturedProductsConfig["mode"])
            }
          >
            <option value="latest">Latest products</option>
            <option value="category">By category</option>
            <option value="manual">Hand-picked</option>
          </select>
        </Field>
        <Field label="Limit">
          <input
            type="number"
            min={1}
            max={24}
            className={input}
            value={config.limit}
            onChange={(e) => set("limit", Number(e.target.value))}
          />
        </Field>
      </div>

      {config.mode === "category" && (
        <Field label="Category">
          <select
            className={input}
            value={config.categorySlug ?? ""}
            onChange={(e) => set("categorySlug", e.target.value)}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      {config.mode === "manual" && (
        <Field label="Products">
          <ProductPickerModal
            products={products}
            value={config.productIds ?? []}
            onChange={(ids) => set("productIds", ids)}
          />
        </Field>
      )}

      <Field label="Card Style">
        <select
          className={input}
          value={config.cardStyle ?? "minimal"}
          onChange={(e) =>
            set("cardStyle", e.target.value as FeaturedProductsConfig["cardStyle"])
          }
        >
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
          <option value="grid-dense">Grid-dense</option>
        </select>
      </Field>
    </div>
  );
}

// ── Category Grid ────────────────────────────────────────────
function CategoryGridForm({
  config,
  categories,
  onChange,
}: {
  config: CategoryGridConfig;
  categories: RefOpt[];
  onChange: (c: CategoryGridConfig) => void;
}) {
  const set = <K extends keyof CategoryGridConfig>(
    k: K,
    v: CategoryGridConfig[K],
  ) => onChange({ ...config, [k]: v });

  return (
    <div>
      <Field label="Title">
        <input
          className={input}
          value={config.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Source">
          <select
            className={input}
            value={config.mode}
            onChange={(e) =>
              set("mode", e.target.value as CategoryGridConfig["mode"])
            }
          >
            <option value="all">All top-level categories</option>
            <option value="manual">Hand-picked</option>
          </select>
        </Field>
        <Field label="Columns">
          <select
            className={input}
            value={config.columns}
            onChange={(e) =>
              set("columns", Number(e.target.value) as CategoryGridConfig["columns"])
            }
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={6}>6</option>
          </select>
        </Field>
      </div>
      {config.mode === "manual" && (
        <Field label="Categories">
          <CategoryPickerModal
            categories={categories}
            value={config.categoryIds ?? []}
            onChange={(ids) => set("categoryIds", ids)}
          />
        </Field>
      )}
    </div>
  );
}

// ── Rich Text ────────────────────────────────────────────────
function RichTextForm({
  config,
  onChange,
}: {
  config: RichTextConfig;
  onChange: (c: RichTextConfig) => void;
}) {
  const set = <K extends keyof RichTextConfig>(k: K, v: RichTextConfig[K]) =>
    onChange({ ...config, [k]: v });
  return (
    <div>
      <Field label="Content" hint="Separate paragraphs with a blank line">
        <textarea
          className={input}
          rows={6}
          value={config.content}
          onChange={(e) => set("content", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Align">
          <select
            className={input}
            value={config.align}
            onChange={(e) => set("align", e.target.value as RichTextConfig["align"])}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </Field>
        <Field label="Max Width">
          <select
            className={input}
            value={config.maxWidth ?? "medium"}
            onChange={(e) =>
              set("maxWidth", e.target.value as RichTextConfig["maxWidth"])
            }
          >
            <option value="narrow">Narrow</option>
            <option value="medium">Medium</option>
            <option value="wide">Wide</option>
            <option value="full">Full</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

// ── Image ────────────────────────────────────────────────────
function ImageForm({
  config,
  onChange,
}: {
  config: ImageConfig;
  onChange: (c: ImageConfig) => void;
}) {
  const set = <K extends keyof ImageConfig>(k: K, v: ImageConfig[K]) =>
    onChange({ ...config, [k]: v });
  return (
    <div>
      <Field label="Image">
        <SingleImagePicker
          value={config.src}
          onChange={(url) => set("src", url)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Alt text">
          <input
            className={input}
            value={config.alt ?? ""}
            onChange={(e) => set("alt", e.target.value)}
          />
        </Field>
        <Field label="Max Width">
          <select
            className={input}
            value={config.maxWidth ?? "wide"}
            onChange={(e) =>
              set("maxWidth", e.target.value as ImageConfig["maxWidth"])
            }
          >
            <option value="narrow">Narrow</option>
            <option value="medium">Medium</option>
            <option value="wide">Wide</option>
            <option value="full">Full</option>
          </select>
        </Field>
      </div>
      <Field label="Link URL (optional)">
        <input
          className={input}
          value={config.link ?? ""}
          onChange={(e) => set("link", e.target.value)}
        />
      </Field>
    </div>
  );
}

// ── Newsletter ───────────────────────────────────────────────
function NewsletterForm({
  config,
  onChange,
}: {
  config: NewsletterConfig;
  onChange: (c: NewsletterConfig) => void;
}) {
  const set = <K extends keyof NewsletterConfig>(
    k: K,
    v: NewsletterConfig[K],
  ) => onChange({ ...config, [k]: v });
  return (
    <div>
      <Field label="Title">
        <input
          className={input}
          value={config.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label="Subtitle">
        <input
          className={input}
          value={config.subtitle ?? ""}
          onChange={(e) => set("subtitle", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button Text">
          <input
            className={input}
            value={config.buttonText ?? ""}
            onChange={(e) => set("buttonText", e.target.value)}
          />
        </Field>
        <Field label="Placeholder">
          <input
            className={input}
            value={config.placeholder ?? ""}
            onChange={(e) => set("placeholder", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

// ── CTA ──────────────────────────────────────────────────────
function CtaForm({
  config,
  onChange,
}: {
  config: CtaConfig;
  onChange: (c: CtaConfig) => void;
}) {
  const set = <K extends keyof CtaConfig>(k: K, v: CtaConfig[K]) =>
    onChange({ ...config, [k]: v });
  return (
    <div>
      <Field label="Title">
        <input
          className={input}
          value={config.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label="Subtitle">
        <input
          className={input}
          value={config.subtitle ?? ""}
          onChange={(e) => set("subtitle", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button Text">
          <input
            className={input}
            value={config.buttonText}
            onChange={(e) => set("buttonText", e.target.value)}
          />
        </Field>
        <Field label="Button Link">
          <input
            className={input}
            value={config.buttonLink}
            onChange={(e) => set("buttonLink", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Align">
          <select
            className={input}
            value={config.align}
            onChange={(e) => set("align", e.target.value as CtaConfig["align"])}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </Field>
        <Field label="Background">
          <input
            type="color"
            value={config.backgroundColor ?? "#2563EB"}
            onChange={(e) => set("backgroundColor", e.target.value)}
            className="w-full h-9 border border-gray-300 rounded-lg"
          />
        </Field>
        <Field label="Text Color">
          <input
            type="color"
            value={config.textColor ?? "#FFFFFF"}
            onChange={(e) => set("textColor", e.target.value)}
            className="w-full h-9 border border-gray-300 rounded-lg"
          />
        </Field>
      </div>
    </div>
  );
}

// ── Spacer ───────────────────────────────────────────────────
function SpacerForm({
  config,
  onChange,
}: {
  config: SpacerConfig;
  onChange: (c: SpacerConfig) => void;
}) {
  return (
    <Field label="Height">
      <select
        className={input}
        value={config.height}
        onChange={(e) =>
          onChange({ height: e.target.value as SpacerConfig["height"] })
        }
      >
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </Field>
  );
}
