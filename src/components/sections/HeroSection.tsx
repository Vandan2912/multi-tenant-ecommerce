import Link from "next/link";
import type { HeroConfig } from "@/lib/page-builder/sections";

const HEIGHT_CLASS = {
  small: "py-16",
  medium: "py-24",
  large: "py-36",
};

const LAYOUT_ALIGN = {
  centered: "items-center text-center",
  left: "items-start text-left",
  right: "items-end text-right",
  split: "items-start text-left",
};

export function HeroSection({ config }: { config: HeroConfig }) {
  const height = HEIGHT_CLASS[config.height ?? "medium"];
  const align = LAYOUT_ALIGN[config.layout];
  const overlayOpacity = (config.overlayOpacity ?? 0) / 100;
  const textColor = config.textColor ?? "inherit";

  return (
    <section
      className={`relative flex flex-col justify-center px-6 gap-6 ${height} ${align}`}
      style={{
        backgroundColor: config.backgroundImage
          ? undefined
          : "color-mix(in srgb, var(--color-primary) 8%, white)",
        backgroundImage: config.backgroundImage
          ? `url(${config.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {config.backgroundImage && overlayOpacity > 0 && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        />
      )}

      <div className={`relative z-10 flex flex-col gap-4 max-w-3xl ${align} ${
        config.layout === "centered" ? "mx-auto" : ""
      } ${config.layout === "right" ? "ml-auto" : ""}`}
      >
        <h1
          className="text-4xl font-bold tracking-tight sm:text-5xl"
          style={{
            color: config.backgroundImage
              ? textColor !== "inherit"
                ? textColor
                : "white"
              : "var(--color-primary)",
          }}
        >
          {config.title}
        </h1>

        {config.subtitle && (
          <p
            className="text-lg max-w-xl"
            style={{
              color: config.backgroundImage
                ? textColor !== "inherit"
                  ? textColor
                  : "rgba(255,255,255,0.9)"
                : "#4B5563",
            }}
          >
            {config.subtitle}
          </p>
        )}

        {config.buttonText && (
          <Link
            href={config.buttonLink ?? "/products"}
            className="mt-2 inline-block w-fit px-8 py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {config.buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}
