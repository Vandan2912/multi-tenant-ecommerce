import Link from "next/link";
import type { BannerConfig } from "@/lib/page-builder/sections";

export function BannerSection({ config }: { config: BannerConfig }) {
  return (
    <section
      className="px-6 py-3 text-center text-sm font-medium"
      style={{
        backgroundColor: config.backgroundColor ?? "#111827",
        color: config.textColor ?? "#FFFFFF",
      }}
    >
      <span>{config.text}</span>
      {config.buttonText && config.buttonLink && (
        <Link
          href={config.buttonLink}
          className="ml-3 underline font-semibold"
        >
          {config.buttonText}
        </Link>
      )}
    </section>
  );
}
