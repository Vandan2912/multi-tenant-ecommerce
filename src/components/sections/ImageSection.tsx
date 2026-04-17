import Link from "next/link";
import type { ImageConfig } from "@/lib/page-builder/sections";

const MAX_WIDTH_CLASS = {
  narrow: "max-w-2xl",
  medium: "max-w-4xl",
  wide: "max-w-6xl",
  full: "max-w-none",
};

export function ImageSection({ config }: { config: ImageConfig }) {
  if (!config.src) return null;

  const img = (
    <img
      src={config.src}
      alt={config.alt ?? ""}
      className="w-full h-auto rounded-xl"
    />
  );

  return (
    <section className="px-6 py-8">
      <div className={`mx-auto ${MAX_WIDTH_CLASS[config.maxWidth ?? "wide"]}`}>
        {config.link ? <Link href={config.link}>{img}</Link> : img}
      </div>
    </section>
  );
}
