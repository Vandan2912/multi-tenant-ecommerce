// Section type registry + TypeScript config schemas.
// Every section stored in PageConfig.sections_json must conform to one of
// these types. The admin editor renders a form per section type; the
// renderer maps section.type to a React component.

export type SectionType =
  | "hero"
  | "banner"
  | "featured_products"
  | "category_grid"
  | "rich_text"
  | "image"
  | "newsletter"
  | "cta"
  | "spacer";

export type HeroConfig = {
  layout: "centered" | "left" | "right" | "split";
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  overlayOpacity?: number; // 0–100
  height?: "small" | "medium" | "large";
  textColor?: string;
};

export type BannerConfig = {
  text: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
};

export type FeaturedProductsConfig = {
  title?: string;
  mode: "latest" | "category" | "manual";
  categorySlug?: string;
  productIds?: string[];
  limit: number;
  cardStyle?: "minimal" | "detailed" | "grid-dense";
};

export type CategoryGridConfig = {
  title?: string;
  mode: "all" | "manual";
  categoryIds?: string[];
  columns: 2 | 3 | 4 | 6;
};

export type RichTextConfig = {
  content: string; // HTML or plain text
  align: "left" | "center" | "right";
  maxWidth?: "narrow" | "medium" | "wide" | "full";
};

export type ImageConfig = {
  src: string;
  alt?: string;
  link?: string;
  maxWidth?: "narrow" | "medium" | "wide" | "full";
};

export type NewsletterConfig = {
  title: string;
  subtitle?: string;
  buttonText?: string;
  placeholder?: string;
  backgroundColor?: string;
};

export type CtaConfig = {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor?: string;
  textColor?: string;
  align: "left" | "center" | "right";
};

export type SpacerConfig = {
  height: "small" | "medium" | "large";
};

export type SectionConfigMap = {
  hero: HeroConfig;
  banner: BannerConfig;
  featured_products: FeaturedProductsConfig;
  category_grid: CategoryGridConfig;
  rich_text: RichTextConfig;
  image: ImageConfig;
  newsletter: NewsletterConfig;
  cta: CtaConfig;
  spacer: SpacerConfig;
};

export type Section<T extends SectionType = SectionType> = {
  id: string;
  type: T;
  position: number;
  config: SectionConfigMap[T];
};

export type PageSections = Section[];

// Default configs — used when a user adds a new section of this type.
export const DEFAULT_CONFIGS: { [K in SectionType]: SectionConfigMap[K] } = {
  hero: {
    layout: "centered",
    title: "Welcome to our store",
    subtitle: "Best products at best prices",
    buttonText: "Shop Now",
    buttonLink: "/products",
    height: "medium",
    overlayOpacity: 40,
  },
  banner: {
    text: "Free shipping on orders over ₹999",
    backgroundColor: "#111827",
    textColor: "#FFFFFF",
  },
  featured_products: {
    title: "Featured Products",
    mode: "latest",
    limit: 8,
    cardStyle: "minimal",
  },
  category_grid: {
    title: "Shop by Category",
    mode: "all",
    columns: 4,
  },
  rich_text: {
    content: "Tell your store's story here.",
    align: "center",
    maxWidth: "medium",
  },
  image: {
    src: "",
    alt: "",
    maxWidth: "wide",
  },
  newsletter: {
    title: "Subscribe to our newsletter",
    subtitle: "Get updates on new products and offers",
    buttonText: "Subscribe",
    placeholder: "Your email address",
  },
  cta: {
    title: "Ready to shop?",
    buttonText: "Browse Products",
    buttonLink: "/products",
    align: "center",
  },
  spacer: {
    height: "medium",
  },
};

// Human-readable metadata for each section type — used in the admin UI.
export const SECTION_META: Record<
  SectionType,
  { label: string; description: string; icon: string }
> = {
  hero: {
    label: "Hero",
    description: "Large banner with heading, subtitle and CTA",
    icon: "🎯",
  },
  banner: {
    label: "Banner",
    description: "Thin full-width announcement strip",
    icon: "📣",
  },
  featured_products: {
    label: "Featured Products",
    description: "Grid of products — latest, by category, or hand-picked",
    icon: "🛍️",
  },
  category_grid: {
    label: "Category Grid",
    description: "Grid of category tiles",
    icon: "🗂️",
  },
  rich_text: {
    label: "Rich Text",
    description: "Block of text content",
    icon: "📝",
  },
  image: {
    label: "Image",
    description: "Single full-width image with optional link",
    icon: "🖼️",
  },
  newsletter: {
    label: "Newsletter",
    description: "Email signup form",
    icon: "📧",
  },
  cta: {
    label: "Call to Action",
    description: "Centered message with a button",
    icon: "👆",
  },
  spacer: {
    label: "Spacer",
    description: "Vertical whitespace between sections",
    icon: "↕️",
  },
};

export const SECTION_TYPES: SectionType[] = Object.keys(
  SECTION_META,
) as SectionType[];

export function createSection<T extends SectionType>(
  type: T,
  position: number,
): Section<T> {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    position,
    config: { ...DEFAULT_CONFIGS[type] } as SectionConfigMap[T],
  };
}

// Runtime validation — protects against bad JSON coming from the DB or API.
export function isSection(x: unknown): x is Section {
  if (!x || typeof x !== "object") return false;
  const s = x as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.type === "string" &&
    SECTION_TYPES.includes(s.type as SectionType) &&
    typeof s.position === "number" &&
    typeof s.config === "object" &&
    s.config !== null
  );
}

export function parseSections(json: unknown): PageSections {
  if (!Array.isArray(json)) return [];
  const valid = json.filter(isSection);
  return [...valid].sort((a, b) => a.position - b.position);
}
