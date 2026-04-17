import type {
  PageSections,
  Section,
  BannerConfig,
  CategoryGridConfig,
  CtaConfig,
  FeaturedProductsConfig,
  HeroConfig,
  ImageConfig,
  NewsletterConfig,
  RichTextConfig,
  SpacerConfig,
} from "@/lib/page-builder/sections";
import { HeroSection } from "./HeroSection";
import { BannerSection } from "./BannerSection";
import { FeaturedProductsSection } from "./FeaturedProductsSection";
import { CategoryGridSection } from "./CategoryGridSection";
import { RichTextSection } from "./RichTextSection";
import { ImageSection } from "./ImageSection";
import { NewsletterSection } from "./NewsletterSection";
import { CtaSection } from "./CtaSection";
import { SpacerSection } from "./SpacerSection";

function renderSection(
  section: Section,
  tenantId: string,
  primaryColor: string,
) {
  switch (section.type) {
    case "hero":
      return <HeroSection config={section.config as HeroConfig} />;
    case "banner":
      return <BannerSection config={section.config as BannerConfig} />;
    case "featured_products":
      return (
        <FeaturedProductsSection
          tenantId={tenantId}
          primaryColor={primaryColor}
          config={section.config as FeaturedProductsConfig}
        />
      );
    case "category_grid":
      return (
        <CategoryGridSection
          tenantId={tenantId}
          config={section.config as CategoryGridConfig}
        />
      );
    case "rich_text":
      return <RichTextSection config={section.config as RichTextConfig} />;
    case "image":
      return <ImageSection config={section.config as ImageConfig} />;
    case "newsletter":
      return <NewsletterSection config={section.config as NewsletterConfig} />;
    case "cta":
      return <CtaSection config={section.config as CtaConfig} />;
    case "spacer":
      return <SpacerSection config={section.config as SpacerConfig} />;
    default:
      return null;
  }
}

export function PageRenderer({
  sections,
  tenantId,
  primaryColor,
}: {
  sections: PageSections;
  tenantId: string;
  primaryColor: string;
}) {
  return (
    <>
      {sections.map((section) => (
        <div key={section.id}>
          {renderSection(section, tenantId, primaryColor)}
        </div>
      ))}
    </>
  );
}
